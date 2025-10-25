"use client";

import { useState } from "react";
import styles from "./ProfilePage.module.scss";

export default function ProfilePage() {
  const [userType, setUserType] = useState<"physical" | "legal">("physical");
  const [activeTab, setActiveTab] = useState<
    "info" | "orders" | "cart" | "wishlist" | "logout"
  >("info");

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    repeat: false,
  });

  const [editable, setEditable] = useState<Record<string, boolean>>({});

  const togglePassword = (field: "old" | "new" | "repeat") => {
    setShowPasswords((p) => ({ ...p, [field]: !p[field] }));
  };

  const toggleEdit = (field: string) => {
    setEditable((p) => ({ ...p, [field]: !p[field] }));
  };

  const user = {
    id: "000095214",
    firstName: "გიორგი",
    lastName: "ბაგრატიონი",
    email: "giorgibagrationi@gmail.com",
    phone: "555 123 456",
    personalId: "60001123007",
    gender: "მამრობითი",
    companyName: "შპს Athome.ge",
    companyEmail: "athome@gmail.com",
  };

  const menuItems = [
    { id: "info", label: "პირადი ინფორმაცია", icon: "/icons/profile1.svg" },
    { id: "orders", label: "ჩემი შეკვეთები", icon: "/icons/profile2.svg" },
    {
      id: "cart",
      label: "ჩემი კალათა",
      icon: "/icons/profile3.svg",
      badge: 28,
    },
    {
      id: "wishlist",
      label: "სურვილების სია",
      icon: "/icons/profile4.svg",
      badge: 28,
    },
    { id: "logout", label: "გასვლა", icon: "/icons/profile5.svg" },
  ];

  const renderInput = (name: string, value: string, type = "text") => (
    <div className={styles.editableField}>
      <input type={type} defaultValue={value} readOnly={!editable[name]} />
      <img
        src="./icons/profileChange.svg"
        alt="edit"
        onClick={() => toggleEdit(name)}
        className={editable[name] ? styles.activeIcon : ""}
      />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              <img src="./icons/profilePerson.svg" alt="user" />
            </div>
            <h3>
              {user.firstName} {user.lastName}
            </h3>
            <p className={styles.userId}>ID {user.id}</p>
          </div>

          <ul className={styles.menu}>
            {menuItems.map((item) => (
              <li
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={activeTab === item.id ? styles.active : ""}
              >
                <img src={item.icon} alt={item.label} className={styles.icon} />
                {item.label}
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.content}>
          {activeTab === "info" && (
            <>
              <h4>პირადი ინფორმაცია</h4>

              <div className={styles.profileWrapper}>
                <div>
                  <img src="./icons/profilePerson.svg" alt="person" />
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
                        <input
                          type="radio"
                          name="gender"
                          id="male"
                          defaultChecked
                        />
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
                    {renderInput(
                      "contactName",
                      `${user.firstName} ${user.lastName}`
                    )}
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
                            ? "./icons/Eye.svg"
                            : "./icons/Closed-eye.svg"
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
            </>
          )}

          {activeTab === "orders" && (
            <h4>შეკვეთების სია (შემდგომში დაემატება)</h4>
          )}
          {activeTab === "cart" && <h4>ჩემი კალათა — პროდუქციის სია</h4>}
          {activeTab === "wishlist" && (
            <h4>სურვილების სია — შენახული ნივთები</h4>
          )}
          {activeTab === "logout" && (
            <div>
              <h4>გინდა გამოსვლა?</h4>
              <button className={styles.save}>გასვლა</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
