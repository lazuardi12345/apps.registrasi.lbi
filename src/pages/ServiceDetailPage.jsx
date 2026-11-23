// src/pages/ServiceDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AuthModal from "../components/AuthModal";

export default function ServiceDetailPage({ serviceSlug }) {
  const { slug: routeSlug } = useParams();
  const slug = routeSlug || serviceSlug;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'regulations' | 'schedules'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [servRes, schedRes] = await Promise.all([
          api.getServiceBySlug(slug),
          api.getSchedules("", true),
        ]);

        if (servRes && servRes.success && servRes.data) {
          setService(servRes.data);

          // Find matching schedules by program name or keywords
          if (schedRes && schedRes.success && Array.isArray(schedRes.data)) {
            const titleLower = servRes.data.title.toLowerCase();
            const matched = schedRes.data.filter((s) => {
              const progLower = s.program_name.toLowerCase();
              return (
                progLower.includes(titleLower) ||
                titleLower.includes(progLower) ||
                (titleLower.includes("bipa") && s.division === "bipa") ||
                (titleLower.includes("penerjemah") && s.division === "ppp") ||
                (titleLower.includes("english") && s.division === "ppb_english")
              );
            });
            setSchedules(matched.length > 0 ? matched : schedRes.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Failed to load service detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const handleEnrollSchedule = (schedId) => {
    if (!isAuthenticated) {
      setSelectedScheduleId(schedId);
      setAuthModalOpen(true);
    } else {
      const selectedSchedule = schedules.find((item) => String(item.id) === String(schedId));
      const division = String(selectedSchedule?.division || '').toLowerCase();
      const program = division.startsWith('ppb') ? 'ppb' : division === 'bipa' ? 'bipa' : 'ppp';
      const catalogParams = selectedSchedule?.course_catalog_id
        ? `&course_catalog_id=${selectedSchedule.course_catalog_id}&course_name=${encodeURIComponent(selectedSchedule.course_catalog?.title || selectedSchedule.program_name)}`
        : '';
      navigate(`/pendaftaran?program=${program}${catalogParams}`);
    }
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    const selectedSchedule = schedules.find((item) => String(item.id) === String(selectedScheduleId || schedules[0]?.id));
    const division = String(selectedSchedule?.division || '').toLowerCase();
    const program = division.startsWith('ppb') ? 'ppb' : division === 'bipa' ? 'bipa' : 'ppp';
    const catalogParams = selectedSchedule?.course_catalog_id
      ? `&course_catalog_id=${selectedSchedule.course_catalog_id}&course_name=${encodeURIComponent(selectedSchedule.course_catalog?.title || selectedSchedule.program_name)}`
      : '';
    navigate(`/pendaftaran?program=${program}${catalogParams}`);
  };

  const quickFacts = [
    {
      icon: '📘',
      title: 'Program',
      text: service?.title || 'Program layanan LBI FIB UI',
    },
    {
      icon: '📝',
      title: 'Ringkasan',
      text: service?.summary || 'Informasi singkat mengikuti data layanan yang tersedia di sistem.',
    },
    {
      icon: '🗓️',
      title: 'Jadwal',
      text: schedules?.length ? `${schedules.length} jadwal tersedia saat ini` : 'Jadwal akan diinformasikan sesuai pembukaan kelas.',
    },
  ];

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="detail-spinner"></div>
        <p>Memuat detail kurikulum & regulasi layanan...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="course-detail-notfound">
        <h2>Layanan Tidak Ditemukan</h2>
        <p>Program layanan yang Anda cari mungkin sudah ditutup atau tidak aktif.</p>
        <Link to="/" className="btn-back-home">&larr; Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      {/* Breadcrumb */}
      <div className="course-breadcrumb-bar">
        <div className="detail-container">
          <nav className="breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="sep">&rsaquo;</span>
            <span className="sep">Layanan & Program</span>
            <span className="sep">&rsaquo;</span>
            <span className="current">{service.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="course-hero-header">
        <div className="detail-container">
          <div className="course-hero-grid">
            <div className="course-hero-info">
              <div className="course-badges">
                <span className="badge-division">LBI FIB UI Program</span>
                <span className="badge-open">Pendaftaran Term II/2026</span>
              </div>

              <h1 className="course-title">{service.title}</h1>
              <p className="course-batch-subtitle">
                Diselenggarakan langsung oleh Lembaga Bahasa Internasional Fakultas Ilmu Pengetahuan Budaya Universitas Indonesia.
              </p>

              <div className="course-meta-pills">
                <div className="meta-pill">
                  <i className="ti ti-certificate" />
                  <div>
                    <label>Sertifikasi</label>
                    <span>Sertifikat Resmi UI</span>
                  </div>
                </div>

                <div className="meta-pill">
                  <i className="ti ti-users" />
                  <div>
                    <label>Pengajar</label>
                    <span>Dosen & Praktisi Ahli UI</span>
                  </div>
                </div>

                <div className="meta-pill">
                  <i className="ti ti-map-pin" />
                  <div>
                    <label>Kampus</label>
                    <span>FIB UI Depok / Salemba / Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="course-price-card">
              <div className="price-tag-wrap">
                <span className="price-label">Program Unggulan LBI:</span>
                <div className="price-amount">Pendaftaran Dibuka</div>
                <span className="price-inclusive">
                  *Tersedia berbagai pilihan batch jadwal kelas luring dan daring
                </span>
              </div>

              <div className="price-cta-actions">
                <button
                  className="btn-enroll-primary"
                  onClick={() => {
                    const firstSched = schedules[0];
                    if (firstSched) {
                      handleEnrollSchedule(firstSched.id);
                    } else {
                      const title = String(service?.title || '').toLowerCase();
                      const program = title.includes('bipa') ? 'bipa' : title.includes('terjemah') || title.includes('penjurubahasaan') ? 'ppp' : 'ppb';
                      navigate(`/pendaftaran?program=${program}`);
                    }
                  }}
                >
                  <i className="ti ti-calendar-plus" />
                  <span>Pilih Jadwal & Daftar</span>
                </button>

                {!isAuthenticated && (
                  <p className="auth-helper-note">
                    <i className="ti ti-info-circle" /> Anda akan diminta login atau membuat akun peserta terlebih dahulu untuk memilih jadwal dan melacak verifikasi pembayaran.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="course-body-section">
        <div className="detail-container">
          <div className="course-nav-tabs">
            <button
              className={`course-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="ti ti-info-circle" /> Deskripsi Program
            </button>
            <button
              className={`course-tab-btn ${activeTab === "regulations" ? "active" : ""}`}
              onClick={() => setActiveTab("regulations")}
            >
              <i className="ti ti-gavel" /> Regulasi & Ketentuan
            </button>
            <button
              className={`course-tab-btn ${activeTab === "schedules" ? "active" : ""}`}
              onClick={() => setActiveTab("schedules")}
            >
              <i className="ti ti-clock" /> Pilihan Jadwal Batch ({schedules.length})
            </button>
          </div>

          <div className="course-tab-content">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card">
                  <h3>Tentang {service.title}</h3>
                  {service.body ? (
                    <div
                      className="lead-text"
                      dangerouslySetInnerHTML={{ __html: service.body }}
                    />
                  ) : (
                    <p className="lead-text">
                      Informasi detail untuk <strong>{service.title}</strong> mengikuti data layanan yang tersedia di sistem LBI FIB UI. Silakan cek jadwal yang tersedia untuk melihat pembukaan kelas terbaru.
                    </p>
                  )}

                  <div className="features-grid">
                    {quickFacts.map((fact) => (
                      <div key={fact.title} className="feature-item">
                        <div className="feature-icon">{fact.icon}</div>
                        <div>
                          <h4>{fact.title}</h4>
                          <p>{fact.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REGULATIONS */}
            {activeTab === "regulations" && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card regulations-card">
                  <h3>Regulasi & Tata Tertib Pendaftaran Peserta</h3>
                  <p className="reg-subtitle">
                    Harap membaca dan menyetujui seluruh ketentuan akademik berikut sebelum melakukan pendaftaran:
                  </p>

                  <div className="regulations-list">
                    <div className="reg-item">
                      <span className="reg-num">1</span>
                      <div>
                        <h4>Ketentuan Akun & Data Pribadi</h4>
                        <p>
                          Peserta wajib mendaftar menggunakan nama lengkap sesuai kartu identitas resmi (KTP/SIM/Paspor). Nama ini akan dicetak secara permanen di sertifikat kelulusan.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">2</span>
                      <div>
                        <h4>Prosedur Pembayaran & Konfirmasi</h4>
                        <p>
                          Pembayaran dilakukan via transfer bank resmi Universitas Indonesia (BNI/Mandiri). Bukti transfer wajib diunggah ke <strong>Dashboard Peserta</strong> maksimal 1x24 jam setelah mendaftar.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">3</span>
                      <div>
                        <h4>Syarat Kehadiran Minimal (75%)</h4>
                        <p>
                          Kehadiran minimal 75% dari total pertemuan dan penyelesaian ujian evaluasi akhir adalah syarat mutlak untuk memperoleh sertifikat resmi.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">4</span>
                      <div>
                        <h4>Ketentuan Non-Refundable & Postpone</h4>
                        <p>
                          Biaya kursus yang telah disetorkan tidak dapat dikembalikan. Pengajuan penundaan kelas (postpone) ke term berikutnya harus diajukan minimal 7 hari kerja sebelum kelas dimulai.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="agreement-banner">
                    <i className="ti ti-shield-check" />
                    <span>
                      Dengan mendaftar, Anda menyatakan telah memahami dan mematuhi seluruh regulasi yang berlaku di lingkungan LBI FIB UI.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULES */}
            {activeTab === "schedules" && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card">
                  <h3>Jadwal Batch yang Dibuka</h3>
                  <p>Pilih jadwal yang sesuai dengan waktu luang Anda:</p>

                  <div className="schedules-table-wrap">
                    <table className="schedules-table">
                      <thead>
                        <tr>
                          <th>Program / Batch</th>
                          <th>Hari & Waktu</th>
                          <th>Format</th>
                          <th>Lokasi</th>
                          <th>Sisa Kuota</th>
                          <th>Biaya</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <strong>{s.program_name}</strong>
                              <div className="sub-batch">{s.batch || "Batch Reguler"}</div>
                            </td>
                            <td>{s.schedule_text || "-"}</td>
                            <td>
                              <span className={`format-pill ${s.format}`}>
                                {s.format === "online" ? "Online" : "Offline"}
                              </span>
                            </td>
                            <td>{s.location || "FIB UI Depok"}</td>
                            <td>{Math.max(0, s.capacity - s.registered)} / {s.capacity}</td>
                            <td><strong>{s.fee_display || `Rp ${parseInt(s.fee).toLocaleString("id-ID")}`}</strong></td>
                            <td>
                              <div className="schedule-actions">
                                <button
                                  className="btn-select-sched"
                                  onClick={() => handleEnrollSchedule(s.id)}
                                >
                                  Daftar Jadwal Ini
                                </button>
                                {s.course_catalog?.slug && (
                                  <Link
                                    className="btn-course-details"
                                    to={`/courses/catalog/${s.course_catalog.slug}`}
                                  >
                                    Detail kursus
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        redirectNote={`Masuk atau buat akun untuk melanjutkan pendaftaran kelas ${service.title}.`}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
