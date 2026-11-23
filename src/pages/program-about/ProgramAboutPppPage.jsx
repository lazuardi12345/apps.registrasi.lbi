import React from 'react';
import { normalizeProgramLinks, normalizeVideoUrl, useProgramAboutData } from './useProgramAboutData';

const SERVICE_SLUG = 'program-penerjemahan-dan-penjurubahasaan-1283';

export default function ProgramAboutPppPage() {
  const { service, loading } = useProgramAboutData(SERVICE_SLUG);

  if (loading) return <div className="program-about-loading">Memuat informasi program...</div>;
  if (!service) return <div className="program-about-loading">Informasi program belum tersedia.</div>;

  const bodyHtml = normalizeProgramLinks(service.body || `<p>${service.summary || 'Informasi program belum tersedia.'}</p>`);
  const videoUrl = normalizeVideoUrl(service.video_url);

  return (
    <main className="program-about-page program-about-ppp">
      <section className="program-about-hero">
        <div className="program-about-container">
          <p className="program-about-eyebrow">Penerjemahan dan penjurubahasaan</p>
          <h1>{service.title}</h1>
          <p className="program-about-lead">Layanan profesional untuk kebutuhan penerjemahan, penjurubahasaan, dan komunikasi lintas bahasa.</p>
        </div>
      </section>
      <section className={`program-about-content program-about-container${videoUrl ? ' has-video' : ' no-video'}`}>
        {videoUrl && (
          <div className="program-about-media">
            <p className="program-about-kicker">Tentang PPP</p>
            <div className="program-about-video">
              <iframe src={videoUrl} title={`Video ${service.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
        <div className="program-about-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </section>
    </main>
  );
}
