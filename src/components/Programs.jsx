import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../services/api";

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
};

export default function Programs({ landingOverview }) {
  const [programList, setProgramList] = useState([]);

  useEffect(() => {
    if (!landingOverview?.services) return;

    const services = landingOverview.services;

    const bipa = services.find((s) => s.slug === "program-bipa-129" || s.slug === "bipa" || s.title?.toLowerCase().includes("bipa"));
    const ppb = services.find((s) => s.slug === "program-pelayanan-bahasa-127" || s.slug === "ppb" || s.title?.toLowerCase().includes("pelayanan bahasa"));
    const ppp = services.find((s) => s.slug === "program-penerjemahan-dan-penjurubahasaan-1283" || s.slug === "ppp" || s.title?.toLowerCase().includes("penjurubahasaan"));

    const mapped = [
      {
        title: bipa?.title,
        desc: bipa?.summary || (bipa?.body ? stripHtml(bipa.body).slice(0, 160) + "..." : ""),
        img: resolveImageUrl(bipa?.image_url),
        division: "bipa",
        slug: bipa?.slug || "program-bipa-129",
      },
      {
        title: ppb?.title,
        desc: ppb?.summary || (ppb?.body ? stripHtml(ppb.body).slice(0, 160) + "..." : ""),
        img: resolveImageUrl(ppb?.image_url),
        division: "ppb_english",
        slug: ppb?.slug || "program-pelayanan-bahasa-127",
      },
      {
        title: ppp?.title,
        desc: ppp?.summary || (ppp?.body ? stripHtml(ppp.body).slice(0, 160) + "..." : ""),
        img: resolveImageUrl(ppp?.image_url),
        division: "ppp",
        slug: ppp?.slug || "program-penerjemahan-dan-penjurubahasaan-1283",
      },
    ];

    setProgramList(mapped.filter((program) => program.title));
  }, [landingOverview]);

  return (
    <section className="programs-section" id="programs">
      <div className="container programs-inner">
        <div className="section-header text-center">
          <span className="section-subtitle">
            PROGRAM KAMI
          </span>
          <h2 className="section-title">
            Membuka dunia melalui bahasa
          </h2>
          <p className="section-lead">
            Pilih program yang paling sesuai untuk mengembangkan kemampuan bahasa dan profesional Anda.
          </p>
        </div>

        <div className="programs-grid">
          {programList.map((p, idx) => (
            <article key={p.title} className="program-card">
              <div className="program-img-wrapper">
                {p.img ? <img src={p.img} alt={p.title} className="program-card-img" /> : <div className="program-card-img program-card-img-empty">Foto program belum tersedia</div>}
                <span className="card-number">0{idx + 1}</span>
              </div>
              <div className="program-card-content">
                <h3 className="program-title">{p.title}</h3>
                <p className="program-desc">{p.desc}</p>
                <div className="program-card-actions">
                  <Link
                    to={`/programs/${p.division === "bipa" ? "bipa" : p.division === "ppp" ? "ppp" : "ppb"}`}
                    className="read-more-btn"
                  >
                    <span>Pelajari Selengkapnya</span>
                    <i className="ti ti-arrow-right" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
