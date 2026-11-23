import React from 'react';

/**
 * Komponen Lambang Makara Universitas Indonesia resmi bervektor SVG
 * Menggunakan warna kuning khas Makara UI (#F6DB00) dan putih
 */
export default function UiLogo({ size = 42, showText = true, textColor = "#ffffff", subColor = "rgba(255,255,255,0.7)" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      {/* Lambang Makara UI Emas / Kuning */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 6px rgba(246, 219, 0, 0.35))' }}
      >
        <defs>
          <linearGradient id="uiMakaraGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="45%" stopColor="#F6DB00" />
            <stop offset="100%" stopColor="#D4A700" />
          </linearGradient>
          <radialGradient id="makaraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6DB00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F6DB00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow halo */}
        <circle cx="50" cy="50" r="46" fill="url(#makaraGlow)" />

        {/* Lingkaran border luar */}
        <circle cx="50" cy="50" r="45" stroke="url(#uiMakaraGold)" strokeWidth="2.5" fill="none" opacity="0.9" />
        <circle cx="50" cy="50" r="41.5" stroke="url(#uiMakaraGold)" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.6" />

        {/* Makara Kalpataru Symbol */}
        <g fill="url(#uiMakaraGold)">
          {/* Batang Utama / Poros Tengah */}
          <path d="M48.5 82 C48.5 75, 49 60, 49 46 L51 46 C51 60, 51.5 75, 51.5 82 Z" />

          {/* Kuncup Teratai Puncak (Kuncup Pengetahuan) */}
          <path d="M50 14 C46 22, 44 28, 50 34 C56 28, 54 22, 50 14 Z" />
          {/* Kelopak Samping Teratai Puncak */}
          <path d="M50 34 C44 31, 38 25, 42 19 C42 25, 46 29, 50 34 Z" opacity="0.9" />
          <path d="M50 34 C56 31, 62 25, 58 19 C58 25, 54 29, 50 34 Z" opacity="0.9" />

          {/* Cabang Kalpataru Tingkat Atas (Meliuk ke luar) */}
          <path d="M50 40 C43 38, 30 36, 26 44 C23 50, 29 55, 34 50 C38 46, 42 45, 50 46 C42 47, 36 50, 34 56 C32 61, 38 65, 43 61 C47 57, 49 53, 50 51 Z" />
          <path d="M50 40 C57 38, 70 36, 74 44 C77 50, 71 55, 66 50 C62 46, 58 45, 50 46 C58 47, 64 50, 66 56 C68 61, 62 65, 57 61 C53 57, 51 53, 50 51 Z" />

          {/* Cabang Bawah Melengkung (Sulur Teratai & Gelombang Air) */}
          <path d="M50 58 C41 59, 24 61, 20 70 C17 76, 25 81, 30 76 C35 71, 41 68, 50 67 Z" />
          <path d="M50 58 C59 59, 76 61, 80 70 C83 76, 75 81, 70 76 C65 71, 59 68, 50 67 Z" />

          {/* Lingkaran Kuncup Spiral Khas Makara */}
          <circle cx="28" cy="46" r="2.8" />
          <circle cx="72" cy="46" r="2.8" />
          <circle cx="23" cy="71" r="2.5" />
          <circle cx="77" cy="71" r="2.5" />

          {/* Dudukan Dasar Teratai / Padma */}
          <path d="M34 82 C40 85, 60 85, 66 82 C64 80, 36 80, 34 82 Z" />
          <path d="M40 85 C46 87, 54 87, 60 85 C58 83, 42 83, 40 85 Z" opacity="0.8" />
        </g>
      </svg>

      {/* Label Branding UI */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{
            fontSize: '13.5px',
            fontWeight: 800,
            letterSpacing: '0.6px',
            color: '#F6DB00',
            textTransform: 'uppercase',
            fontFamily: 'inherit'
          }}>
            Universitas Indonesia
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: subColor,
            letterSpacing: '0.2px'
          }}>
            LBI Fakultas Ilmu Pengetahuan Budaya
          </span>
        </div>
      )}
    </div>
  );
}
