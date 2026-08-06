import { headers } from "next/headers";
import PolicyPage from "@/components/legal/PolicyPage";
import { privacyCopy } from "@/lib/policies";

export default async function PrivacyPage() {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const copy = privacyCopy[locale];
  return <PolicyPage {...copy} homeLabel={locale === "en" ? "Home" : "მთავარი გვერდი"} contactLabel={locale === "en" ? "Data request" : "მონაცემებთან დაკავშირებული მოთხოვნა"} />;
}
