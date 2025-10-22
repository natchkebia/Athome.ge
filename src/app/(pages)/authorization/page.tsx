"use client";

import { useState } from "react";
import styles from "./authorization.module.scss";

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [personType, setPersonType] = useState<"default" | "physical" | "legal">(
    "default"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.authWrapper}>
        <div className={styles.leftSide}></div>

        <div className={styles.rightSide}>
          <h3>{activeTab === "login" ? "ავტორიზაცია" : "რეგისტრაცია"}</h3>

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
              <div className={styles.link}>დაგავიწყდა პაროლი?</div>
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
                <span onClick={() => setActiveTab("register")}> შექმენი</span>
              </p>
            </form>
          ) : (
            <form className={styles.form} autoComplete="on">
              {/* --- სელექტი --- */}
              <select
                value={personType}
                onChange={(e) =>
                  setPersonType(e.target.value as "default" | "physical" | "legal")
                }
              >
                <option value="default">მომხმარებლის ტიპი</option>
                <option value="physical">ფიზიკური პირი</option>
                <option value="legal">იურიდიული პირი</option>
              </select>

              {/* --- ფიზიკური პირი --- */}
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
                        onClick={() => setShowRepeatPassword((prev) => !prev)}
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
              ) : personType === "legal" ? (
                <>
                  {/* --- იურიდიული პირი --- */}
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
                        onClick={() => setShowRepeatPassword((prev) => !prev)}
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
              ) : null}

              <label className={styles.checkbox}>
                <input type="checkbox" />
                ვეთანხმები წესებს და პირობებს
              </label>

              <button className={styles.submit}>რეგისტრაცია</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
