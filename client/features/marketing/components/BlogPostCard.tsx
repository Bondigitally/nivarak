import Link from "next/link";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { BlogMetaBadges } from "@/features/marketing/components/BlogMetaBadges";
import type { BlogPost } from "@/features/marketing/lib/blog-posts";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/BlogFilters.blog.css";

export function BlogAuthorByline({
  name,
  initials,
  date,
  size = "md",
}: {
  name: string;
  initials: string;
  date: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("post-author", size === "sm" && "post-author--sm")}>
      <span className="post-avatar" aria-hidden="true">
        {initials}
      </span>
      <div className="post-author-text">
        <p className="post-author-name">{name}</p>
        <p className="post-author-date">{date}</p>
      </div>
    </div>
  );
}

export function BlogReadArticleLink({ href }: { href: string }) {
  return (
    <Link href={href} className="post-card-cta">
      <span className="post-card-cta-label">Read Article</span>
      <AppIcon icon={ArrowRight02Icon} size={16} aria-hidden />
    </Link>
  );
}

type BlogPostCardProps = {
  post: BlogPost;
  className?: string;
  /** Hide excerpt (related rails keep cards tighter). Default: show. */
  showExcerpt?: boolean;
};

export function BlogPostCard({
  post,
  className,
  showExcerpt = true,
}: BlogPostCardProps) {
  return (
    <article className={cn("post-card", className)} data-category={post.category}>
      <div className="post-media">
        <Link
          href={post.href}
          className="post-media-link"
          aria-label={post.title}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt="" className="post-media-img" />
        <span className="read-time-chip">{post.readTime}</span>
      </div>
      <div className="post-body">
        <BlogMetaBadges category={post.tag} />
        <h3 className="post-title">
          <Link href={post.href}>{post.title}</Link>
        </h3>
        {showExcerpt ? <p className="post-excerpt">{post.excerpt}</p> : null}
        <BlogAuthorByline
          name={post.author.name}
          initials={post.author.initials}
          date={post.date}
          size="sm"
        />
        <BlogReadArticleLink href={post.href} />
      </div>
    </article>
  );
}
