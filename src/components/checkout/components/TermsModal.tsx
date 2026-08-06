"use client";

import styles from "../Step4Payment.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { termsCopy } from "@/lib/policies";

interface TermsModalProps {
  onClose: () => void;
  onAccept: () => void;
}

export default function TermsModal({ onClose, onAccept }: TermsModalProps) {
  const locale = useStorefrontLocale();
  const copy = termsCopy[locale];

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="checkout-terms-title">
      <div className={styles.modal}>
        <div className={styles.modalScroll}>
          <div className={styles.modalContent}>
            <h4 id="checkout-terms-title">{copy.title}</h4>
            <p>{copy.intro}</p>

            {copy.sections.map((section, index) => (
              <section key={section.title}>
                <h5>{index + 1}. {section.title}</h5>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </section>
            ))}

            <p>
              <a href="mailto:info@athome.ge">info@athome.ge</a>
              {" · "}
              <a href="tel:+995599093209">+995 599 09 32 09</a>
            </p>
          </div>
        </div>
        <button
          className={styles.modalConfirm}
          onClick={() => { onAccept(); onClose(); }}
        >
          {locale === "en" ? "I have read and agree" : "გავეცანი და ვეთანხმები"}
        </button>
      </div>
    </div>
  );
}
