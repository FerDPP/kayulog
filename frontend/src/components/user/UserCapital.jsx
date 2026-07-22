import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate } from '../../utils/helpers';
import { ICONS } from '../Icons';

export default function UserCapital() {
  const [capital, setCapital] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCapital(), api.getExpenses()])
      .then(([cap, exp]) => { setCapital(cap); setExpenses(exp); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Memuat data...</p></div>;

  const myCapital = capital.reduce((s, c) => s + c.amount, 0);
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const sisa = myCapital - spent;

  return (
    <>
      <div className="cards-row">
        <div className="stat-card">
          <div className="label">Total modal diterima</div>
          <div className="value">{rupiah(myCapital)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Terpakai (pengeluaran saya)</div>
          <div className="value orange">{rupiah(spent)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Sisa modal</div>
          <div className={`value ${sisa >= 0 ? 'green' : ''}`}
            style={sisa < 0 ? { color: 'var(--danger)' } : {}}>
            {rupiah(sisa)}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Riwayat modal dari admin</h3></div>
        {capital.length ? (
          <table>
            <thead>
              <tr><th>Catatan</th><th>Tanggal</th><th style={{ textAlign: 'right' }}>Jumlah</th></tr>
            </thead>
            <tbody>
              {capital.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--ink-soft)' }}>{c.note || '—'}</td>
                  <td>{fmtDate(c.date)}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state">{ICONS.inbox}<p>Admin belum memberikan modal kepada Anda.</p></div>}
      </div>
    </>
  );
}
