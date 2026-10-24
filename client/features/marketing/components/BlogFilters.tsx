"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { BlogMetaBadges } from "@/features/marketing/components/BlogMetaBadges";
import {
  BlogAuthorByline,
  BlogPostCard,
  BlogReadArticleLink,
} from "@/features/marketing/components/BlogPostCard";
import {
  BLOG_POSTS,
  FEATURED_POST,
} from "@/features/marketing/lib/blog-posts";
import { marketingEase } from "@/features/marketing/lib/motion";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "healthy-aging", label: "Healthy Aging" },
  { id: "caregiving", label: "Caregiving Tips" },
] as const;

type BlogFilterId = (typeof FILTERS)[number]["id"];

function BlogFadeIn({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  hidden,
  "data-category": dataCategory,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article";
  hidden?: boolean;
  "data-category"?: string;
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = Tag === "article" ? motion.article : motion.div;

  if (reduceMotion) {
    const StaticTag = Tag === "article" ? "article" : "div";
    return (
      <StaticTag
        className={className}
        hidden={hidden}
        data-category={dataCategory}
      >
        {children}
      </StaticTag>
    );
  }

  return (
    <MotionTag
      className={className}
      hidden={hidden}
      data-category={dataCategory}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: marketingEase }}
    >
      {children}
    </MotionTag>
  );
}

export function BlogFilters() {
  const [filter, setFilter] = useState<BlogFilterId>("all");

  return (
    <div>
      <BlogFadeIn as="article" className="featured-post" delay={0.1}>
        <div className="featured-media">
          <Link
            href={FEATURED_POST.href}
            className="post-media-link"
            aria-label={FEATURED_POST.title}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FEATURED_POST.image}
            alt=""
            className="post-media-img"
          />
          <span className="read-time-chip read-time-chip--featured">
            {FEATURED_POST.readTime}
          </span>
        </div>
        <div className="featured-body">
          <BlogMetaBadges category={FEATURED_POST.tag} />
          <h2 className="featured-title">
            <Link href={FEATURED_POST.href}>{FEATURED_POST.title}</Link>
          </h2>
          <p className="featured-excerpt">{FEATURED_POST.excerpt}</p>
          <BlogAuthorByline
            name={FEATURED_POST.author.name}
            initials={FEATURED_POST.author.initials}
            date={FEATURED_POST.date}
          />
          <BlogReadArticleLink href={FEATURED_POST.href} />
        </div>
      </BlogFadeIn>

      <BlogFadeIn className="filter-bar" delay={0.22}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={FILTERS}
          ariaLabel="Filter posts by category"
          layoutId="blogCategoryFilter"
        />
      </BlogFadeIn>

      <div className="post-grid">
        {BLOG_POSTS.map((post, index) => {
          const hidden = filter !== "all" && post.category !== filter;
          return (
            <BlogFadeIn
              key={post.slug}
              delay={0.32 + index * 0.14}
              hidden={hidden}
            >
              <BlogPostCard post={post} />
            </BlogFadeIn>
          );
        })}
      </div>
    </div>
  );
}
