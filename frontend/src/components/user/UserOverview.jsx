import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, timeAgo } from '../../utils/helpers';
import { getIcon, ICONS } from '../Icons';

export default function UserOverview({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [capital, setCapital] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getExpenses(),
      api.getCategories(),
      api.getCapital(),
      api.getLocations(),
    ]).then(([exp, cats, cap, locs]) => {
      setExpenses(exp);
      setCategories(cats);
      setCapital(cap);
      setLocations(locs);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Memuat data...</p></div>;

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalMonth = thisMonth.reduce((s, e) => s + e.amount, 0);
  const myCapital = capital.reduce((s, c) => s + c.amount, 0);
  const sisaModal = myCapital - totalExpenses;

  const byCat = categories.map((c) => ({
    ...c,
    total: expenses.filter((e) => e.category === c.key).reduce((s, e) => s + e.amount, 0),
  }));
  const maxCat = Math.max(1, ...byCat.map((c) => c.total));

  const loc = locations.length > 0 ? locations[0] : null;

  return (
    <>
      {/* Capital panel */}
      <div className="panel" style={{ background: 'var(--forest-dark)', border: 'none', marginBottom: 16 }}>
        <div className="panel-head">
          <h3 style={{ color: '#fff' }}>Modal saya</h3>
          <button className="btn btn-outline btn-sm"
            style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
            onClick={() => onNavigate('modal')}>
            Lihat riwayat
          </button>
        </div>
        <div className="cards-row" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="label" style={{ color: '#A9A48A' }}>Modal diterima</div>
            <div className="value" style={{ color: '#fff' }}>{rupiah(myCapital)}</div>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="label" style={{ color: '#A9A48A' }}>Sisa modal</div>
            <div className="value" style={{ color: sisaModal < 0 ? '#F09595' : '#8FD1A0' }}>
              {rupiah(sisaModal)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="cards-row">
        <div className="stat-card">
          <div className="label">Total pengeluaran saya</div>
          <div className="value orange">{rupiah(totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Bulan ini</div>
          <div className="value">{rupiah(totalMonth)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Jumlah catatan</div>
          <div className="value">{expenses.length}</div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="panel">
        <div className="panel-head"><h3>Rincian per kategori</h3></div>
        {byCat.map((c) => (
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

      {/* Location status */}
      <div className="panel">
        <div className="panel-head">
          <h3>Status lokasi</h3>
          <button className="btn btn-orange btn-sm" onClick={() => onNavigate('lokasi')}>
            {ICONS.loc2} Kelola lokasi
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
          {loc ? 'Lokasi terakhir dibagikan ' + timeAgo(loc.ts) + '.' : 'Anda belum pernah membagikan lokasi ke admin.'}
        </p>
      </div>
    </>
  );
}
