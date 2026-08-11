"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  login,
  logout,
  type AuthUser,
} from "@/lib/api/auth";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import {
  getStoredProfileGender,
  getStoredProfileAvatar,
  storeProfileAvatar,
  storeProfileGender,
  type ProfileGender,
} from "@/lib/auth/profilePreferences";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import styles from "./SignIn.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function SignIn() {
  const router = useRouter();
  const locale = useStorefrontLocale();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [gender, setGender] = useState<ProfileGender>("male");
  const [avatar, setAvatar] = useState<string | null>(null);
  const en = locale === "en";

  useEffect(() => {
    let active = true;
    const authSyncTimers: ReturnType<typeof setTimeout>[] = [];

    const syncProfileState = () => {
      const authorized = Boolean(getStoredAuthTokens());
      setIsAuthorized(authorized);
      setGender(getStoredProfileGender());
      setAvatar(getStoredProfileAvatar());

      if (!authorized) {
        setUser(null);
        return;
      }

      getCurrentUser()
        .then((currentUser) => {
          if (!active || !currentUser) return;

          setUser(currentUser);

          if (currentUser.gender) {
            const currentGender =
              currentUser.gender.toLowerCase() === "female" ? "female" : "male";
            setGender(currentGender);
            if (getStoredProfileGender() !== currentGender) {
              storeProfileGender(currentGender);
            }
          }

          if (currentUser.avatarUrl) {
            const avatarUrl = normalizeMediaUrl(currentUser.avatarUrl);
            setAvatar(avatarUrl);
            if (getStoredProfileAvatar() !== avatarUrl) {
              storeProfileAvatar(avatarUrl);
            }
          } else {
            setAvatar(null);
            if (getStoredProfileAvatar()) {
              storeProfileAvatar(null);
            }
          }
        })
        .catch(() => {
          // Token state remains the source of truth; the menu still works if
          // profile details are temporarily unavailable.
        });
    };

    const syncAfterAuthChange = () => {
      syncProfileState();

      // Login may finish token persistence just before the profile endpoint is
      // ready. Rehydrate quietly so the avatar appears without a page refresh.
      authSyncTimers.push(
        setTimeout(syncProfileState, 250),
        setTimeout(syncProfileState, 900)
      );
    };

    syncProfileState();
    window.addEventListener("focus", syncProfileState);
    window.addEventListener("storage", syncProfileState);
    window.addEventListener("athome-auth-changed", syncAfterAuthChange);
    window.addEventListener("athome-profile-changed", syncProfileState);

    return () => {
      active = false;
      authSyncTimers.forEach(clearTimeout);
      window.removeEventListener("focus", syncProfileState);
      window.removeEventListener("storage", syncProfileState);
      window.removeEventListener("athome-auth-changed", syncAfterAuthChange);
      window.removeEventListener("athome-profile-changed", syncProfileState);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await login({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (!response.accessToken || !response.refreshToken) {
        throw new Error(en ? "Sign-in failed" : "ავტორიზაცია ვერ შესრულდა");
      }

      const currentUser =
        (await getCurrentUser().catch(() => null)) ?? response.user ?? null;
      setUser(currentUser);

      if (currentUser?.avatarUrl) {
        const avatarUrl = normalizeMediaUrl(currentUser.avatarUrl);
        setAvatar(avatarUrl);
        storeProfileAvatar(avatarUrl);
      }

      setIsAuthorized(true);
      setIsOpen(false);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : en
          ? "Please check your details"
          : "გთხოვთ, გადაამოწმოთ მონაცემები"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setIsAuthorized(false);
      setIsOpen(false);
      setIsSubmitting(false);
      router.push("/");
    }
  };

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const iconSrc =
    isAuthorized && gender === "female"
      ? "/icons/profileWoman.svg"
      : isAuthorized
      ? "/icons/profilePerson.svg"
      : "/icons/person.svg";
  const showAvatar = isAuthorized && Boolean(avatar);
  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : en
    ? "Profile"
    : "პროფილი";

  return (
    <div
      className={styles.signIn}
      ref={wrapperRef}
      onMouseEnter={() => setIsOpen(true)}
    >
      <button
        type="button"
        className={`${styles.container} ${isAuthorized ? styles.authorized : ""}`}
        onClick={() => {
          setError("");
          setIsOpen((open) => !open);
        }}
        aria-label={isAuthorized ? userName : en ? "Sign in" : "შესვლა"}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {showAvatar ? (
          <img className={styles.avatar} src={avatar as string} alt="" />
        ) : (
          <img src={iconSrc} alt="" />
        )}
        <span>{isAuthorized ? userName : en ? "Sign in" : "შესვლა"}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="dialog" aria-label={en ? "Account menu" : "ანგარიშის მენიუ"}>
          {isAuthorized ? (
            <div className={styles.profileMenu}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  {showAvatar ? <img src={avatar as string} alt="" /> : <img src={iconSrc} alt="" />}
                </div>
                <div>
                  <strong>{userName}</strong>
                  {user?.email && <span>{user.email}</span>}
                </div>
              </div>

              <nav aria-label={en ? "Profile navigation" : "პროფილის ნავიგაცია"}>
                <button type="button" onClick={() => navigate("/profile?tab=info#change-password")}>
                  <img src="/icons/profile1.svg" alt="" />
                  {en ? "Profile" : "პროფილი"}
                </button>
                <button type="button" onClick={() => navigate("/profile?tab=orders")}>
                  <img src="/icons/profile2.svg" alt="" />
                  {en ? "My orders" : "ჩემი შეკვეთები"}
                </button>
                <button type="button" onClick={() => navigate("/profile?tab=info")}>
                  <img src="/icons/password.svg" alt="" />
                  {en ? "Change password" : "პაროლის შეცვლა"}
                </button>
                <button type="button" className={styles.logout} onClick={handleLogout} disabled={isSubmitting}>
                  <img src="/icons/profile5.svg" alt="" />
                  {en ? "Sign out" : "გასვლა"}
                </button>
              </nav>
            </div>
          ) : (
            <form className={styles.loginForm} onSubmit={handleLogin}>
              <div className={styles.formHeading}>
                <span>{en ? "Welcome back" : "კეთილი იყოს დაბრუნება"}</span>
                <strong>{en ? "Sign in" : "ავტორიზაცია"}</strong>
              </div>

              <label>
                <span>{en ? "Email" : "ელფოსტა"}</span>
                <input name="email" type="email" autoComplete="email" placeholder="name@example.com" required autoFocus />
              </label>

              <label>
                <span>{en ? "Password" : "პაროლი"}</span>
                <div className={styles.passwordField}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={en ? "Enter password" : "შეიყვანეთ პაროლი"}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    <img src={showPassword ? "/icons/Closed-eye.svg" : "/icons/Eye.svg"} alt="" />
                  </button>
                </div>
              </label>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <div className={styles.formActions}>
                <button className={styles.submit} type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (en ? "Signing in..." : "მიმდინარეობს...") : en ? "Sign in" : "შესვლა"}
                </button>
                <button className={styles.forgot} type="button" onClick={() => navigate("/authorization?tab=reset")}>
                  {en ? "Forgot password?" : "დაგავიწყდა პაროლი?"}
                </button>
              </div>

              <p className={styles.registration}>
                {en ? "Don't have an account?" : "არ გაქვს ანგარიში?"}{" "}
                <button type="button" onClick={() => navigate("/authorization?tab=register")}>
                  {en ? "Register" : "რეგისტრაცია"}
                </button>
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
