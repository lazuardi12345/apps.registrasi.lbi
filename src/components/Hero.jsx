import React, { useEffect, useState } from "react";
import heroSlide1 from "../assets/hero-slide-1.png";
import heroSlide2 from "../assets/hero-slide-2.png";
import { resolveImageUrl } from "../services/api";

// Import 3D Libbie Whale mascot poses
import libbieFrontalMiring from "../assets/IconPaus/3D LIBBIE  frontal miring dikit.png";
import libbieFrontal from "../assets/IconPaus/3D LIBBIE  frontal.png";
import libbieKananBanget from "../assets/IconPaus/3D LIBBIE  hadap kanan banget.png";
import libbieKananDikit from "../assets/IconPaus/3D LIBBIE  hadap kanan dikit.png";
import libbieMiringDikitAja from "../assets/IconPaus/3D LIBBIE  miring dikit aja.png";
import libbieMiringDikit from "../assets/IconPaus/3D LIBBIE  miring dikit.png";
import libbieNgambek from "../assets/IconPaus/3D LIBBIE  ngambek munggungin.png";

const slideBgs = [heroSlide1, heroSlide2];

const mascotPoses = [
  { id: "sapa", name: "Menyapa", img: libbieFrontalMiring, speech: "Halo Sobat Bahasa! Siap tingkatkan skill bahasamu bersama LBI FIB UI? 🌊✨", mood: "Sedang Menyapa 👋" },
  { id: "ceria", name: "Ceria", img: libbieFrontal, speech: "Pendaftaran Term II/2026 sudah dibuka! Yuk amankan kursimu sekarang! 🎓", mood: "Penuh Semangat ✨" },
  { id: "semangat", name: "Semangat", img: libbieMiringDikitAja, speech: "Belajar langsung bersama pengajar ahli & bersertifikat UI! 💡", mood: "Siap Belajar 🚀" },
  { id: "fokus", name: "Fokus", img: libbieKananDikit, speech: "Tersedia 15+ pilihan bahasa asing dan kelas penerjemahan profesional! 🌍", mood: "Fokus & Percaya Diri 🎯" },
  { id: "eksplor", name: "Eksplor", img: libbieKananBanget, speech: "Metode belajar interaktif, fleksibel, dan terpercaya puluhan tahun! 🏆", mood: "Menjelajah Samudera 🌟" },
  { id: "imut", name: "Gemes", img: libbieNgambek, speech: "Jangan sampai ketinggalan kuota ya, nanti nyesel lho~ 🐋💨", mood: "Mengingatkanmu 🙈" },
];

export default function Hero({ onOpenRegister, landingOverview }) {
  const [slides, setSlides] = useState([]);
  const [slideImages, setSlideImages] = useState(slideBgs);
  const [active, setActive] = useState(0);
  const [activePoseIdx, setActivePoseIdx] = useState(0);
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    if (!landingOverview?.sliders) return;

    const dbSlides = landingOverview.sliders.map((s, idx) => ({
      eyebrow: idx === 0 ? "INFORMASI PENTING" : "PROGRAM UNGGULAN",
      title: s.title,
      term: "",
      status: "DIBUKA!",
      date: s.subtitle || "9 Maret 2026 s.d. 11 Mei 2026",
      cta: s.cta_text || "Daftar Sekarang!",
      cta_link: s.cta_link || "#programs",
    }));

    setSlides(dbSlides);
    const images = landingOverview.sliders.map((s, idx) =>
      resolveImageUrl(s.image_url, idx % 2 === 0 ? heroSlide1 : heroSlide2)
    );
    setSlideImages(images);
  }, [landingOverview]);

  // Auto slide background & hero content every 7s
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Automatic cute pose changes for Libbie every 3.5 seconds!
  useEffect(() => {
    const poseInterval = setInterval(() => {
      setActivePoseIdx((prev) => (prev + 1) % mascotPoses.length);
    }, 3800);
    return () => clearInterval(poseInterval);
  }, []);

  const slide = slides[active] || slides[0];
  const currentPose = mascotPoses[activePoseIdx];

  if (!slide) return null;

  const handleMascotClick = () => {
    setIsWaving(true);
    setActivePoseIdx((prev) => (prev + 1) % mascotPoses.length);
    setTimeout(() => setIsWaving(false), 900);
  };

  return (
    <section className="hero">
      {/* Background Slideshow Slider */}
      <div className="hero-bg-slider">
        {slideImages.map((bg, idx) => (
          <div
            key={idx}
            className={`hero-bg-slide ${idx === active ? "is-active" : ""}`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
        <div className="hero-bg-overlay"></div>
      </div>

      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>
      <div className="hero-glow-center"></div>

      <div className="container hero-inner">
        {/* Kolom Kiri: Informasi & Call To Action */}
        <div className="hero-content">
          <div className="hero-slide animate-fade-in" key={active}>
            <div className="hero-badge-group">
              <span className="hero-badge">
                <span className="badge-dot"></span>
                {slide.eyebrow}
              </span>
              <span className="hero-term-pill">
                <i className="ti ti-sparkles"></i> FIB Universitas Indonesia
              </span>
            </div>

            <h1 className="hero-title">
              {slide.title} {slide.term && <span className="hero-term">{slide.term}</span>}
            </h1>

            <div className="hero-status-row">
              <span className="status-indicator-dot"></span>
              <span className="hero-status">{slide.status}</span>
              <span className="hero-status-sub">• Pendaftaran Online</span>
            </div>

            <p className="hero-date">
              <i className="ti ti-calendar-event" /> {slide.date}
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary hero-btn-main"
                onClick={() => onOpenRegister && onOpenRegister()}
              >
                {slide.cta} <i className="ti ti-arrow-right" />
              </button>
              <a href="#programs" className="btn btn-secondary hero-btn-sub" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                Pelajari Program <i className="ti ti-book-2" />
              </a>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === active ? "is-active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
              >
                {i === active && <span className="dot-progress"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: 3D Mascot Showcase "LIBBIE" (Auto Animating & Changing Poses) */}
        <div className="hero-mascot-section">
          {/* Decorative Ambient Ocean Aura, Rings & Bubbles */}
          <div className="mascot-stage-backdrop">
            <div className="mascot-radial-aura"></div>
            <div className="mascot-ring ring-1"></div>
            <div className="mascot-ring ring-2"></div>
            <div className="mascot-bubble bubble-1"></div>
            <div className="mascot-bubble bubble-2"></div>
            <div className="mascot-bubble bubble-3"></div>
            <div className="mascot-bubble bubble-4"></div>
            <div className="mascot-sparkle sparkle-1">✦</div>
            <div className="mascot-sparkle sparkle-2">✧</div>
          </div>

          {/* Floating Speech Bubble from Libbie (Auto updating) */}
          <div className="mascot-speech-bubble" key={`speech-${activePoseIdx}`}>
            <div className="speech-avatar">🐋</div>
            <div className="speech-content">
              <div className="speech-title">
                <strong>Libbie</strong> <span className="speech-role">Maskot LBI UI</span>
              </div>
              <p className="speech-text">{currentPose.speech}</p>
            </div>
            <div className="speech-tail"></div>
          </div>

          {/* 3D Mascot Main Display with Floating & Automatic Pose Transition */}
          <div
            className={`mascot-avatar-wrapper ${isWaving ? "is-interacting" : ""}`}
            onClick={handleMascotClick}
            title="Libbie si Paus 3D LBI UI (Klik untuk sapa!)"
          >
            <div className="mascot-floating-rig">
              <img
                key={`libbie-${activePoseIdx}`}
                src={currentPose.img}
                alt={`Maskot 3D Paus Libbie - ${currentPose.name}`}
                className="mascot-3d-img animate-pose-pop"
              />
              <div className="mascot-shadow-ellipse"></div>
            </div>

            {/* Floating Badges around Mascot */}
            <div className="floating-badge badge-top-right">
              <div className="badge-icon-box gold">
                <i className="ti ti-certificate"></i>
              </div>
              <div className="badge-text-box">
                <span className="badge-tag">Terakreditasi</span>
                <strong>Sertifikat Resmi UI</strong>
              </div>
            </div>

            <div className="floating-badge badge-bottom-left">
              <div className="badge-icon-box blue">
                <i className="ti ti-world"></i>
              </div>
              <div className="badge-text-box">
                <span className="badge-tag">Multibahasa</span>
                <strong>15+ Pilihan Bahasa</strong>
              </div>
            </div>

            <div className="floating-badge badge-bottom-right">
              <div className="badge-icon-box green">
                <i className="ti ti-star-filled"></i>
              </div>
              <div className="badge-text-box">
                <span className="badge-tag">Kualitas Terbaik</span>
                <strong>Rating 4.9/5 Alumni</strong>
              </div>
            </div>
          </div>

          {/* Cute Live Mood Status Badge */}
          <div className="mascot-mood-pill" key={`mood-${activePoseIdx}`}>
            <span className="mood-dot-pulse"></span>
            <span className="mood-text">Libbie: <strong>{currentPose.mood}</strong></span>
            <span className="mood-water-wave">🌊</span>
          </div>
        </div>
      </div>
    </section>
  );
}
