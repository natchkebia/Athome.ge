"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  forgotPassword,
  login,
  registerIndividual,
  registerLegal,
  resetPassword,
  resetPasswordSms,
  socialLogin,
} from "@/lib/api/auth";
import { storeProfileGender } from "@/lib/auth/profilePreferences";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import styles from "./authorization.module.scss";

export default function AuthForm() {
  const router = useRouter();
  const socialRedirectUri =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/auth/social-callback`;
  const [activeTab, setActiveTab] = useState<"login" | "register" | "reset">(
    "login"
  );
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
  const [debugResetToken, setDebugResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const clearFeedback = () => setFeedback(null);

  const getErrorText = (error: unknown) =>
    error instanceof Error ? error.message : "დაფიქსირდა შეცდომა";

  const openSocialPopup = (url: string) =>
    new Promise<URLSearchParams>((resolve, reject) => {
      const width = 520;
      const height = 680;
      const dualScreenLeft = window.screenLeft ?? window.screenX;
      const dualScreenTop = window.screenTop ?? window.screenY;
      const viewportWidth =
        window.innerWidth ?? document.documentElement.clientWidth;
      const viewportHeight =
        window.innerHeight ?? document.documentElement.clientHeight;
      const left = dualScreenLeft + Math.max((viewportWidth - width) / 2, 0);
      const top = dualScreenTop + Math.max((viewportHeight - height) / 2, 0);
      const popup = window.open(
        url,
        "athome-social-auth",
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );

      if (!popup) {
        reject(new Error("Popup ვერ გაიხსნა. ბრაუზერში popup-ები დაუშვი."));
        return;
      }

      const authPopup = popup;

      const timeout = window.setTimeout(() => {
        window.removeEventListener("message", handleMessage);
        authPopup.close();
        reject(new Error("ავტორიზაციის დრო ამოიწურა"));
      }, 120000);

      const interval = window.setInterval(() => {
        if (authPopup.closed) {
          window.clearInterval(interval);
          window.clearTimeout(timeout);
          window.removeEventListener("message", handleMessage);
          reject(new Error("ავტორიზაცია გაუქმდა"));
        }
      }, 500);

      function cleanup() {
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        window.removeEventListener("message", handleMessage);
        authPopup.close();
      }

      function handleMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type !== "athome-social-auth") return;

        cleanup();
        const params = new URLSearchParams(event.data.params);
        const providerError =
          params.get("error_description") ??
          params.get("error_message") ??
          params.get("error");

        if (providerError) {
          reject(new Error(providerError));
          return;
        }

        resolve(params);
      }

      window.addEventListener("message", handleMessage);
    });

  const getSocialToken = async (provider: "google" | "facebook") => {
    if (provider === "google") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID არ არის მითითებული");
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: socialRedirectUri,
        response_type: "id_token",
        scope: "openid email profile",
        nonce: crypto.randomUUID(),
        prompt: "select_account",
      });
      const response = await openSocialPopup(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      );
      const token = response.get("id_token");

      if (!token) {
        throw new Error("Google token არ დაბრუნდა");
      }

      return token;
    }

    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

    if (!appId) {
      throw new Error("NEXT_PUBLIC_FACEBOOK_APP_ID არ არის მითითებული");
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: socialRedirectUri,
      response_type: "token",
      scope: "email,public_profile",
      auth_type: "rerequest",
      display: "popup",
    });
    const response = await openSocialPopup(
      `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
    );
    const token = response.get("access_token");

    if (!token) {
      throw new Error("Facebook token არ დაბრუნდა");
    }

    return token;
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    clearFeedback();
    setIsSubmitting(true);

    try {
      const token = await getSocialToken(provider);
      const response = await socialLogin({
        token,
        provider,
        acceptedTerms: true,
      });

      if (!response.accessToken || !response.refreshToken) {
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
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      if (!response.accessToken || !response.refreshToken) {
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

          try {
            const loginResponse = await login({ email, password });

            if (loginResponse.accessToken && loginResponse.refreshToken) {
              router.push("/profile");
              return;
            }
          } catch {
            // Some backends require email verification before first login.
          }

          setActiveTab("login");
          setFeedback({
            type: "success",
            text: response.message,
          });
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

          try {
            const loginResponse = await login({ email, password });

            if (loginResponse.accessToken && loginResponse.refreshToken) {
              router.push("/profile");
              return;
            }
          } catch {
            // Some backends require email verification before first login.
          }

          setActiveTab("login");
          setFeedback({
            type: "success",
            text: response.message,
          });
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
      const response = await forgotPassword(
        method === "email" ? { email: contact } : { phone: contact }
      );
      setResetContact(contact);
      setDebugResetToken(response.debugResetToken ?? "");
      setFeedback({
        type: "success",
        text: response.message ?? "კოდი წარმატებით გაიგზავნა",
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
        await resetPassword({
          email: resetContact,
          token: code,
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
        <div className={styles.leftSide}></div>

        <div className={styles.rightSide}>
          {activeTab === "reset" ? (
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
                          <p>ვერიფიკაციის კოდი გამოგზავნილია ელ.ფოსტაზე</p>
                          <span>{resetContact}</span>
                          {debugResetToken && <span>{debugResetToken}</span>}
                        </div>
                      ) : (
                        <div>
                          <p>ვერიფიკაციის კოდი გამოგზავნილია ნომერზე</p>
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
                      უნდა იყოს მინიმუმ 8 სიმბოლო, ერთი დიდი ასოთი, ერთი პატარა
                      ასოთი და ერთი რიცხვით.
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
                  <h3 className={styles.mainTittle}>ავტორიზაცია</h3>
                </div>
              ) : (
                <h3 className={styles.mainTittle}>რეგისტრაცია</h3>
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
                  ავტორიზაცია
                </button>
                <button
                  className={activeTab === "register" ? styles.active : ""}
                  onClick={() => {
                    clearFeedback();
                    setActiveTab("register");
                  }}
                >
                  რეგისტრაცია
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
                    placeholder="ელ. ფოსტა"
                    name="email"
                    autoComplete="username"
                    required
                  />
                  <div className={styles.passwordField}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="პაროლი"
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
                    დაგავიწყდა პაროლი?
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
                    შესვლა
                  </button>

                  <div className={styles.socials}>
                    <button
                      type="button"
                      className={styles.facebook}
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin("facebook")}
                    >
                      <img src="/icons/facebook.svg" alt="facebook" />
                      Facebook - ით შესვლა
                    </button>
                    <button
                      type="button"
                      className={styles.google}
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin("google")}
                    >
                      <img src="/icons/google.svg" alt="google" />
                      Google - ით შესვლა
                    </button>
                  </div>

                  <p className={styles.footerText}>
                    არ ხარ დარეგისტრირებული?
                    <span
                      onClick={() => {
                        clearFeedback();
                        setActiveTab("register");
                      }}
                    >
                      {" "}
                      შექმენი
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

                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
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

                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
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
