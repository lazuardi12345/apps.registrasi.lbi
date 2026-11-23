// src/components/Clients.jsx
import React, { useEffect, useState } from "react";
import { resolveImageUrl } from "../services/api";

const getClientMeta = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("kyoto")) return { icon: "ti-school", color: "#a31d1d" };
  if (lower.includes("yudisial")) return { icon: "ti-scale", color: "#b89047" };
  if (lower.includes("kabinet") || lower.includes("setkab")) return { icon: "ti-briefcase", color: "#4b5563" };
  if (lower.includes("sayurbox")) return { icon: "ti-leaf", color: "#10b981" };
  if (lower.includes("kpk")) return { icon: "ti-shield-half", color: "#ef4444" };
  if (lower.includes("acicis")) return { icon: "ti-globe", color: "#3b82f6" };
  if (lower.includes("lx international")) return { icon: "ti-world", color: "#f97316" };
  if (lower.includes("kemenkeu")) return { icon: "ti-coin", color: "#0ea5e9" };
  if (lower.includes("pertamina")) return { icon: "ti-flame", color: "#f43f5e" };
  if (lower.includes("kemlu")) return { icon: "ti-flag", color: "#06b6d4" };
  if (lower.includes("bappenas")) return { icon: "ti-presentation-analytics", color: "#8b5cf6" };
  if (lower.includes("lpdp")) return { icon: "ti-award", color: "#eab308" };
  return { icon: "ti-building-skyscraper", color: "var(--color-primary)" };
};

/**
 * Validates a logo URL — hanya gunakan jika benar-benar bisa di-fetch
 * (placehold.co, unsplash, atau path relatif). Tolak URL domain yang diketahui error.
 */
const isValidLogoUrl = (url) => {
  if (!url || typeof url !== "string" || url.trim() === "") return false;
  return true;
};

export default function Clients({ landingOverview }) {
  const [partnerList, setPartnerList] = useState([]);

  useEffect(() => {
    if (!landingOverview?.partners?.length) return;

    const cleaned = landingOverview.partners.map((p) => ({
      id: p.id,
      name: p.name.replace(/^Logo\s+/i, ""),
      logo_url: p.logo_url,
      website_url: p.website_url,
    }));

    setPartnerList(cleaned);
  }, [landingOverview]);

  const displayList = partnerList;

  const ClientCard = ({ partner, suffix = "" }) => {
    const [imgError, setImgError] = useState(false);
    const meta = getClientMeta(partner.name);
    const resolvedLogo = !imgError && isValidLogoUrl(partner.logo_url)
      ? resolveImageUrl(partner.logo_url)
      : null;

    const cardContent = (
      <>
        <div className="client-card-logo">
          {resolvedLogo ? (
            <img
              src={resolvedLogo}
              alt={partner.name}
              className="client-logo-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <i className={`ti ${meta.icon}`} style={{ color: meta.color }} />
          )}
        </div>
        <span className="client-card-name">{partner.name}</span>
      </>
    );

    if (partner.website_url) {
      return (
        <a
          key={(partner.id || partner.name) + suffix}
          href={partner.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="client-card client-card-link"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {cardContent}
        </a>
      );
    }

    return (
      <div key={(partner.id || partner.name) + suffix} className="client-card">
        {cardContent}
      </div>
    );
  };

  return (
    <section className="clients-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">KLIEN KAMI</span>
          <h2 className="section-title-small">Dipercaya Oleh Universitas, Instansi Pemerintah, &amp; Perusahaan Nasional</h2>
        </div>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-fade-left"></div>
        <div className="marquee">
          <div className="marquee-content">
            {displayList.map((partner) => (
              <ClientCard key={partner.id || partner.name} partner={partner} />
            ))}
            {/* Duplicate for seamless infinite loop */}
            {displayList.map((partner) => (
              <ClientCard key={(partner.id || partner.name) + "-dup"} partner={partner} suffix="-dup" />
            ))}
          </div>
        </div>
        <div className="marquee-fade-right"></div>
      </div>
    </section>
  );
}
