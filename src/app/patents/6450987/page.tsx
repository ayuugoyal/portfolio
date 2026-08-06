import { Metadata } from 'next';
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, Download, ExternalLink, ChevronLeft, FileText, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: 'UK Design Patent - Ayush Goyal',
  description: 'Pneumatically Actuated Four-Finger Adaptive Gripper Industrial Robot - UK Design Registration 6450987',
};

const BLUR_FADE_DELAY = 0.04;

export default function PatentPage() {
  // Replace with your actual Google Drive file ID for the patent PDF
  const driveFileId = '1xsc2_M8KXS3l0ov_KBF9Q9UpacP8zVNp';
  const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
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

          <BlurFadeText
            delay={BLUR_FADE_DELAY * 2}
            className="font-display text-4xl font-bold lowercase tracking-tight sm:text-5xl"
            yOffset={8}
            text="uk design patent"
          />

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="space-y-2">
              <p className="max-w-2xl text-pretty text-sm font-medium">
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

            <Link
              href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-quiet"
            >
              <FileText className="h-3.5 w-3.5" />
              certificate
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <Link
              href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
              className="btn-quiet"
            >
              <Download className="h-3.5 w-3.5" />
              download
            </Link>

            <div className="flex flex-wrap gap-1">
              <Badge variant="chip">Robotics</Badge>
              <Badge variant="chip">Industrial Design</Badge>
              <Badge variant="chip">Pneumatic Systems</Badge>
              <Badge variant="chip">UK Patent</Badge>
            </div>
          </BlurFade>
        </div>


        {/* PDF Viewer Container */}
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-[3/4] w-full min-h-[800px]">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                title="UK Design Patent Certificate - 6450987"
                allow="autoplay"
                loading="lazy"
              />
            </div>

            {/* Fallback overlay for loading issues */}
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="text-center space-y-2 pointer-events-auto">
                <p className="text-sm text-muted-foreground">
                  Patent certificate not loading properly?
                </p>
                <div className="flex gap-2 justify-center">
                  <Link
                    href={officialPatentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Official Record
                  </Link>
                  <Link
                    href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-xs font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Externally
                  </Link>
                  <Link
                    href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
                    className="inline-flex items-center px-3 py-1.5 bg-muted text-muted-foreground rounded text-xs font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Technology & Innovation Section */}
        <BlurFade delay={BLUR_FADE_DELAY * 7}>
          <div className="mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-display text-lg font-bold lowercase tracking-tight">
                  why it goes hard
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
                    <div className="font-display text-base font-bold lowercase">
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
                  href="/#projects"
                  className="text-sm text-blue-500 hover:underline"
                >
                  View More Projects
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#work-experience"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Work Experience
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/#skills"
                  className="text-sm text-blue-500 hover:underline"
                >
                  Technical Skills
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