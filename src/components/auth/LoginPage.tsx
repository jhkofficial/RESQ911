import React, { useState } from 'react';
import {
  Shield,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  UserCheck,
  Building2,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import { DEMO_USERS } from '../../data/simulatedDisasters';
import { UserProfile } from '../../types/disaster';
import { useDisaster } from '../../context/DisasterContext';

export const LoginPage: React.FC = () => {
  const { loginAsUser, loginByNim } = useDisaster();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [inputNim, setInputNim] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSelected = () => {
    loginAsUser(selectedUser);
  };

  const handleLoginNim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNim.trim()) {
      setErrorMessage('Silakan masukkan nomor NIM.');
      return;
    }
    const result = loginByNim(inputNim);
    if (!result.success) {
      setErrorMessage(result.error || 'NIM tidak ditemukan.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN_NASIONAL':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'Admin Nasional (Pusdalops BNPB)'
        };
      case 'OPERATOR_DAERAH':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Operator Daerah (BPBD)'
        };
      case 'PETUGAS_LAPANGAN':
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          label: 'Petugas Lapangan (TRC SAR)'
        };
      case 'VIEWER_EKSEKUTIF':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          label: 'Viewer Eksekutif (Pengarah)'
        };
      default:
        return {
          bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          label: role
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#071426] text-slate-100 flex flex-col justify-between relative overflow-x-hidden select-none">
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
      <div className="relative z-10 bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>SIMULASI OPERASIONAL — BUKAN PENUGASAN DARURAT RESMI | Platform Intelijen &amp; Respon Bencana Nasional</span>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-4xl w-full bg-[#0a1c33]/95 border border-[#12365C] hover:border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all space-y-6">
          {/* Logo & Headline */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 shadow-[0_0_30px_rgba(0,200,248,0.3)] mb-3">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
                RESQ<span className="text-cyan-400">.911</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                MVP 4 ACTIVE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              National Disaster Intelligence &amp; Response Platform
            </p>
            <p className="text-xs text-slate-400 italic mt-0.5">
              "From Disaster Data to Coordinated Action."
            </p>
          </div>

          {/* Quick NIM Input Bar */}
          <form
            onSubmit={handleLoginNim}
            className="p-4 bg-[#071426]/80 rounded-2xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner"
          >
            <div className="w-full sm:w-auto flex-1 text-left">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Login Cepat dengan NIM Personel:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputNim}
                  onChange={(e) => {
                    setInputNim(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Contoh: 2511600070 atau 2511600021"
                  className="bg-[#0a1c33] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl w-full outline-none transition-all placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow"
                >
                  <span>Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {errorMessage && (
                <p className="text-[11px] text-red-400 font-medium mt-1.5">{errorMessage}</p>
              )}
            </div>
          </form>

          {/* User Selection Grid (6 Official Named Users) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Pilih Akun Personel Resmi (Pembagian Roles):
              </label>
              <span className="text-[11px] text-slate-400">
                Klik kartu untuk memilih profil komando
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_USERS.map((user) => {
                const isSelected = selectedUser.id === user.id;
                const badge = getRoleBadge(user.role);

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setInputNim(user.nim);
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3.5 relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/70 to-[#071426] border-cyan-400 shadow-[0_0_20px_rgba(0,200,248,0.25)] ring-1 ring-cyan-400/50'
                        : 'bg-[#071426]/90 border-[#12365C] hover:border-slate-500 hover:bg-[#071426]'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/40 shrink-0 shadow"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-cyan-300 font-mono font-medium">
                          NIM: {user.nim}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 line-clamp-1 flex items-center gap-1">
                        <span className="text-slate-400">Jabatan:</span> {user.position}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0 text-slate-500" />
                        <span>{user.agency}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Responsibility Matrix Brief */}
          <div className="p-3.5 bg-[#071426]/60 rounded-2xl border border-[#12365C] text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Matriks Pembagian Peran &amp; Hak Akses Operasional:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="bg-[#0a1c33] p-2.5 rounded-xl border border-red-500/20">
                <span className="font-bold text-red-300">ADMIN NASIONAL:</span> Johanes (2511600070) &amp; Raviez (2511600021)
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Otoritas tertinggi komando nasional, otorisasi misi tanggap darurat, alokasi armada nasional &amp; manajemen logistik pusat.
                </p>
              </div>
              <div className="bg-[#0a1c33] p-2.5 rounded-xl border border-amber-500/20">
                <span className="font-bold text-amber-300">OPERATOR DAERAH:</span> Rizki (2511600104) &amp; Ilham (2511600179)
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Verifikasi insiden wilayah Jawa Tengah &amp; Jawa Barat, dispatch TRC regional, dan pengajuan alokasi sumber daya.
                </p>
              </div>
              <div className="bg-[#0a1c33] p-2.5 rounded-xl border border-cyan-500/20">
                <span className="font-bold text-cyan-300">PETUGAS LAPANGAN:</span> Imdad Gusti (2511600393)
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Komandan TRC SAR, eksekusi misi di garis depan, pelaporan situasi lapangan (SitRep), kendala akses, dan eskalasi darurat.
                </p>
              </div>
              <div className="bg-[#0a1c33] p-2.5 rounded-xl border border-purple-500/20">
                <span className="font-bold text-purple-300">VIEWER EKSEKUTIF:</span> Andre Oktora (2511600203)
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Pemantauan strategis tingkat tinggi, audit trail kepatuhan, serta evaluasi rencana pemulihan pascabencana (read-only).
                </p>
              </div>
            </div>
          </div>

          {/* Action Login with Selected User */}
          <button
            onClick={handleLoginSelected}
            className="w-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black py-3 px-6 rounded-2xl text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            <Lock className="w-4 h-4" />
            <span>Masuk sebagai {selectedUser.name} ({selectedUser.nim}) — {selectedUser.role.replace('_', ' ')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[11px] text-slate-500 border-t border-[#12365C]/60 bg-[#040c17]/80">
        RESQ.911 National Disaster Intelligence &amp; Response Platform • Role-Based Operations Access • 6 Personel Aktif
      </footer>
    </div>
  );
};
