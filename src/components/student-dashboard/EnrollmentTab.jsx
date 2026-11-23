import React from 'react';

export default function EnrollmentTab({
  enrollForm,
  setEnrollForm,
  allSchedules,
  selectedSchedule,
  setSelectedSchedule,
  enrollSuccess,
  enrollError,
  enrollLoading,
  onSubmit,
  onTabChange,
}) {
  return (
    <div className="tab-section animate-fade-in">
      <div className="section-header">
        <div>
          <h2>Pendaftaran Kursus Baru</h2>
          <p>Lengkapi formulir pendaftaran untuk memilih jadwal dan mengamankan kuota Anda.</p>
        </div>
      </div>

      {enrollSuccess ? (
        <div className="enroll-success-box animate-fade-in">
          <div className="success-icon">🎉</div>
          <h3>Pendaftaran Berhasil Dibuat!</h3>
          <p>Nomor Pendaftaran Anda: <strong>#{enrollSuccess.id}</strong> untuk kelas <strong>{enrollSuccess.course_name}</strong>.</p>
          <div className="invoice-summary">
            <p>Total Tagihan: <strong>Rp {parseInt(enrollSuccess.registration_fee || 0).toLocaleString('id-ID')}</strong></p>
            <p>Status: <span className="status-badge status-pending">Menunggu Pembayaran</span></p>
          </div>
          <p className="next-step-instruction">Langkah selanjutnya: Silakan lakukan pembayaran instan melalui Virtual Account BNI atau Xendit Gateway.</p>
          <div className="success-actions">
            <button className="btn-primary-action" onClick={() => onTabChange('payments')}>Bayar via BNI VA / Xendit Sekarang &rarr;</button>
            <button className="btn-secondary-action" onClick={() => onTabChange('courses')}>Lihat Daftar Kursus Saya</button>
          </div>
        </div>
      ) : (
        <div className="enrollment-wizard-grid">
          <div className="wizard-form-card">
            {enrollError && <div className="auth-alert auth-alert-danger"><i className="ti ti-alert-circle" /> {enrollError}</div>}
            <form onSubmit={onSubmit} className="dash-form">
              <div className="form-group">
                <label>Pilih Program & Batch Jadwal <span className="req">*</span></label>
                <select required value={selectedSchedule?.id || ''} onChange={(event) => {
                  const found = allSchedules.find((schedule) => schedule.id === parseInt(event.target.value));
                  setSelectedSchedule(found || null);
                }}>
                  <option value="">-- Pilih Jadwal Kursus --</option>
                  {allSchedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.program_name} ({schedule.batch}) - {schedule.schedule_text || schedule.format} - {schedule.fee_display || `Rp ${parseInt(schedule.fee).toLocaleString('id-ID')}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Lengkap (untuk sertifikat) <span className="req">*</span></label>
                  <input type="text" required value={enrollForm.student_name} onChange={(event) => setEnrollForm({ ...enrollForm, student_name: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email Peserta <span className="req">*</span></label>
                  <input type="email" required readOnly value={enrollForm.student_email} className="input-readonly" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>No. WhatsApp Aktif <span className="req">*</span></label>
                  <input type="tel" required placeholder="Contoh: 08123456789" value={enrollForm.student_phone} onChange={(event) => setEnrollForm({ ...enrollForm, student_phone: event.target.value })} />
                </div>
                <div className="form-group">
                  <label>Kategori Peserta</label>
                  <select value={enrollForm.student_type} onChange={(event) => setEnrollForm({ ...enrollForm, student_type: event.target.value })}>
                    <option value="baru">Peserta Baru</option>
                    <option value="lama">Alumni LBI FIB UI</option>
                    <option value="mahasiswa_ui">Mahasiswa Universitas Indonesia</option>
                    <option value="dosen_tendik_ui">Dosen / Tendik UI</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Pilihan Kampus Pembelajaran</label>
                <select value={enrollForm.campus_location} onChange={(event) => setEnrollForm({ ...enrollForm, campus_location: event.target.value })}>
                  <option value="depok">Kampus UI Depok (Gedung FIB)</option>
                  <option value="salemba">Kampus UI Salemba</option>
                </select>
              </div>
              <div className="regulations-consent-box">
                <label className="checkbox-label">
                  <input type="checkbox" required defaultChecked />
                  <span>Saya menyatakan bahwa data yang diisi adalah benar, dan saya telah membaca serta menyetujui seluruh regulasi pendaftaran di LBI FIB UI.</span>
                </label>
              </div>
              <button type="submit" className="btn-submit-enroll" disabled={enrollLoading || !selectedSchedule}>
                {enrollLoading ? 'Memproses Pendaftaran...' : 'Konfirmasi & Daftarkan Sekarang &rarr;'}
              </button>
            </form>
          </div>

          <div className="wizard-summary-card">
            <h3>Ringkasan Kursus</h3>
            {selectedSchedule ? (
              <div className="summary-body">
                <div className="summary-item"><label>Program:</label><strong>{selectedSchedule.program_name}</strong></div>
                <div className="summary-item"><label>Batch:</label><span>{selectedSchedule.batch || 'Reguler'}</span></div>
                <div className="summary-item"><label>Tingkat / Level:</label><span>{selectedSchedule.level || 'Semua Level'}</span></div>
                <div className="summary-item"><label>Format Belajar:</label><span>{selectedSchedule.format === 'online' ? 'Kelas Online (Zoom)' : 'Kelas Tatap Muka (FIB UI)'}</span></div>
                <div className="summary-item"><label>Jadwal Kelas:</label><span>{selectedSchedule.schedule_text || '-'}</span></div>
                <div className="summary-item"><label>Sisa Kuota:</label><span>{Math.max(0, selectedSchedule.capacity - selectedSchedule.registered)} kursi</span></div>
                <div className="summary-divider" />
                <div className="summary-total"><label>Total Biaya Kursus:</label><span className="total-fee">{selectedSchedule.fee_display || `Rp ${parseInt(selectedSchedule.fee).toLocaleString('id-ID')}`}</span></div>
              </div>
            ) : <p className="no-selection-hint">Silakan pilih jadwal kursus dari dropdown di sebelah kiri untuk melihat rincian biaya dan jadwal kelas.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
