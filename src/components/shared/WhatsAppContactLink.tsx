import { FaWhatsapp } from "react-icons/fa6";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import styles from "./WhatsAppContactLink.module.scss";

type Props = {
  locale?: "ka" | "en";
};

export default function WhatsAppContactLink({ locale = "ka" }: Props) {
  const label =
    locale === "en" ? "Message us on WhatsApp" : "დაგვიკავშირდით WhatsApp-ით";

  return (
    <a
      className={styles.link}
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <FaWhatsapp aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
