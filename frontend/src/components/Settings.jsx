import { useState } from 'react';
import api from '../api/api';
import { ICONS } from './Icons';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Harap isi semua kolom password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await api.put('/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setSuccess('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px' }}>
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {ICONS.settings}
        <h3>Pengaturan Akun ({user?.username})</h3>
      </div>
      <div className="card-body">
        {error && <div className="error-text" style={{ marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ color: '#059669', marginBottom: '15px', padding: '10px', background: '#d1fae5', borderRadius: '4px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Password Saat Ini</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
            />
          </div>

          <div className="form-group">
            <label>Password Baru</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
            />
          </div>

          <div className="form-group">
            <label>Konfirmasi Password Baru</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}
