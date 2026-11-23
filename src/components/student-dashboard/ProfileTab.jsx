import React, { useRef, useState } from 'react';

export default function ProfileTab({ profileForm, setProfileForm, profileSuccess, profileError, profileLoading, onSubmit }) {
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Format foto harus JPG, PNG, atau WebP.');
      return;
    }

    // Validasi ukuran file (maksimal 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file foto maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result;
      setProfileForm((prev) => ({
        ...prev,
        photo_url: base64Data,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileForm((prev) => ({
      ...prev,
      photo_url: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
  };

  const userInitial = profileForm.name?.charAt(0)?.toUpperCase() || 'P';

  return (
    <div className="tab-section animate-fade-in">
      <div className="section-header">
        <div>
          <h2>Profil Peserta</h2>
          <p>Lengkapi data diri dan foto profil Anda. Data nama lengkap akan dicantumkan di sertifikat resmi kelulusan.</p>
        </div>
      </div>

      <div className="profile-card">
        {profileSuccess && (
          <div className="auth-alert auth-alert-success">
            <i className="ti ti-check" /> {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="auth-alert auth-alert-danger">
            <i className="ti ti-alert-circle" /> {profileError}
          </div>
        )}
        {fileError && (
          <div className="auth-alert auth-alert-danger">
            <i className="ti ti-alert-circle" /> {fileError}
          </div>
        )}

        {/* ── SEKSI FOTO PROFIL ── */}
        <div className="profile-photo-section">
          <div className="profile-photo-wrapper">
            {profileForm.photo_url ? (
              <img
                src={profileForm.photo_url}
                alt="Foto Profil"
                className="profile-photo-img"
              />
            ) : (
              <div className="profile-photo-placeholder">
                <span className="profile-photo-initial">{userInitial}</span>
              </div>
            )}
            <button
              type="button"
              className="profile-photo-badge-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah / Ubah Foto Profil"
              aria-label="Unggah foto profil"
            >
              <i className="ti ti-camera" />
            </button>
          </div>

          <div className="profile-photo-details">
            <h4 className="profile-photo-title">Foto Profil Peserta</h4>
            <p className="profile-photo-hint">
              Format yang didukung: JPG, PNG, atau WebP. Maksimal ukuran 2 MB. Disarankan pasfoto formal / semi-formal untuk kelengkapan administrasi peserta.
            </p>
            <div className="profile-photo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn-photo-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="ti ti-upload" />
                <span>{profileForm.photo_url ? 'Ganti Foto' : 'Unggah Foto'}</span>
              </button>

              {profileForm.photo_url && (
                <button
                  type="button"
                  className="btn-photo-remove"
                  onClick={handleRemovePhoto}
                  title="Hapus foto profil"
                >
                  <i className="ti ti-trash" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="profile-divider" />

        {/* ── FORM DATA DIRI ── */}
        <form onSubmit={onSubmit} className="dash-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nama Lengkap (sesuai KTP/Ijazah) <span className="req">*</span></label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Nomor Induk Kependudukan (NIK / KTP)</label>
              <input
                type="text"
                placeholder="16 digit NIK"
                value={profileForm.identity_number}
                onChange={(event) => setProfileForm({ ...profileForm, identity_number: event.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nomor Telepon / WhatsApp <span className="req">*</span></label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Jenis Kelamin</label>
              <select
                value={profileForm.gender}
                onChange={(event) => setProfileForm({ ...profileForm, gender: event.target.value })}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pendidikan Terakhir</label>
              <input
                type="text"
                placeholder="Contoh: S1 Sastra Inggris UI"
                value={profileForm.education}
                onChange={(event) => setProfileForm({ ...profileForm, education: event.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Pekerjaan / Instansi</label>
              <input
                type="text"
                placeholder="Contoh: Karyawan Swasta / Mahasiswa"
                value={profileForm.occupation}
                onChange={(event) => setProfileForm({ ...profileForm, occupation: event.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Alamat Lengkap Domisili</label>
            <textarea
              rows={3}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
              value={profileForm.address}
              onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-action"
            disabled={profileLoading}
          >
            <i className="ti ti-device-floppy" />
            <span>{profileLoading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
