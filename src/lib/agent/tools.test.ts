import { describe, expect, it } from "vitest";
import { buildParams, finalizeContent } from "./run";
import { TOOL_DEFS, validateToolInput } from "./tools";

describe("tool set", () => {
    it("matches the real MCP server's tools", () => {
        expect(TOOL_DEFS.map((t) => t.name)).toEqual([
            "status",
            "move_joints",
            "nudge",
            "gripper",
            "go_to_pose",
            "save_pose",
            "list_poses",
            "gesture",
            "release",
            "look",
        ]);
    });
});

describe("validateToolInput", () => {
    it("accepts well-formed calls in the engine's shape", () => {
        expect(validateToolInput("gesture", { name: "wave", repeats: 2 })).toEqual({
            ok: true,
            call: { tool: "gesture", args: { name: "wave", repeats: 2 } },
        });
        expect(validateToolInput("move_joints", { shoulder_pan: 28, gripper: 90, speed: 20 }).ok).toBe(true);
        expect(validateToolInput("status", {}).ok).toBe(true);
        expect(validateToolInput("look", { camera: 1 }).ok).toBe(true);
        // null means "omitted"
        expect(validateToolInput("move_joints", { shoulder_pan: null, elbow_flex: 5 })).toEqual({
            ok: true,
            call: { tool: "move_joints", args: { elbow_flex: 5 } },
        });
    });

    it.each([
        ["unknown tool", "bash", {}],
        ["array input", "status", []],
        ["string input", "status", "{}"],
        ["extra argument", "status", { force: true }],
        ["missing required", "gripper", {}],
        ["string number", "gripper", { percent_open: "90" }],
        ["NaN-ish", "move_joints", { shoulder_pan: 1e9 }],
        ["zero speed", "move_joints", { shoulder_pan: 1, speed: 0 }],
        ["float repeats", "gesture", { name: "wave", repeats: 2.5 }],
        ["unknown gesture", "gesture", { name: "moonwalk" }],
        ["pose name with symbols", "go_to_pose", { name: "../../etc" }],
        ["long pose name", "save_pose", { name: "x".repeat(40) }],
    ])("rejects %s", (_n, name, input) => {
        expect(validateToolInput(name, input).ok).toBe(false);
    });
});

describe("request params", () => {
    const msgs = [{ role: "user" as const, text: "hi", surface: "chat" as const, arm: false, page: "/" }];

    it("caches tools + system, streams tool input eagerly, opts into fallback on Opus 5.5", () => {
        const p = buildParams("claude-opus-5-5", msgs);
        const system = p.system as { cache_control?: unknown }[];
        expect(system).toHaveLength(1);
        expect(system[0].cache_control).toEqual({ type: "ephemeral" });
        expect(p.cache_control).toEqual({ type: "ephemeral" });
        expect(p.tools?.every((t) => (t as { eager_input_streaming?: boolean }).eager_input_streaming)).toBe(true);
        expect(p.tool_choice).toEqual({ type: "auto" });
        expect(p.fallbacks).toBe("default");
        expect(p.betas).toContain("server-side-fallback-2026-07-01");
        expect(p.output_config).toEqual({ effort: "low" });
        expect(p.max_tokens).toBe(1536);
        expect((p as { temperature?: unknown }).temperature).toBeUndefined();
        expect((p.thinking as { type: string }).type).toBe("adaptive");
        // identical prefix bytes for two requests
        expect(JSON.stringify([p.tools, p.system])).toBe(JSON.stringify([buildParams("claude-opus-5-5", msgs).tools, buildParams("claude-opus-5-5", msgs).system]));
    });

    it("gives a JD report more room, and leaves fallback off other models", () => {
        const p = buildParams("claude-opus-5-5", [{ ...msgs[0], jd: true }]);
        expect(p.max_tokens).toBe(3072);
        expect(p.output_config).toEqual({ effort: "medium" });
        const h = buildParams("claude-haiku-5-5", msgs);
        expect(h.fallbacks).toBeUndefined();
        expect(h.betas).toBeUndefined();
    });
});

describe("finalizeContent", () => {
    const tool = { type: "tool_use", id: "toolu_1", name: "gesture", input: { name: "wave" } } as const;
    const text = (t: string) => ({ type: "text", text: t, citations: null }) as const;
    const thinking = { type: "thinking", thinking: "", signature: "sig" } as const;
    type Msg = Parameters<typeof finalizeContent>[0];
    const msg = (content: unknown[], stop_reason: string) => ({ content, stop_reason }) as unknown as Msg;

    it("keeps text + tool_use and drops thinking on a tool turn", () => {
        expect(finalizeContent(msg([thinking, text("Waving."), tool], "tool_use"))).toEqual({
            stop: "tool_use",
            content: [{ type: "text", text: "Waving." }, { type: "tool_use", id: "toolu_1", name: "gesture", input: { name: "wave" } }],
        });
    });

    it("never returns a tool call cut off by max_tokens, and discards a refusal", () => {
        expect(finalizeContent(msg([text("Wav"), tool], "max_tokens"))).toEqual({ stop: "max_tokens", content: [{ type: "text", text: "Wav" }] });
        expect(finalizeContent(msg([text("partial"), tool], "refusal"))).toEqual({ stop: "refusal", content: [] });
    });

    it("after a mid-output fallback keeps earlier text only", () => {
        const fb = { type: "fallback", from: { model: "a" }, to: { model: "b" } };
        const r = finalizeContent(msg([text("Hi "), { ...tool, id: "toolu_0" }, fb, text("there"), tool], "tool_use"));
        expect(r.content.map((b) => (b.type === "tool_use" ? b.id : b.text))).toEqual(["Hi ", "there", "toolu_1"]);
    });
});
