import {
    ENGAGEMENTS,
    EXPERIENCE,
    FAQS,
    HATS,
    OPEN_SOURCE,
    PATENT,
    PLAYBOOK,
    PROJECTS,
    PROJECT_CATEGORIES,
    SERVICES,
    SITE,
    SKILLS,
    type Project,
} from "@/lib/site";

/**
 * The site as clean markdown, generated from the same data the pages render.
 *
 * Served at /index.md, /llms-full.txt and the per-page .md twins, and returned
 * from the HTML routes when a client asks for `text/markdown`. LLM crawlers get
 * the facts without parsing a React-rendered DOM, which is where extraction
 * usually goes wrong.
 */

/** Absolute URL for a site-relative href, untouched if already absolute. */
function abs(href: string): string {
    return href.startsWith("/") ? `${SITE.url}${href}` : href;
}

function contactBlock(lines: string[]) {
    lines.push(`**Status:** ${SITE.availability}`);
    lines.push(`**Location:** ${SITE.location}`);
    lines.push(`**Book a free 30-min scope call:** ${SITE.booking}`);
    lines.push(`**Email:** ${SITE.email}`);
    lines.push(`**Website:** ${SITE.url}`);
    lines.push(`**GitHub:** ${SITE.socials.github}`);
    lines.push(`**LinkedIn:** ${SITE.socials.linkedin}`);
    lines.push(`**X:** ${SITE.socials.x}`);
    lines.push(`**Lab:** ${SITE.socials.lab} (RnDynamos Labs — Physical AI)`);
    lines.push("");
}

function summaryParagraph(): string {
    return `${SITE.name} is a Forward Deployed Engineer and AI Engineer (${SITE.location}). As a freelance forward deployed engineer, Ayush embeds with client teams and ships AI into production — including a WhatsApp machine-maintenance ticketing bot running live on a factory floor and SiteOS, a WhatsApp-to-dashboard site-tracking platform for an architecture studio. That work spans AI agents and chatbots, WhatsApp and bilingual Hindi/English voice agents, RAG and knowledge systems, MCP servers, enterprise integrations and workflow automation. Full-time, Ayush is an ${SITE.employer.title} at ${SITE.employer.name}, remote for a US team. On the side, Ayush builds robots — a ROS2-controlled 6-DOF arm, a SCARA, voice-controlled ArduPilot vehicles and IoT factory sensor servers — and holds UK Design Registration ${PATENT.number} for a pneumatic four-finger robotic gripper. Ayush has also earned $400 in maintainer-awarded open-source bounties from archestra-ai.`;
}

function projectLine(p: Project): string {
    const url = p.href ? ` (${abs(p.href)})` : "";
    return `- **${p.title}**${url} — ${p.description} _Stack: ${p.technologies.join(", ")}._`;
}

function faqBlock(lines: string[], faqs: { q: string; a: string }[]) {
    for (const f of faqs) {
        lines.push(`### ${f.q}`);
        lines.push("");
        lines.push(f.a);
        lines.push("");
    }
}

function playbookBlock(lines: string[]) {
    for (const p of PLAYBOOK) lines.push(`${p.step}. **${p.title}** — ${p.body}`);
    lines.push("");
}

function servicesBlock(lines: string[]) {
    for (const s of SERVICES) {
        lines.push(`### ${s.title}`);
        lines.push("");
        lines.push(s.summary);
        lines.push("");
        for (const d of s.deliverables) lines.push(`- ${d}`);
        lines.push("");
        lines.push(`Proof of work: ${s.proof.join(", ")}`);
        lines.push("");
    }
}

export function siteMarkdown(): string {
    const lines: string[] = [];

    lines.push(`# ${SITE.name} — ${SITE.role}`);
    lines.push("");
    lines.push(`> ${SITE.tagline}`);
    lines.push("");
    contactBlock(lines);

    lines.push("## Summary");
    lines.push("");
    lines.push(summaryParagraph());
    lines.push("");

    lines.push("## What Ayush does");
    lines.push("");
    for (const h of HATS) {
        lines.push(`- **${h.title}** (${h.mode}) — ${h.body} More: ${abs(h.href)}`);
    }
    lines.push("");

    lines.push("## Forward deployed engineering services");
    lines.push("");
    servicesBlock(lines);

    lines.push("## How an engagement runs");
    lines.push("");
    playbookBlock(lines);

    lines.push("## Experience");
    lines.push("");
    for (const e of EXPERIENCE) {
        lines.push(
            `- **${e.title}**, ${e.company} (${e.location}) — ${e.start} to ${e.end ?? "present"}. ${e.description}`
        );
    }
    lines.push("");

    lines.push("## Projects");
    lines.push("");
    for (const cat of PROJECT_CATEGORIES) {
        lines.push(`### ${cat}`);
        lines.push("");
        for (const p of PROJECTS.filter((p) => p.category === cat)) lines.push(projectLine(p));
        lines.push("");
    }

    lines.push("## Open source");
    lines.push("");
    for (const o of OPEN_SOURCE) {
        lines.push(`- **${o.title}** (${o.repo}) — ${o.summary} PRs: ${o.prs.map((n) => `#${n}`).join(", ")}.`);
    }
    lines.push("");

    lines.push("## Patent");
    lines.push("");
    lines.push(
        `- **UK Design Registration ${PATENT.number}** — ${PATENT.title}. ${PATENT.summary} Registered ${PATENT.registered}, granted ${PATENT.granted}. Details: ${abs(PATENT.url)}`
    );
    lines.push("");

    lines.push("## Skills");
    lines.push("");
    for (const group of SKILLS) {
        lines.push(`**${group.category}:** ${group.skills.join(", ")}`);
        lines.push("");
    }

    lines.push("## FAQ");
    lines.push("");
    faqBlock(lines, [...FAQS.general, ...FAQS.fde, ...FAQS.robots]);

    lines.push("## Contact");
    lines.push("");
    lines.push(
        `Need a forward deployed engineer to ship AI into production? Book a free 30-minute scope call at ${SITE.booking}, email ${SITE.email}, or reach out on X at ${SITE.socials.x}. Remote worldwide.`
    );
    lines.push("");

    return lines.join("\n");
}

/** Markdown twin of /forward-deployed-engineer. */
export function fdeMarkdown(): string {
    const lines: string[] = [];

    lines.push(`# Hire ${SITE.name} — Freelance Forward Deployed Engineer`);
    lines.push("");
    lines.push(
        "> I embed with your team, find where AI actually pays off, and ship it into your production stack — agents, voice, RAG and integrations. Deployed, not demoed."
    );
    lines.push("");
    contactBlock(lines);

    lines.push("## What is a forward deployed engineer?");
    lines.push("");
    lines.push(FAQS.fde[0].a);
    lines.push("");

    lines.push("## How an engagement runs");
    lines.push("");
    playbookBlock(lines);

    lines.push("## Engagement shapes");
    lines.push("");
    for (const e of ENGAGEMENTS) lines.push(`- **${e.title}** — ${e.body}`);
    lines.push("");

    lines.push("## What gets deployed");
    lines.push("");
    servicesBlock(lines);

    lines.push("## Where Ayush has deployed");
    lines.push("");
    for (const p of PROJECTS.filter((p) => p.category === "Forward-Deployed & Client Work")) {
        lines.push(projectLine(p));
    }
    lines.push("");

    lines.push("## FAQ");
    lines.push("");
    faqBlock(lines, FAQS.fde);

    return lines.join("\n");
}

/** Markdown twin of /robotics. */
export function roboticsMarkdown(): string {
    const lines: string[] = [];

    lines.push(`# Robots by ${SITE.name}`);
    lines.push("");
    lines.push(
        "> Side projects in Physical AI: robot arms, a SCARA, voice-controlled ArduPilot vehicles, IoT sensor rigs and a patented pneumatic gripper — from firmware to browser."
    );
    lines.push("");
    contactBlock(lines);

    lines.push("## Robots");
    lines.push("");
    for (const p of PROJECTS.filter((p) => p.category === "Robots & Physical AI")) {
        lines.push(projectLine(p));
    }
    lines.push("");

    const robotics = SKILLS.find((s) => s.category === "Robotics & Physical AI");
    if (robotics) {
        lines.push("## Stack");
        lines.push("");
        lines.push(robotics.skills.join(", "));
        lines.push("");
    }

    lines.push("## FAQ");
    lines.push("");
    faqBlock(lines, FAQS.robots);

    return lines.join("\n");
}

/** The short llms.txt index — links out rather than inlining everything. See llmstxt.org */
export function llmsTxt(): string {
    const lines: string[] = [];

    lines.push(`# ${SITE.name}`);
    lines.push("");
    lines.push(`> ${SITE.role}. ${SITE.tagline} ${SITE.availability}. ${SITE.location}.`);
    lines.push("");
    lines.push(summaryParagraph());
    lines.push("");
    lines.push(
        `Contact: book a free 30-minute scope call at ${SITE.booking}, or email ${SITE.email}. Fastest way to start a freelance forward-deployed engagement.`
    );
    lines.push("");

    lines.push("## Pages");
    lines.push("");
    lines.push(`- [Home](${SITE.url}/): roles, projects, experience, open source and skills ([markdown](${SITE.url}/index.md))`);
    lines.push(
        `- [Hire a Forward Deployed Engineer](${SITE.url}/forward-deployed-engineer): how Ayush embeds with teams and ships AI to production ([markdown](${SITE.url}/forward-deployed-engineer.md))`
    );
    lines.push(
        `- [Robots](${SITE.url}/robotics): robot arms, SCARA, ArduPilot voice control, IoT and a patented gripper ([markdown](${SITE.url}/robotics.md))`
    );
    lines.push(`- [Services](${SITE.url}/services): every deliverable in detail`);
    lines.push(`- [Resume](${SITE.url}/resume): downloadable CV`);
    lines.push(`- [UK Design ${PATENT.number}](${SITE.url}${PATENT.url}): ${PATENT.title}`);
    lines.push(`- [Full site as markdown](${SITE.url}/llms-full.txt): everything on one page`);
    lines.push("");

    lines.push("## Services");
    lines.push("");
    for (const s of SERVICES) {
        lines.push(`- [${s.title}](${SITE.url}/services#${s.slug}): ${s.summary}`);
    }
    lines.push("");

    lines.push("## Elsewhere");
    lines.push("");
    lines.push(`- [Book a call](${SITE.booking}): free 30-minute scope call`);
    lines.push(`- [GitHub](${SITE.socials.github}): open-source work and project source`);
    lines.push(`- [LinkedIn](${SITE.socials.linkedin})`);
    lines.push(`- [X](${SITE.socials.x})`);
    lines.push(`- [RnDynamos Labs](${SITE.socials.lab}): Physical AI projects`);
    lines.push("");

    return lines.join("\n");
}
