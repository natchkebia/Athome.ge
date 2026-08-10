import { apiRequest } from "./client";

export type Settlement = {
  id: number;
  municipalityId: number;
  nameKa: string;
  nameEn: string;
  type: string;
};

export type PostalCode = {
  id: number;
  settlementId: number;
  code: string;
  streetNameKa?: string | null;
  coverageLevel: string;
};

type PostalCodesResponse = {
  settlementId: number;
  settlementName: string;
  settlementType: string;
  postalCodes: PostalCode[];
};

export function searchSettlements(query: string) {
  return apiRequest<Settlement[]>("/api/open/locations/settlements/search", {
    query: { q: query },
    useProxy: true,
  });
}

export function getSettlementPostalCodes(settlementId: number) {
  return apiRequest<PostalCodesResponse>("/api/open/locations/postal-codes", {
    query: { settlementId },
    useProxy: true,
  });
}
