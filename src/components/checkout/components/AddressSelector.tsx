"use client";

import React, { useState, useRef } from "react";
import styles from "./AddressSelector.module.scss";
import { IoChevronDown } from "react-icons/io5";
import dynamic from "next/dynamic";

const MapBox = dynamic(() => import("./MapBox"), { ssr: false });

const cities = [
  "თბილისი",
  "ქუთაისი",
  "ბათუმი",
  "რუსთავი",
  "ზუგდიდი",
  "ფოთი",
  "გორი",
];

const cityCoords: Record<string, { lat: number; lng: number }> = {
  თბილისი: { lat: 41.7151, lng: 44.8271 },
  ქუთაისი: { lat: 42.2662, lng: 42.718 },
  ბათუმი: { lat: 41.639, lng: 41.637 },
  რუსთავი: { lat: 41.5495, lng: 45.0192 },
  ზუგდიდი: { lat: 42.5088, lng: 41.87 },
  ფოთი: { lat: 42.1462, lng: 41.676 },
  გორი: { lat: 41.9816, lng: 44.1122 },
};

export default function AddressSelector({ onSelect }: any) {
  const [cityOpen, setCityOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [addressName, setAddressName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [coords, setCoords] = useState({ lat: 41.7151, lng: 44.8271 });

  const timeoutRef = useRef<any>(null);

  async function geocode(search: string, city: string) {
    if (!search || !city) return;
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${search} ${city}`
      );
      const data = await resp.json();
      if (data.length > 0) {
        setCoords({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      }
    } catch {}
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await resp.json();
      if (data.address?.road) setAddressName(data.address.road);
      if (data.address?.house_number) setFullAddress(data.address.house_number);
    } catch {}
  }

  function openAddModal() {
    setAddressName("");
    setFullAddress("");
    setEditingId(null);
    setModalOpen(true);
  }

  function openEditModal(addr: any) {
    setEditingId(addr.id);
    setAddressName(addr.street);
    setFullAddress(addr.house);
    setCoords(addr.coords);
    setModalOpen(true);
  }

  function handleSave() {
    if (!selectedCity || !addressName) {
      setModalOpen(false);
      return;
    }

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, street: addressName, house: fullAddress, coords }
            : a
        )
      );

      const updated = {
        id: editingId,
        city: selectedCity,
        street: addressName,
        house: fullAddress,
        coords,
      };

      setSelectedAddress(updated);
      onSelect(updated);
      setModalOpen(false);
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      city: selectedCity,
      street: addressName,
      house: fullAddress,
      coords,
    };

    setAddresses((prev) => [...prev, entry]);
    setSelectedAddress(entry);
    onSelect(entry);
    setModalOpen(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.dropdown}>
        <label className={styles.label}>მისამართი</label>
        <div className={styles.inputRow} onClick={() => setCityOpen(!cityOpen)}>
          <span>{selectedCity || "ქალაქი"}</span>
          <IoChevronDown />
        </div>

        {cityOpen && (
          <div className={styles.dropdownList}>
            {cities.map((city) => (
              <div
                key={city}
                className={styles.option}
                onClick={() => {
                  setSelectedCity(city);
                  setCoords(cityCoords[city]);
                  setCityOpen(false);
                }}
              >
                {city}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.dropdown}>
        <div
          className={styles.inputRow}
          onClick={() => selectedCity && setAddressOpen(!addressOpen)}
        >
          <span>
            {selectedAddress
              ? `${selectedAddress.street} ${selectedAddress.house}`
              : "მისამართი"}
          </span>
          <IoChevronDown />
        </div>

        {addressOpen && (
          <div className={styles.dropdownList}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`${styles.addressRow} ${
                  selectedAddress?.id === addr.id ? styles.active : ""
                }`}
              >
                <div
                  className={styles.addressText}
                  onClick={() => {
                    setSelectedAddress(addr);
                    onSelect(addr);
                    setAddressOpen(false);
                  }}
                >
                  {addr.street} {addr.house}
                </div>
                <div
                  className={styles.editIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(addr);
                  }}
                >
                  <img src="/icons/edit.svg" alt="edit" />
                </div>
              </div>
            ))}

            <div className={styles.addNew} onClick={openAddModal}>
              <img src="/icons/plus.svg" alt="plus" />
              <span>მისამართი</span>
            </div>
          </div>
        )}
      </div>
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {editingId
                  ? "მისამართის ჩასწორება"
                  : "ახალი მისამართის დამატება"}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
              >
                X
              </button>
            </div>

            <input
              className={styles.input}
              placeholder="ქუჩა, გამზირი..."
              value={addressName}
              onChange={(e) => {
                setAddressName(e.target.value);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(
                  () =>
                    geocode(`${e.target.value} ${fullAddress}`, selectedCity),
                  600
                );
              }}
            />

            <input
              className={styles.input}
              placeholder="ნომერი, ბინა, სართული..."
              value={fullAddress}
              onChange={(e) => {
                setFullAddress(e.target.value);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(
                  () =>
                    geocode(`${addressName} ${e.target.value}`, selectedCity),
                  600
                );
              }}
            />

            <div className={styles.mapBox}>
              <MapBox
                coords={coords}
                onMapClick={(pos) => {
                  setCoords(pos);
                  reverseGeocode(pos.lat, pos.lng);
                }}
              />
            </div>

            <button className={styles.saveBtn} onClick={handleSave}>
              შენახვა
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
