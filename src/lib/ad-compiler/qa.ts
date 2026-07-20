export const TECHNICAL_QA_VERSION = "1.0.0" as const;

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

export type TechnicalQaCheck = {
  id: string;
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  blocking: true;
};

export type TechnicalQaReceipt = {
  version: typeof TECHNICAL_QA_VERSION;
  generatedAt: string;
  specHash: string;
  renderHash: string;
  passed: boolean;
  checks: TechnicalQaCheck[];
  summary: {
    width: number | null;
    height: number | null;
    fps: number | null;
    durationSeconds: number;
    videoCodec: string | null;
    audioCodec: string | null;
    audioSampleRate: number | null;
    integratedLufs: number | null;
    truePeakDbfs: number | null;
  };
  heuristicLimitations: readonly string[];
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
  if (denominator === 0) throw new Error("video frame-rate denominator cannot be zero");
  return numerator / denominator;
};

export const parseFfprobeJson = (input: unknown): MediaProbe => {
  const root = asRecord(input, "ffprobe output");
  if (!Array.isArray(root.streams)) throw new Error("ffprobe streams must be an array");
  const format = asRecord(root.format, "ffprobe format");

  const videoStream = root.streams
    .map((stream, index) => asRecord(stream, `ffprobe stream ${index}`))
    .find((stream) => stream.codec_type === "video");
  const audioStream = root.streams
    .map((stream, index) => asRecord(stream, `ffprobe stream ${index}`))
    .find((stream) => stream.codec_type === "audio");

  const durationSeconds = finiteNumber(format.duration, "format duration");
  const sizeBytes = finiteNumber(format.size, "format size");

  return {
    durationSeconds,
    sizeBytes,
    video: videoStream
      ? {
          codec: optionalString(videoStream.codec_name) ?? "unknown",
          profile: optionalString(videoStream.profile),
          width: finiteNumber(videoStream.width, "video width"),
          height: finiteNumber(videoStream.height, "video height"),
          pixelFormat: optionalString(videoStream.pix_fmt),
          fps: parseFrameRate(videoStream.avg_frame_rate ?? videoStream.r_frame_rate),
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

export const parseEbur128Summary = (output: string): LoudnessMeasurement | null => {
  const integratedLufs = lastMeasurement(output, /^\s*I:\s*(-?\d+(?:\.\d+)?)\s+LUFS\s*$/gim);
  const loudnessRangeLu = lastMeasurement(output, /^\s*LRA:\s*(-?\d+(?:\.\d+)?)\s+LU\s*$/gim);
  const truePeakDbfs = lastMeasurement(output, /^\s*Peak:\s*(-?\d+(?:\.\d+)?)\s+dBFS\s*$/gim);

  if (integratedLufs === null || loudnessRangeLu === null || truePeakDbfs === null) {
    return null;
  }

  return { integratedLufs, loudnessRangeLu, truePeakDbfs };
};

const actual = (value: unknown): string => (value === null || value === undefined ? "missing" : String(value));

export const buildTechnicalQaReceipt = ({
  probe,
  loudness,
  expectedDurationSeconds,
  specHash,
  renderHash,
  generatedAt = new Date().toISOString(),
}: {
  probe: MediaProbe;
  loudness: LoudnessMeasurement | null;
  expectedDurationSeconds: number;
  specHash: string;
  renderHash: string;
  generatedAt?: string;
}): TechnicalQaReceipt => {
  const video = probe.video;
  const audio = probe.audio;
  const check = (
    id: string,
    label: string,
    passed: boolean,
    expected: string,
    measured: unknown,
  ): TechnicalQaCheck => ({ id, label, passed, expected, actual: actual(measured), blocking: true });

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
    check("audio_sample_rate", "Audio sample rate", audio?.sampleRate === 48_000, "48000 Hz", audio?.sampleRate),
    check("audio_channels", "Audio channels", audio?.channels === 2, "stereo (2)", audio?.channels),
    check(
      "loudness",
      "Integrated loudness",
      loudness !== null && loudness.integratedLufs >= -18 && loudness.integratedLufs <= -14,
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

  return {
    version: TECHNICAL_QA_VERSION,
    generatedAt,
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
    heuristicLimitations: [
      "contrast",
      "product_identity",
      "commercial_effectiveness",
      "legal_and_platform_compliance",
    ],
  };
};
