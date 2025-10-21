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

export default function TablesAndChairs() {
    const products: Product[] = [
    {
      id: 1,
      image: "/images/chairs.png",
      title: "INTEL® CORE™ I5 14400F / RTX 3070 8GB / 16GB",
      newPrice: 9500,
      category: "პერიფერია",
      isNew: true,
    },
    {
      id: 2,
      image: "/images/tables.png",
      title: "SAMSUNG ODYSSEY G5 27'' CURVED MONITOR",
      newPrice: 2000,
      category: "პერიფერია",
    },
    {
      id: 3,
      image: "/images/chairs2.png",
      title: "2E GAMING CHAIR HEBI (BLACK/GREEN)",
      newPrice: 5000,
      category: "პერიფერია",
      isNew: true,
    },
    {
      id: 4,
      image: "/images/table2.png",
      title: "HYPERX CLOUD ALPHA WIRELESS",
      newPrice: 6000,
      category: "პერიფერია",
    },
    {
      id: 5,
      image: "/images/chairs2.png",
      title: "ASUS TUF GAMING LAPTOP",
      newPrice: 4200,
      category: "პერიფერია",
      isNew: true,
    },
    {
      id: 6,
      image: "/images/tables.png",
      title: "NVIDIA RTX 4070TI GRAPHICS CARD",
      newPrice: 4200,
      category: "პერიფერია",
    },
  ];

  return (
    <ProductSection
      icon="./icons/Table.svg"
      title="მაგიდები და სავარძლები"
      products={products}
    />
  );
}
