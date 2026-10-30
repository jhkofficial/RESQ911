import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Shield,
  ChevronDown,
  Clock,
  Radio,
  LogOut,
  UserCheck,
  AlertOctagon,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DEMO_USERS } from '../../data/simulatedDisasters';
import { UserRole } from '../../types/disaster';

export const Navbar: React.FC<{ onOpenNewIncidentModal: () => void }> = ({ onOpenNewIncidentModal }) => {
  const {
    currentUser,
    loginAsRole,
    logout,
    timeZone,
    setTimeZone,
    filters,
    setFilters,
    stats,
    setActiveIncident,
    incidents,
    setActiveTab,
  } = useDisaster();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Update digital command center clock
  useEffect(() => {
    const updateTime = () => {
      const offsetMap = {
        WIB: 7,
        WITA: 8,
        WIT: 9,
      };
      const now = new Date();
      // Calculate UTC timestamp and add specific hours offset
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const targetTime = new Date(utc + 3600000 * offsetMap[timeZone]);

      const hours = targetTime.getHours().toString().padStart(2, '0');
      const minutes = targetTime.getMinutes().toString().padStart(2, '0');
      const seconds = targetTime.getSeconds().toString().padStart(2, '0');
      const day = targetTime.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      setCurrentTime(`${day} • ${hours}:${minutes}:${seconds} ${timeZone}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  // Urgent notifications sample drawn from current critical incidents
  const criticalAlerts = incidents
    .filter((i) => i.severity === 'Kritis' || i.severity === 'Tinggi')
    .slice(0, 4);

  return (
    <header className="sticky top-0 z-30 bg-[#071426]/95 border-b border-[#12365C] backdrop-blur-md px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,200,248,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#071426] animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">
                  RESQ<span className="text-cyan-400">.911</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  NATIONAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-tight -mt-0.5">
                National Disaster Intelligence &amp; Response Platform
              </p>
            </div>
          </div>

          {/* Status Capsule */}
          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-[#12365C]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-numbers font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              PUSDALOPS READY
            </span>
            <span className="text-xs text-slate-400">
              Node: <span className="text-slate-300 font-mono-numbers">JKT-ID-C1</span>
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID Insiden, Kabupaten, atau Jenis Bencana..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#0a1c33] border border-[#12365C] focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Time Zone & Live Clock */}
          <div className="hidden lg:flex items-center gap-2 bg-[#0a1c33] border border-[#12365C] rounded-lg px-2.5 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-mono-numbers tracking-tight font-medium">
              {currentTime || 'Memuat Waktu...'}
            </span>
            <div className="flex items-center bg-[#071426] rounded border border-[#12365C]/80 p-0.5 ml-1">
              {(['WIB', 'WITA', 'WIT'] as const).map((tz) => (
                <button
                  key={tz}
                  onClick={() => setTimeZone(tz)}
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    timeZone === tz ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tz}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Submit New Incident Trigger */}
          <button
            onClick={onOpenNewIncidentModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-[0_0_12px_rgba(0,200,248,0.3)] transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Lapor Lapangan</span>
            <span className="sm:hidden">+ Lapor</span>
          </button>

          {/* Urgent Alerts Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
              title="Notifikasi & Peringatan Dini"
            >
              <Bell className="w-4 h-4" />
              {stats.unverifiedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {stats.unverifiedCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0a1c33] border border-[#12365C] rounded-xl shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#12365C] mb-2">
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Peringatan Prioritas
                    </span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono-numbers">
                    {criticalAlerts.length} Insiden Kritis
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {criticalAlerts.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveIncident(item);
                        setShowNotifications(false);
                        setActiveTab('map');
                      }}
                      className="p-2.5 rounded-lg bg-[#071426] border border-[#12365C]/80 hover:border-cyan-400/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                          {item.severity.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-numbers">{item.incident_id}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{item.regency}, {item.province}</span>
                        <span className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                          Pantau <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 mt-2 border-t border-[#12365C] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status verifikasi tertunda: {stats.unverifiedCount}</span>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('incidents');
                    }}
                    className="text-cyan-400 font-semibold hover:underline"
                  >
                    Buka Antrean Verifikasi →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/50 rounded-lg p-1.5 sm:px-2.5 transition-all text-left cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-cyan-400/40"
              />
              <div className="hidden lg:block text-left leading-none">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono-numbers mt-0.5">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0a1c33] border border-[#12365C] rounded-xl shadow-2xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 mb-2 bg-[#071426] rounded-lg border border-[#12365C]/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Profil Pengguna Aktif
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{currentUser.name}</div>
                  <div className="text-[11px] text-cyan-300">{currentUser.agency}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Wilayah: {currentUser.assignedRegion}</div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Ganti Hak Akses / Peran (Demo)
                </div>

                <div className="space-y-1">
                  {DEMO_USERS.map((user) => {
                    const isSelected = user.role === currentUser.role;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          loginAsRole(user.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-semibold'
                            : 'text-slate-300 hover:bg-[#071426] hover:text-white'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs truncate">{user.role.replace('_', ' ')}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user.agency}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-[#12365C] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Mode: Simulasi RBAC</span>
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 hover:underline"
                  >
                    <LogOut className="w-3 h-3" />
                    Keluar Sesi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
