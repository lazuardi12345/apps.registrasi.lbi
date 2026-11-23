// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import lbiLogo from "../assets/lbi-logo.png";
import libbieSupport from "../assets/IconPaus/3D LIBBIE  frontal miring dikit.png";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const STAFF_ROLES = new Set(["administrator", "admin", "marketing", "content_writer", "finance", "admin_ppb", "admin_bipa", "admin_ppp", "reviewer", "teacher"]);
const ADMIN_DASHBOARD_URL = import.meta.env.VITE_ADMIN_DASHBOARD_URL || "http://localhost:5174";

function isStaffUser(user) {
  return Boolean(user?.role && (STAFF_ROLES.has(user.role) || (user.role !== "student" && user.role !== "peserta")));
}

export default function Header({ theme, toggleTheme, onOpenAuth }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState([]);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const userDropdownRef = useRef(null);

  // Load dynamic service navigation from Backend API
  useEffect(() => {
    let isMounted = true;
    api.getServicesNavMenu().then((res) => {
      if (isMounted && res && res.success && Array.isArray(res.data)) {
        setServiceCategories(res.data);
      }
    }).catch((err) => {
      console.warn("Failed to load dynamic nav menu:", err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    setMobileOpen(false);
    setOpenMenu(null);

    const el = document.querySelector(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${targetId}`);
    }
  };

  const handleServiceClick = (item) => {
    setOpenMenu(null);
    setMobileOpen(false);
    if (item.href?.startsWith("http")) {
      window.location.href = item.href;
      return;
    }
    navigate(item.href || `/services/${item.slug}`);
  };

  const openAdminDashboard = () => {
    const token = localStorage.getItem("lbi_auth_token");
    if (!token) {
      onOpenAuth && onOpenAuth("login");
      return;
    }
    const adminUrl = `${ADMIN_DASHBOARD_URL}/#auth_token=${encodeURIComponent(token)}`;
    window.open(adminUrl, "_blank");
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    setMobileOpen(false);
    logout();
  };

  const categoryDetailPaths = {
    "Program BIPA": "/programs/bipa",
    "Kursus Bahasa": "/programs/ppb",
    "PPP Penerjemahan": "/programs/ppp",
  };

  const categoryDisplayLabels = {
    "Program BIPA": "BIPA Program",
    "PPP Penerjemahan": "Program Penerjemahan",
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const userPhoto = user?.profile?.photo_url || null;
  const userFirstName = user?.name?.split(" ")[0] || "Peserta";

  return (
    <>
    <header className="header">
      {/* Header Main Bar */}
      <div className="header-main">
        <div className="header-fluid-container header-main-inner">
          <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>
            <img src={lbiLogo} alt="Logo LBI FIB UI" className="logo-img" />
            <span className="logo-text">
              Lembaga Bahasa Internasional
              <small>Fakultas Ilmu Pengetahuan Budaya UI</small>
            </span>
          </Link>

          <div className="header-actions">
            <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Theme Switch */}
              <button
                className={`theme-switch ${theme === "dark" ? "is-on" : ""}`}
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Matikan mode gelap" : "Aktifkan mode gelap"}
                aria-pressed={theme === "dark"}
                title={theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif"}
              >
                <i className="ti ti-sun-high theme-switch-sun" />
                <span className="theme-switch-track"><span className="theme-switch-thumb" /></span>
                <i className="ti ti-moon-stars theme-switch-moon" />
              </button>

              {isAuthenticated ? (
                /* ── User Avatar Dropdown ── */
                <div className="hdr-user-menu" ref={userDropdownRef}>
                  <button
                    className="hdr-avatar-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="Menu pengguna"
                    aria-expanded={userDropdownOpen}
                  >
                    <span className="hdr-avatar-ring">
                      {userPhoto ? (
                        <img src={userPhoto} alt={userFirstName} className="hdr-avatar-img" />
                      ) : (
                        <span className="hdr-avatar-char">{userInitial}</span>
                      )}
                    </span>
                    <span className="hdr-user-info">
                      <span className="hdr-user-name">{userFirstName}</span>
                      <span className="hdr-user-role">{isStaffUser(user) ? "Staff LBI" : "Peserta"}</span>
                    </span>
                    <i className={`ti ti-chevron-down hdr-chevron ${userDropdownOpen ? "is-open" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="hdr-user-dropdown animate-fade-in-up">
                      {/* Header of dropdown */}
                      <div className="hdr-dropdown-head">
                        <div className="hdr-dropdown-avatar">
                          {userPhoto ? (
                            <img src={userPhoto} alt={user?.name} className="hdr-dropdown-avatar-img" />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <div>
                          <p className="hdr-dropdown-name">{user?.name}</p>
                          <p className="hdr-dropdown-email">{user?.email}</p>
                        </div>
                      </div>
                      <div className="hdr-dropdown-divider" />

                      {/* Menu items */}
                      <div className="hdr-dropdown-body">
                        <Link
                          to="/dashboard"
                          className="hdr-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="ti ti-layout-dashboard" />
                          <span>Portal Peserta</span>
                          <i className="ti ti-chevron-right hdr-dropdown-arrow" />
                        </Link>

                        <Link
                          to="/pendaftaran"
                          className="hdr-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="ti ti-file-plus" />
                          <span>Daftar Kursus Baru</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=payments"
                          className="hdr-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="ti ti-receipt" />
                          <span>Konfirmasi Pembayaran</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=profile"
                          className="hdr-dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <i className="ti ti-user-cog" />
                          <span>Profil Saya</span>
                        </Link>

                        {isStaffUser(user) && (
                          <>
                            <div className="hdr-dropdown-divider" />
                            <button
                              className="hdr-dropdown-item hdr-dropdown-item--admin"
                              onClick={() => { setUserDropdownOpen(false); openAdminDashboard(); }}
                            >
                              <i className="ti ti-shield-cog" />
                              <span>Admin Dashboard</span>
                              <i className="ti ti-external-link hdr-dropdown-arrow" />
                            </button>
                          </>
                        )}

                        <div className="hdr-dropdown-divider" />
                        <button className="hdr-dropdown-item hdr-dropdown-item--logout" onClick={handleLogout}>
                          <i className="ti ti-logout" />
                          <span>Keluar dari Akun</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-nav-buttons">
                  <button className="account-btn" onClick={() => onOpenAuth && onOpenAuth('login')}>
                    <i className="ti ti-user-circle" />
                    <span>Akun Peserta</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className={`burger ${mobileOpen ? "is-active" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              <span className="burger-line"></span>
              <span className="burger-line"></span>
              <span className="burger-line"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Navbar Bar */}
      <nav className={`navbar ${mobileOpen ? "is-open" : ""}`}>
        <div className="header-fluid-container navbar-container">
          <ul className="nav-list">
            {/* Beranda */}
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>
                Beranda
              </Link>
            </li>

            {/* Dynamic Service Categories */}
            {serviceCategories.map((cat, i) => (
              <li
                key={cat.label}
                className={`nav-item has-dropdown ${openMenu === i ? "is-expanded" : ""}`}
                onMouseEnter={() => window.innerWidth > 1024 && setOpenMenu(i)}
                onMouseLeave={() => window.innerWidth > 1024 && setOpenMenu(null)}
              >
                <button
                  type="button"
                  aria-expanded={openMenu === i}
                  onClick={() => {
                    if (window.innerWidth <= 1024) {
                      setOpenMenu(openMenu === i ? null : i);
                      return;
                    }
                    const detailPath = categoryDetailPaths[cat.label];
                    if (detailPath) {
                      setOpenMenu(null);
                      setMobileOpen(false);
                      navigate(detailPath);
                      return;
                    }
                    setOpenMenu(openMenu === i ? null : i);
                  }}
                  className="nav-link nav-link-btn"
                >
                  <span>
                    {categoryDisplayLabels[cat.label] || cat.label}
                  </span>
                  <i className="ti ti-chevron-down" />
                </button>

                {openMenu === i && (
                  <div className={`dropdown dynamic-services-dropdown ${cat.label === "Program BIPA" ? "bipa-dropdown" : ""} ${cat.label === "Kursus Bahasa" ? "ppb-dropdown" : ""} ${cat.label === "PPP Penerjemahan" ? "ppp-dropdown" : ""} animate-fade-in-up`}>
                    <div className="dropdown-category-meta">
                      <span className="cat-desc">{cat.description}</span>
                      <span className="cat-count">{cat.items?.length || 0} {cat.label === "Tes Bahasa" ? "Tes" : "Kursus"}</span>
                    </div>
                    <ul className="dropdown-items-scroll">
                      {cat.items?.map((item) => (
                        <li key={item.id} className={item.children ? "dropdown-group" : ""}>
                          {item.children ? (
                            <>
                              <div className="dropdown-group-title">{item.title}</div>
                              <ul className="dropdown-group-items">
                                {item.children.map((child) => (
                                  <li key={child.id}>
                                    <button
                                      type="button"
                                      className="dropdown-item-link"
                                      onClick={() => handleServiceClick(child)}
                                    >
                                      <span className="item-bullet">&bull;</span>
                                      <span className="item-text">{child.title}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="dropdown-item-link"
                              onClick={() => handleServiceClick(item)}
                            >
                              <span className="item-bullet">&bull;</span>
                              <span className="item-text">{item.title}</span>
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}

            {/* Konfirmasi Pembayaran */}
            <li className="nav-item">
              <Link to="/konfirmasi-pembayaran" className="nav-link" onClick={() => setMobileOpen(false)}>
                Konfirmasi Pembayaran
              </Link>
            </li>

            {/* Berita & Artikel */}
            <li className="nav-item">
              <a
                href="#berita"
                onClick={(e) => handleScrollTo(e, "#berita")}
                className="nav-link"
              >
                Berita & Pengumuman
              </a>
            </li>

            {/* Tentang Kami */}
            <li className="nav-item">
              <a
                href="#tentang"
                onClick={(e) => handleScrollTo(e, "#tentang")}
                className="nav-link"
              >
                Tentang Kami
              </a>
            </li>
          </ul>

          {/* Mobile Actions Drawer */}
          <div className="mobile-actions-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
              <button
                className={`theme-switch theme-switch-drawer ${theme === "dark" ? "is-on" : ""}`}
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Matikan mode gelap" : "Aktifkan mode gelap"}
                aria-pressed={theme === "dark"}
                title={theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif"}
              >
                <span className="theme-switch-label">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
                <i className="ti ti-sun-high theme-switch-sun" />
                <span className="theme-switch-track"><span className="theme-switch-thumb" /></span>
                <i className="ti ti-moon-stars theme-switch-moon" />
              </button>
            </div>

            <div className="mobile-action-buttons">
              {isAuthenticated ? (
                <>
                  {/* Mobile user card */}
                  <div className="mobile-user-card">
                    <div className="mobile-user-avatar">{userInitial}</div>
                    <div className="mobile-user-info">
                      <span className="mobile-user-name">{user?.name}</span>
                      <span className="mobile-user-email">{user?.email}</span>
                    </div>
                  </div>
                  <Link to="/dashboard" className="login-btn-drawer" onClick={() => setMobileOpen(false)}>
                    <i className="ti ti-layout-dashboard" />
                    <span>Portal Peserta</span>
                  </Link>
                  <Link to="/pendaftaran" className="login-btn-drawer" onClick={() => setMobileOpen(false)}>
                    <i className="ti ti-file-plus" />
                    <span>Daftar Kursus Baru</span>
                  </Link>
                  {isStaffUser(user) && (
                    <button className="admin-dashboard-btn-drawer" onClick={() => { setMobileOpen(false); openAdminDashboard(); }}>
                      <i className="ti ti-shield-cog" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    <i className="ti ti-logout" />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <button
                  className="account-btn-drawer"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth && onOpenAuth('login');
                  }}
                >
                  <i className="ti ti-user-circle" />
                  <span>Masuk / Daftar Akun</span>
                </button>
              )}

              <a
                href="https://wa.me/6281945747271"
                target="_blank"
                rel="noreferrer"
                className="support-btn-drawer"
                aria-label="Buka Support Center via WhatsApp"
              >
                <img src={libbieSupport} alt="" className="support-libbie-img" />
                <span>Support Center</span>
                <i className="ti ti-arrow-up-right support-arrow" />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <a
      href="https://wa.me/6281945747271"
      target="_blank"
      rel="noreferrer"
      className="support-float"
      aria-label="Buka Support Center via WhatsApp"
      title="Support Center LBI FIB UI"
    >
      <span className="support-float-icon"><img src={libbieSupport} alt="Maskot Libbie" className="support-libbie-img" /></span>
      <span className="support-float-copy"><strong>Support Center</strong><small>Chat dengan admin LBI</small></span>
      <i className="ti ti-arrow-up-right support-float-arrow" />
    </a>
    </>
  );
}
