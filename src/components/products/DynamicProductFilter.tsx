"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { StorefrontCategoryFilterSet } from "@/lib/api/storefront";
import styles from "./ProductFilter.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export type DynamicFilterValues = {
  price: [number, number];
  brandSlugs: string[];
  inStockOnly: boolean;
  attributes: Record<string, string[]>;
  ranges: Record<string, number[]>;
};

type Props = {
  schema: StorefrontCategoryFilterSet;
  values: DynamicFilterValues;
  priceBounds: [number, number];
  onChange: (values: DynamicFilterValues) => void;
};

export default function DynamicProductFilter({
  schema,
  values,
  priceBounds,
  onChange,
}: Props) {
  const en = useStorefrontLocale() === "en";
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const [minInput, setMinInput] = useState(String(values.price[0]));
  const [maxInput, setMaxInput] = useState(String(values.price[1]));
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    setMinInput(String(values.price[0]));
    setMaxInput(String(values.price[1]));
    const span = Math.max(1, priceBounds[1] - priceBounds[0]);
    trackRef.current?.style.setProperty(
      "--min",
      `${((values.price[0] - priceBounds[0]) / span) * 100}%`
    );
    trackRef.current?.style.setProperty(
      "--max",
      `${((values.price[1] - priceBounds[0]) / span) * 100}%`
    );
  }, [values.price, priceBounds]);

  const updatePrice = (next: [number, number]) =>
    onChange({ ...values, price: next });

  const toggleOption = (fieldKey: string, option: string) => {
    const current = values.attributes[fieldKey] ?? [];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    onChange({
      ...values,
      attributes: { ...values.attributes, [fieldKey]: next },
    });
  };

  const toggleRangeValue = (fieldKey: string, value: number) => {
    const current = values.ranges[fieldKey] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value].sort((a, b) => a - b);
    onChange({
      ...values,
      ranges: { ...values.ranges, [fieldKey]: next },
    });
  };

  const reset = () =>
    onChange({ price: priceBounds, brandSlugs: [], inStockOnly: false, attributes: {}, ranges: {} });

  const sortedFilters = [...schema.filters].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const brands = schema.brands ?? [];
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 8);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h4 className={styles.title}>{en ? "Filter" : "ფილტრი"}</h4>
        <button className={styles.resetBtn} onClick={reset}>
          <img src="/icons/ArrowClockwise.svg" alt="" />
          {en ? "Reset" : "გასუფთავება"}
        </button>
      </div>

      <div className={styles.filterBox}>
        <label className={styles.brandItem}>
          <input
            type="checkbox"
            checked={values.inStockOnly}
            onChange={() =>
              onChange({ ...values, inStockOnly: !values.inStockOnly })
            }
          />
          <span>{en ? "In stock only" : "მხოლოდ მარაგში არსებული"}</span>
        </label>
        <div className={styles.section}>
          <label className={styles.label}>ფასი</label>
          <div className={styles.rangeWrapper}>
            <div ref={trackRef} className={styles.rangeTrack} />
            <input
              type="range"
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={values.price[0]}
              onChange={(event) => {
                const min = Number(event.target.value);
                if (min <= values.price[1]) updatePrice([min, values.price[1]]);
              }}
            />
            <input
              type="range"
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={values.price[1]}
              onChange={(event) => {
                const max = Number(event.target.value);
                if (max >= values.price[0]) updatePrice([values.price[0], max]);
              }}
            />
          </div>
          <div className={styles.priceInputs}>
            <input
              value={minInput}
              inputMode="numeric"
              onChange={(event) => {
                setMinInput(event.target.value);
                const min = Number(event.target.value);
                if (event.target.value && min <= values.price[1]) {
                  updatePrice([min, values.price[1]]);
                }
              }}
            />
            <input
              value={maxInput}
              inputMode="numeric"
              onChange={(event) => {
                setMaxInput(event.target.value);
                const max = Number(event.target.value);
                if (event.target.value && max >= values.price[0]) {
                  updatePrice([values.price[0], max]);
                }
              }}
            />
          </div>
        </div>

        <div className={styles.dropdownWraper}>
          {brands.length > 0 && (
            <div>
              <button
                className={`${styles.dropdownHeader} ${open.brand ? styles.open : ""}`}
                onClick={() => setOpen((current) => ({ ...current, brand: !current.brand }))}
              >
                <span>{en ? "Brand" : "ბრენდი"}</span>
                {open.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {open.brand && (
                <div className={styles.brandList}>
                  {visibleBrands.map((brand) => (
                    <label key={brand.brandId} className={styles.brandItem}>
                      <input
                        type="checkbox"
                        checked={values.brandSlugs.includes(brand.slug)}
                        onChange={() => {
                          const selected = values.brandSlugs.includes(brand.slug);
                          onChange({
                            ...values,
                            brandSlugs: selected
                              ? values.brandSlugs.filter((slug) => slug !== brand.slug)
                              : [...values.brandSlugs, brand.slug],
                          });
                        }}
                      />
                      <span>{brand.name}</span>
                      <span className={styles.optionCount}>{brand.productCount}</span>
                    </label>
                  ))}
                  {brands.length > 8 && (
                    <button className={styles.showMoreOptions} onClick={() => setShowAllBrands((current) => !current)}>
                      {showAllBrands
                        ? (en ? "Show less" : "ნაკლების ჩვენება")
                        : (en ? "Show more" : "მეტის ჩვენება")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {sortedFilters.map((filter, index) => {
            const isOpen = !!open[filter.fieldKey];
            return (
              <div key={filter.fieldId}>
                <button
                  className={`${styles.dropdownHeader} ${
                    index === sortedFilters.length - 1 ? styles.last : ""
                  } ${isOpen ? styles.open : ""}`}
                  onClick={() =>
                    setOpen((current) => ({
                      ...current,
                      [filter.fieldKey]: !current[filter.fieldKey],
                    }))
                  }
                >
                  <span>
                    {filter.displayName}
                    {filter.unit ? ` (${filter.unit})` : ""}
                  </span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isOpen && filter.widgetType === "range" && filter.range && (
                  <div className={styles.brandList}>
                    {Array.from(
                      {
                        length:
                          Math.floor(
                            (filter.range.absoluteMax -
                              filter.range.absoluteMin) /
                              (filter.range.step || 1)
                          ) + 1,
                      },
                      (_, optionIndex) => {
                        const step = filter.range!.step || 1;
                        const precision = String(step).split(".")[1]?.length ?? 0;
                        return Number(
                          (
                            filter.range!.absoluteMin +
                            optionIndex * step
                          ).toFixed(precision)
                        );
                      }
                    ).map((rangeValue) => (
                      <label
                        key={`${filter.fieldKey}:${rangeValue}`}
                        className={styles.brandItem}
                      >
                        <input
                          type="checkbox"
                          checked={(values.ranges[filter.fieldKey] ?? []).includes(
                            rangeValue
                          )}
                          onChange={() =>
                            toggleRangeValue(filter.fieldKey, rangeValue)
                          }
                        />
                        <span>
                          {rangeValue}
                          {filter.unit ?? filter.range?.unit
                            ? ` ${filter.unit ?? filter.range?.unit}`
                            : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {isOpen && filter.widgetType !== "range" && (
                  <div className={styles.brandList}>
                    {(filter.options ?? []).map((option, optionIndex) => {
                      const selected = (values.attributes[filter.fieldKey] ?? []).includes(option.value);
                      return (
                        <label
                          key={`${filter.fieldKey}:${option.optionId}:${option.value}:${optionIndex}`}
                          className={styles.brandItem}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={option.productCount === 0 && !selected}
                            onChange={() =>
                              toggleOption(filter.fieldKey, option.value)
                            }
                          />
                          <span>{option.label}</span>
                          <span className={styles.optionCount}>
                            {option.productCount}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
