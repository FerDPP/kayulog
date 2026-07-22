import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate } from '../../utils/helpers';
import { getIcon, ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function ExpenseHistory() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const toast = useToast();

  const load = () => {
    Promise.all([api.getExpenses(), api.getCategories()])
      .then(([exp, cats]) => { setExpenses(exp); setCategories(cats); });
  };

  useEffect(() => { load(); }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const getCatLabel = (key) => {
    const c = categories.find((cat) => cat.key === key);
    return c ? c.label : key + ' (dihapus)';
  };

  const getCatIconKey = (key) => {
    const c = categories.find((cat) => cat.key === key);
    return c ? c.icon_key : 'lainnya';
  };

  const handleDelete = async (id) => {
    await api.deleteExpense(id);
    toast('Catatan dihapus.');
    load();
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Riwayat pengeluaran saya</h3>
        <span className="tag">Total: {rupiah(total)}</span>
      </div>
      {expenses.length ? (
        <table>
          <thead>
            <tr><th>Kategori</th><th>Catatan</th><th>Tanggal</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th><th></th></tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>
                  <span className="tag">{getIcon(getCatIconKey(e.category))} {getCatLabel(e.category)}</span>
                </td>
                <td style={{ color: 'var(--ink-soft)' }}>{e.note || '—'}</td>
                <td>{fmtDate(e.date)}</td>
                <td style={{ textAlign: 'right' }} className="amount">{rupiah(e.amount)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>
                    {ICONS.trash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">{ICONS.inbox}<p>Anda belum mencatat pengeluaran apa pun.</p></div>
      )}
    </div>
  );
}
