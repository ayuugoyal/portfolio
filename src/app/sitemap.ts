import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PAGES: [path: string, freq: "weekly" | "monthly" | "yearly", priority: number][] = [
    ["/", "weekly", 1],
    ["/forward-deployed-engineer", "monthly", 0.95],
    ["/robotics", "monthly", 0.85],
    ["/services", "monthly", 0.8],
    ["/resume", "monthly", 0.7],
    ["/patents/6450987", "yearly", 0.6],
    ["/index.md", "weekly", 0.5],
    ["/forward-deployed-engineer.md", "monthly", 0.5],
    ["/robotics.md", "monthly", 0.5],
    ["/llms.txt", "weekly", 0.5],
    ["/llms-full.txt", "weekly", 0.5],
];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return PAGES.map(([path, changeFrequency, priority]) => ({
        url: `${SITE.url}${path === "/" ? "/" : path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }));
}
