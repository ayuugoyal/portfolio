import { SITE } from "@/lib/site";
import { OG_SIZE, renderOg } from "@/lib/og";

export const runtime = "edge";
export const alt = `Hire ${SITE.name} — freelance Forward Deployed Engineer`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
    return renderOg({
        kicker: "freelance · remote worldwide",
        title: "Forward Deployed Engineer",
        subtitle: `${SITE.name}, for hire`,
        tags: "embed with your team · ship AI into production · agents · WhatsApp & voice · RAG · integrations",
    });
}
