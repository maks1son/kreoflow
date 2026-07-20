import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const verifier = resolve(projectRoot, "scripts/ad-compiler/verify-artifacts.mts");
const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "kreoflow-verify-"));
  temporaryDirectories.push(path);
  return path;
}

function run(args: string[] = []) {
  return spawnSync(process.execPath, ["--import", "tsx", verifier, ...args], {
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

describe("read-only public artifact gate", () => {
  it("accepts the current fixture render chain", () => {
    const result = run();

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/ARTIFACT GATE PASS/i);
    expect(result.stdout).toMatch(/no authentication or re-measurement/i);
  });

  it("rejects a QA receipt bound to a different render receipt", async () => {
    const directory = await temporaryDirectory();
    const qa = JSON.parse(
      await readFile(
        resolve(
          projectRoot,
          "public/media/build-week/ad-compiler/nova-one-qa-receipt.json",
        ),
        "utf8",
      ),
    ) as { renderReceiptHash: string };
    qa.renderReceiptHash = "0".repeat(64);
    const qaPath = join(directory, "stale-qa.json");
    await writeFile(qaPath, `${JSON.stringify(qa)}\n`, "utf8");

    const result = run(["--qa", qaPath]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/stale for render receipt/i);
  });

  it("rejects a render receipt bound to different source media", async () => {
    const directory = await temporaryDirectory();
    const receipt = JSON.parse(
      await readFile(
        resolve(
          projectRoot,
          "public/media/build-week/ad-compiler/nova-one-render-receipt.json",
        ),
        "utf8",
      ),
    ) as { mediaManifestHash: string };
    receipt.mediaManifestHash = "0".repeat(64);
    const receiptPath = join(directory, "stale-render.json");
    await writeFile(receiptPath, `${JSON.stringify(receipt)}\n`, "utf8");

    const result = run(["--render-receipt", receiptPath]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toMatch(/stale for the current media bytes/i);
  });
});
