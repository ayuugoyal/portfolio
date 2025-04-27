"use client";
import React, { useState } from "react";
import { CoolMode } from "./magicui/cool-mode";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useTheme } from "next-themes";

function MagicButton() {
    const [clicked, setClicked] = useState<boolean>(false);
    const { theme } = useTheme();
    return (
        <CoolMode>
            <Button
                variant="magic"
                size="icon"
                onClick={() => {
                    setClicked(!clicked);
                }}
            >
                <div
                    className={`absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:var(--bg-size)_100%] p-[1px] ![mask-composite:subtract] [border-radius:inherit] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]`}
                />
                <span
                    className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                    )}
                >
                    <Heart color="#ffaa40" fill={clicked ? "#ffaa40" : theme == "dark" ? "#000000" : "#ffffff"} />
                </span>
            </Button>
        </CoolMode>
    );
}

export default MagicButton;
