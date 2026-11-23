import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function LanguageTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getCourseCatalogs().then((response) => {
      if (cancelled) return;
      if (!response?.success) {
        setError(response?.message || 'Daftar tes bahasa gagal dimuat.');
        return;
      }
      const catalogs = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setTests(catalogs.filter((catalog) =>
        catalog.is_active && catalog.division === 'testing' && catalog.category === 'language_test'
      ));
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message || 'Daftar tes bahasa gagal dimuat.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="catalog-detail-page">
      <section className="catalog-detail-hero">
        <div className="detail-container">
          <span className="catalog-detail-eyebrow">LBI FIB UI</span>
          <h1>Tes Bahasa</h1>
          <p className="catalog-detail-summary">Pilih layanan tes bahasa untuk melihat informasi dan memulai pendaftaran.</p>
        </div>
      </section>
      <section className="detail-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h2>Daftar Tes Bahasa</h2>
        {loading ? <p role="status">Memuat daftar tes bahasa...</p> : error ? (
          <p role="alert">{error}</p>
        ) : tests.length === 0 ? (
          <p>Belum ada informasi tes bahasa yang tersedia.</p>
        ) : (
          <div className="catalog-schedules-grid">
            {tests.map((test) => (
              <article key={test.id} className="catalog-schedule-item">
                <h3>{test.title}</h3>
                <p>{test.summary}</p>
                <Link to={`/courses/catalog/${test.slug}`} className="catalog-schedule-action">
                  Informasi dan pendaftaran
                  <i className="ti ti-arrow-up-right" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
