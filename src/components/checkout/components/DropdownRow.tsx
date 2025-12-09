// components/DropdownRow.tsx
import React from "react";
import styles from "./DropdownRow.module.scss";
import { IoChevronDown } from "react-icons/io5";

interface Props {
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
}

export default function DropdownRow({ label, value, placeholder, onClick }: Props) {
  return (
    <div className={styles.wrapper} onClick={onClick}>
      <div className={styles.label}>{label}</div>

      <div className={styles.row}>
        <span className={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </span>
        <IoChevronDown size={20} />
      </div>
    </div>
  );
}
