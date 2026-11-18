import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Intent } from "@/lib/arm/types";
import { EXPERIENCE, PATENT, PROJECTS, SITE } from "@/lib/site";
import { FORBIDDEN, INTERNAL_LINKS, META_TEXT, answer, sentences, type MatchContext, type Reply } from "./matcher";

/** Stand-in for matchArmIntent(t, { strict: true }): only unambiguous arm words. */
const fakeMatchArm = (t: string): Intent | null => {
    const s = t.toLowerCase();
    if (/\bgarba\b/.test(s)) return "garba";
    if (/\bwave\b/.test(s)) return "wave";
    if (/\bnod\b/.test(s)) return "nod";
    if (/\barm\b/.test(s)) return "status"; // deliberately greedy: the gate must still refuse questions
    return null;
};

const withArm: MatchContext = { armAvailable: true, matchArm: fakeMatchArm };
const noArm: MatchContext = { armAvailable: false, matchArm: fakeMatchArm };

const ask = (t: string, ctx = noArm) => {
    const r = answer(t, ctx);
    expect(r).not.toBeNull();
    return r as Reply;
};
const hrefs = (r: Reply) => r.links.map((l) => l.href);
const all = (r: Reply) => `${r.text} ${hrefs(r).join(" ")}`;

describe("intents", () => {
    const cases: [string, string[], (r: Reply) => void][] = [
        ["greeting", ["hi", "hello there", "hey bot"], (r) => expect(r.chips).toBeDefined()],
        [
            "meta",
            ["are you real?", "are you an AI", "is this chatgpt?", "are you claude"],
            (r) => {
                expect(r.kind).toBe("meta");
                expect(r.text).toBe(META_TEXT);
            },
        ],
        ["about", ["who is ayush?", "tell me about him", "who is he"], (r) => expect(r.text).toContain(SITE.name)],
        [
            "fde",
            ["fde", "what is a forward deployed engineer?", "explain forward deployed work"],
            (r) => expect(hrefs(r)).toContain("/forward-deployed-engineer"),
        ],
        [
            "hire",
            ["hire", "can I hire him?", "how do I contact ayush", "is he available for freelance work"],
            (r) => {
                expect(hrefs(r)).toContain(SITE.booking);
                expect(hrefs(r)).toContain(`mailto:${SITE.email}`);
            },
        ],
        [
            "pricing",
            ["how much does he charge?", "what are his rates", "pricing"],
            (r) => {
                expect(hrefs(r)).toContain(SITE.booking);
                expect(r.text).not.toMatch(/[$₹€£]\s?\d|\d+\s?(usd|inr|\/h)/i);
            },
        ],
        ["resume", ["resume", "can I see his CV?", "where is his resume"], (r) => expect(hrefs(r)).toContain("/resume")],
        [
            "experience",
            ["what's his experience?", "where has he worked", "career history"],
            (r) => {
                expect(hrefs(r)).toContain("/#work-experience");
                expect(r.text).toContain(SITE.employer.name);
            },
        ],
        ["skills", ["what are his skills", "tech stack?", "which languages does he use"], (r) => expect(r.text).toMatch(/Python/)],
        ["services", ["what services do you offer", "what can he do for us?"], (r) => expect(hrefs(r)).toContain("/services")],
        [
            "projects",
            ["show me his projects", "portfolio", "what has he shipped?"],
            (r) => expect(r.text).toMatch(/SiteOS/),
        ],
        [
            "robots",
            ["robots", "what robots did he build?", "tell me about the robotics work", "what arm did he build?"],
            (r) => {
                expect(hrefs(r)).toContain("/robotics");
                expect(r.text).toMatch(/SO-101/);
            },
        ],
        [
            "patent",
            ["does he have a patent?", "design registration", "patents"],
            (r) => {
                expect(r.text).toContain(PATENT.number);
                expect(hrefs(r)).toContain(PATENT.url);
            },
        ],
        [
            "open source",
            ["open source?", "has he contributed to open-source", "bounties"],
            (r) => {
                expect(r.text).toContain("archestra");
                expect(r.text).toContain("$400");
            },
        ],
        ["location", ["where is he based", "what timezone"], (r) => expect(r.text).toContain("India")],
        ["socials", ["github", "is he on linkedin", "socials"], (r) => expect(hrefs(r)).toContain(SITE.socials.github)],
        ["thanks", ["thanks!", "thank you", "bye"], (r) => expect(hrefs(r)).toContain(SITE.booking)],
    ];

    for (const [name, phrasings, check] of cases) {
        it(name, () => {
            for (const p of phrasings) {
                const r = ask(p);
                try {
                    check(r);
                } catch (e) {
                    throw new Error(`"${p}" -> ${JSON.stringify(r)}\n${(e as Error).message}`);
                }
            }
        });
    }

    it("answers a specific FAQ near-verbatim", () => {
        const r = ask("what robotics stack do you use?");
        expect(r.text).toMatch(/ROS2 Humble/);
    });

    it("per-project queries", () => {
        const siteos = ask("tell me about siteos");
        expect(siteos.text).toMatch(/^SiteOS/);
        expect(hrefs(siteos)).toContain("/forward-deployed-engineer#deployed");
        expect(ask("what is the rover?").text).toMatch(/Raftaar/);
        expect(hrefs(ask("tell me about the so-101"))).toContain("/robotics#so101-claude-code");
        expect(ask("lawgpt").text).toMatch(/LawGPT/);
        // every project is reachable by its own title
        for (const p of PROJECTS) expect(ask(`tell me about ${p.title}`).text).toContain(p.title);
    });

    it("per-company queries", () => {
        expect(ask("what does he do at TAP Innovations?").text).toMatch(/TAP Innovations/);
        expect(ask("loadshare").text).toMatch(/Loadshare/);
        for (const j of EXPERIENCE.filter((e) => e.company !== "Freelance"))
            expect(ask(`what did he do at ${j.company}`).text).toContain(j.company);
    });

    it("named skills", () => {
        expect(ask("does he know langgraph").text).toMatch(/LangGraph/);
    });
});

describe("arm gate", () => {
    it("forwards short commands when the arm is on the page", () => {
        for (const t of ["wave", "do the garba", "wave 3 times", "nod please"]) {
            const r = ask(t, withArm);
            expect(r.kind).toBe("arm");
            expect(r.text).toBe(t);
        }
    });

    it("points elsewhere when there is no arm", () => {
        for (const t of ["wave", "do the garba", "wave 3 times"]) {
            const r = ask(t, noArm);
            expect(r.kind).toBe("arm-elsewhere");
            expect(hrefs(r)).toContain("/#arm");
        }
    });

    it("never treats questions or long sentences as commands", () => {
        for (const t of [
            "is he open to remote work?",
            "what arm did he build?",
            "can the arm wave",
            "tell me about the arm",
            "i would love to see the robot arm wave at me",
        ]) {
            const r = ask(t, withArm);
            expect(r.kind, t).not.toBe("arm");
            expect(r.kind, t).not.toBe("arm-elsewhere");
        }
    });
});

describe("fallback and limits", () => {
    it("gibberish falls back with chips and booking", () => {
        for (const t of ["asdkjh qwe", "zzzz", "purple monkey dishwasher"]) {
            const r = ask(t);
            expect(r.kind).toBe("fallback");
            expect(r.chips).toEqual(["robots", "fde", "hire", "resume"]);
            expect(hrefs(r)).toContain(SITE.booking);
        }
    });

    it("empty input is null", () => {
        expect(answer("", noArm)).toBeNull();
        expect(answer("   ", noArm)).toBeNull();
        expect(answer("?!", noArm)).toBeNull();
    });

    const corpus = [
        "hi",
        "are you real",
        "who is ayush",
        "fde",
        "hire",
        "pricing",
        "resume",
        "experience",
        "skills",
        "services",
        "projects",
        "robots",
        "patent",
        "open source",
        "location",
        "github",
        "thanks",
        "does he know python",
        "can you build voice agents that speak hindi and english",
        "what does a typical engagement look like",
        "random words here",
        ...PROJECTS.map((p) => `tell me about ${p.title}`),
        ...EXPERIENCE.map((e) => `what did he do at ${e.company}`),
    ];

    it("replies are at most 3 sentences", () => {
        for (const t of corpus) {
            const r = ask(t);
            expect(sentences(r.text).length, `${t} -> ${r.text}`).toBeLessThanOrEqual(3);
            expect(r.text.length, t).toBeGreaterThan(0);
        }
    });

    it("never mentions degrees or beginner words", () => {
        for (const t of corpus) expect(all(ask(t)), t).not.toMatch(FORBIDDEN);
    });

    it("internal links are all real routes / anchors", () => {
        for (const href of INTERNAL_LINKS) {
            const path = href.split("#")[0];
            const page = join(process.cwd(), "src", "app", ...path.split("/").filter(Boolean), "page.tsx");
            expect(existsSync(page), href).toBe(true);
        }
        for (const t of [...corpus, "wave"]) {
            for (const h of hrefs(ask(t))) {
                if (h.startsWith("/")) expect(INTERNAL_LINKS as readonly string[], `${t} -> ${h}`).toContain(h);
                else expect(h, t).toMatch(/^(https:\/\/|mailto:)/);
            }
        }
    });
});
