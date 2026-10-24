import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
  type BlogPostBodyBlock,
} from "@/features/marketing/lib/blog-posts";
import { BlogMetaBadges } from "@/features/marketing/components/BlogMetaBadges";
import { BlogPostCard } from "@/features/marketing/components/BlogPostCard";
import { section, wrap } from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/BlogFilters.blog.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function renderBlock(block: BlogPostBodyBlock, index: number) {
  switch (block.type) {
    case "p":
      return <p key={index}>{block.text}</p>;
    case "h2":
      return <h2 key={index}>{block.text}</h2>;
    case "ul":
      return (
        <ul key={index} className="article-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="article-list article-list--numbered">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "numbered":
      return (
        <ol key={index} className="article-list article-list--steps">
          {block.items.map((item, stepIndex) => (
            <li key={item.title}>
              <p className="article-step-title">
                <span className="article-step-num" aria-hidden="true">
                  {stepIndex + 1}.
                </span>{" "}
                {item.title}
              </p>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      );
    case "author":
      return (
        <footer key={index} className="article-byline">
          <p className="article-byline-name">{block.name}</p>
          {block.lines.map((line) => (
            <p key={line} className="article-byline-meta">
              {line}
            </p>
          ))}
        </footer>
      );
    default:
      return null;
  }
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Blog post" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.category, post.slug);

  return (
    <main id="main">
      <article className={cn(section, "blog")}>
        <div className={wrap}>
          <div className="post-hero-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="post-media-img" />
          </div>

          <header className="article-header">
            <BlogMetaBadges
              category={post.tag}
              date={post.date}
              readTime={post.readTime}
            />
            <h1>{post.title}</h1>
            <p className="post-meta">
              By {post.author.name}
              {post.author.credentials
                ? ` · ${post.author.credentials}`
                : ""}
            </p>
          </header>

          <div className="article-body">
            {post.body.map(renderBlock)}
          </div>

          {related.length > 0 ? (
            <aside className="related-posts" aria-labelledby="related-title">
              <h2 id="related-title">Related posts</h2>
              <div className="post-grid">
                {related.map((relatedPost) => (
                  <BlogPostCard
                    key={relatedPost.slug}
                    post={relatedPost}
                    showExcerpt={false}
                  />
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </article>
    </main>
  );
}
