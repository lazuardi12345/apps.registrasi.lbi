import React, { useState } from 'react';
import EnrollmentWorkflowModal from './EnrollmentWorkflowModal';
import PaginationControls from './PaginationControls';
import api from '../../services/api';

const formatFee = (fee) => `Rp ${Number(fee || 0).toLocaleString('id-ID')}`;
const isPpbOrPpp = (enrollment) => {
  const division = String(enrollment.division || '').toLowerCase();
  return division.startsWith('ppb') || division === 'ppp';
};
const isEnabled = (value) => value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';

export default function CoursesTab({
  user,
  enrollments,
  pagination,
  loading,
  error,
  onPageChange,
  onTabChange,
  onPaymentSelect,
  getStatusBadge,
  onRefresh,
}) {
  const [activeModal, setActiveModal] = useState(null); // { enrollment, actionType }
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scheduleEnrollment, setScheduleEnrollment] = useState(null);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const handleActionSuccess = (msg) => {
    setFeedbackMessage(msg);
    if (onRefresh) onRefresh();
    setTimeout(() => setFeedbackMessage(''), 5000);
  };

  const openSchedulePicker = async (enrollment) => {
    setScheduleEnrollment(enrollment);
    setAvailableSchedules([]);
    setScheduleError('');
    setScheduleLoading(true);
    try {
      const response = await api.getAvailableEnrollmentSchedules(enrollment.id);
      if (!response?.success) {
        throw new Error(response?.message || 'Jadwal untuk level ini belum tersedia.');
      }
      setAvailableSchedules(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      setScheduleError(error.message || 'Gagal memuat jadwal level.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleSelectSchedule = async (schedule) => {
    if (!scheduleEnrollment) return;
    setScheduleSaving(true);
    setScheduleError('');
    try {
      const response = await api.selectEnrollmentSchedule(scheduleEnrollment.id, schedule.id);
      if (!response?.success) {
        throw new Error(response?.message || 'Gagal menyimpan jadwal.');
      }
      setScheduleEnrollment(null);
      await onRefresh?.();
      onPaymentSelect(response.data);
    } catch (error) {
      setScheduleError(error.message || 'Gagal menyimpan jadwal.');
    } finally {
      setScheduleSaving(false);
    }
  };

  const getCompletionBadge = (status) => {
    if (!status) return null;
    const isLulus = status.toLowerCase().includes('lulus') && !status.toLowerCase().includes('tidak');
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: isLulus ? '#ecfdf5' : '#fef2f2',
          color: isLulus ? '#059669' : '#dc2626',
          border: `1px solid ${isLulus ? '#a7f3d0' : '#fecaca'}`,
        }}
      >
        <i className={isLulus ? 'ti ti-award' : 'ti ti-alert-circle'} />
        {status}
      </span>
    );
  };

  return (
    <div className="tab-section animate-fade-in">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '0.875rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
        }}>
          <i className="ti ti-check" /> {feedbackMessage}
        </div>
      )}

      <div className="section-header">
        <div>
          <h2>Kursus Saya</h2>
          <p>Daftar kelas dan program pelatihan yang Anda daftarkan di LBI FIB UI.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-loading">Memuat daftar kursus Anda...</div>
      ) : error ? (
        <div className="dashboard-data-error" role="alert">{error}</div>
      ) : enrollments.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">🎓</div>
          <h3>Belum Ada Kursus Terdaftar</h3>
          <p>Anda belum memiliki pendaftaran kursus aktif saat ini.</p>
        </div>
      ) : (
        <div className="enrollments-grid">
          {enrollments.map((enrollment) => {
            const enrollmentStatus = String(enrollment.status || '').toLowerCase();
            const isPendingPayment = ['pending', 'pending_payment'].includes(enrollmentStatus);
            const isPostponed = enrollmentStatus === 'postponed';
            const isRejected = enrollmentStatus === 'rejected';
            const isActive = ['paid', 'active', 'verified', 'approved'].includes(enrollmentStatus);
            const isPpbPpp = isPpbOrPpp(enrollment);
            const canPostpone = isPpbPpp
              ? ['approved', 'confirmed', 'pending_payment', 'paid'].includes(enrollmentStatus)
              : isActive;
            const adminWorkflow = enrollment.metadata?.admin_workflow || {};
            const reliefRequested = isEnabled(enrollment.metadata?.relief_requested) || isEnabled(adminWorkflow.relief_requested);
            const reliefApproved = isEnabled(adminWorkflow.relief_approved);

            return (
              <div key={enrollment.id} className="enrollment-card">
                <div className="enr-header">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="enr-division">{enrollment.division?.toUpperCase()}</span>
                    {getCompletionBadge(enrollment.completion_status)}
                  </div>
                  {getStatusBadge(enrollment.status)}
                </div>

                <h3 className="enr-title">{enrollment.course_name}</h3>
                <p className="enr-period">
                  <strong>Term:</strong> {enrollment.term_period || '-'} &bull; <strong>Level:</strong> {isPpbPpp ? enrollment.level_name || (enrollment.status === 'awaiting_level' ? 'Menunggu penetapan admin' : 'Belum ditetapkan') : enrollment.level_name || 'Reguler'}
                </p>
                  {enrollment.submitted_at && (
                    <p className="enr-period"><strong>Tanggal daftar:</strong> {new Date(enrollment.submitted_at).toLocaleDateString('id-ID')}</p>
                  )}

                <div className="enr-details-list">
                  {isPpbPpp && (
                    <div className="enr-detail-item">
                      <i className="ti ti-user-check" />
                      <span>Jenis peserta: {enrollment.student_type || 'Baru'}</span>
                    </div>
                  )}
                  <div className="enr-detail-item">
                    <i className="ti ti-user" />
                    <span>{enrollment.student_name || user?.name || '-'}</span>
                  </div>
                  <div className="enr-detail-item">
                    <i className="ti ti-mail" />
                    <span>{enrollment.student_email || user?.email || '-'}</span>
                  </div>
                  <div className="enr-detail-item">
                    <i className="ti ti-phone" />
                    <span>{enrollment.student_phone || user?.profile?.phone || 'Nomor telepon belum tersedia'}</span>
                  </div>
                  <div className="enr-detail-item">
                    <i className="ti ti-calendar" />
                    <span>{isPpbPpp
                      ? enrollment.course_schedule_id
                        ? `${enrollment.schedule_days || 'Jadwal kelas'}${enrollment.schedule_time ? ` · ${enrollment.schedule_time}` : ''}`
                        : 'Jadwal belum dipilih'
                      : enrollment.schedule_days || 'Sesuai Jadwal Kelas'}</span>
                  </div>
                  <div className="enr-detail-item">
                    <i className="ti ti-map-pin" />
                    <span>
                      {isPpbPpp
                        ? `${enrollment.campus_location === 'depok' ? 'Depok' : enrollment.campus_location === 'salemba' ? 'Salemba' : enrollment.campus_location || 'Lokasi belum dipilih'} (${enrollment.learning_mode || 'Luring/Daring'})`
                        : `${enrollment.campus_location === 'depok' ? 'Kampus UI Depok' : 'Kampus UI Salemba'} (${enrollment.learning_mode || 'Luring/Daring'})`}
                    </span>
                  </div>
                  <div className="enr-detail-item">
                    <i className="ti ti-coin" />
                    <span>
                      {isPpbPpp && enrollment.course_schedule_id ? 'Biaya kursus' : 'Tagihan'}:{' '}
                      <strong>{formatFee(isPpbPpp && enrollment.course_schedule_id ? enrollment.tuition_fee : enrollment.registration_fee)}</strong>
                    </span>
                  </div>
                  {isPpbPpp && (reliefRequested || Number(enrollment.discount_percent) > 0) && (
                    <div className="enr-detail-item">
                      <i className="ti ti-discount-2" />
                      <span>
                        {reliefApproved
                          ? `Keringanan disetujui · Diskon ${Number(enrollment.discount_percent)}%`
                          : reliefRequested
                            ? 'Keringanan diajukan, menunggu tinjauan admin'
                            : 'Diskon menunggu konfirmasi admin'}
                      </span>
                    </div>
                  )}
                  {isPpbPpp && adminWorkflow.payment_injected_date && (
                    <div className="enr-detail-item">
                      <i className="ti ti-calendar-check" />
                      <span>Tanggal pembayaran dicatat admin: {adminWorkflow.payment_injected_date}</span>
                    </div>
                  )}
                  {enrollment.certificate_path && (
                    <div className="enr-detail-item">
                      <i className="ti ti-certificate" style={{ color: '#059669' }} />
                      <a href={enrollment.certificate_path} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 600 }}>
                        Unduh Sertifikat Kelulusan
                      </a>
                    </div>
                  )}
                  {enrollment.postpone_reason && (
                    <div className="enr-detail-item" style={{ color: '#dc2626' }}>
                      <i className="ti ti-info-circle" />
                      <span>Alasan Penundaan: {enrollment.postpone_reason}</span>
                    </div>
                  )}
                </div>

                <div className="enr-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="enr-id-tag">
                      No. Registrasi: <strong>{enrollment.registration_number || `#${enrollment.id}`}</strong>
                    </span>
                    {isActive && (
                      <span className="status-verified-note"><i className="ti ti-circle-check" /> Terverifikasi</span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
                    {['pending', 'pending_payment', 'placement_test'].includes(enrollmentStatus) && !isRejected && (
                      <button className="btn-pay-now" onClick={() => onPaymentSelect(enrollment)} style={{ flex: 1 }}>
                        <i className="ti ti-credit-card" /> {enrollmentStatus === 'placement_test' ? 'Bayar Biaya Registrasi' : isPpbPpp && enrollment.course_schedule_id ? 'Bayar Kursus' : 'Lanjutkan Pembayaran'}
                      </button>
                    )}

                    {enrollmentStatus === 'schedule_selection' && (
                      <button
                        onClick={() => isPpbPpp ? openSchedulePicker(enrollment) : onTabChange('registrations')}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <i className="ti ti-calendar-plus" /> {isPpbPpp ? 'Pilih Jadwal Kelas' : 'Atur Jadwal'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onTabChange('registrations')}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <i className="ti ti-file-text" /> Detail
                    </button>

                    {isPostponed && (
                      <button
                        onClick={() => setActiveModal({ enrollment, actionType: 'continue' })}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          background: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <i className="ti ti-player-play" /> Lanjutkan Kursus
                      </button>
                    )}

                    {canPostpone && (
                      <button
                        onClick={() => setActiveModal({ enrollment, actionType: 'postpone' })}
                        title="Ajukan penundaan kelas jika berhalangan"
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#fff1f2',
                          color: '#e11d48',
                          border: '1px solid #fecdd3',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <i className="ti ti-player-pause" /> Tunda Kursus
                      </button>
                    )}

                    <button
                      onClick={() => setActiveModal({ enrollment, actionType: 'transfer' })}
                      title="Pindah ke program atau divisi lain"
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <i className="ti ti-arrows-left-right" /> Pindah Kelas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && enrollments.length > 0 && (
        <PaginationControls meta={pagination} onPageChange={onPageChange} label="kursus" />
      )}

      {/* Workflow Modal (Continue / Postpone / Transfer) */}
      {activeModal && (
        <EnrollmentWorkflowModal
          enrollment={activeModal.enrollment}
          actionType={activeModal.actionType}
          onClose={() => setActiveModal(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {scheduleEnrollment && (
        <div
          role="presentation"
          onClick={() => !scheduleSaving && setScheduleEnrollment(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'grid', placeItems: 'center', padding: '1rem', background: 'rgba(15, 23, 42, 0.55)' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-level-schedules-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(760px, 100%)', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #dbe2ea', borderRadius: '8px', background: '#fff' }}
          >
            <h3 id="course-level-schedules-title" style={{ margin: '0 0 0.35rem', color: '#172b4d' }}>
              Pilih Jadwal {scheduleEnrollment.level_name}
            </h3>
            <p style={{ margin: '0 0 1rem', color: '#64748b' }}>
              {scheduleEnrollment.registration_number || `#${scheduleEnrollment.id}`} · {scheduleEnrollment.course_name}. Pilihan hanya menampilkan kelas untuk level yang ditetapkan admin.
            </p>
            {scheduleError && <p role="alert" style={{ color: '#b91c1c' }}>{scheduleError}</p>}
            {scheduleLoading ? (
              <p role="status">Memuat jadwal level...</p>
            ) : availableSchedules.length === 0 ? (
              !scheduleError && <p role="status">Belum ada jadwal aktif untuk level ini.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {availableSchedules.map((schedule) => (
                  <article key={schedule.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.9rem', border: '1px solid #dbe2ea', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ color: '#172b4d' }}>{schedule.course_level?.name || schedule.level || schedule.program_name}</strong>
                      {(schedule.term?.name || schedule.batch) && (
                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                          {schedule.term?.name || schedule.batch}
                        </div>
                      )}
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {schedule.schedule_day?.name || schedule.schedule_text || 'Jadwal belum tersedia'} · {schedule.schedule_time?.time_range || ''}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {schedule.learning_format?.name || schedule.format || 'Format belum tersedia'} · {schedule.class_location?.name || schedule.location || 'Lokasi belum tersedia'}
                      </div>
                      <strong style={{ display: 'block', marginTop: '0.25rem' }}>
                        {schedule.fee_configured ? formatFee(schedule.fee) : 'Tarif belum diatur admin'}
                      </strong>
                      {schedule.fee_configured && Number(schedule.fee_discount_percent) > 0 && (
                        <small style={{ color: '#64748b' }}>
                          Harga normal {formatFee(schedule.fee_before_discount)} · Diskon admin {Number(schedule.fee_discount_percent)}%
                        </small>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-primary-action"
                      disabled={scheduleSaving || !schedule.fee_configured}
                      onClick={() => handleSelectSchedule(schedule)}
                      title={!schedule.fee_configured ? 'Admin perlu mengatur tarif kursus' : undefined}
                    >
                      {scheduleSaving ? 'Menyimpan...' : schedule.fee_configured ? 'Pilih jadwal & lanjut bayar' : 'Tarif belum tersedia'}
                    </button>
                  </article>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setScheduleEnrollment(null)} disabled={scheduleSaving} className="btn-secondary-action" style={{ marginTop: '1rem' }}>
              Tutup
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
