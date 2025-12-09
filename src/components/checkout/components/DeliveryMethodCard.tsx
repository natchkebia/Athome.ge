import React from "react";
import styles from "./DeliveryMethodCard.module.scss";

interface Props {
  icon: React.ReactNode;
  title: string;
  description?: string;
  expandedContent?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export default function DeliveryMethodCard({
  icon,
  title,
  description,
  expandedContent,
  selected,
  onSelect,
}: Props) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.active : ""}`}
      onClick={onSelect}
    >
      <div className={styles.header}>
        <label className={styles.radioWrapper}>
          <input type="radio" checked={selected} readOnly />
          <span className={styles.customRadio} />
        </label>

        <div className={styles.icon}>{icon}</div>

        <div className={styles.texts}>
          <div className={styles.title}>{title}</div>
        </div>
      </div>

      {selected && expandedContent && (
        <div className={styles.expandedWrapper}>
          {description && <div className={styles.desc}>{description}</div>}
          <div className={styles.expanded}>{expandedContent}</div>
        </div>
      )}
    </div>
  );
}
