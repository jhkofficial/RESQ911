import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Users,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Clock
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { MissionAuditLog } from '../../types/operations';

export const MissionHistoryModule: React.FC = () => {
  const { auditLogs, missions, currentUser } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [missionFilter, setMissionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (missionFilter !== 'all' && log.mission_id !== missionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.actor_name.toLowerCase().includes(q) ||
        log.mission_id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.notes.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportAuditJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RESQ911_Operations_AuditTrail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAuditCSV = () => {
    const headers = ['log_id', 'mission_id', 'actor_name', 'actor_role', 'action', 'previous_state', 'new_state', 'timestamp', 'notes'];
    const rows = filteredLogs.map((l) => [
      l.log_id,
      l.mission_id,
      `"${l.actor_name}"`,
      `"${l.actor_role}"`,
      `"${l.action}"`,
      `"${l.previous_state}"`,
      `"${l.new_state}"`,
      l.timestamp,
      `"${l.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `RESQ911_Operations_AuditTrail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'AUTHORIZE_MISSION':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CREATE_MISSION':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'ASSIGN_TEAM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ALLOCATE_RESOURCE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'RAISE_ESCALATION':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'RESOLVE_ESCALATION':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>AUDIT TRAIL OPERASI (SIMULASI):</strong> Rekam jejak kepatuhan komando permanen mencatat setiap perubahan status misi, penugasan tim, dan alokasi logistik oleh personel resmi.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          AUDITOR: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Rekam Jejak &amp; Audit Operasional (Mission Audit Trail)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {auditLogs.length} LOG AKTIVITAS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparansi penuh dan akuntabilitas komando: mencatat identitas personel, timestamp, transisi status, dan justifikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAuditCSV}
            className="bg-[#0a1c33] hover:bg-[#12365C] border border-[#12365C] text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={exportAuditJSON}
            className="bg-[#0a1c33] hover:bg-[#12365C] border border-[#12365C] text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor JSON</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama personel, NIM, aksi, atau misi..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Tipe Aksi</option>
            <option value="CREATE_MISSION">CREATE_MISSION</option>
            <option value="AUTHORIZE_MISSION">AUTHORIZE_MISSION</option>
            <option value="ASSIGN_TEAM">ASSIGN_TEAM</option>
            <option value="ALLOCATE_RESOURCE">ALLOCATE_RESOURCE</option>
            <option value="UPDATE_TASK">UPDATE_TASK</option>
            <option value="RAISE_ESCALATION">RAISE_ESCALATION</option>
            <option value="RESOLVE_ESCALATION">RESOLVE_ESCALATION</option>
          </select>

          <select
            value={missionFilter}
            onChange={(e) => setMissionFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Misi</option>
            {missions.map((m) => (
              <option key={m.mission_id} value={m.mission_id}>
                {m.mission_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#12365C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Log Kronologis Audit Operasi ({filteredLogs.length} Catatan)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Immutable Audit Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#071426]/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#12365C]">
              <tr>
                <th className="py-3 px-4">Waktu &amp; ID Log</th>
                <th className="py-3 px-4">Personel / Aktor (NIM)</th>
                <th className="py-3 px-4">Aksi Komando</th>
                <th className="py-3 px-4">ID Misi</th>
                <th className="py-3 px-4">Transisi Status</th>
                <th className="py-3 px-4">Catatan / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Tidak ada catatan audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-[#071426]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono text-cyan-400 font-bold text-[10px]">
                        {log.log_id}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.actor_name}</div>
                      <div className="text-[10px] text-slate-400">{log.actor_role}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {log.mission_id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">{log.previous_state}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="text-white font-semibold">{log.new_state}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-sm">
                      {log.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
