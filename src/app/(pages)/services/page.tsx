import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import styles from "./services.module.scss";

const services = [
  {
    title: "კომპიუტერის / ნოუთბუქის სრული დიაგნოსტიკა",
    price: "50.00 ₾",
    image: "/images/diagnostics.png",
  },
  {
    title: "ბიოსის განახლება ვიდეოკარტაზე",
    price: "50.00 ₾",
    image: "/images/gpu-bios.png",
  },
  {
    title: "ბიოსის განახლება დედაპლატაზე",
    price: "50.00 ₾",
    image: "/images/motherboard-bios.png",
  },
  {
    title: "ნოუთბუქის პროგრამული უზრუნველყოფა",
    price: "60.00 ₾",
    image: "/images/laptop-software.png",
  },
  {
    title: "კომპიუტერის პროგრამული უზრუნველყოფა",
    price: "50.00 ₾",
    image: "/images/pc-software.png",
  },
  {
    title: "კომპიუტერის სრული წმენდა +კაბელენეჯმენტი + თერმოპასტის შეცვლა",
    price: "90.00 ₾",
    image: "",
  },
  {
    title: "ქეისის გადაწყობა + კაბელ მენეჯმენტი",
    price: "100.00 ₾",
    image: "/images/case-build.png",
  },
  {
    title: "კომპიუტერის გადაწყობა “ჰაერის ნაკადით”",
    price: "30.00 ₾",
    image: "/images/pc-open-build.png",
  },
  {
    title: "ნოუთბუქის გაწმენდა + თერმოპასტის შეცვლა",
    price: "120.00 ₾",
    image: "",
  },
  {
    title: "თერმოპასტის შეცვლა პროცესორზე",
    price: "30.00 ₾",
    image: "",
  },
  {
    title: "თერმოპასტის შეცვლა ნოუთბუქში",
    price: "50.00 ₾",
    image: "",
  },
  {
    title: "თერმოპასტის შეცვლა ვიდეოკარტაზე",
    price: "50.00 ₾",
    image: "",
  },
  {
    title: "კომპიუტერის ცალკეული ნაწილისდიაგნოსტიკა",
    price: "25.00 ₾",
    image: "",
  },
  {
    title: "კომპიუტერის / ნოუთბუქის დეტალის შეცვლა",
    price: "40.00 ₾",
    image: "",
  },
  {
    title: "კომპიუტერის აწყობა + კაბელ მენეჯმენტი + Windows ინსტალაცია",
    price: "120.00 ₾",
    image: "/images/windows-build.png",
  },
];
const breadcrumbs = [
  { label: "მთავარი გვერდი", href: "/" },
  { label: "სერვისი" },
];
export default function ServicesPage() {
  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.servicesPage}>
        <h1 className={styles.title}>ძველი კომპიუტერის ახალი სიცოცხლე</h1>

        <section className={styles.servicesGrid}>
          {services.map((service, index) => (
            <article className={styles.serviceCard} key={index}>
              <div className={styles.imageBox}>
                {service.image ? (
                  <img src={service.image} alt={service.title} />
                ) : (
                  <div className={styles.emptyImage} />
                )}
              </div>

              <div className={styles.cardContent}>
                <h2>{service.title}</h2>
                <p>{service.price}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
