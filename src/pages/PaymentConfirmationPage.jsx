// src/pages/PaymentConfirmationPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PaymentConfirmationPage() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const enrollmentIdParam = searchParams.get('enrollment_id') || '';
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';
  const amountParam = searchParams.get('amount') || '';
  const enrollmentIdPattern = /^(?:[A-Z]{2,5}-\d{4}-\d{5}|#?\d+)$/i;

  // Active Payment Method Tab: 'bni_va', 'xendit', or 'manual_transfer'
  const [paymentMethodTab, setPaymentMethodTab] = useState('bni_va');

  // Form State
  const [form, setForm] = useState({
    enrollment_id: enrollmentIdParam,
    student_name: nameParam,
    student_email: emailParam,
    bank_name: 'Bank BNI (Virtual Account)',
    account_number: '',
    account_holder: nameParam,
    amount: amountParam || '160000',
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Calculate clean numeric amount and dynamic BNI Virtual Account number
  const cleanAmount = parseInt(form.amount || amountParam || '160000', 10);
  const rawId = form.enrollment_id || enrollmentIdParam || '16307';
  const numericSuffix = (rawId.replace(/\D/g, '') || '16307').slice(-8).padStart(8, '0');
  const bniVaNumber = `988127${numericSuffix}`;

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      enrollment_id: enrollmentIdParam || prev.enrollment_id,
      student_name: nameParam || prev.student_name || user?.profile?.full_name || user?.name || '',
      student_email: emailParam || prev.student_email || user?.email || '',
      account_holder: prev.account_holder || nameParam || user?.profile?.full_name || user?.name || '',
      amount: amountParam || prev.amount || '160000'
    }));
  }, [enrollmentIdParam, emailParam, nameParam, amountParam, user]);

  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Xendit Modal & Simulation State
  const [showXenditModal, setShowXenditModal] = useState(false);
  const [xenditSubMethod, setXenditSubMethod] = useState('qris'); // 'qris', 'va_bca', 'va_mandiri', 'ewallet'
  const [xenditProcessing, setXenditProcessing] = useState(false);

  // Copy helper
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'va') {
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2500);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2500);
    }
  };

  // 1. Submit Manual Transfer Confirmation
  const handleSubmitManual = async (e) => {
    e.preventDefault();
    if (form.enrollment_id && !enrollmentIdPattern.test(form.enrollment_id.trim())) {
      setErrorMsg('Format nomor registrasi tidak valid. Gunakan format PPB-2026-00001 atau ID numerik.');
      return;
    }
    if (!proofFile) {
      setErrorMsg('Silakan unggah foto/berkas struk bukti pembayaran transfer.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      if (form.enrollment_id) formData.append('enrollment_id', form.enrollment_id);
      formData.append('student_name', form.student_name || form.account_holder);
      formData.append('student_email', form.student_email);
      formData.append('bank_name', form.bank_name);
      formData.append('account_number', form.account_number || bniVaNumber);
      formData.append('account_holder', form.account_holder);
      formData.append('amount', form.amount);
      formData.append('payment_date', form.payment_date);
      formData.append('proof_file', proofFile);

      const res = await api.submitPaymentConfirmation(formData);

      if (res?.success) {
        setSuccess(true);
        setSuccessReceipt({
          method: form.bank_name,
          refNumber: res.data?.account_number || `REG-${Date.now()}`,
          amount: form.amount,
          date: form.payment_date,
          status: 'Menunggu Verifikasi Bagian Keuangan'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Gagal mengirim konfirmasi pembayaran. Pastikan data terisi lengkap.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Simulate BNI Virtual Account Instant Verification
  const handleSimulateBniVa = async () => {
    if (!form.enrollment_id) {
      setErrorMsg('Nomor registrasi diperlukan untuk memproses pembayaran BNI Virtual Account.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.simulateBniVaPayment({
        enrollment_id: form.enrollment_id,
        amount: cleanAmount,
        va_number: bniVaNumber,
        student_name: form.student_name,
        student_email: form.student_email
      });

      if (res?.success) {
        setSuccess(true);
        setSuccessReceipt({
          method: 'BNI Virtual Account (Resmi UI)',
          refNumber: bniVaNumber,
          amount: cleanAmount,
          date: new Date().toLocaleDateString('id-ID'),
          status: 'LUNAS (Terverifikasi Otomatis)'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Gagal memproses simulasi pembayaran BNI Virtual Account.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses BNI VA.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Simulate Xendit Gateway Payment
  const handleSimulateXendit = async () => {
    if (!form.enrollment_id) {
      setErrorMsg('Nomor registrasi diperlukan untuk memproses pembayaran Xendit.');
      setShowXenditModal(false);
      return;
    }
    setXenditProcessing(true);
    setErrorMsg('');

    try {
      const res = await api.simulateXenditPayment({
        enrollment_id: form.enrollment_id,
        amount: cleanAmount,
        payment_method: xenditSubMethod,
        student_name: form.student_name,
        student_email: form.student_email
      });

      if (res?.success) {
        setShowXenditModal(false);
        setSuccess(true);
        setSuccessReceipt({
          method: `Xendit Gateway (${xenditSubMethod.toUpperCase()})`,
          refNumber: res.data?.xendit_invoice?.id || `XND-${Date.now()}`,
          amount: cleanAmount,
          date: new Date().toLocaleDateString('id-ID'),
          status: 'LUNAS (Verified via Xendit)'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Gagal memproses pembayaran melalui Xendit.');
        setShowXenditModal(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menghubungi gateway Xendit.');
      setShowXenditModal(false);
    } finally {
      setXenditProcessing(false);
    }
  };

  return (
    <div className="payment-page-container animate-fade-in" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/" style={{ color: '#2757A4', textDecoration: 'none', fontWeight: 600 }}>Beranda</Link> &rsaquo;{' '}
        <span style={{ color: '#64748b' }}>Pembayaran</span> &rsaquo;{' '}
        <span style={{ fontWeight: 700, color: '#0f172a' }}>Portal Pembayaran Resmi LBI FIB UI</span>
      </nav>

      {/* Header Info Tagihan */}
      <div style={{
        background: 'linear-gradient(135deg, #2757A4 0%, #198BCC 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(39, 87, 164, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#E1EFFA', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Portal Pembayaran Resmi · Universitas Indonesia
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem', textShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              Pembayaran Biaya Registrasi & Kursus
            </h1>
            <p style={{ fontSize: '0.925rem', color: '#E1EFFA', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Lembaga Bahasa Internasional Fakultas Ilmu Pengetahuan Budaya Universitas Indonesia (LBI FIB UI).
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#E1EFFA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Tagihan Pembayaran
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F6DB00', margin: '0.25rem 0' }}>
              Rp {cleanAmount.toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.9 }}>
              No. Registrasi: <strong>{form.enrollment_id || '-'}</strong>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        /* SUCCESS RECEIPT VIEW */
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          border: '1.5px solid #dcfce7',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Pembayaran Berhasil Dikonfirmasi!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Terima kasih! Pembayaran biaya pendaftaran Anda telah tercatat secara resmi di sistem LBI FIB UI.
          </p>

          {/* Receipt Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.75rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Status Transaksi</span>
              <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.9rem', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {successReceipt?.status || 'LUNAS'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Metode Pembayaran</span>
              <strong style={{ color: '#0f172a' }}>{successReceipt?.method}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Nomor Referensi / VA</span>
              <strong style={{ color: '#2757A4', letterSpacing: '0.5px' }}>{successReceipt?.refNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Nomor Registrasi</span>
              <strong style={{ color: '#0f172a' }}>{form.enrollment_id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748b' }}>Nama Peserta</span>
              <strong style={{ color: '#0f172a' }}>{form.student_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', marginTop: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>Total Dibayar</span>
              <strong style={{ color: '#059669', fontSize: '1.25rem' }}>Rp {cleanAmount.toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={isAuthenticated ? '/dashboard?tab=payments' : `/login?redirect=${encodeURIComponent('/dashboard?tab=payments')}`}
              style={{
                background: '#2757A4',
                color: '#ffffff',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(39, 87, 164, 0.25)'
              }}
            >
              Lihat di Portal Peserta &rarr;
            </Link>
            <Link
              to="/"
              style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none'
              }}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* METHOD SELECTION TABS */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setPaymentMethodTab('bni_va')}
              style={{
                flex: '1 1 240px',
                padding: '1.15rem 1.25rem',
                borderRadius: '14px',
                border: paymentMethodTab === 'bni_va' ? '2px solid #2757A4' : '1px solid #e2e8f0',
                background: paymentMethodTab === 'bni_va' ? '#E1EFFA' : '#ffffff',
                color: paymentMethodTab === 'bni_va' ? '#2757A4' : '#334155',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: paymentMethodTab === 'bni_va' ? '0 4px 16px rgba(39,87,164,0.12)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🏛️</span>
                <strong style={{ fontSize: '1.05rem' }}>Virtual Account BNI</strong>
                <span style={{ fontSize: '0.65rem', background: '#F6DB00', color: '#000', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', marginLeft: 'auto' }}>
                  RESMI UI
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Transfer otomatis melalui BNI Mobile, ATM, atau transfer antar bank.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethodTab('xendit')}
              style={{
                flex: '1 1 240px',
                padding: '1.15rem 1.25rem',
                borderRadius: '14px',
                border: paymentMethodTab === 'xendit' ? '2px solid #00AEEA' : '1px solid #e2e8f0',
                background: paymentMethodTab === 'xendit' ? '#e0f7fe' : '#ffffff',
                color: paymentMethodTab === 'xendit' ? '#0284c7' : '#334155',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: paymentMethodTab === 'xendit' ? '0 4px 16px rgba(0,174,234,0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <strong style={{ fontSize: '1.05rem' }}>Xendit Gateway</strong>
                <span style={{ fontSize: '0.65rem', background: '#00AEEA', color: '#fff', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', marginLeft: 'auto' }}>
                  DUMMY SANDBOX
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                QRIS (Gopay/OVO/ShopeePay), VA Semua Bank, & Kartu Kredit.
              </div>
            </button>
          </div>

          {/* TAB 1: BNI VIRTUAL ACCOUNT */}
          {paymentMethodTab === 'bni_va' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ background: '#E1EFFA', color: '#2757A4', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                    Bank Mitra Resmi Universitas Indonesia
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
                    Pembayaran via Virtual Account Bank BNI
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Nomor Virtual Account khusus atas nama Anda telah digenerate otomatis oleh sistem UI.
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ⏱️ Berlaku 48 Jam (2 x 24 Jam)
                  </span>
                </div>
              </div>

              {/* VA Display Box */}
              <div style={{ background: '#f8fafc', border: '2px solid #2757A4', borderRadius: '14px', padding: '1.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Nomor Virtual Account (BNI):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem' }}>
                      <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#2757A4', letterSpacing: '1px', fontFamily: 'monospace' }}>
                        {bniVaNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bniVaNumber, 'va')}
                        style={{
                          background: copiedVa ? '#ecfdf5' : '#2757A4',
                          color: copiedVa ? '#059669' : '#ffffff',
                          border: `1px solid ${copiedVa ? '#a7f3d0' : '#2757A4'}`,
                          borderRadius: '8px',
                          padding: '0.5rem 0.9rem',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        {copiedVa ? '✓ Tersalin' : '📋 Salin No. VA'}
                      </button>
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px dashed #cbd5e1', paddingLeft: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nama Akun VA:</span>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        LBI FIB UI - {form.student_name || 'Peserta'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nominal Pas:</span>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                        Rp {cleanAmount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Accordion / Guide */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem' }}>
                  Panduan Cara Pembayaran VA BNI:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#2757A4', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      📱 Melalui BNI Mobile Banking
                    </strong>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Buka aplikasi BNI Mobile & login.</li>
                      <li>Pilih menu <strong>Pembayaran</strong> &rsaquo; <strong>Virtual Account Billing</strong>.</li>
                      <li>Masukkan Nomor VA: <code>{bniVaNumber}</code>.</li>
                      <li>Pastikan nominal Rp {cleanAmount.toLocaleString('id-ID')} & konfirmasi PIN.</li>
                    </ol>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#2757A4', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      🏧 Melalui ATM BNI / Link
                    </strong>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Masukkan kartu ATM BNI & PIN.</li>
                      <li>Pilih <strong>Menu Lain</strong> &rsaquo; <strong>Transfer</strong> &rsaquo; <strong>Virtual Account Billing</strong>.</li>
                      <li>Input Nomor VA: <code>{bniVaNumber}</code>.</li>
                      <li>Cek nama LBI FIB UI & selesaikan pembayaran.</li>
                    </ol>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#2757A4', display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      🏦 Transfer Antar-Bank (BCA/Mandiri/BRI)
                    </strong>
                    <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                      <li>Pilih menu Transfer Antar Bank / Online.</li>
                      <li>Pilih Bank Tujuan: <strong>Bank BNI (Kode 009)</strong>.</li>
                      <li>Nomor Rekening Tujuan: <code>{bniVaNumber}</code>.</li>
                      <li>Nominal pas Rp {cleanAmount.toLocaleString('id-ID')}.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* BNI VA Action Button (Simulate Payment or Upload) */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Setelah Anda melakukan transfer ke nomor VA di atas, sistem akan memverifikasi dalam beberapa menit.
                </span>
                <button
                  type="button"
                  onClick={handleSimulateBniVa}
                  disabled={loading}
                  style={{
                    background: '#2757A4',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem 2rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(39, 87, 164, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? 'Memverifikasi VA...' : '⚡ Simulasikan VA BNI Terbayar (Instant)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: XENDIT PAYMENT GATEWAY (DUMMY) */}
          {paymentMethodTab === 'xendit' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
                <div>
                  <span style={{ background: '#e0f7fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                    Payment Gateway Integration
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0 0.2rem' }}>
                    Pembayaran Instan via Xendit (Dummy Sandbox)
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Mendukung pembayaran langsung dengan QRIS e-wallet (GoPay, OVO, ShopeePay), VA Bank, dan Kartu Kredit.
                  </p>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                  🧪 Mode Sandbox / Dummy Aktif
                </div>
              </div>

              {/* Sub-method choices inside Xendit */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { id: 'qris', icon: '📱', name: 'QRIS Real-Time', sub: 'GoPay, OVO, Dana, ShopeePay' },
                  { id: 'va_bca', icon: '🏦', name: 'Virtual Account BCA', sub: 'BCA Mobile & KlikBCA' },
                  { id: 'va_mandiri', icon: '🏧', name: 'Mandiri Bill / VA', sub: 'Livin by Mandiri & ATM' },
                  { id: 'credit_card', icon: '💳', name: 'Kartu Kredit / Debit', sub: 'Visa, Mastercard, JCB' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setXenditSubMethod(item.id)}
                    style={{
                      border: xenditSubMethod === item.id ? '2px solid #00AEEA' : '1px solid #e2e8f0',
                      background: xenditSubMethod === item.id ? '#e0f7fe' : '#f8fafc',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: xenditSubMethod === item.id ? '#0284c7' : '#0f172a' }}>
                      {item.name}
                    </strong>
                    <span style={{ fontSize: '0.775rem', color: '#64748b' }}>{item.sub}</span>
                  </div>
                ))}
              </div>

              {/* Preview Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Metode yang Dipilih:</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                      Xendit &rsaquo; {xenditSubMethod.toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Biaya registrasi: <strong>Rp {cleanAmount.toLocaleString('id-ID')}</strong> (Tanpa biaya admin)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowXenditModal(true)}
                    style={{
                      background: '#00AEEA',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.9rem 2rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 174, 234, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    🚀 Buka Checkout Xendit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* XENDIT SIMULATION MODAL (REALISTIC CHECKOUT UI) */}
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
            maxWidth: '480px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{ background: '#002B49', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>💳</span>
                <strong style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>xendit</strong>
                <span style={{ background: '#00AEEA', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  SANDBOX DUMMY
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowXenditModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>
                  Lembaga Bahasa Internasional UI
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
                  Rp {cleanAmount.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Invoice Ref: <code>XND-{numericSuffix}</code>
                </div>
              </div>

              {xenditSubMethod === 'qris' && (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.75rem' }}>
                    Scan QRIS via GoPay / OVO / ShopeePay / BCA:
                  </span>
                  <div style={{ width: '180px', height: '180px', margin: '0 auto', background: '#f8fafc', border: '2px solid #00AEEA', borderRadius: '12px', display: 'grid', placeItems: 'center', position: 'relative' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>📲</span>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>QRIS DUMMY ACTIVE</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.5rem' }}>
                    Buka aplikasi e-wallet Anda atau klik tombol simulasi di bawah.
                  </span>
                </div>
              )}

              {xenditSubMethod !== 'qris' && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Virtual Account Simulator:</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00AEEA', margin: '0.35rem 0' }}>
                    8808{numericSuffix}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Atas nama: <strong>LBI FIB UI - {form.student_name}</strong>
                  </span>
                </div>
              )}

              {/* Simulation Action Button */}
              <button
                type="button"
                onClick={handleSimulateXendit}
                disabled={xenditProcessing}
                style={{
                  width: '100%',
                  background: '#00AEEA',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: xenditProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 174, 234, 0.35)',
                  marginBottom: '0.75rem'
                }}
              >
                {xenditProcessing ? 'Memproses Xendit Gateway...' : '⚡ Simulasikan Pembayaran Berhasil'}
              </button>

              <button
                type="button"
                onClick={() => setShowXenditModal(false)}
                disabled={xenditProcessing}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Batal / Pilih Metode Lain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
