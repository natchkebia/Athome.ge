import Link from "next/link";
import { headers } from "next/headers";
import styles from "./page.module.scss";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import {
  formatBlogDate,
  getStorefrontBlogPosts,
  stripBlogHtml,
} from "@/lib/storefront/blog";

type Props = {
  searchParams?: Promise<{
    page?: string;
    search?: string;
    tag?: string;
  }>;
};

export default async function NewsPage({ searchParams }: Props) {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const en = locale === "en";
  const params = await searchParams;
  const page = Math.max(Number(params?.page ?? 1) || 1, 1);
  const blogResponse = await getStorefrontBlogPosts({
    page,
    pageSize: 9,
    search: params?.search,
    tag: params?.tag,
  });
  const blogs = blogResponse?.items ?? [];
  const totalPages = blogResponse?.totalPages ?? 0;
  const breadcrumbs = [
    { label: en ? "Home" : "მთავარი გვერდი", href: "/" },
    { label: en ? "News" : "სიახლეები" },
  ];

  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.newsPage}>
        {blogs.length > 0 ? (
          <section className={styles.newsGrid}>
            {blogs.map((blog) => (
              <article className={styles.card} key={blog.id}>
                <Link href={`/news/${blog.slug}`} className={styles.imageBox}>
                  {blog.thumbnailUrl ? (
                    <img src={blog.thumbnailUrl} alt={blog.title} />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>▧</span>
                    </div>
                  )}
                </Link>

                <div className={styles.cardBody}>
                  <h2>{blog.title}</h2>
                  <p>{stripBlogHtml(blog.summary)}</p>

                  <div className={styles.cardBottom}>
                    <span>{formatBlogDate(blog.publishedAt, locale)}</span>
                    <Link
                      href={`/news/${blog.slug}`}
                      className={styles.readMore}
                    >
                      {en ? "Read more" : "ნახე მეტი"}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <p className={styles.empty}>{en ? "No news has been added yet" : "სიახლეები ჯერ არ არის დამატებული"}</p>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {blogResponse?.hasPrev ? (
              <Link href={`/news?page=${page - 1}`}>‹</Link>
            ) : (
              <span>‹</span>
            )}
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;

              return (
                <Link
                  key={pageNumber}
                  href={`/news?page=${pageNumber}`}
                  className={pageNumber === page ? styles.active : ""}
                >
                  {pageNumber}
                </Link>
              );
            })}
            {blogResponse?.hasNext ? (
              <Link href={`/news?page=${page + 1}`}>›</Link>
            ) : (
              <span>›</span>
            )}
          </div>
        )}
      </main>
    </>
  );
}
