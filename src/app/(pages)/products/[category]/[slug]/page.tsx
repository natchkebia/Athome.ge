"use client";

import { useParams } from "next/navigation";
// import styles from "./page.module.scss";
import ProductDetail from "@/components/products/ProductDetail";

type Params = {
  category: string;
  slug: string;
};

export default function ProductDetailPage() {
  const { category, slug } = useParams<Params>();

  // --- დროებითი fake მონაცემი ვიზუალისთვის
  const product = {
    id: "105035",
    slug: slug,
    category: category,
    brand: "Razer",
    title: "Razer Headset BlackShark V2 X 7.1 USB Black",
    price: 150,
    oldPrice: 260,
    images: [
      "/icons/product1.svg",
      "/icons/product2.svg",
      "/icons/product3.svg",
      "/icons/product4.svg",
    ],
    specs: [
      { label: "ბრენდი:", value: "ASUS" },
      { label: "მოდელი:", value: "M3604YA-MB106" },
      { label: "ფერი:", value: "შავი" },
      { label: "პროცესორის მწარმოებელი:", value: "AMD" },
      { label: "პროცესორის/ჩიპის ტიპი:", value: "AMD Ryzen 7 7730U" },
      { label: "პროცესორის მოდელი:", value: "7730U" },
      { label: "ბირთვების რაოდენობა:", value: "8" },
      { label: "პროცესორის ნაკადი:", value: "16" },
      { label: "პროცესორის სიჩქარე", value: "2000 MHz" },
      { label: "პროცესორის მაქსიმალური სიჩქარე", value: "4500 MHz" },
      { label: "ვიდეო ადაპტერის ტიპი:", value: "ინტეგრირებული" },
      { label: "გრაფიკული პროცესორი:", value: "AMD Radeon Graphics" },
      { label: "ინტეგრირებული გრაფიკული ბარათი:", value: "დიახ" },
    ],
  };

  return (
    <div>
      <div className="site-wrapper">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
