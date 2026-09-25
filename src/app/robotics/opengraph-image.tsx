import { SITE } from "@/lib/site";
import { OG_SIZE, renderOg } from "@/lib/og";

export const runtime = "edge";
export const alt = `Robots built by ${SITE.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
    return renderOg({
        kicker: "side projects · physical ai",
        title: "Robots I build",
        subtitle: SITE.name,
        tags: "ROS2 6-DOF arm · SCARA · ArduPilot voice control · IoT sensors · patented pneumatic gripper",
    });
}
