import { headers } from "next/headers";
import PolicyPage from "@/components/legal/PolicyPage";
import { termsCopy } from "@/lib/policies";

export default async function TermsPage() {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const copy = termsCopy[locale];
  return <PolicyPage {...copy} homeLabel={locale === "en" ? "Home" : "მთავარი გვერდი"} contactLabel={locale === "en" ? "Questions? Contact us" : "გაქვთ შეკითხვა? დაგვიკავშირდით"} />;
}
