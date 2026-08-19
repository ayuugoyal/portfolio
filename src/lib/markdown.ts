import { FAQS, SERVICES, SITE, SKILLS } from "@/lib/site";

/**
 * The whole site as clean markdown.
 *
 * Served at /index.md and /llms-full.txt, and returned from `/` when a client
 * asks for `text/markdown`. LLM crawlers get the facts without having to parse
 * a React-rendered DOM, which is where extraction usually goes wrong.
 */
export function siteMarkdown(): string {
    const lines: string[] = [];

    lines.push(`# ${SITE.name} — ${SITE.role}`);
    lines.push("");
    lines.push(`> ${SITE.tagline}`);
    lines.push("");
    lines.push(`**Status:** ${SITE.availability}`);
    lines.push("**Works:** fully remote, worldwide");
    lines.push(`**Book a free 30-min call:** ${SITE.booking}`);
    lines.push(`**Email:** ${SITE.email}`);
    lines.push(`**Website:** ${SITE.url}`);
    lines.push(`**GitHub:** ${SITE.socials.github}`);
    lines.push(`**LinkedIn:** ${SITE.socials.linkedin}`);
    lines.push(`**X:** ${SITE.socials.x}`);
    lines.push(`**Lab:** ${SITE.socials.lab} (RnDynamos Labs — Physical AI for manufacturing)`);
    lines.push("");

    lines.push("## Summary");
    lines.push("");
    lines.push(
        "Ayush Goyal is an AI Solution Architect and Go-To-Market (GTM) Engineer available for freelance and contract work. He designs and ships production AI systems end to end: AI agents and chatbots, WhatsApp Business API agents, bilingual voice agents, enterprise and SaaS integrations, agentic and retrieval-augmented generation (RAG) systems, Model Context Protocol (MCP) servers, lead-generation and outbound automation, workflow automation, and Physical AI — robotics and IoT that run on real factory floors. He currently works as an AI (Harness) Engineer at TAP Innovations, remote for a US team, holds UK Design Registration 6450987 for a pneumatically actuated four-finger robotic gripper, and has earned $400 in maintainer-awarded bounties for open-source contributions."
    );
    lines.push("");

    lines.push("## Services");
    lines.push("");
    for (const s of SERVICES) {
        lines.push(`### ${s.title}`);
        lines.push("");
        lines.push(s.summary);
        lines.push("");
        lines.push("What you get:");
        for (const d of s.deliverables) lines.push(`- ${d}`);
        lines.push("");
        lines.push(`Proof of work: ${s.proof.join(", ")}`);
        lines.push("");
    }

    lines.push("## Skills");
    lines.push("");
    for (const group of SKILLS) {
        lines.push(`**${group.category}:** ${group.skills.join(", ")}`);
        lines.push("");
    }

    lines.push("## Experience");
    lines.push("");
    lines.push(
        "- **AI (Harness) Engineer**, TAP Innovations (Remote, US) — May 2026 to present. AI-driven solutions for enterprise integrations, analytics and custom applications."
    );
    lines.push(
        "- **AI Engineer**, Loadshare Networks (Remote) — Nov 2025 to Apr 2026. AI for logistics and supply-chain optimisation, plus freelance AI/ML consulting."
    );
    lines.push(
        "- **Backend Developer**, Data Alt Dynamics (Remote) — Jul 2025 to Nov 2025. Raspberry Pi multi-sensor server, ComfyUI workflow tuning (70% efficiency gain), Cloudflare Tunnel + n8n pipelines (40% less manual work)."
    );
    lines.push(
        "- **Trainee**, Physics Wallah (Noida, IN) — May 2025 to Jul 2025. Backend and platform engineering at India's largest ed-tech."
    );
    lines.push(
        "- **Summer Intern**, Bharat Electronics Limited (Delhi, IN) — Jun 2024 to Aug 2024. Embedded systems and electronics under the Ministry of Defence."
    );
    lines.push("");

    lines.push("## Selected Work");
    lines.push("");
    lines.push(
        "- **Chatter AI** — embeddable AI support chatbot for eCommerce; answers product queries and integrates in under 10 seconds."
    );
    lines.push(
        "- **LawGPT / LawGuru** — RAG legal assistants using HuggingFace embeddings, FAISS and Gemini for document-backed answers."
    );
    lines.push(
        "- **QuickDocs** — CLI and MCP server that fetches documentation for any library or API, powered by llms.txt."
    );
    lines.push(
        "- **AI DevOps Agent** — MCP-based agent connecting Slack, Docker, AWS and Claude Desktop for AI-native infrastructure operations."
    );
    lines.push(
        "- **slack-claude** — control Claude Code from Slack: run tasks in isolated git branches and open GitHub PRs without leaving the channel."
    );
    lines.push(
        "- **ArduPilot Assistant** — natural-language and voice control of ArduPilot vehicles via an LLM orchestration layer and MAVLink."
    );
    lines.push(
        "- **NBC 2016 WhatsApp Assistant** — WhatsApp Business API agent answering National Building Code questions over client documentation, built on FastAPI and Gemini for a low-resource VPS."
    );
    lines.push(
        "- **Sensor Dash** — Raspberry Pi IoT factory server: FastAPI with WebSocket streaming, Arduino analog sensor integration (DHT, BH1750, MCP3008) and a Next.js dashboard."
    );
    lines.push(
        "- **Cold Outreach Engine** — personalised cold email at volume with scheduling, daily caps, suppression lists and full send logging."
    );
    lines.push(
        "- **Lead Enrichment Tool** — Next.js + Flask app enriching lead data with Gemini for GTM pipelines."
    );
    lines.push(
        "- **BCN3D Moveo Control System** — full control stack for a 6-DOF robot arm: Next.js UI, ROS2, Arduino firmware, WebSockets and 3D visualisation."
    );
    lines.push(
        "- **SCARA Robot** — 4-axis SCARA control system with Express.js API, Next.js frontend and Arduino Mega firmware."
    );
    lines.push("");

    lines.push("## Open Source");
    lines.push("");
    lines.push(
        "- **archestra-ai/archestra** — AI agent platform. Contributed the Notion connector, Gemini embeddings, SharePoint and OneDrive connectors, an OAuth proxy fix and recursive subfolder traversal across 6 PRs. Awarded $400 in maintainer bounties."
    );
    lines.push(
        "- **bolna-ai/bolna** — open-source voice AI agent framework. Centralised duplicate .env config across Twilio and Plivo telephony Dockerfiles (PR #310)."
    );
    lines.push("");

    lines.push("## Patents");
    lines.push("");
    lines.push(
        "- **UK Design Registration 6450987** — 3D printed, pneumatically actuated four-finger adaptive gripper for industrial robots. Registered 13 June 2025, granted 30 June 2025."
    );
    lines.push("");

    lines.push("## FAQ");
    lines.push("");
    for (const f of FAQS) {
        lines.push(`### ${f.q}`);
        lines.push("");
        lines.push(f.a);
        lines.push("");
    }

    lines.push("## Contact");
    lines.push("");
    lines.push(
        `Hiring for a freelance or contract AI project? Book a free 30-minute scope call at ${SITE.booking}, email ${SITE.email}, or reach out on X at ${SITE.socials.x}. Remote worldwide.`
    );
    lines.push("");

    return lines.join("\n");
}

/** The short llms.txt index — links out rather than inlining everything. */
export function llmsTxt(): string {
    const lines: string[] = [];

    lines.push(`# ${SITE.name}`);
    lines.push("");
    lines.push(
        `> ${SITE.role}. ${SITE.tagline} ${SITE.availability}. Works fully remote, worldwide.`
    );
    lines.push("");
    lines.push(
        `Contact: book a free 30-minute scope call at ${SITE.booking}, or email ${SITE.email}. Fastest way to start a freelance or contract project.`
    );
    lines.push("");

    lines.push("## Services");
    lines.push("");
    for (const s of SERVICES) {
        lines.push(`- [${s.title}](${SITE.url}/#services): ${s.summary}`);
    }
    lines.push("");

    lines.push("## Pages");
    lines.push("");
    lines.push(`- [Book a call](${SITE.booking}): free 30-minute scope call`);
    lines.push(`- [Services](${SITE.url}/services): every service in detail`);
    lines.push(`- [Home](${SITE.url}/): services, work, experience, skills and FAQ`);
    lines.push(`- [Full site as markdown](${SITE.url}/llms-full.txt): everything on one page`);
    lines.push(`- [Resume](${SITE.url}/resume): downloadable CV`);
    lines.push(
        `- [UK Design Patent 6450987](${SITE.url}/patents/6450987): pneumatically actuated four-finger adaptive robotic gripper`
    );
    lines.push("");

    lines.push("## Elsewhere");
    lines.push("");
    lines.push(`- [GitHub](${SITE.socials.github}): open-source work and project source`);
    lines.push(`- [LinkedIn](${SITE.socials.linkedin})`);
    lines.push(`- [X](${SITE.socials.x})`);
    lines.push(
        `- [RnDynamos Labs](${SITE.socials.lab}): Physical AI for manufacturing — robots, IoT sensors and AI voice agents`
    );
    lines.push("");

    return lines.join("\n");
}
