import React from 'react';

export default function PaginationControls({ meta, onPageChange, label }) {
  if (!meta) return null;

  const currentPage = Number(meta.current_page);
  const lastPage = Number(meta.last_page);
  if (!Number.isInteger(currentPage) || !Number.isInteger(lastPage) || lastPage < 1) return null;

  const startPage = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, lastPage) },
    (_, index) => startPage + index,
  );

  return (
    <nav className="sd-pagination" aria-label={`Pagination ${label}`}>
      <span className="sd-pagination-summary">
        Menampilkan {meta.from ?? 0}–{meta.to ?? 0} dari {meta.total} {label}
      </span>
      <div className="sd-pagination-actions">
        <button
          type="button"
          className="sd-pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
        >
          <i className="ti ti-chevron-left" />
          <span>Sebelumnya</span>
        </button>
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            className={`sd-pagination-button sd-pagination-number${page === currentPage ? ' is-current' : ''}`}
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="sd-pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label="Halaman berikutnya"
        >
          <span>Berikutnya</span>
          <i className="ti ti-chevron-right" />
        </button>
      </div>
    </nav>
  );
}
