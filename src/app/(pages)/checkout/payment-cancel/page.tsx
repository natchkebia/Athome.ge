import { redirect } from "next/navigation";

export default function LegacyPaymentCancelPage() {
  redirect("/payment/cancel");
}
