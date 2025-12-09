"use client";
import React, { useState } from "react";
import styles from "./Step4Payment.module.scss";
import TermsModal from "./components/TermsModal";

interface Props {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Step4Payment({ onNext, onPrev }: Props) {
  const [method, setMethod] = useState<"card" | "invoice" | "installment">(
    "card"
  );
  const [bank, setBank] = useState<string>("tbc");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

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
        <h2 className={styles.title}>გადახდის მეთოდი</h2>
      </div>
      <div className={styles.methods}>
        <div
          className={`${styles.methodCard} ${
            method === "card" && styles.active
          }`}
          onClick={() => {
            setMethod("card");
            setBank("tbc");
          }}
        >
          <img src="/icons/card.svg" alt="card" />
          <p>ბარათით გადახდა</p>
          {method === "card" && (
            <div className={styles.checkCircle}>
              <div className={styles.checkdiv} />
            </div>
          )}
        </div>
        <div
          className={`${styles.methodCard} ${
            method === "invoice" && styles.active
          }`}
          onClick={() => {
            setMethod("invoice");
            setBank("credo");
          }}
        >
          <img src="/icons/Installment.svg" alt="invoice" />
          <p>განვადება</p>
          {method === "invoice" && (
            <div className={styles.checkCircle}>
              <div className={styles.checkdiv} />
            </div>
          )}
        </div>

        <div
          className={`${styles.methodCard} ${
            method === "installment" && styles.active
          }`}
          onClick={() => {
            setMethod("installment");
            setBank("");
          }}
        >
          <img src="/icons/Payment.svg" alt="Payment" />
          <p>გადარიცხვა</p>
          {method === "installment" && (
            <div className={styles.checkCircle}>
              <div className={styles.checkdiv} />
            </div>
          )}
        </div>
      </div>
      {method === "card" && (
        <div className={styles.bankList}>
          <div
            className={`${styles.bank} ${bank === "tbc" && styles.bankActive}`}
            onClick={() => setBank("tbc")}
          >
            <div className={styles.bankWrapper}>
              <div className={styles.radio}>{bank === "tbc" && <div />}</div>
              <img src="/icons/tbc.svg" className={styles.bankIcon} />
            </div>
            <div className={styles.cards}>
              <img src="/icons/Group.svg" />
            </div>
          </div>
          <div
            className={`${styles.bank} ${bank === "boa" && styles.bankActive}`}
            onClick={() => setBank("boa")}
          >
            <div className={styles.bankWrapper}>
              <div className={styles.radio}>{bank === "boa" && <div />}</div>
              <img
                src="/icons/Bank_of_Georgia.svg"
                className={styles.bankIcon1}
              />
            </div>
            <div className={styles.cards}>
              <img src="/icons/Group.svg" />
            </div>
          </div>
        </div>
      )}
      {method === "invoice" && (
        <div className={styles.bankList}>
          <div
            className={`${styles.bank} ${bank === "tbc" && styles.bankActive}`}
            onClick={() => setBank("tbc")}
          >
            <div className={styles.bankWrapper}>
              <div className={styles.radio}>{bank === "tbc" && <div />}</div>
              <img src="/icons/tbc.svg" className={styles.bankIcon} />
            </div>
            <div className={styles.cards}>
              <img src="/icons/Group.svg" />
            </div>
          </div>
          <div
            className={`${styles.bank} ${bank === "boa" && styles.bankActive}`}
            onClick={() => setBank("boa")}
          >
            <div className={styles.bankWrapper}>
              <div className={styles.radio}>{bank === "boa" && <div />}</div>
              <img
                src="/icons/Bank_of_Georgia.svg"
                className={styles.bankIcon1}
              />
            </div>
            <div className={styles.cards}>
              <img src="/icons/Group.svg" />
            </div>
          </div>

          <div
            className={`${styles.bank} ${
              bank === "credo" && styles.bankActive
            }`}
            onClick={() => setBank("credo")}
          >
            <div className={styles.bankWrapper}>
              <div className={styles.radio}>{bank === "credo" && <div />}</div>
              <img src="/icons/Kredo.svg" className={styles.bankIcon} />
            </div>
            <div className={styles.cards}>
              <img src="/icons/Group.svg" />
            </div>
          </div>
        </div>
      )}
      {method === "installment" && (
        <>
          <div className={styles.emailBox}>
            <label>ელ.ფოსტის მისამართი</label>
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
          გთხოვთ, დააჭიროთ აქ, რომ გაეცნოთ და დაეთანხმოთ
          <button
            type="button"
            className={styles.termsLink}
            onClick={() => setIsModalOpen(true)}
          >
            მომხმარებელთა წესებსა და პოლიტიკას
          </button>
        </span>
      </div>
      {method === "installment" && (
        <p className={styles.invoice}>
          გადარიცხვის ინვოისი გამოიგზავნება თქვენ მიერ მითითებულ ელ.ფოსტაზე
        </p>
      )}
      <button
        className={styles.nextBtn}
        onClick={() => onNext?.()}
        disabled={!acceptedTerms}
      >
        გაგრძელება
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
