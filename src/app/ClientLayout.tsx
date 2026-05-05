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
    const desktopQuery = window.matchMedia("(min-width: 1025px)");

    const updateHeaderState = () => {
      setHideTopBar(desktopQuery.matches && window.scrollY > 80);
    };

    updateHeaderState();

    window.addEventListener("scroll", updateHeaderState);
    desktopQuery.addEventListener("change", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      desktopQuery.removeEventListener("change", updateHeaderState);
    };
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
