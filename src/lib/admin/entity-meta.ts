export type AdminEntityType = "product" | "category" | "brand" | "order";

/** Exposes the public admin entity represented by a storefront page. */
export function entityMeta(
  type: AdminEntityType,
  id: number | string | null | undefined
): Record<string, string> {
  if (id === null || id === undefined) return {};
  const normalized = String(id).trim();
  if (!/^\d+$/.test(normalized)) return {};
  return { "athome:entity": `${type}:${normalized}` };
}
