import React, { useState } from 'react';
import {
  Shield,
  Radio,
  Lock,
  ArrowRight,
  AlertTriangle,
  Users,
  Compass,
  CheckCircle2,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { DEMO_USERS } from '../../data/simulatedDisasters';
import { UserRole } from '../../types/disaster';
import { useDisaster } from '../../context/DisasterContext';

export const LoginPage: React.FC = () => {
  const { loginAsRole } = useDisaster();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN_NASIONAL');
  const [customPassword, setCustomPassword] = useState('demo-access-2026');

  const handleLogin = (roleToLogin: UserRole) => {
    loginAsRole(roleToLogin);
  };

  return (
    <div className="min-h-screen bg-[#071426] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background glowing telemetry grid & radial pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#071426] to-[#040c17] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0, 200, 248, 0.4) 1px, transparent 1px), radial-gradient(rgba(0, 200, 248, 0.4) 1px, #071426 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Banner Disclaimer */}
      <div className="relative z-10 bg-amber-950/70 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>DATA SIMULASI — BUKAN INFORMASI DARURAT RESMI | Prototipe Sistem Intelijen Bencana Nasional</span>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full bg-[#0a1c33]/90 border border-[#12365C] hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,200,248,0.3)] mb-3">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
                RESQ<span className="text-cyan-400">.911</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                MVP 1
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              National Disaster Intelligence &amp; Response Platform
            </p>
            <p className="text-xs text-slate-400 italic mt-0.5">
              "From Disaster Data to Coordinated Action."
            </p>
          </div>

          {/* Quick One-Click Demo Mode button */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-cyan-950/70 via-[#071426] to-cyan-950/70 rounded-2xl border border-cyan-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,200,248,0.15)]">
            <div className="text-left">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Masuk Cepat Mode Evaluasi / Pengujian
              </span>
              <p className="text-[11px] text-slate-300">
                Akses langsung seluruh fitur dashboard, peta interaktif, dan analitik tanpa kata sandi.
              </p>
            </div>
            <button
              onClick={() => handleLogin('ADMIN_NASIONAL')}
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Masuk Mode Demo Langsung</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Role Selection Grid */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Pilih Peran Operasional (Role-Based Demo):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_USERS.map((user) => {
                const isSelected = selectedRole === user.role;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedRole(user.role)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,200,248,0.2)]'
                        : 'bg-[#071426] border-[#12365C] hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-cyan-400/30 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono-numbers">
                          {user.role.replace('_', ' ')}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-xs font-bold text-white truncate mt-0.5">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.agency}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Login with Selected Role */}
          <button
            onClick={() => handleLogin(selectedRole)}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Lock className="w-4 h-4" />
            <span>Masuk Sesi Operasional sebagai {selectedRole.replace('_', ' ')}</span>
          </button>

          {/* Governance Notice */}
          <div className="mt-4 pt-3 border-t border-[#12365C] text-center text-[11px] text-slate-500 space-y-1">
            <p>
              Perhatian Keamanan: Autentikasi demo ditujukan khusus untuk peninjauan fungsional prototipe MVP.
            </p>
            <p>
              Hak Cipta &amp; Desain Arsitektur Intelijen Bencana Terpadu RESQ.911 © 2026.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[11px] text-slate-500 border-t border-[#12365C]/60 bg-[#040c17]/80">
        RESQ.911 National Disaster Intelligence Platform • In-Memory Reactive State Engine • Multi-Role Simulated RBAC
      </footer>
    </div>
  );
};
