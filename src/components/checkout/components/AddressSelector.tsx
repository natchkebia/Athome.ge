"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { IoChevronDown } from "react-icons/io5";
import styles from "./AddressSelector.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import { getStoredAuthTokens } from "@/lib/auth/tokens";
import {
  createProfileAddress,
  getProfileAddresses,
  updateProfileAddress,
  type CustomerAddress,
  type CustomerAddressInput,
} from "@/lib/api/addresses";

const MapBox = dynamic(() => import("./MapBox"), { ssr: false });

const cities = ["თბილისი", "ქუთაისი", "ბათუმი", "რუსთავი", "ზუგდიდი", "ფოთი", "გორი"];
const cityCoords: Record<string, { lat: number; lng: number }> = {
  თბილისი: { lat: 41.7151, lng: 44.8271 }, ქუთაისი: { lat: 42.2662, lng: 42.718 },
  ბათუმი: { lat: 41.639, lng: 41.637 }, რუსთავი: { lat: 41.5495, lng: 45.0192 },
  ზუგდიდი: { lat: 42.5088, lng: 41.87 }, ფოთი: { lat: 42.1462, lng: 41.676 },
  გორი: { lat: 41.9816, lng: 44.1122 },
};

export type CheckoutAddress = {
  id?: string | number;
  savedAddressId?: number;
  city: string;
  line1: string;
  line2?: string;
  coords?: { lat: number; lng: number };
};

type AddressSelectorProps = {
  onSelect: (address: CheckoutAddress) => void;
  customerName?: string;
  customerPhone?: string;
};

function toCheckoutAddress(address: CustomerAddress): CheckoutAddress {
  const hasPin = typeof address.latitude === "number" && typeof address.longitude === "number";
  return {
    id: address.id,
    savedAddressId: address.id,
    city: address.city ?? "",
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    coords: hasPin ? { lat: address.latitude as number, lng: address.longitude as number } : undefined,
  };
}

export default function AddressSelector({ onSelect, customerName, customerPhone }: AddressSelectorProps) {
  const en = useStorefrontLocale() === "en";
  const cityLabels: Record<string, string> = { თბილისი: "Tbilisi", ქუთაისი: "Kutaisi", ბათუმი: "Batumi", რუსთავი: "Rustavi", ზუგდიდი: "Zugdidi", ფოთი: "Poti", გორი: "Gori" };
  const [cityOpen, setCityOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<CheckoutAddress | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authenticated = Boolean(getStoredAuthTokens()?.accessToken);

  useEffect(() => {
    if (!authenticated) return;
    getProfileAddresses()
      .then((items) => setAddresses(items.filter((item) => item.type !== "billing").map(toCheckoutAddress)))
      .catch(() => setError(en ? "Saved addresses could not be loaded." : "შენახული მისამართები ვერ ჩაიტვირთა."));
  }, [authenticated, en]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  async function geocode(search: string, city: string) {
    if (!search || !city) return;
    try {
      const query = new URLSearchParams({ format: "json", q: `${search}, ${city}, საქართველო`, countrycodes: "ge", "accept-language": "ka", limit: "1" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`);
      const data = await response.json() as { lat: string; lon: string }[];
      if (data[0]) setCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
    } catch { /* The pin remains optional when geocoding is unavailable. */ }
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const query = new URLSearchParams({ format: "json", lat: String(lat), lon: String(lng), "accept-language": "ka" });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
      const data = await response.json() as { display_name?: string };
      // The map owns line1 only. Entrance/apartment details in line2 must survive pin changes.
      if (data.display_name) setLine1(data.display_name);
    } catch { /* The user can still type line1 manually. */ }
  }

  function openAddModal() {
    // The city center is only the map viewport, never an implicit delivery pin.
    setLine1(""); setLine2(""); setEditingId(null); setCoords(null);
    setError(null); setModalOpen(true);
  }

  function openEditModal(address: CheckoutAddress) {
    setEditingId(address.id ?? null); setSelectedCity(address.city); setLine1(address.line1);
    setLine2(address.line2 ?? ""); setCoords(address.coords ?? null); setError(null); setModalOpen(true);
  }

  function addressInput(): CustomerAddressInput {
    return {
      fullName: customerName || "Athome customer", line1: line1.trim(), line2: line2.trim() || null,
      city: selectedCity, region: null, postalCode: "", country: "GE", phone: customerPhone || null,
      latitude: coords?.lat ?? null, longitude: coords?.lng ?? null, type: "shipping", isDefault: false,
    };
  }

  async function handleSave() {
    if (!selectedCity || !line1.trim()) {
      setError(en ? "Select a city and enter an address." : "აირჩიეთ ქალაქი და შეავსეთ მისამართი.");
      return;
    }
    setSaving(true); setError(null);
    try {
      let entry: CheckoutAddress;
      if (authenticated) {
        const saved = typeof editingId === "number"
          ? await updateProfileAddress(editingId, addressInput())
          : await createProfileAddress(addressInput());
        entry = toCheckoutAddress(saved);
      } else {
        entry = { id: typeof editingId === "string" ? editingId : crypto.randomUUID(), city: selectedCity, line1: line1.trim(), line2: line2.trim(), coords: coords ?? undefined };
      }
      setAddresses((current) => editingId ? current.map((item) => item.id === editingId ? entry : item) : [...current, entry]);
      setSelectedAddress(entry); onSelect(entry); setModalOpen(false); setAddressOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : (en ? "Address could not be saved." : "მისამართი ვერ შეინახა."));
    } finally { setSaving(false); }
  }

  return (
    <div className={styles.container}>
      <div className={styles.dropdown}>
        <label className={styles.label}>{en ? "Address" : "მისამართი"}</label>
        <div className={styles.inputRow} onClick={() => setCityOpen(!cityOpen)}>
          <span>{selectedCity ? (en ? cityLabels[selectedCity] ?? selectedCity : selectedCity) : (en ? "City" : "ქალაქი")}</span><IoChevronDown />
        </div>
        {cityOpen && <div className={styles.dropdownList}>{cities.map((city) => (
          <div key={city} className={styles.option} onClick={() => { setSelectedCity(city); setCoords(null); setCityOpen(false); }}>
            {en ? cityLabels[city] : city}
          </div>
        ))}</div>}
      </div>

      <div className={styles.dropdown}>
        <div className={styles.inputRow} onClick={() => (selectedCity || addresses.length > 0) && setAddressOpen(!addressOpen)}>
          <span>{selectedAddress ? [selectedAddress.line1, selectedAddress.line2].filter(Boolean).join(", ") : (en ? "Address" : "მისამართი")}</span><IoChevronDown />
        </div>
        {addressOpen && <div className={styles.dropdownList}>
          {addresses.filter((address) => !selectedCity || address.city === selectedCity).map((address) => (
            <div key={address.id} className={`${styles.addressRow} ${selectedAddress?.id === address.id ? styles.active : ""}`}>
              <div className={styles.addressText} onClick={() => { setSelectedAddress(address); setSelectedCity(address.city); onSelect(address); setAddressOpen(false); }}>
                {[address.line1, address.line2].filter(Boolean).join(", ")}
              </div>
              <div className={styles.editIcon} onClick={(event) => { event.stopPropagation(); openEditModal(address); }}><img src="/icons/edit.svg" alt="edit" /></div>
            </div>
          ))}
          <div className={styles.addNew} onClick={openAddModal}><img src="/icons/plus.svg" alt="plus" /><span>{en ? "Add address" : "მისამართის დამატება"}</span></div>
        </div>}
      </div>

      {modalOpen && <div className={styles.modalOverlay}><div className={styles.modal}>
        <div className={styles.modalHeader}><h3>{editingId ? (en ? "Edit address" : "მისამართის ჩასწორება") : (en ? "Add a new address" : "ახალი მისამართის დამატება")}</h3><button className={styles.closeBtn} onClick={() => setModalOpen(false)}>×</button></div>
        <input className={styles.input} placeholder={en ? "Street address" : "ქუჩა და მისამართი"} value={line1} onChange={(event) => { setLine1(event.target.value); if (timeoutRef.current) clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(() => geocode(event.target.value, selectedCity), 600); }} />
        <input className={styles.input} placeholder={en ? "Entrance, floor, apartment, door code" : "სადარბაზო, სართული, ბინა, დომოფონის კოდი"} value={line2} onChange={(event) => setLine2(event.target.value)} />
        <p className={styles.mapHint}>{en ? "Place the pin on the building. You can still correct the street address above." : "დასვით პინი შენობაზე. ქუჩის მისამართის შესწორება ზემოთ კვლავ შეგიძლიათ."}</p>
        <div className={styles.mapBox}><MapBox coords={coords ?? cityCoords[selectedCity] ?? cityCoords.თბილისი} onMapClick={(position) => { setCoords(position); reverseGeocode(position.lat, position.lng); }} /></div>
        {error && <p className={styles.formError}>{error}</p>}
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? (en ? "Saving..." : "ინახება...") : (en ? "Save" : "შენახვა")}</button>
      </div></div>}
    </div>
  );
}
