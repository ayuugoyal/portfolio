import {
    EXPERIENCE,
    OPEN_SOURCE,
    PATENT,
    PROJECTS,
    SERVICES,
    SITE,
    SKILLS,
    type Project,
} from "@/lib/site";

/**
 * Schema.org builders. Pages stay visually minimal; this is where the full
 * entity graph lives for search engines and LLM crawlers. Every fact here is
 * also visible somewhere on the site — no cloaking, just denser packaging.
 */

export const IDS = {
    person: `${SITE.url}/#person`,
    website: `${SITE.url}/#website`,
    service: `${SITE.url}/#service`,
    employer: `${SITE.url}/#employer`,
    patent: `${SITE.url}${PATENT.url}#design`,
};

const abs = (href: string) => (href.startsWith("/") ? `${SITE.url}${href}` : href);

export function personSchema() {
    return {
        "@type": "Person",
        "@id": IDS.person,
        name: SITE.name,
        alternateName: ["ayuugoyal", "Ayush"],
        url: SITE.url,
        image: `${SITE.url}/ayush.JPG`,
        email: `mailto:${SITE.email}`,
        jobTitle: SITE.titles,
        description: SITE.tagline,
        nationality: { "@type": "Country", name: "India" },
        homeLocation: { "@type": "Country", name: "India" },
        worksFor: { "@id": IDS.employer },
        hasOccupation: [
            {
                "@type": "Occupation",
                name: "Forward Deployed Engineer",
                description:
                    "Freelance. Embeds with client teams to ship AI into production: agents, voice, RAG, enterprise integrations and automation.",
                occupationLocation: { "@type": "Place", name: "Remote, worldwide" },
                skills: SERVICES.map((s) => s.title).join(", "),
            },
            {
                "@type": "Occupation",
                name: "AI Engineer",
                description: `Full-time ${SITE.employer.title} at ${SITE.employer.name}.`,
                occupationLocation: { "@type": "Place", name: "Remote, US team" },
            },
            {
                "@type": "Occupation",
                name: "Robotics Engineer",
                description:
                    "Side projects: ROS2 robot arms, SCARA, ArduPilot voice control, IoT sensor servers, pneumatic grippers.",
            },
        ],
        knowsAbout: [
            "Forward Deployed Engineering",
            "Artificial Intelligence",
            "Large Language Models",
            "AI Agents",
            "Retrieval Augmented Generation",
            "Model Context Protocol",
            "AI Voice Agents",
            "Enterprise Integrations",
            "LLMOps",
            "Robotics",
            "Physical AI",
            "ROS2",
            ...SKILLS.flatMap((g) => g.skills),
        ],
        alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Guru Gobind Singh Indraprastha University",
        },
        sameAs: [
            SITE.socials.github,
            SITE.socials.linkedin,
            SITE.socials.x,
            SITE.socials.lab,
            SITE.booking,
        ],
        subjectOf: { "@id": IDS.patent },
    };
}

export function employerSchema() {
    return {
        "@type": "Organization",
        "@id": IDS.employer,
        name: SITE.employer.name,
        url: SITE.employer.url,
        employee: { "@id": IDS.person },
    };
}

export function websiteSchema() {
    return {
        "@type": "WebSite",
        "@id": IDS.website,
        url: SITE.url,
        name: `${SITE.name} — ${SITE.role}`,
        description: SITE.tagline,
        publisher: { "@id": IDS.person },
        author: { "@id": IDS.person },
        inLanguage: "en",
    };
}

export function serviceSchema() {
    return {
        "@type": "ProfessionalService",
        "@id": IDS.service,
        name: `${SITE.name} — Freelance Forward Deployed Engineer`,
        url: `${SITE.url}/forward-deployed-engineer`,
        image: `${SITE.url}/ayush.JPG`,
        description:
            "Freelance forward deployed AI engineering: embedding with client teams to ship AI agents, voice agents, RAG, MCP servers, enterprise integrations, automation and Physical AI into production.",
        founder: { "@id": IDS.person },
        provider: { "@id": IDS.person },
        email: `mailto:${SITE.email}`,
        areaServed: { "@type": "Place", name: "Worldwide (remote)" },
        potentialAction: {
            "@type": "ReserveAction",
            name: "Book a free scope call",
            target: {
                "@type": "EntryPoint",
                urlTemplate: SITE.booking,
                actionPlatform: "http://schema.org/DesktopWebPlatform",
            },
        },
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Forward Deployed Engineering Services",
            itemListElement: SERVICES.map((s) => ({
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    "@id": `${SITE.url}/services#${s.slug}`,
                    name: s.title,
                    description: s.summary,
                    serviceType: s.title,
                    provider: { "@id": IDS.person },
                },
            })),
        },
    };
}

export function patentSchema() {
    return {
        "@type": "CreativeWork",
        "@id": IDS.patent,
        name: `UK Registered Design ${PATENT.number}: ${PATENT.title}`,
        description: PATENT.summary,
        url: abs(PATENT.url),
        sameAs: PATENT.official,
        dateCreated: PATENT.registered,
        datePublished: PATENT.granted,
        creator: { "@id": IDS.person },
        about: ["Robotics", "Robotic gripper", "End effector", "Pneumatics"],
    };
}

function projectSchema(p: Project) {
    const repo = p.links.find((l) => l.type === "Github")?.href;
    const base = {
        "@id": `${SITE.url}/#project-${p.slug}`,
        name: p.title,
        description: p.description,
        creator: { "@id": IDS.person },
        keywords: p.technologies.join(", "),
        genre: p.category,
        ...(p.href ? { url: abs(p.href) } : {}),
        ...(p.image ? { image: abs(p.image) } : {}),
        ...(p.dates ? { dateCreated: p.dates } : {}),
    };
    return repo
        ? {
              "@type": "SoftwareSourceCode",
              ...base,
              codeRepository: repo,
              programmingLanguage: p.technologies,
          }
        : { "@type": "CreativeWork", ...base };
}

export function projectListSchema(projects: Project[] = PROJECTS, name = "Projects") {
    return {
        "@type": "ItemList",
        name: `${name} by ${SITE.name}`,
        numberOfItems: projects.length,
        itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: projectSchema(p),
        })),
    };
}

export function experienceSchema() {
    return EXPERIENCE.map((e) => ({
        "@type": "OrganizationRole",
        roleName: e.title,
        startDate: e.start,
        ...(e.end ? { endDate: e.end } : {}),
        description: e.description,
        member: { "@id": IDS.person },
        memberOf: { "@type": "Organization", name: e.company, url: abs(e.href) },
    }));
}

export function openSourceSchema() {
    return OPEN_SOURCE.map((o) => ({
        "@type": "SoftwareSourceCode",
        name: o.title,
        codeRepository: o.repo,
        description: o.summary,
        contributor: { "@id": IDS.person },
    }));
}

export function faqSchema(id: string, faqs: { q: string; a: string }[]) {
    return {
        "@type": "FAQPage",
        "@id": id,
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
    return {
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Home", path: "/" }, ...trail].map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.name,
            item: `${SITE.url}${t.path === "/" ? "" : t.path}`,
        })),
    };
}

