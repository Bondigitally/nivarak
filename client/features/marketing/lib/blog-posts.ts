export type BlogAuthor = {
  name: string;
  initials: string;
  credentials?: string;
};

export type BlogPostBodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "numbered"; items: { title: string; text: string }[] }
  | { type: "author"; name: string; lines: string[] };

export type BlogPost = {
  slug: string;
  category: string;
  tag: string;
  title: string;
  excerpt: string;
  href: string;
  image: string;
  author: BlogAuthor;
  date: string;
  readTime: string;
  body: BlogPostBodyBlock[];
};

const AUTHOR_MEETALI: BlogAuthor = {
  name: "Dr Meetali Bidaye",
  initials: "MB",
  credentials: "MRCP, MRCP Nephrology",
};

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: "the-fall-happens-before-the-fall",
    category: "healthy-aging",
    tag: "Healthy Aging",
    title: "The fall happens before the fall",
    excerpt:
      "The causes of a fall often build for months beforehand. Learn the risk factors and everyday signs families can notice early.",
    href: "/blog/the-fall-happens-before-the-fall",
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80",
    author: AUTHOR_MEETALI,
    date: "May 28, 2026",
    readTime: "6 Min Read",
    body: [
      {
        type: "p",
        text: "We often look at problems but don't realize they are problems until we look at them retrospectively. As one says, looking back shows everything in 6/6 clarity.",
      },
      {
        type: "p",
        text: "When the older adult falls, the causes for the fall have happened in the preceding months, and we need to identify them.",
      },
      {
        type: "h2",
        text: "What makes one more likely to fall",
      },
      {
        type: "ul",
        items: [
          "Past history of a fall",
          "Lower-extremity weakness",
          "Age",
          "Female sex",
          "Cognitive impairment",
          "Balance problems",
          "Hearing loss",
          "Psychotropic drug use (for example, sleeping pills)",
          "Arthritis",
          "History of stroke",
          "Orthostatic hypotension",
          "Dizziness",
          "Anaemia",
        ],
      },
      {
        type: "h2",
        text: "How do these present in practical terms",
      },
      {
        type: "ol",
        items: [
          "Weakness",
          "Difficulty walking",
          "Memory loss",
          "Joint pain",
          "Dizziness on standing",
          "Increased sleepiness in the daytime",
        ],
      },
      {
        type: "p",
        text: "The way forward is not to ignore these symptoms, and not to brush them off as ageing.",
      },
      {
        type: "p",
        text: "Take the assessment and find out areas of vulnerability so a catastrophic fall can be avoided.",
      },
      {
        type: "author",
        name: "Dr Meetali Bidaye",
        lines: [
          "MRCP, MRCP Nephrology",
          "Preventive eldercare and independent ageing advocate",
        ],
      },
    ],
  },
  {
    slug: "convincing-them-to-get-assessed",
    category: "caregiving",
    tag: "Caregiving Tips",
    title: "A way of convincing them to get assessed",
    excerpt:
      "Parents never want to be a burden. Here's how to reframe assessment as a path to staying independent longer.",
    href: "/blog/convincing-them-to-get-assessed",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    author: AUTHOR_MEETALI,
    date: "May 14, 2026",
    readTime: "5 Min Read",
    body: [
      {
        type: "p",
        text: "Parents never want to be a burden on the kids.",
      },
      {
        type: "numbered",
        items: [
          {
            title:
              "Frame assessment as a way to stay independent for longer",
            text: "Convince older adults that assessment identifies issues that keep them independent for longer. This helps the conversation go from \"there is a problem\" to \"let's figure out how to keep you well.\"",
          },
          {
            title: "Remove points of friction",
            text: "Travel, appointments, and queues often get in the way. Tell them that the assessment happens in the comfort of their own home, and that they don't need to arrange anything.",
          },
          {
            title: "Their primary care physician stays the same",
            text: "Assure them that they will not have to change any primary care or specialist doctor they are already seeing. This is an additional layer of support that a five-minute appointment with the doctor sometimes cannot provide.",
          },
          {
            title: "Give yourself peace of mind as their child",
            text: "Tell them this will give you, their child, peace of mind, knowing there is a pair of medically trained eyes seeing them regularly.",
          },
        ],
      },
      {
        type: "p",
        text: "Lastly, and most importantly, sometimes a few gentle conversations are needed before they are convinced. So be patient.",
      },
      {
        type: "author",
        name: "Dr Meetali Bidaye",
        lines: ["MRCP, MRCP Nephrology"],
      },
    ],
  },
];

/** Featured highlight: first post in the catalog. */
export const FEATURED_POST: BlogPost = BLOG_POSTS[0]!;

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(
  categoryId: string,
  excludeSlug?: string,
): BlogPost[] {
  return BLOG_POSTS.filter(
    (post) =>
      post.category === categoryId &&
      (excludeSlug ? post.slug !== excludeSlug : true),
  );
}
