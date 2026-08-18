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
  variant?: "inline" | "floating";
};

export default function MessengerContactLink({
  context,
  locale = "ka",
  className = "",
  showHours = true,
  variant = "inline",
}: Props) {
  const en = locale === "en";
  const floating = variant === "floating";

  return (
    <div
      className={`${styles.contact} ${floating ? styles.floating : ""} ${className}`.trim()}
    >
      <a
        className={styles.link}
        href={buildMessengerUrl(context)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={en ? "Message us on Messenger" : "დაგვიკავშირდით Messenger-ით"}
        title={en ? "Message us on Messenger" : "დაგვიკავშირდით Messenger-ით"}
      >
        <img
          src={floating ? "/icons/messenger-floating.svg" : "/icons/messenger.svg"}
          alt=""
          aria-hidden="true"
        />
        <span>{en ? "Message us on Messenger" : "დაგვიკავშირდით Messenger-ით"}</span>
      </a>
      {showHours && !floating && (
        <span className={styles.hours}>
          {en
            ? "We reply Monday–Saturday, 11:00–20:00"
            : "ვპასუხობთ ორშაბათი–შაბათი, 11:00–20:00"}
        </span>
      )}
    </div>
  );
}
