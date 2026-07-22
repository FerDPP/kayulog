import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, fmtDate, todayISO } from '../../utils/helpers';
import { ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function Capital() {
  const [capital, setCapital] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState([]);
  const [msg, setMsg] = useState('');
  const toast = useToast();

  // Form
  const [empSelect, setEmpSelect] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');

  const load = () => {
    Promise.all([api.getCapital(), api.getEmployees(), api.getCapitalSummary()])
      .then(([cap, emp, sum]) => {
        setCapital(cap);
        setEmployees(emp);
        setSummary(sum);
      });
  };

  useEffect(() => { load(); }, []);

  const totalCapital = capital.reduce((s, c) => s + c.amount, 0);

  const handleSubmit = async () => {
    setMsg('');
    if (!empSelect) { setMsg('Pilih karyawan penerima modal.'); return; }
    if (!amount || Number(amount) <= 0) { setMsg('Masukkan jumlah modal yang valid.'); return; }
    try {
      await api.createCapital({ username: empSelect, amount: Number(amount), note, date });
      setAmount(''); setNote(''); setEmpSelect('');
      toast('Modal dicatat.', 'success');
      load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus catatan modal ini?')) return;
    await api.deleteCapital(id);
    toast('Catatan modal dihapus.');
    load();
  };

  return (
    <>
      {/* Form */}
      <div className="panel">
        <div className="panel-head"><h3>Beri modal ke karyawan</h3></div>
        <div className="form-grid">
          <div className="field">
            <label>Karyawan</label>
            <select value={empSelect} onChange={(e) => setEmpSelect(e.target.value)}>
              <option value="">Pilih karyawan</option>
              {employees.map((u) => (
                <option key={u.username} value={u.username}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Jumlah modal (Rp)</label>
            <input type="number" min="0" placeholder="mis. 2000000" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field full">
            <label>Catatan (opsional)</label>
            <input placeholder="mis. modal borongan lokasi Cianjur" value={note}
              onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <div className="auth-msg">{msg}</div>
        <button className="btn btn-orange" onClick={handleSubmit}>{ICONS.plus} Simpan modal</button>
        {!employees.length && (
          <div className="auth-hint" style={{ marginTop: 12 }}>
            Belum ada karyawan terdaftar. Minta karyawan mendaftar dulu lewat halaman masuk.
          </div>
        )}
      </div>

      {/* Summary table */}
      <div className="panel">
        <div className="panel-head"><h3>Ringkasan modal per karyawan</h3></div>
        {summary.length ? (
          <table>
            <thead>
              <tr><th>Karyawan</th><th style={{ textAlign: 'right' }}>Modal diterima</th>
                <th style={{ textAlign: 'right' }}>Pengeluaran</th><th style={{ textAlign: 'right' }}>Sisa modal</th></tr>
            </thead>
            <tbody>
              {summary.map((r) => (
                <tr key={r.user.username}>
                  <td>{r.user.name}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(r.total_capital)}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(r.total_spent)}</td>
                  <td style={{ textAlign: 'right', color: r.remaining < 0 ? 'var(--danger)' : 'var(--ink)' }} className="amount">
                    {rupiah(r.remaining)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state">{ICONS.inbox}<p>Belum ada karyawan.</p></div>}
      </div>

      {/* History table */}
      <div className="panel">
        <div className="panel-head">
          <h3>Riwayat modal diberikan</h3>
          <span className="tag">Total: {rupiah(totalCapital)}</span>
        </div>
        {capital.length ? (
          <table>
            <thead>
              <tr><th>Karyawan</th><th>Catatan</th><th>Tanggal</th><th style={{ textAlign: 'right' }}>Jumlah</th><th></th></tr>
            </thead>
            <tbody>
              {capital.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{c.note || '—'}</td>
                  <td>{fmtDate(c.date)}</td>
                  <td style={{ textAlign: 'right' }} className="amount">{rupiah(c.amount)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                      {ICONS.trash}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="empty-state">{ICONS.inbox}<p>Belum ada modal yang diberikan.</p></div>}
      </div>
    </>
  );
}
