import { authorizedRequest } from "./authorized";

export type CustomerAddress = {
  id: number;
  fullName?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  type: "shipping" | "billing" | "both";
  isDefault: boolean;
};

export type CustomerAddressInput = {
  fullName: string;
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  type: "shipping" | "billing" | "both";
  isDefault: boolean;
};

export function getProfileAddresses() {
  return authorizedRequest<CustomerAddress[]>("/api/profile/addresses");
}

export function createProfileAddress(input: CustomerAddressInput) {
  return authorizedRequest<CustomerAddress>("/api/profile/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProfileAddress(id: number, input: CustomerAddressInput) {
  return authorizedRequest<CustomerAddress>(
    `/api/profile/addresses/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(input) },
  );
}
