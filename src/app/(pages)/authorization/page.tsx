"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  forgotPassword,
  login,
  registerIndividual,
  registerLegal,
  resetPasswordEmailOtp,
  resetPasswordSms,
  socialLogin,
} from "@/lib/api/auth";
import EmailVerification from "@/components/auth/EmailVerification";
import { ApiError } from "@/lib/api/client";
import { storeProfileGender } from "@/lib/auth/profilePreferences";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import styles from "./authorization.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { getSocialAuthToken } from "@/lib/auth/socialAuth";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useStorefrontLocale();
  const en = locale === "en";
  const [activeTab, setActiveTab] = useState<"login" | "register" | "reset" | "verify">(
    "login"
  );
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [personType, setPersonType] = useState<"physical" | "legal">(
    "physical"
  );
  const [selectedGender, setSelectedGender] = useState<"male" | "female">(
    "male"
  );
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [method, setMethod] = useState<"email" | "phone" | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetRepeat, setShowResetRepeat] = useState(false);
  const [resetContact, setResetContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (
      requestedTab === "login" ||
      requestedTab === "register" ||
      requestedTab === "reset" || requestedTab === "verify"
    ) {
      setActiveTab(requestedTab);
      if (requestedTab === "verify") {
        setVerificationCodeSent(false);
        setVerificationEmail(sessionStorage.getItem("athome-verification-email") ?? "");
        sessionStorage.removeItem("athome-verification-email");
      }
      setFeedback(null);
    }
  }, [searchParams]);

  const clearFeedback = () => setFeedback(null);

  const getErrorText = (error: unknown) =>
    error instanceof Error ? error.message : "დაფიქსირდა შეცდომა";

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      const token = await getSocialAuthToken(provider);
      const response = await socialLogin({
        token,
        provider,
        acceptedTerms: true,
      });

      if (!response.accessToken) {
        setFeedback({
          type: "error",
          text: "ავტორიზაციის პასუხში token არ დაბრუნდა",
        });
        return;
      }

      router.push("/profile");
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await login({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });

      if (!response.accessToken) {
        setFeedback({
          type: "error",
          text: "ავტორიზაციის პასუხში token არ დაბრუნდა",
        });
        return;
      }

      router.push("/profile");
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
        setVerificationCodeSent(false);
        setVerificationEmail(String(formData.get("email") ?? "").trim());
        setActiveTab("verify");
        return;
      }
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "პაროლები ერთმანეთს არ ემთხვევა" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (personType === "physical") {
        const gender =
          String(formData.get("gender") ?? selectedGender) === "female"
            ? "female"
            : "male";
        const response = await registerIndividual({
          firstName: String(formData.get("firstName") ?? ""),
          lastName: String(formData.get("lastName") ?? ""),
          gender,
          email,
          phone: String(formData.get("phone") ?? ""),
          password,
          confirmPassword,
          acceptedTerms: formData.get("acceptedTerms") === "on",
        });

        if (response.success) {
          storeProfileGender(gender);

          setVerificationCodeSent(true);
          setVerificationEmail(email.trim());
          setActiveTab("verify");
          setFeedback(null);
          return;
        }

        setFeedback({ type: "error", text: response.message });
      } else {
        const response = await registerLegal({
          companyName: String(formData.get("companyName") ?? ""),
          identificationCode: String(formData.get("identificationCode") ?? ""),
          representativeName: String(formData.get("representativeName") ?? ""),
          email,
          phone: String(formData.get("phone") ?? ""),
          password,
          confirmPassword,
          acceptedTerms: formData.get("acceptedTerms") === "on",
        });

        if (response.success) {
          storeProfileGender("male");

          setVerificationCodeSent(true);
          setVerificationEmail(email.trim());
          setActiveTab("verify");
          setFeedback(null);
          return;
        }

        setFeedback({ type: "error", text: response.message });
      }
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    clearFeedback();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const contact = String(formData.get("resetContact") ?? "");

    try {
      await forgotPassword(
        method === "email" ? { email: contact } : { phone: contact }
      );
      setResetContact(contact);
      setFeedback({
        type: "success",
        text: "თუ ანგარიში არსებობს, აღდგენის კოდი გამოგზავნილია. შეამოწმეთ შეტყობინებები.",
      });
      setResetStep(3);
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    clearFeedback();

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "პაროლები ერთმანეთს არ ემთხვევა" });
      return;
    }

    setIsSubmitting(true);

    try {
      if (method === "phone") {
        await resetPasswordSms({
          phone: resetContact,
          otpCode: code,
          newPassword,
        });
      } else {
        await resetPasswordEmailOtp({
          email: resetContact,
          otpCode: code,
          newPassword,
        });
      }
      setResetStep(5);
      setFeedback(null);
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {isSubmitting && <AtHomeLoader variant="overlay" label="იტვირთება" />}

      <div className={styles.authWrapper}>
        <div className={styles.leftSide}>
          <Image
            src="/images/auth-banner.png"
            alt={en ? "At Home technology banner" : "At Home ტექნოლოგიური ბანერი"}
            fill
            priority
            sizes="436px"
          />
        </div>

        <div className={styles.rightSide}>
          {activeTab === "verify" ? (
            <EmailVerification initialEmail={verificationEmail} initialCodeSent={verificationCodeSent} en={en}
              onRegister={(email) => { setVerificationEmail(email); setActiveTab("register"); setFeedback(null); }}
              onBack={() => { setActiveTab("login"); setFeedback(null); }}
              onVerified={() => {
                setActiveTab("login");
                setFeedback({ type: "success", text: en ? "Email confirmed. Please sign in again." : "ელფოსტა დადასტურებულია. გაიარეთ ავტორიზაცია." });
              }} />
          ) : activeTab === "reset" ? (
            <>
              {resetStep === 1 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      <img src="/icons/password.svg" alt="password" />
                    </div>
                    <h3 className={styles.mainTittle}>პაროლის აღდგენა</h3>
                    <p className={styles.desc}>
                      აირჩიეთ პაროლის აღდგენის მეთოდი
                    </p>
                  </div>

                  <div className={styles.methods}>
                    <div
                      className={`${styles.method} ${
                        method === "email" ? styles.active : ""
                      }`}
                      onClick={() => setMethod("email")}
                    >
                      <div>
                        <img src="/icons/passwordMail.svg" alt="email" />
                      </div>
                      ელ. ფოსტა
                    </div>
                    <div
                      className={`${styles.method} ${
                        method === "phone" ? styles.active : ""
                      }`}
                      onClick={() => setMethod("phone")}
                    >
                      <div>
                        <img src="/icons/phone1.svg" alt="phone" />
                      </div>
                      მობილური
                    </div>
                  </div>

                  <button
                    className={styles.next}
                    disabled={!method}
                    onClick={() => setResetStep(2)}
                  >
                    გაგრძელება
                  </button>

                  <div
                    className={styles.back}
                    onClick={() => setActiveTab("login")}
                  >
                    <img src="/icons/passwordArrow.svg" alt="Arrow" /> უკან
                    დაბრუნება
                  </div>
                  <div className={styles.progressWrapper}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`${styles.progressStep} ${
                          resetStep >= step ? styles.active : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}

              {resetStep === 2 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      {method === "email" ? (
                        <img src="/icons/passwordMail.svg" alt="mail" />
                      ) : (
                        <img src="/icons/phone1.svg" alt="phone" />
                      )}
                    </div>
                    <h3 className={styles.mainTittle}>პაროლის აღდგენა</h3>
                    <p className={styles.desc}>
                      {method === "email"
                        ? "იმისათვის, რომ აღადგინოთ პაროლი გთხოვთ შეიყვანოთ ელ. ფოსტა"
                        : "იმისათვის, რომ აღადგინოთ პაროლი გთხოვთ შეიყვანოთ მობილურის ნომერი"}
                    </p>
                  </div>

                  <form
                    className={styles.resetForm}
                    onSubmit={handleForgotPassword}
                  >
                    <input
                      className={styles.passwordInput}
                      type={method === "email" ? "email" : "tel"}
                      name="resetContact"
                      placeholder={
                        method === "email" ? "ელ. ფოსტა" : "მობილურის ნომერი"
                      }
                      required
                    />

                    {feedback && (
                      <p
                        className={`${styles.feedback} ${
                          feedback.type === "error"
                            ? styles.errorFeedback
                            : styles.successFeedback
                        }`}
                      >
                        {feedback.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className={styles.next}
                      disabled={isSubmitting}
                    >
                      გაგრძელება
                    </button>
                  </form>

                  <div className={styles.back} onClick={() => setResetStep(1)}>
                    ← უკან დაბრუნება
                  </div>
                  <div className={styles.progressWrapper}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`${styles.progressStep} ${
                          resetStep >= step ? styles.active : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}

              {resetStep === 3 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      {method === "email" ? (
                        <img src="/icons/passwordMail.svg" alt="mail" />
                      ) : (
                        <img src="/icons/phone1.svg" alt="phone" />
                      )}
                    </div>
                    <h3 className={styles.mainTittle}>
                      ვერიფიკაციის კოდის დადასტურება
                    </h3>
                    <div className={styles.desc}>
                      {method === "email" ? (
                        <div>
                          <p>თუ ანგარიში არსებობს, კოდი გამოგზავნილია ელფოსტაზე</p>
                          <span>{resetContact}</span>
                        </div>
                      ) : (
                        <div>
                          <p>თუ ანგარიში არსებობს, კოდი გამოგზავნილია ნომერზე</p>
                          <span>{resetContact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    className={styles.passwordInput}
                    type="text"
                    placeholder="კოდი"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <button className={styles.next} onClick={() => setResetStep(4)}>
                    გაგრძელება
                  </button>

                  <div className={styles.back} onClick={() => setResetStep(2)}>
                    ← უკან დაბრუნება
                  </div>
                  <div className={styles.progressWrapper}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`${styles.progressStep} ${
                          resetStep >= step ? styles.active : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}

              {resetStep === 4 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      <img src="/icons/newPassword.svg" alt="password" />
                    </div>
                    <h3 className={styles.mainTittle}>დააყენე ახალი პაროლი</h3>
                    <p className={styles.desc}>
                      გამოიყენეთ მინიმუმ 12 სიმბოლო (მაქსიმუმ 128).
                    </p>
                  </div>

                  <form
                    className={styles.resetForm}
                    onSubmit={handleResetPassword}
                  >
                    <div className={styles.passwordField}>
                      <input
                        type={showResetPassword ? "text" : "password"}
                        placeholder="პაროლი"
                        minLength={12}
                        maxLength={128}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowResetPassword((prev) => !prev)}
                      >
                        <img
                          src={
                            showResetPassword
                              ? "/icons/Eye.svg"
                              : "/icons/Closed-eye.svg"
                          }
                          alt="toggle"
                        />
                      </button>
                    </div>

                    <div className={styles.passwordField}>
                      <input
                        type={showResetRepeat ? "text" : "password"}
                        placeholder="გაიმეორე პაროლი"
                        minLength={12}
                        maxLength={128}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowResetRepeat((prev) => !prev)}
                      >
                        <img
                          src={
                            showResetRepeat
                              ? "/icons/Eye.svg"
                              : "/icons/Closed-eye.svg"
                          }
                          alt="toggle"
                        />
                      </button>
                    </div>

                    {feedback && (
                      <p
                        className={`${styles.feedback} ${
                          feedback.type === "error"
                            ? styles.errorFeedback
                            : styles.successFeedback
                        }`}
                      >
                        {feedback.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className={styles.next}
                      disabled={isSubmitting}
                    >
                      პაროლის შეცვლა
                    </button>
                    <button type="button" className={styles.back} onClick={() => { setResetStep(2); setCode(""); setFeedback(null); }}>
                      ახალი კოდის გაგზავნა
                    </button>
                  </form>

                  <div className={styles.back} onClick={() => setResetStep(3)}>
                    ← უკან დაბრუნება
                  </div>
                  <div className={styles.progressWrapper}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`${styles.progressStep} ${
                          resetStep >= step ? styles.active : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}

              {resetStep === 5 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      <img src="/icons/passwordCheck.svg" alt="success" />
                    </div>
                    <h3 className={styles.mainTittle}>
                      პაროლი წარმატებით შეიცვალა
                    </h3>
                  </div>

                  <div className={styles.progressWrapper}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`${styles.progressStep} ${
                          resetStep >= step ? styles.active : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {activeTab === "login" ? (
                <div className={styles.titleWrapper}>
                  <div className={styles.imageWrapper}>
                    <img src="/icons/authorization.svg" alt="person" />
                  </div>
                  <h3 className={styles.mainTittle}>{en ? "Sign in" : "ავტორიზაცია"}</h3>
                </div>
              ) : (
                <h3 className={styles.mainTittle}>{en ? "Registration" : "რეგისტრაცია"}</h3>
              )}

              {/* --- ტაბები --- */}
              <div className={styles.tabs}>
                <button
                  className={activeTab === "login" ? styles.active : ""}
                  onClick={() => {
                    clearFeedback();
                    setActiveTab("login");
                  }}
                >
                  {en ? "Sign in" : "ავტორიზაცია"}
                </button>
                <button
                  className={activeTab === "register" ? styles.active : ""}
                  onClick={() => {
                    clearFeedback();
                    setActiveTab("register");
                  }}
                >
                  {en ? "Registration" : "რეგისტრაცია"}
                </button>
              </div>

              {/* --- ფორმები --- */}
              {activeTab === "login" ? (
                <form
                  className={styles.form}
                  autoComplete="on"
                  onSubmit={handleLogin}
                >
                  <input
                    type="email"
                    placeholder={en ? "Email" : "ელ. ფოსტა"}
                    name="email"
                        defaultValue={verificationEmail}
                    autoComplete="username"
                    required
                  />
                  <div className={styles.passwordField}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder={en ? "Password" : "პაროლი"}
                      name="password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                    >
                      <img
                        src={
                          showLoginPassword
                            ? "/icons/Eye.svg"
                            : "/icons/Closed-eye.svg"
                        }
                        alt="toggle"
                      />
                    </button>
                  </div>
                  <div
                    className={styles.link}
                    onClick={() => {
                      clearFeedback();
                      setActiveTab("reset");
                    }}
                  >
                    {en ? "Forgot password?" : "დაგავიწყდა პაროლი?"}
                  </div>

                  {feedback && (
                    <p
                      className={`${styles.feedback} ${
                        feedback.type === "error"
                          ? styles.errorFeedback
                          : styles.successFeedback
                      }`}
                    >
                      {feedback.text}
                    </p>
                  )}

                  <button
                    className={styles.submit}
                    disabled={isSubmitting}
                  >
                    {en ? "Sign in" : "შესვლა"}
                  </button>

                  <div className={styles.socials}>
                    <button
                      type="button"
                      className={styles.facebook}
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin("facebook")}
                    >
                      <img src="/icons/facebook.svg" alt="facebook" />
                      {en ? "Sign in with Facebook" : "Facebook - ით შესვლა"}
                    </button>
                    <button
                      type="button"
                      className={styles.google}
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin("google")}
                    >
                      <img src="/icons/google.svg" alt="google" />
                      {en ? "Sign in with Google" : "Google - ით შესვლა"}
                    </button>
                  </div>

                  <p className={styles.footerText}>
                    {en ? "Not registered yet?" : "არ ხარ დარეგისტრირებული?"}
                    <span
                      onClick={() => {
                        clearFeedback();
                        setActiveTab("register");
                      }}
                    >
                      {" "}
                      {en ? "Create an account" : "შექმენი"}
                    </span>
                  </p>
                </form>
              ) : (
                <form
                  className={styles.form}
                  autoComplete="on"
                  onSubmit={handleRegister}
                >
                  <div className={styles.personTypeSwitch}>
                    <button
                      type="button"
                      className={personType === "physical" ? styles.active : ""}
                      onClick={() => setPersonType("physical")}
                    >
                      ფიზიკური პირი
                    </button>

                    <button
                      type="button"
                      className={personType === "legal" ? styles.active : ""}
                      onClick={() => setPersonType("legal")}
                    >
                      იურიდიული პირი
                    </button>
                  </div>

                  {personType === "physical" ? (
                    <>
                      <div className={styles.row}>
                        <input
                          type="text"
                          placeholder="სახელი"
                          name="firstName"
                          autoComplete="given-name"
                          required
                        />
                        <input
                          type="text"
                          placeholder="გვარი"
                          name="lastName"
                          autoComplete="family-name"
                          required
                        />
                      </div>

                      <div className={styles.genderGroup}>
                        <label className={styles.radio}>
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={selectedGender === "female"}
                            onChange={() => {
                              setSelectedGender("female");
                              storeProfileGender("female");
                            }}
                          />
                          <span className={styles.customRadio}></span>
                          <p>მდედრობითი</p>
                        </label>
                        <label className={styles.radio}>
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={selectedGender === "male"}
                            onChange={() => {
                              setSelectedGender("male");
                              storeProfileGender("male");
                            }}
                          />
                          <span className={styles.customRadio}></span>
                          <p>მამრობითი</p>
                        </label>
                      </div>

                      <input
                        type="email"
                        name="email"
                        defaultValue={verificationEmail}
                        placeholder="ელ. ფოსტა"
                        autoComplete="email"
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="მობილურის ნომერი"
                        autoComplete="tel-national"
                        inputMode="tel"
                        pattern="[0-9+]*"
                        required
                      />

                      <p className={styles.desc}>{en ? "At least 12 characters (maximum 128)." : "მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)."}</p>
                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
                            minLength={12}
                            maxLength={128}
                            title="მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)"
                            required
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <img
                              src={
                                showPassword
                                  ? "/icons/Eye.svg"
                                  : "/icons/Closed-eye.svg"
                              }
                              alt="toggle"
                            />
                          </button>
                        </div>

                        <div className={styles.passwordField}>
                          <input
                            className={styles.secondPassword}
                            type={showRepeatPassword ? "text" : "password"}
                            placeholder="გაიმეორე პაროლი"
                            name="confirmPassword"
                            autoComplete="new-password"
                            minLength={12}
                            maxLength={128}
                            title="მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)"
                            required
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() =>
                              setShowRepeatPassword((prev) => !prev)
                            }
                          >
                            <img
                              src={
                                showRepeatPassword
                                  ? "/icons/Eye.svg"
                                  : "/icons/Closed-eye.svg"
                              }
                              alt="toggle"
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="კომპანიის დასახელება"
                        name="companyName"
                        required
                      />
                      <input
                        type="text"
                        placeholder="საიდენტიფიკაციო კოდი"
                        name="identificationCode"
                        required
                      />
                      <input
                        type="text"
                        placeholder="წარმომადგენლის სახელი და გვარი"
                        name="representativeName"
                        required
                      />

                      <div className={styles.row}>
                        <input
                          type="email"
                          name="email"
                        defaultValue={verificationEmail}
                          placeholder="ელ. ფოსტა"
                          autoComplete="email"
                          required
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="მობილურის ნომერი"
                          autoComplete="tel-national"
                          inputMode="tel"
                          pattern="[0-9+]*"
                          required
                        />
                      </div>

                      <p className={styles.desc}>{en ? "At least 12 characters (maximum 128)." : "მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)."}</p>
                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
                            minLength={12}
                            maxLength={128}
                            title="მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)"
                            required
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <img
                              src={
                                showPassword
                                  ? "/icons/Eye.svg"
                                  : "/icons/Closed-eye.svg"
                              }
                              alt="toggle"
                            />
                          </button>
                        </div>

                        <div className={styles.passwordField}>
                          <input
                            className={styles.secondPassword}
                            type={showRepeatPassword ? "text" : "password"}
                            placeholder="გაიმეორე პაროლი"
                            name="confirmPassword"
                            autoComplete="new-password"
                            minLength={12}
                            maxLength={128}
                            title="მინიმუმ 12 სიმბოლო (მაქსიმუმ 128)"
                            required
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() =>
                              setShowRepeatPassword((prev) => !prev)
                            }
                          >
                            <img
                              src={
                                showRepeatPassword
                                  ? "/icons/Eye.svg"
                                  : "/icons/Closed-eye.svg"
                              }
                              alt="toggle"
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <label className={styles.checkbox}>
                    <input type="checkbox" name="acceptedTerms" required /> ვეთანხმები <a href="#">წესებს და პირობებს</a>
                  </label>

                  {feedback && (
                    <p
                      className={`${styles.feedback} ${
                        feedback.type === "error"
                          ? styles.errorFeedback
                          : styles.successFeedback
                      }`}
                    >
                      {feedback.text}
                    </p>
                  )}

                  <button className={styles.submit} disabled={isSubmitting}>
                    რეგისტრაცია
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
