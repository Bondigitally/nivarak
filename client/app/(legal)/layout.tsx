import { MarketingHashScroll } from "@/features/marketing/components/MarketingHashScroll";
import { SiteFooter } from "@/features/marketing/components/SiteFooter";
import { SiteHeader } from "@/features/marketing/components/SiteHeader";
import {
  section,
  skipLink,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/styles/tokens.css";
import "@/features/marketing/styles/base.css";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <MarketingHashScroll />
      <a className={skipLink} href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={cn(section, "flex-1")}>
        <div className={wrap}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
