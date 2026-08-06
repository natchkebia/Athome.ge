import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./page.module.scss";
import { headers } from "next/headers";

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

export default async function DeliveryInfoPage() {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const localizedItems = locale === "en"
    ? [
        {
          icon: "/icons/moped.svg",
          title: "Same-day delivery within Tbilisi (to the building entrance only)",
          text: "Place your order on Athome.ge before 1:00 PM and our courier will deliver it by 7:00 PM the same day, excluding weekends and public holidays.",
          bold: "Rate: The delivery fee is calculated automatically at checkout based on the location and item size.",
        },
        {
          icon: "/icons/delivo.svg",
          title: "Delivo — delivery within Tbilisi in approximately 1.5 hours",
          text: "Orders received before 3:00 PM will be delivered within two hours on the same day.",
          warning: "Note: This service is available from 11:00 AM to 4:30 PM, excluding weekends and public holidays.",
          price: "Rate: GEL 20",
        },
        {
          icon: "/icons/gift.svg",
          title: "Delivery throughout Georgia",
          text: "Delivery rates and timeframes vary depending on the city and product weight.",
          bold: "Rate: Calculated automatically during checkout.",
        },
        {
          icon: "/icons/logoo.svg",
          title: "Store pickup",
          text: "Items purchased before 12:00 PM can be collected between 3:00 PM and 7:00 PM from our stores at 115 Akaki Tsereteli Avenue or 73 Merab Kostava Street, Tbilisi.",
          price: "Rate: Free",
        },
      ]
    : deliveryItems;
  const localizedBreadcrumbs = locale === "en"
    ? [{ label: "Home", href: "/" }, { label: "Delivery" }]
    : breadcrumbs;
  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={localizedBreadcrumbs} />
      </div>
      <main className={styles.deliveryPage}>
        <section className={styles.deliveryLayout}>
          <aside className={styles.leftBox}></aside>

          <div className={styles.cards}>
            {localizedItems.map((item, index) => (
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
