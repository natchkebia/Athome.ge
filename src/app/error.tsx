"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Storefront render error", error);
  }, [error]);

  return (
    <main className="site-wrapper" style={{ minHeight: "55vh", display: "grid", placeItems: "center", textAlign: "center", padding: "48px 20px" }}>
      <div>
        <h1 style={{ marginBottom: 12 }}>გვერდის ჩატვირთვა ვერ მოხერხდა</h1>
        <p style={{ color: "#68757c", marginBottom: 24 }}>განაახლეთ გვერდი ან დაბრუნდით მთავარ გვერდზე.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button type="button" onClick={reset} style={{ border: 0, borderRadius: 8, background: "#10b5c0", color: "white", padding: "11px 20px", cursor: "pointer" }}>ხელახლა ჩატვირთვა</button>
          <Link href="/" style={{ border: "1px solid #10b5c0", borderRadius: 8, color: "#10a5af", padding: "10px 20px", textDecoration: "none" }}>მთავარი გვერდი</Link>
        </div>
      </div>
    </main>
  );
}
