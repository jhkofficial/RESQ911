import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Send,
  MapPin,
  Camera,
  Users,
  Compass,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  AlertOctagon,
  LifeBuoy
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { TaskStatus, EscalationCategory } from '../../types/operations';

export const FieldOperationsWorkspace: React.FC = () => {
  const {
    tasks,
    missions,
    fieldUpdates,
    updateTaskStatus,
    submitFieldReport,
    raiseEscalation,
    currentUser
  } = useDisaster();

  // Find tasks assigned to field teams
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.task_id || '');
  const [reportedLocation, setReportedLocation] = useState('Dukuh Karangtengah Lor RW 02');
  const [situationText, setSituationText] = useState('');
  const [progressVal, setProgressVal] = useState<number>(75);
  const [obstacleInput, setObstacleInput] = useState('');
  const [resourceUsage, setResourceUsage] = useState('');

  // Escalation quick form
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState<EscalationCategory>('RESOURCE_SHORTAGE');
  const [escalationDesc, setEscalationDesc] = useState('');
  const [escalationPriority, setEscalationPriority] = useState<'Kritis' | 'Tinggi' | 'Sedang'>('Kritis');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeTask = tasks.find((t) => t.task_id === selectedTaskId) || tasks[0];
  const activeMission = missions.find((m) => m.mission_id === activeTask?.mission_id);

  const handleUpdateTaskStatus = (newStatus: TaskStatus) => {
    if (!activeTask) return;
    const res = updateTaskStatus(activeTask.task_id, newStatus, progressVal);
    if (res.success) {
      setNotification({
        type: 'success',
        message: `Status tugas "${activeTask.task_title}" berhasil diperbarui ke "${newStatus}".`
      });
    }
  };

  const handleSubmitSitrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationText.trim()) {
      setNotification({ type: 'error', message: 'Deskripsi situasi lapangan wajib diisi.' });
      return;
    }

    const res = submitFieldReport({
      mission_id: activeTask?.mission_id || 'MSN-2026-0101',
      task_id: activeTask?.task_id,
      reported_location: reportedLocation,
      situation_description: situationText,
      progress_status: `Kemajuan lapangan mencapai ${progressVal}%`,
      progress_percentage: progressVal,
      reported_obstacles: obstacleInput.trim() ? [obstacleInput.trim()] : [],
      resource_usage_notes: resourceUsage,
      verification_status: 'Diverifikasi Posko'
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Laporan Situasi Lapangan (SitRep) berhasil disinkronkan ke Posko Pusdalops Pusat.'
      });
      setSituationText('');
      setObstacleInput('');
      setResourceUsage('');
    } else {
      setNotification({ type: 'error', message: res.error || 'Gagal mengirim laporan.' });
    }
  };

  const handleSendEscalation = () => {
    if (!escalationDesc.trim()) return;
    const res = raiseEscalation({
      mission_id: activeTask?.mission_id || 'MSN-2026-0101',
      category: escalationCategory,
      description: escalationDesc,
      priority: escalationPriority
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: 'Eskalasi darurat telah dipancarkan ke meja komando pusat.'
      });
      setShowEscalationModal(false);
      setEscalationDesc('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>WORKSPACE LAPANGAN SATGAS (SIMULASI):</strong> Antarmuka taktis bagi komandan TRC lapangan untuk check-in sektor, update progres penugasan, dan pengiriman SitRep.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40 text-cyan-300">
          FIELD OPERATOR: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Ruang Operasi Taktis Lapangan (Field Workspace)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              TRC SATGAS FRONT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Menerima instruksi komando resmi, mengupdate status tim secara realtime, dan melaporkan kendala logistik.
          </p>
        </div>

        <button
          onClick={() => setShowEscalationModal(true)}
          className="bg-red-500 hover:bg-red-400 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-500/20"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Laporkan Kendala / Eskalasi Darurat</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Task & Sector Switcher */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Pilih Tugas Operasional Aktif di Lapangan:
          </label>
          <span className="text-[10px] text-slate-400">
            {tasks.length} tugas terdaftar dalam misi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {tasks.map((task) => {
            const isSelected = activeTask?.task_id === task.task_id;
            return (
              <div
                key={task.task_id}
                onClick={() => {
                  setSelectedTaskId(task.task_id);
                  setProgressVal(task.progress_percentage);
                  setReportedLocation(task.location_label || 'Sektor Lapangan');
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,200,248,0.2)]'
                    : 'bg-[#071426] border-[#12365C] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-cyan-400 font-bold text-[10px]">
                    {task.task_id}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                    task.task_status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : task.task_status === 'In Progress'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {task.task_status}
                  </span>
                </div>
                <div className="font-semibold text-white text-xs truncate">
                  {task.task_title}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{task.location_label || 'Sektor Utama'}</span>
                  <span className="text-cyan-300 font-bold">{task.progress_percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Task Working Deck */}
      {activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Task Info & Status Control */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#12365C] pb-3">
              <span className="text-[10px] font-bold text-cyan-400 font-mono block">
                {activeTask.task_id} • {activeTask.assigned_team_name}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {activeTask.task_title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeTask.description}
              </p>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2 p-3 bg-[#071426] rounded-xl border border-[#12365C]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Tingkat Kemajuan Tugas:</span>
                <span className="text-cyan-400 font-bold font-mono text-sm">{progressVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressVal}
                onChange={(e) => setProgressVal(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% Memulai</span>
                <span>50% Setengah</span>
                <span>100% Selesai</span>
              </div>
            </div>

            {/* Status Quick Action Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ubah Status Tugas:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateTaskStatus('In Progress')}
                  className="bg-[#071426] hover:bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  Sedang Dikerjakan
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateTaskStatus('Blocked')}
                  className="bg-[#071426] hover:bg-red-950/70 border border-red-500/40 text-red-300 font-bold py-2 rounded-xl text-xs transition-all"
                >
                  Tertahan (Blocked)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProgressVal(100);
                    handleUpdateTaskStatus('Completed');
                  }}
                  className="col-span-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-black py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tandai Selesai 100%</span>
                </button>
              </div>
            </div>

            {/* Blockers list */}
            {activeTask.blockers && activeTask.blockers.length > 0 && (
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 space-y-1">
                <strong>Kendala Terdata:</strong>
                <ul className="list-disc list-inside text-[11px] text-red-200">
                  {activeTask.blockers.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SitRep Form (Laporan Situasi Lapangan) */}
          <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 space-y-4">
            <div className="border-b border-[#12365C] pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                Laporan Situasi Lapangan (Field SitRep)
              </h3>
              <span className="text-[10px] text-slate-400">
                Pusdalops Telemetry Ingest
              </span>
            </div>

            <form onSubmit={handleSubmitSitrep} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Lokasi / Titik Pengamatan Sektor:</label>
                <input
                  type="text"
                  value={reportedLocation}
                  onChange={(e) => setReportedLocation(e.target.value)}
                  placeholder="Contoh: Tanggul KM 4 Desa Ketanjung"
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Deskripsi Kronologis &amp; Temuan Lapangan:</label>
                <textarea
                  rows={4}
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  placeholder="Laporkan jumlah warga yang telah dievakuasi, kondisi debit/arus air, dan situasi posko pengungsian..."
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs p-3 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Kendala Lapangan (Jika ada):</label>
                  <input
                    type="text"
                    value={obstacleInput}
                    onChange={(e) => setObstacleInput(e.target.value)}
                    placeholder="Contoh: Kabel listrik putus melintang di air"
                    className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Penggunaan Sumber Daya / BBM:</label>
                  <input
                    type="text"
                    value={resourceUsage}
                    onChange={(e) => setResourceUsage(e.target.value)}
                    placeholder="Contoh: 30 Liter Pertalite, 2 kantong medis"
                    className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#12365C] pt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Pelapor: {currentUser.name} ({currentUser.role.replace('_', ' ')})
                </span>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Situasi (SitRep)</span>
                </button>
              </div>
            </form>

            {/* Recent Field Updates Feed */}
            <div className="border-t border-[#12365C] pt-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Histori SitRep Terkirim ({fieldUpdates.length}):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fieldUpdates.map((fup) => (
                  <div key={fup.update_id} className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-cyan-400 font-mono">{fup.update_id}</span>
                      <span>{new Date(fup.timestamp).toLocaleTimeString('id-ID')}</span>
                    </div>
                    <p className="text-slate-200">{fup.situation_description}</p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Sektor: {fup.reported_location}</span>
                      <span className="text-emerald-400">{fup.verification_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Quick Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white">
                  Pancaran Eskalasi Darurat Lapangan
                </h3>
              </div>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Kategori Kendala Darurat:</label>
                <select
                  value={escalationCategory}
                  onChange={(e: any) => setEscalationCategory(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-red-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
                >
                  <option value="RESOURCE_SHORTAGE">Kekurangan Sumber Daya / Perahu / Medis</option>
                  <option value="ACCESS_BLOCKED">Akses Jalan Terputus Total / Terisolir</option>
                  <option value="MEDICAL_EMERGENCY">Darurat Medis Kritis / Pasien Butuh Evakuasi Cepat</option>
                  <option value="WEATHER_HAZARD">Bahaya Cuaca Ekstrem / Banjir Susulan</option>
                  <option value="COMMUNICATION_OUTAGE">Hilang Sinyal / Komunikasi Radio Putus</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tingkat Urgensi:</label>
                <select
                  value={escalationPriority}
                  onChange={(e: any) => setEscalationPriority(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
                >
                  <option value="Kritis">Kritis (Mengancam Nyawa Segera)</option>
                  <option value="Tinggi">Tinggi (Menghambat Eksekusi Misi)</option>
                  <option value="Sedang">Sedang (Perlu Perhatian Posko)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Deskripsi Situasi &amp; Kebutuhan Mendesak:</label>
                <textarea
                  rows={3}
                  value={escalationDesc}
                  onChange={(e) => setEscalationDesc(e.target.value)}
                  placeholder="Jelaskan kendala apa yang terjadi dan bantuan apa yang diminta dari Pusdalops..."
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-red-400 text-white text-xs p-3 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#12365C] pt-3">
              <button
                type="button"
                onClick={() => setShowEscalationModal(false)}
                className="bg-[#071426] text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendEscalation}
                className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-500/25"
              >
                Pancarkan ke Posko Pusat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
