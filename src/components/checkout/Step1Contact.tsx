"use client";

import React, { useState, ChangeEvent } from "react";
import styles from "./Step1Contact.module.scss";
import { useRouter } from "next/navigation";

interface Step1Props {
  onNext?: (data: FormValues) => void;
}

interface FormValues {
  type: "individual" | "company";
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string;
  personalId: string;
  companyName: string;
  companyId: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  altPhone?: string;
  personalId?: string;
  companyName?: string;
  companyId?: string;
  email?: string;
}

export default function Step1Contact({ onNext }: Step1Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormValues>({
    type: "individual",
    firstName: "",
    lastName: "",
    phone: "",
    altPhone: "",
    personalId: "",
    companyName: "",
    companyId: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleNext = () => {
    const validationErrors: FormErrors = {};

    const phoneRegex = /^\d{9}$/;
    if (!phoneRegex.test(form.phone))
      validationErrors.phone = "ტელეფონი უნდა იყოს 9 ციფრი";

    if (!form.altPhone.trim()) {
      validationErrors.altPhone = "შეავსეთ დამატებითი ტელეფონი";
    } else if (!phoneRegex.test(form.altPhone)) {
      validationErrors.altPhone = "დამატებითი ტელეფონი უნდა იყოს 9 ციფრი";
    }

    if (!form.email.includes("@"))
      validationErrors.email = "ელ. ფოსტა უნდა შეიცავდეს '@'";

    if (form.type === "individual") {
      if (!form.firstName.trim())
        validationErrors.firstName = "შეავსეთ სახელი";

      if (!form.lastName.trim())
        validationErrors.lastName = "შეავსეთ გვარი";

      const personalIdRegex = /^\d{11}$/;
      if (!personalIdRegex.test(form.personalId))
        validationErrors.personalId = "პირადი ნომერი უნდა იყოს 11 ციფრი";
    }

    if (form.type === "company") {
      if (!form.companyName.trim())
        validationErrors.companyName = "შეავსეთ კომპანიის სახელი";

      const companyIdRegex = /^\d{9}$/;
      if (!companyIdRegex.test(form.companyId))
        validationErrors.companyId = "საიდენტიფიკაციო კოდი უნდა იყოს 9 ციფრი";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onNext?.(form);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    errors[field] ? `${styles.input} ${styles.errorInput}` : styles.input;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/icons/passwordArrow.svg"
          alt="Arrow"
          className={styles.backArrow}
          onClick={() => router.push("/basket")}
        />
        <h2 className={styles.title}>საკონტაქტო დეტალები</h2>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <select
            name="type"
            value={form.type}
            className={styles.select}
            onChange={handleChange}
          >
            <option value="individual">ფიზიკური პირი</option>
            <option value="company">იურიდიული პირი</option>
          </select>
        </div>
      </div>

      {form.type === "individual" && (
        <>
          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="სახელი"
                className={inputClass("firstName")}
              />
              {errors.firstName && <div className={styles.error}>{errors.firstName}</div>}
            </div>

            <div style={{ flex: 1 }}>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="გვარი"
                className={inputClass("lastName")}
              />
              {errors.lastName && <div className={styles.error}>{errors.lastName}</div>}
            </div>
          </div>
        </>
      )}

      {form.type === "company" && (
        <>
          <div className={styles.row}>
            <div className={styles.company}>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="კომპანიის სახელი"
                className={inputClass("companyName")}
              />
              {errors.companyName && <div className={styles.error}>{errors.companyName}</div>}
            </div>
          </div>
        </>
      )}

      <div className={styles.row}>
        <div style={{ flex: 1 }}>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="ტელეფონის ნომერი"
            className={inputClass("phone")}
          />
          {errors.phone && <div className={styles.error}>{errors.phone}</div>}
        </div>

        <div style={{ flex: 1 }}>
          <input
            name="altPhone"
            value={form.altPhone}
            onChange={handleChange}
            placeholder="დამატებითი საკონტაქტო ნომერი"
            className={inputClass("altPhone")}
          />
          {errors.altPhone && <div className={styles.error}>{errors.altPhone}</div>}
        </div>
      </div>

      <div className={styles.row}>
        <div style={{ flex: 1 }}>
          {form.type === "individual" && (
            <>
              <input
                name="personalId"
                value={form.personalId}
                onChange={handleChange}
                placeholder="პირადი ნომერი"
                className={inputClass("personalId")}
              />
              {errors.personalId && <div className={styles.error}>{errors.personalId}</div>}
            </>
          )}

          {form.type === "company" && (
            <>
              <input
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                placeholder="საიდენტიფიკაციო კოდი"
                className={inputClass("companyId")}
              />
              {errors.companyId && <div className={styles.error}>{errors.companyId}</div>}
            </>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ელ. ფოსტა"
            className={inputClass("email")}
          />
          {errors.email && <div className={styles.error}>{errors.email}</div>}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.submit} onClick={handleNext}>
          გაგრძელება
        </button>
      </div>
    </div>
  );
}
