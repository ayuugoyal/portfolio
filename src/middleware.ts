import { NextResponse, type NextRequest } from "next/server";

/**
 * Content negotiation for agents.
 *
 * A client that explicitly prefers markdown over HTML gets the markdown build
 * of the homepage. Browsers always send `text/html` ahead of anything else, so
 * they are unaffected; only clients that ask for markdown are rewritten.
 */
export function middleware(request: NextRequest) {
    const accept = request.headers.get("accept") ?? "";

    const wantsMarkdown =
        accept.includes("text/markdown") &&
        !accept.includes("text/html") &&
        !accept.includes("*/*");

    if (wantsMarkdown) {
        return NextResponse.rewrite(new URL("/index.md", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/",
};
