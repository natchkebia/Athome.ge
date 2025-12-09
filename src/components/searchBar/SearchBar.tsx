"use client";

import { useState } from "react";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
  const fakeCategories = [
    "კომპიუტერები",
    "კომპიუტერის ნაწილები",
    "პერიფერიალები",
    "კომპიუტერის აქსესუარები",
    "მონიტორები",
    "ტელევიზორები",
    "პროექტორები",
    "სავარძლები და მაგიდები",
    "ნოუთბუქები",
    "ნოუთბუქის ნაწილები",
    "ნოუთბუქის აქსესუარები",
    "კაბელები და ადაპტერები",
    "მობილურის აქსესუარები",
    'ქსელის აპარატურა'
  ];

  const [selectedCategory, setSelectedCategory] = useState("კატეგორია");
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const executeSearch = (searchQuery: string, category: string) => {
    if (category === "კატეგორია") {
      console.log("ძებნა:", searchQuery);
    } else {
      console.log("ძებნა:", selectedCategory.length, "კატეგორიაში:", category);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    executeSearch(query, category);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    executeSearch(query, selectedCategory);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(query, selectedCategory);
    }
  };

  return (
    <div className={styles.searchBar}>
      <div className={styles.dropdown}>
        <button onClick={toggleDropdown}>
          {selectedCategory}
          <img src="/icons/Arrow-down.svg" alt="arrow-down" />
        </button>

        {isDropdownOpen && (
          <ul className={styles.dropdownList}>
            {fakeCategories.map((cat) => (
              <li
                key={cat}
                className={`${styles.dropdownListItem} ${
                  selectedCategory === cat ? styles.selected : ""
                }`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="რას ეძებ?"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />

      <button className={styles.searchBtn} onClick={handleSearch}>
        ძებნა
      </button>
    </div>
  );
}
