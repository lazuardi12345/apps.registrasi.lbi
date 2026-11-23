import React, { useState } from 'react';
import studentService from '../../services/studentService';

export default function EnrollmentWorkflowModal({
  enrollment,
  actionType, // 'continue' | 'postpone' | 'transfer'
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState('');
  const [targetDivision, setTargetDivision] = useState('ppb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!enrollment || !actionType) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (actionType === 'continue') {
        res = await studentService.continueEnrollment(enrollment.id);
      } else if (actionType === 'postpone') {
        if (!reason || reason.trim().length < 10) {
          setError('Alasan penundaan minimal 10 karakter.');
          setLoading(false);
          return;
        }
        res = await studentService.postponeEnrollment(enrollment.id, reason.trim());
      } else if (actionType === 'transfer') {
        res = await studentService.transferEnrollment(enrollment.id, {
          target_division: targetDivision,
          reason: reason.trim() || undefined,
        });
      }

      if (res && res.success) {
        onSuccess(res.message || 'Aksi berhasil diproses.');
        onClose();
      } else {
        setError(res?.message || 'Gagal memproses permintaan.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (actionType === 'continue') return 'Lanjutkan Kursus';
    if (actionType === 'postpone') return 'Ajukan Penundaan Kursus';
    if (actionType === 'transfer') return 'Pindah Divisi / Program Kursus';
    return 'Aksi Kursus';
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="modal-container" style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        animation: 'modalSlideIn 0.25s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.875rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          color: '#334155',
        }}>
          <div><strong>Kursus:</strong> {enrollment.course_name}</div>
          <div><strong>No. Registrasi:</strong> {enrollment.registration_number || `#${enrollment.id}`}</div>
          <div><strong>Status Saat Ini:</strong> {enrollment.status}</div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {actionType === 'continue' && (
            <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin melanjutkan kursus ini kembali ke status aktif? Pendaftaran Anda akan diproses untuk periode kelas mendatang.
            </p>
          )}

          {actionType === 'postpone' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Alasan Penundaan <span style={{ color: '#dc2626' }}>* (min. 10 karakter)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Jadwal bentrok dengan ujian skripsi semester ini, mohon ditunda ke term depan."
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          )}

          {actionType === 'transfer' && (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Pilih Program / Divisi Tujuan <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={targetDivision}
                  onChange={(e) => setTargetDivision(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="ppb">PPB (Program Pengembangan Bahasa - English)</option>
                  <option value="ppb_foreign">PPB Asing (Bahasa Asing Lainnya: Jepang, Mandarin, dll.)</option>
                  <option value="ppp">PPP (Pelatihan & Pengembangan Penerjemahan)</option>
                  <option value="bipa">BIPA (Bahasa Indonesia untuk Penutur Asing)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Alasan Pemindahan (Opsional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Ingin pindah fokus ke pelatihan penerjemahan dokumen hukum."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                background: actionType === 'postpone' ? '#e11d48' : '#2563eb',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? 'Memproses...' : 'Konfirmasi & Kirim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
