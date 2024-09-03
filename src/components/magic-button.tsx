"use client";
import React from "react";
import { CoolMode } from "./magicui/cool-mode";
import { Button } from "./ui/button";
import ShimmerButton from "./magicui/shimmer-button";
import AnimatedGradientText from "./magicui/animated-gradient-text";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

function MagicButton() {
    return (
        <CoolMode>
            <Button variant="magic" size="icon">
                <div
                    className={`absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
                />
                <span
                    className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                    )}
                >
                    <Heart color="#ffaa40" />
                </span>
            </Button>
        </CoolMode>
    );
}

export default MagicButton;
