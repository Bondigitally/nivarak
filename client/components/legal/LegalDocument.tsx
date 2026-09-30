import Link from "next/link";
import { typo } from "@/lib/tokens/typography";

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  showBackLink?: boolean;
}

export function LegalDocument({
  title,
  lastUpdated,
  children,
  showBackLink = true,
}: LegalDocumentProps) {
  return (
    <article className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className={typo.headingXxl}>{title}</h1>
        <p className={typo.bodyM}>Last updated {lastUpdated}</p>
      </div>

      <div className={`flex flex-col gap-6 ${typo.bodyL}`}>{children}</div>

      {showBackLink && (
        <Link href="/register" className={typo.link}>
          Back to registration
        </Link>
      )}
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={typo.headingM}>{title}</h2>
      {children}
    </section>
  );
}
