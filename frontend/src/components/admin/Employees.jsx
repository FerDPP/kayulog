import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { rupiah, timeAgo } from '../../utils/helpers';
import { ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const toast = useToast();

  const load = () => {
    api.getEmployees().then(setEmployees);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (username) => {
    if (!confirm('Hapus karyawan ini? Data pengeluaran & lokasinya akan terhapus.')) return;
    try {
      await api.deleteEmployee(username);
      toast('Karyawan dihapus dari daftar.');
      load();
    } catch (e) {
      toast(e.message, 'danger');
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Daftar karyawan</h3>
        <span className="tag">{employees.length} orang</span>
      </div>
      {employees.length ? (
        <table>
          <thead>
            <tr><th>Nama</th><th>Username</th><th>Total pengeluaran</th><th>Lokasi terakhir</th><th></th></tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <tr key={u.username}>
                <td>{u.name}</td>
                <td className="mono">{u.username}</td>
                <td className="amount">{rupiah(u.total_expenses)}</td>
                <td>{timeAgo(u.location_ts)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.username)}>
                    {ICONS.trash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">{ICONS.inbox}<p>Belum ada karyawan yang mendaftar.</p></div>
      )}
    </div>
  );
}
