import React, { useState, useMemo } from 'react';
import PaginationControls from './PaginationControls';
import api from '../../services/api';

export default function PaymentsTab({
  user,
  enrollments = [],
  payments = [],
  paymentPagination,
  paymentHistoryLoading,
  paymentHistoryError,
  onPaymentPageChange,
  payForm,
  setPayForm,
  onRefresh,
  getStatusBadge,
  onTabChange,
}) {
  const [paymentMethodTab, setPaymentMethodTab] = useState('bni_va'); // 'bni_va' | 'xendit'
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [copiedVa, setCopiedVa] = useState(false);

  // Xendit Modal & Simulation State
  const [showXenditModal, setShowXenditModal] = useState(false);
  const [xenditSubMethod, setXenditSubMethod] = useState('qris'); // 'qris', 'va_bca', 'va_mandiri', 'ewallet'

  // Helper to determine if a specific charge for an enrollment has already been paid & verified
  const isChargePaid = (enrollment, chargeType) => {
    if (!enrollment) return false;

    // 1. Check verified payments from payments list & enrollment.payments
    const allPayments = [
      ...(Array.isArray(payments) ? payments : []),
      ...(Array.isArray(enrollment?.payments) ? enrollment.payments : [])
    ];

    const hasVerified = allPayments.some((p) => {
      const matchEnrollment =
        String(p.enrollment_id || p.enrollment?.id) === String(enrollment.id) ||
        String(p.account_number || '').includes(String(enrollment.id)) ||
        (enrollment.registration_number && String(p.account_number || '').includes(String(enrollment.registration_number)));

      const pFor = p.payment_for || (Number(p.amount) > 500000 ? 'tuition' : 'registration');
      const matchCharge = chargeType === 'tuition' ? pFor === 'tuition' : pFor !== 'tuition';
      const isVerified = ['verified', 'confirmed', 'paid', 'lunas', 'success', 'approved'].includes(
        String(p.status || '').toLowerCase()
      );

      return matchEnrollment && matchCharge && isVerified;
    });

    if (hasVerified) return true;

    // 2. Check enrollment status fields
    const enrStatus = String(enrollment.status || '').toLowerCase();
    const enrPayStatus = String(enrollment.payment_status || '').toLowerCase();

    // Statuses that mean "this charge is fully paid/approved"
    const PAID_STATUSES = ['paid', 'approved', 'confirmed', 'active', 'lunas', 'verified', 'success'];

    if (chargeType === 'tuition') {
      return PAID_STATUSES.includes(enrPayStatus) || ['confirmed', 'active', 'approved'].includes(enrStatus);
    } else {
      const regStatus = String(enrollment.registration_fee_status || '').toLowerCase();
      return (
        PAID_STATUSES.includes(regStatus) ||
        (['confirmed', 'active', 'approved'].includes(enrStatus) && Boolean(enrollment.course_schedule_id)) ||
        Boolean(enrollment.metadata?.registration_fee_paid)
      );
    }
  };

  // Only list bills that are actually UNPAID (No already-paid bills shown)
  const payableBills = useMemo(() => {
    const list = [];

    (enrollments || []).forEach((enrollment) => {
      const status = String(enrollment.status || '').toLowerCase();
      if (['rejected', 'cancelled'].includes(status)) return;

      const regPaid = isChargePaid(enrollment, 'registration');
      const tuitionPaid = isChargePaid(enrollment, 'tuition');

      // Check registration fee: if NOT paid, registration fee is payable
      if (!regPaid) {
        list.push({
          idKey: `${enrollment.id}-registration`,
          enrollmentId: enrollment.id,
          enrollment,
          chargeType: 'registration',
          chargeName: 'Biaya Registrasi Awal',
          amount: parseInt(enrollment.registration_fee || 160000, 10),
        });
        return; // Don't check tuition until registration is settled
      }

      // If registration fee is paid, check if course tuition is ready to pay
      const hasTuition = Boolean(enrollment.course_schedule_id && Number(enrollment.tuition_fee) > 0);
      if (hasTuition && !tuitionPaid) {
        list.push({
          idKey: `${enrollment.id}-tuition`,
          enrollmentId: enrollment.id,
          enrollment,
          chargeType: 'tuition',
          chargeName: 'Biaya Kursus (Tuition)',
          amount: parseInt(enrollment.tuition_fee || 0, 10),
        });
      }
    });

    return list;
  }, [enrollments, payments]);

  const [selectedBillKey, setSelectedBillKey] = useState('');

  // Selected Bill & Enrollment data
  const currentBill = useMemo(() => {
    if (!payableBills.length) return null;
    if (selectedBillKey) {
      const found = payableBills.find((b) => b.idKey === selectedBillKey);
      if (found) return found;
    }
    if (payForm?.enrollment_id) {
      const matchFor = payForm.payment_for || (Number(payForm.amount) > 500000 ? 'tuition' : 'registration');
      const found = payableBills.find(
        (b) => String(b.enrollment.id) === String(payForm.enrollment_id) && b.chargeType === matchFor
      ) || payableBills.find((b) => String(b.enrollment.id) === String(payForm.enrollment_id));
      if (found) return found;
    }
    return payableBills[0];
  }, [payableBills, selectedBillKey, payForm]);

  const selectedEnrollment = currentBill?.enrollment || null;
  const isTuition = currentBill?.chargeType === 'tuition';
  const cleanAmount = currentBill?.amount || 0;

  const selectedDivision = String(selectedEnrollment?.division || '').toLowerCase();
  const isPpbOrPpp = selectedDivision.startsWith('ppb') || selectedDivision === 'ppp';
  const isCourseTuition = isPpbOrPpp && selectedEnrollment?.course_schedule_id && isTuition;
  const reliefApproved = [true, 1, '1', 'true', 'yes'].includes(selectedEnrollment?.metadata?.admin_workflow?.relief_approved);

  const courseLocation = selectedEnrollment?.campus_location === 'depok'
    ? 'Depok'
    : selectedEnrollment?.campus_location === 'salemba'
      ? 'Salemba'
      : selectedEnrollment?.campus_location || '-';

  const rawId = selectedEnrollment?.id || '1';
  const numericSuffix = String(rawId).replace(/\D/g, '').slice(-8).padStart(8, '0');
  const bniVaNumber = `988127${numericSuffix}`;

  const handleCopyVa = () => {
    navigator.clipboard.writeText(bniVaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2500);
  };

  // 1. Process BNI VA Simulation
  const handleSimulateBniVa = async () => {
    if (!selectedEnrollment) {
      setActionError('Pilih tagihan pendaftaran terlebih dahulu.');
      return;
    }
    setProcessing(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.simulateBniVaPayment({
        enrollment_id: selectedEnrollment.id,
        amount: cleanAmount,
        va_number: bniVaNumber,
        student_name: selectedEnrollment.student_name || user?.name || '',
        student_email: selectedEnrollment.student_email || user?.email || '',
      });

      if (res?.success) {
        setActionSuccess(`Pembayaran ${isTuition ? 'Biaya Kursus' : 'Biaya Registrasi'} via BNI VA berhasil diverifikasi otomatis! Status kelas kini aktif.`);
        if (onRefresh) await onRefresh();
      } else {
        setActionError(res?.message || 'Gagal memproses simulasi pembayaran BNI Virtual Account.');
      }
    } catch (err) {
      setActionError(err.message || 'Terjadi kesalahan sistem saat memproses BNI VA.');
    } finally {
      setProcessing(false);
    }
  };

  // 2. Process Xendit Simulation
  const handleSimulateXendit = async () => {
    if (!selectedEnrollment) {
      setActionError('Pilih tagihan pendaftaran terlebih dahulu.');
      setShowXenditModal(false);
      return;
    }
    setProcessing(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.simulateXenditPayment({
        enrollment_id: selectedEnrollment.id,
        amount: cleanAmount,
        payment_method: xenditSubMethod,
        student_name: selectedEnrollment.student_name || user?.name || '',
        student_email: selectedEnrollment.student_email || user?.email || '',
      });

      if (res?.success) {
        setShowXenditModal(false);
        setActionSuccess(`Pembayaran ${isTuition ? 'Biaya Kursus' : 'Biaya Registrasi'} via Xendit (${xenditSubMethod.toUpperCase()}) berhasil! Status pendaftaran kini lunas & aktif.`);
        if (onRefresh) await onRefresh();
      } else {
        setActionError(res?.message || 'Gagal memproses pembayaran melalui Xendit.');
        setShowXenditModal(false);
      }
    } catch (err) {
      setActionError(err.message || 'Terjadi kesalahan sistem saat menghubungi gateway Xendit.');
      setShowXenditModal(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="tab-section animate-fade-in">
      <div className="section-header">
        <div>
          <h2>Pembayaran & Riwayat Transaksi</h2>
          <p>Lakukan pembayaran tagihan registrasi maupun biaya kursus secara instan menggunakan <strong>Virtual Account BNI (Resmi UI)</strong> atau <strong>Xendit Payment Gateway</strong>.</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="auth-alert auth-alert-success" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px' }}>
          <i className="ti ti-circle-check" style={{ fontSize: '1.4rem' }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="auth-alert auth-alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px' }}>
          <i className="ti ti-alert-circle" style={{ fontSize: '1.4rem' }} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="payment-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '1.75rem', alignItems: 'start' }}>

        {/* LEFT COLUMN: TAGIHAN & METODE PEMBAYARAN */}
        <div className="payment-form-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            💳 Pembayaran Tagihan Kursus / Registrasi
          </h3>

          {/* CONDITIONAL: IF ALL BILLS ARE PAID, SHOW CONGRATS STATE */}
          {payableBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
                <i className="ti ti-circle-check" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Semua Tagihan Sudah Lunas! 🎉
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Tidak ada tagihan tertunda yang perlu dibayar saat ini. Seluruh pembayaran pendaftaran dan biaya kursus Anda telah terverifikasi lunas.
              </p>
              <div style={{ display: 'inline-flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange('courses')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: '8px', background: '#1e40af', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <i className="ti ti-book-2" style={{ marginRight: '6px' }} /> Lihat Kursus Saya
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange('registrations')}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', cursor: 'pointer' }}
                >
                  <i className="ti ti-file-text" style={{ marginRight: '6px' }} /> Status Pendaftaran
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Select Enrollment / Bill (ONLY UNPAID BILLS) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Pilih Tagihan yang Akan Dibayar <span className="req" style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={currentBill?.idKey || ''}
                  onChange={(event) => {
                    setSelectedBillKey(event.target.value);
                    const found = payableBills.find((b) => b.idKey === event.target.value);
                    if (found) {
                      setPayForm({
                        ...payForm,
                        enrollment_id: found.enrollment.id,
                        payment_for: found.chargeType,
                        amount: found.amount,
                      });
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#f8fafc' }}
                >
                  {payableBills.map((bill) => (
                    <option key={bill.idKey} value={bill.idKey}>
                      {bill.enrollment.registration_number || `#${bill.enrollment.id}`} · {bill.enrollment.course_name} — {bill.chargeName} (Rp {bill.amount.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

          {/* Rincian Tagihan Box */}
          {selectedEnrollment && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Jenis Tagihan:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isTuition ? '#0284c7' : '#2757A4', background: isTuition ? '#e0f2fe' : '#E1EFFA', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {isTuition ? '🎓 BIAYA KURSUS (TUITION)' : '📝 BIAYA REGISTRASI AWAL'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Program & Kursus</span>
                  <strong style={{ color: '#0f172a' }}>{selectedEnrollment.course_name}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Level / Kelas</span>
                  <strong style={{ color: '#0f172a' }}>{selectedEnrollment.level_name || 'Level Awal / Placement Test'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Lokasi Kampus</span>
                  <strong style={{ color: '#0f172a' }}>{courseLocation}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem' }}>Jadwal Kelas</span>
                  <strong style={{ color: '#0f172a' }}>
                    {[selectedEnrollment.schedule_days, selectedEnrollment.schedule_time].filter(Boolean).join(' · ') || 'Sesuai Penetapan'}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Total yang Harus Dibayar:</span>
                <strong style={{ fontSize: '1.4rem', color: '#059669', fontWeight: 900 }}>
                  Rp {cleanAmount.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          )}

          {/* METODE PEMBAYARAN TABS (ONLY BNI VA & XENDIT) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>
              Pilih Saluran Pembayaran Otomatis:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethodTab('bni_va')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: paymentMethodTab === 'bni_va' ? '2px solid #2757A4' : '1px solid #e2e8f0',
                  background: paymentMethodTab === 'bni_va' ? '#E1EFFA' : '#ffffff',
                  color: paymentMethodTab === 'bni_va' ? '#2757A4' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>🏛️ BNI Virtual Account</span>
                  <span style={{ fontSize: '0.65rem', background: '#F6DB00', color: '#000', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>RESMI UI</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Transfer via BNI Mobile, ATM & Antar Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethodTab('xendit')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: paymentMethodTab === 'xendit' ? '2px solid #00AEEA' : '1px solid #e2e8f0',
                  background: paymentMethodTab === 'xendit' ? '#e0f7fe' : '#ffffff',
                  color: paymentMethodTab === 'xendit' ? '#0284c7' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>⚡ Xendit Gateway</span>
                  <span style={{ fontSize: '0.65rem', background: '#00AEEA', color: '#fff', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>DUMMY</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>QRIS, VA Bank Lain, & E-Wallet</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT 1: BNI VIRTUAL ACCOUNT */}
          {paymentMethodTab === 'bni_va' && (
            <div style={{ border: '1.5px solid #2757A4', borderRadius: '12px', padding: '1.25rem', background: '#fafcff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Nomor Virtual Account BNI:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2757A4', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {bniVaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVa}
                      style={{
                        background: copiedVa ? '#ecfdf5' : '#2757A4',
                        color: copiedVa ? '#059669' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {copiedVa ? '✓ Tersalin' : '📋 Salin'}
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Nama Rekening:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    LBI FIB UI - {selectedEnrollment?.student_name || user?.name || 'Peserta'}
                  </div>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a' }}>Cara Pembayaran BNI VA:</strong>
                <ol style={{ margin: '0.35rem 0 0', paddingLeft: '1.2rem' }}>
                  <li>Buka BNI Mobile Banking atau ATM BNI &rarr; Pilih menu <strong>Transfer &rarr; Virtual Account Billing</strong>.</li>
                  <li>Masukkan Nomor Virtual Account <strong>{bniVaNumber}</strong>.</li>
                  <li>Pastikan nama akun tagihan dan nominal <strong>Rp {cleanAmount.toLocaleString('id-ID')}</strong> sudah sesuai.</li>
                  <li>Konfirmasi transaksi. Sistem LBI FIB UI akan memverifikasi pembayaran secara otomatis.</li>
                </ol>
              </div>

              <button
                type="button"
                onClick={handleSimulateBniVa}
                disabled={processing || !selectedEnrollment}
                style={{
                  width: '100%',
                  background: '#2757A4',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(39, 87, 164, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {processing ? 'Memproses Verifikasi BNI VA...' : '✓ Simulasi Pembayaran BNI VA (Lunas Otomatis)'}
              </button>
            </div>
          )}

          {/* TAB CONTENT 2: XENDIT GATEWAY */}
          {paymentMethodTab === 'xendit' && (
            <div style={{ border: '1.5px solid #00AEEA', borderRadius: '12px', padding: '1.25rem', background: '#f8fdff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#0284c7', fontSize: '1rem', fontWeight: 800 }}>
                    Xendit Payment Gateway (Simulator)
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Pembayaran multi-channel instan dengan verifikasi realtime.
                  </p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  ['qris', '📱 QRIS (Gopay/OVO/Dana)'],
                  ['va_bca', '🏦 Virtual Account BCA'],
                  ['va_mandiri', '🏛️ Mandiri Livin VA'],
                  ['ewallet', '⚡ ShopeePay / LinkAja'],
                ].map(([methodKey, methodTitle]) => (
                  <button
                    key={methodKey}
                    type="button"
                    onClick={() => setXenditSubMethod(methodKey)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: xenditSubMethod === methodKey ? '2px solid #00AEEA' : '1px solid #cbd5e1',
                      background: xenditSubMethod === methodKey ? '#e0f7fe' : '#ffffff',
                      color: xenditSubMethod === methodKey ? '#0284c7' : '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {methodTitle}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowXenditModal(true)}
                disabled={processing || !selectedEnrollment}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00AEEA 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.85rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 174, 234, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                🚀 Buka Checkout Modal Xendit ({xenditSubMethod.toUpperCase()})
              </button>
            </div>
          )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN: RIWAYAT PEMBAYARAN */}
        <div className="payment-history-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
            📜 Riwayat Pembayaran Anda
          </h3>

          {paymentHistoryLoading ? (
            <p className="no-data-text">Memuat riwayat pembayaran...</p>
          ) : paymentHistoryError ? (
            <div className="dashboard-data-error" role="alert">{paymentHistoryError}</div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              <i className="ti ti-receipt-off" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.5rem', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Belum ada riwayat transaksi pembayaran.</p>
            </div>
          ) : (
            <div className="payment-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {payments.map((payment) => (
                <div key={payment.id} className="payment-item" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1rem', background: '#fafafa' }}>
                  <div className="pay-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="pay-amount" style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                      Rp {parseInt(payment.amount || 0).toLocaleString('id-ID')}
                    </span>
                    {getStatusBadge(payment.status, 'payment')}
                  </div>
                  <p className="pay-meta" style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    <strong>{payment.bank_name}</strong> &bull; {payment.payment_date} &bull; Tagihan: <strong>{payment.payment_for === 'tuition' ? 'Kursus' : 'Registrasi'}</strong>
                  </p>
                  {payment.account_number && (
                    <small style={{ display: 'block', color: '#2757A4', fontSize: '0.75rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                      Ref: {payment.account_number}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}

          {!paymentHistoryLoading && !paymentHistoryError && payments.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <PaginationControls meta={paymentPagination} onPageChange={onPaymentPageChange} label="pembayaran" />
            </div>
          )}
        </div>
      </div>

      {/* XENDIT SIMULATION MODAL */}
      {showXenditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ background: '#002B49', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>💳</span>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>xendit</strong>
                <span style={{ background: '#00AEEA', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  DUMMY SANDBOX
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowXenditModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Tagihan {isTuition ? 'Biaya Kursus' : 'Registrasi'}:</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002B49', marginTop: '0.25rem' }}>
                  Rp {cleanAmount.toLocaleString('id-ID')}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {selectedEnrollment?.course_name}
                </span>
              </div>

              {xenditSubMethod === 'qris' && (
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div style={{ width: '150px', height: '150px', margin: '0 auto 0.75rem', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=XENDIT-DUMMY-LBI-UI-${selectedEnrollment?.id || '1'}`}
                      alt="QRIS Simulation"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                    Pindai QRIS via BCA Mobile, GoPay, OVO, atau ShopeePay
                  </span>
                </div>
              )}

              {xenditSubMethod !== 'qris' && (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Metode yang Dipilih:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', margin: '0.35rem 0' }}>
                    {xenditSubMethod.toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Simulasi pembayaran langsung terverifikasi secara instan.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSimulateXendit}
                disabled={processing}
                style={{
                  width: '100%',
                  background: '#002B49',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Memproses Xendit...' : `Bayar Sekarang Rp ${cleanAmount.toLocaleString('id-ID')} (Simulasi)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
