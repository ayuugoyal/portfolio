import { fdeMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";

/** Markdown twin of /forward-deployed-engineer, also served there via Accept: text/markdown. */
export function GET() {
    return new Response(fdeMarkdown(), {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
            "X-Robots-Tag": "all",
        },
    });
}
