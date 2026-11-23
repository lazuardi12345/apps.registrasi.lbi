// src/pages/CourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AuthModal from '../components/AuthModal';

export default function CourseDetailPage() {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [relatedSchedules, setRelatedSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'regulations' | 'schedules'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = slug
          ? await api.getScheduleBySlug(slug)
          : await api.getScheduleById(id);
        if (res && res.success && res.data) {
          setSchedule(res.data);

          // Also load other schedules in the same division
          if (res.data.division) {
            const relRes = await api.getSchedules(res.data.division, true);
            if (relRes && relRes.success && Array.isArray(relRes.data)) {
              setRelatedSchedules(relRes.data.filter((s) => s.id !== res.data.id));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load schedule detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, slug]);

  const handleEnrollClick = (selectedSchedId) => {
    const targetId = selectedSchedId || schedule?.id;
    const selectedSchedule = [schedule, ...relatedSchedules].find((item) => String(item?.id) === String(targetId));
    const division = String(selectedSchedule?.division || '').toLowerCase();
    const program = division.startsWith('ppb') ? 'ppb' : division === 'bipa' ? 'bipa' : 'ppp';
    const catalogParams = selectedSchedule?.course_catalog_id
      ? `&course_catalog_id=${selectedSchedule.course_catalog_id}&course_name=${encodeURIComponent(selectedSchedule.course_catalog?.title || selectedSchedule.program_name)}`
      : '';
    navigate(`/pendaftaran?program=${program}${catalogParams}`);
  };

  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    handleEnrollClick(schedule?.id);
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="detail-spinner"></div>
        <p>Memuat detail program & regulasi kursus...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="course-detail-notfound">
        <h2>Program Kursus Tidak Ditemukan</h2>
        <p>Jadwal atau program yang Anda cari mungkin sudah ditutup atau tidak aktif.</p>
        <Link to="/" className="btn-back-home">&larr; Kembali ke Beranda</Link>
      </div>
    );
  }

  const divisionLabels = {
    ppb_english: 'Program Pelayanan Bahasa - Bahasa Inggris',
    ppb_foreign: 'Program Pelayanan Bahasa - Bahasa Asing Lain',
    bipa: 'Program Bahasa Indonesia bagi Penutur Asing (BIPA)',
    ppp: 'Program Pengembangan Penerjemahan (PPP)',
    testing: 'Layanan Tes Bahasa Resmi',
  };

  const overviewText = schedule?.notes || schedule?.course_summary || null;
  const overviewHtml = overviewText && /<[^>]+>/.test(overviewText)
    ? { __html: overviewText }
    : null;

  const quickFacts = [
    {
      icon: '📅',
      title: 'Jadwal',
      text: schedule?.schedule_text || 'Jadwal akan diinformasikan sesuai batch yang dibuka.',
    },
    {
      icon: '📍',
      title: 'Lokasi / media',
      text: schedule?.location || 'Ditetapkan sesuai format kelas dan pengaturan program.',
    },
    {
      icon: '🎯',
      title: 'Level',
      text: schedule?.level || 'Semua tingkat',
    },
    {
      icon: '💸',
      title: 'Biaya',
      text: schedule?.fee_display || (schedule?.fee ? `Rp ${parseInt(schedule.fee).toLocaleString('id-ID')}` : 'Hubungi kami'),
    },
  ];

  return (
    <div className="course-detail-page">
      {/* Breadcrumb */}
      <div className="course-breadcrumb-bar">
        <div className="detail-container">
          <nav className="breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="sep">&rsaquo;</span>
            <span className="current">{schedule.program_name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="course-hero-header">
        <div className="detail-container">
          <div className="course-hero-grid">
            <div className="course-hero-info">
              <div className="course-badges">
                <span className="badge-division">
                  {divisionLabels[schedule.division] || schedule.division?.toUpperCase()}
                </span>
                <span className={`badge-format ${schedule.format}`}>
                  {schedule.format === 'online' ? '🌐 Kelas Online' : '🏛️ Kelas Tatap Muka (Offline)'}
                </span>
                {schedule.is_open ? (
                  <span className="badge-open">Pendaftaran Dibuka</span>
                ) : (
                  <span className="badge-closed">Pendaftaran Ditutup</span>
                )}
              </div>

              <h1 className="course-title">{schedule.program_name}</h1>
              <p className="course-batch-subtitle">
                <strong>Batch:</strong> {schedule.batch || 'Reguler Term'} &bull;{' '}
                <strong>Level:</strong> {schedule.level || 'Semua Tingkat'}
              </p>

              <div className="course-meta-pills">
                <div className="meta-pill">
                  <i className="ti ti-calendar-event" />
                  <div>
                    <label>Jadwal Sesi</label>
                    <span>{schedule.schedule_text || 'Sesuai Kalender Akademik'}</span>
                  </div>
                </div>

                <div className="meta-pill">
                  <i className="ti ti-map-pin" />
                  <div>
                    <label>Lokasi / Media</label>
                    <span>{schedule.location || 'FIB UI Depok / Zoom'}</span>
                  </div>
                </div>

                <div className="meta-pill">
                  <i className="ti ti-users" />
                  <div>
                    <label>Sisa Kuota</label>
                    <span>{Math.max(0, schedule.capacity - schedule.registered)} dari {schedule.capacity} kursi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Card Sidebar */}
            <div className="course-price-card">
              <div className="price-tag-wrap">
                <span className="price-label">Biaya Investasi Program:</span>
                <div className="price-amount">
                  {schedule.fee_display ||
                    (parseFloat(schedule.fee) > 0
                      ? `Rp ${parseInt(schedule.fee).toLocaleString('id-ID')}`
                      : 'Hubungi Kami')}
                </div>
                <span className="price-inclusive">*Sudah termasuk modul, uji kompetensi, dan sertifikat resmi LBI FIB UI</span>
              </div>

              <div className="price-cta-actions">
                <button
                  className="btn-enroll-primary"
                  onClick={() => handleEnrollClick(schedule.id)}
                  disabled={!schedule.is_open || schedule.is_full}
                >
                  <i className="ti ti-check" />
                  <span>{schedule.is_open && !schedule.is_full ? 'Daftar Kelas Ini Sekarang' : 'Pendaftaran Ditutup'}</span>
                </button>

                {!isAuthenticated && (
                  <p className="auth-helper-note">
                    <i className="ti ti-info-circle" /> Anda akan diminta login atau membuat akun peserta terlebih dahulu untuk melacak status pembayaran dan sertifikat.
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
              className={`course-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="ti ti-info-circle" /> Deskripsi & Silabus
            </button>
            <button
              className={`course-tab-btn ${activeTab === 'regulations' ? 'active' : ''}`}
              onClick={() => setActiveTab('regulations')}
            >
              <i className="ti ti-gavel" /> Regulasi & Ketentuan Pendaftaran
            </button>
            <button
              className={`course-tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedules')}
            >
              <i className="ti ti-clock" /> Pilihan Jadwal & Batch Lain
            </button>
          </div>

          <div className="course-tab-content">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card">
                  <h3>Tentang Program {schedule.program_name}</h3>
                  {overviewHtml ? (
                    <div className="lead-text" dangerouslySetInnerHTML={overviewHtml} />
                  ) : (
                    <p className="lead-text">
                      Informasi detail program <strong>{schedule.program_name}</strong> mengikuti data yang tersedia di sistem LBI FIB UI untuk batch dan jadwal yang sedang dibuka.
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

                  {schedule.notes && (
                    <div className="notes-box">
                      <h4>Catatan Tambahan:</h4>
                      <p>{schedule.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: REGULATIONS */}
            {activeTab === 'regulations' && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card regulations-card">
                  <h3>Regulasi & Tata Tertib Pendaftaran Peserta</h3>
                  <p className="reg-subtitle">
                    Harap membaca dan memahami ketentuan di bawah ini sebelum melanjutkan pendaftaran kelas di LBI FIB UI:
                  </p>

                  <div className="regulations-list">
                    <div className="reg-item">
                      <span className="reg-num">1</span>
                      <div>
                        <h4>Persyaratan Akun & Identitas Peserta</h4>
                        <p>
                          Setiap peserta wajib mendaftar menggunakan nama lengkap sesuai identitas resmi (KTP/SIM/Paspor) karena akan digunakan secara permanen untuk pencetakan sertifikat kelulusan.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">2</span>
                      <div>
                        <h4>Prosedur Pembayaran & Konfirmasi</h4>
                        <p>
                          Setelah melakukan pendaftaran jadwal, peserta akan menerima nomor tagihan resmi. Pembayaran dilakukan via transfer ke rekening bank resmi Universitas Indonesia. Bukti transfer wajib diunggah melalui <strong>Dashboard Peserta</strong> maksimal 1x24 jam setelah mendaftar untuk mengamankan kursi kuota.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">3</span>
                      <div>
                        <h4>Kehadiran Minimal untuk Kelulusan</h4>
                        <p>
                          Peserta wajib memenuhi minimal <strong>75% kehadiran</strong> dari total sesi pertemuan dan mengikuti ujian akhir/evaluasi untuk dinyatakan lulus dan memperoleh sertifikat.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">4</span>
                      <div>
                        <h4>Kebijakan Penundaan & Pembatalan (Postpone)</h4>
                        <p>
                          Biaya kursus yang telah disetorkan tidak dapat ditarik kembali (non-refundable). Penundaan kelas ke term berikutnya hanya dapat diajukan selambat-lambatnya 7 hari kerja sebelum kelas perdana dimulai dengan persetujuan koordinator program.
                        </p>
                      </div>
                    </div>

                    <div className="reg-item">
                      <span className="reg-num">5</span>
                      <div>
                        <h4>Kuota Minimal Pembukaan Kelas</h4>
                        <p>
                          LBI FIB UI berhak menjadwalkan ulang atau mengalihkan format kelas apabila kuota minimum peserta belum terpenuhi pada batas akhir pendaftaran.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="agreement-banner">
                    <i className="ti ti-shield-check" />
                    <span>
                      Dengan mendaftar program ini, peserta dianggap telah membaca, memahami, dan menyetujui seluruh regulasi yang berlaku di lingkungan LBI FIB UI.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OTHER SCHEDULES */}
            {activeTab === 'schedules' && (
              <div className="tab-pane animate-fade-in">
                <div className="content-card">
                  <h3>Pilihan Jadwal & Batch Lainnya</h3>
                  <p>Pilih jadwal batch yang paling sesuai dengan ketersediaan waktu Anda:</p>

                  <div className="schedules-table-wrap">
                    <table className="schedules-table">
                      <thead>
                        <tr>
                          <th>Program & Batch</th>
                          <th>Hari & Waktu</th>
                          <th>Format</th>
                          <th>Periode Kelas</th>
                          <th>Sisa Kuota</th>
                          <th>Biaya</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Current Schedule */}
                        <tr className="current-row">
                          <td>
                            <strong>{schedule.program_name}</strong>
                            <div className="sub-batch">{schedule.batch} (Sedang Dilihat)</div>
                          </td>
                          <td>{schedule.schedule_text || '-'}</td>
                          <td>
                            <span className={`format-pill ${schedule.format}`}>
                              {schedule.format === 'online' ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td>
                            {schedule.start_date ? `${schedule.start_date} s.d ${schedule.end_date}` : 'Sesuai Kalender'}
                          </td>
                          <td>{Math.max(0, schedule.capacity - schedule.registered)} / {schedule.capacity}</td>
                          <td><strong>{schedule.fee_display || `Rp ${parseInt(schedule.fee).toLocaleString('id-ID')}`}</strong></td>
                          <td>
                            <div className="schedule-actions">
                              <button
                                className="btn-select-sched active"
                                onClick={() => handleEnrollClick(schedule.id)}
                              >
                                Daftar Ini
                              </button>
                              {schedule.course_catalog?.slug && (
                                <Link
                                  className="btn-course-details"
                                  to={`/courses/catalog/${schedule.course_catalog.slug}`}
                                >
                                  Detail kursus
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Related Schedules */}
                        {relatedSchedules.map((rel) => (
                          <tr key={rel.id}>
                            <td>
                              <strong>{rel.program_name}</strong>
                              <div className="sub-batch">{rel.batch || '-'}</div>
                            </td>
                            <td>{rel.schedule_text || '-'}</td>
                            <td>
                              <span className={`format-pill ${rel.format}`}>
                                {rel.format === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </td>
                            <td>
                              {rel.start_date ? `${rel.start_date} s.d ${rel.end_date}` : 'Sesuai Kalender'}
                            </td>
                            <td>{Math.max(0, rel.capacity - rel.registered)} / {rel.capacity}</td>
                            <td><strong>{rel.fee_display || `Rp ${parseInt(rel.fee).toLocaleString('id-ID')}`}</strong></td>
                            <td>
                              <div className="schedule-actions">
                                <button
                                  className="btn-select-sched"
                                  onClick={() => handleEnrollClick(rel.id)}
                                >
                                  Pilih & Daftar
                                </button>
                                {rel.course_catalog?.slug && (
                                  <Link
                                    className="btn-course-details"
                                    to={`/courses/catalog/${rel.course_catalog.slug}`}
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

      {/* Auth Modal Triggered if user isn't logged in */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        redirectNote={`Masuk atau buat akun untuk melanjutkan pendaftaran kelas ${schedule.program_name}.`}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
