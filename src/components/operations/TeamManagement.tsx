import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Shield,
  Layers,
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  PhoneCall,
  Clock
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { SimulatedTeam, TeamAvailability } from '../../types/operations';
import { recommendTeamsForMission } from '../../utils/operationsEngine';

export const TeamManagement: React.FC = () => {
  const {
    teams,
    missions,
    assignTeamToMission,
    removeTeamFromMission,
    currentUser
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<SimulatedTeam | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [targetMissionId, setTargetMissionId] = useState<string>(missions[0]?.mission_id || '');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isReadOnly = currentUser.role === 'VIEWER_EKSEKUTIF';

  const filteredTeams = teams.filter((t) => {
    if (institutionFilter !== 'all' && !t.institution.toLowerCase().includes(institutionFilter.toLowerCase())) {
      return false;
    }
    if (availabilityFilter !== 'all' && t.availability !== availabilityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.team_name.toLowerCase().includes(q) ||
        t.institution.toLowerCase().includes(q) ||
        t.team_leader.toLowerCase().includes(q) ||
        t.skills_capabilities.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getAvailabilityBadge = (status: TeamAvailability) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Assigned':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Reserved':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/40';
    }
  };

  const handleAssign = () => {
    if (!selectedTeam || !targetMissionId) return;
    const res = assignTeamToMission(targetMissionId, selectedTeam.team_id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Tim "${selectedTeam.team_name}" berhasil ditugaskan ke misi ${targetMissionId}.`
      });
      setAssignmentModalOpen(false);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal menugaskan tim.'
      });
    }
  };

  const handleRelease = (team: SimulatedTeam) => {
    if (!team.current_assignment_mission_id) return;
    const res = removeTeamFromMission(team.current_assignment_mission_id, team.team_id);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Tim "${team.team_name}" telah dilepas dari misi dan kini berstatus Tersedia.`
      });
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal melepas tim.'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULASI MANAJEMEN SATGAS:</strong> Registri tim operasional multi-instansi (BPBD, Basarnas, PMI, TNI, Tagana) dalam kerangka kendali Pusdalops.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          OPERATOR: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Manajemen Tim &amp; Personel Satgas (Team Management)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              15 REGISTRI TIM AKTIF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau status kesiapan personel, verifikasi kompetensi operasional, dan alokasikan ke sektor misi aktif.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama regu, pimpinan, atau keahlian..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Instansi</option>
            <option value="BPBD">BPBD</option>
            <option value="BASARNAS">BASARNAS</option>
            <option value="PMI">PMI</option>
            <option value="TNI">TNI</option>
            <option value="Kemensos">Kemensos / Tagana</option>
            <option value="ORARI">ORARI / Komunikasi</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Status Kesiapan</option>
            <option value="Available">Tersedia (Ready to Deploy)</option>
            <option value="Assigned">Sedang Ditugaskan (Assigned)</option>
            <option value="Reserved">Dicadangkan (Reserved)</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => {
          const isAssigned = team.availability === 'Assigned';
          const assignedMission = missions.find((m) => m.mission_id === team.current_assignment_mission_id);

          return (
            <div
              key={team.team_id}
              className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all space-y-3 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getAvailabilityBadge(team.availability)}`}>
                    {team.availability}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-[#071426] px-2 py-0.5 rounded border border-[#12365C]">
                    {team.members_count} Personel
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {team.team_name}
                  </h3>
                  <p className="text-[11px] text-cyan-300 font-medium">
                    {team.institution} • {team.region}
                  </p>
                </div>

                <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Komandan Tim:</span>
                    <span className="font-semibold text-white truncate">{team.team_leader}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Sektor Aktif:</span>
                    <span className="text-slate-200 truncate">{team.operational_area}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Kanal Kontak:</span>
                    <span className="text-cyan-400 font-mono text-[10px] truncate">{team.contact_reference}</span>
                  </div>
                </div>

                {/* Capabilities Tags */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Keahlian &amp; Kapabilitas:</span>
                  <div className="flex flex-wrap gap-1">
                    {team.skills_capabilities.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#071426] border border-[#12365C] text-slate-300 text-[10px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {team.vehicle_assigned && (
                  <div className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Armada:</span> {team.vehicle_assigned}
                  </div>
                )}

                {isAssigned && assignedMission && (
                  <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-[10px] text-cyan-200">
                    <strong>Penugasan Aktif:</strong> {assignedMission.mission_id} — {assignedMission.title}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#12365C] pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {team.last_status_update}
                </span>

                <div className="flex items-center gap-2">
                  {isAssigned ? (
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => handleRelease(team)}
                      className="bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[11px] font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all cursor-pointer"
                    >
                      Lepas Penugasan
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => {
                        setSelectedTeam(team);
                        setAssignmentModalOpen(true);
                      }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tugaskan Tim</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Assignment Modal */}
      {assignmentModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Penugasan Operasional Satgas
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedTeam.team_name}
                </h3>
              </div>
              <button
                onClick={() => setAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                <p><strong>Komandan:</strong> {selectedTeam.team_leader}</p>
                <p><strong>Jumlah Personel:</strong> {selectedTeam.members_count} orang</p>
                <p><strong>Instansi:</strong> {selectedTeam.institution}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Misi Tanggap Darurat Tujuan:
                </label>
                <select
                  value={targetMissionId}
                  onChange={(e) => setTargetMissionId(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                >
                  {missions.map((m) => (
                    <option key={m.mission_id} value={m.mission_id}>
                      {m.mission_id} — {m.title} ({m.regency}) [{m.status}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#12365C] pt-3">
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(false)}
                className="bg-[#071426] text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAssign}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-cyan-500/20"
              >
                Konfirmasi Penugasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
