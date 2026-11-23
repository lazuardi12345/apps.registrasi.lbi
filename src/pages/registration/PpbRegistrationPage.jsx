// src/pages/registration/PpbRegistrationPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { usePpbRegistration } from '../../hooks/usePpbRegistration';
import { INFORMATION_SOURCES, REGISTRATION_TERMS_ID } from '../../constants/registrationData';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function PpbRegistrationPage({ showTrackSelector = true }) {
  const {
    form,
    setForm,
    registrationTrack,
    setRegistrationTrack,
    terms,
    selectedTermId,
    selectedTerm,
    courseCatalogs,
    selectedCourseCatalog,
    selectedCourseCatalogId,
    selectedCourseName,
    courseCatalogIdParam,
    courseNameParam,
    termIdParam,
    feeAmount,
    feeLoading,
    loading,
    submitting,
    successData,
    validationErrors,
    showValidationModal,
    setShowValidationModal,
    copied,
    setCopied,
    testLanguage,
    setTestLanguage,
    testDate,
    setTestDate,
    identityFiles,
    setIdentityFiles,
    isEnglishCourse,
    isNonEnglishCourse,
    detectedLanguage,
    finalFee,
    pageFormTitle,
    pageFormSubtitle,
    pageFormBadge,
    switchTrack,
    handleStudentCategoryType,
    handleCourseCatalogChange,
    handleTermChange,
    handleStudentTypeChange,
    handleAutofillFromProfile,
    handleSubmit,
    searchParams,
    isAuthenticated,
    user
  } = usePpbRegistration({ showTrackSelector });

  return (
    <div className="ppb-registration-page" style={{ maxWidth: '1360px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {showValidationModal && (
        <div
          onClick={() => setShowValidationModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.58)' }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ppb-validation-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(520px, 100%)', maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem', borderRadius: '14px', background: '#fff', boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)' }}
          >
            <h2 id="ppb-validation-title" style={{ margin: '0 0 0.5rem', color: '#991b1b', fontSize: '1.25rem', fontWeight: 800 }}>Periksa kembali data pendaftaran</h2>
            <p style={{ margin: '0 0 1rem', color: '#475569', fontSize: '0.9rem' }}>Ada kolom isian yang belum lengkap atau belum valid:</p>
            <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.25rem', color: '#7f1d1d', fontSize: '0.875rem' }}>
              {validationErrors.map((message, index) => <li key={`${message}-${index}`} style={{ marginBottom: '0.5rem' }}>{message}</li>)}
            </ul>
            <button
              type="button"
              autoFocus
              onClick={() => setShowValidationModal(false)}
              style={{ border: 0, borderRadius: '8px', padding: '0.75rem 1.5rem', color: '#fff', background: '#2757A4', fontWeight: 700, cursor: 'pointer' }}
            >
              Lengkapi Data
            </button>
          </section>
        </div>
      )}

      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: '#2757A4', textDecoration: 'none', fontWeight: 600 }}>Beranda</Link> &rsaquo;{' '}
        <Link to="/pendaftaran" style={{ color: '#2757A4', textDecoration: 'none', fontWeight: 600 }}>Pendaftaran</Link> &rsaquo;{' '}
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{pageFormTitle}</span>
      </nav>

      {successData ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem',
          border: '1px solid #dbe2ea',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            {registrationTrack === 'placement_test' ? 'Pendaftaran Tes Penempatan Berhasil!' : 'Pendaftaran Kelas PPB Berhasil!'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            {registrationTrack === 'placement_test'
              ? 'Data registrasi Anda telah tercatat. Setelah biaya registrasi diverifikasi, Anda dapat mengikuti tes penempatan dan menunggu penetapan level.'
              : 'Pendaftaran kelas kursus PPB Anda telah resmi tercatat. Anda dapat melihat hasil registrasi ini di Portal Peserta kapan saja.'}
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Nomor Registrasi:</span>
                <strong style={{ fontSize: '1.35rem', color: '#2563eb', letterSpacing: '0.5px' }}>
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
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Nama Peserta:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.student_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Email Terdaftar:</span>
              <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{successData.student_email || form.student_email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Jalur Pendaftaran:</span>
              <strong style={{ color: registrationTrack === 'placement_test' ? '#d97706' : '#2563eb', fontSize: '0.9rem' }}>
                {registrationTrack === 'placement_test' ? '📝 Jalur Tes Penempatan (Placement Test)' : '🎓 Jalur Kelas Langsung (Tanpa Tes)'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Program / Kursus:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.course_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Periode / Term:</span>
              <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{successData.term_period || successData.term?.name || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>
                Biaya Registrasi:
              </span>
              <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                Rp {parseInt(successData.registration_fee || 0).toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Notice khusus token tes penempatan di-hide dan akan dikirim via email */}
          {registrationTrack === 'placement_test' && (
            <div style={{
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.35rem', lineHeight: '1' }}>🔑</span>
              <div>
                <strong style={{ color: '#92400e', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                  Serial Number & Tautan Tes Penempatan (Placement Test)
                </strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                  Nomor serial ujian dan tautan tes penempatan Anda telah disiapkan oleh sistem. Demi keamanan dan validitas lisensi, nomor serial dan instruksi pelaksanaan tes akan dikirimkan secara resmi ke email <strong>{successData.student_email || form.student_email}</strong> setelah pembayaran biaya pendaftaran Anda terverifikasi lunas.
                </p>
              </div>
            </div>
          )}

          {/* Info callout for Dashboard access */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>💡</span>
            <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
              <strong>Hasil registrasi dapat dipantau di Portal Peserta!</strong>
              <div style={{ color: '#1e3a8a', marginTop: '0.25rem' }}>
                {isAuthenticated
                  ? 'Anda sedang masuk. Klik tombol di bawah untuk langsung memantau status, verifikasi, atau memilih jadwal kelas di Dashboard Anda.'
                  : `Anda dapat memantau status verifikasi, tagihan, dan pengumuman kelas kapan saja di Dashboard Peserta menggunakan akun email: ${successData.student_email || form.student_email}.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/konfirmasi-pembayaran?enrollment_id=${encodeURIComponent(successData.registration_number || successData.id)}&email=${encodeURIComponent(successData.student_email || '')}&amount=${encodeURIComponent(successData.registration_fee || finalFee)}&name=${encodeURIComponent(successData.student_name || '')}`}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
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
        <div className="registration-form-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          {/* Header Title Dynamic */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
              <div style={{ display: 'inline-block', background: isEnglishCourse ? '#E1EFFA' : isNonEnglishCourse ? '#fef3c7' : '#dbeafe', color: isEnglishCourse ? '#2757A4' : isNonEnglishCourse ? '#92400e' : '#1d4ed8', fontWeight: 800, fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {pageFormBadge}
              </div>
              {selectedCourseName && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  📖 Kursus: {selectedCourseName}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.5rem', letterSpacing: '-0.02em' }}>
              {pageFormTitle}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.975rem', margin: 0, lineHeight: 1.6, maxWidth: '900px' }}>
              {pageFormSubtitle}
            </p>

            {/* Stepper Visual Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px dashed #e2e8f0' }}>
              {[
                { step: '1', title: 'Program & Term', desc: 'Pilihan periode kursus', active: true },
                { step: '2', title: 'Jalur & Lokasi', desc: isEnglishCourse ? 'Tes Penempatan / Langsung' : 'Tanpa Tes / Tes Pilihan', active: true },
                { step: '3', title: 'Data Diri Peserta', desc: 'Identitas, kontak & berkas', active: true },
                { step: '4', title: 'Biaya & Verifikasi', desc: 'Konfirmasi pendaftaran', active: true },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2757A4', color: '#fff', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showTrackSelector && <>
          {/* KHUSUS BAHASA INGGRIS: PILIHAN PESERTA BARU VS SISWA LANJUTAN */}
          {isEnglishCourse && (
            <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  KATEGORI CALON PESERTA BAHASA INGGRIS *
                </label>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: form.student_type === 'lanjutan' ? '#047857' : '#1e40af', background: form.student_type === 'lanjutan' ? '#dcfce7' : '#dbeafe', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {form.student_type === 'lanjutan' ? 'Siswa Lanjutan (Lanjut Level)' : 'Peserta Baru: Wajib Tes'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                <div
                  onClick={() => handleStudentCategoryType('baru')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: form.student_type !== 'lanjutan' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: form.student_type !== 'lanjutan' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="english_student_type_choice"
                    checked={form.student_type !== 'lanjutan'}
                    onChange={() => handleStudentCategoryType('baru')}
                  />
                  <div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a' }}>
                      👤 Calon Peserta Baru (Wajib Tes Penempatan)
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Seluruh peserta baru Bahasa Inggris wajib mengikuti Tes Penempatan untuk menentukan level kelas yang tepat.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleStudentCategoryType('lanjutan')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: form.student_type === 'lanjutan' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: form.student_type === 'lanjutan' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="english_student_type_choice"
                    checked={form.student_type === 'lanjutan'}
                    onChange={() => handleStudentCategoryType('lanjutan')}
                  />
                  <div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a' }}>
                      🎓 Siswa Lanjutan (Lanjut Level Sebelumnya)
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Khusus peserta yang telah lulus level sebelumnya di LBI FIB UI dan ingin melanjutkan tanpa tes penempatan lagi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TWO DISTINCT TRACK SELECTORS */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              PILIH JALUR PENDAFTARAN & PEMBAYARAN PPB:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: (isEnglishCourse && form.student_type !== 'lanjutan') ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {/* Option 1: Placement Test */}
              <div
                onClick={() => switchTrack('placement_test')}
                style={{
                  border: registrationTrack === 'placement_test' ? '2px solid #d97706' : '1px solid #cbd5e1',
                  background: registrationTrack === 'placement_test' ? '#fffbeb' : '#ffffff',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📝</span>
                    <strong style={{ fontSize: '1.05rem', color: registrationTrack === 'placement_test' ? '#b45309' : '#1e293b' }}>
                      Jalur Tes Penempatan (Placement Test)
                    </strong>
                  </div>
                  <input
                    type="radio"
                    name="reg_track_choice"
                    checked={registrationTrack === 'placement_test'}
                    onChange={() => switchTrack('placement_test')}
                  />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0.75rem 0', lineHeight: 1.5 }}>
                  {isEnglishCourse
                    ? <><strong>Wajib bagi seluruh calon peserta baru Bahasa Inggris</strong> untuk mengukur kemampuan awal dan penempatan level kursus yang akurat.</>
                    : isNonEnglishCourse
                      ? <><strong>Opsional untuk {detectedLanguage}</strong>: Disarankan jika Anda sudah pernah belajar sebelumnya dan ingin langsung masuk level lanjutan.</>
                      : <>Wajib untuk <strong>calon peserta baru</strong> yang belum mengetahui level kemampuannya.</>}
                </p>
                <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                  Biaya Registrasi: {feeAmount === null ? 'belum diatur' : `Rp ${Number(feeAmount).toLocaleString('id-ID')}`}
                </div>
              </div>

              {/* Option 2: No Test (HANYA DITAMPILKAN JIKA BUKAN BAHASA INGGRIS ATAU JIKA SISWA LANJUTAN) */}
              {(!isEnglishCourse || form.student_type === 'lanjutan') && (
                <div
                  onClick={() => switchTrack('no_test')}
                  style={{
                    border: registrationTrack === 'no_test' ? '2px solid #2757A4' : '1px solid #cbd5e1',
                    background: registrationTrack === 'no_test' ? '#E1EFFA' : '#ffffff',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎓</span>
                      <strong style={{ fontSize: '1.05rem', color: registrationTrack === 'no_test' ? '#2757A4' : '#1e293b' }}>
                        Jalur Kelas Langsung (Tanpa Tes)
                      </strong>
                    </div>
                    <input
                      type="radio"
                      name="reg_track_choice"
                      checked={registrationTrack === 'no_test'}
                      onChange={() => switchTrack('no_test')}
                    />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0.75rem 0', lineHeight: 1.5 }}>
                    {isEnglishCourse
                      ? <><strong>Siswa Lanjutan Aktif</strong>: Anda dapat langsung memilih jadwal dan melanjutkan ke level berikutnya tanpa tes penempatan.</>
                      : isNonEnglishCourse
                        ? <><strong>Sangat disarankan untuk Pemula (Level 1) Bahasa {detectedLanguage}</strong>: Langsung mulai dari dasar tanpa perlu tes penempatan.</>
                        : <>Untuk peserta yang levelnya dapat ditetapkan langsung tanpa tes.</>}
                  </p>
                  <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    Biaya registrasi mengikuti tarif aktif
                  </div>
                </div>
              )}
            </div>

            {/* Info Notice ketika jalur tanpa tes disembunyikan untuk peserta baru bahasa Inggris */}
            {isEnglishCourse && form.student_type !== 'lanjutan' && (
              <div style={{ marginTop: '0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.825rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                <span>
                  <strong>Informasi Jalur:</strong> Pilihan <em>"Kelas Langsung (Tanpa Tes)"</em> otomatis disembunyikan karena calon peserta baru Bahasa Inggris wajib mengikuti Tes Penempatan. Jika Anda adalah siswa lanjutan yang telah lulus level sebelumnya di LBI FIB UI, silakan pilih <strong>"Siswa Lanjutan"</strong> pada kategori di atas untuk membuka opsi kelas langsung.
                </span>
              </div>
            )}
          </div>
          </>}

          <form noValidate onSubmit={handleSubmit}>
            {/* Step 1: Pilihan Term Akademik */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    1. Periode / Term Kursus PPB
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    Pilih periode pelaksanaan kursus atau tes penempatan.
                  </p>
                </div>
                {selectedTerm && (
                  <div style={{ background: selectedTerm.is_current ? '#dcfce7' : '#e0f2fe', color: selectedTerm.is_current ? '#166534' : '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600 }}>
                    {selectedTerm.is_current ? '🟢 Term Berjalan Aktif' : '🔵 Periode Terbuka'}
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
                      border: selectedTermId === t.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedTermId === t.id ? '#eff6ff' : '#ffffff',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: selectedTermId === t.id ? '#1d4ed8' : '#1e293b' }}>
                        {t.name}
                      </span>
                      <input
                        type="radio"
                        name="term_selection"
                        checked={selectedTermId === t.id}
                        onChange={() => handleTermChange(t.id)}
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      <div>Pendaftaran: {t.reg_open_display || 'TBA'} - {t.reg_close_display || 'TBA'}</div>
                      <div>Kelas: {t.start_date_display || '-'} s/d {t.end_date_display || '-'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <section style={{ background: '#fff', border: '1px solid #dbe2ea', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.75rem', color: '#172b4d', fontSize: '1.05rem' }}>Program / Bahasa yang Dipilih</h3>
              {courseCatalogIdParam && selectedCourseCatalog ? (
                <input readOnly value={selectedCourseCatalog.title} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              ) : (
                <select required value={selectedCourseCatalogId} onChange={(event) => handleCourseCatalogChange(event.target.value)} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">-- Pilih program atau bahasa --</option>
                  {courseCatalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>{catalog.title}</option>)}
                </select>
              )}
            </section>

            <section style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>Preferensi Lokasi Kursus *</h3>
              <p style={{ margin: '0 0 0.85rem', color: '#64748b', fontSize: '0.85rem' }}>
                Pilihan ini berlaku untuk kedua jalur. Jadwal kelas, format, dan hari belajar akan dipilih saat penetapan level dan pembayaran kursus.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', maxWidth: '560px' }}>
                {['depok', 'salemba'].map((campus) => (
                  <label key={campus} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.85rem 1.25rem', border: form.campus_location === campus ? '2px solid #2757A4' : '1px solid #cbd5e1', borderRadius: '10px', background: form.campus_location === campus ? '#E1EFFA' : '#fff', cursor: 'pointer', fontWeight: form.campus_location === campus ? 700 : 500, color: form.campus_location === campus ? '#2757A4' : '#334155' }}>
                    <input type="radio" name="campus_location" value={campus} checked={form.campus_location === campus} onChange={() => setForm((previous) => ({ ...previous, campus_location: campus }))} required />
                    <span>{campus === 'depok' ? 'Kampus Depok' : 'Kampus Salemba'}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Step 2: DYNAMIC SPECIFICATION BASED ON TRACK */}
            {registrationTrack === 'placement_test' ? (
              /* TRACK A: PLACEMENT TEST SPECIFICATIONS */
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
                  2. Konfigurasi Tes Penempatan (Placement Test)
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1.25rem' }}>
                  Tes penempatan bertujuan untuk mengukur kemampuan bahasa Anda agar dapat ditempatkan pada level kelas yang tepat.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      Tanggal Tes Penempatan *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', borderLeft: '4px solid #d97706' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    💡 Alur Pendaftaran Jalur Tes Penempatan:
                  </div>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
                    <li>Kirim formulir ini dan bayar biaya registrasi sebesar <strong>{feeAmount === null ? 'sesuai tarif aktif' : `Rp ${Number(feeAmount).toLocaleString('id-ID')}`}.</strong></li>
                    <li>Ikuti tes penempatan pada tanggal yang dipilih; informasi pelaksanaan dikirimkan melalui email.</li>
                    <li>Hasil level keluar (misal: <em>General English Level 3</em>).</li>
                    <li>Anda memilih jadwal kelas reguler dan hanya membayar biaya kursus level tersebut.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.35rem' }}>2. Penetapan Level</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Level ditetapkan sesuai jalur peserta. Jadwal, hari, jam, format, lokasi, dan biaya kursus dipilih setelah level tersedia.</p>
              </div>
            )}

            {/* Step 3: Identitas Peserta */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  3. Identitas & Kontak Peserta
                </h3>

                {isAuthenticated && user && (
                  <button
                    type="button"
                    onClick={handleAutofillFromProfile}
                    style={{
                      background: '#E1EFFA',
                      color: '#2757A4',
                      border: '1.5px solid #2757A4',
                      borderRadius: '8px',
                      padding: '0.45rem 0.95rem',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ✨ Ambil Data dari Profil Akun
                  </button>
                )}
              </div>

              {/* Profile Sync Alert Banner */}
              {isAuthenticated && user ? (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👤</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
                        Terhubung dengan Akun: {user?.profile?.full_name || user?.name} ({user?.email})
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#3b82f6' }}>
                        Formulir otomatis terisi dari data profil akun Anda. Anda tetap dapat mengedit jika ada perubahan data.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    💡 <strong>Sudah punya akun peserta LBI?</strong> Masuk ke akun Anda agar identitas otomatis diambil dari profil tanpa mengetik ulang.
                  </div>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                    style={{ background: '#2757A4', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.825rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Masuk Akun →
                  </Link>
                </div>
              )}

              <div style={{ maxWidth: '420px', marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Kewarganegaraan *</label>
                <select required value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}>
                  <option value="wni">WNI</option>
                  <option value="wna">WNA</option>
                </select>
              </div>

              {form.nationality === 'wni' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label>Jenis Identitas *</label>
                    <select required value={form.identity_type} onChange={(event) => setForm({ ...form, identity_type: event.target.value })}>
                      <option value="ktp">KTP</option><option value="sim">SIM</option><option value="kia">KIA</option><option value="student_card">Kartu Pelajar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nomor Identitas *</label>
                    <input required value={form.identity_number} onChange={(event) => setForm({ ...form, identity_number: event.target.value })} placeholder="Nomor KTP / SIM / Pelajar" />
                  </div>
                  <div className="form-group">
                    <label>Unggah Dokumen Identitas (PDF/JPG/PNG - Opsional)</label>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,.jpg,.jpeg,.png,.pdf" onChange={(event) => setIdentityFiles((files) => ({ ...files, identity_document: event.target.files?.[0] || null }))} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label>Nomor KITAS</label>
                    <input value={form.kitas_number} onChange={(event) => setForm({ ...form, kitas_number: event.target.value })} placeholder="Nomor KITAS jika ada" />
                  </div>
                  <div className="form-group">
                    <label>Unggah KITAS (PDF/JPG/PNG - Opsional)</label>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,.jpg,.jpeg,.png,.pdf" onChange={(event) => setIdentityFiles((files) => ({ ...files, kitas_document: event.target.files?.[0] || null }))} />
                  </div>
                  <div className="form-group">
                    <label>Nomor Paspor *</label>
                    <input required value={form.passport_number} onChange={(event) => setForm({ ...form, passport_number: event.target.value })} placeholder="Nomor Paspor Resmi" />
                  </div>
                  <div className="form-group">
                    <label>Unggah Paspor (PDF/JPG/PNG - Opsional)</label>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,.jpg,.jpeg,.png,.pdf" onChange={(event) => setIdentityFiles((files) => ({ ...files, passport_document: event.target.files?.[0] || null }))} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nama Lengkap (Sesuai KTP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
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
                    No. WhatsApp / Telepon *
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
                    Nomor Darurat *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.emergency_phone}
                    onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
                    placeholder="Nomor keluarga yang dapat dihubungi"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Tempat Lahir</label><input value={form.birth_place} onChange={(e) => setForm({ ...form, birth_place: e.target.value })} placeholder="Kota kelahiran" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Tanggal Lahir</label><input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Jenis Kelamin</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="">-- Pilih --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Pendidikan</label><input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="Pendidikan terakhir" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Pekerjaan</label><input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Pekerjaan saat ini" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Alamat Lengkap</label><textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat domisili lengkap" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} /></div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Mendapatkan informasi LBI dari mana? *</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.35rem 1rem' }}>
                  {INFORMATION_SOURCES.map((source) => (
                    <label key={source} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
                      <input type="checkbox" checked={form.information_sources.includes(source)} onChange={(event) => setForm((previous) => ({ ...previous, information_sources: event.target.checked ? [...previous.information_sources, source] : previous.information_sources.filter((item) => item !== source) }))} />
                      {source}
                    </label>
                  ))}
                </div>
                {form.information_sources.includes('Lainnya') && <input aria-label="Sumber informasi lainnya" value={form.information_source_other} onChange={(event) => setForm({ ...form, information_source_other: event.target.value })} placeholder="Sebutkan sumber informasi" style={{ width: '100%', maxWidth: '420px', marginTop: '0.65rem', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />}
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#334155', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={form.relief_requested} onChange={(event) => setForm({ ...form, relief_requested: event.target.checked })} />
                <span>Ajukan keringanan biaya (dapat ditinjau peserta dan admin).</span>
              </label>

              <section style={{ background: '#fff', border: '1px solid #dbe2ea', borderRadius: '6px', padding: '1.25rem', marginTop: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.75rem', color: '#172b4d', fontSize: '1.05rem' }}>
                  Syarat dan Ketentuan
                </h3>
                <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem', color: '#334155', fontSize: '0.875rem', lineHeight: 1.55 }}>
                  {REGISTRATION_TERMS_ID.map(([heading, clauses]) => (
                    <section key={heading} style={{ marginBottom: '0.75rem' }}>
                      <strong>{heading}</strong>
                      <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.25rem' }}>
                        {clauses.map((clause) => <li key={clause}>{clause}</li>)}
                      </ul>
                    </section>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0', color: '#172b4d', fontWeight: 600 }}>
                  <input type="checkbox" required checked={form.terms_accepted} onChange={(event) => setForm({ ...form, terms_accepted: event.target.checked })} />
                  <span>Saya telah membaca dan menyetujui Syarat dan Ketentuan. *</span>
                </label>
              </section>

              {/* Status Peserta & Diskon (Hanya relevan untuk Kelas Langsung / No Test) */}
              {registrationTrack === 'no_test' && (
                <div style={{ marginTop: '1rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Kategori Peserta (Untuk Verifikasi Potongan/Diskon Kursus)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { id: 'baru', label: 'Umum / Peserta Baru (0%)' },
                      { id: 'mahasiswa_ui', label: 'Mahasiswa UI (Diskon 25%)' },
                      { id: 'civitas_ui', label: 'Alumni UI (Diskon 25%)' },
                      { id: 'dosen_tendik_ui', label: 'Dosen / Tendik UI (Diskon 50%)' }
                    ].map((cat) => (
                      <label
                        key={cat.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          border: form.student_category === cat.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          background: form.student_category === cat.id ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        <input
                          type="radio"
                          name="student_type"
                          checked={form.student_category === cat.id}
                          onChange={() => handleStudentTypeChange(cat.id)}
                        />
                        <span style={{ fontWeight: form.student_category === cat.id ? 600 : 400 }}>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total Ringkasan Biaya Pembayaran */}
            <div
              style={{
                background: '#f8fafc',
                border: registrationTrack === 'placement_test' ? '2px solid #d97706' : '2px solid #2563eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  {`Biaya Registrasi (${selectedTerm?.name || 'PPB'})`}
                </span>
                <div className={`text-2xl sm:text-3xl font-extrabold ${registrationTrack === 'placement_test' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {feeLoading ? 'Memuat tarif...' : feeAmount === null ? 'Tarif belum diatur' : `Rp ${finalFee.toLocaleString('id-ID')}`}
                </div>
                {registrationTrack === 'placement_test' && (
                  <span className="text-xs text-amber-700 block mt-0.5">
                    *Biaya kursus dibayarkan setelah hasil level tes keluar
                  </span>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || feeLoading}
                className={`font-bold text-base px-8 py-3 rounded-xl shadow-lg transition-all cursor-pointer ${
                  submitting
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : registrationTrack === 'placement_test'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25'
                      : 'bg-[#2757A4] hover:bg-[#1b3d75] text-white shadow-blue-600/25'
                }`}
              >
                {submitting
                  ? 'Memproses Pendaftaran...'
                  : registrationTrack === 'placement_test'
                    ? 'Daftar & Bayar Registrasi →'
                  : 'Kirim Registrasi PPB →'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
