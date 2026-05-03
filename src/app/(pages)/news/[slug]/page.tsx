import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";
import { blogs } from "@/data/blogs";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import BlogComments from "@/components/blogComments/BlogComments";

type Props = {
  params: {
    slug: string;
  };
};

const comments = [
  {
    name: "დათო",
    date: "2 მაისი, 2022",
    text: "ძალიან საინტერესო სტატიაა.",
    avatar: "/images/avatar.png",
  },
  {
    name: "გიორგი",
    date: "25 ივნისი, 2022",
    text: "კარგად არის ახსნილი.",
    avatar: "",
  },
  {
    name: "Barbare Bula",
    date: "25 ივნისი, 2022",
    text: "მადლობა ინფორმაციისთვის.",
    avatar: "",
  },
  {
    name: "თემო",
    date: "2 მაისი, 2022",
    text: "COOL",
    avatar: "",
  },
];

export default function NewsDetailPage({ params }: Props) {
  const blog = blogs.find((item) => item.slug === params.slug);

  if (!blog) {
    notFound();
  }
  const breadcrumbs = [
    { label: "მთავარი გვერდი", href: "/" },
    { label: "სიახლეები", href: "/news" },
    { label: blog.title },
  ];

  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.detailPage}>
        <section className={styles.hero}>
          <div className={styles.heroInfo}>
            <h1>{blog.title}</h1>

            <span className={styles.dateBadge}>{blog.detailDate}</span>

            <div className={styles.share}>
              <span>გაზიარება</span>
              <i></i>
              <button>f</button>
            </div>
          </div>

          <div className={styles.heroImage}>
            {blog.image ? (
              <img src={blog.image} alt={blog.title} />
            ) : (
              <div className={styles.placeholder}>
                <span>▧</span>
              </div>
            )}
          </div>
        </section>

        <article className={styles.article}>
          {blog.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>

        <BlogComments />
      </main>
    </>
  );
}
