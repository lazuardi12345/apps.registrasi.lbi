// src/components/Footer.jsx
import lbiLogo from "../assets/lbi-logo.png";

function SocialIcon({ name }) {
  const paths = {
    facebook: "M14 8h3V4h-3c-3.314 0-5 1.686-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.667.333-1 1-1z",
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.964 6.817H1.683l7.735-8.835L1.262 2.25h6.826l4.713 6.231 5.443-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
    instagram: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z",
    linkedin: "M5.5 3A2.5 2.5 0 1 1 5.5 8a2.5 2.5 0 0 1 0-5zM3.5 10h4v12h-4V10zm6 0h3.8v1.64h.05C13.88 10.6 15.1 9.5 17.35 9.5 21.04 9.5 22 11.93 22 15.1V22h-4v-6.1c0-1.46-.03-3.34-2.04-3.34-2.04 0-2.35 1.59-2.35 3.23V22h-4V10z",
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

export default function Footer() {
  const footer = {
    brand_description: [
      "Lembaga Bahasa Internasional",
      "Fakultas Ilmu Pengetahuan Budaya",
      "Universitas Indonesia",
    ],
    contacts: [
      {
        title: "LBI SALEMBA",
        lines: [
          "Gd. Iluni UI",
          "UI Salemba",
          "Jl. Salemba Raya No. 4, Jakarta 10430",
          "Tel. (021) 31930211, 31930335",
          "Fax. (021) 315 6341",
          "WhatsApp (Chat Only)",
          "+62 877 1078 1805",
        ],
      },
      {
        title: "LBI DEPOK",
        lines: [
          "Fakultas Ilmu Pengetahuan Budaya",
          "Gedung X - Koentjaraningrat Lantai 1",
          "Kampus UI Depok, Pondok Cina, Kec. Beji, Depok, Jawa Barat 16424",
          "Phone : (+62-21) 7864075, 78849082",
          "Fax : (+62-21) 78849085",
          "WhatsApp (Chat Only)",
          "+62 877 1078 1805",
        ],
      },
      {
        title: "EMAIL US",
        lines: [
          "Customer Service LBI",
          "informasi@lbifibui.com",
          "Program Penerjemahan",
          "ppp@lbifibui.com",
          "Program BIPA",
          "bipa@lbifibui.com",
        ],
      },
    ],
    social_links: [
      { label: "Facebook", name: "facebook", url: "https://www.facebook.com/LBIUI/?locale=id_ID" },
      { label: "X", name: "x", url: "https://x.com/lbi_fib_ui?s=11&t=p_GUYFS9sg6c-D6WA5_rfQ" },
      { label: "Instagram", name: "instagram", url: "https://www.instagram.com/lbi_fib_ui/?hl=en" },
      { label: "LinkedIn", name: "linkedin", url: "https://id.linkedin.com/company/lbifib-ui" },
    ],
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={lbiLogo} alt="Logo LBI FIB UI" className="footer-logo-img" />
          </div>
          <div className="brand-desc">
            {footer.brand_description.map((line) => <p key={line}>{line}</p>)}
          </div>
          <div className="social-links">
            {footer.social_links.map((social) => (
              <a key={social.url} href={social.url} aria-label={social.label} target="_blank" rel="noreferrer">
                <SocialIcon name={social.name} />
              </a>
            ))}
          </div>
        </div>

        {footer.contacts.map((block) => (
          <div key={block.title} className="footer-col">
            <h4>{block.title}</h4>
            <div className="footer-lines">
              {block.lines.map((line) => (
                <div key={line} className="footer-line-item">
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            Copyright © {new Date().getFullYear()} - Lembaga Bahasa Internasional Fakultas Ilmu Pengetahuan Budaya
            Universitas Indonesia. All rights reserved.
          </p>
          <a href="#" className="back-to-top" title="Kembali ke atas">
            <i className="ti ti-arrow-narrow-up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
