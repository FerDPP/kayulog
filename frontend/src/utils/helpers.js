// Format number as Indonesian Rupiah
export function rupiah(n) {
  n = Number(n) || 0;
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

// Relative time string
export function timeAgo(ts) {
  if (!ts) return 'Belum pernah';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'Baru saja';
  if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  return Math.floor(s / 86400) + ' hari lalu';
}

// Format date to Indonesian locale
export function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return d;
  }
}

// Get initials from name
export function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// Today's date in YYYY-MM-DD
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
