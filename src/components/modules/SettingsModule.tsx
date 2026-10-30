import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  RotateCcw,
  CheckCircle2,
  Database,
  Lock,
  History,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';

export const SettingsModule: React.FC = () => {
  const { currentUser, resetToInitialData, incidents } = useDisaster();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Kembalikan dataset simulasi ke 118 data bawaan awal? Semua penambahan laporan kustom akan direset.')) {
      resetToInitialData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const rbacMatrix = [
    { permission: 'Melihat Seluruh Dashboard & Peta Spasial', admin: true, operator: true, field: true, executive: true },
    { permission: 'Input Laporan Darurat Lapangan Baru', admin: true, operator: true, field: true, executive: false },
    { permission: 'Mengubah Status Verifikasi Insiden', admin: true, operator: true, field: false, executive: false },
    { permission: 'Mengubah Status Respons Penanganan', admin: true, operator: true, field: true, executive: false },
    { permission: 'Otorisasi Rekomendasi Mesin AI (Human Review)', admin: true, operator: true, field: false, executive: false },
    { permission: 'Penerbitan Surat Perintah Tugas Satgas TRC', admin: true, operator: true, field: false, executive: false },
    { permission: 'Unduh Dokumen Rahasia & SitRep Nasional', admin: true, operator: true, field: false, executive: true },
    { permission: 'Konfigurasi Parameter Model AI & API Key', admin: true, operator: false, field: false, executive: false },
  ];

  const auditLogs = [
    { timestamp: '2026-10-30 08:14:22 WIB', actor: 'Dr. Raden Haryo (Admin)', action: 'Verifikasi Laporan RSQ-2026-0888 (Demak) disetujui.', ip: '10.24.1.88' },
    { timestamp: '2026-10-30 08:02:11 WIB', actor: 'Ir. Siti Aminah (BPBD Jateng)', action: 'Status Respons RSQ-2026-0888 diubah ke Respons Aktif.', ip: '192.168.10.12' },
    { timestamp: '2026-10-30 07:45:00 WIB', actor: 'Engine 3 (Reconciliation)', action: 'Deduplikasi otomatis 34 laporan warga wilayah Karanganyar.', ip: 'SYSTEM-DAEMON' },
    { timestamp: '2026-10-30 06:30:19 WIB', actor: 'Kapten Hendra (Posko Flotim)', action: 'Input laporan kaji cepat radius 7 km Gunung Lewotobi.', ip: '10.88.4.15' },
    { timestamp: '2026-10-30 05:15:40 WIB', actor: 'Dr. Raden Haryo (Admin)', action: 'Sinkronisasi telemetri BMKG & PVMBG manual trigger.', ip: '10.24.1.88' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Pengaturan Sistem, Tata Kelola RBAC &amp; Audit Trail
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Matriks otorisasi peran pengguna, kepatuhan tata kelola darurat, dan rekam jejak aktivitas
        </p>
      </div>

      {/* RBAC Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Matriks Hak Akses Berbasis Peran (RBAC Matrix)
            </h3>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono-numbers">
            Peran Anda: {currentUser.role.replace('_', ' ')}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#12365C]">
          <table className="w-full text-xs text-left text-slate-200">
            <thead className="bg-[#071426] text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-[#12365C]">
              <tr>
                <th className="py-2.5 px-3">Modul / Tindakan Operasional</th>
                <th className="py-2.5 px-3 text-center">Admin BNPB</th>
                <th className="py-2.5 px-3 text-center">Operator BPBD</th>
                <th className="py-2.5 px-3 text-center">Petugas Lapangan</th>
                <th className="py-2.5 px-3 text-center">Viewer Eksekutif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60 bg-[#0a1c33]">
              {rbacMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#071426]/50">
                  <td className="py-2.5 px-3 font-medium text-slate-200">{item.permission}</td>
                  <td className="py-2.5 px-3 text-center">
                    {item.admin ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.operator ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.field ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.executive ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log and Data Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Audit Log Feed */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Log Audit Aktivitas Operasional (Simulasi Keamanan)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono-numbers">Immutable Log</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log, i) => (
              <div key={i} className="p-2.5 bg-[#071426] border border-[#12365C] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono-numbers">{log.timestamp}</span>
                  <span className="font-mono-numbers text-cyan-400">{log.ip}</span>
                </div>
                <div className="font-semibold text-slate-200">{log.action}</div>
                <div className="text-[10px] text-slate-400">Oleh: <strong className="text-slate-300">{log.actor}</strong></div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Maintenance / Reset Section */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Manajemen State Simulasi
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              MVP 1 menggunakan in-memory state dengan sinkronisasi local storage. Anda dapat mereset dataset kapan saja ke kondisi awal 118 data insiden.
            </p>

            <div className="my-3 p-3 bg-[#071426] rounded-xl border border-[#12365C] text-xs space-y-1">
              <div className="text-slate-400">Total Insiden Saat Ini: <strong className="text-cyan-300 font-mono-numbers">{incidents.length}</strong></div>
              <div className="text-slate-400">Status Penyimpanan: <span className="text-emerald-400">Sinkron Memori</span></div>
            </div>

            {resetSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dataset berhasil dikembalikan ke default awal!</span>
              </div>
            )}
          </div>

          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kembalikan ke Dataset Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
