"use client";

import styles from "./Footer.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function Footer() {
  const locale = useStorefrontLocale();
  const en = locale === "en";
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles["footer-left"]}>
          <div className={styles["footer-logo"]}>
            <img src="/icons/Logo.svg" alt="Logo" />
          </div>

          <ul className={styles["contact-list"]}>
            <li>
              <img src="/icons/footerPhone.svg" alt="Phone" />
              <span>+995 599 09 32 09</span>
            </li>
            <li>
              <img src="/icons/footerMeil.svg" alt="Email" />
              <span>info@athome.ge</span>
            </li>
            <li>
              <img src="/icons/footerLocation.svg" alt="Location" />
              <span>{en ? "115 Akaki Tsereteli Ave, Tbilisi" : "თბილისი, აკაკი წერეთლის გამზირი #115"}</span>
            </li>
            <li>
              <img src="/icons/footerLocation.svg" alt="Location" />
              <span>{en ? "115 Akaki Tsereteli Ave, Tbilisi" : "თბილისი, აკაკი წერეთლის გამზირი #115"}</span>
            </li>
          </ul>

          <div className={styles.socials}>
            <a href="#">
              <img src="/icons/footerFacebook.svg" alt="Facebook" />
            </a>
            <a href="#">
              <img src="/icons/footerInstagram.svg" alt="Instagram" />
            </a>
            <a href="#">
              <img src="/icons/footerYoutube.svg" alt="YouTube" />
            </a>
          </div>
        </div>

        {/* მენიუები */}
        <div className={styles["footer-menus"]}>
          <div className={styles["menu-column"]}>
            <h4>{en ? "Categories" : "კატეგორიები"}</h4>
            <ul>
              <li>{en ? "Computers" : "კომპიუტერები"}</li>
              <li>{en ? "Computer parts" : "კომპიუტერის ნაწილები"}</li>
              <li>{en ? "Laptops" : "ნოუთბუქები"}</li>
              <li>{en ? "Monitors" : "მონიტორები"}</li>
              <li>{en ? "Laptop bags" : "ნოუთბუქის ჩანთები"}</li>
              <li>{en ? "Cables and adapters" : "კაბელები და ადაპტერები"}</li>
            </ul>
          </div>

          <div className={styles["menu-column"]}>
            <h4>{en ? "About us" : "ჩვენ შესახებ"}</h4>
            <ul>
              <li>{en ? "Who we are" : "ვინ ვართ ჩვენ"}</li>
              <li>{en ? "Online store infrastructure" : "ონლაინ შოპის ინფრასტრუქტურა"}</li>
              <li>{en ? "Online sales management" : "ონლაინ გაყიდვის მენეჯმენტი"}</li>
            </ul>
          </div>

          <div className={styles["menu-column"]}>
            <h4>{en ? "Terms and conditions" : "წესები და პირობები"}</h4>
            <ul>
              <li>{en ? "Terms and conditions" : "წესები და პირობები"}</li>
              <li>{en ? "Warranty terms" : "სარანტიო პირობები"}</li>
              <li>{en ? "Delivery terms" : "მიწოდების წესები და პირობები"}</li>
              <li>{en ? "Privacy policy" : "პერსონალური მონაცემთა პოლიტიკა"}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles["footer-bottom"]}>
        <p>{en ? "Terms of service © 2025 athome.ge. All rights reserved" : "სერვისის პირობები © 2025 athome.ge. ყველა უფლება დაცულია"}</p>
      </div>
    </footer>
  );
}
