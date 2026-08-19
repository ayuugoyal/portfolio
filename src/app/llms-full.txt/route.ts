import { siteMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";

/** llms-full.txt — the entire site inlined as markdown, no crawling required. */
export function GET() {
    return new Response(siteMarkdown(), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
