import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * AI crawlers are allowed on purpose.
 *
 * Being cited by ChatGPT, Claude, Perplexity and AI Overviews is the point of
 * this site — it is a shop window, not a paywall. The training-data crawlers
 * (GPTBot, ClaudeBot, CCBot, Google-Extended) are listed explicitly so the
 * intent is unambiguous rather than relying on the wildcard.
 */
const AI_CRAWLERS = [
    // OpenAI
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    // Anthropic
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "anthropic-ai",
    // Perplexity
    "PerplexityBot",
    "Perplexity-User",
    // Google / Apple / Meta
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
    "meta-externalagent",
    // Others
    "CCBot",
    "cohere-ai",
    "Amazonbot",
    "Bytespider",
    "DuckAssistBot",
    "YouBot",
    "Diffbot",
    "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
            ...AI_CRAWLERS.map((userAgent) => ({
                userAgent,
                allow: "/",
            })),
        ],
        sitemap: `${SITE.url}/sitemap.xml`,
        host: SITE.url,
    };
}
