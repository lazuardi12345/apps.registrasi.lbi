// src/components/BlogUpdates.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { resolveImageUrl } from "../services/api";

export default function BlogUpdates({ landingOverview }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api.getPosts('', 1, 8).then((res) => {
      if (!isMounted) return;

      if (res?.success && Array.isArray(res.data)) {
        setPosts(res.data);
        setHasMore(Boolean(res.meta?.has_more_pages));
      } else {
        const fallback = Array.isArray(landingOverview?.latest_posts)
          ? landingOverview.latest_posts
          : [];
        setPosts(fallback);
        setHasMore(false);
      }
      setPage(1);
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      const fallback = Array.isArray(landingOverview?.latest_posts)
        ? landingOverview.latest_posts
        : [];
      setPosts(fallback);
      setHasMore(false);
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [landingOverview]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await api.getPosts('', nextPage, 8);
    if (res?.success && Array.isArray(res.data)) {
      setPosts((current) => [...current, ...res.data]);
      setPage(nextPage);
      setHasMore(Boolean(res.meta?.has_more_pages));
    }
    setLoadingMore(false);
  };

  return (
    <section className="blog-section" id="berita">
      <div className="container blog-inner">
        <div className="section-header text-center">
          <span className="section-subtitle">BERITA & ARTIKEL</span>
          <h2 className="section-title">Kabar Terbaru & Artikel LBI</h2>
          <p className="section-desc">
            Informasi terkini seputar pembukaan term, tips penguasaan bahasa, dan kegiatan akademik LBI FIB UI.
          </p>
        </div>

        <div className="blog-grid">
          {loading ? (
            <p className="section-desc">Memuat berita dan artikel...</p>
          ) : posts.length === 0 ? (
            <p className="section-desc">Belum ada berita atau artikel.</p>
          ) : posts.map((post, idx) => {
            const resolvedImg = resolveImageUrl(post.featured_image);
            const postLink = `/posts/${post.slug || post.id || idx}`;
            const postDate = post.created_at
              ? new Date(post.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Terbaru";

            const isFeatured = idx === 0;
            return (
              <article key={post.id || post.title} className={`blog-card${isFeatured ? " blog-card-featured" : ""}`}>
                <Link to={postLink} className="blog-thumb-wrapper">
                  {resolvedImg ? (
                    <img src={resolvedImg} alt={post.title} className="blog-thumb-img" />
                  ) : (
                    <div className={`blog-thumb thumb-pattern-${(idx % 3) + 1}`} />
                  )}
                  <span className="blog-category-badge">{post.category || "LBI FIB UI"}</span>
                </Link>
                <div className="blog-content">
                  <div className="blog-meta">
                    <span className="blog-date">
                      <i className="ti ti-calendar" /> {postDate}
                    </span>
                    <span className="blog-readtime">
                      <i className="ti ti-clock" /> {isFeatured ? "Artikel pilihan" : "5 Menit Baca"}
                    </span>
                  </div>
                  <h3 className="blog-title">
                    <Link to={postLink}>{post.title}</Link>
                  </h3>
                  {isFeatured && post.summary && <p className="blog-excerpt">{post.summary}</p>}
                  <Link to={postLink} className="blog-readmore">
                    <span>{isFeatured ? "Baca artikel" : "Baca selengkapnya"}</span>
                    <i className="ti ti-arrow-right" />
                  </Link>
                </div>
              </article>
            );
          })}

          {hasMore && (
            <div className="blog-load-more">
              <button type="button" className="blog-load-more-btn" onClick={loadMore} disabled={loadingMore}>
                <i className={loadingMore ? "ti ti-loader-2" : "ti ti-plus"} />
                {loadingMore ? "Memuat artikel..." : "Muat Artikel Lainnya"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
