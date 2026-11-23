// src/hooks/usePppRegistration.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function usePppRegistration() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const courseCatalogIdParam = searchParams.get('course_catalog_id');
  const courseNameParam = searchParams.get('course_name');
  const termIdParam = searchParams.get('term_id');

  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);

  const [courseCatalogs, setCourseCatalogs] = useState([]);
  const [selectedCourseCatalogId, setSelectedCourseCatalogId] = useState(courseCatalogIdParam || '');
  const [feeAmount, setFeeAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    division: 'ppp',
    student_type: searchParams.get('student_type') || 'umum',
    term_period: '',
    term_id: null,
    student_name: '',
    student_email: '',
    student_phone: '',
    identity_number: '',
    birth_date: '',
    applicant_category: 'individual', // individual | corporate | institution
    organization_name: '',
    service_type: 'ept_toefl', // ept_toefl | translation | interpreting | in_house_training
    service_purpose: 'graduation_ui', // graduation_ui | scholarship | job_application | legal
    course_catalog_id: courseCatalogIdParam || '',
    course_name: courseNameParam || 'Layanan Tes & Bahasa PPP',
    level_name: '',
    campus_location: 'depok',
    learning_mode: 'daring',
    schedule_days: '',
    document_language_from: '',
    document_language_to: '',
    document_type: '',
    document_count: '',
    deadline_date: '',
    test_date_preference: '',
    test_location: 'depok',
    participant_count: '',
    terms_accepted: false,
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
      identity_number: prev.identity_number || user.profile?.identity_number || '',
      birth_date: prev.birth_date || (user.profile?.birth_date ? String(user.profile.birth_date).slice(0, 10) : ''),
    }));
  }, [user]);

  // Load active PPP terms
  useEffect(() => {
    async function loadTerms() {
      setLoading(true);
      try {
        const res = await api.getTerms('ppp');
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
        console.error('Error loading PPP terms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTerms();
  }, [termIdParam]);

  // Load catalogs
  useEffect(() => {
    let cancelled = false;
    api.getCourseCatalogs().then((response) => {
      if (cancelled) return;
      const allCatalogs = Array.isArray(response?.data) ? response.data : response?.data?.data || [];
      const catalogs = allCatalogs.filter((catalog) => String(catalog.division || '').toLowerCase() === 'ppp');
      setCourseCatalogs(catalogs);
      const selected = catalogs.find((catalog) => String(catalog.id) === String(courseCatalogIdParam));
      if (selected) {
        setSelectedCourseCatalogId(String(selected.id));
        setForm((previous) => ({ ...previous, course_catalog_id: selected.id, course_name: selected.title }));
      }
    }).catch(() => setCourseCatalogs([]));
    return () => { cancelled = true; };
  }, [courseCatalogIdParam]);

  // Load fee
  useEffect(() => {
    if (!selectedTermId) return undefined;
    let cancelled = false;
    api.getCourseFee({ fee_type: 'registration', division: 'ppp', course_catalog_id: selectedCourseCatalogId, term_id: selectedTermId })
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
    setForm((previous) => ({ ...previous, course_catalog_id: catalog?.id || '', course_name: catalog?.title || 'Layanan Tes & Bahasa PPP' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_name || !form.student_email || !form.student_phone) {
      setErrorMsg('Silakan lengkapi formulir pendaftaran.');
      return;
    }
    if (!form.terms_accepted) {
      setErrorMsg('Silakan setujui syarat dan ketentuan.');
      return;
    }
    if (form.applicant_category !== 'individual' && !form.organization_name.trim()) {
      setErrorMsg('Nama instansi wajib diisi untuk pemohon organisasi.');
      return;
    }
    const finalFee = feeAmount !== null ? Math.max(0, Number(feeAmount)) : 250000;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...form,
        division: 'ppp',
        course_catalog_id: selectedCourseCatalogId ? Number(selectedCourseCatalogId) : undefined,
        term_id: selectedTermId,
        term_period: selectedTerm?.name || form.term_period,
        course_schedule_id: undefined,
        registration_fee: finalFee,
        metadata: {
          ppp: {
            applicant_category: form.applicant_category,
            organization_name: form.organization_name,
            service_type: form.service_type,
            service_purpose: form.service_purpose,
            document_language_from: form.document_language_from,
            document_language_to: form.document_language_to,
            document_type: form.document_type,
            document_count: form.document_count ? Number(form.document_count) : null,
            deadline_date: form.deadline_date || null,
            test_date_preference: form.test_date_preference || null,
            test_location: form.test_location,
            participant_count: form.participant_count ? Number(form.participant_count) : null,
            identity_number: form.identity_number,
            birth_date: form.birth_date || null,
            terms_accepted: form.terms_accepted,
            notes: form.notes
          }
        }
      };

      const res = await api.submitPppEnrollment(payload);

      if (res?.success && res.data) {
        setSuccessData(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res?.message || 'Gagal mengirimkan pendaftaran. Silakan periksa kembali data Anda.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
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
