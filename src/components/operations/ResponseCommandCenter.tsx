import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Users,
  Truck,
  Activity,
  ArrowRight,
  Filter,
  PlusCircle,
  FileCheck,
  ChevronRight,
  Sparkles,
  Search,
  Radio,
  Flame,
  AlertOctagon
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { ResponseMission, MissionStatus } from '../../types/operations';

export const ResponseCommandCenter: React.FC = () => {
  const {
    missions,
    operationsMetrics,
    teams,
    inventory,
    escalations,
    currentUser,
    setActiveTab,
    authorizeMission
  } = useDisaster();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMission, setSelectedMission] = useState<ResponseMission | null>(null);

  const filteredMissions = missions.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && m.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.mission_id.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.province.toLowerCase().includes(q) ||
        m.regency.toLowerCase().includes(q) ||
        m.disaster_type.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'In Progress':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Pending Authorization':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
      case 'Authorized':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Ready for Simulated Deployment':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Completed':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/40';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Kritis':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Tinggi':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Sedang':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULASI OPERASIONAL — BUKAN PENUGASAN DARURAT RESMI:</strong> Seluruh orkestrasi misi, tim satgas, dan alokasi armada beroperasi dalam sandbox evaluasi intelijen bencana.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          LOGGED IN: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Pusat Komando Operasi Tanggap Darurat
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              MVP 4 ORCHESTRATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Orkestrasi terpadu: Transformasi rekomendasi AI ke penugasan misi lapangan, alokasi armada, dan pemantauan satgas respon.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('mission-planning')}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Rencanakan Misi Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('mission-authorization')}
            className="bg-[#0a1c33] hover:bg-[#12365C] border border-cyan-500/30 text-cyan-300 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Meja Otorisasi ({operationsMetrics.pendingAuthorization})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Misi Berjalan</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {operationsMetrics.activeMissions}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Dari total {operationsMetrics.totalMissions} rencana misi
          </p>
        </div>

        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Butuh Otorisasi</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {operationsMetrics.pendingAuthorization}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Menunggu review Admin / Operator
          </p>
        </div>

        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Satgas Dikerahkan</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {operationsMetrics.deployedTeams}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {operationsMetrics.availableTeams} tim cadangan siap
          </p>
        </div>

        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Peringatan Stok</span>
            <Truck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">
            {operationsMetrics.lowStockResources}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Sumber daya di bawah batas aman
          </p>
        </div>

        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Eskalasi Lapangan</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">
            {operationsMetrics.openEscalations}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Kendala jalur &amp; logistik aktif
          </p>
        </div>
      </div>

      {/* Urgent Field Escalation Ticker */}
      {escalations.filter((e) => e.status !== 'Resolved').length > 0 && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/30 text-red-300 border border-red-500/50 shrink-0">
              ESKALASI AKTIF
            </span>
            <p className="text-red-200 truncate">
              {escalations.find((e) => e.status !== 'Resolved')?.description}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('coordination-escalation')}
            className="text-[11px] font-bold text-red-300 hover:text-white shrink-0 flex items-center gap-1 transition-all underline underline-offset-2"
          >
            <span>Tindak Lanjuti</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari misi, bencana, provinsi, atau ID..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Authorization">Pending Authorization</option>
            <option value="Authorized">Authorized</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Kritis">Kritis</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
          </select>
        </div>
      </div>

      {/* Active Missions Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#12365C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Daftar Misi Respon Operasional Terdaftar ({filteredMissions.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Terakhir disinkronkan realtime
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#071426]/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#12365C]">
              <tr>
                <th className="py-3 px-4">ID Misi &amp; Judul Operasi</th>
                <th className="py-3 px-4">Lokasi Sektor</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status Misi</th>
                <th className="py-3 px-4">Kemajuan</th>
                <th className="py-3 px-4">Tim Satgas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Tidak ada misi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMissions.map((mission) => {
                  const assignedTeams = teams.filter((t) => mission.assigned_team_ids.includes(t.team_id));
                  return (
                    <tr
                      key={mission.mission_id}
                      className="hover:bg-[#071426]/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMission(mission)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-cyan-400 font-bold text-[11px]">
                          {mission.mission_id}
                        </div>
                        <div className="font-semibold text-white max-w-xs truncate mt-0.5">
                          {mission.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>Jenis: {mission.disaster_type}</span>
                          <span>•</span>
                          <span>Terdampak: {mission.actual_victims_evacuated || 0} / {mission.target_victims_evacuated || 0} jiwa</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{mission.regency}</div>
                        <div className="text-[10px] text-slate-400">{mission.province}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadge(mission.priority)}`}>
                          {mission.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(mission.status)}`}>
                          {mission.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 w-36">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-400">Progres</span>
                          <span className="font-bold text-white">{mission.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-[#071426] h-1.5 rounded-full overflow-hidden border border-[#12365C]">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${mission.progress_percentage}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-white">
                          {assignedTeams.length} Tim Ditugaskan
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {assignedTeams.map((t) => t.team_name).join(', ') || 'Belum ada tim'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMission(mission);
                          }}
                          className="bg-[#071426] hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 ml-auto transition-all"
                        >
                          <span>Rincian</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#12365C] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold text-xs">
                    {selectedMission.mission_id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPriorityBadge(selectedMission.priority)}`}>
                    {selectedMission.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(selectedMission.status)}`}>
                    {selectedMission.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {selectedMission.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedMission.location_name} • {selectedMission.regency}, {selectedMission.province}
                </p>
              </div>

              <button
                onClick={() => setSelectedMission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#071426] transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                <span className="font-bold text-cyan-400 uppercase text-[11px] block mb-1">
                  Tujuan Utama Operasi:
                </span>
                <p>{selectedMission.objective}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                  <span className="font-bold text-slate-300 uppercase text-[11px] block mb-1.5">
                    Kebutuhan Kapabilitas &amp; Personel:
                  </span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedMission.required_capabilities.map((cap, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                        {cap}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Estimasi kebutuhan: {selectedMission.required_team_size} personel satgas.
                  </p>
                </div>

                <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                  <span className="font-bold text-slate-300 uppercase text-[11px] block mb-1.5">
                    Kendala Lapangan Diketahui:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {selectedMission.known_constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                <span className="font-bold text-slate-300 uppercase text-[11px] block mb-1.5">
                  Rencana Tindakan Operasi Lapangan:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  {selectedMission.proposed_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ol>
              </div>

              {selectedMission.approved_by && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300">
                  <strong>Otorisasi Resmi Diterbitkan:</strong> Oleh {selectedMission.approved_by} ({selectedMission.approved_by_role}) pada{' '}
                  {new Date(selectedMission.approved_at || '').toLocaleString('id-ID')}.
                  {selectedMission.approval_notes && (
                    <p className="mt-1 text-slate-300 italic">"{selectedMission.approval_notes}"</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#12365C] pt-3">
              <span className="text-[11px] text-slate-400">
                Dibuat oleh: {selectedMission.created_by}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMission(null);
                    setActiveTab('field-tasks');
                  }}
                  className="bg-[#071426] hover:bg-[#12365C] text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Lihat Tugas Lapangan
                </button>
                <button
                  onClick={() => {
                    setSelectedMission(null);
                    setActiveTab('mission-planning');
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs"
                >
                  Buka di Perencanaan Misi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
