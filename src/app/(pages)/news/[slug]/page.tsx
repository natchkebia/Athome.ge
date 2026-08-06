import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import DOMPurify from "isomorphic-dompurify";
import styles from "./page.module.scss";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import BlogComments from "@/components/blogComments/BlogComments";
import {
  formatBlogDate,
  getStorefrontBlogPost,
  stripBlogHtml,
} from "@/lib/storefront/blog";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-lang") === "en" ? "en" : "ka";
  const blog = await getStorefrontBlogPost(slug);
  const kaPath = `/news/${encodeURIComponent(slug)}`;
  const currentPath = locale === "en" ? `/en${kaPath}` : kaPath;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ithome.ge";

  return {
    title: blog?.metaTitle || blog?.title || "Athome.ge",
    description: blog?.metaDescription || stripBlogHtml(blog?.summary),
    alternates: {
      canonical: `${site}${currentPath}`,
      languages: { ka: `${site}${kaPath}`, en: `${site}/en${kaPath}`, "x-default": `${site}${kaPath}` },
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getStorefrontBlogPost(slug);

  if (!blog) {
    notFound();
  }
  const bodyHtml = DOMPurify.sanitize(blog.body || blog.summary || "");
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "სიახლეები", href: "/news" },
    { label: blog.title },
  ];

  return (
    <>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.detailPage}>
        <section className={styles.hero}>
          <div className={styles.heroInfo}>
            <h1>{blog.title}</h1>

            <span className={styles.dateBadge}>
              {formatBlogDate(blog.publishedAt)}
            </span>

            <div className={styles.share}>
              <span>გაზიარება</span>
              <i></i>
              <button>f</button>
            </div>
          </div>

          <div className={styles.heroImage}>
            {blog.thumbnailUrl ? (
              <img src={blog.thumbnailUrl} alt={blog.title} />
            ) : (
              <div className={styles.placeholder}>
                <span>▧</span>
              </div>
            )}
          </div>
        </section>

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <BlogComments />
      </main>
    </>
  );
}
