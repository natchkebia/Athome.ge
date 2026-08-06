import { headers } from "next/headers";
import PolicyPage from "@/components/legal/PolicyPage";
import { returnCopy } from "@/lib/policies";

export default async function ReturnPolicyPage() {
  const locale = (await headers()).get("x-lang") === "en" ? "en" : "ka";
  const copy = returnCopy[locale];
  return <PolicyPage {...copy} homeLabel={locale === "en" ? "Home" : "მთავარი გვერდი"} contactLabel={locale === "en" ? "Start a return" : "დაბრუნების მოთხოვნა"} />;
}
