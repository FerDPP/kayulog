import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate } from '../../utils/helpers';
import { getIcon, ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterEmp, setFilterEmp] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const toast = useToast();

  const load = () => {
    Promise.all([api.getExpenses(), api.getEmployees(), api.getCategories()])
      .then(([exp, emp, cats]) => {
        setExpenses(exp);
        setEmployees(emp);
        setCategories(cats);
      });
  };

  useEffect(() => { load(); }, []);

  let filtered = expenses;
  if (filterEmp !== 'all') filtered = filtered.filter((e) => e.username === filterEmp);
  if (filterCat !== 'all') filtered = filtered.filter((e) => e.category === filterCat);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const getCatLabel = (key) => {
    const c = categories.find((c) => c.key === key);
    return c ? c.label : key;
  };

  const handleDelete = async (id) => {
    await api.deleteExpense(id);
    toast('Catatan dihapus.');
    load();
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Data pengeluaran</h3>
        <span className="tag">Total: {rupiah(total)}</span>
      </div>
      <div className="filters">
        <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
          <option value="all">Semua karyawan</option>
          {employees.map((u) => (
            <option key={u.username} value={u.username}>{u.name}</option>
          ))}
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <table>
          <thead>
            <tr>
              <th>Karyawan</th><th>Kategori</th><th>Catatan</th>
              <th>Tanggal</th><th style={{ textAlign: 'right' }}>Jumlah</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td><span className="tag">{getIcon(e.category)} {getCatLabel(e.category)}</span></td>
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
        <div className="empty-state">{ICONS.inbox}<p>Tidak ada data yang cocok dengan filter.</p></div>
      )}
    </div>
  );
}
