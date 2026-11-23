// src/pages/RegistrationPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import PpbRegistrationPage from './registration/PpbRegistrationPage';
import BipaRegistrationPage from './registration/BipaRegistrationPage';
import PppRegistrationPage from './registration/PppRegistrationPage';
import api from '../services/api';

export default function RegistrationPage({ defaultProgram = null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const programParam = searchParams.get('program') || defaultProgram || 'ppb';
  const courseCatalogIdParam = searchParams.get('course_catalog_id');
  const studentTypeParam = searchParams.get('student_type');
  const [activeProgram, setActiveProgram] = useState(
    ['ppb', 'bipa', 'ppp'].includes(programParam.toLowerCase()) ? programParam.toLowerCase() : 'ppb'
  );
  const [studentType, setStudentType] = useState(
    ['baru', 'lanjutan'].includes(studentTypeParam) ? studentTypeParam : ''
  );
  const [registrationTrack, setRegistrationTrack] = useState(
    searchParams.get('track') || (courseCatalogIdParam && studentTypeParam === 'lanjutan' ? 'no_test' : '')
  );
  const [catalogLoading, setCatalogLoading] = useState(Boolean(courseCatalogIdParam));
  const [continuingOptions, setContinuingOptions] = useState([]);
  const [continuingLoading, setContinuingLoading] = useState(false);

  useEffect(() => {
    if (programParam && ['ppb', 'bipa', 'ppp'].includes(programParam.toLowerCase())) {
      setActiveProgram(programParam.toLowerCase());
    }
  }, [programParam]);

  useEffect(() => {
    if (!courseCatalogIdParam) {
      setCatalogLoading(false);
      return undefined;
    }

    let cancelled = false;
    setCatalogLoading(true);
    api.getCourseCatalogs().then((response) => {
      if (cancelled || !response?.success) return;
      const catalogs = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const catalog = catalogs.find((item) => String(item.id) === String(courseCatalogIdParam));
      if (!catalog) return;
      const division = String(catalog.division || '').toLowerCase();
      const program = division.startsWith('ppb') ? 'ppb' : division === 'bipa' ? 'bipa' : 'ppp';
      setActiveProgram(program);
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set('program', program);
        next.set('course_name', catalog.title);
        return next;
      }, { replace: true });
    }).finally(() => {
      if (!cancelled) setCatalogLoading(false);
    });

    return () => { cancelled = true; };
  }, [courseCatalogIdParam, setSearchParams]);

  useEffect(() => {
    if (studentType !== 'lanjutan' || !isAuthenticated || courseCatalogIdParam) return undefined;

    let cancelled = false;
    setContinuingLoading(true);
    api.getMyEnrollments()
      .then(async (enrollmentResponse) => {
        if (cancelled) return;
        const enrollments = Array.isArray(enrollmentResponse?.data)
          ? enrollmentResponse.data
          : enrollmentResponse?.data?.data || [];
        const eligibleEnrollments = enrollments.filter((enrollment) => {
          const division = String(enrollment.division || '').toLowerCase();
          const matchesProgram = activeProgram === 'ppb'
            ? division.startsWith('ppb')
            : division === activeProgram;
          return matchesProgram && String(enrollment.completion_status || '').toLowerCase() === 'lulus'
            && enrollment.course_catalog_id && enrollment.course_level_id;
        });

        const options = (await Promise.all(eligibleEnrollments.map(async (enrollment) => {
          const response = await api.getCourseLevelsByCatalog(enrollment.course_catalog_id);
          const levels = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
          const previousLevel = levels.find((level) => Number(level.id) === Number(enrollment.course_level_id));
          const nextLevel = levels.filter((level) => previousLevel && Number(level.sort_order) > Number(previousLevel.sort_order))
            .sort((left, right) => Number(left.sort_order) - Number(right.sort_order))[0];
          return nextLevel ? [{ enrollment, nextLevel }] : [];
        }))).flat();
        setContinuingOptions(options);
      })
      .catch(() => {
        if (!cancelled) setContinuingOptions([]);
      })
      .finally(() => {
        if (!cancelled) setContinuingLoading(false);
      });

    return () => { cancelled = true; };
  }, [studentType, activeProgram, isAuthenticated, courseCatalogIdParam]);

  const handleTabChange = (program) => {
    setActiveProgram(program);
    setStudentType('');
    setRegistrationTrack('');
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('program', program);
      next.delete('student_type');
      next.delete('track');
      return next;
    });
  };

  const handleStudentTypeChange = (type) => {
    setStudentType(type);
    setRegistrationTrack('');
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('program', activeProgram);
      next.set('student_type', type);
      next.delete('track');
      return next;
    });
  };

  const handleRegistrationTrackChange = (track) => {
    setRegistrationTrack(track);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('program', activeProgram);
      next.set('student_type', 'baru');
      next.set('track', track);
      return next;
    });
  };

  const handleContinueCourse = ({ enrollment, nextLevel }) => {
    setRegistrationTrack('no_test');
    setStudentType('lanjutan');
    const division = String(enrollment.division || '').toLowerCase();
    const program = division.startsWith('ppb') ? 'ppb' : division === 'bipa' ? 'bipa' : 'ppp';
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('program', program);
      next.set('student_type', 'lanjutan');
      next.set('track', 'no_test');
      next.set('course_catalog_id', String(enrollment.course_catalog_id));
      next.set('course_name', enrollment.course_name);
      next.set('next_level_id', String(nextLevel.id));
      return next;
    });
  };

  // Derive dynamic page title
  const courseNameParam = searchParams.get('course_name') || '';
  const ppbLang = (() => {
    const n = courseNameParam.toLowerCase();
    if (n.includes('english') || n.includes('inggris')) return 'Bahasa Inggris';
    if (n.includes('arab') || n.includes('arabic')) return 'Bahasa Arab';
    if (n.includes('jepang') || n.includes('japanese')) return 'Bahasa Jepang';
    if (n.includes('korea') || n.includes('korean')) return 'Bahasa Korea';
    if (n.includes('mandarin') || n.includes('chinese')) return 'Bahasa Mandarin';
    if (n.includes('prancis') || n.includes('french')) return 'Bahasa Prancis';
    if (n.includes('jerman') || n.includes('german')) return 'Bahasa Jerman';
    if (n.includes('italia') || n.includes('italian')) return 'Bahasa Italia';
    if (n.includes('rusia') || n.includes('russian')) return 'Bahasa Rusia';
    return null;
  })();
  const isEnglish = ppbLang === 'Bahasa Inggris';
  const dynamicTitle = (() => {
    if (activeProgram === 'bipa') return 'Formulir Registrasi BIPA';
    if (activeProgram === 'ppp') return 'Formulir Registrasi Layanan PPP';
    if (ppbLang) return `Formulir Registrasi ${ppbLang}`;
    if (activeProgram === 'ppb') return 'Formulir Registrasi Kursus Bahasa';
    return 'Formulir Registrasi';
  })();
  const dynamicSubtitle = (() => {
    if (activeProgram === 'bipa') return 'Pendaftaran program Bahasa Indonesia untuk Penutur Asing (BIPA) LBI FIB UI.';
    if (activeProgram === 'ppp') return 'Layanan tes bahasa, penerjemahan, dan sertifikasi LBI FIB UI.';
    if (isEnglish) return 'Pendaftaran kursus Bahasa Inggris PPB — pilih jalur tes penempatan atau kelas langsung.';
    if (ppbLang) return `Pendaftaran kursus ${ppbLang} (Non-Inggris) PPB — tes penempatan bersifat opsional.`;
    return 'Pilih program kursus bahasa LBI FIB UI. Formulir disesuaikan dengan program yang dipilih.';
  })();

  return (
    <div className="min-h-screen pb-16 bg-slate-50 dark:bg-slate-950 font-sans" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>
      {/* Top Program Navigation Tabs */}
      <div className="bg-gradient-to-r from-[#2757A4] to-[#198BCC] shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #2757A4 0%, #198BCC 100%)', boxShadow: '0 4px 20px rgba(39,87,164,0.2)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-0" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>
          <div className="text-center mb-6" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="inline-block bg-white/20 text-white font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-3" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', padding: '0.35rem 1rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Portal Pendaftaran Resmi LBI FIB UI
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-sm" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
              {dynamicTitle}
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#E1EFFA', fontSize: '1rem', margin: '0 auto', maxWidth: '650px', lineHeight: 1.6 }}>
              {dynamicSubtitle}
            </p>
          </div>

          {!courseCatalogIdParam && !defaultProgram && (
            <div className="flex gap-2 justify-center overflow-x-auto pb-0" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', overflowX: 'auto', paddingBottom: 0 }}>
              <button
                type="button"
                onClick={() => handleTabChange('ppb')}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center gap-2 cursor-pointer border-t-2 border-x-2 border-b-0 ${
                  activeProgram === 'ppb'
                    ? 'bg-white text-[#2757A4] border-white shadow-sm'
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
                style={{
                  background: activeProgram === 'ppb' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  color: activeProgram === 'ppb' ? '#2757A4' : '#ffffff',
                  border: activeProgram === 'ppb' ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.25)',
                  borderBottom: 'none',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '12px 12px 0 0',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>🇬🇧</span>
                <span>Kursus Bahasa (PPB)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('bipa')}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center gap-2 cursor-pointer border-t-2 border-x-2 border-b-0 ${
                  activeProgram === 'bipa'
                    ? 'bg-white text-emerald-700 border-white shadow-sm'
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
                style={{
                  background: activeProgram === 'bipa' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  color: activeProgram === 'bipa' ? '#059669' : '#ffffff',
                  border: activeProgram === 'bipa' ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.25)',
                  borderBottom: 'none',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '12px 12px 0 0',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>🇮🇩</span>
                <span>BIPA</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('ppp')}
                className={`px-6 py-3 rounded-t-xl font-bold text-sm sm:text-base transition-all duration-200 flex items-center gap-2 cursor-pointer border-t-2 border-x-2 border-b-0 ${
                  activeProgram === 'ppp'
                    ? 'bg-white text-purple-700 border-white shadow-sm'
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
                style={{
                  background: activeProgram === 'ppp' ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  color: activeProgram === 'ppp' ? '#7c3aed' : '#ffffff',
                  border: activeProgram === 'ppp' ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.25)',
                  borderBottom: 'none',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '12px 12px 0 0',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <span>📋</span>
                <span>Layanan PPP</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {catalogLoading ? (
          <div className="flex items-center justify-center p-8 text-slate-500 text-sm font-medium" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <span className="animate-spin mr-2">⏳</span> Memuat...
          </div>
        ) : !studentType ? (
          <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <CardHeader className="pb-3" style={{ padding: 0, marginBottom: '1.25rem' }}>
              <Badge variant="outline" className="w-fit text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" style={{ display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                {activeProgram.toUpperCase()} / Langkah 1
              </Badge>
              <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white font-bold" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                Kategori Pendaftar
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400" style={{ color: '#64748b', fontSize: '0.925rem', margin: 0 }}>
                Apakah Anda baru mendaftar atau melanjutkan kursus sebelumnya?
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStudentTypeChange('baru')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleStudentTypeChange('baru'); }}
                  className="p-5 text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                  style={{ padding: '1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <strong className="block text-slate-900 dark:text-white text-base font-bold mb-1.5 group-hover:text-blue-600 transition-colors" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Siswa Baru (Pendaftar Baru)
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    Wajib mengikuti tes penempatan untuk penentuan level kelas yang sesuai.
                  </span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStudentTypeChange('lanjutan')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleStudentTypeChange('lanjutan'); }}
                  className="p-5 text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                  style={{ padding: '1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <strong className="block text-slate-900 dark:text-white text-base font-bold mb-1.5 group-hover:text-blue-600 transition-colors" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Siswa Lanjutan
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    Bagi peserta yang telah memiliki riwayat nilai atau level di LBI FIB UI.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !authLoading && !isAuthenticated && studentType === 'lanjutan' ? (
          <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-white font-bold">
                Masuk ke akun peserta
              </CardTitle>
              <CardDescription>
                Siswa lanjutan wajib masuk ke akun peserta untuk memverifikasi riwayat kelulusan kursus sebelumnya.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="navy"
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`)}
              >
                Masuk atau buat akun
              </Button>
            </CardContent>
          </Card>
        ) : studentType === 'lanjutan' && !courseCatalogIdParam ? (
          <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="pb-3">
              <Badge variant="outline" className="w-fit text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {activeProgram.toUpperCase()} / Siswa Lanjutan
              </Badge>
              <CardTitle className="text-xl text-slate-900 dark:text-white font-bold">
                Pilih level berikutnya
              </CardTitle>
              <CardDescription>
                Hanya kursus dengan hasil kelulusan “Lulus” yang dapat dilanjutkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {continuingLoading ? (
                <p className="text-slate-500 text-sm py-4">
                  Memuat riwayat kelulusan dan jadwal berikutnya...
                </p>
              ) : continuingOptions.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">
                  Belum ada kursus yang dinyatakan lulus dengan jadwal level berikutnya yang dibuka.
                </p>
              ) : (
                <div className="grid gap-3">
                  {continuingOptions.map(({ enrollment, nextLevel }) => (
                    <div
                      key={`${enrollment.id}-${nextLevel.id}`}
                      className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div>
                        <strong className="block text-slate-900 dark:text-white font-semibold">
                          {enrollment.course_name} / {nextLevel.name}
                        </strong>
                        <div className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Lulus level sebelumnya: {enrollment.level_name}
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleContinueCourse({ enrollment, nextLevel })}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : activeProgram === 'ppb' && !registrationTrack ? (
          <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <CardHeader className="pb-3" style={{ padding: 0, marginBottom: '1.25rem' }}>
              <Badge variant="outline" className="w-fit text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" style={{ display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                PPB / Langkah 2
              </Badge>
              <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white font-bold" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                Jalur Pendaftaran
              </CardTitle>
              <CardDescription style={{ color: '#64748b', fontSize: '0.925rem', margin: 0 }}>
                Pilih tes penempatan atau langsung ke kelas tanpa tes.
              </CardDescription>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRegistrationTrackChange('placement_test')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrationTrackChange('placement_test'); }}
                  className="p-5 text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                  style={{ padding: '1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <strong className="block text-slate-900 dark:text-white text-base font-bold mb-1.5 group-hover:text-blue-600 transition-colors" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                    Jalur Dengan Tes Penempatan
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                    Calon siswa baru PPB Bahasa Inggris diwajibkan mengambil tes penempatan guna memastikan kesesuaian level kompetensi.
                  </span>
                </div>

                {/* Only show without test if NOT english new student */}
                {!(isEnglish && studentType === 'baru') && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleRegistrationTrackChange('no_test')}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRegistrationTrackChange('no_test'); }}
                    className="p-5 text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                    style={{ padding: '1.25rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#ffffff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <strong className="block text-slate-900 dark:text-white text-base font-bold mb-1.5 group-hover:text-blue-600 transition-colors" style={{ display: 'block', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                      Jalur Tanpa Tes (Siswa Lanjutan / Direct Entry)
                    </strong>
                    <span className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed" style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                      Pilih jadwal sesuai level yang sudah diketahui.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
                <span className="font-bold text-[#2757A4] dark:text-blue-400">{activeProgram.toUpperCase()}</span> / {studentType === 'lanjutan' ? 'Siswa Lanjutan' : 'Siswa Baru'} / Formulir pendaftaran
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStudentTypeChange('')}
              >
                Ubah pilihan
              </Button>
            </div>
            {activeProgram === 'ppb' && <PpbRegistrationPage showTrackSelector={false} />}
            {activeProgram === 'bipa' && <BipaRegistrationPage />}
            {activeProgram === 'ppp' && <PppRegistrationPage />}
          </div>
        )}
      </div>
    </div>
  );
}
