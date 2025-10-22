"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar/TopBar";
import Header from "@/components/header/Header";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hideTopBar, setHideTopBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHideTopBar(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed-header ${hideTopBar ? "scrolled" : ""}`}>
        <div className={`topbar-wrapper ${hideTopBar ? "hidden" : ""}`}>
          <TopBar />
        </div>
        <Header />
        <Navbar />
      </header>

      <main className="page-content">{children}</main>
      <Footer />
    </>
  );
}
