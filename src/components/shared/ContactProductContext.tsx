"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ContactProduct = {
  name: string;
  sku: string;
  url: string;
};

type ContactProductContextValue = {
  product: ContactProduct | null;
  setProduct: (product: ContactProduct | null) => void;
};

const ContactProductContext = createContext<ContactProductContextValue | null>(
  null,
);

export function ContactProductProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<ContactProduct | null>(null);
  const value = useMemo(
    () => ({ product, setProduct }),
    [product],
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
