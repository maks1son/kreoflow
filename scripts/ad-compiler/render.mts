import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import {tmpdir} from "node:os";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  resolve,
} from "node:path";
import {fileURLToPath} from "node:url";

import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";

// Node 24 executes TypeScript directly; the explicit extension is required at runtime.
import {compileCreativeSpec} from "../../src/lib/ad-compiler/schema.ts";
import {
  buildProductAdProps,
  requireAudioSource,
  type ProductAdProps,
} from "../../video/render-contract.ts";

interface CliOptions {
  evidence: string;
  spec: string;
  out: string;
  audio?: string;
}

interface StagedMedia {
  publicDir: string;
  assets: Record<string, string>;
  audio: string;
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PRODUCT_AD_COMPOSITION_ID = "KreoFlowProductAd";
const allowedFlags = new Set(["evidence", "spec", "out", "audio"]);
const usage =
  "Usage: node scripts/ad-compiler/render.mts --evidence <json> --spec <json> --out <mp4> [--audio <licensed-media>]";

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
  if (!evidence || !spec || !out) {
    throw new Error(usage);
  }

  return {evidence, spec, out, audio: values.get("audio")};
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
    for (const [index, asset] of evidence.assets.entries()) {
      const source = projectPath(asset.path);
      await assertFile(source, `Evidence asset "${asset.id}"`);
      const filename = safeFilename(index, source);
      await copyFile(source, join(assetDir, filename));
      assets[asset.id] = `assets/${filename}`;
    }

    const resolvedAudio = projectPath(audioPath);
    await assertFile(resolvedAudio, "Audio source");
    const audioFilename = safeFilename(0, resolvedAudio);
    await copyFile(resolvedAudio, join(audioDir, audioFilename));

    return {publicDir, assets, audio: `audio/${audioFilename}`};
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
  const staged = await stageMedia({
    evidence: compiled.evidence,
    audioPath,
  });
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
  const outputLocation = projectPath(options.out);

  try {
    await mkdir(dirname(outputLocation), {recursive: true});
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

    process.stdout.write(`Rendered ${outputLocation}\n`);
  } finally {
    await rm(staged.publicDir, {recursive: true, force: true});
  }
};

await main();
