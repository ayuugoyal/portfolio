import { NextResponse, type NextRequest } from "next/server";

/** HTML route -> its markdown twin. */
const MARKDOWN: Record<string, string> = {
    "/": "/index.md",
    "/forward-deployed-engineer": "/forward-deployed-engineer.md",
    "/robotics": "/robotics.md",
    "/services": "/llms-full.txt",
};

/**
 * Content negotiation for agents.
 *
 * A client that explicitly prefers markdown over HTML gets the markdown build
 * of the page. Browsers always send `text/html` ahead of anything else, so
 * they are unaffected; only clients that ask for markdown are rewritten.
 */
export function middleware(request: NextRequest) {
    const accept = request.headers.get("accept") ?? "";
    const target = MARKDOWN[request.nextUrl.pathname];

    const wantsMarkdown =
        accept.includes("text/markdown") &&
        !accept.includes("text/html") &&
        !accept.includes("*/*");

    if (target && wantsMarkdown) {
        return NextResponse.rewrite(new URL(target, request.url));
    }

    // Advertise the markdown twin to every client, so agents can discover it
    // from a plain HEAD request without parsing the HTML.
    const res = NextResponse.next();
    if (target) res.headers.set("Link", `<${target}>; rel="alternate"; type="text/markdown"`);
    return res;
}

export const config = {
    matcher: ["/", "/forward-deployed-engineer", "/robotics", "/services"],
};
