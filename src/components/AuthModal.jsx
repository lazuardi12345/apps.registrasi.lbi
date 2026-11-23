// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ADMIN_DASHBOARD_URL = import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'http://localhost:5174';

function isStaffUser(user) {
  return Boolean(user?.role && user.role !== 'student' && user.role !== 'peserta');
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess, redirectNote = null }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrors({});
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          if (isStaffUser(result.user)) {
            const token = localStorage.getItem('lbi_auth_token') || result.token;
            const adminUrl = `${ADMIN_DASHBOARD_URL}/#auth_token=${encodeURIComponent(token)}`;
            window.open(adminUrl, '_blank', 'noopener,noreferrer');
          }
          if (onAuthSuccess) onAuthSuccess(result.user);
          onClose();
        } else {
          setErrorMessage(result.message || 'Login gagal.');
          if (result.errors) setErrors(result.errors);
        }
      } else {
        if (password !== passwordConfirmation) {
          setErrorMessage('Konfirmasi password tidak cocok.');
          setLoading(false);
          return;
        }

        const result = await register(name, email, password, passwordConfirmation);
        if (result.success) {
          if (onAuthSuccess) onAuthSuccess(result.user);
          onClose();
        } else {
          setErrorMessage(result.message || 'Registrasi gagal.');
          if (result.errors) setErrors(result.errors);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Tutup">
          &times;
        </button>

        <div className="auth-modal-header">
          <div className="auth-badge">LBI FIB UI Student Portal</div>
          <h2>{mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Peserta'}</h2>
          <p className="auth-subtitle">
            {redirectNote ||
              (mode === 'login'
                ? 'Kelola pendaftaran kursus, status pembayaran, dan sertifikat Anda.'
                : 'Daftar akun peserta untuk memulai pendaftaran kursus di LBI FIB UI.')}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-alert auth-alert-danger">
            <i className="ti ti-alert-circle" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Nama Lengkap (sesuai KTP/Ijazah) <span className="req">*</span></label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name[0]}</span>}
            </div>
          )}

          <div className="auth-field">
            <label>Alamat Email <span className="req">*</span></label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="auth-field">
            <label>Kata Sandi <span className="req">*</span></label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Konfirmasi Kata Sandi <span className="req">*</span></label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Ulangi kata sandi"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Memproses...</span>
            ) : mode === 'login' ? (
              <span>Masuk Sekarang &rarr;</span>
            ) : (
              <span>Daftar Akun Peserta &rarr;</span>
            )}
          </button>
        </form>

        <div className="auth-modal-footer">
          {mode === 'login' ? (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
