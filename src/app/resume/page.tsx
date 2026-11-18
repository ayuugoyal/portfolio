import { Metadata } from 'next';
import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { ArrowUpRight, Download, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Ayush Goyal — Forward Deployed Engineer (freelance), AI Engineer at TAP Innovations, and robot builder.',
  alternates: { canonical: '/resume' },
};

const BLUR_FADE_DELAY = 0.04;

export default function ResumePage() {
  // the PDF is built from LaTeX and served from /public, so the site owns it (no Drive)
  const pdf = "/ayush-goyal-resume.pdf";

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
                  the resume
              </h1>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="max-w-lg text-pretty text-sm text-muted-foreground">
              One page, zero filler. Forward deployed engineer, AI engineer, robot
              builder.
            </div>
          </BlurFade>

          {/* Action Buttons */}
          <BlurFade delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap items-center gap-2.5">
            <Link href={pdf} target="_blank" rel="noopener" className="btn-solid">
              open pdf
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <a href={pdf} download="Ayush-Goyal-Resume.pdf" className="btn-quiet">
              <Download className="h-3.5 w-3.5" />
              download pdf
            </a>

            <div className="flex flex-wrap gap-1">
              <Badge variant="chip">Forward Deployed Engineer</Badge>
              <Badge variant="chip">AI Engineer</Badge>
              <Badge variant="chip">Robotics</Badge>
            </div>
          </BlurFade>
        </div>

        {/* Preview: an image of the one page, linking to the PDF (works on every phone, unlike PDF iframes) */}
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <Link
            href={pdf}
            target="_blank"
            rel="noopener"
            className="group block overflow-hidden rounded-xl border border-border bg-white transition-colors hover:border-foreground/30"
          >
            <Image
              src="/ayush-goyal-resume.png"
              alt="Resume of Ayush Goyal: Forward Deployed Engineer and AI Engineer; projects SO-101 x Claude Code, Raftaar autonomous rover, BCN3D Moveo arm; experience at TAP Innovations and Loadshare Networks"
              width={935}
              height={1210}
              sizes="(max-width: 896px) 100vw, 896px"
              className="h-auto w-full"
              priority
            />
          </Link>
        </BlurFade>

        {/* Footer Info */}
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <div className="mt-8 border-t border-border pt-4">
            <div className="space-y-2 text-center">
              <p className="font-mono text-[10px] lowercase text-muted-foreground">
                want the long version?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/#work-experience"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Work Experience
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#work"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Projects
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/robotics"
                  className="text-sm text-brand-ink underline-offset-4 hover:underline"
                >
                  Robots
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