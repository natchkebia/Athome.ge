"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./Step4Payment.module.scss";
import TermsModal from "./components/TermsModal";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export type PaymentSelection = {
  method: "card" | "installment" | "splitPayment" | "bankTransfer";
  bank: string;
  email: string;
  installmentMonths: number;
};

const INSTALLMENT_MONTHS = [3, 6, 12, 18, 24];
export const SPLIT_PAYMENT_MIN_GEL = 50;

type BankPaymentOptions = Record<
  "bog" | "tbc" | "credo",
  { card: boolean; installment: boolean; splitPayment: boolean }
>;

// Keep bank capabilities in one place. Disabled options can be switched on
// when production credentials are ready without changing the checkout UI.
export const PAYMENT_OPTIONS: BankPaymentOptions = {
  bog: { card: true, installment: true, splitPayment: true },
  tbc: { card: true, installment: true, splitPayment: true },
  credo: { card: false, installment: true, splitPayment: true },
};

const FINANCING_OPTIONS = [
  { bank: "tbc", method: "installment", labelKa: "თიბისი განვადება", labelEn: "TBC installment" },
  { bank: "bog", method: "installment", labelKa: "საქართველოს ბანკის განვადება", labelEn: "Bank of Georgia installment" },
  { bank: "credo", method: "installment", labelKa: "კრედო განვადება", labelEn: "Credo installment" },
  { bank: "tbc", method: "splitPayment", labelKa: "Flitt TBC ნაწილ-ნაწილი", labelEn: "Flitt TBC split payment" },
  { bank: "bog", method: "splitPayment", labelKa: "საქართველოს ბანკის ნაწილ-ნაწილი", labelEn: "Bank of Georgia split payment" },
  { bank: "credo", method: "splitPayment", labelKa: "კრედო ბანკის ნაწილ-ნაწილი", labelEn: "Credo split payment" },
] as const;

interface Props {
  onNext?: (data: PaymentSelection) => void;
  onPrev?: () => void;
  submitting?: boolean;
  error?: string | null;
  orderTotal?: number;
}

export default function Step4Payment({
  onNext,
  onPrev,
  submitting = false,
  error = null,
  orderTotal = 0,
}: Props) {
  const en = useStorefrontLocale() === "en";
  const [method, setMethod] = useState<PaymentSelection["method"]>("card");
  const [bank, setBank] = useState<string>("tbc");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [installmentMonths, setInstallmentMonths] = useState(6);
  const splitPaymentEligible = orderTotal >= SPLIT_PAYMENT_MIN_GEL;
  const financingSelected = method === "installment" || method === "splitPayment";
  const availableBanks = useMemo(
    () =>
      (["tbc", "bog", "credo"] as const).filter(
        (bankCode) =>
          method !== "bankTransfer" && PAYMENT_OPTIONS[bankCode][method],
      ),
    [method],
  );

  useEffect(() => {
    if (method === "splitPayment" && !splitPaymentEligible) {
      setMethod("card");
      setBank("tbc");
      return;
    }
    if (method !== "bankTransfer" && !availableBanks.includes(bank as "tbc" | "bog" | "credo")) {
      setBank(availableBanks[0] ?? "");
    }
  }, [availableBanks, bank, method, splitPaymentEligible]);

  const chooseMethod = (nextMethod: PaymentSelection["method"]) => {
    if (nextMethod === "splitPayment" && !splitPaymentEligible) return;
    setMethod(nextMethod);
    if (nextMethod === "splitPayment") setBank("tbc");
    if (nextMethod === "installment") setBank("credo");
    if (nextMethod === "card") setBank("tbc");
    if (nextMethod === "bankTransfer") setBank("");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {onPrev && (
          <img
            src="/icons/passwordArrow.svg"
            alt="Arrow"
            className={styles.backArrow}
            onClick={onPrev}
            style={{ cursor: "pointer" }}
          />
        )}
        <h2 className={styles.title}>{en ? "Payment method" : "გადახდის მეთოდი"}</h2>
      </div>
      <div className={styles.methods}>
        <div
          className={`${styles.methodCard} ${
            method === "card" && styles.active
          }`}
          onClick={() => chooseMethod("card")}
        >
          <img src="/icons/card.svg" alt="card" />
          <p>{en ? "Pay by card" : "ბარათით გადახდა"}</p>
          {method === "card" && (
            <div className={styles.checkCircle}>
              <div className={styles.checkdiv} />
            </div>
          )}
        </div>
        <div
          className={`${styles.methodCard} ${financingSelected && styles.active}`}
          onClick={() => chooseMethod("installment")}
        >
          <img src="/icons/Installment.svg" alt="installment and split payment" />
          <p>{en ? "Installment and split payment" : "განვადება და განაწილება"}</p>
          {financingSelected && (
            <div className={styles.checkCircle}><div className={styles.checkdiv} /></div>
          )}
        </div>

        <div
          className={`${styles.methodCard} ${
            method === "bankTransfer" && styles.active
          }`}
          onClick={() => chooseMethod("bankTransfer")}
        >
          <img src="/icons/Payment.svg" alt="Payment" />
          <p>{en ? "Bank transfer" : "გადარიცხვა"}</p>
          {method === "bankTransfer" && (
            <div className={styles.checkCircle}>
              <div className={styles.checkdiv} />
            </div>
          )}
        </div>
      </div>
      {method === "card" && availableBanks.length > 0 && (
        <div className={styles.bankList}>
          {availableBanks.map((bankCode) => (
            <div
              key={bankCode}
              className={`${styles.bank} ${bank === bankCode && styles.bankActive}`}
              onClick={() => setBank(bankCode)}
            >
              <div className={styles.bankWrapper}>
                <div className={styles.radio}>{bank === bankCode && <div />}</div>
                {bankCode === "tbc" && method === "card" ? (
                  <img src="/icons/flitt-payment.png" className={styles.flittIcon} alt="Flitt" />
                ) : bankCode === "tbc" ? (
                  <img src="/icons/Tbc.svg" className={styles.bankIcon} alt={en ? "TBC Bank" : "თიბისი ბანკი"} />
                ) : bankCode === "bog" ? (
                  <img src="/icons/Bank_of_Georgia.svg" className={styles.bankIcon1} alt={en ? "Bank of Georgia" : "საქართველოს ბანკი"} />
                ) : (
                  <img src="/icons/kredo.svg" className={styles.bankIcon} alt={en ? "Credo Bank" : "კრედო ბანკი"} />
                )}
              </div>
              {method === "card" && (
                <div className={styles.cards}><img src="/icons/Group.svg" alt="Mastercard and Visa" /></div>
              )}
            </div>
          ))}
        </div>
      )}
      {financingSelected && (
        <div className={styles.bankList}>
          {FINANCING_OPTIONS.map((option) => {
            const disabled = option.method === "splitPayment" && !splitPaymentEligible;
            const selected = method === option.method && bank === option.bank;
            return (
              <div
                key={`${option.bank}-${option.method}`}
                className={`${styles.bank} ${selected ? styles.bankActive : ""} ${disabled ? styles.bankDisabled : ""}`}
                onClick={() => {
                  if (disabled) return;
                  setMethod(option.method);
                  setBank(option.bank);
                }}
                aria-disabled={disabled}
              >
                <div className={styles.bankWrapper}>
                  <div className={styles.radio}>{selected && <div />}</div>
                  {option.bank === "tbc" && option.method === "splitPayment" ? (
                    <img src="/icons/flitt-payment.png" className={styles.flittIcon} alt="Flitt TBC" />
                  ) : option.bank === "tbc" ? (
                    <img src="/icons/Tbc.svg" className={styles.bankIcon} alt={en ? "TBC Bank" : "თიბისი ბანკი"} />
                  ) : option.bank === "bog" ? (
                    <img src="/icons/Bank_of_Georgia.svg" className={styles.bankIcon1} alt={en ? "Bank of Georgia" : "საქართველოს ბანკი"} />
                  ) : (
                    <img src="/icons/kredo.svg" className={styles.bankIcon} alt={en ? "Credo Bank" : "კრედო ბანკი"} />
                  )}
                </div>
                <span className={styles.bankMethodLabel}>
                  {en ? option.labelEn : option.labelKa}
                  {disabled && <small>{en ? "Available from 50 ₾" : "ხელმისაწვდომია 50 ₾-დან"}</small>}
                </span>
              </div>
            );
          })}
          {method === "installment" && (
            <div className={styles.termPicker}>
              <label>{en ? "Preferred term (months)" : "სასურველი ვადა (თვე)"}</label>
              <p>{en ? "You will confirm the final term on the bank's page." : "საბოლოო ვადას ბანკის გვერდზე დაადასტურებთ."}</p>
              <div className={styles.termOptions}>
                {INSTALLMENT_MONTHS.map((m) => (
                  <button key={m} type="button" onClick={() => setInstallmentMonths(m)} className={installmentMonths === m ? styles.termActive : ""}>{m}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {method === "bankTransfer" && (
        <>
          <div className={styles.emailBox}>
            <label>{en ? "Email address" : "ელ.ფოსტის მისამართი"}</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </>
      )}
      <div className={styles.termsBox}>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        <span>
          {en ? "Please confirm that you have read and agree to the" : "გთხოვთ, დააჭიროთ აქ, რომ გაეცნოთ და დაეთანხმოთ"}{" "}
          <button
            type="button"
            className={styles.termsLink}
            onClick={() => setIsModalOpen(true)}
          >
            {en ? "terms and conditions" : "მომხმარებელთა წესებსა და პოლიტიკას"}
          </button>
        </span>
      </div>
      {method === "bankTransfer" && (
        <p className={styles.invoice}>
          {en ? "The bank-transfer invoice will be sent to the email address you provided." : "გადარიცხვის ინვოისი გამოიგზავნება თქვენ მიერ მითითებულ ელ.ფოსტაზე"}
        </p>
      )}
      {error && <p className={styles.invoice} style={{ color: "rgba(235, 78, 57, 1)" }}>{error}</p>}
      <button
        className={styles.nextBtn}
        onClick={() => onNext?.({ method, bank, email, installmentMonths })}
        disabled={!acceptedTerms || submitting}
      >
        {submitting ? (en ? "Processing..." : "მუშავდება...") : (en ? "Place order" : "შეკვეთის გაფორმება")}
      </button>
      {isModalOpen && (
        <TermsModal
          onAccept={() => setAcceptedTerms(true)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
