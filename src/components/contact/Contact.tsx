import React from "react";
import styles from "./Contact.module.scss";

export const Contact = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <img src="./icons/Main-headphone.svg" alt="headphone" />
        <h2>დაგვიკავშირდით</h2>
      </div>
      <span>+995 599 09 32 09</span>
    </div>
  );
};

export default Contact;
