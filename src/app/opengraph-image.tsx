import { SITE } from "@/lib/site";
import { OG_SIZE, renderOg } from "@/lib/og";

export const runtime = "edge";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
    return renderOg({
        kicker: "taking freelance fde engagements",
        title: SITE.name,
        subtitle: "Forward Deployed Engineer & AI Engineer",
        tags: "ships AI to production · agents · voice · RAG · integrations · builds robots on the side",
    });
}
