import { Metadata } from 'next';
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowUpRight, Download, ExternalLink, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Resume - Ayush Goyal',
  description: 'AI Engineer & Robotics Software Engineer Resume',
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
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Portfolio
            </Link>
          </BlurFade>

          <BlurFadeText
            delay={BLUR_FADE_DELAY * 2}
            className="text-3xl font-bold tracking-tighter sm:text-4xl"
            yOffset={8}
            text="Resume"
          />

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
              AI Engineer & Robotics Software Engineer with a passion for building innovative solutions.
            </div>
          </BlurFade>

          {/* Action Buttons */}
          <BlurFade delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap gap-3">
            <Link
              href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google Drive
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>

            <Link
              href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
              className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Link>

            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">AI Engineer</Badge>
              <Badge variant="secondary">Robotics</Badge>
              <Badge variant="secondary">Full Stack</Badge>
            </div>
          </BlurFade>
        </div>

        {/* PDF Viewer Container */}
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <div className="relative bg-card rounded-lg border overflow-hidden">
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
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Looking for more details about my experience and projects?
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