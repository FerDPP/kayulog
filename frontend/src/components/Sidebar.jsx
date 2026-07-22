import React from 'react';
import { RingMark } from './RingMark';
import { ICONS } from './Icons';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/helpers';

export function Sidebar({ role, activeTab, tabs, onTabChange }) {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="side-brand">
        <RingMark size={24} />
        <span className="logotext">KAYULOG</span>
      </div>
      <div className="side-user">
        <div className="side-avatar">{initials(user.name)}</div>
        <div>
          <div className="side-user-name">{user.name}</div>
          <div className="side-user-role">{role === 'admin' ? 'Admin' : 'Karyawan'}</div>
        </div>
      </div>
      <div className="side-nav">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`side-link ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => onTabChange(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="side-foot">
        <button className="side-link" onClick={logout}>
          {ICONS.logout}
          Keluar
        </button>
      </div>
    </div>
  );
}
