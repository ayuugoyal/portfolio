import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import DotPattern from "@/components/magicui/dot-pattern";
import { Navbar } from "@/components/Navbar";
import { StructuredData } from "@/components/structured-data";
import { Space_Grotesk, Syne, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { KEYWORDS, SITE } from "@/lib/site";

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

const TITLE = `${SITE.name} — ${SITE.role}`;
const DESCRIPTION =
    "Freelance AI Solution Architect & GTM Engineer. I build AI agents, bilingual voice agents, RAG systems, MCP servers, lead-generation and workflow automation, and Physical AI robotics. Available for contract work, remote worldwide.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {
        default: TITLE,
        template: `%s — ${SITE.name}`,
    },
    description: DESCRIPTION,
    keywords: KEYWORDS,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    applicationName: SITE.name,
    category: "technology",
    alternates: {
        canonical: "/",
        types: {
            "text/markdown": `${SITE.url}/index.md`,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: SITE.url,
        siteName: TITLE,
        title: TITLE,
        description: DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        creator: "@ayuugoyal",
        site: "@ayuugoyal",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦾</text></svg>",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
    ],
    width: "device-width",
    initialScale: 1,
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
            <head>
                <link
                    rel="alternate"
                    type="text/markdown"
                    href="/index.md"
                    title="This page as markdown"
                />
                <link
                    rel="alternate"
                    type="text/plain"
                    href="/llms.txt"
                    title="llms.txt"
                />
                <StructuredData />
            </head>
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
