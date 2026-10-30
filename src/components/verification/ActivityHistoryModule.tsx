import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Clock,
  FileText,
  User,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { VerificationLog } from '../../types/disaster';

export const ActivityHistoryModule: React.FC = () => {
  const { verificationLogs, timeZone } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = verificationLogs.filter((log) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.report_id.toLowerCase().includes(q) ||
        (log.report_title || '').toLowerCase().includes(q) ||
        log.actor_name.toLowerCase().includes(q) ||
        log.notes.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    return true;
  });

  const getActionBadge = (action: VerificationLog['action']) => {
    switch (action) {
      case 'VERIFIED':
        return {
          label: 'Diverifikasi',
          icon: CheckCircle2,
          class: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
        };
      case 'REQUESTED_CLARIFICATION':
        return {
          label: 'Minta Klarifikasi',
          icon: HelpCircle,
          class: 'bg-purple-950/70 text-purple-300 border-purple-500/40',
        };
      case 'REJECTED':
        return {
          label: 'Ditolak',
          icon: XCircle,
          class: 'bg-rose-950/70 text-rose-300 border-rose-500/40',
        };
      case 'FLAGGED_DUPLICATE':
      case 'MERGED':
        return {
          label: 'Duplikat / Digabung',
          icon: Copy,
          class: 'bg-orange-950/70 text-orange-300 border-orange-500/40',
        };
      case 'REPORT_SUBMITTED':
        return {
          label: 'Laporan Diajukan',
          icon: FileText,
          class: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40',
        };
      default:
        return {
          label: action,
          icon: History,
          class: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider">
              Immutable Verification Audit Trail
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {verificationLogs.length} Catatan Rekam Jejak
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Riwayat Aktivitas &amp; Log Audit Verifikasi
          </h1>
          <p className="text-xs text-slate-400">
            Seluruh rekam jejak pengajuan laporan, validasi, otorisasi verifikasi, klarifikasi, dan penggabungan insiden
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Nama Petugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Tindakan</option>
            <option value="VERIFIED">Diverifikasi</option>
            <option value="REQUESTED_CLARIFICATION">Klarifikasi</option>
            <option value="REJECTED">Ditolak</option>
            <option value="MERGED">Digabungkan</option>
            <option value="REPORT_SUBMITTED">Laporan Masuk</option>
          </select>
        </div>
      </div>

      {/* Timeline Audit Logs */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada catatan log aktivitas yang sesuai dengan filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#12365C]">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              const dateStr = new Date(log.timestamp).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#071426] border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

                  <div className="bg-[#071426] border border-[#12365C] hover:border-cyan-500/40 rounded-xl p-3.5 transition-all space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badge.class}`}
                        >
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <span className="font-mono-numbers text-xs font-bold text-cyan-300">
                          {log.report_id}
                        </span>
                        {log.linked_incident_id && (
                          <span className="text-[10px] text-emerald-400 font-mono-numbers">
                            ➔ {log.linked_incident_id}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono-numbers flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {dateStr} {timeZone}
                      </div>
                    </div>

                    {log.report_title && (
                      <div className="text-xs font-semibold text-white">{log.report_title}</div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed">{log.notes}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#12365C]/60 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Pelaksana:</span>
                        <strong className="text-slate-300">{log.actor_name}</strong>
                        <span className="text-cyan-400">({log.actor_role.replace('_', ' ')})</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono-numbers">
                        ID Log: {log.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
