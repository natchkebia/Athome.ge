"use client";

import { useRouter } from "next/navigation";
import styles from "./SignIn.module.scss";

export default function SignIn() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/authorization"); 
  };

  return (
    <div className={styles.container} onClick={handleClick}>
      <img src="./icons/person.svg" alt="person" />
      <span>შესვლა</span>
    </div>
  );
}
