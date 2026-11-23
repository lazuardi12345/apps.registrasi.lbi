import React from 'react';
import { Link } from 'react-router-dom';
import { useBipaRegistration } from '../../hooks/useBipaRegistration';

export default function BipaRegistrationPage() {
  const {
    user,
    isAuthenticated,
    terms,
    selectedTermId,
    selectedTerm,
    courseCatalogs,
    availableSchedules,
    documentFiles,
    setDocumentFiles,
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
  } = useBipaRegistration();

  return (
    <div className="bipa-registration-page" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</Link> &rsaquo;{' '}
        <Link to="/pendaftaran" style={{ color: '#2563eb', textDecoration: 'none' }}>Pendaftaran</Link> &rsaquo;{' '}
        <span style={{ fontWeight: 600 }}>BIPA Registration (Bahasa Indonesia untuk Penutur Asing)</span>
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
            Pendaftaran BIPA Berhasil! / Registration Successful!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.75rem', lineHeight: '1.5' }}>
            Your application for the BIPA Program at LBI FIB Universitas Indonesia has been received and saved.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'block' }}>Kode / No. Registrasi:</span>
                <strong style={{ fontSize: '1.35rem', color: '#059669', letterSpacing: '0.5px' }}>
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
                {copied ? '✓ Tersalin' : '📋 Salin Kode'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Nama Lengkap / Name:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.student_name}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Email Terdaftar / Email:</span>
              <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 500 }}>{successData.student_email || form.student_email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Program BIPA:</span>
              <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{successData.course_name} ({successData.level_name || 'BIPA'})</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Periode / Academic Term:</span>
              <strong style={{ color: '#059669', fontSize: '0.95rem' }}>{successData.term_period || successData.term?.name || '-'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Biaya Kursus / Tuition Fee:</span>
              <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                Rp {parseInt(successData.registration_fee || 0).toLocaleString('id-ID')}
              </strong>
            </div>
          </div>

          {/* Info callout for Dashboard access */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.25rem', lineHeight: '1' }}>💡</span>
            <div style={{ fontSize: '0.875rem', color: '#166534', lineHeight: '1.5' }}>
              <strong>Hasil pendaftaran dapat dipantau di Portal Peserta!</strong>
              <div style={{ color: '#14532d', marginTop: '0.25rem' }}>
                {isAuthenticated
                  ? 'Anda sedang login. Klik tombol di bawah untuk langsung memantau status registrasi dan verifikasi di Dashboard Anda.'
                  : `Anda dapat memantau status dan jadwal kelas kapan saja di Dashboard Peserta menggunakan akun email: ${successData.student_email || form.student_email}.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/konfirmasi-pembayaran?enrollment_id=${encodeURIComponent(successData.registration_number || successData.id)}&email=${encodeURIComponent(successData.student_email || '')}&amount=${encodeURIComponent(successData.registration_fee || (feeAmount || 200000))}&name=${encodeURIComponent(successData.student_name || '')}`}
              style={{
                background: '#059669',
                color: '#fff',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
              }}
            >
              Konfirmasi Pembayaran &rarr;
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
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              BIPA Division (Indonesian for Non-Native Speakers)
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
              Formulir Pendaftaran BIPA
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Formulir resmi peserta program Bahasa Indonesia bagi Penutur Asing.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: BIPA Academic Term */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    1. Periode Kursus BIPA
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                    Available intake periods for BIPA regular or intensive programs.
                  </p>
                </div>
                {selectedTerm && (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: 600 }}>
                    {selectedTerm.is_current ? '🟢 Current Active Intake' : '🔵 Open Intake'}
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
                      border: selectedTermId === t.id ? '2px solid #059669' : '1px solid #cbd5e1',
                      background: selectedTermId === t.id ? '#f0fdf4' : '#ffffff',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: selectedTermId === t.id ? '#15803d' : '#1e293b' }}>
                        {t.name}
                      </span>
                      <input
                        type="radio"
                        name="bipa_term"
                        checked={selectedTermId === t.id}
                        onChange={() => handleTermChange(t.id)}
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      <div>Registration: {t.reg_open_display || 'Open'} - {t.reg_close_display || 'TBA'}</div>
                      <div>Program Dates: {t.start_date_display || '-'} to {t.end_date_display || '-'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.75rem' }}>2. Program BIPA</h3>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Program / Kursus *</label>
              {courseCatalogIdParam ? (
                <input readOnly value={courseCatalogs.find((catalog) => String(catalog.id) === String(selectedCourseCatalogId))?.title || courseNameParam || ''} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              ) : (
                <select required value={selectedCourseCatalogId} onChange={(event) => handleCourseCatalogChange(event.target.value)} style={{ width: '100%', maxWidth: '560px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="">-- Pilih Program BIPA --</option>
                  {courseCatalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>{catalog.title}</option>)}
                </select>
              )}
              <p style={{ margin: '0.75rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Level ditetapkan admin sebelum jadwal kelas dan biaya kursus ditampilkan.</p>
              {availableSchedules.length > 0 && (
                <fieldset style={{ border: 0, padding: 0, margin: '1rem 0 0' }}>
                  <legend style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Jadwal Kelas (Opsional)</legend>
                  {availableSchedules.map((schedule) => (
                    <label key={schedule.id} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', padding: '0.75rem', border: String(form.course_schedule_id) === String(schedule.id) ? '2px solid #059669' : '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', marginBottom: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="bipa_schedule" checked={String(form.course_schedule_id) === String(schedule.id)} onChange={() => {
                        const locationText = `${schedule.class_location?.name || ''} ${schedule.location || ''}`.toLowerCase();
                        setForm((previous) => ({ ...previous, course_schedule_id: schedule.id, campus_location: locationText.includes('salemba') ? 'salemba' : 'depok', schedule_days: schedule.schedule_day?.name || schedule.schedule_text || '', schedule_time: schedule.schedule_time?.time_range || '', learning_mode: schedule.learning_format?.code || schedule.format || 'luring' }));
                      }} />
                      <span>{schedule.class_location?.name || schedule.location || 'Lokasi'} · {schedule.schedule_day?.name || schedule.schedule_text || 'Jadwal'} {schedule.schedule_time?.time_range || ''} ({schedule.learning_format?.name || schedule.format || 'Format belum ditentukan'})</span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>

            {/* Step 3: International Participant Information */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                3. Data Peserta
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nama Lengkap (sesuai paspor) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.student_name}
                    onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                    placeholder="e.g. Johnathan Smith"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.student_email}
                    onChange={(e) => setForm({ ...form, student_email: e.target.value })}
                    placeholder="name@email.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    WhatsApp / Phone (Include Country Code) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.student_phone}
                    onChange={(e) => setForm({ ...form, student_phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Nationality / Citizenship *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                    placeholder="e.g. Japan, Australia, Germany"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Passport Number / KITAS *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.passport_number}
                    onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
                    placeholder="e.g. A12345678"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    Native Language (Bahasa Ibu)
                  </label>
                  <input
                    type="text"
                    value={form.native_language}
                    onChange={(e) => setForm({ ...form, native_language: e.target.value })}
                    placeholder="e.g. English, Japanese, French"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>

            <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#1e293b' }}>Data Peserta dan Dokumen</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <label>Tempat Lahir<input value={form.birth_place} onChange={(event) => setForm({ ...form, birth_place: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Tanggal Lahir<input type="date" value={form.birth_date} onChange={(event) => setForm({ ...form, birth_date: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Jenis Kelamin<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
                <label>Pendidikan Terakhir<input value={form.education} onChange={(event) => setForm({ ...form, education: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Pekerjaan<input value={form.occupation} onChange={(event) => setForm({ ...form, occupation: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Nomor Kontak Darurat<input value={form.emergency_contact} onChange={(event) => setForm({ ...form, emergency_contact: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Tujuan Belajar<input value={form.purpose_of_study} onChange={(event) => setForm({ ...form, purpose_of_study: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                <label>Sumber Informasi LBI<input value={form.information_source} onChange={(event) => setForm({ ...form, information_source: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>
                {form.visa_type === 'student_kitas' && <label>Nomor KITAS *<input required value={form.kitas_number} onChange={(event) => setForm({ ...form, kitas_number: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} /></label>}
                <label style={{ gridColumn: '1 / -1' }}>Alamat di Indonesia<textarea rows={2} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} style={{ display: 'block', width: '100%', marginTop: '0.4rem', padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'inherit' }} /></label>
                <label>Pas Foto *<input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" required onChange={(event) => setDocumentFiles((files) => ({ ...files, photo: event.target.files?.[0] || null }))} /></label>
                <label>Salinan Paspor *<input type="file" accept="application/pdf,image/jpeg,image/png,.jpg,.jpeg,.png,.pdf" required onChange={(event) => setDocumentFiles((files) => ({ ...files, passport: event.target.files?.[0] || null }))} /></label>
                <label>Surat Sponsor / Beasiswa<input type="file" accept="application/pdf,image/jpeg,image/png,.jpg,.jpeg,.png,.pdf" onChange={(event) => setDocumentFiles((files) => ({ ...files, sponsor: event.target.files?.[0] || null }))} /></label>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginTop: '1rem', color: '#334155', fontWeight: 600 }}><input type="checkbox" required checked={form.terms_accepted} onChange={(event) => setForm({ ...form, terms_accepted: event.target.checked })} /><span>Saya menyetujui syarat dan ketentuan program BIPA.</span></label>
            </section>

            {/* Submit Bar */}
            <div style={{ background: '#f8fafc', border: '2px solid #059669', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Biaya Registrasi BIPA ({selectedTerm?.name || 'Term Aktif'})</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                    Rp {Number(feeAmount !== null ? feeAmount : 200000).toLocaleString('id-ID')}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#94a3b8' : '#059669',
                  color: '#fff',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
                }}
              >
                {submitting ? 'Submitting Application...' : 'Submit BIPA Registration &rarr;'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
