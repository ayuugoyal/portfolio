/**
 * The mascot's scripted brain. Pure TS: maps a typed question to a short reply built only from
 * src/lib/site.ts. No API, nothing leaves the browser.
 *
 * Pipeline: normalize -> arm gate -> small talk -> named things (projects, companies)
 *           -> strong FAQ match -> topic rules (+ named skills) -> FAQ token overlap -> fallback.
 */
import type { Intent } from "@/lib/arm/types";
import {
    EXPERIENCE,
    FAQS,
    OPEN_SOURCE,
    PATENT,
    PROJECTS,
    SERVICES,
    SITE,
    SKILLS,
    type Project,
} from "@/lib/site";

export type ReplyKind = "answer" | "fallback" | "arm" | "arm-elsewhere" | "meta";
export type ReplyLink = { label: string; href: string };
export type Reply = { kind: ReplyKind; text: string; links: ReplyLink[]; chips?: string[] };

export type MatchContext = {
    /** an arm is mounted on this page (getArm() !== null) */
    armAvailable: boolean;
    /** strict arm intent matcher, i.e. (t) => matchArmIntent(t, { strict: true }) */
    matchArm: (text: string) => Intent | null;
};

export const CHIPS = ["robots", "fde", "hire", "resume"];

/**
 * Every internal link a reply may carry: real routes plus section ids that exist on those pages
 * (`/#arm` is the arm section id the integrator adds on home and /robotics).
 */
export const INTERNAL_LINKS = [
    "/",
    "/#arm",
    "/#work",
    "/#work-experience",
    "/#open-source",
    "/forward-deployed-engineer",
    "/forward-deployed-engineer#deployed",
    "/robotics",
    "/robotics#so101-claude-code",
    "/robotics#raftaar-rover",
    "/services",
    "/resume",
    PATENT.url,
] as const;

export const FORBIDDEN = /degree|university|college|b\.?tech|student|beginner|fresher|aspiring/i;
const QUESTION_START =
    /^(who|what|whats|how|is|does|can|where|when|why|tell|which|did|are|could|would|should|has|have|will)\b/;

const BOOKING: ReplyLink = { label: "book a scope call", href: SITE.booking };
const EMAIL: ReplyLink = { label: SITE.email, href: `mailto:${SITE.email}` };

// ─── text helpers ───────────────────────────────────────────────────────────────────────────────

export function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[’‘`]/g, "'")
        .replace(/'s\b/g, "")
        .replace(/[^a-z0-9+#\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Sentence split that leaves "2.2 m", "i.e. foo" and "cal.com" alone. */
export function sentences(text: string): string[] {
    return text
        .split(/(?<=[.!?])\s+(?=[A-Z0-9$"(])/)
        .map((s) => s.trim())
        .filter(Boolean);
}

/** At most `n` sentences, dropping any that would mislabel Ayush (degrees, "beginner" words). */
function clip(text: string, n = 3): string {
    return sentences(text)
        .filter((s) => !FORBIDDEN.test(s))
        .slice(0, n)
        .join(" ");
}

const firstSentence = (text: string) => sentences(text).find((s) => !FORBIDDEN.test(s)) ?? "";

const withPeriod = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

/** Lower-case a leading plain word ("Natural" -> "natural") but leave "MCP" or "ArduPilot" alone. */
const lowerFirst = (s: string) =>
    /^[A-Z][a-z]+\b/.test(s) && !/^[A-Z][a-z]+[A-Z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s;

function list(items: string[]): string {
    if (items.length <= 1) return items.join("");
    return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Whole-phrase match on normalized text. */
function has(text: string, phrase: string): boolean {
    if (!phrase) return false;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(text);
}

const reply = (text: string, links: ReplyLink[] = [], chips?: string[]): Reply => ({
    kind: "answer",
    text: clip(text),
    links,
    ...(chips ? { chips } : {}),
});

const shortTitle = (p: Project) => p.title.split(/ [—×-] /)[0];

// ─── generated intents: projects, companies, skills ─────────────────────────────────────────────

/** Extra ways people name a project; matching keys only, never facts. */
const PROJECT_ALIASES: Record<string, string[]> = {
    "machine-maintenance-bot": ["maintenance bot", "machine maintenance", "factory bot"],
    siteos: ["siteos", "site os"],
    "nbc-whatsapp-assistant": ["nbc", "building code"],
    "sensor-dash": ["sensor dash", "sensor server"],
    "lead-enrichment-tool": ["lead enrichment"],
    "cold-outreach-engine": ["cold outreach", "cold email"],
    "ai-devops-agent": ["devops agent", "devops"],
    "slack-claude": ["slack claude"],
    quickdocs: ["quickdocs", "quick docs"],
    "chatter-ai": ["chatter ai", "chatterai", "chatter"],
    lawgpt: ["lawgpt", "law gpt"],
    "so101-claude-code": ["so101", "so 101", "claude code arm"],
    "raftaar-rover": ["raftaar", "rover"],
    "bcn3d-moveo": ["bcn3d", "moveo"],
    "scara-robot": ["scara"],
    "ardupilot-assistant": ["ardupilot assistant", "ardupilot"],
    "pneumatic-gripper": ["gripper", "pneumatic"],
};

function projectKeys(p: Project): string[] {
    const keys = [normalize(shortTitle(p)), normalize(p.slug.replace(/-/g, " ")), ...(PROJECT_ALIASES[p.slug] ?? [])];
    return Array.from(new Set(keys.filter((k) => k.length >= 3)));
}

function projectLinks(p: Project): ReplyLink[] {
    const links: ReplyLink[] = [];
    const anchored = `/robotics#${p.slug}`;
    if ((INTERNAL_LINKS as readonly string[]).includes(anchored)) links.push({ label: "/robotics", href: anchored });
    else if (p.category === "Freelance FDE Deployments")
        links.push({ label: "deployments", href: "/forward-deployed-engineer#deployed" });
    else if (p.href?.startsWith("/")) links.push({ label: p.href, href: p.href });
    else if (p.featured) links.push({ label: "selected work", href: "/#work" });
    for (const l of p.links) {
        if (l.href.startsWith("http")) links.push({ label: l.type.toLowerCase(), href: l.href });
    }
    if (p.href?.startsWith("http") && !links.some((l) => l.href === p.href))
        links.push({ label: "project", href: p.href });
    return links.slice(0, 3);
}

function projectReply(p: Project): Reply {
    const desc = sentences(p.description).filter((s) => !FORBIDDEN.test(s));
    // The blurb already restates the description's opening line, so follow it with the second one.
    const text = p.blurb
        ? `${p.title}: ${withPeriod(p.blurb)} ${desc[1] ?? ""}`
        : `${p.title}: ${desc.slice(0, 2).join(" ")}`;
    return reply(text.trim(), projectLinks(p));
}

const COMPANY_ALIASES: Record<string, string[]> = {
    "TAP Innovations": ["tap", "tapinnov"],
    "Data Alt Dynamics": ["data alt"],
    "Physics Wallah": ["pw", "physicswallah"],
    "Bharat Electronics Limited": ["bel", "bharat electronics"],
    "Loadshare Networks": ["loadshare"],
};

type Job = (typeof EXPERIENCE)[number];
const jobEnd = (j: Job) => ("end" in j && j.end ? j.end : "now");
const isCurrent = (j: Job) => "current" in j && Boolean(j.current);

function companyKeys(j: Job): string[] {
    if (j.company === "Freelance") return [];
    return [normalize(j.company), ...(COMPANY_ALIASES[j.company] ?? [])];
}

function companyReply(j: Job): Reply {
    const head = `${j.title} at ${j.company}, ${j.start} – ${jobEnd(j)}.`;
    const detail = firstSentence(j.description);
    const dates = jobEnd(j) === "now" ? `Since ${j.start}.` : `${j.start} – ${jobEnd(j)}.`;
    const links: ReplyLink[] = [{ label: "experience", href: "/#work-experience" }];
    if (j.href.startsWith("http")) links.push({ label: j.company, href: j.href });
    // Some descriptions already open with "<title> at <company>, ..."
    if (detail.startsWith(j.title)) return reply(`${detail} ${dates}`, links);
    return reply(detail ? `${head} ${detail}` : head, links);
}

/** Skills matched by name ("does he know python"); short names like "Go" or "v0" are skipped. */
const SKILL_INDEX = SKILLS.flatMap((g) =>
    g.skills.map((s) => ({ skill: s, category: g.category, key: normalize(s.replace(/\(.*?\)/g, "")) })),
).filter((s) => s.key.length >= 3);

// ─── fixed intents ──────────────────────────────────────────────────────────────────────────────

const faq = (group: keyof typeof FAQS, q: RegExp) => FAQS[group].find((f) => q.test(f.q));

function aboutReply(): Reply {
    const who = faq("general", /who is/i);
    return reply(who ? who.a : SITE.tagline, [{ label: "home", href: "/" }]);
}

function fdeReply(): Reply {
    const what = faq("fde", /what is a forward deployed/i);
    const def = what ? sentences(what.a).slice(0, 2).join(" ") : "";
    return reply(`${def} Ayush is ${SITE.availability.toLowerCase()}.`, [
        { label: "fde page", href: "/forward-deployed-engineer" },
        BOOKING,
    ]);
}

function hireReply(): Reply {
    return reply(
        `${SITE.availability} (${SITE.location}). The fastest way in is a free scope call; email works too.`,
        [BOOKING, EMAIL],
    );
}

function pricingReply(): Reply {
    return reply(
        "There is no rate card here: scope decides. Book a free scope call, describe what you want shipped, and get a straight answer on what it would take.",
        [BOOKING, EMAIL],
    );
}

function resumeReply(): Reply {
    return reply("The resume page has the full picture.", [{ label: "/resume", href: "/resume" }]);
}

function experienceReply(): Reply {
    const role = (j: Job) => (j.company === "Freelance" ? `freelance ${j.title}` : `${j.title} at ${j.company}`);
    const now = EXPERIENCE.filter(isCurrent).map(role);
    const before = EXPERIENCE.filter((j) => !isCurrent(j)).slice(0, 2).map(role);
    return reply(`Right now: ${list(now)}.${before.length ? ` Before that: ${list(before)}.` : ""}`, [
        { label: "experience", href: "/#work-experience" },
        { label: "/resume", href: "/resume" },
    ]);
}

function robotsReply(): Reply {
    const robots = PROJECTS.filter((p) => p.category === "Robots & Physical AI");
    const stars = robots.filter((p) => p.loop);
    const rest = robots.filter((p) => !p.loop).map(shortTitle);
    const lead = stars.length
        ? `Ayush takes freelance robotics work and builds his own robots. Headliners: ${stars.map((p) => lowerFirst(p.blurb ?? p.title)).join("; ")}.`
        : "Ayush takes freelance robotics work and builds his own robots.";
    return reply(`${lead}${rest.length ? ` Also built: ${list(rest)}.` : ""}`, [
        { label: "/robotics", href: "/robotics" },
    ]);
}

function skillsReply(): Reply {
    const langs = SKILLS.find((g) => /language/i.test(g.category));
    const cats = SKILLS.map((g) => g.category).filter((c) => !/language/i.test(c));
    return reply(
        `Skill areas: ${cats.slice(0, 5).join(", ")} and more.${langs ? ` Languages: ${list(langs.skills)}.` : ""}`,
        [
            { label: "/services", href: "/services" },
            { label: "/resume", href: "/resume" },
        ],
    );
}

function servicesReply(): Reply {
    return reply(`What he ships: ${SERVICES.slice(0, 5).map((s) => s.title).join(", ")} and more.`, [
        { label: "/services", href: "/services" },
    ]);
}

function projectsReply(): Reply {
    const featured = PROJECTS.filter((p) => p.featured);
    return reply(
        `Selected work: ${list(featured.map((p) => `${p.title} (${p.blurb ?? p.category})`))}. ${PROJECTS.length} projects in all.`,
        [
            { label: "selected work", href: "/#work" },
            { label: "/robotics", href: "/robotics" },
        ],
    );
}

function patentReply(): Reply {
    return reply(`${PATENT.summary} Registered as UK Design ${PATENT.number}, granted ${PATENT.granted}.`, [
        { label: `design ${PATENT.number}`, href: PATENT.url },
        { label: "official record", href: PATENT.official },
    ]);
}

function openSourceReply(): Reply {
    const repos = OPEN_SOURCE.map((o) => `${o.title} (${o.prs.length} PR${o.prs.length === 1 ? "" : "s"})`);
    const bounty = OPEN_SOURCE.map((o) => ({ o, s: sentences(o.summary).find((s) => /bount/i.test(s)) })).find(
        (b) => b.s,
    );
    return reply(`Open source: ${list(repos)}.${bounty ? ` On ${bounty.o.title}: ${lowerFirst(bounty.s!)}` : ""}`, [
        { label: "open source", href: "/#open-source" },
        ...OPEN_SOURCE.slice(0, 2).map((o) => ({ label: o.title, href: o.repo })),
    ]);
}

function locationReply(): Reply {
    return reply(`${SITE.location}. ${SITE.availability}.`, [BOOKING]);
}

function socialsReply(): Reply {
    return reply(`Ayush is ${SITE.handle} on GitHub, LinkedIn and X.`, [
        { label: "github", href: SITE.socials.github },
        { label: "linkedin", href: SITE.socials.linkedin },
        { label: "x", href: SITE.socials.x },
    ]);
}

export const META_TEXT = "I'm a small scripted bot running in your browser; nothing you type is sent anywhere.";

type Rule = { test: RegExp; reply: () => Reply };

/** Topic rules, checked in order. Named skills ("does he know python") are checked between the two lists. */
const TOPIC_RULES: Rule[] = [
    { test: /\b(patent|patents|design registration|registered design|6450987|invention)\b/, reply: patentReply },
    {
        test: /\b(open ?source|oss|contribut\w*|bount(y|ies)|archestra|bolna|pull requests?|prs?)\b/,
        reply: openSourceReply,
    },
    {
        test: /\b(price|prices|pricing|cost|costs|rate|rates|charge|charges|fee|fees|budget|how much|hourly|quote|salary)\b/,
        reply: pricingReply,
    },
    { test: /\b(resume|cv|curriculum vitae)\b/, reply: resumeReply },
    {
        test: /\b(hire|hiring|contact|reach|email|e mail|available|availability|book|booking|call|meeting|work with|engagement|engagements|open to|freelance|get in touch)\b/,
        reply: hireReply,
    },
    {
        test: /\b(robots?|robotics|robotic|arms?|lidar|ros ?2?|hardware|physical ai|drones?|embedded)\b/,
        reply: robotsReply,
    },
    {
        test: /\b(experience|worked|work history|jobs?|career|companies|company|employer|employed|day job|current role|works at|work at)\b/,
        reply: experienceReply,
    },
    { test: /\b(fde|forward deployed|forward deploy|deployed engineer|embed|embeds)\b/, reply: fdeReply },
    {
        test: /\b(services?|offer|offers|offering|what can (he|you) (do|build)|help (us|me|with)|deliverables?)\b/,
        reply: servicesReply,
    },
];

const LATE_RULES: Rule[] = [
    { test: /\b(skills?|stack|tech|technologies|languages?|tools|frameworks?|good at)\b/, reply: skillsReply },
    { test: /\b(projects?|portfolio|built|build|builds|shipped|work samples?|made)\b/, reply: projectsReply },
    { test: /\b(socials?|github|linkedin|twitter|x com|follow|handle|profiles?)\b/, reply: socialsReply },
    {
        test: /\b(where|location|based|country|india|timezone|time zone|remote|relocate|located|lives?)\b/,
        reply: locationReply,
    },
    { test: /\b(who|about (him|ayush)|ayush|introduce|bio|yourself)\b/, reply: aboutReply },
];

const GREETING =
    /^(hi+|hello+|hey+|yo|hola|namaste|sup|heya|howdy|hiya|good (morning|afternoon|evening))( (there|bot|buddy|friend|robot|ayush|again|you))*$/;
const THANKS = /\b(thanks|thank you|thx|ty|cheers|bye|goodbye|see ya|cya)\b/;
const META =
    /\b(are you (real|a bot|an? ai|human|a human|a robot|a person|alive|chatgpt|claude|gpt|an llm|ayush)|you a bot|is this (an? )?(ai|bot|chatgpt|gpt|llm|claude|real|real person)|who (made|built|are) you|what are you|do you send|is this sent|is anything sent|privacy|track(ing)? me|are you recording)\b/;

// ─── FAQ overlap ────────────────────────────────────────────────────────────────────────────────

const STOP = new Set(
    "a an the is are was were be been do does did can could would should will you your yours he him his i me my we us our it its this that these those to of for and or in on at by with about as from what how who whom which why when where tell please ayush goyal there any some have has had just so if not no yes really".split(
        " ",
    ),
);

const tokens = (t: string) =>
    normalize(t)
        .split(" ")
        .filter((w) => w.length > 1 && !STOP.has(w))
        .map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));

const FAQ_LINKS: Record<keyof typeof FAQS, ReplyLink[]> = {
    fde: [{ label: "fde page", href: "/forward-deployed-engineer" }, BOOKING],
    general: [{ label: "home", href: "/" }],
    robots: [{ label: "/robotics", href: "/robotics" }],
};

const FAQ_INDEX = (Object.keys(FAQS) as (keyof typeof FAQS)[]).flatMap((group) =>
    FAQS[group].map((f) => ({ group, f, q: new Set(tokens(f.q)) })),
);

/**
 * Best FAQ by shared content words. `strong` demands 3+ shared words covering most of what was typed,
 * so "what robotics stack do you use" lands on that exact FAQ before the broad topic rules.
 */
function faqReply(text: string, strong: boolean): Reply | null {
    const t = new Set(tokens(text));
    if (t.size === 0) return null;
    let best: { overlap: number; score: number; item: (typeof FAQ_INDEX)[number] } | null = null;
    for (const item of FAQ_INDEX) {
        let overlap = 0;
        t.forEach((w) => {
            if (item.q.has(w)) overlap++;
        });
        const score = overlap / Math.max(item.q.size, 1);
        if (overlap >= 2 && (!best || score > best.score)) best = { overlap, score, item };
    }
    if (!best) return null;
    if (strong && (best.overlap < 3 || best.overlap / t.size < 0.75)) return null;
    return reply(sentences(best.item.f.a).slice(0, 2).join(" "), FAQ_LINKS[best.item.group]);
}

// ─── entry point ────────────────────────────────────────────────────────────────────────────────

export function fallback(): Reply {
    return {
        kind: "fallback",
        text: "I'm a small scripted bot. I can tell you about robots, FDE work, experience, skills, or how to hire Ayush.",
        links: [BOOKING],
        chips: CHIPS,
    };
}

const isQuestion = (raw: string, norm: string) => raw.includes("?") || QUESTION_START.test(norm);
const wordCount = (norm: string) => (norm ? norm.split(" ").length : 0);

/** The reply for one typed message, or null for empty input. */
export function answer(text: string, ctx: MatchContext): Reply | null {
    const raw = text.trim();
    const t = normalize(raw);
    if (!t) return null;

    // 1. the arm: short imperative commands only ("wave", "do the garba"), never questions
    if (!isQuestion(raw, t) && wordCount(t) <= 6 && ctx.matchArm(raw) !== null) {
        if (ctx.armAvailable) return { kind: "arm", text: raw, links: [] };
        return {
            kind: "arm-elsewhere",
            text: "The arm lives on the home page and /robotics — try it there.",
            links: [
                { label: "home arm", href: "/#arm" },
                { label: "/robotics", href: "/robotics" },
            ],
        };
    }

    // 2. small talk
    if (META.test(t)) return { kind: "meta", text: META_TEXT, links: [] };
    if (GREETING.test(t))
        return reply(
            "Hi! I'm Ayush's little scripted bot. Ask me about robots, FDE work, experience, skills, or how to hire him.",
            [],
            CHIPS,
        );
    if (THANKS.test(t) && wordCount(t) <= 6) return reply("Anytime! To talk to Ayush himself, book a call.", [BOOKING]);

    // 3. named things
    for (const p of PROJECTS) if (projectKeys(p).some((k) => has(t, k))) return projectReply(p);
    for (const j of EXPERIENCE) if (companyKeys(j).some((k) => has(t, k))) return companyReply(j);

    // 4. a near-exact FAQ question, then topics
    const strong = faqReply(raw, true);
    if (strong) return strong;
    for (const r of TOPIC_RULES) if (r.test.test(t)) return r.reply();
    const skill = SKILL_INDEX.find((s) => has(t, s.key));
    if (skill)
        return reply(`Yes: ${skill.skill} is part of his ${skill.category} toolkit.`, [
            { label: "/services", href: "/services" },
        ]);
    for (const r of LATE_RULES) if (r.test.test(t)) return r.reply();

    // 5. loose FAQ overlap, then fallback
    return faqReply(raw, false) ?? fallback();
}
