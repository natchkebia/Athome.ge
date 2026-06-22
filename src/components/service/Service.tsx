import Link from "next/link";
import styles from "./Service.module.scss";

type ServiceItem = {
  icon: string;
  alt: string;
  title: string;
  subtitle: string;
  // href გარეშე ბლოკი ჯერ არ არის დასაჭერი (გვერდი მალე დაემატება).
  href?: string;
};

const items: ServiceItem[] = [
  {
    icon: "/icons/Moped.svg",
    alt: "Moped",
    title: "მიწოდება",
    subtitle: "საქართველოს მასშტაბით",
    href: "/delivery-info",
  },
  {
    icon: "/icons/Check.svg",
    alt: "Check",
    title: "გარანტია",
    subtitle: "სუკან დაბრუნების პოლიტიკა",
  },
  {
    icon: "/icons/Setting.svg",
    alt: "Setting",
    title: "სერვისი",
    subtitle: "შეკეთება და მომსახერება",
    href: "/services",
  },
  {
    icon: "/icons/Talking-man.svg",
    alt: "Talking-man",
    title: "მომსახურება",
    subtitle: "კორპორატიული გაყიდვები",
  },
];

const Service = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {items.map((item) => {
          const content = (
            <>
              <div className={styles.iconCircle}>
                <img src={item.icon} alt={item.alt} />
              </div>
              <h3>{item.title}</h3>
              <span>{item.subtitle}</span>
            </>
          );

          return item.href ? (
            <Link
              key={item.title}
              href={item.href}
              className={`${styles.item} ${styles.clickable}`}
            >
              {content}
            </Link>
          ) : (
            <div key={item.title} className={styles.item}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Service;
