import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./page.module.scss";

const contacts = [
  {
    mapQuery: "თბილისი ვაჟა ფშაველას გამზირი 115",
    address: "თბილისი, ვაჟა ფშაველას გამზირი #115",
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
export default function ContactPage() {
  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.contactPage}>
        <section className={styles.contactGrid}>
          {contacts.map((item, index) => (
            <article className={styles.contactCard} key={index}>
              <div className={styles.mapBox}>
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    item.mapQuery,
                  )}&z=16&output=embed`}
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
