"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "@/components/ breadcrumb/Breadcrumb";
import AtHomeLoader from "@/components/shared/AtHomeLoader";
import EmptyState from "@/components/products/EmptyState";
import {
  getStorefrontServices,
  StorefrontService,
} from "@/lib/api/storefront";
import { normalizeMediaUrl } from "@/lib/storefront/products";
import { useStorefrontLocale } from "@/lib/i18n/useStorefrontLocale";
import styles from "./services.module.scss";

export default function ServicesPage() {
  const en = useStorefrontLocale() === "en";
  const [services, setServices] = useState<StorefrontService[]>([]);
  const [loading, setLoading] = useState(true);
  const breadcrumbs = [
    { label: en ? "Home" : "მთავარი გვერდი", href: "/" },
    { label: en ? "Service" : "სერვისი" },
  ];

  useEffect(() => {
    let active = true;

    getStorefrontServices()
      .then((items) => {
        if (!active) return;
        const sorted = [...(items ?? [])].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
        );
        setServices(sorted);
      })
      .catch(() => {
        if (active) setServices([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div style={{ marginLeft: "30px" }}>
        <Breadcrumb items={breadcrumbs} />
      </div>
      <main className={styles.servicesPage}>
        <h1 className={styles.title}>
          {en ? "Give your old computer a new life" : "ძველი კომპიუტერის ახალი სიცოცხლე"}
        </h1>

        {loading ? (
          <AtHomeLoader variant="section" />
        ) : services.length === 0 ? (
          <EmptyState />
        ) : (
          <section className={styles.servicesGrid}>
            {services.map((service) => {
              // ცარიელ ფოტოზე "" — რომ emptyImage box გამოჩნდეს (არა ლოგო).
              const image = normalizeMediaUrl(service.imageUrl ?? undefined, "");

              return (
                <article className={styles.serviceCard} key={service.id}>
                  <div className={styles.imageBox}>
                    {image ? (
                      <img src={image} alt={service.name} />
                    ) : (
                      <div className={styles.emptyImage} />
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h2>{service.name}</h2>
                    <p>{service.price.toFixed(2)} ₾</p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}
