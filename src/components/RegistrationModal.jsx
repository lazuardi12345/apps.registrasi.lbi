// src/components/RegistrationModal.jsx
import React, { useState } from "react";
import api from "../services/api";

export default function RegistrationModal({ isOpen, onClose, program = "ppb", defaultDivision = "ppb" }) {
  const [formData, setFormData] = useState({
    division: defaultDivision,
    student_type: "Umum",
    term_period: "Term 2 - 2026",
    student_name: "",
    student_email: "",
    student_phone: "",
    course_name: "Bahasa Inggris Komunikasi Bisnis",
    level_name: "Basic 1",
    campus_location: "Depok",
    learning_mode: "Offline",
    schedule_days: "Sabtu",
    schedule_time: "09:00 - 12:00 WIB",
    registration_fee: 1750000,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    const res = await api.submitProgramEnrollment(program, formData);
    setLoading(false);

    if (res?.success) {
      setResult(res.data);
    } else {
      setErrorMsg(res?.message || "Pendaftaran gagal dikirim. Silakan cek data Anda.");
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Formulir Pendaftaran Kursus</h3>
            <p className="modal-subtitle">LBI FIB Universitas Indonesia • Term 2 - 2026</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="modal-body">
          {result ? (
            <div className="registration-success-card animate-fade-in">
              <div className="success-icon-box">
                <i className="ti ti-circle-check-filled" />
              </div>
              <h4>Pendaftaran Berhasil Terkirim!</h4>
              <p>
                Terima kasih, <strong>{result.student_name}</strong>. Data registrasi Anda telah tersimpan di sistem LBI FIB UI.
              </p>
              <div className="success-details-box">
                <div><span>No. Pendaftaran (ID):</span> <strong>#{result.id}</strong></div>
                <div><span>Kursus:</span> <strong>{result.course_name}</strong></div>
                <div><span>Lokasi Kampus:</span> <strong>{result.campus_location} ({result.learning_mode})</strong></div>
                <div><span>Jadwal:</span> <strong>{result.schedule_days} ({result.schedule_time})</strong></div>
                <div><span>Status:</span> <span className="status-tag-pending">{result.status}</span></div>
              </div>
              <p className="success-hint">
                Silakan lakukan transfer biaya pendaftaran dan konfirmasi bukti pembayaran Anda melalui portal pembayaran.
              </p>
              <button className="btn btn-primary" onClick={onClose} style={{ width: "100%", marginTop: "1rem" }}>
                Selesai
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="registration-form">
              {errorMsg && (
                <div className="alert-error-box">
                  <i className="ti ti-alert-triangle" /> {errorMsg}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Tipe Peserta</label>
                  <select name="student_type" value={formData.student_type} onChange={handleChange}>
                    <option value="Umum">Umum / Publik</option>
                    <option value="Mahasiswa UI">Mahasiswa UI</option>
                    <option value="Alumni UI">Alumni UI</option>
                    <option value="Staf / Dosen UI">Staf / Dosen UI</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Nama Lengkap (Sesuai KTP/Identitas)</label>
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Aktif</label>
                  <input
                    type="email"
                    name="student_email"
                    value={formData.student_email}
                    onChange={handleChange}
                    placeholder="budi@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    name="student_phone"
                    value={formData.student_phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Pilihan Kursus / Program</label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleChange}
                    placeholder="Contoh: Bahasa Jepang Tingkat Dasar, TOEFL Preparation"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Lokasi Kampus</label>
                  <select name="campus_location" value={formData.campus_location} onChange={handleChange}>
                    <option value="Depok">Kampus UI Depok (Gedung X FIB)</option>
                    <option value="Salemba">Kampus UI Salemba (Gd. Iluni UI)</option>
                    <option value="Online">Kelas Daring (Zoom)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Metode Belajar</label>
                  <select name="learning_mode" value={formData.learning_mode} onChange={handleChange}>
                    <option value="Offline">Tatap Muka (Offline)</option>
                    <option value="Online">Daring (Online)</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Mengirim Pendaftaran..." : "Kirim Pendaftaran Sekarang"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
