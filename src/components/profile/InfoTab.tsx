"use client";
import { useState } from "react";
import styles from "./InfoTab.module.scss";

export default function InfoTab() {
  const [userType, setUserType] = useState<"physical" | "legal">("physical");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    repeat: false,
  });
  const [editable, setEditable] = useState<Record<string, boolean>>({});

  const user = {
    firstName: "გიორგი",
    lastName: "ბაგრატიონი",
    email: "giorgibagrationi@gmail.com",
    phone: "555 123 456",
    personalId: "60001123007",
    gender: "მამრობითი",
    companyName: "შპს Athome.ge",
    companyEmail: "athome@gmail.com",
  };

  const toggleEdit = (field: string) =>
    setEditable((p) => ({ ...p, [field]: !p[field] }));

  const togglePassword = (field: "old" | "new" | "repeat") =>
    setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  const renderInput = (name: string, value: string, type = "text") => (
    <div className={styles.editableField}>
      <input type={type} defaultValue={value} readOnly={!editable[name]} />
      <img
        src="/icons/profileChange.svg"
        alt="edit"
        onClick={() => toggleEdit(name)}
        className={editable[name] ? styles.activeIcon : ""}
      />
    </div>
  );

  return (
    <div className={styles.infoTab}>
      <h4>პერსონალური ინფორმაცია</h4>

      <div className={styles.profileWrapper}>
        <div>
          {user.gender === "მდედრობითი" ? (
            <img src="/icons/profileWoman.svg" alt="user" />
          ) : (
            <img src="/icons/profilePerson.svg" alt="person" />
          )}
        </div>
        <span>პროფილის ფოტო</span>
      </div>

      <div className={styles.formGrid}>
        {userType === "physical" ? (
          <>
            {renderInput("firstName", user.firstName)}
            {renderInput("lastName", user.lastName)}
            {renderInput("email", user.email, "email")}
            {renderInput("phone", user.phone, "tel")}
            {renderInput("personalId", user.personalId)}
            <div className={styles.radioGroup}>
              <div>
                <input type="radio" name="gender" id="male" defaultChecked />
                <label htmlFor="male">მამრობითი</label>
              </div>
              <div>
                <input type="radio" name="gender" id="female" />
                <label htmlFor="female">მდედრობითი</label>
              </div>
            </div>
          </>
        ) : (
          <>
            {renderInput("companyName", user.companyName)}
            {renderInput("contactName", `${user.firstName} ${user.lastName}`)}
            {renderInput("companyEmail", user.companyEmail, "email")}
            {renderInput("companyPhone", user.phone, "tel")}
            {renderInput("companyId", user.personalId)}
          </>
        )}
      </div>

      <div className={styles.passwordSection}>
        <h4>პაროლის შეცვლა</h4>
        <div className={styles.passwordGrid}>
          {["old", "new", "repeat"].map((field, i) => (
            <div key={field} className={styles.passwordField}>
              <input
                type={
                  showPasswords[field as "old" | "new" | "repeat"]
                    ? "text"
                    : "password"
                }
                placeholder={
                  i === 0
                    ? "ძველი პაროლი"
                    : i === 1
                    ? "ახალი პაროლი"
                    : "გაიმეორე პაროლი"
                }
              />
              <img
                src={
                  showPasswords[field as "old" | "new" | "repeat"]
                    ? "/icons/Eye.svg"
                    : "/icons/Closed-eye.svg"
                }
                alt="toggle"
                onClick={() =>
                  togglePassword(field as "old" | "new" | "repeat")
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.final}>ანგარიშის გაუქმება</div>

      <div className={styles.buttons}>
        <button className={styles.save}>შენახვა</button>
        <span className={styles.switch}>გაუქმება</span>
      </div>
    </div>
  );
}
