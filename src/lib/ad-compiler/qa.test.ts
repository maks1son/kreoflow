import { describe, expect, it } from "vitest";

import {
  buildTechnicalQaReceipt,
  parseEbur128Summary,
  parseFfprobeJson,
} from "./qa";

const passingProbe = {
  streams: [
    {
      index: 0,
      codec_type: "video",
      codec_name: "h264",
      profile: "High",
      width: 1080,
      height: 1920,
      pix_fmt: "yuv420p",
      r_frame_rate: "30/1",
      avg_frame_rate: "30/1",
      duration: "12.000000",
    },
    {
      index: 1,
      codec_type: "audio",
      codec_name: "aac",
      sample_rate: "48000",
      channels: 2,
      duration: "12.000000",
    },
  ],
  format: {
    format_name: "mov,mp4,m4a,3gp,3g2,mj2",
    duration: "12.000000",
    size: "3456789",
  },
};

describe("technical render QA", () => {
  it("parses ffprobe data and creates a passing, explicit receipt", () => {
    const probe = parseFfprobeJson(passingProbe);
    const receipt = buildTechnicalQaReceipt({
      probe,
      loudness: { integratedLufs: -17.2, loudnessRangeLu: 11.6, truePeakDbfs: -3.5 },
      expectedDurationSeconds: 12,
      specHash: "a".repeat(64),
      renderHash: "b".repeat(64),
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(receipt.passed).toBe(true);
    expect(receipt.summary).toMatchObject({
      width: 1080,
      height: 1920,
      fps: 30,
      videoCodec: "h264",
      audioCodec: "aac",
      audioSampleRate: 48000,
    });
    expect(receipt.checks.every((check) => check.passed)).toBe(true);
    expect(receipt.heuristicLimitations).toContain("product_identity");
  });

  it("blocks wrong dimensions, missing audio, and duration drift", () => {
    const probe = parseFfprobeJson({
      ...passingProbe,
      streams: [
        {
          ...passingProbe.streams[0],
          width: 720,
          height: 1280,
          duration: "11.500000",
        },
      ],
      format: { ...passingProbe.format, duration: "11.500000" },
    });

    const receipt = buildTechnicalQaReceipt({
      probe,
      loudness: null,
      expectedDurationSeconds: 12,
      specHash: "a".repeat(64),
      renderHash: "b".repeat(64),
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(receipt.passed).toBe(false);
    expect(receipt.checks.filter((check) => !check.passed).map((check) => check.id)).toEqual(
      expect.arrayContaining(["dimensions", "duration", "audio_stream", "loudness"]),
    );
  });

  it("blocks unsafe loudness and true peak", () => {
    const receipt = buildTechnicalQaReceipt({
      probe: parseFfprobeJson(passingProbe),
      loudness: { integratedLufs: -12.5, loudnessRangeLu: 1.2, truePeakDbfs: -0.4 },
      expectedDurationSeconds: 12,
      specHash: "a".repeat(64),
      renderHash: "b".repeat(64),
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(receipt.passed).toBe(false);
    expect(receipt.checks.find((check) => check.id === "loudness")?.passed).toBe(false);
    expect(receipt.checks.find((check) => check.id === "true_peak")?.passed).toBe(false);
  });
});

describe("ebur128 parsing", () => {
  it("extracts the final summary without confusing thresholds for results", () => {
    const output = `
[Parsed_ebur128_0] Summary:
  Integrated loudness:
    I:         -17.2 LUFS
    Threshold: -27.9 LUFS
  Loudness range:
    LRA:        11.6 LU
    Threshold: -39.2 LUFS
  True peak:
    Peak:       -3.5 dBFS
`;

    expect(parseEbur128Summary(output)).toEqual({
      integratedLufs: -17.2,
      loudnessRangeLu: 11.6,
      truePeakDbfs: -3.5,
    });
  });

  it("returns null when ffmpeg did not emit a complete summary", () => {
    expect(parseEbur128Summary("Integrated loudness: unknown")).toBeNull();
  });
});
