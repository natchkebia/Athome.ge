"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CompareItem = {
  id: number;
  slug: string;
  category: string;
  title: string;
  image: string;
  newPrice?: number;
  oldPrice?: number;
};

export type CompareToggleResult = "added" | "removed" | "full";

export const COMPARE_MAX_ITEMS = 4;

const STORAGE_KEY = "athome.compare";

type CompareContextValue = {
  items: CompareItem[];
  compareIds: Set<number>;
  maxItems: number;
  isFull: boolean;
  toggleCompare: (item: CompareItem) => CompareToggleResult;
  removeCompare: (id: number) => void;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

function isValidItem(item: unknown): item is CompareItem {
  // slug-ი და category-ი აუცილებელია — მათ გარეშე ვერც პროდუქტს გავხსნით
  // და ვერც მახასიათებლებს წამოვიღებთ. ასეთი (ძველი/გაფუჭებული) ჩანაწერები
  // იგნორირდება, რომ შედარების გვერდი არ გაფუჭდეს.
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<CompareItem>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.slug === "string" &&
    candidate.slug.length > 0 &&
    typeof candidate.category === "string" &&
    candidate.category.length > 0
  );
}

function readStored(): CompareItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const itemsRef = useRef<CompareItem[]>([]);

  // Hydrate from localStorage on the client only (avoids SSR mismatch).
  useEffect(() => {
    setItems(readStored());
  }, []);

  useEffect(() => {
    itemsRef.current = items;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage may be unavailable (private mode) — comparison still
      // works for the current session.
    }
  }, [items]);

  const toggleCompare = useCallback(
    (item: CompareItem): CompareToggleResult => {
      const current = itemsRef.current;
      const exists = current.some((entry) => entry.id === item.id);

      if (exists) {
        setItems(current.filter((entry) => entry.id !== item.id));
        return "removed";
      }

      if (current.length >= COMPARE_MAX_ITEMS) {
        return "full";
      }

      setItems([...current, item]);
      return "added";
    },
    []
  );

  const removeCompare = useCallback((id: number) => {
    setItems(itemsRef.current.filter((entry) => entry.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setItems([]);
  }, []);

  const compareIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      compareIds,
      maxItems: COMPARE_MAX_ITEMS,
      isFull: items.length >= COMPARE_MAX_ITEMS,
      toggleCompare,
      removeCompare,
      clearCompare,
    }),
    [items, compareIds, toggleCompare, removeCompare, clearCompare]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used inside CompareProvider");
  }

  return context;
}
