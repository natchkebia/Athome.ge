"use client";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  changePassword,
  updateProfile,
  type AuthUser,
} from "@/lib/api/auth";
import {
  storeProfileGender,
  type ProfileGender,
} from "@/lib/auth/profilePreferences";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import styles from "./InfoTab.module.scss";

type InfoTabProps = {
  user: AuthUser;
  gender: ProfileGender;
  onGenderChange: (gender: ProfileGender) => void;
  onUserChange: (user: AuthUser) => void;
};

export default function InfoTab({
  user,
  gender,
  onGenderChange,
  onUserChange,
}: InfoTabProps) {
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    repeat: false,
  });
  const [editable, setEditable] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });
  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    repeat: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  }, [user]);

  const toggleEdit = (field: string) =>
    setEditable((p) => ({ ...p, [field]: !p[field] }));

  const togglePassword = (field: "old" | "new" | "repeat") =>
    setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  const getErrorText = (error: unknown) =>
    error instanceof Error ? error.message : "დაფიქსირდა შეცდომა";

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handlePasswordChange =
    (field: keyof typeof passwords) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setPasswords((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const hasPasswordInput = Boolean(
    passwords.old || passwords.new || passwords.repeat
  );

  const submitPasswordChange = async () => {
    if (!passwords.old || !passwords.new || !passwords.repeat) {
      throw new Error("პაროლის შესაცვლელად შეავსე სამივე ველი");
    }

    if (passwords.new !== passwords.repeat) {
      throw new Error("პაროლები ერთმანეთს არ ემთხვევა");
    }

    await changePassword({
      currentPassword: passwords.old,
      newPassword: passwords.new,
    });
    setPasswords({ old: "", new: "", repeat: "" });
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setFeedback(null);

    if (hasPasswordInput) {
      setFeedback({
        type: "error",
        text: "პაროლის შესაცვლელად გამოიყენე ღილაკი „პაროლის შეცვლა“",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      storeProfileGender(gender);
      onUserChange(updatedUser);
      setEditable({});
      setFeedback({
        type: "success",
        text: "პროფილი წარმატებით განახლდა",
      });
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setFeedback(null);

    if (!passwords.old || !passwords.new) {
      setFeedback({ type: "error", text: "შეავსე პაროლის ველები" });
      return;
    }

    if (passwords.new !== passwords.repeat) {
      setFeedback({ type: "error", text: "პაროლები ერთმანეთს არ ემთხვევა" });
      return;
    }

    setIsChangingPassword(true);

    try {
      await submitPasswordChange();
      setFeedback({
        type: "success",
        text: "პაროლი წარმატებით შეიცვალა",
      });
    } catch (error) {
      setFeedback({ type: "error", text: getErrorText(error) });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const renderInput = (
    name: keyof typeof form,
    value: string,
    type = "text"
  ) => (
    <div className={styles.editableField}>
      <input
        type={type}
        value={value}
        readOnly={!editable[name]}
        onChange={handleChange(name)}
      />
      <img
        src="/icons/profileChange.svg"
        alt="edit"
        onClick={() => toggleEdit(name)}
        className={editable[name] ? styles.activeIcon : ""}
      />
    </div>
  );

  return (
    <form className={styles.infoTab} onSubmit={handleSaveProfile}>
      {(isSaving || isChangingPassword) && (
        <AtHomeLoader variant="overlay" label="იტვირთება" />
      )}

      <h4>პერსონალური ინფორმაცია</h4>

      <div className={styles.profileWrapper}>
        <div>
          <img
            src={
              gender === "female"
                ? "/icons/profileWoman.svg"
                : "/icons/profilePerson.svg"
            }
            alt="person"
          />
        </div>
        <span>პროფილის ფოტო</span>
      </div>

      <div className={styles.formGrid}>
        {renderInput("firstName", form.firstName)}
        {renderInput("lastName", form.lastName)}
        {renderInput("email", form.email, "email")}
        {renderInput("phone", form.phone, "tel")}
        <div className={styles.radioGroup}>
          <div>
            <input
              type="radio"
              name="gender"
              id="male"
              checked={gender === "male"}
              onChange={() => {
                storeProfileGender("male");
                onGenderChange("male");
              }}
            />
            <label htmlFor="male">მამრობითი</label>
          </div>
          <div>
            <input
              type="radio"
              name="gender"
              id="female"
              checked={gender === "female"}
              onChange={() => {
                storeProfileGender("female");
                onGenderChange("female");
              }}
            />
            <label htmlFor="female">მდედრობითი</label>
          </div>
        </div>
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
                value={passwords[field as "old" | "new" | "repeat"]}
                onChange={handlePasswordChange(
                  field as "old" | "new" | "repeat"
                )}
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

      <div className={styles.buttons}>
        <button className={styles.save} disabled={isSaving}>
          შენახვა
        </button>
        <button
          type="button"
          className={styles.switch}
          disabled={isChangingPassword}
          onClick={handleChangePassword}
        >
          პაროლის შეცვლა
        </button>
      </div>
    </form>
  );
}
