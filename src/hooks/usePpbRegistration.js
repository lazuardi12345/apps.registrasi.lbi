// src/hooks/usePpbRegistration.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { inferPpbLanguage } from '../utils/registrationHelpers';

export function usePpbRegistration({ showTrackSelector = true } = {}) {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const courseCatalogIdParam = searchParams.get('course_catalog_id');
  const courseNameParam = searchParams.get('course_name');
  const termIdParam = searchParams.get('term_id');
  const trackParam = searchParams.get('track');

  // Registration Track: 'placement_test' (Dengan Tes) vs 'no_test' (Tanpa Tes)
  const [registrationTrack, setRegistrationTrack] = useState(
    trackParam === 'placement_test' || trackParam === 'tes' ? 'placement_test' : 'no_test'
  );

  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [courseCatalogs, setCourseCatalogs] = useState([]);
  const [selectedCourseCatalogId, setSelectedCourseCatalogId] = useState(courseCatalogIdParam || '');
  const [selectedCourseName, setSelectedCourseName] = useState(courseNameParam || '');
  const [feeAmount, setFeeAmount] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [testLanguage, setTestLanguage] = useState(() => inferPpbLanguage(courseNameParam) || 'English');
  const [testDate, setTestDate] = useState('');
  const [identityFiles, setIdentityFiles] = useState({ identity_document: null, kitas_document: null, passport_document: null });

  const [form, setForm] = useState({
    division: 'ppb',
    student_type: searchParams.get('student_type') || 'baru',
    student_category: 'baru',
    discount_percent: 0,
    term_period: '',
    term_id: null,
    registration_track: registrationTrack,
    student_name: '',
    student_email: '',
    student_phone: '',
    emergency_phone: '',
    identity_number: '',
    nationality: 'wni',
    identity_type: 'ktp',
    kitas_number: '',
    passport_number: '',
    birth_place: '',
    birth_date: '',
    gender: '',
    education: '',
    occupation: '',
    address: '',
    information_sources: [],
    information_source_other: '',
    relief_requested: false,
    terms_accepted: false,
    campus_location: 'depok',
    learning_mode: 'daring',
    course_name: '',
    level_name: '',
    schedule_days: '',
    schedule_time: '',
    registration_fee: 0,
    notes: ''
  });

  // Autofill from user profile if logged in
  useEffect(() => {
    if (!user) return;
    const profile = user.profile || {};
    setForm((previous) => ({
      ...previous,
      student_name: profile.full_name || user.name || previous.student_name || '',
      student_email: user.email || previous.student_email || '',
      student_phone: profile.phone || previous.student_phone || '',
      identity_number: profile.identity_number || previous.identity_number || '',
      birth_place: profile.birth_place || previous.birth_place || '',
      birth_date: profile.birth_date ? String(profile.birth_date).slice(0, 10) : (previous.birth_date || ''),
      gender: profile.gender || previous.gender || '',
      education: profile.education || previous.education || '',
      occupation: profile.occupation || previous.occupation || '',
      address: profile.address || previous.address || '',
      emergency_phone: profile.emergency_phone || previous.emergency_phone || '',
    }));
  }, [user]);

  const handleAutofillFromProfile = async () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const res = await api.getMe();
        if (res?.success && res.data) {
          currentUser = res.data;
        }
      } catch (err) {
        console.warn('Gagal memuat profil peserta:', err);
      }
    }

    if (currentUser) {
      const profile = currentUser.profile || {};
      setForm((prev) => ({
        ...prev,
        student_name: profile.full_name || currentUser.name || prev.student_name,
        student_email: currentUser.email || prev.student_email,
        student_phone: profile.phone || prev.student_phone,
        identity_number: profile.identity_number || prev.identity_number,
        birth_place: profile.birth_place || prev.birth_place,
        birth_date: profile.birth_date ? String(profile.birth_date).slice(0, 10) : prev.birth_date,
        gender: profile.gender || prev.gender,
        education: profile.education || prev.education,
        occupation: profile.occupation || prev.occupation,
        address: profile.address || prev.address,
        emergency_phone: profile.emergency_phone || prev.emergency_phone,
      }));
    }
  };

  // Inferred language helpers
  const selectedCourseCatalog = courseCatalogs.find((catalog) => String(catalog.id) === String(selectedCourseCatalogId));
  const detectedLanguage = inferPpbLanguage(selectedCourseName || form.course_name || selectedCourseCatalog?.title || courseNameParam);
  const isEnglishCourse = detectedLanguage === 'English';
  const isNonEnglishCourse = Boolean(detectedLanguage && detectedLanguage !== 'English');

  // PAKSA PLACEMENT TEST untuk Bahasa Inggris + Siswa Baru
  useEffect(() => {
    if (isEnglishCourse && form.student_type !== 'lanjutan') {
      if (registrationTrack !== 'placement_test') {
        setRegistrationTrack('placement_test');
        setForm((prev) => ({ ...prev, registration_track: 'placement_test' }));
        setSearchParams((prev) => {
          const p = new URLSearchParams(prev);
          p.set('track', 'placement_test');
          return p;
        });
      }
    }
  }, [isEnglishCourse, form.student_type]);

  // Keep URL query param in sync
  const switchTrack = (track) => {
    if (isEnglishCourse && form.student_type !== 'lanjutan' && track === 'no_test') {
      openValidationModal([
        'Program Bahasa Inggris: Seluruh peserta baru WAJIB mengikuti Tes Penempatan (Placement Test). Jalur Kelas Langsung (Tanpa Tes) hanya tersedia untuk Siswa Lanjutan yang telah lulus level sebelumnya di LBI FIB UI.'
      ]);
      return;
    }

    setRegistrationTrack(track);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('track', track);
      return p;
    });

    if (track === 'placement_test') {
      setForm((prev) => ({
        ...prev,
        registration_track: 'placement_test',
        course_name: selectedCourseName || courseNameParam || '',
        level_name: '',
        course_schedule_id: '',
        schedule_days: '',
        schedule_time: '',
        discount_percent: 0
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        registration_track: 'no_test',
        course_name: selectedCourseName || courseNameParam || '',
        level_name: '',
        course_schedule_id: '',
        schedule_days: '',
        schedule_time: '',
        registration_fee: 0
      }));
    }
  };

  const handleStudentCategoryType = (type) => {
    const newTrack = (isEnglishCourse && type !== 'lanjutan') ? 'placement_test' : registrationTrack;

    setForm((prev) => ({
      ...prev,
      student_type: type,
      student_category: type === 'lanjutan' ? 'lanjutan' : (prev.student_category === 'lanjutan' ? 'baru' : prev.student_category),
      registration_track: newTrack
    }));

    if (isEnglishCourse && type !== 'lanjutan') {
      setRegistrationTrack('placement_test');
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set('track', 'placement_test');
        return p;
      });
    }
  };

  const handleCourseCatalogChange = (catalogId) => {
    const catalog = courseCatalogs.find((item) => String(item.id) === String(catalogId));
    setSelectedCourseCatalogId(catalogId);
    setSelectedCourseName(catalog?.title || '');
    if (catalog) setTestLanguage(inferPpbLanguage(catalog.title) || testLanguage);
    setForm((previous) => ({
      ...previous,
      course_catalog_id: catalog?.id || '',
      course_name: catalog?.title || '',
      level_name: '',
      course_schedule_id: '',
      schedule_days: '',
      schedule_time: '',
      registration_fee: 0,
    }));
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (catalog) {
        next.set('course_catalog_id', String(catalog.id));
        next.set('course_name', catalog.title);
      } else {
        next.delete('course_catalog_id');
        next.delete('course_name');
      }
      return next;
    });
  };

  // Load active PPB terms
  useEffect(() => {
    async function loadTerms() {
      setLoading(true);
      try {
        const res = await api.getTerms('ppb');
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setTerms(res.data);
          const current = res.data.find((term) => String(term.id) === termIdParam)
            || res.data.find((t) => t.is_current)
            || res.data[0];
          setSelectedTermId(current.id);
          setSelectedTerm(current);
          setForm((prev) => ({
            ...prev,
            term_id: current.id,
            term_period: current.name,
            course_catalog_id: courseCatalogIdParam || prev.course_catalog_id,
            course_name: courseNameParam || prev.course_name
          }));
        }
      } catch (err) {
        console.error('Error loading terms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTerms();
  }, []);

  // Load catalogs
  useEffect(() => {
    let cancelled = false;
    api.getCourseCatalogs().then((response) => {
      if (cancelled) return;
      const catalogs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      const ppbCatalogs = catalogs.filter((catalog) => String(catalog.division || '').toLowerCase().startsWith('ppb'));
      setCourseCatalogs(ppbCatalogs);
      const selectedCatalog = ppbCatalogs.find((catalog) => String(catalog.id) === String(courseCatalogIdParam));
      if (selectedCatalog) {
        setSelectedCourseCatalogId(String(selectedCatalog.id));
        setSelectedCourseName(selectedCatalog.title);
        setForm((previous) => ({ ...previous, course_catalog_id: selectedCatalog.id, course_name: selectedCatalog.title }));
      }
    }).catch(() => setCourseCatalogs([]));
    return () => { cancelled = true; };
  }, [courseCatalogIdParam]);

  // Load fee
  useEffect(() => {
    if (!selectedTermId) return undefined;
    let cancelled = false;
    setFeeLoading(true);
    api.getCourseFee({
      fee_type: 'registration',
      division: 'ppb',
      course_catalog_id: selectedCourseCatalogId,
      term_id: selectedTermId,
    }).then((response) => {
      if (!cancelled) setFeeAmount(response?.data?.amount ?? null);
    }).catch(() => {
      if (!cancelled) setFeeAmount(null);
    }).finally(() => {
      if (!cancelled) setFeeLoading(false);
    });
    return () => { cancelled = true; };
  }, [selectedCourseCatalogId, selectedTermId]);

  const handleTermChange = (termId) => {
    const tId = parseInt(termId, 10);
    setSelectedTermId(tId);
    const foundTerm = terms.find((t) => t.id === tId);
    setSelectedTerm(foundTerm || null);
    setForm((prev) => ({
      ...prev,
      term_id: tId,
      term_period: foundTerm ? foundTerm.name : '',
      course_name: selectedCourseName || courseNameParam || prev.course_name,
      level_name: '',
      schedule_days: '',
      schedule_time: '',
      course_schedule_id: '',
      registration_fee: 0
    }));
  };

  const handleStudentTypeChange = (type) => {
    let discount = 0;
    if (type === 'civitas_ui' || type === 'mahasiswa_ui') discount = 25;
    if (type === 'dosen_tendik_ui') discount = 50;

    setForm((prev) => ({
      ...prev,
      student_category: type,
      discount_percent: discount
    }));
  };

  const finalFee = feeAmount !== null ? Math.max(0, Number(feeAmount)) : 160000;

  const openValidationModal = (messages) => {
    setValidationErrors([...new Set(messages.filter(Boolean))]);
    setShowValidationModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const fieldErrors = Array.from(formElement.elements)
      .filter((field) => field.willValidate && !field.checkValidity())
      .map((field) => {
        const label = field.getAttribute('aria-label')
          || field.labels?.[0]?.textContent
          || field.closest('label')?.textContent
          || field.parentElement?.querySelector('label')?.textContent
          || field.placeholder
          || field.name
          || 'Kolom formulir';
        return `${label.replace(/\s+/g, ' ').trim()}: ${field.validationMessage || 'Periksa kembali isian ini.'}`;
      });

    if (!selectedCourseCatalogId || !form.course_name) {
      fieldErrors.push('Program / Bahasa: Pilih program atau kursus terlebih dahulu.');
    }
    if (!selectedTermId) {
      fieldErrors.push('Periode / Term: Pilih term aktif terlebih dahulu.');
    }

    // VALIDASI KERAS: Bahasa Inggris + Siswa Baru WAJIB Placement Test
    if (isEnglishCourse && form.student_type !== 'lanjutan' && registrationTrack !== 'placement_test') {
      fieldErrors.push('Program Bahasa Inggris: Peserta baru wajib menggunakan jalur Tes Penempatan (Placement Test). Silakan pilih jalur yang benar atau ubah kategori peserta menjadi Siswa Lanjutan jika memang sudah pernah mengikuti kursus sebelumnya.');
    }

    if (registrationTrack === 'placement_test') {
      if (!testDate) fieldErrors.push('Tanggal tes penempatan: Pilih tanggal tes secara manual.');
    }
    if (!['depok', 'salemba'].includes(form.campus_location)) {
      fieldErrors.push('Preferensi lokasi kursus: Pilih Kampus Depok atau Salemba.');
    }
    if (form.information_sources.length === 0) {
      fieldErrors.push('Sumber informasi LBI: Pilih minimal satu sumber.');
    }

    if (fieldErrors.length > 0) {
      openValidationModal(fieldErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        nationality: form.nationality,
        division: 'ppb',
        course_catalog_id: Number(selectedCourseCatalogId),
        registration_track: registrationTrack,
        term_id: selectedTermId,
        term_period: selectedTerm?.name || form.term_period,
        course_name: form.course_name,
        level_name: '',
        registration_fee: finalFee,
        metadata: {
          registration_track: registrationTrack,
          next_level_id: searchParams.get('next_level_id') || undefined,
          test_language: registrationTrack === 'placement_test' ? testLanguage : undefined,
          test_date: registrationTrack === 'placement_test' ? testDate : undefined,
          nationality: form.nationality,
          identity_type: form.identity_type,
          student_category: form.student_category,
          identity_number: form.identity_number,
          emergency_phone: form.emergency_phone,
          information_sources: form.information_sources,
          information_source_other: form.information_source_other,
          relief_requested: form.relief_requested,
          terms_accepted: form.terms_accepted,
          profile: {
            birth_place: form.birth_place,
            birth_date: form.birth_date,
            gender: form.gender,
            education: form.education,
            occupation: form.occupation,
            address: form.address,
          },
          address: form.address,
          notes: form.notes
        },
        identity_document: identityFiles.identity_document,
        kitas_document: identityFiles.kitas_document,
        passport_document: identityFiles.passport_document,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'metadata') {
          Object.entries(value).forEach(([metadataKey, metadataValue]) => {
            if (metadataValue === undefined) return;
            if (Array.isArray(metadataValue)) {
              metadataValue.forEach((item, index) => formData.append(`metadata[${metadataKey}][${index}]`, item));
            } else if (metadataValue && typeof metadataValue === 'object') {
              Object.entries(metadataValue).forEach(([nestedKey, nestedValue]) => formData.append(`metadata[${metadataKey}][${nestedKey}]`, nestedValue === true ? '1' : nestedValue === false ? '0' : nestedValue ?? ''));
            } else {
              formData.append(`metadata[${metadataKey}]`, metadataValue === true ? '1' : metadataValue === false ? '0' : String(metadataValue));
            }
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const res = await api.submitPpbEnrollment(formData);

      if (res?.success && res.data) {
        setSuccessData(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        openValidationModal([res?.message || 'Gagal mengirimkan pendaftaran. Silakan periksa kembali data Anda.']);
      }
    } catch (err) {
      const apiFieldLabels = {
        'metadata.test_date': 'Tanggal tes penempatan',
        'metadata.terms_accepted': 'Persetujuan syarat dan ketentuan',
        course_schedule_id: 'Jadwal kursus',
        course_catalog_id: 'Program / Bahasa',
        campus_location: 'Preferensi lokasi kursus',
        student_name: 'Nama lengkap',
        student_email: 'Email aktif',
        student_phone: 'Nomor telepon',
        identity_number: 'Nomor identitas',
        'metadata.identity_number': 'Nomor identitas',
        'metadata.emergency_phone': 'Nomor darurat'
      };
      const apiFieldErrors = Object.entries(err.data?.errors || {}).flatMap(([field, messages]) =>
        (Array.isArray(messages) ? messages : [messages]).map((message) => `${apiFieldLabels[field] || field}: ${message}`)
      );
      openValidationModal(apiFieldErrors.length ? apiFieldErrors : [err.message || 'Terjadi kesalahan sistem.']);
    } finally {
      setSubmitting(false);
    }
  };

  const pageFormTitle = isEnglishCourse
    ? 'Formulir Pendaftaran Kursus Bahasa Inggris'
    : isNonEnglishCourse
      ? `Formulir Pendaftaran Kursus ${detectedLanguage}`
      : 'Formulir Pendaftaran Kursus PPB LBI FIB UI';

  const pageFormBadge = isEnglishCourse
    ? 'DIVISI PPB · PROGRAM BAHASA INGGRIS'
    : isNonEnglishCourse
      ? `DIVISI PPB · BAHASA NON-INGGRIS (${detectedLanguage?.toUpperCase()})`
      : 'DIVISI PPB (PROGRAM PELAYANAN BAHASA)';

  const pageFormSubtitle = isEnglishCourse
    ? 'Silakan lengkapi formulir pendaftaran kursus Bahasa Inggris. Bagi calon peserta baru, ikuti Tes Penempatan (Placement Test) untuk penentuan level kursus yang tepat.'
    : isNonEnglishCourse
      ? `Silakan lengkapi formulir pendaftaran kursus ${detectedLanguage}. Calon peserta tingkat pemula dapat langsung mendaftar kelas dasar (Level 1) tanpa tes penempatan.`
      : 'Silakan pilih jalur pendaftaran, periode term, dan lengkapi data peserta kursus bahasa PPB LBI FIB UI.';

  return {
    form,
    setForm,
    registrationTrack,
    setRegistrationTrack,
    terms,
    selectedTermId,
    selectedTerm,
    courseCatalogs,
    selectedCourseCatalog,
    selectedCourseCatalogId,
    selectedCourseName,
    courseCatalogIdParam,
    courseNameParam,
    termIdParam,
    feeAmount,
    feeLoading,
    loading,
    submitting,
    successData,
    validationErrors,
    showValidationModal,
    setShowValidationModal,
    copied,
    setCopied,
    testLanguage,
    setTestLanguage,
    testDate,
    setTestDate,
    identityFiles,
    setIdentityFiles,
    isEnglishCourse,
    isNonEnglishCourse,
    detectedLanguage,
    finalFee,
    pageFormTitle,
    pageFormSubtitle,
    pageFormBadge,
    switchTrack,
    handleStudentCategoryType,
    handleCourseCatalogChange,
    handleTermChange,
    handleStudentTypeChange,
    handleAutofillFromProfile,
    openValidationModal,
    handleSubmit,
    searchParams,
    isAuthenticated,
    user
  };
}
