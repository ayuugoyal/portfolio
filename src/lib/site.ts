/**
 * Single source of truth for site content.
 *
 * Everything SEO-facing reads from here — metadata, JSON-LD, sitemap, llms.txt,
 * the markdown builds and the pages themselves — so the copy a human reads can
 * never drift from what search engines and LLMs actually index.
 */

export const SITE = {
    url: "https://www.ayuugoyal.tech",
    name: "Ayush Goyal",
    handle: "@ayuugoyal",
    role: "Forward Deployed Engineer & AI Engineer",
    /** Every title Ayush answers to, most important first. Feeds jobTitle in JSON-LD. */
    titles: [
        "Forward Deployed Engineer",
        "AI Engineer",
        "AI (Harness) Engineer",
        "Robotics Engineer",
    ],
    email: "ayushgoyal8178@gmail.com",
    tagline:
        "Forward deployed engineer for hire, AI engineer full-time, robot builder on the side. I embed with your team and ship AI into production — not a demo.",
    availability: "Taking freelance forward-deployed engagements",
    location: "India — remote worldwide",
    /** Primary conversion path — a booked call beats an email in a queue. */
    booking: "https://cal.com/ayuugoyal",
    socials: {
        github: "https://github.com/ayuugoyal",
        linkedin: "https://www.linkedin.com/in/ayuugoyal/",
        x: "https://x.com/ayuugoyal",
        lab: "https://www.rndynamolabs.com/",
    },
    employer: {
        name: "TAP Innovations",
        url: "https://tapinnov.com/",
        title: "AI (Harness) Engineer",
    },
};

/**
 * The three things Ayush does, in the order a visitor should read them.
 * Rendered as the "three hats" block on the home page and reused in markdown.
 */
export const HATS = [
    {
        key: "fde",
        mode: "freelance",
        title: "Forward Deployed Engineer",
        body: "I embed with your team, sit next to the people doing the work, find where AI actually pays off, and ship it into your production stack. Agents, voice, RAG, integrations — deployed, not demoed.",
        href: "/forward-deployed-engineer",
        cta: "hire me as your fde",
    },
    {
        key: "ai",
        mode: "full-time",
        title: "AI Engineer @ TAP Innovations",
        body: "Day job: AI (Harness) Engineer at TAP Innovations, remote for a US team — building AI into enterprise integrations, analytics and custom applications.",
        href: "/#work-experience",
        cta: "see experience",
    },
    {
        key: "robots",
        mode: "side projects",
        title: "Robot Builder",
        body: "After hours I build robots: a 6-DOF arm, a SCARA, voice-controlled ArduPilot vehicles, IoT sensor rigs, and a patented pneumatic gripper. Physical AI, from firmware to browser.",
        href: "/robotics",
        cta: "see the robots",
    },
] as const;

/**
 * What an FDE engagement can deliver. Order = priority.
 * The first one is the engagement model itself; the rest are what gets shipped.
 */
export const SERVICES = [
    {
        slug: "forward-deployed-engineering",
        title: "Forward Deployed AI Engineering",
        summary:
            "I join your team for a scoped engagement, learn the workflow from the people who run it, and take one AI use case from messy reality to production — inside your stack, under your security rules.",
        deliverables: [
            "Discovery with the actual end users, not just the sponsor",
            "Working pilot in your environment within the first weeks",
            "Production rollout: auth, monitoring, fallbacks",
            "Handover docs and a team that can run it without me",
        ],
        proof: [
            "Machine Maintenance Bot (live on a factory floor)",
            "SiteOS (live for an architecture studio)",
        ],
    },
    {
        slug: "ai-agents-chatbots",
        title: "AI Agents, Chatbots & WhatsApp Bots",
        summary:
            "Assistants that answer from your own content instead of hallucinating — on your site, in Slack, or on WhatsApp where your customers already are. Multi-step tool use and a clean handoff to a human.",
        deliverables: [
            "Embeddable support & sales chatbots",
            "WhatsApp Business API agents",
            "Multi-step agents with tool calling",
            "Guardrails, evals and fallback handling",
        ],
        proof: ["Machine Maintenance Bot", "SiteOS", "Chatter AI", "LawGPT"],
    },
    {
        slug: "ai-voice-agents",
        title: "AI Voice Agents",
        summary:
            "Phone agents that hold a real conversation in Hindi and English — qualifying leads, booking appointments and handling inbound calls without a queue.",
        deliverables: [
            "Inbound & outbound calling agents",
            "Telephony integration (Twilio / Plivo)",
            "Call transcripts, summaries and CRM sync",
            "Latency and interruption tuning",
        ],
        proof: ["Mona @ RnDynamos Labs", "bolna-ai/bolna", "ArduPilot Assistant"],
    },
    {
        slug: "enterprise-integrations",
        title: "Enterprise Integrations",
        summary:
            "Most of forward-deployed work is plumbing. I connect AI to your CRMs, drives, databases and SaaS tools with auth, retries and error handling that survive production.",
        deliverables: [
            "SaaS & internal API integrations (OAuth 2.0)",
            "Notion, SharePoint, OneDrive & Drive connectors",
            "Slack, WhatsApp, Gmail & Google Workspace",
            "Webhooks, ETL jobs and rate-limit-safe sync",
        ],
        proof: [
            "SharePoint ticketing in Machine Maintenance Bot",
            "SiteOS SharePoint archive",
            "archestra-ai connectors",
        ],
    },
    {
        slug: "rag-knowledge-systems",
        title: "RAG & Knowledge Systems",
        summary:
            "Answers with receipts. Retrieval over your documents, wikis and drives, wired into whichever model you want, with citations your users can check.",
        deliverables: [
            "Embeddings and vector store design",
            "Chunking, retrieval tuning and reranking",
            "Citation output and grounding checks",
            "Provider-agnostic model layer (Claude / OpenAI / Gemini)",
        ],
        proof: ["LawGPT", "archestra-ai connectors", "Chatter AI"],
    },
    {
        slug: "mcp-agentic-workflows",
        title: "MCP Servers & Agentic Workflows",
        summary:
            "Custom Model Context Protocol servers and multi-agent flows that give AI real, permissioned access to your systems — with human approval gates where it matters.",
        deliverables: [
            "Custom MCP servers for your APIs and data",
            "Planner / executor and supervisor agents (LangGraph)",
            "Tool permissions, audit trails, human-in-the-loop",
            "Claude Code / Cursor workflow setup for your team",
        ],
        proof: ["AI DevOps Agent", "slack-claude", "QuickDocs", "archestra-ai"],
    },
    {
        slug: "llmops-evals-guardrails",
        title: "LLMOps, Evals & Guardrails",
        summary:
            "The difference between a pilot and production. Tracing, eval suites, prompt versioning, and the cost and latency work that keeps the AI feature affordable.",
        deliverables: [
            "Tracing and observability (LangSmith)",
            "Eval suites and regression tests for prompts",
            "Cost, latency and token optimisation",
            "PII handling and prompt-injection defence",
        ],
        proof: ["Production AI at Loadshare Networks", "archestra-ai", "Chatter AI"],
    },
    {
        slug: "workflow-gtm-automation",
        title: "Workflow & GTM Automation",
        summary:
            "The boring, expensive manual work — gone. n8n pipelines, internal bots, lead enrichment and outbound that run quietly in the background.",
        deliverables: [
            "n8n and custom pipelines across your stack",
            "Lead scraping & AI enrichment",
            "Personalised outbound with caps & suppression",
            "Reporting and spreadsheet automation",
        ],
        proof: [
            "Lead Enrichment Tool",
            "Cold Outreach Engine",
            "Cloudflare Tunnel + n8n @ Data Alt Dynamics",
        ],
    },
    {
        slug: "physical-ai-robotics",
        title: "Physical AI & Robotics Integration",
        summary:
            "AI that touches hardware. ROS2 control stacks, robot arms, IoT sensor networks and live factory dashboards — from firmware all the way up to the browser.",
        deliverables: [
            "ROS2 control stacks and embedded firmware",
            "Robot arm integration (6-DOF, SCARA)",
            "IoT sensor networks and OEE dashboards",
            "Voice and LLM control of real machines",
        ],
        proof: [
            "BCN3D Moveo",
            "SCARA Robot",
            "Sensor Dash",
            "UK Design 6450987",
        ],
    },
];

/** How a forward-deployed engagement runs. */
export const PLAYBOOK = [
    {
        step: "01",
        title: "Scope call",
        body: "30 minutes at cal.com/ayuugoyal. You describe the problem; I tell you straight whether AI is the right answer and what it would take.",
    },
    {
        step: "02",
        title: "Embed & discover",
        body: "I get access to your stack and time with the people doing the work. The real requirements live with users, not in the brief.",
    },
    {
        step: "03",
        title: "Ship to prod",
        body: "A working pilot early, in your environment, then hardened for production: auth, monitoring, evals, fallbacks.",
    },
    {
        step: "04",
        title: "Hand over",
        body: "Documented and handed to your team — or kept on a retainer if you would rather I keep running it.",
    },
];

/** Shapes an engagement can take. No prices here on purpose — scope decides. */
export const ENGAGEMENTS = [
    {
        title: "Deployment sprint",
        body: "One well-defined use case, taken from zero to production over a fixed few weeks.",
    },
    {
        title: "Pilot to production",
        body: "You already have a demo that works on someone's laptop. I make it survive real users.",
    },
    {
        title: "Embedded retainer",
        body: "Part-time FDE on your team, shipping and maintaining AI features month to month.",
    },
];

type Faq = { q: string; a: string };

/**
 * Answer-shaped copy for the questions people (and LLMs) actually ask.
 * Each page renders its own group and emits a matching FAQPage block.
 */
export const FAQS: Record<"fde" | "general" | "robots", Faq[]> = {
    fde: [
        {
            q: "What is a forward deployed engineer?",
            a: "A forward deployed engineer (FDE) is a software engineer who embeds directly with a customer's team to make a product or technology work in their real environment. Instead of handing over a spec, an FDE learns the workflow from end users, writes the integrations, and ships to production. For AI, that means taking a model from demo to something your team uses every day.",
        },
        {
            q: "Can I hire Ayush Goyal as a freelance forward deployed engineer?",
            a: "Yes. Ayush takes a small number of freelance forward-deployed engagements, fully remote and worldwide. Book a free 30-minute scope call at cal.com/ayuugoyal or email ayushgoyal8178@gmail.com with what you are trying to ship.",
        },
        {
            q: "How is a forward deployed engineer different from an AI consultant?",
            a: "A consultant typically leaves you with recommendations. A forward deployed engineer leaves you with running software: code in your repositories, integrations with your systems, and monitoring in production. The advice is a side effect of doing the work.",
        },
        {
            q: "How do you freelance while working full-time as an AI Engineer?",
            a: "Ayush works full-time as an AI (Harness) Engineer at TAP Innovations and takes a limited number of scoped freelance engagements on top. Timelines and availability are agreed up front on the scope call, so there are no surprises mid-build.",
        },
        {
            q: "Can you work inside our existing stack and security rules?",
            a: "That is the point of forward-deployed work. Ayush builds provider-agnostic, with Claude, OpenAI or Gemini selected by config, and has shipped across Next.js, FastAPI, Flask, Express, Postgres, MongoDB, Docker, AWS and Azure. Ayush works within your access controls rather than around them.",
        },
        {
            q: "What does a typical engagement look like?",
            a: "It starts with a scope call, then an embed-and-discover phase with your users, a working pilot in your environment early, a production rollout with monitoring and evals, and a clean handover. Shapes range from a fixed deployment sprint to an ongoing embedded retainer.",
        },
    ],
    general: [
        {
            q: "Who is Ayush Goyal?",
            a: "Ayush Goyal is a Forward Deployed Engineer and AI Engineer based in India and working remotely worldwide. Ayush takes freelance forward-deployed AI engagements, works full-time as an AI (Harness) Engineer at TAP Innovations, builds robots as side projects, holds UK Design Registration 6450987 for a pneumatic robotic gripper, and has earned $400 in open-source bounties from archestra-ai.",
        },
        {
            q: "What does Ayush Goyal build?",
            a: "Production AI systems — including a WhatsApp machine-maintenance ticketing bot live on a factory floor and SiteOS, a WhatsApp-to-dashboard platform for an architecture studio — plus AI agents and chatbots, WhatsApp bots, bilingual Hindi and English voice agents, RAG and knowledge systems, MCP servers, enterprise integrations and workflow automation — plus robots and Physical AI: ROS2 robot arms, a SCARA, voice-controlled ArduPilot vehicles and IoT factory sensor servers.",
        },
        {
            q: "Can you build voice agents that speak Hindi and English?",
            a: "Yes. Bilingual voice agents that handle inbound and outbound calls, qualify leads and book appointments, with telephony integration and transcripts synced back to your CRM.",
        },
        {
            q: "Can you build WhatsApp bots and AI agents?",
            a: "Yes. Two WhatsApp systems are live in production from freelance FDE work: a machine-maintenance ticketing bot on WhatsApp Flows for a factory, and SiteOS, which turns site engineers' WhatsApp photos and notes into tickets and daily reports. Personal builds include a FastAPI + Gemini assistant for National Building Code questions that runs on a small VPS.",
        },
        {
            q: "Can you integrate AI with the tools we already use?",
            a: "That is most of the job: Slack, WhatsApp, Gmail and Google Workspace, Notion, SharePoint, OneDrive and Drive, CRMs, calendars and internal databases — with OAuth, retries, rate limiting and error handling built in.",
        },
    ],
    robots: [
        {
            q: "What robots has Ayush Goyal built?",
            a: "A full control system for the BCN3D Moveo 6-DOF robot arm (ROS2, Arduino, Next.js), a 4-axis SCARA robot controlled from the browser, ArduPilot Assistant for natural-language and voice control of ArduPilot vehicles over MAVLink, a Raspberry Pi IoT factory sensor server, and a 3D-printed pneumatic four-finger gripper registered as UK Design 6450987.",
        },
        {
            q: "Is robotics your job or a side project?",
            a: "Side projects. Ayush's day job is AI engineering and the freelance work is forward-deployed AI engineering; robots are what Ayush builds after hours, often through RnDynamos Labs. That hardware work is available on client projects too.",
        },
        {
            q: "What robotics stack do you use?",
            a: "ROS2 Humble and ROSBridge, Arduino and embedded C++, Raspberry Pi, stepper motion control, MAVLink and ArduPilot, WebSockets for live control, Next.js for web control panels and 3D visualisation, and FDM and resin 3D printing for parts.",
        },
        {
            q: "Can AI and LLMs control real robots?",
            a: "Yes, with a safety layer in between. ArduPilot Assistant turns spoken or typed commands into MAVLink through an LLM orchestration layer, and the same pattern applies to robot arms: the model proposes, a deterministic controller validates and executes.",
        },
    ],
};

export type ProjectLink = {
    type: "Github" | "Live" | "Website" | "Demo Video";
    href: string;
};

export type Project = {
    slug: string;
    category: (typeof PROJECT_CATEGORIES)[number];
    title: string;
    href?: string;
    dates: string;
    description: string;
    technologies: string[];
    links: ProjectLink[];
    image?: string;
    /** one short line for the home page; only featured projects have one */
    blurb?: string;
};

export const PROJECT_CATEGORIES = [
    "Freelance FDE Deployments",
    "Personal Projects",
    "Robots & Physical AI",
] as const;

export const PROJECTS: Project[] = [
    // ── freelance fde deployments (live in production) ──
    {
        slug: "machine-maintenance-bot",
        blurb: "WhatsApp breakdown & maintenance tickets, live on a factory floor",
        category: "Freelance FDE Deployments",
        title: "Machine Maintenance Bot",
        dates: "2025 — now",
        description:
            "Production WhatsApp bot running a factory's machine-breakdown workflow. Operators report breakdowns through WhatsApp Flows with photos, supervisors accept and dispatch technicians, and every ticket is tracked in SharePoint — with optional 5-Why root-cause analysis and a nightly PDF report with Gemini-written analysis. Redis locks and idempotent intake keep parallel supervisors from double-acting. Deployed as a freelance forward deployed engineer; live in production.",
        technologies: ["Node.js", "Express", "WhatsApp Cloud API", "WhatsApp Flows", "SharePoint / Graph API", "Redis", "Gemini", "Puppeteer", "Docker"],
        links: [],
    },
    {
        slug: "siteos",
        blurb: "WhatsApp-to-dashboard site tracking for an architecture studio",
        category: "Freelance FDE Deployments",
        title: "SiteOS",
        dates: "2026",
        description:
            "Project, drawing and site-update platform for an architecture studio. Site engineers send photos, video or notes on WhatsApp; SiteOS works out the project and floor, groups a 10-minute window into one update, stitches media into a single video, and pushes a ticket to the project manager — plus a daily report page and SharePoint archive. The office gets a dashboard with DXF plans as clickable layouts, versioned drawings and strict role-based access. Deployed as a freelance forward deployed engineer; live in production.",
        technologies: ["Next.js", "React", "PostgreSQL", "Drizzle", "BullMQ", "Redis", "ffmpeg", "WhatsApp Cloud API", "SharePoint", "Docker"],
        links: [],
    },
    {
        slug: "nbc-whatsapp-assistant",
        category: "Personal Projects",
        title: "NBC 2016 WhatsApp Assistant",
        dates: "2025",
        description:
            "A WhatsApp AI agent that answers National Building Code (Part 4) questions from the code's own text. FastAPI + Gemini with a comprehensive domain prompt instead of a vectorstore, tuned to run on a low-resource VPS.",
        technologies: ["Python", "FastAPI", "Gemini API", "WhatsApp Business API", "Docker", "VPS"],
        links: [],
    },
    {
        slug: "sensor-dash",
        category: "Robots & Physical AI",
        title: "Sensor Dash — IoT Factory Server",
        dates: "2025",
        description:
            "Raspberry Pi sensor server for live factory visibility. FastAPI with WebSocket streaming, Arduino for analog sensors, DHT / BH1750 / MCP3008 over I2C and SPI, and a Next.js dashboard on top.",
        technologies: ["Python", "FastAPI", "Raspberry Pi", "Arduino", "WebSockets", "SQLite", "Next.js"],
        links: [],
    },
    {
        slug: "lead-enrichment-tool",
        category: "Personal Projects",
        title: "Lead Enrichment Tool",
        href: "https://github.com/ayuugoyal/lead-enrich-data",
        dates: "",
        description:
            "Full-stack lead enrichment for outbound. Next.js with Firebase auth over a Flask backend that uses Gemini to generate company intelligence — a cheaper, more flexible stand-in for Clearbit.",
        technologies: ["Next.js", "Flask", "Gemini API", "Firebase Auth", "Python"],
        links: [
            { type: "Live", href: "https://lead-enrich-data.vercel.app" },
            { type: "Github", href: "https://github.com/ayuugoyal/lead-enrich-data" },
        ],
    },
    {
        slug: "cold-outreach-engine",
        category: "Personal Projects",
        title: "Cold Outreach Engine",
        href: "https://github.com/ayuugoyal/auto-mail",
        dates: "",
        description:
            "Personalised cold email at volume, built for RnDynamos Labs. Standard-library Python only — web UI, SMTP sender, scheduler, per-vertical templates, daily caps, suppression lists and a full sent log.",
        technologies: ["Python", "SMTP", "pm2", "Scheduling", "CSV Pipelines"],
        links: [{ type: "Github", href: "https://github.com/ayuugoyal/auto-mail" }],
    },

    // ── ai engineering ──
    {
        slug: "ai-devops-agent",
        blurb: "run cloud infra from Slack through MCP",
        category: "Personal Projects",
        title: "AI DevOps Agent",
        href: "https://github.com/ayuugoyal/ai-devops-agent",
        dates: "2026",
        description:
            "An AI-native DevOps engineer. Connects to any cloud or server from Slack, terminal or Claude Desktop through the official MCP SDK — 67+ AWS MCP servers, Docker, and a Slack bot front end.",
        technologies: ["Python", "MCP SDK", "Docker", "AWS", "Slack Bot", "Claude Desktop"],
        links: [{ type: "Github", href: "https://github.com/ayuugoyal/ai-devops-agent" }],
    },
    {
        slug: "slack-claude",
        category: "Personal Projects",
        title: "slack-claude",
        href: "https://github.com/ayuugoyal/slack-claude",
        dates: "2026",
        description:
            "Control Claude Code from Slack. Mention the bot on a bug report and it investigates, fixes it in an isolated git branch and raises a GitHub PR — without anyone leaving the channel.",
        technologies: ["Python", "Slack Bolt", "Claude Code", "GitHub API", "Git"],
        links: [{ type: "Github", href: "https://github.com/ayuugoyal/slack-claude" }],
    },
    {
        slug: "quickdocs",
        category: "Personal Projects",
        title: "QuickDocs",
        href: "https://github.com/ayuugoyal/quickdocs",
        dates: "2026",
        description:
            "Instant docs for any service. CLI + MCP server powered by llms.txt — pull documentation for any library or API in seconds, straight from your terminal or your agent.",
        technologies: ["TypeScript", "MCP Server", "CLI", "llms.txt", "Node.js"],
        links: [{ type: "Github", href: "https://github.com/ayuugoyal/quickdocs" }],
        image: "/quickdocs.png",
    },
    {
        slug: "chatter-ai",
        category: "Personal Projects",
        title: "Chatter AI",
        href: "https://www.chatterai.tech/",
        dates: "",
        description:
            "Lightweight embeddable AI chatbot so businesses stop leaving customers on read. Answers product queries, recommends related items, and drops into a site in under 10 seconds.",
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "DrizzleORM", "Gemini API", "Clerk", "LangChain"],
        links: [
            { type: "Website", href: "https://www.chatterai.tech/" },
            { type: "Github", href: "https://github.com/ayuugoyal/chatterai/" },
        ],
        image: "/chatter.png",
    },
    {
        slug: "lawgpt",
        category: "Personal Projects",
        title: "LawGPT",
        href: "https://lawgpt.rndynamolabs.tech/",
        dates: "",
        description:
            "AI legal assistant running RAG, so every answer comes with receipts instead of vibes. HuggingFace embeddings + FAISS + Gemini API over legal documents.",
        technologies: ["Next.js", "FastAPI", "LangChain", "HuggingFace", "FAISS", "Gemini API", "NeonDB"],
        links: [
            { type: "Website", href: "https://lawgpt.rndynamolabs.tech/" },
            { type: "Github", href: "https://github.com/ayuugoyal/lawgpt/" },
        ],
        image: "/lawgpt.png",
    },

    // ── robots ──
    {
        slug: "bcn3d-moveo",
        blurb: "ROS2 control stack for a 6-DOF robot arm",
        category: "Robots & Physical AI",
        title: "BCN3D Moveo Control System",
        href: "https://github.com/ayuugoyal/bcn-3d-control-system",
        dates: "",
        description:
            "Full control system for the BCN3D Moveo 6-DOF robot arm — Next.js web UI, ROS2 integration, Arduino firmware. Real-time WebSocket comms, joint + cartesian control, 3D visualisation and health monitoring.",
        technologies: ["ROS2 Humble", "ROSBridge", "Python", "C++", "Arduino", "Next.js", "WebSockets"],
        links: [
            { type: "Github", href: "https://github.com/ayuugoyal/bcn-3d-control-system" },
            { type: "Demo Video", href: "https://rndynamolabs.tech/bcn3d.mp4" },
        ],
        image: "/bcn-3d.jpg",
    },
    {
        slug: "scara-robot",
        category: "Robots & Physical AI",
        title: "SCARA Robot",
        href: "https://github.com/ayuugoyal/scara",
        dates: "",
        description:
            "Control system for a 4-axis SCARA robot — Express.js API, Next.js frontend, Arduino Mega firmware. Precise motion control you can run remotely from a browser tab.",
        technologies: ["Arduino Mega", "NEMA 17 Steppers", "Next.js", "TypeScript", "Express.js"],
        links: [
            { type: "Github", href: "https://github.com/ayuugoyal/scara/" },
            { type: "Demo Video", href: "https://rndynamolabs.tech/scara.mp4" },
        ],
        image: "/scara.png",
    },
    {
        slug: "ardupilot-assistant",
        blurb: "voice & natural-language control of ArduPilot vehicles",
        category: "Robots & Physical AI",
        title: "ArduPilot Assistant",
        href: "https://github.com/ayuugoyal/ArduPilot-Assistant",
        dates: "",
        description:
            "Natural-language and voice control of ArduPilot vehicles. An LLM orchestration layer turns spoken commands into MAVLink through a vehicle connection layer — voice agents pointed at actual hardware.",
        technologies: ["Next.js", "MAVLink", "ArduPilot", "OpenAI", "Gemini", "Voice"],
        links: [
            { type: "Live", href: "https://ardupilot-assistant.ayuugoyal.tech/" },
            { type: "Github", href: "https://github.com/ayuugoyal/ArduPilot-Assistant" },
        ],
    },
    {
        slug: "pneumatic-gripper",
        category: "Robots & Physical AI",
        title: "Pneumatic Four-Finger Gripper",
        href: "/patents/6450987",
        dates: "2025",
        description:
            "A 3D-printed, pneumatically actuated four-finger adaptive gripper that grabs objects of almost any shape. Registered as UK Design 6450987.",
        technologies: ["Pneumatics", "3D Printing", "End-Effector Design", "Industrial Robotics"],
        links: [],
        image: "/patent.png",
    },
];

export const EXPERIENCE = [
    {
        company: "Freelance",
        href: "/forward-deployed-engineer",
        location: "Remote, worldwide",
        title: "Forward Deployed Engineer",
        logoUrl: "/sakuta.png",
        start: "2025",
        current: true,
        description:
            "Embedding with client teams to ship AI into production. Shipped a WhatsApp machine-maintenance ticketing bot that runs a factory's breakdown workflow and SiteOS, a WhatsApp-to-dashboard site-tracking platform for an architecture studio — both live in production. Discovery with real users, pilot in their stack, production rollout, handover.",
    },
    {
        company: "TAP Innovations",
        href: "https://tapinnov.com/",
        location: "Remote, US",
        title: "AI (Harness) Engineer",
        logoUrl: "/tapinnov.png",
        start: "May 2026",
        current: true,
        description:
            "AI (Harness) Engineer at TAP Innovations, a US software startup building integrations, analytics and custom apps for enterprise systems. Fully remote, shipping AI-driven solutions — while going all in on Physical AI, i.e. machine intelligence inside actual robots and embedded hardware. Calling it now: that's the next big thing.",
    },
    {
        company: "Loadshare Networks",
        href: "https://www.loadshare.net/",
        location: "Remote",
        title: "AI Engineer",
        logoUrl: "/loadshare.svg",
        start: "Nov 2025",
        end: "Apr 2026",
        description:
            "AI Engineer at Loadshare Networks, a big name in logistics and supply chain tech. Built AI-driven solutions to optimise logistics ops, make deliveries way less painful, and level up the customer experience. Also freelanced AI/ML consulting on the side across a bunch of domains.",
    },
    {
        company: "Data Alt Dynamics",
        href: "https://dataaltdynamics.com/",
        location: "Remote",
        title: "Backend Developer",
        logoUrl: "/datalogo.png",
        start: "Jul 2025",
        end: "Nov 2025",
        description:
            "Shipped a Raspberry Pi server with multi-sensor integration for real-time data acquisition and control. Tuned local ComfyUI workflows and made AI-driven processes 70% more efficient. Glued Cloudflare Tunnel to n8n for secure remote access and clean cloud sync, which deleted 40% of the manual busywork.",
    },
    {
        company: "Physics Wallah",
        href: "https://www.pw.live",
        location: "Noida, IN",
        title: "Trainee",
        logoUrl: "/pwlogo.jpg",
        start: "May 2025",
        end: "Jul 2025",
        description:
            "Backend and platform engineering at India's biggest ed-tech, serving millions of students across JEE, NEET and school curricula. Real traffic, real stakes, zero room to fumble.",
    },
    {
        company: "Bharat Electronics Limited",
        href: "https://bel-india.in/homepage/",
        location: "Delhi, IN",
        title: "Summer Intern",
        logoUrl: "/bellogo.png",
        start: "Jun 2024",
        end: "Aug 2024",
        description:
            "Embedded systems and electronics at India's top defence electronics manufacturer, under the Ministry of Defence. First proper taste of industrial hardware, and the reason i'm stuck on this stuff now.",
    },
];

export const OPEN_SOURCE = [
    {
        title: "archestra-ai/archestra",
        repo: "https://github.com/archestra-ai/archestra",
        dates: "2026",
        summary:
            "AI agent platform. Shipped the Notion connector, Gemini embeddings, SharePoint & OneDrive connectors, an OAuth proxy fix, and recursive subfolder traversal across 6 PRs. Awarded $400 in maintainer bounties.",
        prs: [3555, 3611, 3656, 3960, 3400, 3958],
    },
    {
        title: "bolna-ai/bolna",
        repo: "https://github.com/bolna-ai/bolna",
        dates: "2025",
        summary:
            "Open-source voice AI agent framework. Centralised duplicate .env config across the Twilio and Plivo telephony Dockerfiles via docker-compose env_file.",
        prs: [310],
    },
];

export const PATENT = {
    number: "6450987",
    title: "3D Printed, Pneumatically Actuated Four-Finger Adaptive Gripper",
    registered: "2025-06-13",
    granted: "2025-06-30",
    url: "/patents/6450987",
    official: "https://www.registered-design.service.gov.uk/find/6450987",
    summary:
        "UK Design Registration for an industrial robotic end-effector: a pneumatically actuated four-finger gripper that adapts to objects of almost any shape or size.",
};

/** Full capability surface. Grouped so the page and llms.txt stay in sync. */
export const SKILLS = [
    {
        category: "Forward Deployed Engineering",
        skills: [
            "Customer Discovery",
            "Embedded Delivery",
            "Pilot to Production",
            "Requirements from End Users",
            "Stakeholder Demos",
            "Working Inside Client Security Rules",
            "Handover & Documentation",
        ],
    },
    {
        category: "AI Agents & Orchestration",
        skills: [
            "LangGraph",
            "LangChain",
            "Multi-Agent Systems",
            "Tool / Function Calling",
            "Agent Memory & State",
            "Human-in-the-Loop",
            "MCP Servers",
            "Claude Agent SDK",
            "Structured Output",
            "Browser & Computer Use",
        ],
    },
    {
        category: "LLMs & Model Layer",
        skills: [
            "Anthropic Claude",
            "OpenAI GPT",
            "Google Gemini",
            "HuggingFace",
            "Ollama",
            "Open-Weight Models",
            "Prompt Engineering",
            "Fine-Tuning & LoRA",
            "Streaming & Token Budgeting",
        ],
    },
    {
        category: "RAG & Knowledge",
        skills: [
            "Retrieval-Augmented Generation",
            "Agentic RAG",
            "Embeddings",
            "FAISS",
            "pgvector",
            "Pinecone",
            "Hybrid & Semantic Search",
            "Reranking",
            "Citations & Grounding",
        ],
    },
    {
        category: "Voice & Conversational AI",
        skills: [
            "AI Voice Agents",
            "Speech-to-Text",
            "Text-to-Speech",
            "Telephony (Twilio / Plivo)",
            "Hindi & English Bilingual",
            "WhatsApp Business API",
        ],
    },
    {
        category: "LLMOps & Evaluation",
        skills: [
            "LangSmith",
            "Tracing & Observability",
            "Eval Suites",
            "Prompt Versioning",
            "Guardrails",
            "Prompt-Injection Defence",
            "Cost & Latency Optimisation",
        ],
    },
    {
        category: "Integrations & Automation",
        skills: [
            "REST & GraphQL APIs",
            "OAuth 2.0",
            "Webhooks",
            "Slack API",
            "Google Workspace",
            "Notion API",
            "SharePoint & OneDrive",
            "Firebase",
            "n8n",
            "Playwright / Puppeteer",
            "Cloudflare Tunnel",
            "ETL & Data Migration",
        ],
    },
    {
        category: "Robotics & Physical AI",
        skills: [
            "ROS2 Humble",
            "ROSBridge",
            "MAVLink / ArduPilot",
            "Arduino & Embedded C++",
            "Raspberry Pi",
            "Stepper & Motion Control",
            "URDF & Simulation",
            "Computer Vision",
            "Sensor Fusion & IoT",
            "3D Printing (FDM / Resin)",
        ],
    },
    {
        category: "Languages",
        skills: ["Python", "TypeScript", "JavaScript", "C++", "Rust", "Go", "SQL", "Bash"],
    },
    {
        category: "Backend & Infrastructure",
        skills: [
            "Next.js",
            "React",
            "FastAPI",
            "Flask",
            "Express.js",
            "Node.js",
            "WebSockets",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "Docker",
            "AWS",
            "Azure",
            "Vercel",
        ],
    },
    {
        category: "AI Dev Tools",
        skills: ["Claude Code", "Cursor", "Antigravity", "GitHub Copilot", "v0"],
    },
];

/** Long-tail keyword surface. Real capabilities only. */
export const KEYWORDS = [
    "Ayush Goyal",
    "ayuugoyal",
    "Forward Deployed Engineer",
    "freelance forward deployed engineer",
    "hire forward deployed engineer",
    "forward deployed AI engineer",
    "FDE",
    "AI Engineer",
    "freelance AI engineer",
    "hire AI engineer",
    "AI Harness Engineer",
    "AI engineer India remote",
    "AI agent development",
    "AI chatbot developer",
    "WhatsApp bot developer",
    "AI voice agent developer",
    "RAG pipeline development",
    "MCP server development",
    "Model Context Protocol",
    "enterprise AI integration",
    "LLM integration",
    "LLMOps",
    "workflow automation",
    "n8n automation",
    "robotics engineer",
    "robot builder",
    "Physical AI",
    "ROS2 developer",
    "robot arm control system",
    "SCARA robot",
    "ArduPilot",
    "LangGraph",
    "LangChain",
];
