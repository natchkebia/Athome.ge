import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./PolicyPage.module.scss";

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PolicyPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: PolicySection[];
  homeLabel: string;
  contactLabel: string;
};

export default function PolicyPage({
  title,
  eyebrow,
  intro,
  sections,
  homeLabel,
  contactLabel,
}: PolicyPageProps) {
  return (
    <>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb items={[{ label: homeLabel, href: "/" }, { label: title }]} />
      </div>
      <main className={styles.page}>
        <header className={styles.hero}>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>

        <div className={styles.layout}>
          <nav className={styles.navigation} aria-label={title}>
            <p>{eyebrow}</p>
            {sections.map((section, index) => (
              <a key={section.title} href={`#section-${index + 1}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </nav>

          <div className={styles.content}>
            {sections.map((section, index) => (
              <section id={`section-${index + 1}`} key={section.title}>
                <div className={styles.number}>{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul>
                      {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}

            <aside className={styles.contact}>
              <div>
                <span>{contactLabel}</span>
                <strong>info@athome.ge</strong>
              </div>
              <a href="tel:+995599093209">+995 599 09 32 09</a>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
