import { siteMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";

/**
 * The homepage as real markdown, served as `text/markdown`.
 *
 * Middleware also rewrites `/` here when a client sends
 * `Accept: text/markdown`, so agents can content-negotiate instead of
 * scraping the rendered DOM.
 */
export function GET() {
    return new Response(siteMarkdown(), {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
            "X-Robots-Tag": "all",
        },
    });
}
