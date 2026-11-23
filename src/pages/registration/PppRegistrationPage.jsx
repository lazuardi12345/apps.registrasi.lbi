import React from 'react';
import { Link } from 'react-router-dom';
import { usePppRegistration } from '../../hooks/usePppRegistration';

export default function PppRegistrationPage() {
  const {
    user,
    isAuthenticated,
    terms,
    selectedTermId,
    selectedTerm,
    courseCatalogs,
    selectedCourseCatalogId,
    courseCatalogIdParam,
    courseNameParam,
    feeAmount,
    loading,
    submitting,
    successData,
    errorMsg,
    copied,
    setCopied,
    form,
    setForm,
    handleTermChange,
    handleCourseCatalogChange,
    handleSubmit
  } = usePppRegistration();

  return (
    <div className="ppp-registration-page" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Beranda</Link> &rsaquo;{' '}
        <Link to="/pendaftaran" style={{ color: '#2563eb', textDecoration: 'none' }}>Pendaftaran</Link> &rsaquo;{' '}
        <span style={{ fontWeight: 600 }}>Layanan PPP (Penerjemahan & Tes Bahasa)</span>
      </nav>

      {successData ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto',
          border: '1px solid #dbe2ea'
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Pendaftaran Layanan PPP Berhasil!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Permohonan layanan Program Pengembangan Pembinaan Bahasa (PPP) Anda telah resmi dicatat dalam sistem.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Nomor Registrasi:</span>
                <strong style={{ fontSize: '1.35rem', color: '#7c3aed', letterSpacing: '0.5px' }}>
                  {successData.registration_number || `#${successData.id}`}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(successData.registration_number || String(successData.id));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 3000);
                }}
                style={{
                  background: copied ? '#ecfdf5' : '#ffffff',
                  color: copied ? '#059669' : '#475569',
                  border: `1px solid ${copied ? '#a7f3d0' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                {copied ? '✓ Tersalin' : '📋 Salin No. Registrasi'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Nama Pemohon:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.student_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Email Terdaftar:</span>
              <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{successData.student_email || form.student_email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Layanan / Program:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.course_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Periode / Term:</span>
              <strong style={{ color: '#7c3aed', fontSize: '0.95rem' }}>{successData.term_period || successData.term?.name || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Total Biaya Layanan:</span>
              <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                Rp {parseInt(successData.registration_fee || 0).toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Info callout for Dashboard access */}
          <div style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>💡</span>
            <div style={{ fontSize: '0.875rem', color: '#6b21a8', lineHeight: '1.5' }}>
              <strong>Hasil registrasi dapat dipantau di Portal Peserta!</strong>
              <div style={{ color: '#581c87', marginTop: '0.25rem' }}>
                {isAuthenticated
                  ? 'Anda sedang login. Klik tombol di bawah untuk langsung memantau status layanan di Dashboard Anda.'
                  : `Anda dapat memantau status verifikasi dan tagihan kapan saja di Dashboard Peserta menggunakan akun email: ${successData.student_email || form.student_email}.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/konfirmasi-pembayaran?enrollment_id=${encodeURIComponent(successData.registration_number || successData.id)}&email=${encodeURIComponent(successData.student_email || '')}&amount=${encodeURIComponent(successData.registration_fee || (feeAmount || 250000))}&name=${encodeURIComponent(successData.student_name || '')}`}
              style={{
                background: '#7c3aed',
                color: '#fff',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
              }}
            >
              Lanjut Konfirmasi Pembayaran &rarr;
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard?tab=registrations' : `/login?redirect=${encodeURIComponent('/dashboard?tab=registrations')}&email=${encodeURIComponent(successData.student_email || form.student_email || '')}`}
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              📊 Lihat Hasil di Dashboard Peserta
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🖨️ Cetak Bukti
            </button>
          </div>
        </div>
      ) : (
        <div className="registration-form-card" style={{ background: '#ffffff', border: '1px solid #dbe2ea', borderRadius: '6px', padding: '2rem' }}>
          {/* Header Title */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontWeight: 700, fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Divisi PPP (Layanan Tes & Penerjemahan)
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              Formulir Pendaftaran Layanan PPP
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Pendaftaran tes kemahiran bahasa (EPT, TOEFL Preparation, IELTS), jasa penerjemahan dokumen tersumpah, dan pelatihan bahasa instansi.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Pilihan Term PPP */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    1. Pilih Periode Pelaksanaan (Term PPP)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    Pilih periode jadwal tes atau pengerjaan layanan PPP.
                  </p>
                </div>
                {selectedTerm && (
                  <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600 }}>
                    {selectedTerm.is_current ? '🟢 Term Aktif PPP' : '🟣 Periode Terbuka'}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {terms.map((t) => (
                  <label
                    key={t.id}
                    onClick={() => handleTermChange(t.id)}
                    style={{
                      display: 'block',
                      border: selectedTermId === t.id ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                      background: selectedTermId === t.id ? '#f5f3ff' : '#ffffff',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: selectedTermId === t.id ? '#6d28d9' : '#1e293b' }}>
                        {t.name}
                      </span>
                      <input
                        type="radio"
                        name="ppp_term"
                        checked={selectedTermId === t.id}
                        onChange={() => handleTermChange(t.id)}
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      <div>Pendaftaran: {t.reg_open_display || 'Buka'} - {t.reg_close_display || 'TBA'}</div>
                      <div>Periode: {t.start_date_display || '-'} s/d {t.end_date_display || '-'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 2: Layanan & Jadwal Tes */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                2. Spesifikasi Layanan ({selectedTerm?.name || 'Term Terpilih'})
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Program / Kursus</label>
                {courseCatalogIdParam ? (
                  <input readOnly value={courseCatalogs.find((catalog) => String(catalog.id) === String(selectedCourseCatalogId))?.title || courseNameParam || form.course_name} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
                ) : (
                  <select value={selectedCourseCatalogId} onChange={(event) => handleCourseCatalogChange(event.target.value)} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="">Layanan PPP umum</option>
                    {courseCatalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>{catalog.title}</option>)}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Jenis Layanan PPP *
                  </label>
                  <select
                    value={form.service_type}
                    onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  >
                    <option value="ept_toefl">Tes Kemahiran Bahasa (EPT / TOEFL Prediction)</option>
                    <option value="translation">Jasa Penerjemahan Dokumen Resmi / Akademik</option>
                    <option value="interpreting">Jasa Penjurubahasaan (Interpreting Simultan/Konsekutif)</option>
                    <option value="in_house_training">Pelatihan Bahasa Instansi / In-House Training</option>
                    <option value="special_test">Tes Bahasa Khusus</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Tujuan Penggunaan *
                  </label>
                  <select
                    value={form.service_purpose}
                    onChange={(e) => setForm({ ...form, service_purpose: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  >
                    <option value="graduation_ui">Persyaratan Kelulusan / Sidang UI</option>
                    <option value="job_application">Melamar Pekerjaan / Seleksi BUMN / CPNS</option>
                    <option value="scholarship">Persyaratan Beasiswa Dalam/Luar Negeri</option>
                    <option value="legal">Keperluan Legal / Bisnis Resmi</option>
                  </select>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Jadwal dan biaya layanan dikonfirmasi sesuai kebutuhan pemohon.</p>
            </div>

            {(form.service_type === 'ept_toefl' || form.service_type === 'special_test') && (
              <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.05rem' }}>Data dan Preferensi Tes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <label>Nomor Identitas *<input required value={form.identity_number} onChange={(event) => setForm({ ...form, identity_number: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Tanggal Lahir *<input type="date" required value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Preferensi Tanggal Tes *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.test_date_preference} onChange={(event) => setForm({ ...form, test_date_preference: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Lokasi Tes *<select value={form.test_location} onChange={(event) => setForm({ ...form, test_location: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="depok">Depok</option><option value="salemba">Salemba</option></select></label>
                </div>
              </section>
            )}

            {(form.service_type === 'translation' || form.service_type === 'interpreting') && (
              <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.05rem' }}>Rincian Dokumen / Layanan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <label>Bahasa Sumber *<input required value={form.document_language_from} onChange={(event) => setForm({ ...form, document_language_from: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Bahasa Tujuan *<input required value={form.document_language_to} onChange={(event) => setForm({ ...form, document_language_to: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Jenis Dokumen / Layanan *<input required value={form.document_type} onChange={(event) => setForm({ ...form, document_type: event.target.value })} placeholder="Ijazah, akta, kontrak, atau jenis interpreting" style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Jumlah Halaman / Dokumen *<input type="number" min="1" required value={form.document_count} onChange={(event) => setForm({ ...form, document_count: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Batas Waktu *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.deadline_date} onChange={(event) => setForm({ ...form, deadline_date: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                </div>
              </section>
            )}

            {form.service_type === 'in_house_training' && (
              <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#1e293b', fontSize: '1.05rem' }}>Kebutuhan Pelatihan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <label>Jumlah Peserta *<input type="number" min="1" required value={form.participant_count} onChange={(event) => setForm({ ...form, participant_count: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                  <label>Lokasi Kampus *<select value={form.campus_location} onChange={(event) => setForm({ ...form, campus_location: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="depok">Depok</option><option value="salemba">Salemba</option></select></label>
                  <label>Batas Waktu *<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.deadline_date} onChange={(event) => setForm({ ...form, deadline_date: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                </div>
              </section>
            )}

            {/* Step 3: Identitas Pemohon */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                3. Identitas Pemohon / Instansi
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    placeholder="Contoh: Sarah Anindya"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Email Aktif *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.student_email}
                    onChange={(e) => setForm({ ...form, student_email: e.target.value })}
                    placeholder="nama@email.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.student_phone}
                    onChange={(e) => setForm({ ...form, student_phone: e.target.value })}
                    placeholder="08123456789"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Kategori Pemohon *
                  </label>
                  <select
                    required
                    value={form.applicant_category}
                    onChange={(event) => setForm({ ...form, applicant_category: event.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  >
                    <option value="individual">Perorangan</option>
                    <option value="corporate">Perusahaan</option>
                    <option value="institution">Instansi / Lembaga</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nama Instansi / Perusahaan {form.applicant_category !== 'individual' ? '*' : '(Opsional)'}
                  </label>
                  <input
                    type="text"
                    required={form.applicant_category !== 'individual'}
                    value={form.organization_name}
                    onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                    placeholder="PT / Kementerian / Universitas"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', margin: '0 0 1.5rem', color: '#334155', fontWeight: 600 }}>
              <input type="checkbox" required checked={form.terms_accepted} onChange={(event) => setForm({ ...form, terms_accepted: event.target.checked })} />
              <span>Saya menyetujui syarat dan ketentuan layanan PPP.</span>
            </label>

            {/* Submit Bar */}
            <div style={{ background: '#f8fafc', border: '2px solid #7c3aed', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Biaya Registrasi PPP ({selectedTerm?.name || 'PPP'})</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
                  Rp {Number(feeAmount !== null ? feeAmount : 250000).toLocaleString('id-ID')}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#94a3b8' : '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.25)'
                }}
              >
                {submitting ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran PPP &rarr;'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
