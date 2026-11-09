"use client";

import { useEffect, useState, type FormEvent } from "react";
import { resendEmailVerification, verifyEmailCode } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import styles from "./emailVerification.module.scss";

export default function EmailVerification({ initialEmail, initialCodeSent = false, en, onVerified, onBack, onRegister }: {
  initialEmail: string;
  initialCodeSent?: boolean;
  en: boolean;
  onVerified: () => void;
  onBack: () => void;
  onRegister: (email: string) => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  // Only a successful code request (or completed registration) opens the code step.
  const [codeSent, setCodeSent] = useState(initialCodeSent && !!initialEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [sendWait, setSendWait] = useState(initialCodeSent ? 60 : 0);
  const [verifyWait, setVerifyWait] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (sendWait <= 0 && verifyWait <= 0) return;
    const timer = window.setTimeout(() => {
      setSendWait(value => Math.max(0, value - 1));
      setVerifyWait(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [sendWait, verifyWait]);

  function handleError(error: unknown) {
    setFeedback(error instanceof Error ? error.message : (en ? "Please try again." : "გაიმეორეთ მოთხოვნა."));
    if (error instanceof ApiError && error.status === 429) {
      setSendWait(error.retryAfter ?? 60);
      setVerifyWait(error.retryAfter ?? 60);
    }
  }

  async function sendCode() {
    if (busy || sendWait > 0 || !email.trim()) return;
    setBusy("send");
    setFeedback("");
    try {
      await resendEmailVerification(email.trim());
      setEmail(email.trim());
      setCodeSent(true);
      setCode("");
      setSendWait(60);
      setFeedback(en ? "Request accepted. Check your email, including spam, for the code." : "მოთხოვნა მიღებულია. შეამოწმეთ ელფოსტა და სპამის საქაღალდე.");
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codeSent) {
      await sendCode();
      return;
    }
    if (busy || verifyWait > 0 || !code.trim()) return;
    setBusy("verify");
    setFeedback("");
    try {
      await verifyEmailCode({ email: email.trim(), otpCode: code.trim() });
      onVerified();
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(null);
    }
  }

  return <section className={styles.panel}>
    <h3>{en ? "Confirm your email" : "დაადასტურეთ ელფოსტა"}</h3>
    <p>{codeSent
      ? (en ? "Enter the code from your email. After confirmation, sign in again." : "შეიყვანეთ ელფოსტით მიღებული კოდი. დადასტურების შემდეგ გაიარეთ ავტორიზაცია.")
      : (en ? "Already registered? Request a code for your unverified account. If you have no account, register first." : "უკვე დარეგისტრირებული ხართ? მოითხოვეთ კოდი დაუდასტურებელი ანგარიშისთვის. თუ ანგარიში ჯერ არ გაქვთ, გაიარეთ რეგისტრაცია.")}</p>
    <form onSubmit={submit}>
      <label>{en ? "Email" : "ელფოსტა"}<input type="email" name="verificationEmail" autoComplete="email" required readOnly={codeSent} value={email} onChange={e => setEmail(e.target.value)} /></label>
      {codeSent && <label>{en ? "Confirmation code" : "დადასტურების კოდი"}<input name="verificationCode" autoComplete="one-time-code" required value={code} onChange={e => setCode(e.target.value)} /></label>}
      {feedback && <p role="status">{feedback}</p>}
      {codeSent ? <>
        <button type="submit" disabled={!!busy || verifyWait > 0 || !code.trim()}>{busy === "verify" ? (en ? "Confirming…" : "მოწმდება…") : (en ? "Confirm email" : "ელფოსტის დადასტურება")}{verifyWait > 0 ? ` (${verifyWait})` : ""}</button>
        <button type="button" disabled={!!busy || sendWait > 0} onClick={() => void sendCode()}>{busy === "send" ? (en ? "Sending…" : "იგზავნება…") : (en ? "Send again" : "კოდის ხელახლა გაგზავნა")}{sendWait > 0 ? ` (${sendWait})` : ""}</button>
        <button type="button" disabled={!!busy} onClick={() => { setCodeSent(false); setCode(""); setFeedback(""); }}>{en ? "Change email" : "ელფოსტის შეცვლა"}</button>
      </> : <button type="submit" disabled={!!busy || sendWait > 0 || !email.trim()}>{busy === "send" ? (en ? "Sending…" : "იგზავნება…") : (en ? "Send confirmation code" : "დადასტურების კოდის გაგზავნა")}{sendWait > 0 ? ` (${sendWait})` : ""}</button>}
      {!codeSent && <button type="button" disabled={!!busy} onClick={() => onRegister(email.trim())}>{en ? "Create an account" : "ანგარიშის შექმნა — რეგისტრაცია"}</button>}
      <button type="button" disabled={!!busy} onClick={onBack}>{en ? "Back to sign in" : "ავტორიზაციაზე დაბრუნება"}</button>
    </form>
  </section>;
}
