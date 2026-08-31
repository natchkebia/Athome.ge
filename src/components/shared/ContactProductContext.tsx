"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ContactProductContextValue = {
  productSku: string | null;
  setProductSku: (sku: string | null) => void;
};

const ContactProductContext = createContext<ContactProductContextValue | null>(
  null,
);

export function ContactProductProvider({ children }: { children: ReactNode }) {
  const [productSku, setProductSku] = useState<string | null>(null);
  const value = useMemo(
    () => ({ productSku, setProductSku }),
    [productSku],
  );

  return (
    <ContactProductContext.Provider value={value}>
      {children}
    </ContactProductContext.Provider>
  );
}

export function useContactProduct() {
  const context = useContext(ContactProductContext);

  if (!context) {
    throw new Error("useContactProduct must be used inside ContactProductProvider");
  }

  return context;
}
