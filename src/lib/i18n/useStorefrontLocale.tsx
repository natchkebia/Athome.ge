"use client";

import { createContext, useContext } from "react";
import type { StorefrontLocale } from "./locale";

const StorefrontLocaleContext = createContext<StorefrontLocale>("ka");

export function StorefrontLocaleProvider({
  locale,
  children,
}: {
  locale: StorefrontLocale;
  children: React.ReactNode;
}) {
  return (
    <StorefrontLocaleContext.Provider value={locale}>
      {children}
    </StorefrontLocaleContext.Provider>
  );
}

export function useStorefrontLocale(): StorefrontLocale {
  return useContext(StorefrontLocaleContext);
}
