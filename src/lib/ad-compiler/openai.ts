import { createHash } from "node:crypto";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  compileCreativeSpec,
  CreativeSpecSchema,
  ProductEvidenceSchema,
  type CreativeSpec,
} from "./schema";
import {
  buildCreativeDirectorUserPrompt,
  CREATIVE_DIRECTOR_SYSTEM_PROMPT,
} from "./prompt";

export const DEFAULT_OPENAI_AD_COMPILER_MODEL = "gpt-5.6-terra";
export const MISSING_OPENAI_API_KEY_ERROR =
  "OPENAI_API_KEY is required for live OpenAI ad compilation.";

type OpenAICompilerRequest = Parameters<OpenAI["responses"]["parse"]>[0];

type OpenAICompilerResponse = {
  id: string;
  model?: string;
  output_parsed: unknown;
};

export type OpenAICompilerClient = {
  responses: {
    parse(request: OpenAICompilerRequest): Promise<OpenAICompilerResponse>;
  };
};

export type OpenAICompilerInput = {
  evidence: unknown;
  platform: string;
  objective: string;
  audience: string;
  callerId: string;
  client?: OpenAICompilerClient;
  model?: string;
};

export type LiveOpenAICompilerResult = {
  mode: "live";
  spec: CreativeSpec;
  metadata: {
    provider: "openai";
    api: "responses";
    model: string;
    responseId: string;
  };
};

function safetyIdentifierFor(callerId: string): string {
  const normalizedCallerId = callerId.trim();
  if (!normalizedCallerId) {
    throw new Error("callerId is required for live OpenAI ad compilation.");
  }

  return createHash("sha256").update(normalizedCallerId).digest("hex");
}

function defaultClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(MISSING_OPENAI_API_KEY_ERROR);
  }

  return new OpenAI({ apiKey });
}

export async function compileCreativeSpecWithOpenAI({
  evidence: evidenceInput,
  platform,
  objective,
  audience,
  callerId,
  client,
  model = DEFAULT_OPENAI_AD_COMPILER_MODEL,
}: OpenAICompilerInput): Promise<LiveOpenAICompilerResult> {
  const evidence = ProductEvidenceSchema.parse(evidenceInput);
  const request: OpenAICompilerRequest = {
    model,
    instructions: CREATIVE_DIRECTOR_SYSTEM_PROMPT,
    input: buildCreativeDirectorUserPrompt({
      platform,
      objective,
      audience,
      productEvidence: evidence,
      mediaInventory: evidence.assets,
    }),
    reasoning: { effort: "medium" },
    safety_identifier: safetyIdentifierFor(callerId),
    store: false,
    text: {
      format: zodTextFormat(CreativeSpecSchema, "creative_spec"),
    },
  };

  const response = client
    ? await client.responses.parse(request)
    : await defaultClient().responses.parse(request);

  if (response.output_parsed === null) {
    throw new Error("OpenAI Responses API returned no parsed CreativeSpec.");
  }

  const spec = CreativeSpecSchema.parse(response.output_parsed);
  if (spec.sourceMode !== "live_gpt_5_6") {
    throw new Error("Live compiler returned a non-live Creative Spec.");
  }

  const grounded = compileCreativeSpec({ evidence, spec });

  return {
    mode: "live",
    spec: grounded.spec,
    metadata: {
      provider: "openai",
      api: "responses",
      model: response.model ?? model,
      responseId: response.id,
    },
  };
}
