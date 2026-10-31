import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Truck,
  PlusCircle,
  FileCheck,
  MapPin,
  Calendar,
  Save,
  Send,
  Info,
  ShieldAlert
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { ResponseMission } from '../../types/operations';

export const MissionPlanningEngine: React.FC = () => {
  const {
    incidents,
    recommendations,
    createMission,
    currentUser,
    setActiveTab
  } = useDisaster();

  // Selected incident link
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('RSQ-2026-0001');
  const [selectedRecId, setSelectedRecId] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [disasterType, setDisasterType] = useState('Banjir');
  const [province, setProvince] = useState('Jawa Tengah');
  const [regency, setRegency] = useState('Demak');
  const [subdistrict, setSubdistrict] = useState('Karanganyar');
  const [locationName, setLocationName] = useState('Sektor Evakuasi Sungai Wulan');
  const [latitude, setLatitude] = useState<number>(-6.8921);
  const [longitude, setLongitude] = useState<number>(110.7421);
  const [priority, setPriority] = useState<'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah'>('Kritis');
  const [teamSize, setTeamSize] = useState<number>(35);
  const [targetVictims, setTargetVictims] = useState<number>(1500);
  const [capabilities, setCapabilities] = useState<string[]>([
    'Water Rescue',
    'Evakuasi Perahu Karet',
    'Pertolongan Pertama'
  ]);
  const [newCapInput, setNewCapInput] = useState('');
  const [actionInputs, setActionInputs] = useState<string[]>([
    'Penyisiran warga lansia dan balita di zona genangan >1.5m',
    'Pendirian pos aju kesehatan darurat dan tenda triase',
    'Pengamanan jalur konvoi logistik darurat'
  ]);
  const [newActionInput, setNewActionInput] = useState('');
  const [constraints, setConstraints] = useState<string>('Arus air deras >2 knot, jalan tergenang air 80cm.');
  const [planningNotes, setPlanningNotes] = useState('Disusun terintegrasi melalui RESQ.911 Mission Planning Engine.');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pre-fill from selected incident
  const handleIncidentChange = (incId: string) => {
    setSelectedIncidentId(incId);
    const inc = incidents.find((i) => i.incident_id === incId);
    if (inc) {
      setTitle(`Operasi Penyelamatan ${inc.disaster_type} ${inc.regency}`);
      setDisasterType(inc.disaster_type);
      setProvince(inc.province);
      setRegency(inc.regency);
      setSubdistrict(inc.subdistrict || '');
      setLocationName(`Kawasan ${inc.subdistrict || inc.regency}`);
      setLatitude(inc.latitude);
      setLongitude(inc.longitude);
      setPriority(inc.severity === 'Kritis' ? 'Kritis' : inc.severity === 'Tinggi' ? 'Tinggi' : 'Sedang');
      setObjective(`Melaksanakan evakuasi darurat, perlindungan ${inc.affected_population} jiwa terdampak, dan pendistribusian logistik posko.`);
      setTargetVictims(inc.displaced_population || inc.affected_population || 1000);
    }
  };

  // Pre-fill from approved recommendation
  const handleRecChange = (recId: string) => {
    setSelectedRecId(recId);
    const rec = recommendations.find((r) => r.recommendation_id === recId);
    if (rec) {
      setTitle(rec.title);
      setObjective(rec.summary);
      setPriority(rec.priority_score >= 80 ? 'Kritis' : 'Tinggi');
      if (rec.response_actions && rec.response_actions.length > 0) {
        setActionInputs(rec.response_actions);
      }
      handleIncidentChange(rec.incident_id);
    }
  };

  const handleAddCapability = () => {
    if (newCapInput.trim() && !capabilities.includes(newCapInput.trim())) {
      setCapabilities([...capabilities, newCapInput.trim()]);
      setNewCapInput('');
    }
  };

  const handleRemoveCapability = (cap: string) => {
    setCapabilities(capabilities.filter((c) => c !== cap));
  };

  const handleAddAction = () => {
    if (newActionInput.trim()) {
      setActionInputs([...actionInputs, newActionInput.trim()]);
      setNewActionInput('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActionInputs(actionInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = (status: 'Draft' | 'Pending Authorization') => {
    if (!title.trim() || !objective.trim()) {
      setNotification({ type: 'error', message: 'Judul dan tujuan operasi wajib diisi.' });
      return;
    }

    const res = createMission({
      incident_id: selectedIncidentId,
      recommendation_id: selectedRecId || undefined,
      title,
      objective,
      disaster_type: disasterType,
      province,
      regency,
      subdistrict,
      location_name: locationName,
      latitude,
      longitude,
      priority,
      required_capabilities: capabilities,
      required_team_size: teamSize,
      target_victims_evacuated: targetVictims,
      proposed_actions: actionInputs,
      known_constraints: [constraints],
      planning_notes: planningNotes,
      status
    });

    if (res.success) {
      setNotification({
        type: 'success',
        message: `Misi baru "${title}" berhasil disimpan dengan status "${status}". ID: ${res.mission?.mission_id}`
      });
      setTimeout(() => {
        setActiveTab(status === 'Pending Authorization' ? 'mission-authorization' : 'response-center');
      }, 1500);
    } else {
      setNotification({ type: 'error', message: res.error || 'Gagal menyimpan misi.' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULASI PERENCANAAN OPERASI:</strong> Perumusan draf respon ini terhubung dengan basis data insiden terverifikasi dan rekomendasi AI Decision Engine.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          PLANNER: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Perencanaan Misi Tanggap Darurat (Mission Planning Engine)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              ORCHESTRATOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Menghubungkan data terverifikasi dan rekomendasi kecerdasan buatan ke rancangan operasi terstruktur siap otorisasi.
          </p>
        </div>
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

      {/* Linkage Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Link to Incident */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            1. Tautkan Insiden Terverifikasi (Incident Reference):
          </label>
          <select
            value={selectedIncidentId}
            onChange={(e) => handleIncidentChange(e.target.value)}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.incident_id} value={inc.incident_id}>
                {inc.incident_id} — {inc.disaster_type} ({inc.regency}, {inc.province}) [{inc.severity}]
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Data lokasi, demografi korban, dan tingkat keparahan akan diisi secara otomatis.
          </p>
        </div>

        {/* Link to AI Recommendation */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            2. Tautkan Rekomendasi AI Terverifikasi (Opsional):
          </label>
          <select
            value={selectedRecId}
            onChange={(e) => handleRecChange(e.target.value)}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
          >
            <option value="">-- Tanpa Tautan Rekomendasi (Draf Manual) --</option>
            {recommendations.map((rec) => (
              <option key={rec.recommendation_id} value={rec.recommendation_id}>
                {rec.recommendation_id} — {rec.title} ({rec.status})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Rekomendasi dari AI Decision Engine (Engine 4 &amp; MCDA Prioritas).
          </p>
        </div>
      </div>

      {/* Main Planning Form */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#12365C] pb-2 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          Rincian Parameter Rencana Misi Lapangan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Judul Operasi Tanggap Darurat:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Operasi Penyelamatan Korban Banjir Demak Sektor Karanganyar"
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Tingkat Prioritas Komando:</label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
            >
              <option value="Kritis">Kritis (Segera — Golden Hours Evakuasi)</option>
              <option value="Tinggi">Tinggi (Respon Cepat &lt; 6 Jam)</option>
              <option value="Sedang">Sedang (Stabilisasi &amp; Shelter)</option>
              <option value="Rendah">Rendah (Pemantauan Berkala)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300">Tujuan Strategis Operasi (Operational Objective):</label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Tujuan utama yang terukur dan spesifik..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs p-3 rounded-xl outline-none"
          />
        </div>

        {/* Operational Scope */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Provinsi:</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Kabupaten/Kota:</label>
            <input
              type="text"
              value={regency}
              onChange={(e) => setRegency(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Kecamatan:</label>
            <input
              type="text"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Target Evakuasi (Jiwa):</label>
            <input
              type="number"
              value={targetVictims}
              onChange={(e) => setTargetVictims(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none font-mono"
            />
          </div>
        </div>

        {/* Capabilities Requirement */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Kebutuhan Kapabilitas Khusus (Skill &amp; Capability Tags):
          </label>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs flex items-center gap-1.5"
              >
                <span>{cap}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCapability(cap)}
                  className="text-cyan-400 hover:text-white"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newCapInput}
              onChange={(e) => setNewCapInput(e.target.value)}
              placeholder="Tambah kapabilitas (misal: USAR Reruntuhan, Selam SAR)"
              className="flex-1 bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-1.5 rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={handleAddCapability}
              className="bg-[#12365C] hover:bg-cyan-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              Tambah
            </button>
          </div>
        </div>

        {/* Proposed Action Items */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Daftar Langkah Tindakan Lapangan (Action Items):
          </label>
          <div className="space-y-1.5">
            {actionInputs.map((act, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#071426] p-2 rounded-xl border border-[#12365C]">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="text-xs text-slate-200 flex-1">{act}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAction(index)}
                  className="text-red-400 hover:text-red-300 text-xs px-1.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newActionInput}
              onChange={(e) => setNewActionInput(e.target.value)}
              placeholder="Ketik langkah operasional baru..."
              className="flex-1 bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
            <button
              type="button"
              onClick={handleAddAction}
              className="bg-[#12365C] hover:bg-cyan-600 text-white px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
            >
              Tambah Tindakan
            </button>
          </div>
        </div>

        {/* Constraints and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Kendala Lapangan &amp; Risiko:</label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Catatan Perencanaan Tambahan:</label>
            <input
              type="text"
              value={planningNotes}
              onChange={(e) => setPlanningNotes(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#12365C] pt-4">
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            className="w-full sm:w-auto bg-[#071426] hover:bg-[#12365C] border border-slate-600 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan sebagai Draf</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('Pending Authorization')}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-500/25"
          >
            <Send className="w-4 h-4" />
            <span>Ajukan untuk Otorisasi Pimpinan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
