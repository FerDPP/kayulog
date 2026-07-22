import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { todayISO } from '../../utils/helpers';
import { ICONS, getIcon } from '../Icons';
import { useToast } from '../Toast';

export default function ExpenseForm({ onDone }) {
  const [categories, setCategories] = useState([]);
  const [formCat, setFormCat] = useState(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  const handleSubmit = async () => {
    setMsg('');
    if (!formCat) { setMsg('Pilih kategori pengeluaran.'); return; }
    if (!amount || Number(amount) <= 0) { setMsg('Masukkan jumlah yang valid.'); return; }
    try {
      await api.createExpense({
        category: formCat,
        amount: Number(amount),
        note,
        date,
      });
      setFormCat(null); setAmount(''); setNote('');
      toast('Pengeluaran tercatat.', 'success');
      if (onDone) onDone();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Catat pengeluaran baru</h3></div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
        Kategori
      </label>
      {categories.length ? (
        <div className="cat-choice">
          {categories.map((c) => (
            <label key={c.key} className={formCat === c.key ? 'picked' : ''} onClick={() => setFormCat(c.key)}>
              <span className="cat-icon">{getIcon(c.icon_key)}</span> {c.label}
            </label>
          ))}
        </div>
      ) : (
        <div className="auth-hint">
          Belum ada kategori tersedia. Minta admin menambahkan kategori terlebih dahulu di menu Kategori.
        </div>
      )}
      <div className="form-grid">
        <div className="field">
          <label>Jumlah (Rp)</label>
          <input type="number" min="0" placeholder="mis. 250000" value={amount}
            onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="field">
          <label>Tanggal</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field full">
          <label>Catatan (opsional)</label>
          <textarea rows="2" placeholder="mis. sewa truk untuk angkut kayu ke gudang" value={note}
            onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <div className="auth-msg">{msg}</div>
      <button className="btn btn-orange" onClick={handleSubmit}>{ICONS.plus} Simpan pengeluaran</button>
    </div>
  );
}
