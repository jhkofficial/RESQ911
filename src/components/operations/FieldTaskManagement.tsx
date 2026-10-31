import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  Users,
  Compass,
  ArrowRight,
  Layers,
  ChevronRight,
  Kanban
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { MissionTask, TaskStatus } from '../../types/operations';

export const FieldTaskManagement: React.FC = () => {
  const {
    tasks,
    missions,
    teams,
    createTask,
    updateTaskStatus,
    currentUser
  } = useDisaster();

  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<MissionTask | null>(null);

  // New Task Modal state
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskTeamId, setTaskTeamId] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah'>('Tinggi');
  const [targetMissionId, setTargetMissionId] = useState<string>(missions[0]?.mission_id || '');

  const filteredTasks = tasks.filter((t) => {
    if (selectedMissionId !== 'all' && t.mission_id !== selectedMissionId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.task_title.toLowerCase().includes(q) ||
        t.task_id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.assigned_team_name && t.assigned_team_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'Assigned', label: 'Ditugaskan (Assigned)', color: 'border-blue-500/40 text-blue-300' },
    { status: 'In Progress', label: 'Dikerjakan (In Progress)', color: 'border-cyan-500/40 text-cyan-300' },
    { status: 'Blocked', label: 'Tertahan (Blocked)', color: 'border-red-500/40 text-red-300' },
    { status: 'Completed', label: 'Selesai (Completed)', color: 'border-emerald-500/40 text-emerald-300' }
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !targetMissionId) return;

    const assignedTeam = teams.find((t) => t.team_id === taskTeamId);
    createTask({
      mission_id: targetMissionId,
      task_title: taskTitle,
      description: taskDesc,
      location_label: taskLocation || 'Sektor Utama',
      assigned_team_id: taskTeamId || undefined,
      assigned_team_name: assignedTeam?.team_name || 'Satgas Operasi',
      priority: taskPriority
    });

    setNewTaskModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskLocation('');
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>MANAJEMEN TUGAS LAPANGAN (SIMULASI):</strong> Pelacakan granular setiap aksi taktis tim satgas dengan visualisasi Kanban dan linimasa progres terpadu.
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
              Manajemen Tugas Lapangan (Field Task Management)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {tasks.length} TUGAS AKTIF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau rincian tugas per regu, hambatan di garis depan, dan pencapaian target penyelamatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <div className="bg-[#0a1c33] border border-[#12365C] p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                activeView === 'list'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Daftar Tabel</span>
            </button>
          </div>

          <button
            onClick={() => setNewTaskModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Mission Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas, regu, atau rincian..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Filter Misi:</span>
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none w-full sm:w-72"
          >
            <option value="all">Semua Misi Operasional</option>
            {missions.map((m) => (
              <option key={m.mission_id} value={m.mission_id}>
                {m.mission_id} — {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {activeView === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.task_status === col.status);
            return (
              <div
                key={col.status}
                className="bg-[#0a1c33]/90 border border-[#12365C] rounded-2xl p-3.5 space-y-3 min-h-[500px] flex flex-col shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#12365C] pb-2.5">
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#071426] border border-[#12365C] text-white text-[10px] font-bold flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs italic">
                      Tidak ada tugas di kolom ini.
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.task_id}
                        onClick={() => setSelectedTask(task)}
                        className="bg-[#071426] border border-[#12365C] hover:border-cyan-500/50 p-3 rounded-xl space-y-2 cursor-pointer transition-all shadow hover:shadow-cyan-500/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-400 font-bold text-[10px]">
                            {task.task_id}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                            task.priority === 'Kritis' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white leading-tight">
                          {task.task_title}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {task.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-500">Progres:</span>
                            <span className="font-bold text-white font-mono">{task.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-[#0a1c33] h-1.5 rounded-full overflow-hidden border border-[#12365C]">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                task.task_status === 'Completed' ? 'bg-emerald-400' : task.task_status === 'Blocked' ? 'bg-red-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${task.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-1 border-t border-[#12365C]/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[130px] font-medium text-slate-300">
                            {task.assigned_team_name}
                          </span>
                          <span>{task.location_label}</span>
                        </div>

                        {task.blockers && task.blockers.length > 0 && (
                          <div className="text-[10px] text-red-300 bg-red-950/40 p-1.5 rounded border border-red-500/30 truncate">
                            ⚠️ {task.blockers[0]}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#071426]/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#12365C]">
              <tr>
                <th className="py-3 px-4">ID &amp; Judul Tugas</th>
                <th className="py-3 px-4">Misi Terkait</th>
                <th className="py-3 px-4">Regu Pelaksana</th>
                <th className="py-3 px-4">Lokasi Sektor</th>
                <th className="py-3 px-4">Prioritas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Kemajuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60">
              {filteredTasks.map((t) => (
                <tr
                  key={t.task_id}
                  onClick={() => setSelectedTask(t)}
                  className="hover:bg-[#071426]/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono text-cyan-400 font-bold text-[10px]">{t.task_id}</div>
                    <div className="font-semibold text-white truncate max-w-xs">{t.task_title}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{t.mission_id}</td>
                  <td className="py-3 px-4 text-white">{t.assigned_team_name}</td>
                  <td className="py-3 px-4 text-slate-400">{t.location_label}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {t.task_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 font-bold">
                    {t.progress_percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {selectedTask.task_id} • {selectedTask.mission_id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedTask.task_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="p-3 bg-[#071426] rounded-xl border border-[#12365C]">
                {selectedTask.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tim Ditugaskan:</span>
                  <span className="text-white font-semibold">{selectedTask.assigned_team_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Sektor Lokasi:</span>
                  <span className="text-white font-semibold">{selectedTask.location_label}</span>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-[#12365C]">
                <label className="text-[11px] font-bold text-slate-300 uppercase">
                  Ubah Status Tugas Cepat:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTask.task_id, 'In Progress', selectedTask.progress_percentage);
                      setSelectedTask(null);
                    }}
                    className="bg-[#071426] hover:bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-bold py-2 rounded-xl text-xs"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTask.task_id, 'Blocked', selectedTask.progress_percentage);
                      setSelectedTask(null);
                    }}
                    className="bg-[#071426] hover:bg-red-950/70 border border-red-500/40 text-red-300 font-bold py-2 rounded-xl text-xs"
                  >
                    Blocked
                  </button>
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTask.task_id, 'Completed', 100);
                      setSelectedTask(null);
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold py-2 rounded-xl text-xs"
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Tambah Tugas Lapangan Baru
              </h3>
              <button
                onClick={() => setNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tautkan ke Misi:</label>
                <select
                  value={targetMissionId}
                  onChange={(e) => setTargetMissionId(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
                >
                  {missions.map((m) => (
                    <option key={m.mission_id} value={m.mission_id}>
                      {m.mission_id} — {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Judul Tugas Taktis:</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Contoh: Evakuasi 30 Balita di Dukuh Karangtengah"
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Deskripsi Operasi:</label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Instruksi taktis dan target keselamatan..."
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs p-3 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Sektor Lokasi:</label>
                  <input
                    type="text"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value)}
                    placeholder="Contoh: RW 03 Balai Desa"
                    className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Tugaskan Tim Satgas:</label>
                  <select
                    value={taskTeamId}
                    onChange={(e) => setTaskTeamId(e.target.value)}
                    className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="">Pilih Tim Satgas...</option>
                    {teams.map((t) => (
                      <option key={t.team_id} value={t.team_id}>
                        {t.team_name} ({t.availability})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#12365C] pt-3">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="bg-[#071426] text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
