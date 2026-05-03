import Link from "next/link";
import styles from "./page.module.scss";
import { blogs } from "@/data/blogs";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";

export default function NewsPage() {
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "სიახლეები" },
  ];

  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.newsPage}>
        <section className={styles.newsGrid}>
          {blogs.map((blog) => (
            <article className={styles.card} key={blog.id}>
              <Link href={`/news/${blog.slug}`} className={styles.imageBox}>
                {blog.image ? (
                  <img src={blog.image} alt={blog.title} />
                ) : (
                  <div className={styles.placeholder}>
                    <span>▧</span>
                  </div>
                )}
              </Link>

              <div className={styles.cardBody}>
                <h2>{blog.title}</h2>
                <p>{blog.excerpt}</p>

                <div className={styles.cardBottom}>
                  <span>{blog.date}</span>
                  <Link href={`/news/${blog.slug}`} className={styles.readMore}>
                    ნახე მეტი
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className={styles.pagination}>
          <button>‹</button>
          <span className={styles.active}>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <button>›</button>
        </div>
      </main>
    </>
  );
}
