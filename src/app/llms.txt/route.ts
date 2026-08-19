import { llmsTxt } from "@/lib/markdown";

export const dynamic = "force-static";

/** llms.txt — the short index for LLM crawlers. See llmstxt.org */
export function GET() {
    return new Response(llmsTxt(), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
