import React, { useMemo } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ACTIVE_STATUSES   = new Set(['paid','active','verified','approved']);
const PENDING_STATUSES  = new Set(['pending','pending_payment','placement_test','awaiting_level','awaiting_test_result','waiting_verification','schedule_selection']);
const DONE_STATUSES     = new Set(['completed']);
const REJECT_STATUSES   = new Set(['rejected','placement_test_failed']);

const toStatus = (s) => String(s || '').toLowerCase();

function DonutChart({ segments, size = 110, strokeWidth = 18 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  let offset = 0;
  const slices = segments.map((seg) => {
    const dash = (seg.value / total) * circ;
    const gap  = circ - dash;
    const slice = { ...seg, dash, gap, offset };
    offset += dash;
    return slice;
  });
  const cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

function BarChart({ bars, maxVal }) {
  const max = maxVal || Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="flex flex-col gap-3 w-full">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 font-medium">{bar.label}</span>
            <span className="text-xs font-bold" style={{ color: bar.color }}>{bar.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 8 : 0)}%`, background: bar.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadgeMini({ status }) {
  const map = {
    pending:              ['#F6DB00', '#7a6a00', 'Menunggu Pembayaran'],
    pending_payment:      ['#F6DB00', '#7a6a00', 'Menunggu Pembayaran'],
    placement_test:       ['#198BCC', '#fff',    'Menunggu Tes'],
    awaiting_level:       ['#198BCC', '#fff',    'Menunggu Level'],
    awaiting_test_result: ['#198BCC', '#fff',    'Menunggu Hasil'],
    waiting_verification: ['#f97316', '#fff',    'Menunggu Verifikasi'],
    schedule_selection:   ['#8b5cf6', '#fff',    'Pilih Jadwal'],
    approved:             ['#10b981', '#fff',    'Disetujui'],
    paid:                 ['#10b981', '#fff',    'Aktif / Lunas'],
    active:               ['#10b981', '#fff',    'Aktif'],
    verified:             ['#10b981', '#fff',    'Aktif / Lunas'],
    completed:            ['#2757A4', '#fff',    'Selesai'],
    rejected:             ['#ef4444', '#fff',    'Ditolak'],
    placement_test_failed:['#ef4444', '#fff',    'Tidak Lolos'],
  };
  const [bg, color, label] = map[toStatus(status)] || ['#e5e7eb', '#374151', status || '-'];
  return (
    <span style={{ background: bg, color, fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

export default function DashboardTab({ user, enrollments = [], payments = [], summary, error, loading, onTabChange }) {
  // ── Computed stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = enrollments.length;
    const active  = enrollments.filter(e => ACTIVE_STATUSES.has(toStatus(e.status))).length;
    const pending = enrollments.filter(e => PENDING_STATUSES.has(toStatus(e.status))).length;
    const done    = enrollments.filter(e => DONE_STATUSES.has(toStatus(e.status))).length;
    const rejected= enrollments.filter(e => REJECT_STATUSES.has(toStatus(e.status))).length;
    const paidPayments   = payments.filter(p => ['verified','paid'].includes(toStatus(p.status))).length;
    const pendingPayments= payments.filter(p => ['pending','waiting_verification'].includes(toStatus(p.status))).length;
    const rejPayments    = payments.filter(p => toStatus(p.status) === 'rejected').length;
    return { total, active, pending, done, rejected, paidPayments, pendingPayments, rejPayments };
  }, [enrollments, payments]);

  const recentEnrollments = useMemo(() =>
    [...enrollments]
      .sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 4),
    [enrollments]
  );

  const donutSegments = [
    { label: 'Aktif',   value: stats.active,   color: '#10b981' },
    { label: 'Proses',  value: stats.pending,  color: '#F6DB00' },
    { label: 'Selesai', value: stats.done,     color: '#2757A4' },
    { label: 'Ditolak', value: stats.rejected, color: '#ef4444' },
  ];

  const paymentBars = [
    { label: 'Terverifikasi',       value: stats.paidPayments,    color: '#10b981' },
    { label: 'Menunggu Verifikasi', value: stats.pendingPayments, color: '#f97316' },
    { label: 'Ditolak',             value: stats.rejPayments,     color: '#ef4444' },
  ];

  const statCards = [
    { label: 'Total Kursus',    value: loading ? '—' : (summary?.total ?? stats.total),   icon: 'ti-book-2',       bg: 'linear-gradient(135deg,#2757A4 0%,#198BCC 100%)', color: '#fff' },
    { label: 'Kursus Aktif',    value: loading ? '—' : (summary?.approved ?? stats.active), icon: 'ti-circle-check', bg: 'linear-gradient(135deg,#059669 0%,#10b981 100%)', color: '#fff' },
    { label: 'Perlu Perhatian', value: loading ? '—' : (summary?.needs_attention ?? stats.pending), icon: 'ti-clock', bg: 'linear-gradient(135deg,#d97706 0%,#f97316 100%)', color: '#fff' },
    { label: 'Pembayaran Lunas',value: loading ? '—' : stats.paidPayments,                icon: 'ti-receipt',      bg: 'linear-gradient(135deg,#7c3aed 0%,#8b5cf6 100%)', color: '#fff' },
  ];

  const firstName = user?.name?.split(' ')[0] || 'Peserta';
  const timeNow   = new Date().getHours();
  const greeting  = timeNow < 11 ? 'Selamat pagi' : timeNow < 15 ? 'Selamat siang' : timeNow < 18 ? 'Selamat sore' : 'Selamat malam';
  const totalDonut = donutSegments.reduce((a,b) => a + b.value, 0);

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── HERO BANNER ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1b3d75 0%,#2757A4 55%,#198BCC 100%)',
        borderRadius: '1.25rem',
        padding: '2rem 2.5rem',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 8px 32px rgba(39,87,164,0.22)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circle */}
        <div style={{ position:'absolute', right:'-3rem', top:'-3rem', width:'14rem', height:'14rem', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:'5rem', bottom:'-4rem', width:'10rem', height:'10rem', borderRadius:'50%', background:'rgba(246,219,0,0.1)', pointerEvents:'none' }} />

        <div>
          <span style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', opacity:0.75 }}>Portal Peserta · LBI FIB UI</span>
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, margin:'0.4rem 0 0.5rem', lineHeight:1.2 }}>
            {greeting}, <span style={{ color:'#F6DB00' }}>{firstName}</span>! 👋
          </h1>
          <p style={{ opacity:0.85, fontSize:'0.9rem', maxWidth:'38ch' }}>
            Pantau status kursus, pembayaran, dan kelola administrasi akademik Anda di satu tempat.
          </p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
          <button
            onClick={() => onTabChange('courses')}
            style={{ background:'#F6DB00', color:'#1b3d75', fontWeight:700, fontSize:'0.85rem', padding:'0.6rem 1.4rem', borderRadius:'0.75rem', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', transition:'all 0.2s' }}
          >
            <i className="ti ti-book-2" /> Kursus Saya
          </button>
          <button
            onClick={() => onTabChange('payments')}
            style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontWeight:600, fontSize:'0.85rem', padding:'0.6rem 1.4rem', borderRadius:'0.75rem', border:'1px solid rgba(255,255,255,0.3)', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', backdropFilter:'blur(8px)', transition:'all 0.2s' }}
          >
            <i className="ti ti-receipt" /> Pembayaran
          </button>
        </div>
      </div>

      {/* ── ERROR ──────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.75rem', padding:'1rem 1.25rem', color:'#dc2626', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem' }}>
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:'1rem' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: card.bg,
            borderRadius:'1rem',
            padding:'1.25rem 1.5rem',
            color: card.color,
            display:'flex', flexDirection:'column', gap:'0.5rem',
            boxShadow:'0 4px 16px rgba(0,0,0,0.12)',
            position:'relative', overflow:'hidden',
          }}>
            <div style={{ position:'absolute', right:'-1rem', top:'-1rem', width:'5rem', height:'5rem', borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none' }} />
            <div style={{ width:'2.5rem', height:'2.5rem', borderRadius:'0.65rem', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
              <i className={`ti ${card.icon}`} />
            </div>
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:600, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.05em' }}>{card.label}</div>
              <div style={{ fontSize:'2rem', fontWeight:800, lineHeight:1 }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>

        {/* Donut Chart Card */}
        <div style={{ background:'#fff', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#1e293b', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ width:'0.75rem', height:'0.75rem', borderRadius:'50%', background:'linear-gradient(135deg,#2757A4,#10b981)', display:'inline-block' }} />
            Distribusi Status Kursus
          </h3>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', justifyContent:'center', flexWrap:'wrap' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <DonutChart segments={donutSegments} size={120} strokeWidth={20} />
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', transform:'rotate(0deg)' }}>
                <span style={{ fontSize:'1.5rem', fontWeight:800, color:'#1e293b', lineHeight:1 }}>{totalDonut}</span>
                <span style={{ fontSize:'0.6rem', color:'#64748b', fontWeight:600, textTransform:'uppercase' }}>Total</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {donutSegments.map((seg, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem' }}>
                  <div style={{ width:'0.65rem', height:'0.65rem', borderRadius:'50%', background:seg.color, flexShrink:0 }} />
                  <span style={{ color:'#64748b' }}>{seg.label}</span>
                  <span style={{ fontWeight:700, color:'#1e293b', marginLeft:'auto' }}>{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart Card */}
        <div style={{ background:'#fff', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#1e293b', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ width:'0.75rem', height:'0.75rem', borderRadius:'50%', background:'linear-gradient(135deg,#059669,#ef4444)', display:'inline-block' }} />
            Riwayat Pembayaran
          </h3>
          {payments.length === 0 ? (
            <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.85rem', paddingTop:'1.5rem' }}>
              <i className="ti ti-receipt-off" style={{ fontSize:'2rem', display:'block', marginBottom:'0.5rem' }} />
              Belum ada riwayat pembayaran
            </div>
          ) : (
            <BarChart bars={paymentBars} />
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY + QUICK ACTIONS ────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem' }}>

        {/* Recent Enrollments */}
        <div style={{ background:'#fff', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#1e293b', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <i className="ti ti-activity" style={{ color:'#2757A4' }} /> Aktivitas Terbaru
            </h3>
            <button onClick={() => onTabChange('registrations')} style={{ fontSize:'0.75rem', color:'#2757A4', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
              Lihat semua →
            </button>
          </div>
          {loading ? (
            <div style={{ color:'#94a3b8', fontSize:'0.875rem', textAlign:'center', padding:'2rem 0' }}>
              <i className="ti ti-loader-2" style={{ animation:'spin 1s linear infinite', display:'inline-block' }} /> Memuat...
            </div>
          ) : recentEnrollments.length === 0 ? (
            <div style={{ textAlign:'center', color:'#94a3b8', fontSize:'0.85rem', paddingTop:'1.5rem' }}>
              <i className="ti ti-clipboard-off" style={{ fontSize:'2rem', display:'block', marginBottom:'0.5rem' }} />
              Belum ada pendaftaran
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {recentEnrollments.map((enr, i) => (
                <div key={enr.id || i} style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'0.85rem 0', borderBottom: i < recentEnrollments.length - 1 ? '1px solid #f1f5f9' : 'none', position:'relative' }}>
                  {/* timeline dot */}
                  <div style={{ flexShrink:0, width:'2.25rem', height:'2.25rem', borderRadius:'50%', background:'linear-gradient(135deg,#2757A4,#198BCC)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.8rem', fontWeight:700 }}>
                    <i className="ti ti-book-2" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.85rem', color:'#1e293b', marginBottom:'0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {enr.course_name || enr.division || `Pendaftaran #${enr.id}`}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                      <StatusBadgeMini status={enr.status} />
                      {enr.registration_number && (
                        <span style={{ fontSize:'0.68rem', color:'#94a3b8', fontFamily:'monospace' }}>{enr.registration_number}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:'0.68rem', color:'#94a3b8', flexShrink:0, textAlign:'right' }}>
                    {enr.created_at ? new Date(enr.created_at).toLocaleDateString('id-ID',{ day:'numeric', month:'short' }) : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div style={{ background:'linear-gradient(160deg,#1b3d75 0%,#2757A4 100%)', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 4px 20px rgba(39,87,164,0.2)', color:'#fff', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <i className="ti ti-bolt" style={{ color:'#F6DB00' }} /> Aksi Cepat
          </h3>
          {[
            { label: 'Kursus Saya',      icon: 'ti-book-2',       tab:'courses',       bg:'rgba(255,255,255,0.15)' },
            { label: 'Registrasi Saya',  icon: 'ti-file-text',    tab:'registrations', bg:'rgba(255,255,255,0.1)' },
            { label: 'Pembayaran',        icon: 'ti-receipt',      tab:'payments',      bg:'rgba(246,219,0,0.2)' },
            { label: 'Profil Saya',       icon: 'ti-user-circle',  tab:'profile',       bg:'rgba(255,255,255,0.1)' },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => onTabChange(action.tab)}
              style={{
                background: action.bg,
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius:'0.75rem',
                padding:'0.75rem 1rem',
                color:'#fff',
                fontWeight:600,
                fontSize:'0.82rem',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                gap:'0.6rem',
                width:'100%',
                textAlign:'left',
                transition:'all 0.2s',
                backdropFilter:'blur(4px)',
              }}
            >
              <i className={`ti ${action.icon}`} style={{ fontSize:'1rem' }} />
              {action.label}
              <i className="ti ti-arrow-right" style={{ marginLeft:'auto', opacity:0.7 }} />
            </button>
          ))}
          <div style={{ marginTop:'auto', paddingTop:'0.5rem', borderTop:'1px solid rgba(255,255,255,0.15)', fontSize:'0.72rem', opacity:0.7 }}>
            <i className="ti ti-headset" /> Butuh bantuan?{' '}
            <a href="https://wa.me/6281945747271" target="_blank" rel="noreferrer" style={{ color:'#F6DB00', textDecoration:'none', fontWeight:700 }}>
              Hubungi Admin
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
