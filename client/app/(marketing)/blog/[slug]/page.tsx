import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { btnPrimary, section, wrap } from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/BlogFilters.blog.css";
import "@/features/marketing/components/sections/what-is.css";

const POSTS: Record<
  string,
  {
    title: string;
    description: string;
    category: string;
    meta: string;
  }
> = {
  "aging-well-at-home": {
    title: 'What "aging well" really looks like at home',
    description:
      "Sample blog post template for Nivarak insights on independent aging.",
    category: "Healthy Aging",
    meta: "By [Author Name] · [Month Day, Year] · [X] min read",
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Blog post" };
  return {
    title: `[Sample Post] ${post.title}`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <main id="main">
      <article className={cn(section, "what-is")}>
        <div className={wrap}>
          <div
            className="post-hero-img"
            role="img"
            aria-label="Decorative placeholder for post hero image"
          >
            Article
          </div>

          <header className="article-header">
            <span className="category-tag">{post.category}</span>
            <h1>{post.title}</h1>
            <p className="post-meta">{post.meta}</p>
          </header>

          <div className="article-body">
            <p>
              Aging well is rarely a dramatic milestone. It&apos;s quieter:
              walking to the kitchen without hesitation, remembering a medication
              routine, finishing a meal, sleeping through the night, staying
              connected with people who matter.
            </p>
            <p>
              Families often notice changes one at a time — and explain them away
              as &ldquo;just age.&rdquo; On their own, each change can look
              ordinary. Together, they can signal that independence needs support
              before a crisis forces the issue.
            </p>

            <h2>What families can watch for</h2>
            <p>
              [Placeholder body] Look for shifts in mobility and balance,
              appetite, mood, sleep, and social engagement. None of these require
              a clinical vocabulary — only attentive care and a place to bring
              concerns.
            </p>
            <p>
              [Placeholder body] When those signals are gathered into one view —
              like an Independent Aging Score™ — families and clinicians can act
              earlier, with less guesswork.
            </p>

            <h2>From worry to a plan</h2>
            <p>
              [Placeholder body] A structured assessment doesn&apos;t replace your
              parent&apos;s doctor. It adds the continuous layer between visits:
              clarity, a personalized plan, and monitoring that catches trends
              while they&apos;re still reversible.
            </p>
            <p>
              If you&apos;re unsure whether it&apos;s &ldquo;time,&rdquo; start
              with a conversation — and an assessment designed for independence,
              not just illness.
            </p>

            <p>
              <Link className={btnPrimary} href="/contact#book">
                Book an Assessment
              </Link>
            </p>
          </div>

          <aside className="related-posts" aria-labelledby="related-title">
            <h2 id="related-title">Related posts</h2>
            <div className="post-grid">
              <article className="post-card" data-category="caregiving">
                <div className="post-thumb" aria-hidden="true">
                  02
                </div>
                <div className="post-body-pad">
                  <span className="category-tag">Caregiving Tips</span>
                  <h3>
                    <Link href="/blog">
                      [Post] How to talk to parents about getting assessed
                    </Link>
                  </h3>
                  <p className="post-meta">By [Author] · [Date]</p>
                </div>
              </article>
              <article className="post-card" data-category="medical">
                <div className="post-thumb" aria-hidden="true">
                  03
                </div>
                <div className="post-body-pad">
                  <span className="category-tag">Medical Insights</span>
                  <h3>
                    <Link href="/blog">
                      [Post] Why one score can clarify ten domains
                    </Link>
                  </h3>
                  <p className="post-meta">By [Author] · [Date]</p>
                </div>
              </article>
              <article className="post-card" data-category="stories">
                <div className="post-thumb" aria-hidden="true">
                  04
                </div>
                <div className="post-body-pad">
                  <span className="category-tag">Family Stories</span>
                  <h3>
                    <Link href="/blog">
                      [Post] Supporting parents from another city
                    </Link>
                  </h3>
                  <p className="post-meta">By [Author] · [Date]</p>
                </div>
              </article>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
