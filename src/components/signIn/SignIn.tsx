"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import {
  getStoredProfileGender,
  getStoredProfileAvatar,
  type ProfileGender,
} from "@/lib/auth/profilePreferences";
import styles from "./SignIn.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function SignIn() {
  const router = useRouter();
  const locale = useStorefrontLocale();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [gender, setGender] = useState<ProfileGender>("male");
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const syncProfileState = () => {
      setIsAuthorized(Boolean(getStoredAuthTokens()));
      setGender(getStoredProfileGender());
      setAvatar(getStoredProfileAvatar());
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

  const showAvatar = isAuthorized && Boolean(avatar);

  return (
    <button
      type="button"
      className={`${styles.container} ${
        isAuthorized ? styles.authorized : ""
      }`}
      onClick={handleClick}
      aria-label={isAuthorized ? (locale === "en" ? "Profile" : "პროფილი") : (locale === "en" ? "Sign in" : "შესვლა")}
    >
      {showAvatar ? (
        <img className={styles.avatar} src={avatar as string} alt="" />
      ) : (
        <img src={iconSrc} alt="" />
      )}
      {!isAuthorized && <span>{locale === "en" ? "Sign in" : "შესვლა"}</span>}
    </button>
  );
}
