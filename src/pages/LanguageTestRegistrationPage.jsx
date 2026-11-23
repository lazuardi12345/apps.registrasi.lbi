import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
  student_name: '',
  student_email: '',
  student_phone: '',
  test_date_preference: '',
  test_location: '',
};

const formatAmount = (amount) => `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;

export default function LanguageTestRegistrationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(searchParams.get('course_catalog_id') || '');
  const [form, setForm] = useState(initialForm);
  const [fee, setFee] = useState(null);
  const [feeError, setFeeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getCourseCatalogs().then((response) => {
      if (cancelled) return;
      if (!response?.success) {
        setError(response?.message || 'Daftar tes bahasa gagal dimuat.');
        return;
      }
      const catalogs = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setTests(catalogs.filter((catalog) =>
        catalog.is_active && catalog.division === 'testing' && catalog.category === 'language_test'
      ));
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message || 'Daftar tes bahasa gagal dimuat.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (selectedTestId) next.set('course_catalog_id', selectedTestId);
      else next.delete('course_catalog_id');
      return next;
    }, { replace: true });

    if (!selectedTestId) {
      setFee(null);
      setFeeError('');
      return undefined;
    }

    let cancelled = false;
    setFee(null);
    setFeeError('');
    api.getCourseFee({ fee_type: 'registration', division: 'testing', course_catalog_id: selectedTestId })
      .then((response) => {
        if (cancelled) return;
        if (response?.success) {
          setFee(response.data || null);
        } else {
          setFeeError(response?.message || 'Tarif tes bahasa gagal dimuat.');
        }
      })
      .catch((requestError) => {
        if (!cancelled) setFeeError(requestError.message || 'Tarif tes bahasa gagal dimuat.');
      });

    return () => { cancelled = true; };
  }, [selectedTestId, setSearchParams]);

  const selectedTest = tests.find((test) => String(test.id) === String(selectedTestId));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTest) {
      setError('Pilih tes bahasa yang ingin didaftarkan.');
      return;
    }
    if (!fee) {
      setError('Tarif tes ini belum tersedia. Silakan hubungi admin LBI FIB UI.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.submitLanguageTestEnrollment({
        course_catalog_id: selectedTest.id,
        course_name: selectedTest.title,
        student_name: form.student_name,
        student_email: form.student_email,
        student_phone: form.student_phone,
        metadata: {
          test_date_preference: form.test_date_preference || null,
          test_location: form.test_location || null,
        },
      });
      if (!response?.success) {
        setError(response?.message || 'Pendaftaran tes bahasa gagal dikirim.');
        return;
      }
      setSuccess(response.data);
    } catch (requestError) {
      setError(requestError.message || 'Pendaftaran tes bahasa gagal dikirim.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="course-detail-loading"><div className="detail-spinner" /><p>Memuat daftar tes...</p></div>;

  return (
    <main className="catalog-detail-page">
      <section className="catalog-detail-hero">
        <div className="detail-container">
          <span className="catalog-detail-eyebrow">Tes Bahasa</span>
          <h1>Pendaftaran Tes Bahasa</h1>
          <p className="catalog-detail-summary">Isi data peserta untuk mengajukan pendaftaran tes.</p>
        </div>
      </section>
      <section className="detail-container" style={{ maxWidth: 760, paddingTop: '2rem', paddingBottom: '3rem' }}>
        {success ? (
          <div className="catalog-schedule-card">
            <h2>Pendaftaran berhasil dikirim</h2>
            <p>Nomor registrasi: <strong>{success.registration_number || `#${success.id}`}</strong></p>
            <p>Tim LBI FIB UI akan menghubungi Anda terkait pembayaran dan jadwal tes.</p>
            <Link to="/informasi-pendaftaran-tes" className="catalog-schedule-action">Kembali ke daftar tes</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="catalog-schedule-card" style={{ display: 'grid', gap: '1rem' }}>
            {error && <p role="alert" style={{ color: '#b42318' }}>{error}</p>}
            <label>
              Tes yang dipilih
              <select required value={selectedTestId} onChange={(event) => setSelectedTestId(event.target.value)} style={{ display: 'block', width: '100%', marginTop: '.4rem', padding: '.75rem' }}>
                <option value="">Pilih tes bahasa</option>
                {tests.map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
              </select>
            </label>
            {selectedTest && <p>{fee ? `Biaya pendaftaran: ${formatAmount(fee.amount)}` : feeError || 'Biaya pendaftaran belum dikonfigurasi.'}</p>}
            <label>Nama lengkap<input required maxLength="255" value={form.student_name} onChange={(event) => setForm({ ...form, student_name: event.target.value })} /></label>
            <label>Email<input required type="email" maxLength="191" value={form.student_email} onChange={(event) => setForm({ ...form, student_email: event.target.value })} /></label>
            <label>Nomor telepon<input type="tel" maxLength="50" value={form.student_phone} onChange={(event) => setForm({ ...form, student_phone: event.target.value })} /></label>
            <label>Preferensi tanggal tes (opsional)<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.test_date_preference} onChange={(event) => setForm({ ...form, test_date_preference: event.target.value })} /></label>
            <label>Preferensi lokasi
              <select value={form.test_location} onChange={(event) => setForm({ ...form, test_location: event.target.value })}>
                <option value="">Belum ditentukan</option>
                <option value="depok">Depok</option>
                <option value="salemba">Salemba</option>
                <option value="online">Online</option>
              </select>
            </label>
            <button type="submit" className="btn-primary-action" disabled={saving || !fee}>
              {saving ? 'Mengirim...' : 'Kirim pendaftaran'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
