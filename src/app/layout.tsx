import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import DotPattern from "@/components/magicui/dot-pattern";
import { Navbar } from "@/components/Navbar";
import { Space_Grotesk, Syne, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

const fontSans = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const fontDisplay = Syne({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    variable: "--font-display",
    display: "swap",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://www.ayuugoyal.tech"),
    title: "Ayush Goyal — I make robots think",
    description:
        "Ayush Goyal — AI engineer building Physical AI. RAG pipelines, MCP servers, ROS2 control stacks, and a patented robotic gripper.",
    icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦾</text></svg>",
    },
};

import { cn } from "@/lib/utils";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased py-12 sm:py-20",
                    fontSans.variable,
                    fontDisplay.variable,
                    fontMono.variable
                )}
            >
                <ThemeProvider attribute="class" defaultTheme="system">
                    <Navbar />
                    {children}
                    <DotPattern
                        width={20}
                        height={20}
                        cx={1}
                        cy={1}
                        cr={1}
                        className={cn(
                            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] -z-10"
                        )}
                    />
                    <SmoothCursor />
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
