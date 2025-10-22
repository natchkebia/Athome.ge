"use client";

import styles from "./Footer.module.scss";

export default function Footer() {
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
              <span>თბილისი, აკაკი წერეთლის გამზირი #115</span>
            </li>
            <li>
              <img src="/icons/footerLocation.svg" alt="Location" />
              <span>თბილისი, აკაკი წერეთლის გამზირი #115</span>
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
            <h4>კატეგორიები</h4>
            <ul>
              <li>კომპიუტერები</li>
              <li>კომპიუტერის ნაწილები</li>
              <li>ნოუთბუქები</li>
              <li>მონიტორები</li>
              <li>ნოუთბუქის ჩანთები</li>
              <li>კაბელები და ადაპტერები</li>
            </ul>
          </div>

          <div className={styles["menu-column"]}>
            <h4>ჩვენ შესახებ</h4>
            <ul>
              <li>ვინ ვართ ჩვენ</li>
              <li>ონლაინ შოპის ინფრასტრუქტურა</li>
              <li>ონლაინ გაყიდვის მენეჯმენტი</li>
            </ul>
          </div>

          <div className={styles["menu-column"]}>
            <h4>წესები და პირობები</h4>
            <ul>
              <li>წესები და პირობები</li>
              <li>სარანტიო პირობები</li>
              <li>მიწოდების წესები და პირობები</li>
              <li>პერსონალური მონაცემთა პოლიტიკა</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles["footer-bottom"]}>
        <p>სერვისის პირობები © 2025 athome.ge. ყველა უფლება დაცულია</p>
      </div>
    </footer>
  );
}
