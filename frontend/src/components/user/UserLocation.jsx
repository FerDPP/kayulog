import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import { timeAgo } from '../../utils/helpers';
import { ICONS } from '../Icons';
import { useToast } from '../Toast';

export default function UserLocation() {
  const [location, setLocation] = useState(null);
  const [sharing, setSharing] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const toast = useToast();

  const loadLocation = () => {
    api.getLocations().then((locs) => {
      if (locs.length > 0) setLocation(locs[0]);
    });
  };

  useEffect(() => { loadLocation(); }, []);

  useEffect(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const L = window.L;
    const center = location ? [location.lat, location.lng] : [-6.9175, 107.6191];
    const zoom = location ? 14 : 9;
    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    if (location) {
      const orangeIcon = L.divIcon({
        className: '',
        html: '<div style="background:#C1621F;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([location.lat, location.lng], { icon: orangeIcon })
        .addTo(map)
        .bindPopup(`<b>Lokasi Anda</b><br>${timeAgo(location.ts)}`);
    }

    setTimeout(() => map.invalidateSize(), 100);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [location]);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast('Perangkat tidak mendukung lokasi.', 'danger');
      return;
    }
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.updateLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          toast('Lokasi dibagikan ke admin.', 'success');
          loadLocation();
        } catch (e) {
          toast('Gagal menyimpan lokasi.', 'danger');
        }
        setSharing(false);
      },
      () => {
        toast('Tidak bisa mengambil lokasi: izin ditolak atau tidak tersedia.', 'danger');
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head"><h3>Bagikan lokasi</h3></div>
        <div className="loc-hero">
          <div className="loc-status">
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Lokasi terakhir dibagikan</div>
            <div className="big">
              {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Belum ada data lokasi'}
            </div>
            <span className="badge-ago">{timeAgo(location && location.ts)}</span>
          </div>
          <button className="btn btn-orange" onClick={shareLocation} disabled={sharing}>
            {ICONS.loc2} {sharing ? 'Mengambil lokasi...' : 'Bagikan lokasi sekarang'}
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Peta lokasi saya</h3></div>
        <div id="map" ref={mapRef} />
      </div>
    </>
  );
}
