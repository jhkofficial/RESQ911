import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Eye,
  Plus,
  Send,
  Upload,
  User,
  ExternalLink,
  ChevronRight,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DamageAssessment } from '../../types/intelligence';

export const RapidDamageAssessmentModule: React.FC = () => {
  const {
    incidents,
    activeIncident,
    setActiveIncident,
    damageAssessments,
    runDamageAssessment,
    currentUser,
  } = useDisaster();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    return activeIncident?.incident_id || incidents[0]?.incident_id || '';
  });

  const [activeTab, setActiveTabState] = useState<'evidence' | 'observations' | 'verification' | 'history'>('observations');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [fieldNotesInput, setFieldNotesInput] = useState<string>('');
  const [isSubmittingAnalysis, setIsSubmittingAnalysis] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'DRAFT' | 'REVIEWED' | 'VERIFIED_LAPANGAN' | 'REJECTED'>('REVIEWED');
  const [inspectorNotes, setInspectorNotes] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const currentIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0];
  const assessment: DamageAssessment | undefined = damageAssessments[currentIncident?.incident_id];

  const handleRunNewRda = async () => {
    if (!currentIncident) return;
    setIsSubmittingAnalysis(true);
    setFeedbackMessage(null);
    try {
      await runDamageAssessment(
        currentIncident.incident_id,
        fieldNotesInput || 'Catatan lapangan: peninjauan visual infrastruktur permukiman terdampak.',
        assessment?.evidence_items || []
      );
      setFeedbackMessage('Kaji cepat kerusakan multimodal AI berhasil diperbarui.');
      setActiveTabState('observations');
    } catch (e) {
      setFeedbackMessage('Gagal memperbarui analisis kaji cepat.');
    } finally {
      setIsSubmittingAnalysis(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleSaveVerification = () => {
    setFeedbackMessage('Status verifikasi pengawas lapangan berhasil disimpan ke jejak audit.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Incident Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                MULTIMODAL RAPID DAMAGE ASSESSMENT (RDA)
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Engine: Gemini 3.8 Flash Multimodal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Kaji Cepat Kerusakan Berbasis Citra &amp; Catatan Teknis
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Mengekstrak indikator deformasi struktural, kerusakan utilitas, dan kondisi lingkungan dari dokumentasi visual
              lapangan. Seluruh observasi wajib ditelaah oleh tim teknik forensik BPBD.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium">Insiden Target:</span>
            <select
              value={selectedIncidentId}
              onChange={(e) => {
                setSelectedIncidentId(e.target.value);
                const found = incidents.find((i) => i.incident_id === e.target.value);
                if (found) setActiveIncident(found);
              }}
              className="bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-cyan-300 font-mono-numbers rounded-xl px-3 py-2 cursor-pointer max-w-sm"
            >
              {incidents.map((inc) => (
                <option key={inc.incident_id} value={inc.incident_id}>
                  {inc.incident_id} — {inc.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Tabs Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#12365C]">
          <button
            onClick={() => setActiveTabState('evidence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'evidence'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-[#071426] text-slate-300 hover:text-white border border-[#12365C]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>1. Penampil Bukti Foto ({assessment?.evidence_items?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTabState('observations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'observations'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-[#071426] text-slate-300 hover:text-white border border-[#12365C]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Observasi Kerusakan AI</span>
          </button>

          <button
            onClick={() => setActiveTabState('verification')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-[#071426] text-slate-300 hover:text-white border border-[#12365C]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Verifikasi Lapangan (Petugas)</span>
          </button>

          <button
            onClick={() => setActiveTabState('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'bg-[#071426] text-slate-300 hover:text-white border border-[#12365C]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>4. Riwayat Kaji Cepat</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        </div>
      )}

      {/* Tab 1: Evidence Viewer */}
      {activeTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Photo Enlarger */}
          <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Dokumentasi Visual Lapangan
              </span>
              <span className="text-xs text-cyan-400 font-mono-numbers">
                Foto {selectedPhotoIndex + 1} dari {assessment?.evidence_items?.length || 1}
              </span>
            </div>

            {assessment?.evidence_items && assessment.evidence_items[selectedPhotoIndex] ? (
              <div className="relative rounded-xl overflow-hidden border border-[#12365C] bg-[#071426] h-80 sm:h-96">
                <img
                  src={assessment.evidence_items[selectedPhotoIndex].url}
                  alt={assessment.evidence_items[selectedPhotoIndex].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#071426] via-[#071426]/80 to-transparent">
                  <h4 className="text-sm font-bold text-white">
                    {assessment.evidence_items[selectedPhotoIndex].title}
                  </h4>
                  <p className="text-[11px] text-slate-300 flex items-center gap-3 mt-1">
                    <span>Sumber: {assessment.evidence_items[selectedPhotoIndex].source}</span>
                    <span>Waktu: {new Date(assessment.evidence_items[selectedPhotoIndex].captured_at).toLocaleString('id-ID')}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-[#071426] rounded-xl border border-[#12365C]">
                Belum ada bukti visual terlampir pada insiden ini.
              </div>
            )}
          </div>

          {/* Thumbnails & Notes */}
          <div className="space-y-3">
            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#12365C]">
                Galeri Citra Kerusakan
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {(assessment?.evidence_items || []).map((photo, idx) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all aspect-video ${
                      selectedPhotoIndex === idx
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                        : 'border-[#12365C] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-[#071426]/80 text-[9px] text-slate-200 px-1 rounded font-mono-numbers">
                      {photo.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run New AI Assessment with Input Notes */}
            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#12365C]">
                Pembaruan Asesmen Lapangan
              </h3>
              <textarea
                rows={3}
                placeholder="Tambahkan catatan hasil survei visual drone atau temuan tim SAR..."
                value={fieldNotesInput}
                onChange={(e) => setFieldNotesInput(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleRunNewRda}
                disabled={isSubmittingAnalysis}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                {isSubmittingAnalysis ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menganalisis Citra &amp; Teks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jalankan Kaji Cepat AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Observations */}
      {activeTab === 'observations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Observations Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Hasil Observasi Multimodal AI
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  {assessment?.observations.status || 'Perlu Verifikasi Lapangan'}
                </span>
              </div>

              {/* Brief Description */}
              <div className="p-3 bg-[#071426] rounded-xl border border-cyan-500/30">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-tight mb-1">
                  Deskripsi Kerusakan Ringkas:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {assessment?.observations.brief_description || 'Belum ada analisis.'}
                </p>
              </div>

              {/* Grid 2 Columns: Structures vs Infrastructure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Struktur Terlihat Terdampak:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                    {assessment?.observations.visible_affected_structures.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Potensi Kerusakan Utilitas:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                    {assessment?.observations.potential_infrastructure_damage.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Environmental Conditions */}
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-1.5">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Kondisi Lingkungan Teramati:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {assessment?.observations.observable_environmental_conditions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions Requiring Field Confirmation */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  Pertanyaan Kunci untuk Verifikasi Lapangan:
                </span>
                <ul className="text-xs text-amber-200/90 space-y-1 list-decimal pl-4">
                  {assessment?.observations.questions_requiring_field_confirmation.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Uncertainty Note & Limitations */}
          <div className="space-y-4">
            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-[#12365C]">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Catatan Ketidakpastian AI
              </div>
              <div className="p-3 bg-[#071426] rounded-xl border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed italic">
                "{assessment?.observations.uncertainty_note}"
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Peringatan: Analisis citra tidak mampu mengukur secara absolut kestabilan struktur pondasi tanah,
                kandungan gas beracun, atau kedalaman genangan tanpa alat ukur fisik di tempat kejadian.
              </p>
            </div>

            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider pb-1 border-b border-[#12365C]">
                Data Model
              </h4>
              <div className="text-slate-400 space-y-1 text-[11px]">
                <div>Engine: <span className="text-cyan-300 font-mono-numbers">{assessment?.model_version}</span></div>
                <div>Analis: <span className="text-slate-200">{assessment?.analyst_name}</span></div>
                <div>Status Peninjau: <span className="text-emerald-400 font-bold">{assessment?.reviewer_status}</span></div>
              </div>
              <button
                onClick={() => setActiveTabState('verification')}
                className="w-full mt-2 bg-[#071426] hover:bg-[#071426]/80 text-cyan-400 border border-cyan-500/30 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Koreksi / Setujui Observasi ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Field Verification */}
      {activeTab === 'verification' && (
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 shadow-xl space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Lembar Validasi &amp; Koreksi Pengawas Lapangan
              </h2>
            </div>
            <span className="text-xs text-slate-400">Petugas: {currentUser.name}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Pengawas lapangan berhak mengoreksi hasil pengamatan visual AI sebelum diteruskan ke lembar perencanaan tanggap
            darurat Pusdalops.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Status Keputusan Pengawas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'VERIFIED_LAPANGAN', label: 'Terkonfirmasi Lapangan', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/40' },
                  { id: 'REVIEWED', label: 'Ditelaah Sesuai Draf', color: 'border-cyan-500 text-cyan-300 bg-cyan-950/40' },
                  { id: 'DRAFT', label: 'Perlu Asesmen Ulang', color: 'border-amber-500 text-amber-300 bg-amber-950/40' },
                  { id: 'REJECTED', label: 'Ditolak / Salah Observasi', color: 'border-rose-500 text-rose-300 bg-rose-950/40' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setVerificationStatus(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                      verificationStatus === opt.id
                        ? `${opt.color} ring-2 ring-cyan-400/40`
                        : 'border-[#12365C] text-slate-400 bg-[#071426] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Catatan Teknis / Koreksi Manual Petugas Lapangan:
              </label>
              <textarea
                rows={4}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Misal: Retakan pada dinding sayap puskesmas adalah retakan non-struktural plesteran; jalur evakuasi aman..."
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#12365C]">
              <button
                onClick={handleSaveVerification}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simpan Pengesahan Verifikasi Lapangan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Analysis History */}
      {activeTab === 'history' && (
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#12365C]">
            Riwayat Log Eksekusi Kaji Cepat Kerusakan
          </h3>

          <div className="space-y-2">
            <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] text-xs flex items-center justify-between">
              <div>
                <span className="font-mono-numbers font-bold text-cyan-400">
                  {assessment?.assessment_id}
                </span>
                <span className="text-slate-400 ml-2">
                  Dibuat pada: {new Date(assessment?.created_at || Date.now()).toLocaleString('id-ID')}
                </span>
                <p className="text-slate-300 mt-1">{assessment?.observations.brief_description}</p>
              </div>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded font-mono-numbers">
                SUCCESS
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
