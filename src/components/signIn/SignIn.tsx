"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import {
  getStoredProfileGender,
  type ProfileGender,
} from "@/lib/auth/profilePreferences";
import styles from "./SignIn.module.scss";

export default function SignIn() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gender, setGender] = useState<ProfileGender>("male");

  useEffect(() => {
    const syncProfileState = () => {
      setIsAuthorized(Boolean(getStoredAuthTokens()));
      setGender(getStoredProfileGender());
    };

    syncProfileState();

    window.addEventListener("focus", syncProfileState);
    window.addEventListener("storage", syncProfileState);
    window.addEventListener("athome-auth-changed", syncProfileState);
    window.addEventListener("athome-profile-changed", syncProfileState);

    return () => {
      window.removeEventListener("focus", syncProfileState);
      window.removeEventListener("storage", syncProfileState);
      window.removeEventListener("athome-auth-changed", syncProfileState);
      window.removeEventListener("athome-profile-changed", syncProfileState);
    };
  }, []);

  const handleClick = () => {
    router.push(isAuthorized ? "/profile" : "/authorization");
  };

  const iconSrc =
    isAuthorized && gender === "female"
      ? "/icons/profileWoman.svg"
      : isAuthorized
      ? "/icons/profilePerson.svg"
      : "/icons/person.svg";

  return (
    <button
      type="button"
      className={`${styles.container} ${
        isAuthorized ? styles.authorized : ""
      }`}
      onClick={handleClick}
      aria-label={isAuthorized ? "პროფილი" : "შესვლა"}
    >
      <img src={iconSrc} alt="" />
      {!isAuthorized && <span>შესვლა</span>}
    </button>
  );
}
