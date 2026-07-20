import { z } from "zod";
import { relative, resolve } from "node:path";

import { hashCanonical } from "./schema";

export const TECHNICAL_QA_VERSION = "1.0.0" as const;

export const TECHNICAL_QA_CHECK_IDS = [
  "dimensions",
  "video_codec",
  "video_profile",
  "pixel_format",
  "fps",
  "duration",
  "audio_stream",
  "audio_codec",
  "audio_sample_rate",
  "audio_channels",
  "loudness",
  "true_peak",
  "file_nonempty",
] as const;

const TECHNICAL_QA_LIMITATIONS = [
  "contrast",
  "product_identity",
  "commercial_effectiveness",
  "legal_and_platform_compliance",
] as const;

const Sha256Schema = z
  .string()
  .regex(/^[a-f0-9]{64}$/u, "Expected a lowercase SHA-256 hash");

const MediaManifestAssetSchema = z
  .object({
    id: z.string().trim().min(1),
    path: z.string().trim().min(1),
    sha256: Sha256Schema,
  })
  .strict();

export const MediaManifestSchema = z
  .object({
    assets: z.array(MediaManifestAssetSchema).min(1),
    audio: z
      .object({
        path: z.string().trim().min(1),
        sha256: Sha256Schema,
      })
      .strict(),
  })
  .strict()
  .superRefine((manifest, context) => {
    const ids = manifest.assets.map((asset) => asset.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        path: ["assets"],
        message: "Media manifest asset IDs must be unique",
      });
    }
  });

export type MediaManifest = z.infer<typeof MediaManifestSchema>;

const normalizedManifestPath = (path: string): string => {
  const projectRoot = resolve(process.cwd());
  const projectRelativePath = relative(projectRoot, resolve(projectRoot, path.trim()));
  return (projectRelativePath || ".").replaceAll("\\", "/");
};

export function buildMediaManifestHash(input: unknown): string {
  const manifest = MediaManifestSchema.parse(input);
  return hashCanonical({
    assets: manifest.assets
      .map((asset) => ({
        id: asset.id,
        path: normalizedManifestPath(asset.path),
        sha256: asset.sha256,
      }))
      .sort((left, right) =>
        left.id === right.id
          ? left.path.localeCompare(right.path)
          : left.id.localeCompare(right.id),
      ),
    audio: {
      path: normalizedManifestPath(manifest.audio.path),
      sha256: manifest.audio.sha256,
    },
  });
}

export const TechnicalQaCheckIdSchema = z.enum(TECHNICAL_QA_CHECK_IDS);

export const TechnicalQaCheckSchema = z
  .object({
    id: TechnicalQaCheckIdSchema,
    label: z.string().trim().min(1),
    passed: z.boolean(),
    expected: z.string().trim().min(1),
    actual: z.string().trim().min(1),
    blocking: z.literal(true),
  })
  .strict();

const TechnicalQaSummarySchema = z
  .object({
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    fps: z.number().finite().positive().nullable(),
    durationSeconds: z.number().finite().nonnegative(),
    videoCodec: z.string().trim().min(1).nullable(),
    audioCodec: z.string().trim().min(1).nullable(),
    audioSampleRate: z.number().int().positive().nullable(),
    integratedLufs: z.number().finite().nullable(),
    truePeakDbfs: z.number().finite().nullable(),
  })
  .strict();

export const TechnicalQaReceiptSchema = z
  .object({
    version: z.literal(TECHNICAL_QA_VERSION),
    generatedAt: z.string().datetime({ offset: true }),
    evidenceHash: Sha256Schema,
    mediaManifestHash: Sha256Schema,
    specHash: Sha256Schema,
    renderHash: Sha256Schema,
    passed: z.boolean(),
    checks: z.array(TechnicalQaCheckSchema).length(TECHNICAL_QA_CHECK_IDS.length),
    summary: TechnicalQaSummarySchema,
    heuristicLimitations: z
      .array(z.enum(TECHNICAL_QA_LIMITATIONS))
      .length(TECHNICAL_QA_LIMITATIONS.length),
  })
  .strict()
  .superRefine((receipt, context) => {
    const counts = new Map<string, number>();
    for (const check of receipt.checks) {
      counts.set(check.id, (counts.get(check.id) ?? 0) + 1);
    }
    for (const id of TECHNICAL_QA_CHECK_IDS) {
      if (counts.get(id) !== 1) {
        context.addIssue({
          code: "custom",
          path: ["checks"],
          message: `QA receipt must contain exactly one "${id}" check`,
        });
      }
    }

    const allChecksPassed = receipt.checks.every((check) => check.passed);
    if (receipt.passed !== allChecksPassed) {
      context.addIssue({
        code: "custom",
        path: ["passed"],
        message: "Receipt passed must equal the result of all blocking checks",
      });
    }

    if (new Set(receipt.heuristicLimitations).size !== TECHNICAL_QA_LIMITATIONS.length) {
      context.addIssue({
        code: "custom",
        path: ["heuristicLimitations"],
        message: "Heuristic limitations must be complete and unique",
      });
    }
  });

export type TechnicalQaCheckId = z.infer<typeof TechnicalQaCheckIdSchema>;
export type TechnicalQaCheck = z.infer<typeof TechnicalQaCheckSchema>;
export type TechnicalQaReceipt = z.infer<typeof TechnicalQaReceiptSchema>;

export type VideoProbe = {
  codec: string;
  profile: string | null;
  width: number;
  height: number;
  pixelFormat: string | null;
  fps: number;
};

export type AudioProbe = {
  codec: string;
  sampleRate: number;
  channels: number;
};

export type MediaProbe = {
  durationSeconds: number;
  sizeBytes: number;
  video: VideoProbe | null;
  audio: AudioProbe | null;
};

export type LoudnessMeasurement = {
  integratedLufs: number;
  loudnessRangeLu: number;
  truePeakDbfs: number;
};

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown, label: string): UnknownRecord => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as UnknownRecord;
};

const finiteNumber = (value: unknown, label: string): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a finite number`);
  }
  return parsed;
};

const optionalString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const parseFrameRate = (value: unknown): number => {
  if (typeof value !== "string") return finiteNumber(value, "video frame rate");
  const [numeratorText, denominatorText] = value.split("/");
  const numerator = finiteNumber(numeratorText, "video frame-rate numerator");
  const denominator = denominatorText
    ? finiteNumber(denominatorText, "video frame-rate denominator")
    : 1;
  if (denominator === 0) {
    throw new Error("video frame-rate denominator cannot be zero");
  }
  return numerator / denominator;
};

export const parseFfprobeJson = (input: unknown): MediaProbe => {
  const root = asRecord(input, "ffprobe output");
  if (!Array.isArray(root.streams)) {
    throw new Error("ffprobe streams must be an array");
  }
  const format = asRecord(root.format, "ffprobe format");
  const streams = root.streams.map((stream, index) =>
    asRecord(stream, `ffprobe stream ${index}`),
  );
  const videoStream = streams.find((stream) => stream.codec_type === "video");
  const audioStream = streams.find((stream) => stream.codec_type === "audio");

  return {
    durationSeconds: finiteNumber(format.duration, "format duration"),
    sizeBytes: finiteNumber(format.size, "format size"),
    video: videoStream
      ? {
          codec: optionalString(videoStream.codec_name) ?? "unknown",
          profile: optionalString(videoStream.profile),
          width: finiteNumber(videoStream.width, "video width"),
          height: finiteNumber(videoStream.height, "video height"),
          pixelFormat: optionalString(videoStream.pix_fmt),
          fps: parseFrameRate(
            videoStream.avg_frame_rate ?? videoStream.r_frame_rate,
          ),
        }
      : null,
    audio: audioStream
      ? {
          codec: optionalString(audioStream.codec_name) ?? "unknown",
          sampleRate: finiteNumber(audioStream.sample_rate, "audio sample rate"),
          channels: finiteNumber(audioStream.channels, "audio channel count"),
        }
      : null,
  };
};

const lastMeasurement = (text: string, pattern: RegExp): number | null => {
  const matches = [...text.matchAll(pattern)];
  const value = matches.at(-1)?.[1];
  if (value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseEbur128Summary = (
  output: string,
): LoudnessMeasurement | null => {
  const integratedLufs = lastMeasurement(
    output,
    /^\s*I:\s*(-?\d+(?:\.\d+)?)\s+LUFS\s*$/gim,
  );
  const loudnessRangeLu = lastMeasurement(
    output,
    /^\s*LRA:\s*(-?\d+(?:\.\d+)?)\s+LU\s*$/gim,
  );
  const truePeakDbfs = lastMeasurement(
    output,
    /^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s+dBFS\s*$/gim,
  );

  if (
    integratedLufs === null ||
    loudnessRangeLu === null ||
    truePeakDbfs === null
  ) {
    return null;
  }

  return { integratedLufs, loudnessRangeLu, truePeakDbfs };
};

const actual = (value: unknown): string =>
  value === null || value === undefined ? "missing" : String(value);

export const buildTechnicalQaReceipt = ({
  probe,
  loudness,
  expectedDurationSeconds,
  evidenceHash,
  mediaManifestHash,
  specHash,
  renderHash,
  generatedAt = new Date().toISOString(),
}: {
  probe: MediaProbe;
  loudness: LoudnessMeasurement | null;
  expectedDurationSeconds: number;
  evidenceHash: string;
  mediaManifestHash: string;
  specHash: string;
  renderHash: string;
  generatedAt?: string;
}): TechnicalQaReceipt => {
  const video = probe.video;
  const audio = probe.audio;
  const check = (
    id: TechnicalQaCheckId,
    label: string,
    passed: boolean,
    expected: string,
    measured: unknown,
  ): TechnicalQaCheck => ({
    id,
    label,
    passed,
    expected,
    actual: actual(measured),
    blocking: true,
  });

  const checks: TechnicalQaCheck[] = [
    check(
      "dimensions",
      "Vertical delivery dimensions",
      video?.width === 1080 && video.height === 1920,
      "1080x1920",
      video ? `${video.width}x${video.height}` : null,
    ),
    check("video_codec", "Video codec", video?.codec === "h264", "h264", video?.codec),
    check("video_profile", "H.264 profile", video?.profile === "High", "High", video?.profile),
    check("pixel_format", "Pixel format", video?.pixelFormat === "yuv420p", "yuv420p", video?.pixelFormat),
    check("fps", "Frame rate", Math.abs((video?.fps ?? 0) - 30) <= 0.01, "30", video?.fps),
    check(
      "duration",
      "Runtime",
      Math.abs(probe.durationSeconds - expectedDurationSeconds) <= 0.15,
      `${expectedDurationSeconds}s ±0.15s`,
      `${probe.durationSeconds}s`,
    ),
    check("audio_stream", "Audio stream", audio !== null, "present", audio ? "present" : null),
    check("audio_codec", "Audio codec", audio?.codec === "aac", "aac", audio?.codec),
    check(
      "audio_sample_rate",
      "Audio sample rate",
      audio?.sampleRate === 48_000,
      "48000 Hz",
      audio?.sampleRate,
    ),
    check("audio_channels", "Audio channels", audio?.channels === 2, "stereo (2)", audio?.channels),
    check(
      "loudness",
      "Integrated loudness",
      loudness !== null &&
        loudness.integratedLufs >= -18 &&
        loudness.integratedLufs <= -14,
      "-18 to -14 LUFS",
      loudness ? `${loudness.integratedLufs} LUFS` : null,
    ),
    check(
      "true_peak",
      "True peak",
      loudness !== null && loudness.truePeakDbfs <= -1,
      "≤ -1 dBFS",
      loudness ? `${loudness.truePeakDbfs} dBFS` : null,
    ),
    check("file_nonempty", "Encoded file", probe.sizeBytes > 0, "> 0 bytes", probe.sizeBytes),
  ];

  return TechnicalQaReceiptSchema.parse({
    version: TECHNICAL_QA_VERSION,
    generatedAt,
    evidenceHash,
    mediaManifestHash,
    specHash,
    renderHash,
    passed: checks.every((item) => item.passed),
    checks,
    summary: {
      width: video?.width ?? null,
      height: video?.height ?? null,
      fps: video?.fps ?? null,
      durationSeconds: probe.durationSeconds,
      videoCodec: video?.codec ?? null,
      audioCodec: audio?.codec ?? null,
      audioSampleRate: audio?.sampleRate ?? null,
      integratedLufs: loudness?.integratedLufs ?? null,
      truePeakDbfs: loudness?.truePeakDbfs ?? null,
    },
    heuristicLimitations: [...TECHNICAL_QA_LIMITATIONS],
  });
};
