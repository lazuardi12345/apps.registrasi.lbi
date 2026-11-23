import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PaginationControls from './PaginationControls';
import api from '../../services/api';

const formatFee = (fee) => `Rp ${Number(fee || 0).toLocaleString('id-ID')}`;

const getRegistrationPayments = (enrollment) => (enrollment.payments || [])
  .filter((payment) => !payment.payment_for || payment.payment_for === 'registration');

const getVerifiedRegistrationPayment = (enrollment) => getRegistrationPayments(enrollment)
  .filter((payment) => ['verified', 'paid'].includes(String(payment.status || '').toLowerCase()))
  .sort((left, right) =>
    String(right.verified_at || right.created_at || '').localeCompare(String(left.verified_at || left.created_at || ''))
  )[0];

const getEnrollmentPaymentState = (enrollment) => {
  const status = String(enrollment.status || '').toLowerCase();
  const chargeAmount = Number(enrollment.registration_fee || 0);
  const linkedPayments = getRegistrationPayments(enrollment);
  const hasVerifiedPayment = linkedPayments.some((payment) =>
    ['verified', 'paid'].includes(String(payment.status || '').toLowerCase())
  );
  if (hasVerifiedPayment) {
    return { registrationPaid: true, pending: true, chooseSchedule: false, needsPayment: false, label: 'Registrasi lunas · menunggu proses' };
  }
  if (status === 'schedule_selection') return { registrationPaid: false, pending: false, chooseSchedule: true, needsPayment: false, label: 'Pilih jadwal' };

  if (linkedPayments.some((payment) => String(payment.status || '').toLowerCase() === 'pending')) {
    return { registrationPaid: false, pending: true, chooseSchedule: false, needsPayment: false, label: 'Menunggu verifikasi' };
  }
  if (linkedPayments.some((payment) => String(payment.status || '').toLowerCase() === 'rejected')) {
    return { registrationPaid: false, pending: false, chooseSchedule: false, needsPayment: chargeAmount > 0, label: 'Pembayaran ditolak' };
  }
  if (['awaiting_level', 'awaiting_test_result'].includes(status) && chargeAmount === 0) {
    return { registrationPaid: false, pending: true, chooseSchedule: false, needsPayment: false, label: 'Menunggu penetapan level' };
  }
  return { registrationPaid: false, pending: false, chooseSchedule: false, needsPayment: chargeAmount > 0, label: chargeAmount > 0 ? 'Belum dibayar' : 'Menunggu penetapan level' };
};

const getLocation = (location) => ({
  depok: 'Depok',
  salemba: 'Salemba',
  online: 'Daring',
}[String(location || '').toLowerCase()] || location || '-');

export default function RegistrationsTab({
  enrollments,
  pagination,
  loading,
  error,
  onPageChange,
  onPaymentSelect,
  onTabChange,
  getStatusBadge,
  onRefresh,
}) {
  const registrationEnrollments = enrollments;
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [scheduleEnrollment, setScheduleEnrollment] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const openSchedulePicker = async (enrollment) => {
    setScheduleEnrollment(enrollment);
    setAvailableSchedules([]);
    setScheduleError('');
    setScheduleLoading(true);
    try {
      const response = await api.getAvailableEnrollmentSchedules(enrollment.id);
      if (response?.success) setAvailableSchedules(Array.isArray(response.data) ? response.data : response.data?.data || []);
      else setScheduleError(response?.message || 'Jadwal untuk level ini belum tersedia.');
    } catch (error) {
      setScheduleError(error.message || 'Gagal memuat jadwal level.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSelectSchedule = async (schedule) => {
    setScheduleSaving(true);
    setScheduleError('');
    try {
      const response = await api.selectEnrollmentSchedule(scheduleEnrollment.id, schedule.id);
      if (!response?.success) throw new Error(response?.message || 'Gagal menyimpan jadwal.');
      setScheduleEnrollment(null);
      await onRefresh?.();
      onPaymentSelect(response.data);
    } catch (error) {
      setScheduleError(error.message || 'Gagal menyimpan jadwal.');
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <section className="tab-section">
      <div className="section-header">
        <div>
          <h2>Registrasi Saya</h2>
          <p>Riwayat seluruh pendaftaran dan status pembayaran biaya registrasi, termasuk pendaftaran yang sudah lanjut ke tahap kursus.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading">Memuat riwayat registrasi...</div>
      ) : error ? (
        <div className="dashboard-data-error" role="alert">{error}</div>
      ) : registrationEnrollments.length === 0 ? (
        <div className="empty-state-card">
          <h3>Belum Ada Registrasi</h3>
          <p>Pendaftaran yang Anda kirim akan tersimpan di sini sebagai riwayat registrasi.</p>
          <Link className="btn-secondary-action" to="/">Lihat program di halaman utama</Link>
        </div>
      ) : (
        <div className="registration-table-wrap" style={{ width: '100%', overflowX: 'auto', border: '1px solid #dbe2ea', borderRadius: '6px', background: '#fff' }}>
          <table className="registration-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569' }}>
                {['No. Registrasi', 'Program / Kursus', 'Biaya Registrasi', 'Lokasi', 'Status Registrasi', 'Status Pembayaran Registrasi', 'Aksi'].map((heading) => (
                  <th key={heading} scope="col" style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #dbe2ea', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrationEnrollments.map((enrollment) => {
                const paymentState = getEnrollmentPaymentState(enrollment);
                const verifiedPayment = getVerifiedRegistrationPayment(enrollment);
                const isRejected = ['rejected', 'placement_test_failed'].includes(String(enrollment.status || '').toLowerCase());
                const division = String(enrollment.division || '').toLowerCase();
                const chooseScheduleInCourses = division.startsWith('ppb') || division === 'ppp';
                const registrationAmount = verifiedPayment?.amount ?? enrollment.registration_fee;
                return (
                  <tr key={enrollment.id}>
                    <td data-label="No. Registrasi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6', whiteSpace: 'nowrap', color: '#475569' }}>{enrollment.registration_number || `#${enrollment.id}`}</td>
                    <td data-label="Program / Kursus" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6' }}>
                      <strong style={{ display: 'block', color: '#172b4d' }}>{enrollment.course_name}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{enrollment.division?.toUpperCase()} · {enrollment.level_name || 'Reguler'} · {enrollment.term_period || '-'}</span>
                    </td>
                    <td data-label="Biaya Registrasi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6', whiteSpace: 'nowrap' }}>
                      {formatFee(registrationAmount)}
                      {verifiedPayment && <small style={{ display: 'block', color: '#15803d' }}>Nominal terverifikasi</small>}
                    </td>
                    <td data-label="Lokasi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6' }}>{getLocation(enrollment.campus_location)}</td>
                    <td data-label="Status Registrasi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6' }}>{getStatusBadge(enrollment.status)}</td>
                    <td data-label="Status Pembayaran Registrasi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6', whiteSpace: 'nowrap' }}>
                        <span className={`status-badge ${paymentState.registrationPaid ? 'status-active' : paymentState.pending ? 'status-waiting' : isRejected ? 'status-rejected' : 'status-pending'}`}>
                        {isRejected && !paymentState.registrationPaid ? 'Registrasi ditolak' : paymentState.label}
                      </span>
                    </td>
                    <td data-label="Aksi" style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #eef2f6', whiteSpace: 'nowrap' }}>
                      <div className="registration-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button type="button" className="btn-secondary-action" onClick={() => setSelectedRegistration(enrollment)}>Detail Form</button>
                        {enrollment.course_schedule_id ? (
                          <Link className="btn-secondary-action" to={`/courses/${enrollment.course_schedule_id}`}>Detail Kursus</Link>
                        ) : null}
                        {paymentState.chooseSchedule ? (
                          <button
                            type="button"
                            className="btn-primary-action"
                            onClick={() => chooseScheduleInCourses ? onTabChange('courses') : openSchedulePicker(enrollment)}
                          >
                            {chooseScheduleInCourses ? 'Pilih Jadwal di Kursus Saya' : 'Pilih Jadwal'}
                          </button>
                        ) : paymentState.registrationPaid ? (
                          <button type="button" className="btn-secondary-action" onClick={() => onTabChange('courses')}>Lihat di Kursus Saya</button>
                        ) : paymentState.pending ? (
                          <span style={{ color: '#64748b' }}>{paymentState.label}</span>
                        ) : paymentState.needsPayment && !isRejected ? (
                          <button type="button" className="btn-pay-now" onClick={() => onPaymentSelect(enrollment)}>Bayar sekarang</button>
                        ) : <span style={{ color: '#64748b' }}>Hubungi admin</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && registrationEnrollments.length > 0 && (
        <PaginationControls meta={pagination} onPageChange={onPageChange} label="registrasi" />
      )}

      {selectedRegistration && (
        <div role="presentation" onClick={() => setSelectedRegistration(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.55)' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="registration-detail-title" onClick={(event) => event.stopPropagation()} style={{ width: 'min(760px, 100%)', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #dbe2ea', borderRadius: '6px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'start', paddingBottom: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 id="registration-detail-title" style={{ margin: 0, color: '#172b4d' }}>Detail Form Registrasi</h3>
                <p style={{ margin: '0.3rem 0 0', color: '#64748b' }}>{selectedRegistration.registration_number || `#${selectedRegistration.id}`}</p>
              </div>
              <button type="button" onClick={() => setSelectedRegistration(null)} aria-label="Tutup detail" style={{ border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', padding: '0.35rem 0.6rem', cursor: 'pointer' }}>Tutup</button>
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem 1.25rem', margin: '1rem 0 0' }}>
              {[
                ['Nama', selectedRegistration.student_name],
                ['Email', selectedRegistration.student_email],
                ['Telepon', selectedRegistration.student_phone],
                ['Kursus', selectedRegistration.course_name],
                ['Level', selectedRegistration.level_name],
                ['Term', selectedRegistration.term_period],
                ['Jadwal', selectedRegistration.schedule_days],
                ['Lokasi', getLocation(selectedRegistration.campus_location)],
                ['Jalur', selectedRegistration.registration_track === 'placement_test' ? 'Tes Penempatan' : 'Tanpa Tes'],
                ['Tanggal tes', selectedRegistration.metadata?.test_date],
                ['Sesi tes', selectedRegistration.metadata?.test_session],
                ['Kewarganegaraan', selectedRegistration.metadata?.nationality?.toUpperCase()],
                ['Jenis identitas', selectedRegistration.metadata?.identity_type?.toUpperCase()],
                ['Nomor identitas', selectedRegistration.metadata?.identity_number],
                ['Nomor KITAS', selectedRegistration.metadata?.kitas_number],
                ['Nomor paspor', selectedRegistration.metadata?.passport_number],
                ['Nomor darurat', selectedRegistration.metadata?.emergency_phone],
                ['Sumber informasi', selectedRegistration.metadata?.information_sources?.join(', ')],
                ['Tempat lahir', selectedRegistration.metadata?.profile?.birth_place],
                ['Tanggal lahir', selectedRegistration.metadata?.profile?.birth_date],
                ['Jenis kelamin', selectedRegistration.metadata?.profile?.gender],
                ['Pendidikan', selectedRegistration.metadata?.profile?.education],
                ['Pekerjaan', selectedRegistration.metadata?.profile?.occupation],
                ['Alamat', selectedRegistration.metadata?.profile?.address],
                ['Keringanan diminta', selectedRegistration.metadata?.relief_requested ? 'Ya' : 'Tidak'],
                ['Status kelulusan', selectedRegistration.completion_status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt style={{ color: '#64748b', fontSize: '0.8rem' }}>{label}</dt>
                  <dd style={{ margin: '0.2rem 0 0', color: '#172b4d', fontWeight: 600 }}>{value || '-'}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}

      {scheduleEnrollment && (
        <div role="presentation" onClick={() => !scheduleSaving && setScheduleEnrollment(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.55)' }}>
          <section role="dialog" aria-modal="true" aria-labelledby="level-schedules-title" onClick={(event) => event.stopPropagation()} style={{ width: 'min(760px, 100%)', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #dbe2ea', borderRadius: '6px', background: '#fff' }}>
            <h3 id="level-schedules-title" style={{ margin: '0 0 0.35rem', color: '#172b4d' }}>Pilih Jadwal {scheduleEnrollment.level_name}</h3>
            <p style={{ margin: '0 0 1rem', color: '#64748b' }}>{scheduleEnrollment.course_name}. Jadwal, lokasi, format, dan biaya mengikuti kelas pada level yang sudah ditetapkan.</p>
            {scheduleError && <p role="alert" style={{ color: '#b91c1c' }}>{scheduleError}</p>}
            {scheduleLoading ? <p role="status">Memuat jadwal level...</p> : availableSchedules.length === 0 ? <p role="status">Belum ada jadwal aktif untuk level ini.</p> : (
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {availableSchedules.map((schedule) => (
                  <article key={schedule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.9rem', border: '1px solid #dbe2ea', borderRadius: '5px' }}>
                    <div>
                      <strong style={{ color: '#172b4d' }}>{schedule.course_level?.name || schedule.level || schedule.program_name}</strong>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{schedule.schedule_day?.name || schedule.schedule_text} · {schedule.schedule_time?.time_range || ''}</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{schedule.learning_format?.name || schedule.format} · {schedule.class_location?.name || schedule.location}</div>
                      <strong style={{ display: 'block', marginTop: '0.25rem' }}>{schedule.fee_configured ? formatFee(schedule.fee) : 'Tarif belum diatur'}</strong>
                    </div>
                    <button type="button" className="btn-primary-action" disabled={scheduleSaving || !schedule.fee_configured} onClick={() => handleSelectSchedule(schedule)} title={!schedule.fee_configured ? 'Admin perlu mengatur tarif tuition di Master Tarif' : undefined}>{scheduleSaving ? 'Menyimpan...' : schedule.fee_configured ? 'Pilih & lanjut bayar' : 'Tarif belum tersedia'}</button>
                  </article>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setScheduleEnrollment(null)} disabled={scheduleSaving} className="btn-secondary-action" style={{ marginTop: '1rem' }}>Tutup</button>
          </section>
        </div>
      )}
    </section>
  );
}