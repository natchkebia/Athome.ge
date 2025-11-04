"use client";

import ProductSection from "../shared/ProductSection"; 

interface Product {
  id: number;
  discount?: number;
  image: string;
  title: string;
  oldPrice?: number;
  newPrice?: number;
  category: string;
  isNew?: boolean;
}

export default function ComputersSection() {
  const products: Product[] = [
    {
      id: 1,
      image: "/images/DiscountPc.png",
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      newPrice: 9500,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 2,
      image: "/images/DiscountPc.png",
      title: "SAMSUNG ODYSSEY G5 27'' CURVED MONITOR",
      newPrice: 2000,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 3,
      image: "/images/DiscountPc.png",
      title: "2E GAMING CHAIR HEBI (BLACK/GREEN)",
      newPrice: 5000,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 4,
      image: "/images/DiscountPc.png",
      title: "HYPERX CLOUD ALPHA WIRELESS",
      newPrice: 6000,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 5,
      image: "/images/DiscountPc.png",
      title: "ASUS TUF GAMING LAPTOP",
      newPrice: 4200,
      category: "კომპიუტერები",
      isNew: true,
    },
    {
      id: 6,
      image: "/images/DiscountPc.png",
      title: "NVIDIA RTX 4070TI GRAPHICS CARD",
      newPrice: 4200,
      category: "კომპიუტერები",
      isNew: true,
    },
  ];

  return (
    <ProductSection
      icon="/icons/Computer.svg"
      title="კომპიუტერები"
      products={products}
    />
  );
}
