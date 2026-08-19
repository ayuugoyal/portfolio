import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#0b0b0d",
                    padding: "72px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "999px",
                            backgroundColor: "#c6f721",
                            display: "flex",
                        }}
                    />
                    <div
                        style={{
                            color: "#8b8b93",
                            fontSize: "26px",
                            letterSpacing: "0.06em",
                        }}
                    >
                        available for freelance &amp; contract work
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            color: "#fafaf9",
                            fontSize: "84px",
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                        }}
                    >
                        Ayush Goyal
                    </div>
                    <div
                        style={{
                            color: "#c6f721",
                            fontSize: "46px",
                            fontWeight: 600,
                            marginTop: "10px",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        AI Solution Architect &amp; GTM Engineer
                    </div>
                    <div
                        style={{
                            color: "#a1a1aa",
                            fontSize: "30px",
                            marginTop: "26px",
                            lineHeight: 1.4,
                            maxWidth: "960px",
                        }}
                    >
                        AI agents · voice agents · RAG · MCP servers · lead generation ·
                        automation · Physical AI
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#71717a",
                        fontSize: "26px",
                    }}
                >
                    <div>ayuugoyal.tech</div>
                    <div>remote worldwide</div>
                </div>
            </div>
        ),
        { ...size }
    );
}
