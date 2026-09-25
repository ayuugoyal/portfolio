import Link from "next/link";
import { SITE } from "@/lib/site";
import { VisitorCount } from "@/components/visitor-count";

/** Every page, one line — cheap for humans to ignore, useful for crawlers. */
const LINKS = [
    { href: "/forward-deployed-engineer", label: "forward deployed engineer" },
    { href: "/robotics", label: "robots" },
    { href: "/services", label: "services" },
    { href: "/resume", label: "resume" },
    { href: "/patents/6450987", label: "patent" },
];
export function Footer() {
    return (
        <footer className="mx-auto w-full max-w-2xl border-t border-border pt-8 text-center">
            <p className="font-display text-sm font-bold tracking-tight">
                {SITE.handle}
            </p>
            <p className="mt-1 font-mono text-[10px] lowercase text-muted-foreground">
                forward deployed engineer · ai engineer · robots
            </p>
            <p className="mt-1.5 font-mono text-[10px] lowercase text-muted-foreground">
                <span className="mr-1.5 inline-flex size-1.5 rounded-full bg-brand align-middle" />
                open for freelance
            </p>

            <nav
                aria-label="Site"
                className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[10px] lowercase text-muted-foreground"
            >
                {LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="hover:text-foreground">
                        {l.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-border pt-4 font-mono text-[10px] lowercase text-muted-foreground sm:flex-row sm:gap-4">
                <span>
                    © {new Date().getFullYear()} {SITE.name.toLowerCase()}
                </span>
                <span className="hidden opacity-30 sm:inline">/</span>
                <Link href="/llms.txt" className="hover:text-foreground">
                    llms.txt
                </Link>
                <Link href="/index.md" className="hover:text-foreground">
                    .md
                </Link>
                <span className="hidden opacity-30 sm:inline">/</span>
                <VisitorCount />
            </div>
        </footer>
    );
}
