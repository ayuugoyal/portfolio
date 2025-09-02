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
            text="UK Design Patent"
          />

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="space-y-2">
              <div className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
                <strong>Pneumatically Actuated Four-Finger Adaptive Gripper Industrial Robot</strong>
              </div>
              <div className="text-xs text-muted-foreground">
                Design Number: 6450987 • Registered: 13 June 2025 • Granted: 30 June 2025
              </div>
            </div>
          </BlurFade>

          {/* Action Buttons */}
          <BlurFade delay={BLUR_FADE_DELAY * 4} className="flex flex-wrap gap-3">
            <Link
              href={officialPatentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Shield className="w-4 h-4 mr-2" />
              Check on Official UK IPO Record
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>

            <Link
              href={`https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Certificate
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>

            <Link
              href={`https://drive.google.com/uc?export=download&id=${driveFileId}`}
              className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Link>

            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">Robotics</Badge>
              <Badge variant="secondary">Industrial Design</Badge>
              <Badge variant="secondary">Pneumatic Systems</Badge>
              <Badge variant="secondary">UK Patent</Badge>
            </div>
          </BlurFade>
        </div>


        {/* PDF Viewer Container */}
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <div className="relative bg-card rounded-lg border overflow-hidden">
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
          <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Innovation Highlight</h3>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  This pneumatically actuated four-finger adaptive gripper represents a breakthrough in industrial robotics,
                  combining precision control with adaptive grasping capabilities for complex manufacturing applications.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">4-Finger</div>
                  <div className="text-xs text-muted-foreground">Adaptive Design</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">Pneumatic</div>
                  <div className="text-xs text-muted-foreground">Actuation System</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">Industrial</div>
                  <div className="text-xs text-muted-foreground">Robot Application</div>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Footer Info */}
        <BlurFade delay={BLUR_FADE_DELAY * 8}>
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Interested in my robotics work and other innovative projects?
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