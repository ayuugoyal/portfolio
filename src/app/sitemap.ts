import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return [
        {
            url: `${SITE.url}/`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${SITE.url}/services`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${SITE.url}/resume`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${SITE.url}/patents/6450987`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.6,
        },
        {
            url: `${SITE.url}/index.md`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.5,
        },
        {
            url: `${SITE.url}/llms.txt`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.5,
        },
        {
            url: `${SITE.url}/llms-full.txt`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];
}
