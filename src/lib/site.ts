/**
 * Single source of truth for site content.
 *
 * Everything SEO-facing reads from here — metadata, JSON-LD, sitemap, llms.txt
 * and the page itself — so the marketing copy can never drift from the
 * structured data that search engines and LLMs actually index.
 */

export const SITE = {
    url: "https://www.ayuugoyal.tech",
    name: "Ayush Goyal",
    handle: "@ayuugoyal",
    role: "AI Solution Architect & GTM Engineer",
    email: "ayushgoyal8178@gmail.com",
    tagline:
        "I architect and ship AI systems end to end — agents, voice bots, RAG, automation, and the robots that run on a factory floor.",
    availability: "Available for freelance & contract work",
    /** Primary conversion path — a booked call beats an email in a queue. */
    booking: "https://cal.com/ayuugoyal",
    socials: {
        github: "https://github.com/ayuugoyal",
        linkedin: "https://www.linkedin.com/in/ayuugoyal/",
        x: "https://x.com/ayuugoyal",
        lab: "https://www.rndynamolabs.com/",
    },
};

/** What people actually hire me for. Order = priority. */
export const SERVICES = [
    {
        slug: "ai-agents-chatbots",
        title: "AI Agents & Chatbots",
        summary:
            "Customer-facing assistants that answer from your own content instead of hallucinating. Embeddable widgets, multi-turn tool use, and a clean handoff to a human when it matters.",
        deliverables: [
            "Embeddable support & sales chatbot",
            "Multi-step agents with tool calling",
            "Guardrails, evals and fallback handling",
            "Analytics on what users actually ask",
        ],
        proof: ["Chatter AI", "ChatterCraft AI", "LawGPT", "LawGuru"],
    },
    {
        slug: "whatsapp-ai-agents",
        title: "WhatsApp & Chat Agents",
        summary:
            "Your customers already live on WhatsApp. AI agents that answer there — domain-trained, always on, and cheap enough to run on a small VPS instead of a GPU cluster.",
        deliverables: [
            "WhatsApp Business API agents",
            "Domain-trained assistants over your own docs",
            "Order, booking and support flows",
            "Live alerts and shift reports pushed to WhatsApp",
            "Web chat widget from the same brain",
        ],
        proof: [
            "NBC 2016 WhatsApp assistant",
            "FactoryBrainAI WhatsApp alerts",
            "Chatter AI",
        ],
    },
    {
        slug: "ai-voice-agents",
        title: "AI Voice Agents",
        summary:
            "Phone agents that hold a real conversation in Hindi and English — qualifying leads, booking appointments and handling inbound calls without a queue.",
        deliverables: [
            "Inbound & outbound calling agents",
            "Lead qualification and appointment booking",
            "Telephony integration (Twilio / Plivo)",
            "Call transcripts, summaries and CRM sync",
        ],
        proof: ["Mona @ RnDynamos Labs", "bolna-ai/bolna", "ArduPilot Assistant"],
    },
    {
        slug: "gtm-engineering-lead-generation",
        title: "GTM Engineering & Lead Generation",
        summary:
            "The go-to-market machine, built like software: enriched lead lists, personalised cold outreach at volume, and instrumentation so you know what actually converts.",
        deliverables: [
            "Lead scraping & AI enrichment pipelines",
            "Personalised cold email at scale, with caps & suppression",
            "Outbound sequencing and deliverability setup",
            "Funnel dashboards and reply attribution",
        ],
        proof: [
            "Lead Enrichment Tool",
            "Automechnica outreach server",
            "Daily cold email engine",
        ],
    },
    {
        slug: "workflow-automation",
        title: "Workflow Automation",
        summary:
            "The boring, expensive, manual work — gone. Internal tools, Slack bots, scheduled jobs and n8n pipelines that quietly run the business.",
        deliverables: [
            "n8n and custom pipelines across your stack",
            "Slack and WhatsApp bots for internal ops",
            "Document, spreadsheet and reporting automation",
            "Secure remote access and cloud sync",
        ],
        proof: [
            "slack-claude",
            "AI DevOps Agent",
            "Cloudflare Tunnel + n8n @ Data Alt Dynamics",
        ],
    },
    {
        slug: "integrations",
        title: "Integrations & Systems Plumbing",
        summary:
            "Making your tools actually talk to each other. Enterprise systems, SaaS APIs, CRMs, databases and AI — connected with auth, retries and error handling that hold up in production.",
        deliverables: [
            "Third-party API & SaaS integrations (OAuth 2.0)",
            "CRM, helpdesk and calendar sync",
            "Slack, WhatsApp, Gmail & Google Workspace",
            "Notion, SharePoint, OneDrive & Drive connectors",
            "Webhooks, ETL jobs and data migrations",
            "Rate limiting, retries and idempotency",
        ],
        proof: [
            "Enterprise integrations @ TAP Innovations",
            "archestra-ai connectors",
            "Google Calendar & Firebase integrations",
        ],
    },
    {
        slug: "agentic-ai-multi-agent",
        title: "Agentic AI & Multi-Agent Systems",
        summary:
            "Agents that plan, use tools, remember, and know when to stop and ask a human. Orchestrated with LangGraph so the control flow is explicit instead of vibes.",
        deliverables: [
            "Planner / executor and supervisor architectures",
            "Tool use, function calling and structured output",
            "Short and long-term memory, plus state persistence",
            "Human-in-the-loop approval gates and audit trails",
        ],
        proof: ["archestra-ai/archestra", "AI DevOps Agent", "slack-claude"],
    },
    {
        slug: "rag-knowledge-systems",
        title: "RAG & Knowledge Systems",
        summary:
            "Answers with receipts. Vector search over your documents, wikis and drives, wired into whichever model you want to use.",
        deliverables: [
            "Embeddings and vector store design",
            "Connectors for Notion, SharePoint, OneDrive, Drive",
            "Chunking, retrieval tuning and citation output",
            "Provider-agnostic LLM layer (Claude / OpenAI / Gemini)",
        ],
        proof: ["LawGPT", "archestra-ai connectors", "ChatterCraft AI"],
    },
    {
        slug: "mcp-servers-ai-tooling",
        title: "MCP Servers & AI Dev Tooling",
        summary:
            "Custom Model Context Protocol servers that give agents real, safe access to your systems — plus the internal tooling that makes an AI-native team fast.",
        deliverables: [
            "Custom MCP servers for your APIs and data",
            "Agent tool design, permissions and audit trails",
            "CLI tooling and developer-loop automation",
            "Claude Code / Cursor workflow setup for your team",
        ],
        proof: ["QuickDocs", "AI DevOps Agent", "archestra-ai/archestra"],
    },
    {
        slug: "llmops-evals-guardrails",
        title: "LLMOps, Evals & Guardrails",
        summary:
            "The difference between a demo and production. Tracing, eval suites, prompt versioning, and the cost and latency work that stops your AI feature bankrupting you.",
        deliverables: [
            "Tracing and observability (LangSmith)",
            "Eval suites and regression testing for prompts",
            "Cost, latency and token optimisation",
            "Guardrails, PII handling and prompt-injection defence",
        ],
        proof: ["Production RAG at Loadshare", "archestra-ai", "Chatter AI"],
    },
    {
        slug: "ai-mvp-product-builds",
        title: "AI-Native MVPs & Product Builds",
        summary:
            "Zero to shipped. Full-stack AI products built the way an AI-native team builds them — fast, with Claude Code and Cursor in the loop, and deployed for real users.",
        deliverables: [
            "Full-stack build: Next.js, Postgres, auth, billing",
            "AI features designed in from the start, not bolted on",
            "Deployment, analytics and iteration loops",
            "Handover your team can actually maintain",
        ],
        proof: ["Chatter AI", "QuickDocs", "LawGPT"],
    },
    {
        slug: "ai-search-geo",
        title: "AI Search Visibility & GEO",
        summary:
            "Generative Engine Optimisation — getting your brand cited by ChatGPT, Claude, Perplexity and AI Overviews, not just ranked on page one. Structured data, llms.txt, and content built to be quoted.",
        deliverables: [
            "Schema.org / JSON-LD entity modelling",
            "llms.txt and AI-crawler-friendly content structure",
            "Technical SEO: sitemaps, metadata, Core Web Vitals",
            "FAQ and answer-shaped content that LLMs extract cleanly",
        ],
        proof: ["This site"],
    },
    {
        slug: "physical-ai-robotics",
        title: "Physical AI & Robotics",
        summary:
            "AI that moves things. ROS2 control stacks, robot arms, IoT sensor networks and live factory dashboards — from firmware all the way up to the browser.",
        deliverables: [
            "ROS2 control stacks and Arduino/embedded firmware",
            "Robot arm integration (6-DOF, SCARA)",
            "IoT sensor networks with OEE and shift reporting",
            "Web control panels and 3D visualisation",
        ],
        proof: [
            "BCN3D Moveo",
            "SCARA Robot",
            "FactoryBrainAI",
            "UK Design Patent 6450987",
        ],
    },
];

/** Answers to what people actually email me. Doubles as FAQPage structured data. */
export const FAQS = [
    {
        q: "What does an AI Solution Architect actually do?",
        a: "I take a business problem and design the whole system around it — which model, what retrieval, which tools the agent gets, how it fails safely, where it plugs into your existing stack — and then I build and ship it. Not a slide deck: working software you can put in front of customers.",
    },
    {
        q: "Do you take freelance and contract projects?",
        a: "Yes. I work with founders and teams on fixed-scope builds and ongoing retainers, fully remote, and I already work remote for a US-based team. Book a call at cal.com/ayuugoyal or email ayushgoyal8178@gmail.com with what you are trying to build.",
    },
    {
        q: "Can you build voice agents that speak Hindi and English?",
        a: "Yes. I ship bilingual voice agents that handle inbound and outbound calls, qualify leads and book appointments, with telephony integration and transcripts synced back to your CRM.",
    },
    {
        q: "What is a GTM Engineer, and why would I want one?",
        a: "A go-to-market engineer builds the revenue machine as software instead of manual work — enriched lead lists, personalised outbound at volume, and the instrumentation to see what converts. Same engineering rigour, pointed at pipeline instead of product.",
    },
    {
        q: "Can you work with our existing stack?",
        a: "Almost always. I build provider-agnostic, with Claude, OpenAI or Gemini selected by config, and I have shipped across Next.js, FastAPI, Flask, Express, Postgres, MongoDB, Docker, AWS and Azure. If you are already on something, I build into it rather than around it.",
    },
    {
        q: "Do you do hardware and factory-floor projects too?",
        a: "Yes, and it is the part I like most. ROS2 control stacks, robot arms, IoT sensor networks and live dashboards. I hold a UK design registration for a pneumatically actuated four-finger robotic gripper, and I run Physical AI projects through RnDynamos Labs.",
    },
    {
        q: "Can you build WhatsApp bots and AI agents?",
        a: "Yes. I have shipped WhatsApp assistants built on FastAPI and Gemini that answer domain questions over a client's own documentation, run cheaply on a small VPS, and push live alerts and shift reports to a WhatsApp group. The same agent brain can also power a web chat widget.",
    },
    {
        q: "Can you integrate AI with the tools we already use?",
        a: "That is most of the job. I connect Slack, WhatsApp, Gmail and Google Workspace, Notion, SharePoint, OneDrive and Drive, CRMs, calendars and internal databases — with OAuth, retries, rate limiting and error handling built in, so the integration does not quietly break at 3am.",
    },
    {
        q: "How do engagements usually start?",
        a: "Book a free 30-minute scope call at cal.com/ayuugoyal. We work out whether the problem is actually worth automating. If it is, I scope it into something shippable, and you get working software early rather than a long silent build.",
    },
];

/** Three-step engagement flow shown under the services list. */
export const PROCESS = [
    {
        step: "01",
        title: "Scope call",
        body: "Book 30 minutes at cal.com/ayuugoyal. You tell me the problem; I tell you straight whether AI is the right answer, what it would take, and what it would not solve.",
    },
    {
        step: "02",
        title: "Build",
        body: "Fixed scope, working software early. You see progress continuously instead of waiting through a long silent build, and you can steer it.",
    },
    {
        step: "03",
        title: "Ship & hand over",
        body: "Deployed, documented, and handed to your team — or kept on a retainer if you would rather I keep running it.",
    },
];

/** Full capability surface. Grouped so the page and llms.txt stay in sync. */
export const SKILLS = [
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
            "Function Schemas",
            "Streaming & Token Budgeting",
        ],
    },
    {
        category: "RAG & Knowledge",
        skills: [
            "Retrieval-Augmented Generation",
            "Agentic RAG",
            "Embeddings",
            "Vector Databases",
            "FAISS",
            "pgvector",
            "Pinecone",
            "Hybrid & Semantic Search",
            "Chunking Strategies",
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
            "Real-Time Streaming",
            "Hindi & English Bilingual",
            "Call Summarisation",
            "WhatsApp Bots",
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
            "Caching",
        ],
    },
    {
        category: "GTM & Growth Engineering",
        skills: [
            "Lead Generation Pipelines",
            "AI Lead Enrichment",
            "Cold Email Automation",
            "Outbound Sequencing",
            "Deliverability & Suppression",
            "CRM Integration",
            "Funnel Analytics",
            "Generative Engine Optimisation (GEO)",
            "Technical SEO",
        ],
    },
    {
        category: "Integrations",
        skills: [
            "REST & GraphQL APIs",
            "OAuth 2.0 & API Auth",
            "Webhooks & Event-Driven Sync",
            "Slack API",
            "WhatsApp Business API",
            "Twilio / Plivo",
            "Gmail & SMTP",
            "Google Workspace & Calendar",
            "Notion API",
            "SharePoint & OneDrive",
            "Google Drive",
            "GitHub API",
            "Firebase",
            "Clerk Auth",
            "CRM & Helpdesk Sync",
            "ETL & Data Migration",
            "Rate Limiting & Retries",
        ],
    },
    {
        category: "Automation & Scripting",
        skills: [
            "n8n",
            "Zapier / Make",
            "Python Automation Scripts",
            "Bash & Shell Scripting",
            "Slack Bots (Bolt)",
            "WhatsApp Business API",
            "Webhooks & Event Pipelines",
            "Cron & Scheduled Jobs",
            "Celery & Task Queues",
            "Playwright / Puppeteer",
            "Web Scraping",
            "Pandas & Excel/CSV Pipelines",
            "Google Workspace & Apps Script",
            "Notion / SharePoint / OneDrive APIs",
            "Cloudflare Tunnel",
            "OAuth & REST Integration",
            "PM2 & systemd Services",
            "ComfyUI Workflows",
        ],
    },
    {
        category: "Physical AI & Robotics",
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
            "OEE Dashboards",
            "3D Printing (FDM / Resin)",
        ],
    },
    {
        category: "Languages",
        skills: ["Python", "TypeScript", "JavaScript", "C++", "Rust", "Go", "SQL", "Bash"],
    },
    {
        category: "Backend & Frameworks",
        skills: [
            "Next.js",
            "React",
            "FastAPI",
            "Flask",
            "Express.js",
            "Node.js",
            "REST APIs",
            "GraphQL",
            "WebSockets",
            "Server-Sent Events",
        ],
    },
    {
        category: "Data & Infrastructure",
        skills: [
            "PostgreSQL",
            "MongoDB",
            "MySQL",
            "Redis",
            "Drizzle ORM",
            "Prisma ORM",
            "Docker",
            "AWS",
            "Azure",
            "Vercel",
            "Nginx",
            "CI/CD",
        ],
    },
    {
        category: "AI Dev Tools",
        skills: [
            "Claude Code",
            "Cursor",
            "Antigravity",
            "GitHub Copilot",
            "v0",
            "Agentic Coding Workflows",
        ],
    },
];

/** Long-tail keyword surface. Real capabilities only. */
export const KEYWORDS = [
    "AI Solution Architect",
    "GTM Engineer",
    "Go To Market Engineer",
    "AI consultant",
    "freelance AI engineer",
    "AI voice agent developer",
    "AI chatbot developer",
    "WhatsApp bot developer",
    "WhatsApp Business API",
    "API integration developer",
    "enterprise integrations",
    "hire AI developer",
    "RAG pipeline development",
    "MCP server development",
    "Model Context Protocol",
    "LLM integration",
    "workflow automation",
    "n8n automation",
    "lead generation automation",
    "cold email automation",
    "AI agent development",
    "Physical AI",
    "ROS2 developer",
    "robotics software engineer",
    "factory automation",
    "IoT dashboard",
    "LangChain",
    "LangGraph",
    "Next.js AI developer",
    "Ayush Goyal",
];
