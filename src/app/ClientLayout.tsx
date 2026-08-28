"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar/TopBar";
import Header from "@/components/header/Header";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import CompareBar from "@/components/compare/CompareBar";
import TestModeBadge from "@/components/shared/TestModeBadge";
import MobileBottomNav from "@/components/mobileBottomNav/MobileBottomNav";
import { CommerceProvider } from "@/contexts/CommerceContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { refreshToken } from "@/lib/api/auth";
import {
  getStoredAuthTokens,
  shouldRefreshAccessToken,
} from "@/lib/auth/tokens";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthorizationPage =
    pathname === "/authorization" || pathname.startsWith("/authorization/");
  const isInnerPage = pathname !== "/";
  const previousPathname = useRef(pathname);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

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

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;

    const timeout = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (!isRouteLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [isRouteLoading]);

  useEffect(() => {
    let isRefreshing = false;

    const keepSessionFresh = async () => {
      const tokens = getStoredAuthTokens();

      if (!tokens || isRefreshing || !shouldRefreshAccessToken(120_000)) {
        return;
      }

      isRefreshing = true;

      try {
        await refreshToken(tokens.refreshToken);
      } catch {
        // Auth-guarded requests still handle a failed refresh explicitly.
      } finally {
        isRefreshing = false;
      }
    };

    keepSessionFresh();

    const interval = window.setInterval(keepSessionFresh, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleProgrammaticNavigation = () => {
      flushSync(() => setIsRouteLoading(true));
    };
    window.addEventListener("athome-route-loading", handleProgrammaticNavigation);

    return () =>
      window.removeEventListener("athome-route-loading", handleProgrammaticNavigation);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (
        target.closest(
          'button, input, textarea, select, [role="button"], [data-skip-route-loader="true"]'
        )
      ) {
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement | null;

      if (!link || link.target || link.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(link.href, window.location.href);

      if (
        nextUrl.origin !== window.location.origin ||
        (nextUrl.hash && nextUrl.pathname === window.location.pathname) ||
        nextUrl.pathname + nextUrl.search ===
          window.location.pathname + window.location.search
      ) {
        return;
      }

      setIsRouteLoading(true);
    };

    document.addEventListener("click", handleClick, true);

    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <CommerceProvider>
      <ToastProvider>
        <CompareProvider>
          <LoadingProvider>
          {isRouteLoading && (
            <AtHomeLoader variant="overlay" label="იტვირთება" />
          )}

          <header className={`fixed-header ${hideTopBar ? "scrolled" : ""}`}>
            <div className={`topbar-wrapper ${hideTopBar ? "hidden" : ""}`}>
              <TopBar />
            </div>
            <Header />
            <Navbar />
          </header>

          <main
            className={`page-content${isInnerPage ? " page-content--inner" : ""}`}
          >
            {children}
          </main>
          {pathname === "/" && <Footer />}
          {pathname !== "/" && !isAuthorizationPage && (
            <div className="mobile-inner-footer">
              <Footer />
            </div>
          )}
          <MobileBottomNav />
          {!isAuthorizationPage && (
            <>
              <CompareBar />
              <TestModeBadge />
            </>
          )}
          </LoadingProvider>
        </CompareProvider>
      </ToastProvider>
    </CommerceProvider>
  );
}
