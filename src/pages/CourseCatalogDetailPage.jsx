import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { resolveImageUrl } from '../services/api';

const divisionLabels = {
  ppb_english: 'PPB Bahasa Inggris',
  ppb_foreign: 'PPB Bahasa Asing',
  bipa: 'Program BIPA',
  ppp: 'PPP Penerjemahan',
  testing: 'Tes Bahasa',
};

export default function CourseCatalogDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    api.getCourseBySlug(slug).then((res) => {
      if (!isMounted) return;
      if (res?.success && res.data) setCourse(res.data);
      else setError(true);
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setError(true);
      setLoading(false);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return <div className="course-detail-loading"><div className="detail-spinner" /><p>Memuat detail kursus...</p></div>;
  }

  if (error || !course) {
    return (
      <div className="course-detail-notfound">
        <h2>Detail Kursus Tidak Ditemukan</h2>
        <p>Data kursus belum tersedia atau sudah tidak aktif.</p>
        <Link to="/" className="btn-back-home">&larr; Kembali ke Beranda</Link>
      </div>
    );
  }

  const image = resolveImageUrl(course.image_url);
  const isLanguageTest = course.division === 'testing' && course.category === 'language_test';
  const isPlacementTest = course.division === 'testing' || course.category === 'placement_test';
  const outcomes = course.learning_outcomes
    ? course.learning_outcomes.split(/\r?\n|\|/).map((item) => item.trim()).filter(Boolean)
    : [];
  const paymentSteps = Array.isArray(course.payment_steps) ? course.payment_steps : [];
  const breadcrumbServiceLabel = isLanguageTest ? 'Tes Bahasa' : isPlacementTest ? 'Test Penempatan' : (course.service?.title || 'Kursus');

  return (
    <main className="catalog-detail-page">
      <div className="course-breadcrumb-bar">
        <div className="detail-container">
          <nav className="breadcrumb">
            <Link to="/">Beranda</Link><span className="sep">&rsaquo;</span>
            <span>{breadcrumbServiceLabel}</span><span className="sep">&rsaquo;</span>
            <span className="current">{course.title}</span>
          </nav>
        </div>
      </div>

      <section className="catalog-detail-hero">
        <div className="detail-container catalog-detail-grid">
          <div>
            <span className="catalog-detail-eyebrow">{divisionLabels[course.division] || (isPlacementTest ? 'Tes Bahasa' : course.division)}</span>
            <h1>{course.title}</h1>
            <p className="catalog-detail-summary">{course.summary}</p>
            <div className="catalog-detail-meta">
              {course.level && <span><i className="ti ti-chart-bar" /> {course.level}</span>}
              {course.duration && <span><i className="ti ti-clock" /> {course.duration}</span>}
              {course.category && <span><i className="ti ti-category" /> {course.category}</span>}
            </div>
          </div>
          {image && <img src={image} alt={course.title} className="catalog-detail-image" />}
        </div>
      </section>

      <div className="detail-container catalog-detail-body">
        <article className="catalog-detail-content">
          <section>
            <h2>{isLanguageTest ? 'Tentang Tes' : 'Tentang Kursus'}</h2>
            {course.description ? <div dangerouslySetInnerHTML={{ __html: course.description }} /> : <p>Informasi detail kursus sedang disiapkan oleh tim LBI FIB UI.</p>}
          </section>
          {outcomes.length > 0 && (
            <section>
              <h2>Yang Akan Dipelajari</h2>
              <ul className="catalog-outcomes">{outcomes.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          {course.target_audience && <section><h2>Untuk Siapa</h2><p>{course.target_audience}</p></section>}
          {course.instructor_info && <section><h2>Pengajar</h2><p>{course.instructor_info}</p></section>}
          {paymentSteps.length > 0 && (
            <section>
              <h2>Tahapan Pembayaran</h2>
              <ol className="catalog-payment-steps">
                {paymentSteps.map((step, index) => (
                  <li key={`${step.title}-${index}`}>
                    <strong>{step.title}</strong>
                    {step.description && <p>{step.description}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>

        <section className="catalog-schedules-section">
          <div className="catalog-schedule-card">
            <div className="catalog-schedules-heading">
              <div>
                <span className="catalog-detail-eyebrow">Tahap berikutnya</span>
                <h2>Jadwal dan pendaftaran</h2>
              </div>
              <p>Pilih jadwal yang sesuai. Informasi biaya, kuota, dan pendaftaran mengikuti batch yang tersedia.</p>
            </div>
            {course.schedules?.length ? (
              <div className="catalog-schedules-grid">
                {course.schedules.map((schedule) => (
                  <article key={schedule.id} className="catalog-schedule-item">
                    <div className="catalog-schedule-item-head">
                      <strong>{schedule.batch || 'Jadwal reguler'}</strong>
                      <span className={`catalog-schedule-status${schedule.is_open ? ' is-open' : ''}`}>
                        {schedule.is_full ? 'Penuh' : schedule.is_open ? 'Pendaftaran dibuka' : 'Pendaftaran ditutup'}
                      </span>
                    </div>
                    <dl className="catalog-schedule-facts">
                      <div><dt>Jadwal</dt><dd>{schedule.schedule_text || 'Akan diinformasikan'}</dd></div>
                      {schedule.start_date_label && <div><dt>Mulai</dt><dd>{schedule.start_date_label}</dd></div>}
                      {schedule.format && <div><dt>Format</dt><dd>{schedule.format}</dd></div>}
                      {schedule.location && <div><dt>Lokasi</dt><dd>{schedule.location}</dd></div>}
                      <div><dt>Biaya</dt><dd>{schedule.fee_label || 'Hubungi kami'}</dd></div>
                      <div><dt>Kuota</dt><dd>{schedule.is_full ? 'Penuh' : `${schedule.slots_available} kursi tersedia`}</dd></div>
                    </dl>
                    <div className="catalog-schedule-actions">
                      <Link
                        to={`/courses/${schedule.id}`}
                        className="catalog-schedule-action catalog-schedule-details"
                      >
                        Detail kursus
                        <i className="ti ti-arrow-up-right" />
                      </Link>
                      <Link
                        to={schedule.is_open && !schedule.is_full
                          ? `/pendaftaran?program=${String(course.division || '').startsWith('ppb') ? 'ppb' : course.division === 'bipa' ? 'bipa' : 'ppp'}&course_catalog_id=${course.id}&course_name=${encodeURIComponent(course.title)}`
                          : `/courses/${schedule.id}`}
                        className="catalog-schedule-action"
                      >
                        {schedule.is_open && !schedule.is_full ? 'Daftar program ini' : 'Pendaftaran ditutup'}
                        <i className="ti ti-arrow-up-right" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : isLanguageTest ? (
              <div className="catalog-empty">
                <p>Ajukan pendaftaran tes ini untuk mendapatkan informasi jadwal dan pembayaran.</p>
                <Link to={`/pendaftaran-tes?course_catalog_id=${course.id}`} className="catalog-schedule-action">
                  Daftar tes ini
                  <i className="ti ti-arrow-up-right" />
                </Link>
              </div>
            ) : <p className="catalog-empty">Belum ada jadwal aktif. Hubungi admin untuk informasi pembukaan kelas.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
