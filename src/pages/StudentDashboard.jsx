import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import lbiLogo from '../assets/lbi-logo.png';
import DashboardTab from '../components/student-dashboard/DashboardTab';
import CoursesTab from '../components/student-dashboard/CoursesTab';
import PaymentsTab from '../components/student-dashboard/PaymentsTab';
import ProfileTab from '../components/student-dashboard/ProfileTab';
import RegistrationsTab from '../components/student-dashboard/RegistrationsTab';

const INITIAL_PROFILE_FORM = {
  name: '',
  identity_number: '',
  phone: '',
  gender: 'Laki-laki',
  education: '',
  occupation: '',
  address: '',
  photo_url: '',
};

const NAV_ITEMS = [
  { key: 'dashboard',     icon: 'ti-layout-dashboard', label: 'Dashboard',       sublabel: 'Ringkasan & grafik aktivitas' },
  { key: 'registrations', icon: 'ti-file-text',        label: 'Registrasi Saya', sublabel: 'Tagihan & status pendaftaran' },
  { key: 'courses',       icon: 'ti-book-2',           label: 'Kursus Saya',     sublabel: 'Riwayat & status kursus' },
  { key: 'payments',      icon: 'ti-receipt',          label: 'Pembayaran',       sublabel: 'BNI VA & konfirmasi bayar' },
  { key: 'profile',       icon: 'ti-user-circle',      label: 'Profil Saya',     sublabel: 'Data diri & foto akun' },
];

export default function StudentDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, refreshUser, loading: authLoading } = useAuth();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.matchMedia('(max-width: 900px)').matches);

  const [myEnrollments, setMyEnrollments] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [courseList, setCourseList] = useState({ items: [], meta: null, loading: false, error: '' });
  const [registrationList, setRegistrationList] = useState({ items: [], meta: null, loading: false, error: '' });
  const [paymentPagination, setPaymentPagination] = useState(null);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [payForm, setPayForm] = useState({
    enrollment_id: '',
    payment_for: 'registration',
    bank_name: 'Bank BNI',
    account_number: '',
    account_holder: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [proofFile, setProofFile] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');
  const [payError, setPayError] = useState('');
  const [profileForm, setProfileForm] = useState(INITIAL_PROFILE_FORM);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const enrollmentPage = activeTab === 'courses' ? coursePage : registrationPage;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const updateViewport = (event) => {
      setIsMobileViewport(event.matches);
      setMobileNavOpen(false);
    };

    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?redirect=${redirect}`, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        identity_number: user.profile?.identity_number || '',
        phone: user.profile?.phone || '',
        gender: user.profile?.gender || 'Laki-laki',
        education: user.profile?.education || '',
        occupation: user.profile?.occupation || '',
        address: user.profile?.address || '',
        photo_url: user.profile?.photo_url || '',
      });
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    setDashboardError('');
    try {
      const dashboardResponse = await api.getStudentDashboard();
      if (!dashboardResponse?.success || !dashboardResponse.data) {
        throw new Error(dashboardResponse?.message || 'Gagal memuat dashboard peserta.');
      }
      const dashboardData = dashboardResponse.data;
      setMyEnrollments(Array.isArray(dashboardData.enrollments) ? dashboardData.enrollments : []);
      setDashboardSummary(dashboardData.summary || null);
    } catch (error) {
      console.error('Error fetching student portal data:', error);
      setDashboardError(error.message || 'Gagal memuat data dashboard peserta.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !['courses', 'registrations'].includes(activeTab)) return undefined;

    let isCurrentRequest = true;
    const setList = activeTab === 'courses' ? setCourseList : setRegistrationList;
    setList((current) => ({ ...current, loading: true, error: '' }));

    api.getMyEnrollments(enrollmentPage)
      .then((response) => {
        if (!isCurrentRequest) return;
        if (!response?.success || !Array.isArray(response.data) || !response.meta) {
          throw new Error(response?.message || 'Respons pagination riwayat pendaftaran tidak valid.');
        }
        setList({
          items: response.data,
          meta: response.meta,
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setList((current) => ({
          ...current,
          loading: false,
          error: error.message || 'Gagal memuat riwayat pendaftaran.',
        }));
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isAuthenticated, activeTab, enrollmentPage, listRefreshKey]);

  useEffect(() => {
    if (!isAuthenticated || !['dashboard', 'payments'].includes(activeTab)) return undefined;

    let isCurrentRequest = true;
    setPaymentHistoryLoading(true);
    setPaymentHistoryError('');
    api.getMyPayments(paymentPage)
      .then((response) => {
        if (!isCurrentRequest) return;
        if (!response?.success || !Array.isArray(response.data) || !response.meta) {
          throw new Error(response?.message || 'Respons pagination riwayat pembayaran tidak valid.');
        }
        setMyPayments(response.data);
        setPaymentPagination(response.meta);
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setPaymentHistoryError(error.message || 'Gagal memuat riwayat pembayaran.');
      })
      .finally(() => {
        if (isCurrentRequest) setPaymentHistoryLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isAuthenticated, activeTab, paymentPage, listRefreshKey]);

  useEffect(() => {
    if (isAuthenticated) loadDashboardData();
  }, [isAuthenticated]);

  const refreshCurrentData = async () => {
    setListRefreshKey((key) => key + 1);
    await loadDashboardData();
  };

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
    setPaySuccess('');
    setMobileNavOpen(false);
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!proofFile) {
      setPayError('Silakan unggah bukti transfer sebelum mengirim konfirmasi.');
      return;
    }
    setPayLoading(true);
    setPayError('');
    setPaySuccess('');
    const paymentEnrollment = myEnrollments.find((enrollment) => String(enrollment.id) === String(payForm.enrollment_id));
    const formData = new FormData();
    if (payForm.enrollment_id) formData.append('enrollment_id', payForm.enrollment_id);
    formData.append('payment_for', payForm.payment_for || 'registration');
    formData.append('student_name', paymentEnrollment?.student_name || user?.name || '');
    formData.append('student_email', paymentEnrollment?.student_email || user?.email || '');
    if (paymentEnrollment?.course_name) formData.append('course_name', paymentEnrollment.course_name);
    formData.append('bank_name', payForm.bank_name);
    formData.append('account_number', payForm.account_number);
    formData.append('account_holder', payForm.account_holder);
    formData.append('amount', payForm.amount);
    formData.append('payment_date', payForm.payment_date);
    formData.append('proof_file', proofFile);
    try {
      const response = await api.submitPaymentConfirmation(formData);
      if (response?.success) {
        setPaySuccess('Konfirmasi pembayaran berhasil dikirim! Tim finance kami akan segera memverifikasi.');
        setProofFile(null);
        await refreshCurrentData();
      } else {
        setPayError(response?.message || 'Gagal mengirim konfirmasi pembayaran.');
      }
    } catch (error) {
      setPayError(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const response = await api.updateStudentProfile(profileForm);
      if (response?.success) {
        setProfileSuccess('Profil berhasil diperbarui!');
        await refreshUser();
      } else {
        setProfileError(response?.message || 'Gagal memperbarui profil.');
      }
    } catch (error) {
      setProfileError(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusBadge = (status, context = 'enrollment') => {
    const normalizedStatus = String(status || '').toLowerCase();
    const enrollmentStatuses = {
      pending: ['status-pending', 'Menunggu Pembayaran'],
      pending_payment: ['status-pending', 'Menunggu Pembayaran'],
      placement_test: ['status-waiting', 'Menunggu Tes Penempatan'],
      awaiting_level: ['status-waiting', 'Menunggu Penetapan Level'],
      schedule_selection: ['status-waiting', 'Pilih Jadwal'],
      awaiting_test_result: ['status-waiting', 'Menunggu Hasil Tes'],
      placement_test_failed: ['status-rejected', 'Tidak Lolos Tes'],
      waiting_verification: ['status-waiting', 'Menunggu Verifikasi'],
      approved: ['status-active', 'Disetujui'],
      paid: ['status-active', 'Aktif / Lunas'],
      active: ['status-active', 'Aktif'],
      verified: ['status-active', 'Aktif / Lunas'],
      completed: ['status-completed', 'Selesai'],
      rejected: ['status-rejected', 'Ditolak'],
      postponed: ['status-waiting', 'Ditunda'],
    };
    const paymentStatuses = {
      pending: ['status-waiting', 'Menunggu Verifikasi'],
      waiting_verification: ['status-waiting', 'Menunggu Verifikasi'],
      verified: ['status-active', 'Terverifikasi'],
      paid: ['status-active', 'Lunas'],
      rejected: ['status-rejected', 'Ditolak'],
    };
    const statusMap = context === 'payment' ? paymentStatuses : enrollmentStatuses;
    const [className, label] = statusMap[normalizedStatus] || ['status-default', status || 'Belum ada status'];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const handlePaymentSelect = (enrollment) => {
    const isTuition = Boolean(enrollment.course_schedule_id && Number(enrollment.tuition_fee) > 0);
    const paymentFor = isTuition ? 'tuition' : 'registration';
    const amount = isTuition ? enrollment.tuition_fee : enrollment.registration_fee;
    setPayForm((prev) => ({ ...prev, enrollment_id: enrollment.id, payment_for: paymentFor, amount }));
    handleTabChange('payments');
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const userPhoto = profileForm.photo_url || user?.profile?.photo_url || null;
  const pendingCount = myEnrollments.filter(e => ['pending','pending_payment'].includes(String(e.status).toLowerCase())).length;

  return (
    <div className={`sd-layout ${!isMobileViewport && sidebarCollapsed ? 'sd-sidebar-collapsed' : ''} ${isMobileViewport && mobileNavOpen ? 'sd-mobile-nav-open' : ''}`}>

      {/* ── TOP BAR ── */}
      <header className="sd-topbar">
        <div className="sd-topbar-left">
          <button
            className={`sd-sidebar-toggle ${(isMobileViewport ? mobileNavOpen : sidebarCollapsed) ? 'is-collapsed' : ''}`}
            onClick={() => {
              if (isMobileViewport) {
                setMobileNavOpen((isOpen) => !isOpen);
              } else {
                setSidebarCollapsed((isCollapsed) => !isCollapsed);
              }
            }}
            aria-label={(isMobileViewport ? mobileNavOpen : sidebarCollapsed) ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMobileViewport ? mobileNavOpen : !sidebarCollapsed}
            title={(isMobileViewport ? mobileNavOpen : sidebarCollapsed) ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            <span className="sd-burger-line" />
            <span className="sd-burger-line" />
            <span className="sd-burger-line" />
          </button>
          <Link to="/" className="sd-brand" title="Ke Beranda Utama">
            <div className="sd-brand-logo-card">
              <img src={lbiLogo} alt="Logo LBI FIB UI" className="sd-brand-logo" />
            </div>
            <div className="sd-brand-info">
              <span className="sd-brand-name">Portal Peserta</span>
              <span className="sd-brand-sub">LBI FIB UI</span>
            </div>
          </Link>
        </div>

        <div className="sd-topbar-center">
          {/* Breadcrumb / current section label */}
          <span className="sd-section-label">
            <i className={`ti ${NAV_ITEMS.find(n => n.key === activeTab)?.icon || 'ti-layout-dashboard'}`} />
            {NAV_ITEMS.find(n => n.key === activeTab)?.label || 'Dashboard'}
          </span>
        </div>

        <div className="sd-topbar-right">
          <Link to="/" className="sd-back-btn">
            <i className="ti ti-arrow-left" />
            <span>Halaman Utama</span>
          </Link>
          <div className="sd-topbar-user">
            <div className="sd-topbar-avatar">{userInitial}</div>
            <div className="sd-topbar-meta">
              <span className="sd-topbar-name">{user?.name || 'Peserta'}</span>
              <span className="sd-topbar-role">Siswa LBI FIB UI</span>
            </div>
            <button className="sd-topbar-logout" onClick={logout} title="Keluar">
              <i className="ti ti-logout" />
            </button>
          </div>
        </div>
      </header>

      <div className="sd-body">
        {/* ── SIDEBAR ── */}
        <aside className="sd-sidebar">
          {/* User profile panel */}
          <div className="sd-sidebar-profile">
            <div className="sd-profile-avatar-wrap">
              {userPhoto ? (
                <img src={userPhoto} alt={user?.name || 'Peserta'} className="sd-profile-avatar-img" />
              ) : (
                <div className="sd-profile-avatar">{userInitial}</div>
              )}
              <div className="sd-profile-online-dot" />
            </div>
            <div className="sd-profile-info">
              <p className="sd-profile-name">{user?.name || 'Peserta'}</p>
              <p className="sd-profile-email">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sd-nav" aria-label="Navigasi dashboard peserta">
            <p className="sd-nav-label">Menu Utama</p>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`sd-nav-item ${activeTab === item.key ? 'is-active' : ''}`}
                onClick={() => handleTabChange(item.key)}
              >
                <span className="sd-nav-icon">
                  <i className={`ti ${item.icon}`} />
                </span>
                <span className="sd-nav-text">
                  <span className="sd-nav-label-text">{item.label}</span>
                  <span className="sd-nav-sublabel">{item.sublabel}</span>
                </span>
                {item.key === 'payments' && pendingCount > 0 && (
                  <span className="sd-nav-badge">{pendingCount}</span>
                )}
                <i className="ti ti-chevron-right sd-nav-arrow" />
              </button>
            ))}
          </nav>

          {/* Help card */}
          <div className="sd-help-card">
            <div className="sd-help-icon"><i className="ti ti-headset" /></div>
            <div className="sd-help-body">
              <h5>Butuh Bantuan?</h5>
              <p>Hubungi sekretariat LBI FIB UI untuk kendala administrasi.</p>
              <a href="https://wa.me/6281945747271" target="_blank" rel="noreferrer" className="sd-help-wa">
                <i className="ti ti-brand-whatsapp" />
                Chat Admin via WA
              </a>
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="sd-sidebar-footer">
            <button className="sd-logout-full" onClick={logout}>
              <i className="ti ti-logout" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="sd-content">
          {activeTab === 'dashboard' && (
            <DashboardTab
              user={user}
              enrollments={myEnrollments}
              payments={myPayments}
              summary={dashboardSummary}
              error={dashboardError}
              loading={loadingData}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === 'courses' && (
            <CoursesTab
              user={user}
              enrollments={courseList.items}
              pagination={courseList.meta}
              loading={courseList.loading}
              error={courseList.error}
              onPageChange={setCoursePage}
              onTabChange={handleTabChange}
              onPaymentSelect={handlePaymentSelect}
              getStatusBadge={getStatusBadge}
              onRefresh={refreshCurrentData}
            />
          )}
          {activeTab === 'registrations' && (
            <RegistrationsTab
              enrollments={registrationList.items}
              pagination={registrationList.meta}
              loading={registrationList.loading}
              error={registrationList.error}
              onPageChange={setRegistrationPage}
              onPaymentSelect={handlePaymentSelect}
              onTabChange={handleTabChange}
              getStatusBadge={getStatusBadge}
              onRefresh={refreshCurrentData}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsTab
              user={user}
              enrollments={myEnrollments}
              payments={myPayments}
              paymentPagination={paymentPagination}
              paymentHistoryLoading={paymentHistoryLoading}
              paymentHistoryError={paymentHistoryError}
              paymentPage={paymentPage}
              onPaymentPageChange={setPaymentPage}
              payForm={payForm}
              setPayForm={setPayForm}
              onRefresh={refreshCurrentData}
              getStatusBadge={getStatusBadge}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              profileSuccess={profileSuccess}
              profileError={profileError}
              profileLoading={profileLoading}
              onSubmit={handleProfileSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
