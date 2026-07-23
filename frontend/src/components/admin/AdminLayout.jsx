import { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { ICONS } from '../Icons';
import Overview from './Overview';
import Capital from './Capital';
import Expenses from './Expenses';
import Sales from './Sales';
import Locations from './Locations';
import Categories from './Categories';
import Employees from './Employees';
import Settings from '../Settings';

const TABS = [
  { key: 'overview', label: 'Ringkasan', icon: ICONS.home },
  { key: 'capital', label: 'Modal Karyawan', icon: ICONS.dompet },
  { key: 'expenses', label: 'Data Pengeluaran', icon: ICONS.list },
  { key: 'sales', label: 'Penjualan Kayu', icon: ICONS.log },
  { key: 'locations', label: 'Lokasi Karyawan', icon: ICONS.map },
  { key: 'categories', label: 'Kategori', icon: ICONS.tag },
  { key: 'employees', label: 'Karyawan', icon: ICONS.users },
  { key: 'settings', label: 'Pengaturan', icon: ICONS.settings },
];

const TITLES = {
  overview: 'Ringkasan',
  capital: 'Modal karyawan',
  locations: 'Lokasi karyawan',
  expenses: 'Data pengeluaran',
  sales: 'Penjualan kayu',
  categories: 'Kategori pengeluaran',
  employees: 'Karyawan',
  settings: 'Pengaturan akun',
};

const SUBS = {
  overview: 'Gambaran umum modal, pengeluaran, dan penghasilan akhir.',
  capital: 'Catat modal yang Anda berikan ke setiap karyawan.',
  locations: 'Pantau posisi terkini setiap karyawan lapangan.',
  expenses: 'Semua catatan pengeluaran dari seluruh karyawan.',
  sales: 'Catat hasil penjualan kayu ke perusahaan pembeli.',
  categories: 'Tambah atau hapus kategori sesuai kebutuhan lapangan.',
  employees: 'Kelola karyawan yang terdaftar di sistem.',
  settings: 'Ubah password dan kelola pengaturan akun Anda.',
};

export default function AdminLayout() {
  const [tab, setTab] = useState('overview');

  const renderBody = () => {
    switch (tab) {
      case 'overview': return <Overview />;
      case 'capital': return <Capital />;
      case 'expenses': return <Expenses />;
      case 'sales': return <Sales />;
      case 'locations': return <Locations />;
      case 'categories': return <Categories />;
      case 'employees': return <Employees />;
      case 'settings': return <Settings />;
      default: return <Overview />;
    }
  };

  return (
    <div className="dash-shell">
      <Sidebar role="admin" activeTab={tab} tabs={TABS} onTabChange={setTab} />
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
