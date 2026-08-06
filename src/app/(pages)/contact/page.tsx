import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./page.module.scss";
import { headers } from "next/headers";

const contacts = [
  {
    mapQuery: "თბილისი აკაკი წერეთლის გამზირი 115",
    address: "თბილისი, აკაკი წერეთლის გამზირი #115",
    phone: "+995 599 09 32 09",
    email: "info@athome.ge",
    workTime: "ორშაბათი-შაბათი: 11:00 - 20:00",
  },
  {
    mapQuery: "თბილისი მერაბ კოსტავას 73",
    address: "თბილისი, მერაბ კოსტავას #73",
    phone: "+995 595 09 42 09",
    email: "info@athome.ge",
    workTime: "ორშაბათი-შაბათი: 11:00 - 20:00    კვირა: 11:00 - 18:00",
  },
];
const breadcrumbs = [
  { label: "მთავარი გვერდი", href: "/" },
  { label: "კონტაქტი" },
];
export default async function ContactPage() {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const localizedContacts = locale === "en"
    ? [
        { ...contacts[0], address: "115 Akaki Tsereteli Avenue, Tbilisi", workTime: "Monday–Saturday: 11:00–20:00" },
        { ...contacts[1], address: "73 Merab Kostava Street, Tbilisi", workTime: "Monday–Saturday: 11:00–20:00    Sunday: 11:00–18:00" },
      ]
    : contacts;
  const localizedBreadcrumbs = locale === "en"
    ? [{ label: "Home", href: "/" }, { label: "Contact" }]
    : breadcrumbs;
  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={localizedBreadcrumbs} />
      </div>
      <main className={styles.contactPage}>
        <section className={styles.contactGrid}>
          {localizedContacts.map((item, index) => (
            <article className={styles.contactCard} key={index}>
              <div className={styles.mapBox}>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    item.mapQuery,
                  )}&z=16&output=embed&hl=${locale}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={item.address}
                />
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoItem}>
                  <span className={styles.icon}>●</span>
                  <p>{item.address}</p>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.icon}>●</span>
                  <a href={`tel:${item.phone.replaceAll(" ", "")}`}>
                    {item.phone}
                  </a>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.icon}>●</span>
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.icon}>●</span>
                  <p>{item.workTime}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
