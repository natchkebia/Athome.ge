import React from "react";
import styles from "./Service.module.scss";

const Service = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div>
          <div>
            <img src="./icons/Moped.svg" alt="Moped" />
          </div>
          <h3>მიწოდება</h3>
          <span>საქართველოს მასშტაბით</span>
        </div>
        <div>
          <div>
            <img src="./icons/Check.svg" alt="Check" />
          </div>
          <h3>გარანტია</h3>
          <span>სუკან დაბრუნების პოლიტიკა</span>
        </div>
        <div>
          <div>
            <img src="./icons/Setting.svg" alt="Setting" />
          </div>
          <h3>სერვისი</h3>
          <span>შეკეთება და მომსახერება</span>
        </div>
        <div>
          <div>
            <img src="./icons/Talking-man.svg" alt="Talking-man" />
          </div>
          <h3>მომსახურება</h3>
          <span>კორპორატიული გაყიდვები</span>
        </div>
      </div>
    </div>
  );
};

export default Service;
