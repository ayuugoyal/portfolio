import { describe, expect, it } from "vitest";
import { matchArmIntent, parseLocal } from "./parse";

describe("parseLocal (port of commands.py parse_local)", () => {
    it.each([
        ["wave", "wave"],
        ["hello there", "wave"],
        ["hi", "wave"],
        ["nod", "nod"],
        ["yes", "nod"],
        ["shake your head", "shake"],
        ["look around", "look_around"],
        ["do the garba", "garba"],
        ["dance", "garba"],
        ["face me", "face_me"],
        ["open", "open"],
        ["close the gripper", "close"],
        ["rest", "rest"],
        ["get ready", "ready"],
        ["left", "left"],
        ["turn right", "right"],
        ["go up", "up"],
        ["down", "down"],
        ["stop", "stop"],
        ["release", "release"],
        ["start teleop", "teleop"],
        ["pick up the cube", "pick_cube"],
        ["grab the cube", "pick_cube"],
        ["raise your hand", "hand_up"],
        ["status", "status"],
        ["list poses", "list_poses"],
    ])("%s -> %s", (text, intent) => {
        const p = parseLocal(text);
        expect(p?.intent).toBe(intent);
        expect(p?.multi).toBe(false);
    });

    it("understands Hindi and Hinglish", () => {
        expect(parseLocal("हाथ हिलाओ")?.intent).toBe("wave");
        expect(parseLocal("नमस्ते")?.intent).toBe("wave");
        expect(parseLocal("रुको")?.intent).toBe("stop");
        expect(parseLocal("ruk jao")?.intent).toBe("stop");
        expect(parseLocal("garba karo")?.intent).toBe("garba");
        expect(parseLocal("meri taraf dekho")?.intent).toBe("face_me");
        expect(parseLocal("so jao")?.intent).toBe("rest");
        expect(parseLocal("नीचे")?.intent).toBe("down");
        expect(parseLocal("baaye")?.intent).toBe("left");
    });

    it("reads numbers as repeats or degrees", () => {
        expect(parseLocal("wave 5 times")?.actions).toEqual([{ type: "gesture", name: "wave", repeats: 5 }]);
        expect(parseLocal("nod 2x")?.actions).toEqual([{ type: "gesture", name: "nod", repeats: 2 }]);
        expect(parseLocal("नाचो 2 बार")?.actions).toEqual([{ type: "gesture", name: "garba", repeats: 2 }]);
        expect(parseLocal("garba 6 baar")?.actions).toEqual([{ type: "gesture", name: "garba", repeats: 6 }]);
        expect(parseLocal("left 200")?.actions).toEqual([{ type: "nudge", joint: "shoulder_pan", deg: 200 }]);
        expect(parseLocal("right 30")?.actions).toEqual([{ type: "nudge", joint: "shoulder_pan", deg: -30 }]);
        expect(parseLocal("down 10")?.actions).toEqual([{ type: "nudge", joint: "shoulder_lift", deg: -10 }]);
    });

    it("uses the original defaults (n || default)", () => {
        expect(parseLocal("wave")?.actions).toEqual([{ type: "gesture", name: "wave", repeats: 3 }]);
        expect(parseLocal("garba")?.actions).toEqual([{ type: "gesture", name: "garba", repeats: 4 }]);
        expect(parseLocal("wave 0 times")?.actions).toEqual([{ type: "gesture", name: "wave", repeats: 3 }]);
        expect(parseLocal("left")?.actions).toEqual([{ type: "nudge", joint: "shoulder_pan", deg: 15 }]);
        expect(parseLocal("up")?.actions).toEqual([{ type: "nudge", joint: "shoulder_lift", deg: 15 }]);
        expect(parseLocal("open")?.actions).toEqual([{ type: "gripper", open: 90 }]);
        expect(parseLocal("close")?.actions).toEqual([{ type: "gripper", open: 5 }]);
        expect(parseLocal("face me")?.actions).toEqual([{ type: "pose", name: "face_me" }]);
    });

    it("keeps the original replies", () => {
        expect(parseLocal("wave")?.reply).toBe("Waving!");
        expect(parseLocal("garba")?.reply).toBe("Garba time!");
        expect(parseLocal("stop")?.reply).toBe("Stopping.");
    });

    it("flags two different movement intents, but stop wins outright", () => {
        const p = parseLocal("wave and then open the gripper");
        expect(p?.intent).toBe("wave");
        expect(p?.multi).toBe(true);
        expect(p?.hits).toEqual(["wave", "open"]);
        const s = parseLocal("stop waving and open");
        expect(s?.intent).toBe("stop");
        expect(s?.multi).toBe(false);
        expect(parseLocal("hello, wave")?.multi).toBe(false); // same intent twice
    });

    it("does not read the words inside 'pick up the cube' as up/close", () => {
        expect(parseLocal("pick up the cube")?.hits).toEqual(["pick_cube"]);
        expect(parseLocal("raise your hand")?.hits).toEqual(["hand_up"]);
    });

    it("returns null for unknown text", () => {
        expect(parseLocal("fly to the moon")).toBeNull();
        expect(parseLocal("")).toBeNull();
    });
});

describe("matchArmIntent", () => {
    it("loose mode is parse_local's intent", () => {
        expect(matchArmIntent("hi")).toBe("wave");
        expect(matchArmIntent("turn right")).toBe("right");
        expect(matchArmIntent("what's for lunch")).toBeNull();
    });

    it.each([
        ["wave", "wave"],
        ["wave at me", "wave"],
        ["do the garba", "garba"],
        ["dance", "garba"],
        ["nod", "nod"],
        ["shake your head", "shake"],
        ["look around", "look_around"],
        ["pick up the cube", "pick_cube"],
        ["face me", "face_me"],
        ["raise your hand", "hand_up"],
        ["arm, rest", "rest"],
        ["robot go to sleep", "rest"],
        ["make the robot stand up", "ready"],
        ["stop the arm", "stop"],
        ["हाथ हिलाओ", "wave"],
    ])("strict: %s -> %s", (text, intent) => {
        expect(matchArmIntent(text, { strict: true })).toBe(intent);
    });

    it.each([
        "is he open to remote work?",
        "hi",
        "hey there",
        "yes",
        "right",
        "open",
        "rest",
        "ready",
        "stop",
        "the robot is interesting",
        "how do nodes work",
        "a microwave",
        "what's up",
        "tell me about the rover",
    ])("strict: %s -> null", (text) => {
        expect(matchArmIntent(text, { strict: true })).toBeNull();
    });
});
