# KayuLog

Sistem Informasi Catatan Kayu Borongan. Dibangun menggunakan **React.js** (Frontend), **Go** (Backend API), dan **PostgreSQL** (Database).

## Kredensial Database (Supabase)

Silakan gunakan data berikut saat membuat database baru di [Supabase](https://supabase.com):

- **Nama Project**: `kayulog`
- **Region**: `Singapore`
- **Database Password**: `KayulogRahasia123`

*(⚠️ Simpan password di atas baik-baik karena Anda tidak akan bisa melihatnya lagi di dashboard Supabase setelah project dibuat).*

---

## Langkah Deploy ke Vercel

1. Buat database di Supabase menggunakan kredensial di atas.
2. Di Supabase, masuk ke **Project Settings (⚙️) -> Database -> Connection string -> URI**.
3. Centang opsi **Use connection pooling** (Transaction pooler) agar Vercel bisa terhubung menggunakan IPv4.
4. Copy URL yang baru (berawalan `postgresql://...` dengan port `6543`).
5. Ganti tulisan `[YOUR-PASSWORD]` di URL tersebut dengan password di atas. Hasil akhirnya akan terlihat kira-kira seperti ini:
   `postgresql://postgres.uragsvjtuhyenxuegdwf:KayulogRahasia123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
5. Buka dashboard Vercel, masuk ke project `kayulog` -> tab **Settings** -> **Environment Variables**.
6. Tambahkan variabel dengan **Key**: `DATABASE_URL` dan **Value**: *(URL Supabase Anda yang sudah diganti passwordnya)*.
7. Simpan (Save).
8. Masuk ke tab **Deployments** di Vercel, klik titik tiga di baris teratas, dan pilih **Redeploy**.

---

## Info Login Default (Admin)
Setelah aplikasi live di Vercel, Anda bisa login menggunakan akun bawaan:
- **Username**: `admin`
- **Password**: `admin123`
