import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import { timeAgo } from '../../utils/helpers';
import { ICONS } from '../Icons';
import { RingMark } from '../RingMark';

export default function Locations() {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    Promise.all([api.getEmployees(), api.getLocations()])
      .then(([emp, locs]) => {
        setEmployees(emp);
        setLocations(locs);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    // Clean up previous map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const L = window.L;
    const markers = locations.filter((l) => l.lat && l.lng);
    const center = markers.length ? [markers[0].lat, markers[0].lng] : [-6.9175, 107.6191];
    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView(center, markers.length ? 12 : 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const orangeIcon = L.divIcon({
      className: '',
      html: '<div style="background:#C1621F;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    markers.forEach((m) => {
      L.marker([m.lat, m.lng], { icon: orangeIcon })
        .addTo(map)
        .bindPopup(`<b>${m.name}</b><br>${timeAgo(m.ts)}`);
    });

    if (selectedEmp) {
      const loc = locations.find((l) => l.username === selectedEmp);
      if (loc) map.setView([loc.lat, loc.lng], 14);
    }

    setTimeout(() => map.invalidateSize(), 100);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locations, selectedEmp]);

  const getStatus = (username) => {
    const loc = locations.find((l) => l.username === username);
    if (!loc) return { status: 'Belum bagikan', dotClass: 'offline', ts: null };
    const age = Date.now() - loc.ts;
    if (age < 15 * 60 * 1000) return { status: 'Aktif', dotClass: 'online', ts: loc.ts };
    if (age < 24 * 60 * 60 * 1000) return { status: 'Perlu update', dotClass: 'stale', ts: loc.ts };
    return { status: 'Lama', dotClass: 'stale', ts: loc.ts };
  };

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head"><h3>Lokasi karyawan</h3></div>
      <div className="map-layout">
        <div className="map-side">
          {employees.length ? employees.map((u) => {
            const s = getStatus(u.username);
            return (
              <div
                key={u.username}
                className={`emp-row ${selectedEmp === u.username ? 'selected' : ''}`}
                onClick={() => setSelectedEmp(u.username)}
              >
                <div className="ring-avatar"><RingMark size={38} /></div>
                <div className="emp-info">
                  <div className="emp-name">{u.name}</div>
                  <div className="emp-meta">
                    <span className={`dot ${s.dotClass}`} />
                    {s.status} · {timeAgo(s.ts)}
                  </div>
                </div>
              </div>
            );
          }) : <div className="empty-state">{ICONS.inbox}<p>Belum ada karyawan terdaftar.</p></div>}
        </div>
        <div className="map-main">
          <div id="map" ref={mapRef} />
        </div>
      </div>
    </div>
  );
}
