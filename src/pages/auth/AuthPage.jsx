import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import lbiLogo from '../../assets/lbi-logo.png';

const highlights = [
  { icon: 'ti ti-calendar-check', title: 'Atur perjalanan belajar', text: 'Daftar kelas dan pantau jadwal Anda dalam satu tempat.' },
  { icon: 'ti ti-shield-check', title: 'Data lebih aman', text: 'Akun peserta membantu menjaga riwayat pendaftaran dan pembayaran.' },
  { icon: 'ti ti-certificate', title: 'Sertifikat tersimpan', text: 'Akses status dan sertifikat kursus dengan lebih praktis.' },
];

const ADMIN_ROLES = ['administrator', 'admin', 'marketing', 'content_writer', 'finance', 'admin_ppb', 'admin_bipa', 'admin_ppp', 'reviewer', 'teacher'];

function isStaffUser(user) {
  return Boolean(user?.role && (ADMIN_ROLES.includes(user.role) || (user.role !== 'student' && user.role !== 'peserta')));
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, user, isAuthenticated } = useAuth();
  const redirectTarget = searchParams.get('redirect');
  const safeRedirectTarget = redirectTarget?.startsWith('/') && !redirectTarget.startsWith('//')
    ? redirectTarget
    : null;
  const postAuthPath = safeRedirectTarget || (isStaffUser(user) ? '/' : '/dashboard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    setErrorMessage('');
    setErrors({});
  }, [mode]);

  useEffect(() => {
    if (isAuthenticated) navigate(postAuthPath, { replace: true });
  }, [isAuthenticated, navigate, postAuthPath, user]);

  const switchMode = (nextMode) => {
    const nextPath = nextMode === 'register' ? '/register' : '/login';
    const params = new URLSearchParams();
    if (redirectTarget) params.set('redirect', redirectTarget);
    if (email) params.set('email', email);
    const qs = params.toString();
    navigate(qs ? `${nextPath}?${qs}` : nextPath);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setErrors({});

    if (mode === 'register' && password !== passwordConfirmation) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await register(name, email, password, passwordConfirmation);

      if (result.success) {
        const isStaff = isStaffUser(result.user);
        if (isStaff) {
          navigate(safeRedirectTarget || '/', { replace: true });
        } else {
          const destination = safeRedirectTarget || '/dashboard';
          navigate(destination, { replace: true });
        }
      } else {
        setErrorMessage(result.message || (mode === 'login' ? 'Login gagal.' : 'Registrasi gagal.'));
        setErrors(result.errors || {});
      }
    } catch (error) {
      setErrorMessage(error.message || 'Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  return (
    <main className="auth-page">
      <section className="auth-page-visual" aria-label="Tentang portal peserta LBI FIB UI">
        <Link to="/" className="auth-page-brand">
          <img src={lbiLogo} alt="Logo Lembaga Bahasa Internasional FIB UI" />
        </Link>
        <div className="auth-page-visual-content">
          <span className="auth-eyebrow">Student portal</span>
          <h1>Belajar bahasa, <em>buka peluang.</em></h1>
          <p>Ruang personal untuk mengelola perjalanan belajar Anda bersama LBI FIB Universitas Indonesia.</p>
          <div className="auth-highlights">
            {highlights.map((item) => (
              <div className="auth-highlight" key={item.title}>
                <span className="auth-highlight-icon"><i className={item.icon} /></span>
                <span><strong>{item.title}</strong><small>{item.text}</small></span>
              </div>
            ))}
          </div>
        </div>
        <p className="auth-page-quote">"Bahasa membuka jendela menuju dunia."</p>
      </section>

      <section className="auth-page-form-area">
        <div className="auth-page-form-wrap">
          <Link to="/" className="auth-mobile-brand">
            <img src={lbiLogo} alt="Logo Lembaga Bahasa Internasional FIB UI" />
          </Link>
          <div className="auth-page-heading">
            <span className="auth-badge">{mode === 'login' ? 'Selamat datang kembali' : 'Mulai dari sini'}</span>
            <h2>{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun peserta'}</h2>
            <p>{mode === 'login' ? 'Lanjutkan proses belajar Anda dengan lebih mudah.' : 'Daftar sekali untuk mengakses seluruh layanan peserta.'}</p>
          </div>

          {errorMessage && (
            <div className="auth-alert auth-alert-danger" role="alert">
              <i className="ti ti-alert-circle" /><span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form auth-page-form">
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-name">Nama lengkap <span className="req">*</span></label>
                <input id="auth-name" type="text" required placeholder="Contoh: Budi Pratama" value={name} onChange={(event) => setName(event.target.value)} />
                {fieldError('name') && <span className="field-error">{fieldError('name')}</span>}
              </div>
            )}
            <div className="auth-field">
              <label htmlFor="auth-email">Alamat email <span className="req">*</span></label>
              <input id="auth-email" type="email" required placeholder="nama@email.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
            </div>
            <div className="auth-field">
              <label htmlFor="auth-password">Kata sandi <span className="req">*</span></label>
              <input id="auth-password" type="password" required minLength={6} placeholder="Minimal 6 karakter" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              {fieldError('password') && <span className="field-error">{fieldError('password')}</span>}
            </div>
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-password-confirmation">Konfirmasi kata sandi <span className="req">*</span></label>
                <input id="auth-password-confirmation" type="password" required minLength={6} placeholder="Ulangi kata sandi" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} autoComplete="new-password" />
              </div>
            )}
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke portal' : 'Buat akun peserta'}
              {!loading && <i className="ti ti-arrow-up-right" />}
            </button>
          </form>

          <div className="auth-page-switch">
            <span>{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}</span>
            <button type="button" className="auth-link-btn" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </div>
          <Link to="/" className="auth-back-link"><i className="ti ti-arrow-left" /> Kembali ke halaman utama</Link>
        </div>
      </section>
    </main>
  );
}
