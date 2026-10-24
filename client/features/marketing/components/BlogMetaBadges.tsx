import { Badge } from "@/components/ui/badge";

type BlogMetaBadgesProps = {
  category: string;
  /** Omit when date is shown under the author name on cards. */
  date?: string;
  /** Omit when read time is shown as an image chip on cards. */
  readTime?: string;
};

/** Inline category and optional date / read time — shared badge style. */
export function BlogMetaBadges({
  category,
  date,
  readTime,
}: BlogMetaBadgesProps) {
  return (
    <div className="post-meta-badges">
      <Badge variant="secondary" className="post-meta-badge">
        {category}
      </Badge>
      {date ? (
        <Badge variant="secondary" className="post-meta-badge">
          {date}
        </Badge>
      ) : null}
      {readTime ? (
        <Badge variant="secondary" className="post-meta-badge">
          {readTime}
        </Badge>
      ) : null}
    </div>
  );
}
