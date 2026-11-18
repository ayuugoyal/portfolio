import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Mascot } from "@/components/mascot/mascot";
import { StructuredData } from "@/components/structured-data";
import { Inter, Newsreader, JetBrains_Mono, Silkscreen } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { KEYWORDS, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const fontDisplay = Newsreader({
    subsets: ["latin"],
    weight: ["500"],
    style: ["normal", "italic"],
    variable: "--font-display",
    display: "swap",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

// tiny pixel accents only — never body text
const fontPixel = Silkscreen({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-pixel",
    display: "swap",
    preload: false,
});

const TITLE = `${SITE.name} — ${SITE.role}`;
const DESCRIPTION =
    "Ayush Goyal — freelance Forward Deployed Engineer for AI and robotics, and full-time AI Engineer. Embeds with your team to ship AI agents, voice agents, RAG, MCP servers and integrations into production. Remote worldwide.";

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
            "text/plain": `${SITE.url}/llms.txt`,
        },
    },
    openGraph: {
        type: "profile",
        firstName: "Ayush",
        lastName: "Goyal",
        username: "ayuugoyal",
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
        { media: "(prefers-color-scheme: light)", color: "#F5F1E8" },
        { media: "(prefers-color-scheme: dark)", color: "#1C1B19" },
    ],
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="author" href={`${SITE.url}/#person`} />
                <link rel="me" href={SITE.socials.github} />
                <link rel="me" href={SITE.socials.linkedin} />
                <link rel="me" href={SITE.socials.x} />
                <StructuredData />
            </head>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased py-12 sm:py-20",
                    fontSans.variable,
                    fontDisplay.variable,
                    fontMono.variable,
                    fontPixel.variable
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    disableTransitionOnChange
                >
                    <Navbar />
                    <Mascot />
                    {children}
                    <Analytics />
                </ThemeProvider>
            </body>
        </html>
    );
}
