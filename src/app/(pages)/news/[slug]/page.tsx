import { notFound } from "next/navigation";
import styles from "./page.module.scss";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import BlogComments from "@/components/blogComments/BlogComments";
import {
  formatBlogDate,
  getBlogParagraphs,
  getStorefrontBlogPost,
} from "@/lib/storefront/blog";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getStorefrontBlogPost(slug);

  if (!blog) {
    notFound();
  }
  const paragraphs = getBlogParagraphs(blog.body || blog.summary);
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

        <article className={styles.article}>
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        <BlogComments />
      </main>
    </>
  );
}
