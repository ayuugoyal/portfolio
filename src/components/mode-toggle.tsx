"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export const ModeToggle = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button>
>(function ModeToggle({ onClick, ...props }, ref) {
    // Switch on the *resolved* theme: with "system" selected, `theme` is
    // "system", so comparing it to "light" always picked dark.
    const { setTheme, resolvedTheme } = useTheme();
    return (
        <Button
            ref={ref}
            variant="ghost"
            className="size-full rounded-full text-foreground"
            size="icon"
            {...props}
            onClick={(e) => {
                onClick?.(e);
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
        >
            <Sun className="h-[1.1rem] w-[1.1rem] dark:hidden" />
            <Moon className="hidden h-[1.1rem] w-[1.1rem] dark:block" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
});
