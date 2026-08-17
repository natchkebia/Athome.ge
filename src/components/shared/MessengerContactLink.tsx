import styles from "./MessengerContactLink.module.scss";
import {
  buildMessengerUrl,
  type MessengerContext,
} from "@/lib/messenger";

type Props = {
  context?: MessengerContext;
  locale?: "ka" | "en";
  className?: string;
  showHours?: boolean;
};

export default function MessengerContactLink({
  context,
  locale = "ka",
  className = "",
  showHours = true,
}: Props) {
  const en = locale === "en";

  return (
    <div className={`${styles.contact} ${className}`.trim()}>
      <a
        className={styles.link}
        href={buildMessengerUrl(context)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/icons/messenger.svg" alt="" aria-hidden="true" />
        <span>{en ? "Message us on Messenger" : "დაგვიკავშირდით Messenger-ით"}</span>
      </a>
      {showHours && (
        <span className={styles.hours}>
          {en
            ? "We reply Monday–Saturday, 11:00–20:00"
            : "ვპასუხობთ ორშაბათი–შაბათი, 11:00–20:00"}
        </span>
      )}
    </div>
  );
}
