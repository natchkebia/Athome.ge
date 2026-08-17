export type MessengerContext =
  | { type: "product"; value: string }
  | { type: "order"; value: string };

const DEFAULT_PAGE_USERNAME = "athomege";

function pageUsername() {
  return (
    process.env.NEXT_PUBLIC_MESSENGER_PAGE_USERNAME?.trim() ||
    DEFAULT_PAGE_USERNAME
  ).replace(/^@/, "");
}

function validReferenceValue(value: string) {
  // Backend's referral contract allows a single separator underscore only.
  return value.trim().length > 0 && !value.includes("_");
}

export function buildMessengerUrl(context?: MessengerContext) {
  const url = new URL(`https://m.me/${pageUsername()}`);

  if (context && validReferenceValue(context.value)) {
    url.searchParams.set("ref", `${context.type}_${context.value.trim()}`);
  }

  return url.toString();
}
