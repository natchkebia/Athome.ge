import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./page.module.scss";

const deliveryItems = [
  {
    icon: "/icons/moped.svg",
    title: "მიწოდება თბილისის მასშტაბით იმავე დღეს (მხოლოდ სადარბაზომდე)",
    text: "თუ შეკვეთას Athome.ge –ზე განახორციელებთ 13 საათამდე, ჩვენი კურიერი პროდუქტს მოგაწვდით იმავე დღეს 19 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების გარდა).",
    bold: "ტარიფი: მიწოდების ღირებულებას შეკვეთის გვერდზე ავტომატურად დაგიგენერირებთ საიტი ადგილდმებარეობის და ნივთის ზომის მიხედვით.",
  },
  {
    icon: "/icons/delivo.svg",
    title: "Delivo - მიწოდება თბილისის მასშტაბით შეკვეთიდან 1:30 საათში",
    text: "15:00 საათამდე მიღებული შეკვეთის მიწოდება მოხდება შეკვეთიდან 2 საათში იმავე დღეს.",
    warning:
      "შენიშვნა: ამ სერვისით სარგებლობა შეგიძლიათ დილის 11:00 საათიდან, საღამოს 16:30 საათამდე (შაბათ-კვირის, ოფიციალური უქმე დღეების გარდა).",
    price: "ტარიფი: 20 ლარი",
  },
  {
    icon: "/icons/gift.svg",
    title: "მიწოდება მთელი საქართველოს მასშტაბით",
    text: "მიწოდების ტარიფები და ვადები ინდივიდუალურია ქალაქისა და პროდუქტის წონის მიხედვით.",
    bold: "ტარიფი: დაითვლება შეკვეთის დროს ავტომატურად ",
  },
  {
    icon: "/icons/logoo.svg",
    title: "გატანა მაღაზიიდან",
    text: "12:00 საათამდე შეძენილი ნივთის გატანა შესაძლებელია 15:00 საათის შემდეგ 19:00 საათამდე – ჩვენი მისამართიდან ქ. თბილისი აკაკი წერეთლის 115, ქ.თბილისი, მერაბ კოსტავას  #73",
    price: "ტარიფი: უფასო",
  },
];

const breadcrumbs = [
  { label: "მთავარი გვერდი", href: "/" },
  { label: "მიწოდება" },
];

export default function DeliveryInfoPage() {
  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.deliveryPage}>
        <section className={styles.deliveryLayout}>
          <aside className={styles.leftBox}></aside>

          <div className={styles.cards}>
            {deliveryItems.map((item, index) => (
              <article className={styles.card} key={index}>
                <div className={styles.iconBox}>
                  <img src={item.icon} alt={item.title} />
                </div>

                <div className={styles.content}>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>

                  {item.warning && (
                    <p className={styles.warning}>{item.warning}</p>
                  )}

                  {item.bold && <p className={styles.bold}>{item.bold}</p>}
                  {item.price && <p className={styles.price}>{item.price}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
