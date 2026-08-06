"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ProductFilter.module.scss";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

interface ProductFilterProps {
  filters: {
    price: [number, number];
    brands: string[];
    condition: string[];
    processor: string[];
    ram: string[];
    gpu: string[];
    color: string[];
    screen: string[];
  };
  onChange: (values: Partial<ProductFilterProps["filters"]>) => void;
}

export default function ProductFilter({
  filters,
  onChange,
}: ProductFilterProps) {
  const en = useStorefrontLocale() === "en";
  const allBrands = ["Asus", "Dell", "Lenovo", "Gigabyte", "Alienware"];
  const allCondition = ["New", "Second-hand"];
  const allProcessorTypes = ["Intel", "AMD", "Apple", "Silicon"];
  const allRAM = ["8GB", "16GB", "32GB", "64GB"];
  const allVideoCard = ["NVIDIA", "AMD", "Intel"];
  const allColor = ["White", "Black", "Gray"];
  const allScreenSize = ["11", "14", "16"];
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );

  const toggleDropdown = (key: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key], 
    }));
  };

  const trackRef = useRef<HTMLDivElement>(null);

  const [minInput, setMinInput] = useState(filters.price[0].toString());
  const [maxInput, setMaxInput] = useState(filters.price[1].toString());

  useEffect(() => {
    if (filters.price[0].toString() !== minInput)
      setMinInput(filters.price[0].toString());
    if (filters.price[1].toString() !== maxInput)
      setMaxInput(filters.price[1].toString());
  }, [filters.price]);

  useEffect(() => {
    const [min, max] = filters.price;
    const percentMin = ((min - 0) / (8500 - 0)) * 100;
    const percentMax = ((max - 0) / (8500 - 0)) * 100;
    if (trackRef.current) {
      trackRef.current.style.setProperty("--min", `${percentMin}%`);
      trackRef.current.style.setProperty("--max", `${percentMax}%`);
    }
  }, [filters.price]);

  const toggleItem = (key: keyof typeof filters, value: string) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ [key]: updated });
  };

  const handleReset = () => {
    onChange({
      price: [0, 8500],
      brands: [],
      condition: [],
      processor: [],
      ram: [],
      gpu: [],
      color: [],
      screen: [],
    });
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?!$)/, "");
    setMinInput(raw);
    if (raw === "") return;
    const value = Number(raw);
    if (!isNaN(value)) {
      const newMin = Math.max(0, value);
      if (newMin <= filters.price[1]) {
        onChange({ price: [newMin, filters.price[1]] });
      }
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/^0+(?!$)/, "");
    setMaxInput(raw);
    if (raw === "") return;
    const value = Number(raw);
    if (!isNaN(value)) {
      const newMax = Math.max(0, value);
      if (newMax >= filters.price[0]) {
        onChange({ price: [filters.price[0], newMax] });
      }
    }
  };

  const renderDropdown = (
    label: string,
    key: keyof typeof filters,
    items: string[],
    isLast: boolean = false
  ) => {
    const isOpen = !!openDropdowns[key]; 

    return (
      <>
        <button
          className={`${styles.dropdownHeader} ${isLast ? styles.last : ""} ${
            isOpen ? styles.open : ""
          }`}
          onClick={() => toggleDropdown(String(key))}
        >
          <span>{label}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div
            className={`${styles.brandList} ${
              isLast ? styles.noBorderBottom : ""
            }`}
          >
            {items.map((item) => (
              <label key={item} className={styles.brandItem}>
                <input
                  type="checkbox"
                  checked={(filters[key] as string[]).includes(item)}
                  onChange={() => toggleItem(key, item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h4 className={styles.title}>{en ? "Filter" : "ფილტრი"}</h4>
        <button className={styles.resetBtn} onClick={handleReset}>
          <img src="/icons/ArrowClockwise.svg" alt="reset" />
          {en ? "Reset" : "გასუფთავება"}
        </button>
      </div>

      <div className={styles.filterBox}>
        <div className={styles.section}>
          <label className={styles.label}>{en ? "Price" : "ფასი"}</label>

          <div className={styles.rangeWrapper}>
            <div ref={trackRef} className={styles.rangeTrack}></div>

            <input
              type="range"
              min="0"
              max="8500"
              value={filters.price[0]}
              onChange={(e) => {
                const newMin = Number(e.target.value);
                if (newMin <= filters.price[1]) {
                  onChange({ price: [newMin, filters.price[1]] });
                }
              }}
            />
            <input
              type="range"
              min="0"
              max="8500"
              value={filters.price[1]}
              onChange={(e) => {
                const newMax = Number(e.target.value);
                if (newMax >= filters.price[0]) {
                  onChange({ price: [filters.price[0], newMax] });
                }
              }}
            />
          </div>

          <div className={styles.priceInputs}>
            <input
              type="text"
              value={minInput}
              onChange={handleMinChange}
              placeholder={en ? "Min" : "მინ"}
              inputMode="numeric"
            />
            <input
              type="text"
              value={maxInput}
              onChange={handleMaxChange}
              placeholder={en ? "Max" : "მაქს"}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className={styles.dropdownWraper}>
          {renderDropdown(en ? "Brand" : "ბრენდი", "brands", allBrands)}
          {renderDropdown(en ? "Condition" : "მდგომარეობა", "condition", allCondition)}
          {renderDropdown(en ? "Processor type" : "პროცესორის ტიპი", "processor", allProcessorTypes)}
          {renderDropdown(en ? "Memory" : "ოპერატიული მეხსიერება", "ram", allRAM)}
          {renderDropdown(en ? "Graphics card" : "ვიდეო ბარათი", "gpu", allVideoCard)}
          {renderDropdown(en ? "Color" : "ფერი", "color", allColor)}
          {renderDropdown(en ? "Screen size" : "ეკრანის ზომა", "screen", allScreenSize, true)}
        </div>
      </div>
    </div>
  );
}
