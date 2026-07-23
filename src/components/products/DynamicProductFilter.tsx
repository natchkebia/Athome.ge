"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";
import { StorefrontCategoryFilterSet } from "@/lib/api/storefront";
import styles from "./ProductFilter.module.scss";

export type DynamicFilterValues = {
  price: [number, number];
  attributes: Record<string, string[]>;
  ranges: Record<string, [number, number]>;
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
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const [minInput, setMinInput] = useState(String(values.price[0]));
  const [maxInput, setMaxInput] = useState(String(values.price[1]));

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

  const reset = () =>
    onChange({ price: priceBounds, attributes: {}, ranges: {} });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h4 className={styles.title}>ფილტრი</h4>
        <button className={styles.resetBtn} onClick={reset}>
          <img src="/icons/ArrowClockwise.svg" alt="" />
          გასუფთავება
        </button>
      </div>

      <div className={styles.filterBox}>
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
          {schema.filters.map((filter, index) => {
            const isOpen = !!open[filter.fieldKey];
            const selectedRange = values.ranges[filter.fieldKey];
            return (
              <div key={filter.fieldId}>
                <button
                  className={`${styles.dropdownHeader} ${
                    index === schema.filters.length - 1 ? styles.last : ""
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
                  <div className={styles.dynamicRange}>
                    <input
                      type="number"
                      step={filter.range.step || 1}
                      min={filter.range.absoluteMin}
                      max={selectedRange?.[1] ?? filter.range.absoluteMax}
                      value={selectedRange?.[0] ?? filter.range.absoluteMin}
                      onChange={(event) => {
                        const min = Number(event.target.value);
                        const max = selectedRange?.[1] ?? filter.range!.absoluteMax;
                        onChange({
                          ...values,
                          ranges: {
                            ...values.ranges,
                            [filter.fieldKey]: [min, max],
                          },
                        });
                      }}
                    />
                    <span>—</span>
                    <input
                      type="number"
                      step={filter.range.step || 1}
                      min={selectedRange?.[0] ?? filter.range.absoluteMin}
                      max={filter.range.absoluteMax}
                      value={selectedRange?.[1] ?? filter.range.absoluteMax}
                      onChange={(event) => {
                        const max = Number(event.target.value);
                        const min = selectedRange?.[0] ?? filter.range!.absoluteMin;
                        onChange({
                          ...values,
                          ranges: {
                            ...values.ranges,
                            [filter.fieldKey]: [min, max],
                          },
                        });
                      }}
                    />
                  </div>
                )}

                {isOpen && filter.widgetType !== "range" && (
                  <div className={styles.brandList}>
                    {(filter.options ?? [])
                      .filter(
                        (option) =>
                          option.productCount > 0 ||
                          (values.attributes[filter.fieldKey] ?? []).includes(
                            option.value
                          )
                      )
                      .map((option) => (
                      <label key={option.optionId} className={styles.brandItem}>
                        <input
                          type="checkbox"
                          checked={(values.attributes[filter.fieldKey] ?? []).includes(
                            option.value
                          )}
                          onChange={() =>
                            toggleOption(filter.fieldKey, option.value)
                          }
                        />
                        <span>{option.label}</span>
                        <span className={styles.optionCount}>
                          {option.productCount}
                        </span>
                      </label>
                      ))}
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
