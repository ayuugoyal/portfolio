import { Github, Globe, Video } from "lucide-react";
import type { ProjectLink } from "@/lib/site";

/** site.ts stores links as plain data; the cards need an icon per link type. */
export function withIcons(links: ProjectLink[]) {
    return links.map((l) => ({
        ...l,
        icon:
            l.type === "Github" ? (
                <Github className="size-3" />
            ) : l.type === "Demo Video" ? (
                <Video className="size-3" />
            ) : (
                <Globe className="size-3" />
            ),
    }));
}
