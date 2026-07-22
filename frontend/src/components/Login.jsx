import { useState } from 'react';
import { RingMark } from './RingMark';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export function Login() {
  const [tab, setTab] = useState('login');
  const [msg, setMsg] = useState('');
  const { login, register } = useAuth();
  const toast = useToast();

  // Login fields
  const [liUser, setLiUser] = useState('');
  const [liPass, setLiPass] = useState('');

  // Register fields
  const [rgName, setRgName] = useState('');
  const [rgUser, setRgUser] = useState('');
  const [rgPass, setRgPass] = useState('');

  const handleLogin = async () => {
    setMsg('');
    if (!liUser || !liPass) { setMsg('Isi username dan kata sandi.'); return; }
    try {
      const user = await login(liUser, liPass);
      toast('Selamat datang, ' + user.name);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleRegister = async () => {
    setMsg('');
    if (!rgName || !rgUser || !rgPass) { setMsg('Semua kolom wajib diisi.'); return; }
    if (rgPass.length < 4) { setMsg('Kata sandi minimal 4 karakter.'); return; }
    try {
      const user = await register(rgName, rgUser.toLowerCase(), rgPass);
      toast('Akun dibuat. Selamat bekerja, ' + user.name);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') action();
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="rings-bg"><RingMark size={360} /></div>
        <div className="auth-brand-top">
          <RingMark size={30} />
          <span className="logotext">KAYULOG</span>
        </div>
        <div className="auth-brand-mid">
          <h1>Catat setiap<br />rupiah di lapangan.</h1>
          <p>
            Sistem informasi untuk usaha kayu borongan. Pantau pengeluaran tim — sewa truk,
            mesin gergaji, upah tenaga, dan keperluan lain — sekaligus tahu lokasi mereka secara langsung.
          </p>
        </div>
        <div className="auth-brand-bottom">
          <div><b>4</b>kategori biaya</div>
          <div><b>2</b>peran akses</div>
          <div><b>Live</b>lokasi tim</div>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form">
          <RingMark size={38} />
          <div style={{ height: 16 }} />
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setMsg(''); }}>
              Masuk
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setMsg(''); }}>
              Daftar Karyawan
            </button>
          </div>

          {tab === 'login' ? (
            <>
              <div className="field">
                <label>Username</label>
                <input id="li-username" placeholder="mis. budi" value={liUser}
                  onChange={(e) => setLiUser(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleLogin)} />
              </div>
              <div className="field">
                <label>Kata sandi</label>
                <input id="li-password" type="password" placeholder="Kata sandi" value={liPass}
                  onChange={(e) => setLiPass(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleLogin)} />
              </div>
              <div className="auth-msg">{msg}</div>
              <button className="btn btn-primary" onClick={handleLogin}>Masuk</button>
              <div className="auth-hint">
                <b>Akun admin bawaan:</b> username <b>admin</b>, kata sandi <b>admin123</b>. Segera ganti bila perlu.
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>Nama lengkap</label>
                <input id="rg-name" placeholder="Nama Anda" value={rgName}
                  onChange={(e) => setRgName(e.target.value)} />
              </div>
              <div className="field">
                <label>Username</label>
                <input id="rg-username" placeholder="Buat username" value={rgUser}
                  onChange={(e) => setRgUser(e.target.value)} />
              </div>
              <div className="field">
                <label>Kata sandi</label>
                <input id="rg-password" type="password" placeholder="Minimal 4 karakter" value={rgPass}
                  onChange={(e) => setRgPass(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleRegister)} />
              </div>
              <div className="auth-msg">{msg}</div>
              <button className="btn btn-primary" onClick={handleRegister}>Daftar sebagai Karyawan</button>
              <div className="auth-hint">
                Akun yang didaftarkan di sini otomatis berperan sebagai <b>Karyawan</b>,
                digunakan untuk mencatat pengeluaran lapangan dan membagikan lokasi.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
