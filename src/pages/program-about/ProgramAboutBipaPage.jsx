import React from 'react';
import { normalizeProgramLinks, normalizeVideoUrl, useProgramAboutData } from './useProgramAboutData';

const SERVICE_SLUG = 'program-bipa-129';

function splitProgramContent(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const content = document.createElement('div');
  Array.from(parsed.body.childNodes).forEach((node) => content.appendChild(node.cloneNode(true)));
  const nodes = Array.from(content.childNodes);
  let splitIndex = nodes.findIndex((node) => node.nodeType === Node.ELEMENT_NODE && /^H[2-4]$/.test(node.tagName));

  if (splitIndex < 0) {
    const paragraphIndexes = nodes.reduce((indexes, node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') indexes.push(index);
      return indexes;
    }, []);
    if (paragraphIndexes.length > 1) splitIndex = paragraphIndexes[1];
  }

  if (splitIndex < 0) return { introduction: '', details: html };

  const introduction = nodes.slice(0, splitIndex).map((node) => node.outerHTML || node.textContent).join('');
  const details = nodes.slice(splitIndex).map((node) => node.outerHTML || node.textContent).join('');
  return { introduction, details };
}

export default function ProgramAboutBipaPage() {
  const { service, loading } = useProgramAboutData(SERVICE_SLUG);

  if (loading) return <div className="program-about-loading">Memuat informasi program...</div>;
  if (!service) return <div className="program-about-loading">Informasi program belum tersedia.</div>;

  const bodyHtml = normalizeProgramLinks(service.body || `<p>${service.summary || 'Informasi program belum tersedia.'}</p>`);
  const videoUrl = normalizeVideoUrl(service.video_url);
  const hasSeparateVideoDescription = service.video_description !== null && service.video_description !== undefined;
  const legacyContent = hasSeparateVideoDescription ? null : splitProgramContent(bodyHtml);
  const introduction = hasSeparateVideoDescription
    ? normalizeProgramLinks(service.video_description || '')
    : legacyContent.introduction;
  const details = hasSeparateVideoDescription ? bodyHtml : legacyContent.details;

  return (
    <main className="program-about-page program-about-bipa">
      <section className="program-about-hero">
        <div className="program-about-container">
          <p className="program-about-eyebrow">Program Bahasa Indonesia</p>
          <h1>{service.title}</h1>
          <p className="program-about-lead">Ruang belajar bahasa dan budaya Indonesia dengan standar akademik Universitas Indonesia.</p>
        </div>
      </section>
      <section className={`program-about-content program-about-container program-about-bipa-content${videoUrl ? ' has-video' : ' no-video'}`}>
        {videoUrl && (
          <div className="program-about-media">
            <p className="program-about-kicker">Kenali program BIPA</p>
            <div className="program-about-video">
              <iframe src={videoUrl} title={`Video ${service.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
        <div className="program-about-introduction">
          <p className="program-about-kicker">Bahasa, budaya, dan pengalaman</p>
          {introduction ? (
            <div className="program-about-intro-copy" dangerouslySetInnerHTML={{ __html: introduction }} />
          ) : !hasSeparateVideoDescription ? (
            <p className="program-about-intro-copy">{service.summary || 'Program BIPA membantu penutur asing belajar bahasa Indonesia sekaligus mengenal budaya Indonesia.'}</p>
          ) : null}
          <div className="program-about-highlights">
            <span>Bahasa Indonesia</span>
            <span>Pengalaman lintas budaya</span>
            <span>Standar akademik UI</span>
          </div>
        </div>
        <div className="program-about-details">
          <div className="program-about-details-heading">
            <p className="program-about-kicker">Jelajahi program</p>
            <h2>Tentang program BIPA</h2>
            <p>Temukan pilihan kelas dan pengalaman belajar bahasa Indonesia yang sesuai dengan kebutuhan Anda.</p>
          </div>
          <div className="program-about-body" dangerouslySetInnerHTML={{ __html: details || bodyHtml }} />
        </div>
      </section>
    </main>
  );
}
