import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate } from '../../utils/helpers';
import { getIcon, ICONS } from '../Icons';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getExpenses()])
      .then(([s, exp]) => {
        setStats(s);
        setRecent(exp.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="empty-state"><p>Memuat data...</p></div>;

  const catBreakdown = stats.category_breakdown || [];
  const maxCat = Math.max(1, ...catBreakdown.map((c) => c.total));

  return (
    <>
      {/* Net income panel */}
      <div className="panel" style={{ background: 'var(--forest-dark)', border: 'none' }}>
        <div className="panel-head">
          <h3 style={{ color: '#fff' }}>Penghasilan akhir</h3>
          <span className="tag" style={{ background: 'rgba(255,255,255,0.12)', color: '#EDE3CC' }}>
            Penjualan kayu &minus; modal diberikan
          </span>
        </div>
        <div className="cards-row" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="label" style={{ color: '#A9A48A' }}>Total modal diberikan</div>
            <div className="value" style={{ color: '#fff' }}>{rupiah(stats.total_capital)}</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="label" style={{ color: '#A9A48A' }}>Total penjualan kayu</div>
            <div className="value" style={{ color: '#fff' }}>{rupiah(stats.total_sales)}</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="label" style={{ color: '#A9A48A' }}>Penghasilan akhir</div>
            <div className="value" style={{ color: stats.net_income >= 0 ? '#8FD1A0' : '#F09595' }}>
              {rupiah(stats.net_income)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="cards-row">
        <div className="stat-card">
          <div className="label">Pengeluaran bulan ini</div>
          <div className="value orange">{rupiah(stats.month_expenses)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total pengeluaran</div>
          <div className="value">{rupiah(stats.total_expenses)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Karyawan aktif</div>
          <div className="value green">{stats.employee_count}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total transaksi</div>
          <div className="value">{stats.transaction_count}</div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="panel">
        <div className="panel-head"><h3>Pengeluaran per kategori</h3></div>
        {catBreakdown.map((c) => (
          <div className="cat-row" key={c.key}>
            <div className="cat-icon">{getIcon(c.icon_key)}</div>
            <div className="cat-bar-wrap">
              <div className="cat-bar-label">
                <span>{c.label}</span><b>{rupiah(c.total)}</b>
              </div>
              <div className="cat-bar-track">
                <div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="panel">
        <div className="panel-head"><h3>Aktivitas terbaru</h3></div>
        {recent.length ? (
          <table>
            <thead>
              <tr><th>Karyawan</th><th>Kategori</th><th>Catatan</th><th>Tanggal</th><th style={{ textAlign: 'right' }}>Jumlah</th></tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td><span className="tag">{getIcon(e.category)} {e.category}</span></td>
                  <td style={{ color: 'var(--ink-soft)' }}>{e.note || '—'}</td>
                  <td>{fmtDate(e.date)}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">{ICONS.inbox}<p>Belum ada pengeluaran tercatat.</p></div>
        )}
      </div>
    </>
  );
}
