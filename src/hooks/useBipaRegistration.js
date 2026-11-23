// src/hooks/useBipaRegistration.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function useBipaRegistration() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const courseCatalogIdParam = searchParams.get('course_catalog_id');
  const courseNameParam = searchParams.get('course_name');
  const termIdParam = searchParams.get('term_id');

  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [courseCatalogs, setCourseCatalogs] = useState([]);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [documentFiles, setDocumentFiles] = useState({ photo: null, passport: null, sponsor: null });
  const [selectedCourseCatalogId, setSelectedCourseCatalogId] = useState(courseCatalogIdParam || '');
  const [feeAmount, setFeeAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    division: 'bipa',
    student_type: searchParams.get('student_type') || 'baru',
    term_period: '',
    term_id: null,
    student_name: '',
    student_email: '',
    student_phone: '',
    birth_date: '',
    birth_place: '',
    gender: '',
    education: '',
    occupation: '',
    address: '',
    emergency_contact: '',
    nationality: '',
    passport_number: '',
    country_of_origin: '',
    native_language: '',
    visa_type: 'tourist', // tourist | student_kitas | diplomatic | other
    kitas_number: '',
    proficiency_level: 'beginner', // beginner | intermediate | advanced
    purpose_of_study: '',
    information_source: '',
    terms_accepted: false,
    campus_location: 'depok',
    learning_mode: 'luring',
    course_catalog_id: courseCatalogIdParam || '',
    course_name: courseNameParam || '',
    level_name: '',
    schedule_days: '',
    schedule_time: '',
    course_schedule_id: '',
    registration_fee: 0,
    notes: ''
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      student_name: prev.student_name || user.profile?.full_name || user.name || '',
      student_email: prev.student_email || user.email || '',
      student_phone: prev.student_phone || user.profile?.phone || '',
      nationality: prev.nationality || user.profile?.nationality || '',
      kitas_number: prev.kitas_number || user.profile?.kitas_number || '',
      birth_date: prev.birth_date || (user.profile?.birth_date ? String(user.profile.birth_date).slice(0, 10) : ''),
      birth_place: prev.birth_place || user.profile?.birth_place || '',
      gender: prev.gender || user.profile?.gender || '',
      education: prev.education || user.profile?.education || '',
      occupation: prev.occupation || user.profile?.occupation || '',
      address: prev.address || user.profile?.address || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!selectedTermId || !selectedCourseCatalogId) {
      setAvailableSchedules([]);
      return undefined;
    }
    let cancelled = false;
    api.getSchedules('bipa', true, selectedTermId).then((response) => {
      if (cancelled) return;
      const schedules = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      setAvailableSchedules(schedules.filter((schedule) => String(schedule.course_catalog_id) === String(selectedCourseCatalogId)));
    }).catch(() => {
      if (!cancelled) setAvailableSchedules([]);
    });
    return () => { cancelled = true; };
  }, [selectedTermId, selectedCourseCatalogId]);

  // Load active BIPA terms
  useEffect(() => {
    async function loadTerms() {
      setLoading(true);
      try {
        const res = await api.getTerms('bipa');
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
            term_period: current.name
          }));
        }
      } catch (err) {
        console.error('Error loading BIPA terms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTerms();
  }, [termIdParam]);

  useEffect(() => {
    let cancelled = false;
    api.getCourseCatalogs().then((response) => {
      if (cancelled) return;
      const allCatalogs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      const catalogs = allCatalogs.filter((catalog) => String(catalog.division || '').toLowerCase() === 'bipa');
      setCourseCatalogs(catalogs);
      const selected = catalogs.find((catalog) => String(catalog.id) === String(courseCatalogIdParam));
      if (selected) {
        setSelectedCourseCatalogId(String(selected.id));
        setForm((previous) => ({ ...previous, course_catalog_id: selected.id, course_name: selected.title }));
      }
    }).catch(() => setCourseCatalogs([]));
    return () => { cancelled = true; };
  }, [courseCatalogIdParam]);

  useEffect(() => {
    if (!selectedTermId) return undefined;
    let cancelled = false;
    api.getCourseFee({ fee_type: 'registration', division: 'bipa', course_catalog_id: selectedCourseCatalogId, term_id: selectedTermId })
      .then((response) => { if (!cancelled) setFeeAmount(response?.data?.amount ?? null); })
      .catch(() => { if (!cancelled) setFeeAmount(null); });
    return () => { cancelled = true; };
  }, [selectedTermId, selectedCourseCatalogId]);

  const handleTermChange = (termId) => {
    const tId = parseInt(termId, 10);
    setSelectedTermId(tId);
    const foundTerm = terms.find((t) => t.id === tId);
    setSelectedTerm(foundTerm || null);
    setForm((prev) => ({
      ...prev,
      term_id: tId,
      term_period: foundTerm ? foundTerm.name : '',
      registration_fee: 0
    }));
  };

  const handleCourseCatalogChange = (catalogId) => {
    const catalog = courseCatalogs.find((item) => String(item.id) === String(catalogId));
    setSelectedCourseCatalogId(catalogId);
    setForm((previous) => ({ ...previous, course_catalog_id: catalog?.id || '', course_name: catalog?.title || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_name || !form.student_email || !form.nationality || !form.passport_number) {
      setErrorMsg('Please complete all required fields including Passport / Nationality.');
      return;
    }
    const finalFee = feeAmount !== null ? Math.max(0, Number(feeAmount)) : 200000;

    if (!selectedCourseCatalogId) {
      setErrorMsg('Pilih program BIPA terlebih dahulu.');
      return;
    }
    if (!form.terms_accepted || !documentFiles.photo || !documentFiles.passport) {
      setErrorMsg('Persetujuan, pas foto, dan salinan paspor wajib dilengkapi.');
      return;
    }
    if (form.visa_type === 'student_kitas' && !form.kitas_number.trim()) {
      setErrorMsg('Nomor KITAS wajib diisi untuk visa pelajar.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...form,
        division: 'bipa',
        course_catalog_id: Number(selectedCourseCatalogId),
        term_id: selectedTermId,
        term_period: selectedTerm?.name || form.term_period,
        course_schedule_id: form.course_schedule_id || undefined,
        registration_fee: finalFee,
        metadata: {
          bipa: {
            birth_date: form.birth_date || null,
            birth_place: form.birth_place,
            gender: form.gender,
            education: form.education,
            occupation: form.occupation,
            address: form.address,
            emergency_contact: form.emergency_contact,
            nationality: form.nationality,
            passport_number: form.passport_number,
            country_of_origin: form.country_of_origin,
            native_language: form.native_language,
            visa_type: form.visa_type,
            kitas_number: form.kitas_number,
            proficiency_level: form.proficiency_level,
            purpose_of_study: form.purpose_of_study,
            information_source: form.information_source,
            terms_accepted: form.terms_accepted,
            notes: form.notes,
          }
        }
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'metadata') {
          Object.entries(value.bipa).forEach(([metadataKey, metadataValue]) => {
            if (metadataValue !== null && metadataValue !== undefined) formData.append(`metadata[bipa][${metadataKey}]`, metadataValue === true ? '1' : metadataValue === false ? '0' : String(metadataValue));
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append('bipa_photo', documentFiles.photo);
      formData.append('bipa_passport_copy', documentFiles.passport);
      if (documentFiles.sponsor) formData.append('bipa_sponsor_letter', documentFiles.sponsor);

      const res = await api.submitBipaEnrollment(formData);

      if (res?.success && res.data) {
        setSuccessData(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Failed to submit registration. Please verify your data.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'System error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    isAuthenticated,
    terms,
    selectedTermId,
    selectedTerm,
    courseCatalogs,
    availableSchedules,
    documentFiles,
    setDocumentFiles,
    selectedCourseCatalogId,
    courseCatalogIdParam,
    courseNameParam,
    feeAmount,
    loading,
    submitting,
    successData,
    errorMsg,
    setErrorMsg,
    copied,
    setCopied,
    form,
    setForm,
    handleTermChange,
    handleCourseCatalogChange,
    handleSubmit
  };
}
