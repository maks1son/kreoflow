import {mkdir, readFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";

// Node 24 executes TypeScript directly; the explicit extension is required at runtime.
import {compileCreativeSpec, type CreativeSpec} from "../../src/lib/ad-compiler/schema.ts";
import type {ProductAdProps} from "../../video/ProductAd.tsx";

interface CliOptions {
  evidence: string;
  spec: string;
  out: string;
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PRODUCT_AD_COMPOSITION_ID = "KreoFlowProductAd";

const usage =
  "Usage: node scripts/ad-compiler/render.mts --evidence <json> --spec <json> --out <mp4>";

const parseCli = (argv: string[]): CliOptions => {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!flag?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(usage);
    }
    values.set(flag.slice(2), value);
    index += 1;
  }

  const evidence = values.get("evidence");
  const spec = values.get("spec");
  const out = values.get("out");
  if (!evidence || !spec || !out || values.size !== 3) {
    throw new Error(usage);
  }

  return {evidence, spec, out};
};

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(resolve(projectRoot, path), "utf8"));

const inputPropsFor = (spec: CreativeSpec): ProductAdProps => ({
  spec,
  media: {
    humanContext: "media/build-week/ad-compiler/nova-one-master.webp",
    humanControl: "media/build-week/ad-compiler/nova-one-control.webp",
    cleanProduct: "media/build-week/ad-compiler/nova-one-packshot.webp",
    audio: "media/build-week/ad-compiler/nova-one-score.m4a",
  },
});

const main = async () => {
  const options = parseCli(process.argv.slice(2));
  const evidence = await readJson(options.evidence);
  const spec = await readJson(options.spec);
  const compiled = compileCreativeSpec({evidence, spec});
  const inputProps = inputPropsFor(compiled.spec);
  const outputLocation = resolve(projectRoot, options.out);

  await mkdir(dirname(outputLocation), {recursive: true});
  process.stdout.write(`Validated CreativeSpec ${compiled.specHash.slice(0, 12)}\n`);

  const serveUrl = await bundle({
    entryPoint: resolve(projectRoot, "video/index.ts"),
    publicDir: resolve(projectRoot, "public"),
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
};

await main();
