import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { ICONS, ICON_CHOICES, getIcon } from '../Icons';
import { useToast } from '../Toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('lainnya');
  const [msg, setMsg] = useState('');
  const toast = useToast();

  const load = () => {
    Promise.all([api.getCategories(), api.getExpenses()])
      .then(([cats, exp]) => {
        setCategories(cats);
        setExpenses(exp);
      });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setMsg('');
    if (!newLabel.trim()) { setMsg('Nama kategori tidak boleh kosong.'); return; }
    try {
      await api.createCategory({ label: newLabel.trim(), icon_key: newIcon });
      setNewLabel(''); setNewIcon('lainnya');
      toast('Kategori "' + newLabel.trim() + '" ditambahkan.', 'success');
      load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleDelete = async (key, label) => {
    const usedCount = expenses.filter((e) => e.category === key).length;
    const warn = usedCount > 0
      ? `Kategori "${label}" sudah dipakai di ${usedCount} catatan pengeluaran. Catatan itu tetap ada, hanya label kategorinya akan tertulis "dihapus". Lanjutkan hapus?`
      : `Hapus kategori "${label}"?`;
    if (!confirm(warn)) return;
    await api.deleteCategory(key);
    toast('Kategori dihapus.');
    load();
  };

  return (
    <>
      {/* Active categories */}
      <div className="panel">
        <div className="panel-head">
          <h3>Kategori aktif</h3>
          <span className="tag">{categories.length} kategori</span>
        </div>
        {categories.length ? (
          <table>
            <thead>
              <tr><th>Ikon</th><th>Nama kategori</th><th>Dipakai di</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const usedCount = expenses.filter((e) => e.category === c.key).length;
                return (
                  <tr key={c.key}>
                    <td><span className="cat-icon" style={{ width: 28, height: 28 }}>{getIcon(c.icon_key)}</span></td>
                    <td>{c.label}</td>
                    <td style={{ color: 'var(--ink-soft)' }}>{usedCount} catatan</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.key, c.label)}>
                        {ICONS.trash}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty-state">{ICONS.inbox}<p>Belum ada kategori. Tambahkan minimal satu di bawah.</p></div>}
      </div>

      {/* Add new category */}
      <div className="panel">
        <div className="panel-head"><h3>Tambah kategori baru</h3></div>
        <div className="field">
          <label>Nama kategori</label>
          <input placeholder="mis. Bensin Alat Berat" value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)} />
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>
          Pilih ikon
        </label>
        <div className="cat-choice" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {ICON_CHOICES.map((ik) => (
            <label key={ik} className={newIcon === ik ? 'picked' : ''} onClick={() => setNewIcon(ik)}>
              <span className="cat-icon">{ICONS[ik]}</span>
            </label>
          ))}
        </div>
        <div className="auth-msg">{msg}</div>
        <button className="btn btn-orange" onClick={handleAdd}>{ICONS.plus} Tambah kategori</button>
      </div>
    </>
  );
}
