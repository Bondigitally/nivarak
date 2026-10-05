"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { btn } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/components/BlogFilters.blog.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "healthy-aging", label: "Healthy Aging" },
  { id: "caregiving", label: "Caregiving Tips" },
  { id: "medical", label: "Medical Insights" },
  { id: "stories", label: "Family Stories" },
] as const;

const POSTS = [
  {
    category: "healthy-aging",
    tag: "Healthy Aging",
    thumb: "01",
    title: "[Post] Small changes that matter before a fall",
    excerpt:
      "[Placeholder] How mobility, nutrition, and sleep quietly shape fall risk — and what to notice early.",
    href: "/blog/aging-well-at-home",
  },
  {
    category: "caregiving",
    tag: "Caregiving Tips",
    thumb: "02",
    title: "[Post] How to talk to parents about getting assessed",
    excerpt:
      "[Placeholder] Language that feels respectful — and opens the door to proactive care.",
    href: "/blog/aging-well-at-home",
  },
  {
    category: "medical",
    tag: "Medical Insights",
    thumb: "03",
    title: "[Post] Why one score can clarify ten domains of health",
    excerpt:
      "[Placeholder] A plain-language introduction to whole-person assessment for families.",
    href: "/blog/aging-well-at-home",
  },
  {
    category: "stories",
    tag: "Family Stories",
    thumb: "04",
    title: "[Post] Supporting parents from another city",
    excerpt:
      "[Placeholder] How remote families stay involved when care is continuous and clear.",
    href: "/blog/aging-well-at-home",
  },
  {
    category: "healthy-aging",
    tag: "Healthy Aging",
    thumb: "05",
    title: "[Post] Nutrition signals families often miss",
    excerpt:
      "[Placeholder] Appetite, weight, and hydration — quiet markers that deserve attention.",
    href: "/blog/aging-well-at-home",
  },
  {
    category: "caregiving",
    tag: "Caregiving Tips",
    thumb: "06",
    title: "[Post] Building a simple family care rhythm",
    excerpt:
      "[Placeholder] Check-ins, shared notes, and when to involve a clinical partner.",
    href: "/blog/aging-well-at-home",
  },
] as const;

export function BlogFilters() {
  const [filter, setFilter] = useState<string>("all");
  const [subscribed, setSubscribed] = useState(false);

  function onNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>(
      'input[type="email"]',
    );
    if (!input?.value.trim()) {
      input?.focus();
      return;
    }
    e.currentTarget.reset();
    setSubscribed(true);
  }

  return (
    <>
      <article className="featured-post">
        <div className="featured-thumb" aria-hidden="true">
          Featured
        </div>
        <div className="post-body-pad">
          <span className="category-tag">Healthy Aging</span>
          <h2>
            <Link href="/blog/aging-well-at-home">
              [Featured] What &ldquo;aging well&rdquo; really looks like at home
            </Link>
          </h2>
          <p className="excerpt">
            [Placeholder excerpt] A clear look at the everyday signals families
            can watch — and how a structured score helps turn worry into a plan.
          </p>
          <p className="post-meta">By [Author] · [Month Day, Year]</p>
        </div>
      </article>

      <div className="filter-bar" role="toolbar" aria-label="Filter posts by category">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="filter-btn"
            data-filter={f.id}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="post-grid">
        {POSTS.map((post) => {
          const hidden = filter !== "all" && post.category !== filter;
          return (
            <article
              key={post.thumb}
              className="post-card"
              data-category={post.category}
              hidden={hidden}
            >
              <div className="post-thumb" aria-hidden="true">
                {post.thumb}
              </div>
              <div className="post-body-pad">
                <span className="category-tag">{post.tag}</span>
                <h3>
                  <Link href={post.href}>{post.title}</Link>
                </h3>
                <p className="excerpt">{post.excerpt}</p>
                <p className="post-meta">By [Author] · [Date]</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="newsletter" aria-labelledby="newsletter-title">
        <h2 id="newsletter-title">Stay informed</h2>
        <p>
          Occasional insights on independent aging — no spam. Front-end capture
          only for now.
        </p>
        <form
          id="newsletter-form"
          className="newsletter-form"
          onSubmit={onNewsletter}
        >
          <label className="visually-hidden" htmlFor="newsletter-email">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="Your email"
            required
            autoComplete="email"
          />
          <button type="submit" className={btn}>
            Subscribe
          </button>
        </form>
        <p
          id="newsletter-success"
          className={`newsletter-success${subscribed ? " is-visible" : ""}`}
          role="status"
        >
          Thanks — you&apos;re on the list (demo only).
        </p>
      </div>
    </>
  );
}
