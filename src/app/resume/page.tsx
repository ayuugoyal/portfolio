import { Metadata } from 'next';
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, Download, ExternalLink, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Resume - Ayush Goyal',
  description: 'Resume of Ayush Goyal — AI Engineer focused on Physical AI & Robotics',
};

const BLUR_FADE_DELAY = 0.04;

export default function ResumePage() {
  const driveFileId = '1wPyEPWPzfSSmk5lwP6279Tt6vzUMp5xT';
  const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;

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

          <BlurFadeText
            delay={BLUR_FADE_DELAY * 2}
            className="font-display text-4xl font-bold lowercase tracking-tight sm:text-5xl"
            yOffset={8}
            text="the resume"
          />

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="max-w-lg text-pretty text-sm text-muted-foreground">
              One page, zero filler. AI engineer doing Physical AI — machines that
              work outside a browser tab.
            </div>
          </BlurFade>

          {/* Action Buttons */}
          <BlurFade delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-solid"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              open in drive
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <Link
              href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
              className="btn-quiet"
            >
              <Download className="h-3.5 w-3.5" />
              download pdf
            </Link>

            <div className="flex flex-wrap gap-1">
              <Badge variant="chip">Physical AI</Badge>
              <Badge variant="chip">Robotics</Badge>
              <Badge variant="chip">AI Engineer</Badge>
            </div>
          </BlurFade>
        </div>

        {/* PDF Viewer Container */}
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-[3/4] w-full min-h-[800px]">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                title="Ayush Goyal - Resume"
                allow="autoplay"
                loading="lazy"
              />
            </div>

            {/* Fallback overlay for loading issues */}
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="text-center space-y-2 pointer-events-auto">
                <p className="text-sm text-muted-foreground">
                  PDF not loading properly?
                </p>
                <div className="flex gap-2 justify-center">
                  <Link
                    href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Externally
                  </Link>
                  <Link
                    href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
                    className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-xs font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
                  className="text-sm text-blue-500 hover:underline"
                >
                  Work Experience
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#projects"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Projects
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#skills"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Skills
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#contact"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>
    </div>
  );
}