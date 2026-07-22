import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate, todayISO } from '../../utils/helpers';
import { ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [msg, setMsg] = useState('');
  const toast = useToast();

  // Form
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState('');
  const [volume, setVolume] = useState('');
  const [date, setDate] = useState(todayISO());
  const [saleEmp, setSaleEmp] = useState('none');
  const [note, setNote] = useState('');

  const load = () => {
    Promise.all([api.getSales(), api.getEmployees()])
      .then(([s, e]) => { setSales(s); setEmployees(e); });
  };

  useEffect(() => { load(); }, []);

  const totalSales = sales.reduce((s, x) => s + x.amount, 0);

  const handleSubmit = async () => {
    setMsg('');
    if (!company) { setMsg('Nama perusahaan pembeli wajib diisi.'); return; }
    if (!amount || Number(amount) <= 0) { setMsg('Masukkan jumlah penjualan yang valid.'); return; }
    try {
      await api.createSale({
        company, amount: Number(amount), volume, note, date,
        username: saleEmp !== 'none' ? saleEmp : '',
      });
      setCompany(''); setAmount(''); setVolume(''); setNote(''); setSaleEmp('none');
      toast('Penjualan kayu tercatat.', 'success');
      load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan penjualan ini?')) return;
    await api.deleteSale(id);
    toast('Catatan penjualan dihapus.');
    load();
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head"><h3>Catat penjualan kayu</h3></div>
        <div className="form-grid">
          <div className="field">
            <label>Nama perusahaan pembeli</label>
            <input placeholder="mis. PT Kayu Sejahtera" value={company}
              onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="field">
            <label>Jumlah penjualan (Rp)</label>
            <input type="number" min="0" placeholder="mis. 15000000" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label>Volume kayu (opsional)</label>
            <input placeholder="mis. 12 m3" value={volume}
              onChange={(e) => setVolume(e.target.value)} />
          </div>
          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Terkait karyawan/tim (opsional)</label>
            <select value={saleEmp} onChange={(e) => setSaleEmp(e.target.value)}>
              <option value="none">Tidak terkait</option>
              {employees.map((u) => (
                <option key={u.username} value={u.username}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>Catatan (opsional)</label>
            <input placeholder="mis. kayu jati hasil tebang minggu ini" value={note}
              onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <div className="auth-msg">{msg}</div>
        <button className="btn btn-orange" onClick={handleSubmit}>{ICONS.plus} Simpan penjualan</button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Riwayat penjualan kayu</h3>
          <span className="tag">Total: {rupiah(totalSales)}</span>
        </div>
        {sales.length ? (
          <table>
            <thead>
              <tr><th>Perusahaan</th><th>Karyawan/Tim</th><th>Volume</th>
                <th>Tanggal</th><th style={{ textAlign: 'right' }}>Jumlah</th><th></th></tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td><span className="tag">{ICONS.gedung} {s.company}</span></td>
                  <td>{s.empName || '—'}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{s.volume || '—'}</td>
                  <td>{fmtDate(s.date)}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(s.amount)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                      {ICONS.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state">{ICONS.inbox}<p>Belum ada penjualan kayu tercatat.</p></div>}
      </div>
    </>
  );
}
