import { spawnSync } from "node:child_process";
import {
  access,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildRenderReceipt } from "../../src/lib/ad-compiler/render-receipt";

const projectRoot = process.cwd();
const qaScript = resolve(projectRoot, "scripts/ad-compiler/qa.mts");
const approveScript = resolve(projectRoot, "scripts/ad-compiler/approve.mts");
const demoScript = resolve(projectRoot, "scripts/ad-compiler/demo.mts");
const strategyScript = resolve(projectRoot, "scripts/ad-compiler/strategy.mts");
const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "kreoflow-receipt-"));
  temporaryDirectories.push(path);
  return path;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function run(script: string, args: string[]) {
  return spawnSync(process.execPath, ["--import", "tsx", script, ...args], {
    cwd: projectRoot,
    encoding: "utf8",
    windowsHide: true,
  });
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) =>
      rm(path, { recursive: true, force: true }),
    ),
  );
});

describe("receipt output lifecycle", () => {
  it.runIf(process.platform === "win32")(
    "blocks a case-variant live strategy overwrite before any API call",
    async () => {
      const directory = await temporaryDirectory();
      const evidencePath = join(directory, "Evidence.json");
      const caseVariantOutputPath = join(directory, "evidence.json");
      await writeFile(
        evidencePath,
        await readFile(
          resolve(projectRoot, "samples/nova-one/product-evidence.json"),
          "utf8",
        ),
        "utf8",
      );

      const result = run(strategyScript, [
        "--evidence",
        evidencePath,
        "--out",
        caseVariantOutputPath,
        "--platform",
        "instagram_reels",
        "--objective",
        "test",
        "--audience",
        "test audience",
        "--caller-id",
        "lifecycle-test",
      ]);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toMatch(/must not overwrite/i);
      expect(`${result.stdout}${result.stderr}`).not.toMatch(/OPENAI_API_KEY is required/i);
      expect(await exists(evidencePath)).toBe(true);
    },
  );

  it.runIf(process.platform === "win32")(
    "does not delete an input when --out differs only by Windows path casing",
    async () => {
      const directory = await temporaryDirectory();
      const evidencePath = join(directory, "Evidence.json");
      const caseVariantOutputPath = join(directory, "evidence.json");
      await writeFile(
        evidencePath,
        await readFile(
          resolve(projectRoot, "samples/nova-one/product-evidence.json"),
          "utf8",
        ),
        "utf8",
      );

      const result = run(qaScript, [
        "--evidence",
        evidencePath,
        "--spec",
        "samples/nova-one/creative-spec.json",
        "--audio",
        "package.json",
        "--video",
        "package.json",
        "--render-receipt",
        "package.json",
        "--out",
        caseVariantOutputPath,
      ]);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toMatch(/must not overwrite/i);
      expect(await exists(evidencePath)).toBe(true);
    },
  );

  it.runIf(process.platform === "win32")(
    "protects declared evidence assets from case-variant QA and approval outputs",
    async () => {
      const directory = await temporaryDirectory();
      const evidence = JSON.parse(
        await readFile(
          resolve(projectRoot, "samples/nova-one/product-evidence.json"),
          "utf8",
        ),
      ) as { assets: Array<{ path: string }> };
      const evidencePath = join(directory, "evidence.json");
      const assetPath = join(directory, "Protected-Asset.webp");
      const caseVariantOutputPath = join(directory, "protected-asset.webp");
      evidence.assets[0].path = assetPath;
      await writeFile(evidencePath, `${JSON.stringify(evidence)}\n`, "utf8");

      for (const [script, extraArgs] of [
        [qaScript, []],
        [approveScript, ["--qa", "package.json", "--approver", "Asset guard test"]],
      ] as const) {
        await writeFile(assetPath, "source asset must survive", "utf8");
        const result = run(script, [
          "--evidence",
          evidencePath,
          "--spec",
          "samples/nova-one/creative-spec.json",
          "--audio",
          "package.json",
          "--video",
          "package.json",
          "--render-receipt",
          "package.json",
          "--out",
          caseVariantOutputPath,
          ...extraArgs,
        ]);

        expect(result.status).not.toBe(0);
        expect(`${result.stdout}${result.stderr}`).toMatch(/must not overwrite/i);
        expect(await exists(assetPath)).toBe(true);
      }
    },
  );

  it.runIf(process.platform === "win32")(
    "does not delete an input through a case-variant --poster path",
    async () => {
      const directory = await temporaryDirectory();
      const evidencePath = join(directory, "Evidence.json");
      const caseVariantPosterPath = join(directory, "evidence.json");
      await writeFile(
        evidencePath,
        await readFile(
          resolve(projectRoot, "samples/nova-one/product-evidence.json"),
          "utf8",
        ),
        "utf8",
      );

      const result = run(demoScript, [
        "--evidence",
        evidencePath,
        "--spec",
        "samples/nova-one/creative-spec.json",
        "--audio",
        "package.json",
        "--video",
        join(directory, "video.mp4"),
        "--render-receipt",
        join(directory, "render.json"),
        "--qa",
        join(directory, "qa.json"),
        "--poster",
        caseVariantPosterPath,
      ]);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toMatch(/must not overwrite/i);
      expect(await exists(evidencePath)).toBe(true);
    },
  );

  it.runIf(process.platform === "win32")(
    "protects declared evidence assets from a case-variant poster output",
    async () => {
      const directory = await temporaryDirectory();
      const evidence = JSON.parse(
        await readFile(
          resolve(projectRoot, "samples/nova-one/product-evidence.json"),
          "utf8",
        ),
      ) as { assets: Array<{ path: string }> };
      const evidencePath = join(directory, "evidence.json");
      const assetPath = join(directory, "Protected-Poster-Asset.webp");
      const posterPath = join(directory, "protected-poster-asset.webp");
      evidence.assets[0].path = assetPath;
      await writeFile(evidencePath, `${JSON.stringify(evidence)}\n`, "utf8");
      await writeFile(assetPath, "source asset must survive", "utf8");

      const result = run(demoScript, [
        "--evidence",
        evidencePath,
        "--spec",
        "samples/nova-one/creative-spec.json",
        "--audio",
        "package.json",
        "--video",
        join(directory, "video.mp4"),
        "--render-receipt",
        join(directory, "render.json"),
        "--qa",
        join(directory, "qa.json"),
        "--poster",
        posterPath,
      ]);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toMatch(/must not overwrite/i);
      expect(await exists(assetPath)).toBe(true);
    },
  );

  it("removes an old poster before pipeline validation", async () => {
    const directory = await temporaryDirectory();
    const posterPath = join(directory, "poster.jpg");
    const evidencePath = join(directory, "live-evidence.json");
    const evidence = JSON.parse(
      await readFile(
        resolve(projectRoot, "samples/nova-one/product-evidence.json"),
        "utf8",
      ),
    ) as { sourceMode: string };
    evidence.sourceMode = "live";
    await writeFile(evidencePath, `${JSON.stringify(evidence)}\n`, "utf8");
    await writeFile(posterPath, "stale poster", "utf8");

    const result = run(demoScript, [
      "--evidence",
      evidencePath,
      "--spec",
      "samples/nova-one/creative-spec.json",
      "--audio",
      "package.json",
      "--video",
      join(directory, "video.mp4"),
      "--render-receipt",
      join(directory, "render.json"),
      "--qa",
      join(directory, "qa.json"),
      "--poster",
      posterPath,
    ]);

    expect(result.status).not.toBe(0);
    expect(await exists(posterPath)).toBe(false);
  });

  it("removes stale QA, poster, and approval before a failed render", async () => {
    const directory = await temporaryDirectory();
    const qaPath = join(directory, "qa.json");
    const posterPath = join(directory, "poster.jpg");
    const approvalPath = join(directory, "approval.json");
    await Promise.all([
      writeFile(qaPath, '{"passed":true}\n', "utf8"),
      writeFile(posterPath, "stale poster", "utf8"),
      writeFile(approvalPath, '{"approved":true}\n', "utf8"),
    ]);

    const result = run(demoScript, [
      "--evidence",
      "samples/nova-one/product-evidence.json",
      "--spec",
      "samples/nova-one/creative-spec.json",
      "--audio",
      join(directory, "missing-audio.m4a"),
      "--video",
      join(directory, "video.mp4"),
      "--render-receipt",
      join(directory, "render.json"),
      "--qa",
      qaPath,
      "--poster",
      posterPath,
      "--approval",
      approvalPath,
    ]);

    expect(result.status).not.toBe(0);
    expect(await exists(qaPath)).toBe(false);
    expect(await exists(posterPath)).toBe(false);
    expect(await exists(approvalPath)).toBe(false);
  }, 20_000);

  it.runIf(process.platform === "win32")(
    "rejects case-variant derivative collisions before invalidation",
    async () => {
      const directory = await temporaryDirectory();
      const videoPath = join(directory, "Derivative.bin");
      const qaPath = join(directory, "derivative.BIN");
      await writeFile(qaPath, "must survive collision", "utf8");

      const result = run(demoScript, [
        "--evidence",
        "samples/nova-one/product-evidence.json",
        "--spec",
        "samples/nova-one/creative-spec.json",
        "--audio",
        "package.json",
        "--video",
        videoPath,
        "--render-receipt",
        join(directory, "render.json"),
        "--qa",
        qaPath,
        "--poster",
        join(directory, "poster.jpg"),
        "--approval",
        join(directory, "approval.json"),
      ]);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toMatch(/different paths/i);
      expect(await exists(qaPath)).toBe(true);
    },
  );

  it("removes an old QA PASS artifact before stale render validation", async () => {
    const directory = await temporaryDirectory();
    const outputPath = join(directory, "qa.json");
    const renderReceiptPath = join(directory, "render.json");
    await writeFile(outputPath, '{"passed":true}\n', "utf8");
    await writeFile(
      renderReceiptPath,
      `${JSON.stringify(
        buildRenderReceipt({
          generatedAt: "2026-07-20T12:00:00.000Z",
          outputPath: "package.json",
          evidenceHash: "0".repeat(64),
          specHash: "1".repeat(64),
          mediaManifestHash: "2".repeat(64),
          renderHash: "3".repeat(64),
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );

    const result = run(qaScript, [
      "--evidence",
      "samples/nova-one/product-evidence.json",
      "--spec",
      "samples/nova-one/creative-spec.json",
      "--audio",
      "public/media/build-week/ad-compiler/nova-one-score.m4a",
      "--video",
      "package.json",
      "--render-receipt",
      renderReceiptPath,
      "--out",
      outputPath,
    ]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/stale for the current evidence/i);
    expect(await exists(outputPath)).toBe(false);
  });

  it("removes an old approval artifact before any current-chain verification", async () => {
    const directory = await temporaryDirectory();
    const outputPath = join(directory, "approval.json");
    await writeFile(outputPath, '{"approved":true}\n', "utf8");

    const result = run(approveScript, [
      "--evidence",
      "samples/nova-one/product-evidence.json",
      "--spec",
      "samples/nova-one/creative-spec.json",
      "--audio",
      "package.json",
      "--video",
      "package.json",
      "--render-receipt",
      "package.json",
      "--qa",
      "package.json",
      "--out",
      outputPath,
      "--approver",
      "Lifecycle test reviewer",
    ]);

    expect(result.status).not.toBe(0);
    expect(await exists(outputPath)).toBe(false);
  });
});
