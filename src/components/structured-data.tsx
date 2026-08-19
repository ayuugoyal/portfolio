import { SERVICES, SITE } from "@/lib/site";

/**
 * JSON-LD for search engines and LLM crawlers.
 *
 * Emitted as one @graph so the entities can reference each other by @id
 * (Person -> worksFor -> WebSite -> publisher) instead of repeating themselves.
 */
export function StructuredData() {
    const personId = `${SITE.url}/#person`;
    const siteId = `${SITE.url}/#website`;
    const serviceId = `${SITE.url}/#service`;

    const graph = [
        {
            "@type": "Person",
            "@id": personId,
            name: SITE.name,
            url: SITE.url,
            image: `${SITE.url}/ayush.JPG`,
            jobTitle: SITE.role,
            email: `mailto:${SITE.email}`,
            description: SITE.tagline,
            sameAs: [
                SITE.booking,
                SITE.socials.github,
                SITE.socials.linkedin,
                SITE.socials.x,
                SITE.socials.lab,
            ],
            knowsAbout: [
                "Artificial Intelligence",
                "Large Language Models",
                "Retrieval Augmented Generation",
                "Model Context Protocol",
                "AI Voice Agents",
                "WhatsApp Business API",
                "API Integrations",
                "Go To Market Engineering",
                "Lead Generation Automation",
                "Workflow Automation",
                "Physical AI",
                "Robotics",
                "ROS2",
                "Embedded Systems",
            ],
            worksFor: {
                "@type": "Organization",
                name: "TAP Innovations",
                url: "https://tapinnov.com/",
            },
            alumniOf: {
                "@type": "Organization",
                name: "Guru Gobind Singh Indraprastha University",
            },
        },
        {
            "@type": "WebSite",
            "@id": siteId,
            url: SITE.url,
            name: `${SITE.name} — ${SITE.role}`,
            description: SITE.tagline,
            publisher: { "@id": personId },
            inLanguage: "en",
        },
        {
            "@type": "ProfessionalService",
            "@id": serviceId,
            name: `${SITE.name} — AI Solutions & Automation`,
            url: SITE.url,
            image: `${SITE.url}/ayush.JPG`,
            description:
                "Freelance AI solution architecture and go-to-market engineering: AI agents, voice bots, RAG systems, MCP servers, lead generation, workflow automation and Physical AI robotics.",
            founder: { "@id": personId },
            provider: { "@id": personId },
            email: `mailto:${SITE.email}`,
            potentialAction: {
                "@type": "ReserveAction",
                name: "Book a free scope call",
                target: {
                    "@type": "EntryPoint",
                    urlTemplate: SITE.booking,
                    actionPlatform: "http://schema.org/DesktopWebPlatform",
                },
            },
            areaServed: {
                "@type": "Place",
                name: "Worldwide (remote)",
            },
            hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "AI & Automation Services",
                itemListElement: SERVICES.map((s) => ({
                    "@type": "Offer",
                    itemOffered: {
                        "@type": "Service",
                        name: s.title,
                        description: s.summary,
                        serviceType: s.title,
                        provider: { "@id": personId },
                    },
                })),
            },
        },
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": graph,
                }),
            }}
        />
    );
}
