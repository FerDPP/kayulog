import { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { ICONS } from '../Icons';
import UserOverview from './UserOverview';
import UserCapital from './UserCapital';
import ExpenseForm from './ExpenseForm';
import ExpenseHistory from './ExpenseHistory';
import UserLocation from './UserLocation';

const TABS = [
  { key: 'overview', label: 'Ringkasan Saya', icon: ICONS.home },
  { key: 'modal', label: 'Modal Saya', icon: ICONS.dompet },
  { key: 'catat', label: 'Catat Pengeluaran', icon: ICONS.plus },
  { key: 'riwayat', label: 'Riwayat', icon: ICONS.list },
  { key: 'lokasi', label: 'Lokasi', icon: ICONS.map },
];

const TITLES = {
  overview: 'Ringkasan saya',
  modal: 'Modal saya',
  catat: 'Catat pengeluaran',
  riwayat: 'Riwayat pengeluaran',
  lokasi: 'Lokasi',
};

const SUBS = {
  overview: 'Lihat total dan rincian pengeluaran lapangan Anda.',
  modal: 'Modal yang diberikan admin dan sisa yang masih bisa dipakai.',
  catat: 'Masukkan pengeluaran hari ini agar tercatat rapi.',
  riwayat: 'Semua pengeluaran yang pernah Anda catat.',
  lokasi: 'Bagikan posisi Anda agar admin tahu lokasi kerja.',
};

export default function UserLayout() {
  const [tab, setTab] = useState('overview');

  const onNavigate = (t) => setTab(t);

  const renderBody = () => {
    switch (tab) {
      case 'overview': return <UserOverview onNavigate={onNavigate} />;
      case 'modal': return <UserCapital />;
      case 'catat': return <ExpenseForm onDone={() => setTab('riwayat')} />;
      case 'riwayat': return <ExpenseHistory />;
      case 'lokasi': return <UserLocation />;
      default: return <UserOverview onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="dash-shell">
      <Sidebar role="user" activeTab={tab} tabs={TABS} onTabChange={setTab} />
      <div className="main">
        <div className="topbar">
          <div>
            <h2>{TITLES[tab]}</h2>
            <div className="sub">{SUBS[tab]}</div>
          </div>
        </div>
        <div className="content">{renderBody()}</div>
      </div>
    </div>
  );
}
