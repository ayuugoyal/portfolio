import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** One share-card layout for every page, so previews read as one brand. */
export function renderOg({
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
                    <div style={{ color: "#8b8b93", fontSize: "26px", letterSpacing: "0.06em" }}>
                        {kicker}
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
                        {title}
                    </div>
                    <div
                        style={{
                            color: "#c6f721",
                            fontSize: "44px",
                            fontWeight: 600,
                            marginTop: "10px",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {subtitle}
                    </div>
                    <div
                        style={{
                            color: "#a1a1aa",
                            fontSize: "30px",
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
                        color: "#71717a",
                        fontSize: "26px",
                    }}
                >
                    <div>ayuugoyal.tech</div>
                    <div>remote worldwide</div>
                </div>
            </div>
        ),
        { ...OG_SIZE }
    );
}
