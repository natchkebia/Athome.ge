"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getStorefrontCategories,
  getStorefrontSearchSuggestions,
  StorefrontCategory,
  StorefrontSearchSuggestion,
} from "@/lib/api/storefront";
import styles from "./SearchBar.module.scss";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useStorefrontLocale();
  const searchRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<StorefrontCategory | null>(null);
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<StorefrontSearchSuggestion[]>(
    []
  );
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsSuppressed, setSuggestionsSuppressed] = useState(false);
  const trimmedQuery = query.trim();
  const categoryLabel = selectedCategory?.name || (locale === "en" ? "Category" : "კატეგორია");

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (trimmedQuery) params.set("query", trimmedQuery);
    if (selectedCategory?.slug) params.set("categorySlug", selectedCategory.slug);

    return params.toString() ? `/search?${params.toString()}` : "/search";
  }, [selectedCategory?.slug, trimmedQuery]);

  const executeSearch = () => {
    if (!trimmedQuery && !selectedCategory) return;

    if (trimmedQuery) {
      try {
        const stored = JSON.parse(localStorage.getItem("athome-recent-searches") ?? "[]") as string[];
        const next = [trimmedQuery, ...stored.filter((item) => item !== trimmedQuery)].slice(0, 6);
        localStorage.setItem("athome-recent-searches", JSON.stringify(next));
      } catch {
        localStorage.setItem("athome-recent-searches", JSON.stringify([trimmedQuery]));
      }
    }

    setSuggestionsSuppressed(true);
    setSuggestionsOpen(false);
    router.push(searchUrl);
  };

  const handleCategorySelect = (category: StorefrontCategory | null) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuggestionsSuppressed(false);
    setQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  const handleSuggestionClick = (suggestion: StorefrontSearchSuggestion) => {
    setSuggestionsSuppressed(true);
    setSuggestionsOpen(false);
    setSuggestions([]);
    setQuery(suggestion.label);

    if (suggestion.type === "brand") {
      router.push(`/products/brand/${suggestion.slug}`);
      return;
    }

    if (suggestion.type === "category") {
      router.push(`/products/${suggestion.slug}`);
      return;
    }

    router.push(`/products/search/${suggestion.slug}`);
  };

  useEffect(() => {
    getStorefrontCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (pathname === "/search") {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("query") ?? "");
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestionsSuppressed(true);
      return;
    }

    if (pathname !== "/") return;

    setQuery("");
    setSelectedCategory(null);
    setSuggestions([]);
    setSuggestionsOpen(false);
    setSuggestionsSuppressed(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (suggestionsSuppressed || trimmedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      getStorefrontSearchSuggestions(trimmedQuery)
        .then((items) => {
          if (!active) return;
          setSuggestions(items);
          setSuggestionsOpen(items.length > 0);
        })
        .catch(() => {
          if (!active) return;
          setSuggestions([]);
          setSuggestionsOpen(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [suggestionsSuppressed, trimmedQuery]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className={styles.searchBar} ref={searchRef}>
      <div className={styles.dropdown}>
        <button onClick={toggleDropdown}>
          <span>{categoryLabel}</span>
          <img src="/icons/Arrow-down.svg" alt="arrow-down" />
        </button>

        {isDropdownOpen && (
          <ul className={styles.dropdownList}>
            <li
              className={`${styles.dropdownListItem} ${
                !selectedCategory ? styles.selected : ""
              }`}
              onClick={() => handleCategorySelect(null)}
            >
              {locale === "en" ? "All categories" : "ყველა კატეგორია"}
            </li>
            {categories.map((cat) => (
              <li
                key={cat.slug}
                className={`${styles.dropdownListItem} ${
                  selectedCategory?.slug === cat.slug ? styles.selected : ""
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        className={styles.searchInput}
        type="text"
        placeholder={locale === "en" ? "What are you looking for?" : "რას ეძებ?"}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onFocus={() =>
          setSuggestionsOpen(!suggestionsSuppressed && suggestions.length > 0)
        }
      />

      <button className={styles.searchBtn} onClick={executeSearch}>
        <span>{locale === "en" ? "Search" : "ძებნა"}</span>
        <img src="/icons/Frame-163477.svg" alt="" />
      </button>

      {suggestionsOpen && suggestions.length > 0 && (
        <div className={styles.suggestions}>
          <div className={styles.mobileSearchedBlock}>
            <strong>{locale === "en" ? "Searched" : "მოძებნილი"}</strong>
            <span>{trimmedQuery}</span>
          </div>
          <div className={styles.mobileResultsHeader}>
            <strong>{locale === "en" ? "Found products" : "ნაპოვნი პროდუქტი"}</strong>
            <button type="button" onClick={executeSearch}>
              {locale === "en" ? "See all" : "ყველას ნახვა"}
            </button>
          </div>
          {suggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.slug}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type === "product" && suggestion.thumbnailUrl && (
                <img
                  className={styles.suggestionImage}
                  src={suggestion.thumbnailUrl}
                  alt=""
                />
              )}
              <span className={styles.suggestionContent}>
                <span>{suggestion.label}</span>
                {(suggestion.sku || suggestion.effectivePrice != null) && (
                  <em>
                    {suggestion.sku && <span>SKU: {suggestion.sku}</span>}
                    {suggestion.sku && suggestion.effectivePrice != null && (
                      <i aria-hidden="true">•</i>
                    )}
                    {suggestion.oldPrice != null &&
                      suggestion.effectivePrice != null &&
                      suggestion.oldPrice > suggestion.effectivePrice && (
                        <del>{suggestion.oldPrice.toFixed(2)} ₾</del>
                      )}
                    {suggestion.effectivePrice != null && (
                      <strong>{suggestion.effectivePrice.toFixed(2)} ₾</strong>
                    )}
                  </em>
                )}
              </span>
              <small>
                {suggestion.type === "brand"
                  ? locale === "en" ? "Brand" : "ბრენდი"
                  : suggestion.type === "category"
                  ? locale === "en" ? "Category" : "კატეგორია"
                  : locale === "en" ? "Product" : "პროდუქტი"}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
