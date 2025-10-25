"use client";

import { useState } from "react";
import styles from "./authorization.module.scss";

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "reset">(
    "login"
  );
  const [personType, setPersonType] = useState<"physical" | "legal">(
    "physical"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [method, setMethod] = useState<"email" | "phone" | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetRepeat, setShowResetRepeat] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.authWrapper}>
        <div className={styles.leftSide}></div>

        <div className={styles.rightSide}>
          {activeTab === "reset" ? (
            <>
              {resetStep === 1 && (
                <>
                  <div className={styles.titleWrapper}>
                    <div className={styles.imageWrapper}>
                      <img src="./icons/password.svg" alt="password" />
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
                        <img src="./icons/passwordMail.svg" alt="email" />
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
                        <img src="./icons/phone1.svg" alt="phone" />
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
                    <img src="./icons/passwordArrow.svg" alt="Arrow" /> უკან
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
                        <img src="./icons/passwordMail.svg" alt="mail" />
                      ) : (
                        <img src="./icons/phone1.svg" alt="phone" />
                      )}
                    </div>
                    <h3 className={styles.mainTittle}>პაროლის აღდგენა</h3>
                    <p className={styles.desc}>
                      {method === "email"
                        ? "იმისათვის, რომ აღადგინოთ პაროლი გთხოვთ შეიყვანოთ ელ. ფოსტა"
                        : "იმისათვის, რომ აღადგინოთ პაროლი გთხოვთ შეიყვანოთ მობილურის ნომერი"}
                    </p>
                  </div>

                  <input
                    className={styles.passwordInput}
                    type={method === "email" ? "email" : "tel"}
                    placeholder={
                      method === "email" ? "ელ. ფოსტა" : "მობილურის ნომერი"
                    }
                  />

                  <button
                    className={styles.next}
                    onClick={() => setResetStep(3)}
                  >
                    გაგრძელება
                  </button>

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
                        <img src="./icons/passwordMail.svg" alt="mail" />
                      ) : (
                        <img src="./icons/phone1.svg" alt="phone" />
                      )}
                    </div>
                    <h3 className={styles.mainTittle}>
                      ვერიფიკაციის კოდის დადასტურება
                    </h3>
                    <div className={styles.desc}>
                      {method === "email" ? (
                        <div>
                          <p>ვერიფიკაციის კოდი გამოგზავნილია ელ.ფოსტაზე</p>
                          <span>sosokhvichia@gmail.com</span>
                        </div>
                      ) : (
                        <div>
                          <p>ვერიფიკაციის კოდი გამოგზავნილია ნომერზე</p>
                          <span>551 123 456</span>
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

                  <button
                    className={styles.next}
                    onClick={() => setResetStep(4)}
                  >
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
                      <img src="./icons/newPassword.svg" alt="password" />
                    </div>
                    <h3 className={styles.mainTittle}>დააყენე ახალი პაროლი</h3>
                    <p className={styles.desc}>
                      უნდა იყოს მინიმუმ 8 სიმბოლო, ერთი დიდი ასოთი, ერთი პატარა
                      ასოთი და ერთი რიცხვით.
                    </p>
                  </div>

                  <div className={styles.passwordField}>
                    <input
                      type={showResetPassword ? "text" : "password"}
                      placeholder="პაროლი"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowResetPassword((prev) => !prev)}
                    >
                      <img
                        src={
                          showResetPassword
                            ? "./icons/Eye.svg"
                            : "./icons/Closed-eye.svg"
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
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowResetRepeat((prev) => !prev)}
                    >
                      <img
                        src={
                          showResetRepeat
                            ? "./icons/Eye.svg"
                            : "./icons/Closed-eye.svg"
                        }
                        alt="toggle"
                      />
                    </button>
                  </div>

                  <button
                    className={styles.next}
                    onClick={() => setResetStep(5)}
                  >
                    პაროლის შეცვლა
                  </button>

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
                      <img src="./icons/passwordCheck.svg" alt="success" />
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
                    <img src="./icons/authorization.svg" alt="person" />
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
                  onClick={() => setActiveTab("login")}
                >
                  ავტორიზაცია
                </button>
                <button
                  className={activeTab === "register" ? styles.active : ""}
                  onClick={() => setActiveTab("register")}
                >
                  რეგისტრაცია
                </button>
              </div>

              {/* --- ფორმები --- */}
              {activeTab === "login" ? (
                <form className={styles.form} autoComplete="on">
                  <input
                    type="email"
                    placeholder="ელ. ფოსტა"
                    name="email"
                    autoComplete="username"
                  />
                  <input
                    type="password"
                    placeholder="პაროლი"
                    name="password"
                    autoComplete="current-password"
                  />
                  <div
                    className={styles.link}
                    onClick={() => setActiveTab("reset")}
                  >
                    დაგავიწყდა პაროლი?
                  </div>

                  <button className={styles.submit}>შესვლა</button>

                  <div className={styles.socials}>
                    <button className={styles.facebook}>
                      <img src="./icons/facebook.svg" alt="facebook" />
                      Facebook - ით შესვლა
                    </button>
                    <button className={styles.google}>
                      <img src="./icons/google.svg" alt="google" />
                      Google - ით შესვლა
                    </button>
                  </div>

                  <p className={styles.footerText}>
                    არ ხარ დარეგისტრირებული?
                    <span onClick={() => setActiveTab("register")}>
                      {" "}
                      შექმენი
                    </span>
                  </p>
                </form>
              ) : (
                <form className={styles.form} autoComplete="on">
                  <select
                    value={personType}
                    onChange={(e) =>
                      setPersonType(e.target.value as "physical" | "legal")
                    }
                  >
                    <option value="physical">ფიზიკური პირი</option>
                    <option value="legal">იურიდიული პირი</option>
                  </select>

                  {personType === "physical" ? (
                    <>
                      <div className={styles.row}>
                        <input
                          type="text"
                          placeholder="სახელი"
                          name="firstName"
                          autoComplete="given-name"
                        />
                        <input
                          type="text"
                          placeholder="გვარი"
                          name="lastName"
                          autoComplete="family-name"
                        />
                      </div>

                      <div className={styles.genderGroup}>
                        <label className={styles.radio}>
                          <input type="radio" name="gender" value="female" />
                          <span className={styles.customRadio}></span>
                          <p>მდედრობითი</p>
                        </label>
                        <label className={styles.radio}>
                          <input type="radio" name="gender" value="male" />
                          <span className={styles.customRadio}></span>
                          <p>მამრობითი</p>
                        </label>
                      </div>

                      <input
                        type="email"
                        name="email"
                        placeholder="ელ. ფოსტა"
                        autoComplete="email"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="მობილურის ნომერი"
                        autoComplete="tel-national"
                        inputMode="tel"
                        pattern="[0-9+]*"
                      />

                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <img
                              src={
                                showPassword
                                  ? "./icons/Eye.svg"
                                  : "./icons/Closed-eye.svg"
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
                                  ? "./icons/Eye.svg"
                                  : "./icons/Closed-eye.svg"
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
                        name="company"
                      />
                      <input
                        type="text"
                        placeholder="საიდენტიფიკაციო კოდი"
                        name="idNumber"
                      />
                      <input
                        type="text"
                        placeholder="სამართლებრივი მისამართი"
                        name="address"
                      />

                      <div className={styles.row}>
                        <input
                          type="email"
                          name="email"
                          placeholder="ელ. ფოსტა"
                          autoComplete="email"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="მობილურის ნომერი"
                          autoComplete="tel-national"
                          inputMode="tel"
                          pattern="[0-9+]*"
                        />
                      </div>

                      <div className={styles.password}>
                        <div className={styles.passwordField}>
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="პაროლი"
                            name="password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            <img
                              src={
                                showPassword
                                  ? "./icons/Eye.svg"
                                  : "./icons/Closed-eye.svg"
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
                                  ? "./icons/Eye.svg"
                                  : "./icons/Closed-eye.svg"
                              }
                              alt="toggle"
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <label className={styles.checkbox}>
                    <input type="checkbox" /> ვეთანხმები წესებს და პირობებს
                  </label>

                  <button className={styles.submit}>რეგისტრაცია</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
