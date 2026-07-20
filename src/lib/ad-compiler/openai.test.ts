import { afterEach, describe, expect, it, vi } from "vitest";

import {
  compileCreativeSpecWithOpenAI,
  MISSING_OPENAI_API_KEY_ERROR,
} from "./openai";
import { CREATIVE_DIRECTOR_SYSTEM_PROMPT } from "./prompt";

const evidence = {
  schemaVersion: "1.0.0",
  sourceMode: "fixture",
  evidenceId: "nova-one-demo-v1",
  product: {
    id: "nova-one",
    name: "NOVA ONE",
    category: "wireless headphones",
  },
  claims: [
    {
      id: "adaptive-anc",
      text: "Adaptive noise cancelling",
      status: "source_attributed",
      source: {
        type: "client_brief",
        reference: "Demo client brief, section 2",
        excerpt: "Adaptive noise cancelling",
      },
    },
  ],
  assets: [
    {
      id: "city-portrait",
      path: "samples/nova-one/assets/city-portrait.png",
      role: "human_context",
      alt: "Commuter wearing NOVA ONE headphones",
    },
    {
      id: "clean-packshot",
      path: "samples/nova-one/assets/clean-packshot.png",
      role: "clean_product",
      alt: "NOVA ONE headphones on a neutral background",
    },
  ],
} as const;

const parsedSpec = {
  schemaVersion: "1.0.0",
  sourceMode: "live_gpt_5_6",
  campaignId: "nova-one-city-signal-live-v1",
  productId: "nova-one",
  objective: "Make NOVA ONE desirable to city commuters",
  platform: "instagram_reels",
  audience: "Design-conscious city commuters",
  angle: "Turn city noise into a calm personal signal",
  visualDirection: "Rain-soaked night city with a red-to-blue waveform",
  supportedPromiseClaimId: "adaptive-anc",
  durationSeconds: 12,
  aspectRatio: "9:16",
  fps: 30,
  scenes: [
    {
      id: "chaos",
      startSeconds: 0,
      endSeconds: 1.4,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "TOO MUCH CITY?", claimId: null },
      cta: null,
    },
    {
      id: "control",
      startSeconds: 1.4,
      endSeconds: 4.4,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "TAKE BACK THE SIGNAL", claimId: null },
      cta: null,
    },
    {
      id: "feature",
      startSeconds: 4.4,
      endSeconds: 7.6,
      kind: "clean_product",
      assetId: "clean-packshot",
      productVisible: true,
      overlay: {
        text: "ADAPTIVE NOISE CANCELLING",
        claimId: "adaptive-anc",
      },
      cta: null,
    },
    {
      id: "identity",
      startSeconds: 7.6,
      endSeconds: 10,
      kind: "human_context",
      assetId: "city-portrait",
      productVisible: true,
      overlay: { text: "YOUR CITY. YOUR VOLUME.", claimId: null },
      cta: null,
    },
    {
      id: "end-card",
      startSeconds: 10,
      endSeconds: 12,
      kind: "end_card",
      assetId: "clean-packshot",
      productVisible: true,
      overlay: { text: "NOVA ONE", claimId: null },
      cta: "DISCOVER NOVA ONE",
    },
  ],
} as const;

function makeClient(responseId = "resp_live_123") {
  const parse = vi.fn().mockResolvedValue({
    id: responseId,
    model: "gpt-5.6-terra",
    output_parsed: parsedSpec,
  });

  return {
    client: { responses: { parse } },
    parse,
  };
}

describe("compileCreativeSpecWithOpenAI", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the Responses API with the required live request shape and parsed output", async () => {
    const { client, parse } = makeClient();

    const result = await compileCreativeSpecWithOpenAI({
      evidence,
      platform: "instagram_reels",
      objective: "Make NOVA ONE desirable to city commuters",
      audience: "Design-conscious city commuters",
      callerId: "customer@example.com",
      client,
    });

    expect(parse).toHaveBeenCalledOnce();
    const request = parse.mock.calls[0][0];
    expect(request).toMatchObject({
      model: "gpt-5.6-terra",
      instructions: CREATIVE_DIRECTOR_SYSTEM_PROMPT,
      reasoning: { effort: "medium" },
      store: false,
      safety_identifier: expect.stringMatching(/^[a-f0-9]{64}$/),
      text: {
        format: {
          type: "json_schema",
          name: "creative_spec",
          strict: true,
        },
      },
    });
    expect(request.safety_identifier).not.toContain("customer@example.com");
    expect(request.input).toContain("Platform: instagram_reels");
    expect(request.input).toContain("Objective: Make NOVA ONE desirable");
    expect(request.input).toContain('"evidenceId":"nova-one-demo-v1"');
    expect(request.input).toContain('"id":"clean-packshot"');
    expect(request.text.format.schema.properties.sourceMode).toEqual({
      type: "string",
      const: "live_gpt_5_6",
    });
    expect(CREATIVE_DIRECTOR_SYSTEM_PROMPT).not.toMatch(/blocking note/i);
    expect(CREATIVE_DIRECTOR_SYSTEM_PROMPT).toMatch(/copy the evidence claim text/i);
    expect(CREATIVE_DIRECTOR_SYSTEM_PROMPT).toContain("supportedPromiseClaimId");
    expect(CREATIVE_DIRECTOR_SYSTEM_PROMPT).toMatch(/scene kind .* asset role/i);
    expect(CREATIVE_DIRECTOR_SYSTEM_PROMPT).toMatch(/final .* at least 1\.5 seconds/i);

    expect(result).toEqual({
      mode: "live",
      spec: parsedSpec,
      metadata: {
        provider: "openai",
        api: "responses",
        model: "gpt-5.6-terra",
        responseId: "resp_live_123",
      },
    });
  });

  it("derives a stable privacy-safe safety identifier from the caller", async () => {
    const first = makeClient("resp_first");
    const second = makeClient("resp_second");
    const input = {
      evidence,
      platform: "instagram_reels" as const,
      objective: "Make NOVA ONE desirable to city commuters",
      audience: "Design-conscious city commuters",
      callerId: "customer@example.com",
    };

    await compileCreativeSpecWithOpenAI({ ...input, client: first.client });
    await compileCreativeSpecWithOpenAI({ ...input, client: second.client });

    expect(first.parse.mock.calls[0][0].safety_identifier).toBe(
      second.parse.mock.calls[0][0].safety_identifier,
    );
    expect(first.parse.mock.calls[0][0].safety_identifier).not.toBe(
      input.callerId,
    );
  });

  it("never labels a fixture response as a live model result", async () => {
    const { client } = makeClient();
    client.responses.parse.mockResolvedValueOnce({
      id: "resp_fixture",
      model: "gpt-5.6-terra",
      output_parsed: { ...parsedSpec, sourceMode: "fixture" },
    });

    await expect(
      compileCreativeSpecWithOpenAI({
        evidence,
        platform: "instagram_reels",
        objective: "Make NOVA ONE desirable to city commuters",
        audience: "Design-conscious city commuters",
        callerId: "customer@example.com",
        client,
      }),
    ).rejects.toThrow(/live compiler returned a non-live creative spec/i);
  });

  it("rejects a schema-valid live response that is not grounded in the supplied evidence", async () => {
    const { client } = makeClient();
    client.responses.parse.mockResolvedValueOnce({
      id: "resp_ungrounded",
      model: "gpt-5.6-terra",
      output_parsed: {
        ...parsedSpec,
        supportedPromiseClaimId: "invented-claim",
      },
    });

    await expect(
      compileCreativeSpecWithOpenAI({
        evidence,
        platform: "instagram_reels",
        objective: "Make NOVA ONE desirable to city commuters",
        audience: "Design-conscious city commuters",
        callerId: "customer@example.com",
        client,
      }),
    ).rejects.toThrow(/claim "invented-claim" is missing/i);
  });

  it.each([
    ["platform", "tiktok", /platform does not match requested value/i],
    ["objective", "A different objective", /objective does not match requested value/i],
    ["audience", "A different audience", /audience does not match requested value/i],
  ] as const)("rejects a live response that changes requested %s", async (field, value, error) => {
    const { client } = makeClient();
    client.responses.parse.mockResolvedValueOnce({
      id: `resp_changed_${field}`,
      model: "gpt-5.6-terra",
      output_parsed: { ...parsedSpec, [field]: value },
    });

    await expect(
      compileCreativeSpecWithOpenAI({
        evidence,
        platform: "instagram_reels",
        objective: "Make NOVA ONE desirable to city commuters",
        audience: "Design-conscious city commuters",
        callerId: "customer@example.com",
        client,
      }),
    ).rejects.toThrow(error);
  });

  it("rejects a non-GPT-5.6 model override before making a provider call", async () => {
    const { client, parse } = makeClient();

    await expect(
      compileCreativeSpecWithOpenAI({
        evidence,
        platform: "instagram_reels",
        objective: "Make NOVA ONE desirable to city commuters",
        audience: "Design-conscious city commuters",
        callerId: "customer@example.com",
        client,
        model: "gpt-4.1",
      }),
    ).rejects.toThrow(/supported GPT-5\.6 model/i);
    expect(parse).not.toHaveBeenCalled();
  });

  it("fails with an exact error before creating the default client without an API key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(
      compileCreativeSpecWithOpenAI({
        evidence,
        platform: "instagram_reels",
        objective: "Make NOVA ONE desirable to city commuters",
        audience: "Design-conscious city commuters",
        callerId: "customer@example.com",
      }),
    ).rejects.toThrow(MISSING_OPENAI_API_KEY_ERROR);
  });
});
