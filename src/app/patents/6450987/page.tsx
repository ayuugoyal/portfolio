import { Metadata } from 'next';
import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { ArrowUpRight, Download, ChevronLeft, FileText, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: 'UK Design 6450987 — Pneumatic Four-Finger Robotic Gripper',
  description: 'UK Design Registration 6450987 by Ayush Goyal: a 3D-printed, pneumatically actuated four-finger adaptive gripper for industrial robots. Registered 13 June 2025, granted 30 June 2025.',
  alternates: { canonical: '/patents/6450987' },
};

const BLUR_FADE_DELAY = 0.04;

export default function PatentPage() {
  // certificate PDF served from /public (no Drive)
  const pdf = "/patents/uk-design-6450987.pdf";
  const officialPatentUrl = 'https://www.registered-design.service.gov.uk/find/6450987';

  return (
    <div className="px-5 py-8">
      <section className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <Link
              href="/"
              className="inline-flex items-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              back to portfolio
            </Link>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <h1 className="font-display text-4xl font-medium lowercase tracking-[-0.01em] sm:text-5xl">
                  uk design patent
              </h1>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="space-y-2">
              <p className="max-w-4xl text-pretty text-sm font-medium">
                Pneumatically Actuated Four-Finger Adaptive Gripper Industrial Robot
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] lowercase text-muted-foreground">
                <span className="text-foreground">no. 6450987</span>
                <span className="opacity-40">/</span>
                <span>registered 13 jun 2025</span>
                <span className="opacity-40">/</span>
                <span>granted 30 jun 2025</span>
              </div>
            </div>
          </BlurFade>

          {/* Action Buttons */}
          <BlurFade delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap items-center gap-2.5">
            <Link
              href={officialPatentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
            >
              <Shield className="h-3.5 w-3.5" />
              verify on uk ipo
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <Link href={pdf} target="_blank" rel="noopener" className="btn-quiet">
              <FileText className="h-3.5 w-3.5" />
              certificate
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <a href={pdf} download="UK-Design-6450987-Certificate.pdf" className="btn-quiet">
              <Download className="h-3.5 w-3.5" />
              download
            </a>

            <div className="flex flex-wrap gap-1">
              <Badge variant="chip">Robotics</Badge>
              <Badge variant="chip">Industrial Design</Badge>
              <Badge variant="chip">Pneumatic Systems</Badge>
              <Badge variant="chip">UK Patent</Badge>
            </div>
          </BlurFade>
        </div>


        {/* Certificate preview: first page as an image, linking to the full PDF */}
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <Link
            href={pdf}
            target="_blank"
            rel="noopener"
            className="mx-auto block max-w-xl overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-foreground/30"
          >
            <Image
              src="/patents/uk-design-6450987.png"
              alt="UK IPO Certificate of Registration for UK Design 6450987, Pneumatically Actuated Four-Finger Adaptive Gripper Industrial Robot, granted 30 June 2025"
              width={496}
              height={702}
              sizes="(max-width: 576px) 100vw, 576px"
              className="h-auto w-full"
            />
          </Link>
        </BlurFade>

        {/* Technology & Innovation Section */}
        <BlurFade delay={BLUR_FADE_DELAY * 7}>
          <div className="mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-display text-lg font-medium lowercase tracking-[-0.01em]">
                  why it goes hard
                </h3>
                <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
                  Four pneumatically actuated fingers that just conform to whatever
                  they pick up — no reprogramming per object. Precision control plus
                  adaptive grasping, built for messy real-world manufacturing lines.
                </p>
              </div>

              <div className="grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
                {[
                  { value: "4-finger", label: "adaptive design" },
                  { value: "pneumatic", label: "actuation system" },
                  { value: "industrial", label: "robot application" },
                ].map((item) => (
                  <div key={item.label} className="py-3 md:px-4">
                    <div className="font-display text-base font-medium lowercase">
                      {item.value}
                    </div>
                    <div className="font-mono text-[10px] lowercase text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Footer Info */}
        <BlurFade delay={BLUR_FADE_DELAY * 8}>
          <div className="mt-8 border-t border-border pt-4">
            <div className="space-y-2 text-center">
              <p className="font-mono text-[10px] lowercase text-muted-foreground">
                more robots this way
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/#work"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  View More Projects
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#work-experience"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Work Experience
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#what-i-do"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Technical Skills
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#contact"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      <div className="pb-4 pt-12">
        <Footer />
      </div>
    </div>
  );
}