const DEFAULT_WHATSAPP_NUMBER = "995599093209";

function whatsappNumber() {
  const configuredNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    DEFAULT_WHATSAPP_NUMBER;

  return configuredNumber.replace(/\D/g, "");
}

export function buildWhatsAppUrl(message?: string) {
  const url = new URL(`https://wa.me/${whatsappNumber()}`);
  const text = message?.trim();

  if (text) {
    url.searchParams.set("text", text);
  }

  return url.toString();
}
