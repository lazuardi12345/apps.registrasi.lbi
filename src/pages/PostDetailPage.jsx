// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImageUrl } from "../services/api";

export default function PostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostData() {
      setLoading(true);
      try {
        const [postRes, recentRes] = await Promise.all([
          api.getPostBySlug(slug),
          api.getPosts("", 1),
        ]);

        if (postRes && postRes.success && postRes.data) {
          setPost(postRes.data);
        }

        if (recentRes && recentRes.data) {
          const list = Array.isArray(recentRes.data) ? recentRes.data : recentRes.data.data || [];
          setRecentPosts(list.filter((p) => p.slug !== slug).slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load post detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="detail-spinner"></div>
        <p>Memuat artikel berita...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="course-detail-notfound">
        <h2>Artikel Tidak Ditemukan</h2>
        <p>Artikel atau berita yang Anda cari mungkin sudah dipindahkan atau dihapus.</p>
        <Link to="/" className="btn-back-home">&larr; Kembali ke Beranda</Link>
      </div>
    );
  }

  const postDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Terbaru";

  const featuredImg = resolveImageUrl(post.featured_image);

  return (
    <div className="post-detail-page">
      {/* Breadcrumb Bar */}
      <div className="course-breadcrumb-bar">
        <div className="detail-container">
          <nav className="breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="sep">&rsaquo;</span>
            <span className="sep">Berita & Artikel</span>
            <span className="sep">&rsaquo;</span>
            <span className="current">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="detail-container post-main-container">
        <div className="post-layout-grid">
          {/* Main Article Content */}
          <article className="post-article-content">
            <div className="post-header-meta">
              <span className="post-cat-pill">{post.category || "News & Event"}</span>
              <span className="post-date-text">
                <i className="ti ti-calendar" /> {postDate}
              </span>
              {post.author && (
                <span className="post-author-text">
                  <i className="ti ti-user" /> Oleh: {post.author.name}
                </span>
              )}
            </div>

            <h1 className="post-main-title">{post.title}</h1>

            {post.summary && (
              <div className="post-summary-quote">
                <p>{post.summary}</p>
              </div>
            )}

            {featuredImg && (
              <div className="post-featured-image-box">
                <img src={featuredImg} alt={post.title} className="post-hero-img" />
              </div>
            )}

            {/* Article Body */}
            <div className="post-rich-body">
              {post.body ? (
                // If the body contains HTML tags from Drupal legacy database, render safely
                /<[a-z][\s\S]*>/i.test(post.body) ? (
                  <div
                    className="drupal-content-html"
                    dangerouslySetInnerHTML={{
                      __html: post.body.replace(/\r\n/g, "<br/>").replace(/rn</g, "<").replace(/>rn/g, ">"),
                    }}
                  />
                ) : (
                  post.body.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                )
              ) : (
                <p className="no-body-note">
                  Untuk informasi lebih lengkap mengenai pengumuman atau berita ini, silakan hubungi sekretariat Lembaga Bahasa Internasional Fakultas Ilmu Pengetahuan Budaya Universitas Indonesia (LBI FIB UI).
                </p>
              )}
            </div>

            {/* Article Share & Footer */}
            <div className="post-article-footer">
              <div className="share-box">
                <span className="share-label"><i className="ti ti-share-3" /> Bagikan artikel</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="share-btn wa-share"
                >
                  <i className="ti ti-brand-whatsapp" /><span>WhatsApp</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="share-btn tw-share"
                >
                  <i className="ti ti-brand-twitter" /><span>Twitter / X</span>
                </a>
              </div>

              <Link to="/" className="btn-back-home">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="post-sidebar">
            {/* CTA Course Widget */}
            <div className="sidebar-promo-widget">
              <div className="promo-badge">Pendaftaran Dibuka</div>
              <h4>Ingin Meningkatkan Kemampuan Bahasa Anda?</h4>
              <p>
                Daftar kursus bahasa asing, BIPA, atau kelas persiapan tes resmi di LBI FIB UI bersama pengajar tersertifikasi.
              </p>
              <Link to="/#programs" className="btn-sidebar-cta">
                Lihat Program Kursus &rarr;
              </Link>
            </div>

            <div className="post-contact-widget">
              <div className="post-contact-icon"><i className="ti ti-message-circle-2" /></div>
              <div>
                <span className="post-contact-eyebrow">Punya pertanyaan?</span>
                <h3>Hubungi tim LBI FIB UI</h3>
                <p>Kami siap membantu memberikan informasi terkait program dan pendaftaran.</p>
              </div>
              <div className="post-contact-actions">
                <a href="https://wa.me/6281945747271" target="_blank" rel="noreferrer" className="post-contact-action post-contact-whatsapp" aria-label="Hubungi LBI melalui WhatsApp" title="Hubungi via WhatsApp">
                  <i className="ti ti-brand-whatsapp" />
                </a>
                <a href="mailto:informasi@lbifibui.com" className="post-contact-action" aria-label="Kirim email ke LBI FIB UI" title="Kirim email">
                  <i className="ti ti-mail" />
                </a>
              </div>
            </div>

            {/* Recent Posts List */}
            <div className="sidebar-recent-posts">
              <h3>Kabar Terbaru Lainnya</h3>
              <div className="recent-posts-list">
                {recentPosts.map((r) => {
                  const rImg = resolveImageUrl(r.featured_image);
                  return (
                    <Link key={r.id} to={`/posts/${r.slug}`} className="recent-post-item">
                      {rImg ? (
                        <img src={rImg} alt={r.title} className="recent-thumb" />
                      ) : (
                        <div className="recent-thumb-pattern">📰</div>
                      )}
                      <div className="recent-meta">
                        <span className="recent-title">{r.title}</span>
                        <span className="recent-date">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Terbaru"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
