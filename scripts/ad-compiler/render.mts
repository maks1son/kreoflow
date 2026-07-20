import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import {createHash} from "node:crypto";
import {tmpdir} from "node:os";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import {fileURLToPath} from "node:url";

import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";

// Node 24 executes TypeScript directly; the explicit extension is required at runtime.
import {buildMediaManifestHash} from "../../src/lib/ad-compiler/qa.ts";
import {
  assertSafeRenderTargets,
  buildRenderReceipt,
} from "../../src/lib/ad-compiler/render-receipt.ts";
import {
  compileCreativeSpec,
  hashCanonical,
} from "../../src/lib/ad-compiler/schema.ts";
import {
  buildProductAdProps,
  requireAudioSource,
  type ProductAdProps,
} from "../../video/render-contract.ts";

interface CliOptions {
  evidence: string;
  spec: string;
  out: string;
  receipt: string;
  audio: string;
}

interface StagedMedia {
  publicDir: string;
  assets: Record<string, string>;
  audio: string;
  mediaManifestHash: string;
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
process.chdir(projectRoot);
const PRODUCT_AD_COMPOSITION_ID = "KreoFlowProductAd";
const allowedFlags = new Set(["evidence", "spec", "out", "receipt", "audio"]);
const usage =
  "Usage: node scripts/ad-compiler/render.mts --evidence <json> --spec <json> --out <mp4> --receipt <json> --audio <licensed-media>";

const parseCli = (argv: string[]): CliOptions => {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    const name = flag?.startsWith("--") ? flag.slice(2) : "";
    if (
      !name ||
      !allowedFlags.has(name) ||
      values.has(name) ||
      !value ||
      value.startsWith("--")
    ) {
      throw new Error(usage);
    }
    values.set(name, value);
    index += 1;
  }

  const evidence = values.get("evidence");
  const spec = values.get("spec");
  const out = values.get("out");
  const receipt = values.get("receipt");
  const audio = values.get("audio");
  if (!evidence || !spec || !out || !receipt || !audio) {
    throw new Error(usage);
  }

  return {evidence, spec, out, receipt, audio};
};

const projectPath = (path: string) =>
  isAbsolute(path) ? path : resolve(projectRoot, path);

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(projectPath(path), "utf8"));

const assertFile = async (path: string, label: string) => {
  try {
    const details = await stat(path);
    if (!details.isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`${label} does not exist or is not a file: ${path}`);
  }
};

const sha256File = async (path: string) =>
  createHash("sha256").update(await readFile(path)).digest("hex");

const safeFilename = (index: number, sourcePath: string) => {
  const original = basename(sourcePath);
  const extension = extname(original);
  const stem = basename(original, extension)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "") || "media";
  return `${String(index).padStart(2, "0")}-${stem}${extension.toLowerCase()}`;
};

const stageMedia = async ({
  evidence,
  audioPath,
}: {
  evidence: ProductAdProps["evidence"];
  audioPath: string;
}): Promise<StagedMedia> => {
  const publicDir = await mkdtemp(join(tmpdir(), "kreoflow-render-"));
  const assetDir = join(publicDir, "assets");
  const audioDir = join(publicDir, "audio");

  try {
    await Promise.all([
      mkdir(assetDir, {recursive: true}),
      mkdir(audioDir, {recursive: true}),
    ]);

    const assets: Record<string, string> = {};
    const manifestAssets: Array<{id: string; path: string; sha256: string}> = [];
    for (const [index, asset] of evidence.assets.entries()) {
      const source = projectPath(asset.path);
      await assertFile(source, `Evidence asset "${asset.id}"`);
      const filename = safeFilename(index, source);
      const stagedPath = join(assetDir, filename);
      await copyFile(source, stagedPath);
      assets[asset.id] = `assets/${filename}`;
      manifestAssets.push({
        id: asset.id,
        path: source,
        sha256: await sha256File(stagedPath),
      });
    }

    const resolvedAudio = projectPath(audioPath);
    await assertFile(resolvedAudio, "Audio source");
    const audioFilename = safeFilename(0, resolvedAudio);
    const stagedAudioPath = join(audioDir, audioFilename);
    await copyFile(resolvedAudio, stagedAudioPath);
    const mediaManifestHash = buildMediaManifestHash({
      assets: manifestAssets,
      audio: {
        path: resolvedAudio,
        sha256: await sha256File(stagedAudioPath),
      },
    });

    return {
      publicDir,
      assets,
      audio: `audio/${audioFilename}`,
      mediaManifestHash,
    };
  } catch (error) {
    await rm(publicDir, {recursive: true, force: true});
    throw error;
  }
};

const main = async () => {
  const options = parseCli(process.argv.slice(2));
  const audioPath = requireAudioSource(options.audio);
  const [evidenceInput, specInput] = await Promise.all([
    readJson(options.evidence),
    readJson(options.spec),
  ]);
  const compiled = compileCreativeSpec({
    evidence: evidenceInput,
    spec: specInput,
  });
  const outputLocation = projectPath(options.out);
  const receiptLocation = projectPath(options.receipt);
  assertSafeRenderTargets({
    outputPath: outputLocation,
    receiptPath: receiptLocation,
    protectedInputs: [
      {label: "evidence", path: projectPath(options.evidence)},
      {label: "spec", path: projectPath(options.spec)},
      {label: "audio", path: projectPath(audioPath)},
      ...compiled.evidence.assets.map((asset) => ({
        label: `asset "${asset.id}"`,
        path: projectPath(asset.path),
      })),
    ],
  });
  const staged = await stageMedia({
    evidence: compiled.evidence,
    audioPath,
  });

  try {
    const inputProps = buildProductAdProps({
      evidence: compiled.evidence,
      spec: compiled.spec,
      audio: staged.audio,
      resolveAssetPath: (asset) => {
        const source = staged.assets[asset.id];
        if (!source) throw new Error(`Asset "${asset.id}" was not staged`);
        return source;
      },
    });
    const evidenceHash = hashCanonical(compiled.evidence);
    const specHash = compiled.specHash;
    await Promise.all([
      mkdir(dirname(outputLocation), {recursive: true}),
      mkdir(dirname(receiptLocation), {recursive: true}),
    ]);
    await rm(receiptLocation, {force: true});
    process.stdout.write(`Validated CreativeSpec ${compiled.specHash.slice(0, 12)}\n`);
    process.stdout.write(
      `Staged ${compiled.evidence.assets.length} declared asset(s) and explicit audio\n`,
    );

    const serveUrl = await bundle({
      entryPoint: resolve(projectRoot, "video/index.ts"),
      publicDir: staged.publicDir,
      onProgress: (progress) => {
        const percent = Math.round(progress);
        if (percent === 100 || percent % 25 === 0) {
          process.stdout.write(`Bundle ${percent}%\n`);
        }
      },
    });

    const composition = await selectComposition({
      serveUrl,
      id: PRODUCT_AD_COMPOSITION_ID,
      inputProps,
    });

    let lastPercent = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      audioCodec: "aac",
      audioBitrate: "320k",
      pixelFormat: "yuv420p",
      imageFormat: "png",
      crf: 16,
      x264Preset: "medium",
      outputLocation,
      inputProps,
      onProgress: ({progress}) => {
        const percent = Math.floor(progress * 100);
        if (percent >= lastPercent + 10 || percent === 100) {
          lastPercent = percent;
          process.stdout.write(`Render ${percent}%\n`);
        }
      },
    });

    const renderHash = await sha256File(outputLocation);
    const outputPath =
      relative(projectRoot, outputLocation).replaceAll("\\", "/") || basename(outputLocation);
    const receipt = buildRenderReceipt({
      evidenceHash,
      specHash,
      mediaManifestHash: staged.mediaManifestHash,
      renderHash,
      outputPath,
    });
    await writeFile(receiptLocation, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

    process.stdout.write(`Rendered ${outputLocation}\n`);
    process.stdout.write(`Render receipt ${receiptLocation}\n`);
  } finally {
    await rm(staged.publicDir, {recursive: true, force: true});
  }
};

await main();
