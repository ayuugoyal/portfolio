import { ImageResponse } from "next/og";
import { FRAMES, SIZE, toPaths } from "@/lib/mascot-sprite";

export const OG_SIZE = { width: 1200, height: 630 };

/* Light "paper" palette, mirroring the site tokens. Satori takes literal colours. */
const PAPER = "#F5F1E8";
const INK = "#1F1E1B";
const CLAY = "#C96442"; // fills
const CLAY_INK = "#A34A2C"; // clay as text
const GREY = "#6B655B";

/** The mascot's idle frame as SVG paths, 8px per sprite pixel. */
const MASCOT = toPaths(FRAMES.idle);
const MASCOT_PX = SIZE * 8;

/*
 * Static WOFF files (satori can't read woff2 or variable fonts). Loaded with
 * fetch(new URL(..., import.meta.url)) so the edge bundle includes them.
 * Fetched on first render and reused for the life of the isolate.
 */
let fontsPromise: Promise<[ArrayBuffer, ArrayBuffer]> | null = null;
function loadFonts() {
    fontsPromise ??= Promise.all([
        fetch(new URL("./fonts/newsreader-latin-500-normal.woff", import.meta.url)).then((r) =>
            r.arrayBuffer()
        ),
        fetch(new URL("./fonts/inter-latin-400-normal.woff", import.meta.url)).then((r) =>
            r.arrayBuffer()
        ),
    ]).catch((err) => {
        fontsPromise = null; // let the next request retry
        throw err;
    });
    return fontsPromise;
}

/** One share-card layout for every page, so previews read as one brand. */
export async function renderOg({
    kicker,
    title,
    subtitle,
    tags,
}: {
    kicker: string;
    title: string;
    subtitle: string;
    tags: string;
}) {
    const [newsreader, inter] = await loadFonts();

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: PAPER,
                    padding: "72px",
                    fontFamily: "Inter",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        {/* square clay pixel, same as the site's markers */}
                        <div
                            style={{
                                width: "14px",
                                height: "14px",
                                backgroundColor: CLAY,
                                display: "flex",
                            }}
                        />
                        <div style={{ color: GREY, fontSize: "26px", letterSpacing: "0.02em" }}>
                            {kicker}
                        </div>
                    </div>
                    {/* the site mascot, idle frame */}
                    <svg
                        width={MASCOT_PX}
                        height={MASCOT_PX}
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        shapeRendering="crispEdges"
                    >
                        <path d={MASCOT.brand} fill={CLAY} />
                        <path d={MASCOT.visor} fill={INK} />
                        <path d={MASCOT.eye} fill={PAPER} />
                    </svg>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            color: INK,
                            fontFamily: "Newsreader",
                            fontSize: "88px",
                            fontWeight: 500,
                            lineHeight: 1.05,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            color: CLAY_INK,
                            fontFamily: "Newsreader",
                            fontSize: "44px",
                            fontWeight: 500,
                            marginTop: "12px",
                        }}
                    >
                        {subtitle}
                    </div>
                    <div
                        style={{
                            color: GREY,
                            fontSize: "28px",
                            marginTop: "26px",
                            lineHeight: 1.4,
                            maxWidth: "980px",
                        }}
                    >
                        {tags}
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: GREY,
                        fontSize: "24px",
                    }}
                >
                    <div>ayuugoyal.tech</div>
                    <div>remote worldwide</div>
                </div>
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [
                { name: "Newsreader", data: newsreader, weight: 500, style: "normal" },
                { name: "Inter", data: inter, weight: 400, style: "normal" },
            ],
        }
    );
}
