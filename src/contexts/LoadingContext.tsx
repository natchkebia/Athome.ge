"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AtHomeLoader from "@/components/shared/AtHomeLoader";

type LoadingContextValue = {
  begin: () => void;
  end: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // რამდენი სექცია იტვირთება ერთდროულად. სანამ ≥1-ია, ერთი საერთო overlay ტრიალებს.
  const [count, setCount] = useState(0);

  const begin = useCallback(() => setCount((value) => value + 1), []);
  const end = useCallback(() => setCount((value) => Math.max(0, value - 1)), []);

  const value = useMemo(() => ({ begin, end }), [begin, end]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {count > 0 && <AtHomeLoader variant="overlay" />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used inside LoadingProvider");
  }

  return context;
}

// კომპონენტი არეგისტრირებს თავის ჩატვირთვას გლობალურ ლოდერში inline-ლოდერის ნაცვლად.
export function usePageLoading(active: boolean) {
  const { begin, end } = useLoading();

  useEffect(() => {
    if (!active) return;

    begin();
    return () => end();
  }, [active, begin, end]);
}
