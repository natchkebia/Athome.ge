import type { Metadata } from "next";
import { headers } from "next/headers";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "ჩვენ შესახებ | AtHome",
  description:
    "AtHome — კომპიუტერული ტექნიკა, პერსონალიზებული კომპიუტერული სისტემები და პროფესიონალური ტექნიკური სერვისი საქართველოში.",
};

export default async function AboutUsPage() {
  const en = (await headers()).get("x-lang") === "en";

  return (
    <>
      <div className={styles.breadcrumbWrap}>
        <Breadcrumb
          items={[
            { label: en ? "Home" : "მთავარი გვერდი", href: "/" },
            { label: en ? "About us" : "ჩვენ შესახებ" },
          ]}
        />
      </div>

      <main className={styles.page}>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>{en ? "Technology, made personal" : "ტექნოლოგია, შენზე მორგებული"}</span>
          <h1>{en ? "About AtHome" : "ჩვენ შესახებ"}</h1>
          <p>
            {en
              ? "AtHome is a modern computer technology and electronics space offering a simpler, more transparent and comfortable way to choose, purchase and maintain technology."
              : "AtHome კომპიუტერული ტექნიკისა და ელექტრონიკის თანამედროვე სივრცეა, რომელიც მომხმარებელს ტექნოლოგიებთან ურთიერთობის სრულიად ახალ, კომფორტულ გამოცდილებას სთავაზობს."}
          </p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <img src="/icons/Logo.svg" alt="" />
        </div>
      </section>

      <section className={styles.stats} aria-label={en ? "AtHome facts" : "AtHome ციფრებში"}>
        <article><strong>2019</strong><span>{en ? "Founded" : "წლიდან თქვენთან ერთად"}</span></article>
        <article><strong>6 000+</strong><span>{en ? "Products" : "დასახელების პროდუქტი"}</span></article>
        <article><strong>2</strong><span>{en ? "Locations in Tbilisi" : "ფილიალი თბილისში"}</span></article>
      </section>

      <section className={styles.storyGrid}>
        <article className={`${styles.storyCard} ${styles.storyCardWide}`}>
          <span className={styles.cardNumber}>01</span>
          <div>
            <h2>{en ? "Our mission" : "ჩვენი მისია"}</h2>
            <p>
              {en
                ? "Since 2019, our mission has been to make choosing, purchasing and maintaining technology in Georgia as simple, transparent and personal as possible."
                : "2019 წლიდან კომპანიის მთავარი მისიაა, საქართველოში ტექნიკის არჩევის, შეძენისა და მოვლის პროცესი გახადოს მაქსიმალურად მარტივი, გამჭვირვალე და თითოეულ მომხმარებელზე მორგებული."}
            </p>
          </div>
        </article>

        <article className={styles.storyCard}>
          <span className={styles.cardNumber}>02</span>
          <div>
            <h2>{en ? "A carefully selected catalogue" : "მრავალფეროვანი კატალოგი"}</h2>
            <p>
              {en
                ? "Our catalogue includes more than 6,000 products from leading global brands, with verified, official technical specifications."
                : "AtHome-ის კატალოგში წარმოდგენილია 6 000-ზე მეტი დასახელების პროდუქტი — წამყვანი მსოფლიო ბრენდების პროცესორები, ვიდეობარათები, დედა დაფები, ოპერატიული მეხსიერება, პერიფერიული მოწყობილობები, ლეპტოპები და საოფისე ტექნიკა, თითოეულ ნივთზე გადამოწმებული, ოფიციალური ტექნიკური მონაცემებით."}
            </p>
          </div>
        </article>

        <article className={`${styles.storyCard} ${styles.accentCard}`}>
          <span className={styles.cardNumber}>03</span>
          <div>
            <h2>{en ? "A computer built for you" : "შენზე მორგებული კომპიუტერი"}</h2>
            <p>
              {en
                ? "Our experts consider your needs, interests and budget — from demanding graphics and gaming to everyday work — and build a computer that fits them precisely."
                : "AtHome არ არის უბრალოდ კომპონენტებისა და აქსესუარების მაღაზია. ჩვენი მთავარი ძლიერი მხარე პერსონალიზებული კომპიუტერული სისტემების შექმნაა. გამოცდილი ტექნიკური ექსპერტები ითვალისწინებენ მომხმარებლის საჭიროებებს, ინტერესებსა და ბიუჯეტს — იქნება ეს მაღალი გრაფიკული დატვირთვა, გეიმინგი თუ ყოველდღიური საქმიანობა — და ქმნიან კომპიუტერს, რომელიც ზუსტად პასუხობს მათ მოთხოვნებს."}
            </p>
          </div>
        </article>

        <article className={`${styles.storyCard} ${styles.storyCardWide}`}>
          <span className={styles.cardNumber}>04</span>
          <div>
            <h2>{en ? "Support beyond the purchase" : "ურთიერთობა შეძენით არ სრულდება"}</h2>
            <p>
              {en
                ? "We provide professional diagnostics, system cleaning, technical upgrades and reliable after-sales support."
                : "AtHome-თან ურთიერთობა ტექნიკის შეძენით არ ამოიწურება. კომპანია მომხმარებლებს სთავაზობს სრულყოფილ კომპიუტერულ სერვისს, რაც მოიცავს პროფესიონალურ დიაგნოსტიკას, სისტემების გაწმენდას, ტექნიკურ განახლებასა და გაყიდვის შემდგომ მხარდაჭერას."}
            </p>
          </div>
        </article>
      </section>

      <section className={styles.values}>
        <div>
          <span>{en ? "Our approach" : "ჩვენი მიდგომა"}</span>
          <h2>{en ? "Clear information. Responsible service." : "ზუსტი ინფორმაცია. სრული პასუხისმგებლობა."}</h2>
        </div>
        <p>
          {en
            ? "Online and in our physical locations, AtHome is built on transparency, accurate information and responsibility. Prices and terms are always clear and known in advance."
            : "როგორც ონლაინ პლატფორმაზე, ისე ფიზიკურ სივრცეში, AtHome ეფუძნება სრული გამჭვირვალობის, ზუსტი ინფორმაციისა და მაღალი პასუხისმგებლობის პრინციპებს, სადაც ფასები და პირობები ყოველთვის მკაფიოდ და წინასწარ არის ცნობილი."}
        </p>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.contactIntro}>
          <span>{en ? "Visit or contact us" : "გვესტუმრეთ ან დაგვიკავშირდით"}</span>
          <h2>{en ? "We are here to help" : "ჩვენ მზად ვართ დაგეხმაროთ"}</h2>
        </div>
        <div className={styles.contactGrid}>
          <a href="https://www.google.com/maps/search/?api=1&query=თბილისი+აკაკი+წერეთლის+115" target="_blank" rel="noreferrer">
            <img src="/icons/footerLocation.svg" alt="" /><span>{en ? "115 Akaki Tsereteli Avenue" : "აკაკი წერეთლის გამზირი 115"}</span>
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=თბილისი+მერაბ+კოსტავას+73" target="_blank" rel="noreferrer">
            <img src="/icons/footerLocation.svg" alt="" /><span>{en ? "73 Merab Kostava Street" : "მერაბ კოსტავას ქუჩა 73"}</span>
          </a>
          <a href="tel:+995599093209"><img src="/icons/footerPhone.svg" alt="" /><span>+995 599 09 32 09</span></a>
          <a href="mailto:info@athome.ge"><img src="/icons/footerMeil.svg" alt="" /><span>info@athome.ge</span></a>
        </div>
      </section>
      </main>
    </>
  );
}
