import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Users,
  Truck,
  ArrowRight,
  XCircle,
  HelpCircle,
  Lock,
  Compass,
  CheckSquare,
  Square
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { ResponseMission } from '../../types/operations';

export const MissionAuthorizationCenter: React.FC = () => {
  const {
    missions,
    authorizeMission,
    currentUser,
    setActiveTab
  } = useDisaster();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    missions.find((m) => m.status === 'Pending Authorization')?.mission_id || missions[0]?.mission_id || ''
  );
  const [rationale, setRationale] = useState<string>(
    'Misi tanggap darurat disetujui untuk pengerahan satgas gabungan sesuai prosedur standar penanganan bencana.'
  );
  const [checklist, setChecklist] = useState({
    incident_verified: true,
    team_competency_checked: true,
    resources_available: true,
    safety_protocol_cleared: true
  });
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isAuthorizedRole = currentUser.role === 'ADMIN_NASIONAL' || currentUser.role === 'OPERATOR_DAERAH';

  const pendingMissions = missions.filter(
    (m) => m.status === 'Pending Authorization' || m.status === 'Draft'
  );

  const activeMission = missions.find((m) => m.mission_id === selectedMissionId) || pendingMissions[0];

  const handleDecision = (decision: 'Authorized' | 'Revision Required' | 'Rejected') => {
    if (!activeMission) return;
    if (!isAuthorizedRole) {
      setActionFeedback({
        type: 'error',
        message: 'Akses Ditolak: Hanya Administrator Nasional dan Operator Daerah yang memiliki hak otorisasi misi.'
      });
      return;
    }

    if (!rationale.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Catatan justifikasi otorisasi wajib diisi untuk rekam jejak audit komando.'
      });
      return;
    }

    const res = authorizeMission(activeMission.mission_id, decision, rationale, checklist);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Keputusan "${decision}" untuk misi ${activeMission.mission_id} berhasil dicatat dalam audit trail komando.`
      });
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal memproses keputusan.'
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
            <strong>MEJA OTORISASI OPERASIONAL (SIMULASI):</strong> Penegakan prinsip Human-in-the-Loop. Sistem tidak pernah mengotorisasi pengerahan misi secara sepihak.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          PEJABAT PENILAI: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Pusat Otorisasi Misi &amp; Komando (Mission Authorization Center)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/40">
              GATEWAY OTORISASI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Penelaahan kelayakan operasional, kesiapan personil, ketersediaan logistik, dan persetujuan Surat Perintah Tugas (SPT).
          </p>
        </div>
      </div>

      {/* Role Access Notice */}
      {!isAuthorizedRole && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl text-xs text-purple-200 flex items-start gap-3">
          <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-purple-300 block mb-0.5">
              Pemberitahuan Hak Akses: Mode Peninjauan (Read-Only)
            </strong>
            <p>
              Akun Anda saat ini masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')}).
              Otorisasi misi darurat dibatasi hanya untuk <strong>Administrator Nasional</strong> (Johanes / Raviez) dan <strong>Operator Daerah</strong> (Rizki / Ilham). Tombol persetujuan dinonaktifkan untuk peran Anda.
            </p>
          </div>
        </div>
      )}

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

      {/* Layout Split: Left List of Pending Missions, Right Selected Detail & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Mission Queue */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#12365C] pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Antrean Penelaahan ({pendingMissions.length})
            </span>
            <span className="text-[10px] text-slate-400">Pilih untuk telaah</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pendingMissions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Tidak ada misi yang menunggu otorisasi saat ini.
              </div>
            ) : (
              pendingMissions.map((m) => {
                const isSelected = activeMission?.mission_id === m.mission_id;
                return (
                  <div
                    key={m.mission_id}
                    onClick={() => {
                      setSelectedMissionId(m.mission_id);
                      setActionFeedback(null);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,200,248,0.2)]'
                        : 'bg-[#071426] border-[#12365C] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-cyan-400 font-bold text-[10px]">
                        {m.mission_id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                        m.priority === 'Kritis' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {m.priority}
                      </span>
                    </div>

                    <div className="font-semibold text-white text-xs truncate">
                      {m.title}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{m.regency}, {m.province}</span>
                      <span className="text-amber-400 font-medium">{m.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Mission Detail, Checklist, and Action */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 space-y-5">
          {activeMission ? (
            <>
              {/* Mission Summary Banner */}
              <div className="border-b border-[#12365C] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold text-xs">
                      {activeMission.mission_id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-300 font-medium">
                      Insiden Terkait: {activeMission.incident_id}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Status: {activeMission.status}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white">
                  {activeMission.title}
                </h2>

                <p className="text-xs text-slate-300 bg-[#071426] p-3 rounded-xl border border-[#12365C]">
                  <strong>Tujuan Operasi:</strong> {activeMission.objective}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lokasi Sektor:</span>
                    <span className="text-white font-medium">{activeMission.location_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Korban:</span>
                    <span className="text-white font-medium">{activeMission.target_victims_evacuated || 0} jiwa</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Diusulkan Oleh:</span>
                    <span className="text-white font-medium">{activeMission.created_by}</span>
                  </div>
                </div>
              </div>

              {/* Authorization Verification Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-cyan-400" />
                    Daftar Uji Kepatuhan Komando (Authorization Checklist):
                  </h3>
                  <span className="text-[10px] text-slate-400">Centang sebelum menyetujui</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={() => isAuthorizedRole && setChecklist({ ...checklist, incident_verified: !checklist.incident_verified })}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      checklist.incident_verified ? 'bg-cyan-950/40 border-cyan-400/50 text-white' : 'bg-[#071426] border-[#12365C] text-slate-400'
                    }`}
                  >
                    {checklist.incident_verified ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>1. Data insiden telah divalidasi resmi Pusdalops</span>
                  </div>

                  <div
                    onClick={() => isAuthorizedRole && setChecklist({ ...checklist, team_competency_checked: !checklist.team_competency_checked })}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      checklist.team_competency_checked ? 'bg-cyan-950/40 border-cyan-400/50 text-white' : 'bg-[#071426] border-[#12365C] text-slate-400'
                    }`}
                  >
                    {checklist.team_competency_checked ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>2. Kompetensi tim satgas mencukupi kriteria bahaya</span>
                  </div>

                  <div
                    onClick={() => isAuthorizedRole && setChecklist({ ...checklist, resources_available: !checklist.resources_available })}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      checklist.resources_available ? 'bg-cyan-950/40 border-cyan-400/50 text-white' : 'bg-[#071426] border-[#12365C] text-slate-400'
                    }`}
                  >
                    {checklist.resources_available ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>3. Ketersediaan logistik &amp; armada terkonfirmasi di depo</span>
                  </div>

                  <div
                    onClick={() => isAuthorizedRole && setChecklist({ ...checklist, safety_protocol_cleared: !checklist.safety_protocol_cleared })}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      checklist.safety_protocol_cleared ? 'bg-cyan-950/40 border-cyan-400/50 text-white' : 'bg-[#071426] border-[#12365C] text-slate-400'
                    }`}
                  >
                    {checklist.safety_protocol_cleared ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>4. Protokol keselamatan petugas (Safety Protocol) disetujui</span>
                  </div>
                </div>
              </div>

              {/* Rationale Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Catatan Justifikasi / Instruksi Komandan Penilai:
                </label>
                <textarea
                  rows={2}
                  disabled={!isAuthorizedRole}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Instruksi khusus kepada pimpinan lapangan..."
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs p-3 rounded-xl outline-none disabled:opacity-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#12365C] pt-4">
                <button
                  type="button"
                  disabled={!isAuthorizedRole}
                  onClick={() => handleDecision('Rejected')}
                  className="w-full sm:w-auto bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak Misi</span>
                </button>

                <button
                  type="button"
                  disabled={!isAuthorizedRole}
                  onClick={() => handleDecision('Revision Required')}
                  className="w-full sm:w-auto bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Clock className="w-4 h-4" />
                  <span>Minta Revisi Perencanaan</span>
                </button>

                <button
                  type="button"
                  disabled={!isAuthorizedRole}
                  onClick={() => handleDecision('Authorized')}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui &amp; Otorisasi Misi</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Pilih misi dari daftar antrean untuk melakukan telaah otorisasi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
