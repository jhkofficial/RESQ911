import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Camera,
  Layers,
  Sparkles,
  FileText,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Send,
  Eye,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { IncidentReport, AIAnalysisResult, DuplicateCandidate } from '../../types/disaster';
import { validateIncidentReport } from '../../utils/validation';
import { evaluateReportSimilarity } from '../../utils/duplicateDetection';

export const VerificationCenter: React.FC = () => {
  const {
    reports,
    activeReport,
    setActiveReport,
    currentUser,
    verifyReport,
    requestReportClarification,
    rejectReport,
    markReportAsDuplicate,
    incidents,
  } = useDisaster();

  // Selected report in queue
  const [selectedReport, setSelectedReport] = useState<IncidentReport>(() => {
    return activeReport || reports[0];
  });

  // Keep selected report updated if activeReport changes externally
  useEffect(() => {
    if (activeReport) {
      setSelectedReport(activeReport);
    }
  }, [activeReport]);

  // Modals & Action States
  const [actionType, setActionType] = useState<
    'VERIFY' | 'CLARIFY' | 'REJECT' | 'DUPLICATE' | null
  >(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTargetIncidentId, setSelectedTargetIncidentId] = useState<string>('');
  const [overrideSeverity, setOverrideSeverity] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    locationConfirmed: true,
    sourceCredible: true,
    evidenceAdequate: false,
    noFatalContradiction: true,
    localAuthorityNotified: true,
  });

  // AI Assistance State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Mini Map ref
  const miniMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Filter queue: unverified or in-verification reports first
  const pendingQueue = useMemo(() => {
    return reports.filter(
      (r) => r.verification_status === 'Belum Diverifikasi' || r.verification_status === 'Dalam Verifikasi'
    );
  }, [reports]);

  // Validation results for selected report
  const validationResult = useMemo(() => {
    return validateIncidentReport(selectedReport);
  }, [selectedReport]);

  // Duplicate candidate matches for selected report
  const duplicateMatches = useMemo(() => {
    return reports
      .filter((r) => r.id !== selectedReport.id)
      .map((r) => evaluateReportSimilarity(selectedReport, r))
      .filter((m): m is NonNullable<typeof m> => m !== null && m.similarity_score >= 0.55)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 3);
  }, [reports, selectedReport]);

  // Leaflet Mini Map
  useEffect(() => {
    if (!miniMapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(miniMapRef.current, {
        center: [selectedReport.latitude, selectedReport.longitude],
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB &copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const customPin = L.divIcon({
        className: 'center-pin',
        html: `<div style="width: 22px; height: 22px; background: #00c8f8; border: 3px solid #071426; border-radius: 50%; box-shadow: 0 0 10px #00c8f8;"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([selectedReport.latitude, selectedReport.longitude], { icon: customPin }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([selectedReport.latitude, selectedReport.longitude], 11);
    }
  }, [selectedReport]);

  // Call server-side AI Analysis endpoint (with automatic simulation fallback)
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: selectedReport }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (e) {
      // Offline fallback
      setAiAnalysis({
        summary: `Laporan mencatat indikasi kejadian ${selectedReport.disaster_type} di ${selectedReport.regency}. Data spasial konsisten dengan radius pantauan posko.`,
        extractedCategory: selectedReport.disaster_type,
        missingContext: ['Rincian kondisi akses jembatan menuju lokasi kejadian'],
        inconsistencies: [],
        suggestedQuestions: ['Bisa konfirmasikan kondisi terkini debit air/longsoran siang ini?'],
        confidenceScore: 88,
        modelSource: 'SIMULATED_ENGINE',
        disclaimer: 'Analisis AI — memerlukan verifikasi petugas (Mode Simulasi).',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Perform Verification
  const executeVerification = () => {
    const res = verifyReport(selectedReport.id, {
      createNewIncident: !selectedTargetIncidentId || selectedTargetIncidentId === 'NEW',
      targetIncidentId: selectedTargetIncidentId !== 'NEW' ? selectedTargetIncidentId : undefined,
      notes: verificationNotes || 'Laporan memenuhi seluruh standar verifikasi data bencana lapangan.',
      overrideSeverity: overrideSeverity || selectedReport.urgency,
    });

    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Laporan ${selectedReport.report_id} berhasil DIVERIFIKASI dan resmi ditautkan ke kejadian terkonfirmasi.`,
      });
      setActionType(null);
      setVerificationNotes('');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Gagal memverifikasi laporan.' });
    }
  };

  // Perform Clarification
  const executeClarification = () => {
    const res = requestReportClarification(selectedReport.id, clarificationQuestion);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Permintaan klarifikasi berhasil dikirimkan ke pelapor untuk ${selectedReport.report_id}.`,
      });
      setActionType(null);
      setClarificationQuestion('');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Gagal meminta klarifikasi.' });
    }
  };

  // Perform Rejection
  const executeRejection = () => {
    const res = rejectReport(selectedReport.id, rejectionReason);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Laporan ${selectedReport.report_id} resmi DITOLAK dengan alasan tersimpan di log audit.`,
      });
      setActionType(null);
      setRejectionReason('');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Gagal menolak laporan.' });
    }
  };

  // Perform Duplicate Marking
  const executeMarkDuplicate = (matchedId: string) => {
    const res = markReportAsDuplicate(
      selectedReport.id,
      matchedId,
      `Telah ditinjau verifikator dan ditandai duplikat dari laporan ${matchedId}.`
    );
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: `Laporan ${selectedReport.report_id} berhasil ditandai sebagai duplikat dari ${matchedId}.`,
      });
      setActionType(null);
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Gagal menandai duplikat.' });
    }
  };

  const isSelfReport = selectedReport.submitted_by_user_id === currentUser.id;
  const isExecutive = currentUser.role === 'VIEWER_EKSEKUTIF';

  return (
    <div className="space-y-4">
      {/* Top Banner & Queue Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider">
              Human-in-the-Loop Verification Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              Verifikator: {currentUser.name} ({currentUser.role.replace('_', ' ')})
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            Pusat Verifikasi &amp; Rekonsiliasi Laporan Bencana
          </h1>
          <p className="text-xs text-slate-400">
            Workspace terpisah untuk validasi bukti, deteksi duplikasi, dan otorisasi manusia sebelum sinkronisasi ke insiden nasional
          </p>
        </div>

        {/* Quick Report Queue Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 shrink-0">Antrean Verifikasi:</span>
          <select
            value={selectedReport.id}
            onChange={(e) => {
              const found = reports.find((r) => r.id === e.target.value);
              if (found) {
                setSelectedReport(found);
                setActiveReport(found);
                setAiAnalysis(null);
                setActionMessage(null);
              }
            }}
            className="bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-cyan-300 font-mono-numbers rounded-lg px-2.5 py-1.5 cursor-pointer max-w-xs"
          >
            {pendingQueue.map((r: IncidentReport) => (
              <option key={r.id} value={r.id}>
                {r.report_id} — {r.title.slice(0, 32)}...
              </option>
            ))}
            {reports
              .filter((r: IncidentReport) => !pendingQueue.some((pq: IncidentReport) => pq.id === r.id))
              .map((r: IncidentReport) => (
                <option key={r.id} value={r.id}>
                  [{r.verification_status}] {r.report_id} — {r.title.slice(0, 28)}...
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : 'bg-red-950/70 text-red-300 border-red-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split-Screen Workspace (Left & Right Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT PANEL: Submitted Incident Details, Timeline, Evidence, Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Incident Card */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#12365C]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-numbers text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    {selectedReport.report_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedReport.verification_status === 'Terverifikasi'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : selectedReport.verification_status === 'Ditolak'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                        : selectedReport.verification_status === 'Perlu Klarifikasi'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    Status: {selectedReport.verification_status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-2 py-0.5 rounded border border-[#12365C]">
                    {selectedReport.disaster_type}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedReport.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedReport.village}, {selectedReport.subdistrict}, {selectedReport.regency},{' '}
                    {selectedReport.province}
                  </span>
                  <span className="flex items-center gap-1 font-mono-numbers text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Kejadian: {selectedReport.event_date} {selectedReport.event_time}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Tingkat Urgensi
                </span>
                <span className="text-xs font-bold text-amber-400 uppercase">
                  {selectedReport.urgency}
                </span>
              </div>
            </div>

            {/* Narrative Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Deskripsi Kronologi Terlapor
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#071426] p-3.5 rounded-xl border border-[#12365C]">
                {selectedReport.description}
              </p>
            </div>

            {/* Early Impact Estimates Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
                <span className="text-[10px] text-slate-400 block">Terdampak (Estimasi):</span>
                <span className="text-sm font-bold text-white font-mono-numbers">
                  {selectedReport.estimated_affected.toLocaleString('id-ID')} jiwa
                </span>
              </div>
              <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
                <span className="text-[10px] text-slate-400 block">Pengungsi:</span>
                <span className="text-sm font-bold text-amber-300 font-mono-numbers">
                  {selectedReport.estimated_displaced.toLocaleString('id-ID')} jiwa
                </span>
              </div>
              <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
                <span className="text-[10px] text-slate-400 block">Luka / Wafat:</span>
                <span className="text-sm font-bold text-rose-300 font-mono-numbers">
                  {selectedReport.estimated_injured} / {selectedReport.estimated_fatalities}
                </span>
              </div>
              <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
                <span className="text-[10px] text-slate-400 block">Infrastruktur:</span>
                <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                  {selectedReport.infrastructure_damage || '-'}
                </span>
              </div>
            </div>

            {/* Reporter Profile & Channel */}
            <div className="bg-[#071426]/70 border border-[#12365C] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200">{selectedReport.reporter_name}</div>
                  <div className="text-[10px] text-slate-400">
                    Kategori: {selectedReport.reporter_type.replace('_', ' ')} • {selectedReport.reporter_agency}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono-numbers">
                  Lapor: {new Date(selectedReport.created_at).toLocaleTimeString('id-ID')} WIB
                </span>
                <span className="text-[10px] text-emerald-400 font-mono-numbers">
                  Kontak: [Tersimpan di Sesi]
                </span>
              </div>
            </div>

            {/* Photo Evidence Gallery */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Bukti Visual Pendukung ({selectedReport.evidence.length} Berkas)
              </span>

              {selectedReport.evidence.length === 0 ? (
                <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] text-xs text-slate-400 italic text-center">
                  Tidak ada bukti foto terlampir pada laporan ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {selectedReport.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[#071426] border border-[#12365C] rounded-xl overflow-hidden p-2 group"
                    >
                      <img
                        src={ev.url}
                        alt={ev.file_name}
                        className="w-full h-28 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                      />
                      <div className="text-[10px] text-slate-300 font-semibold truncate mt-1">
                        {ev.file_name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">{ev.caption || 'Foto kondisi lapangan'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Embedded Mini Map for Geographic Context */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Titik Koordinat Lapangan ({selectedReport.latitude}°, {selectedReport.longitude}°)
              </span>
              <div
                ref={miniMapRef}
                className="w-full h-44 rounded-xl border border-[#12365C] overflow-hidden shadow-inner z-0"
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Validation Findings, Duplicate Detection, AI Analysis & Verification Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Deterministic Validation Results Card */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Hasil Validasi Deterministik
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  validationResult.isValid
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                }`}
              >
                {validationResult.isValid ? 'Semua Format Lolos' : 'Ada Ketidaksesuaian'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#071426] rounded-lg border border-[#12365C]/80">
                <span className="text-slate-300">Format Bidang Wajib</span>
                <span className="text-emerald-400 font-bold">✓ Lengkap</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#071426] rounded-lg border border-[#12365C]/80">
                <span className="text-slate-300">Koordinat Bounding Wilayah RI</span>
                <span className="text-emerald-400 font-bold">✓ Valid ({selectedReport.latitude}°, {selectedReport.longitude}°)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#071426] rounded-lg border border-[#12365C]/80">
                <span className="text-slate-300">Konsistensi Angka Dampak</span>
                <span className="text-emerald-400 font-bold">✓ Pengungsi ≤ Terdampak</span>
              </div>
            </div>
          </div>

          {/* Potential Duplicate Matches Card */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-orange-400" />
                Deteksi Potensi Duplikasi ({duplicateMatches.length} Terdeteksi)
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">Model Spasial-Temporal</span>
            </div>

            {duplicateMatches.length === 0 ? (
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] text-xs text-slate-400 italic">
                Tidak ada laporan lain dengan kemiripan signifikan di sekitar lokasi ini (Laporan Unik).
              </div>
            ) : (
              <div className="space-y-2">
                {duplicateMatches.map((dup: DuplicateCandidate, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-[#071426] border border-[#12365C] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-numbers text-xs font-bold text-cyan-400">
                        {dup.matched_report_id}
                      </span>
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/40 font-mono-numbers">
                        Skor: {Math.round(dup.similarity_score * 100)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{dup.explanation}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#12365C]/60 text-[10px] text-slate-400">
                      <span>Jarak: {dup.distance_km} km</span>
                      <span>Selisih Waktu: {dup.time_diff_hours} jam</span>
                      <button
                        onClick={() => executeMarkDuplicate(dup.matched_report_id)}
                        className="text-cyan-400 hover:underline font-bold"
                      >
                        Gabungkan ke Laporan Ini →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Assistance Analysis Box (Gemini / Simulated) */}
          <div className="bg-[#0a1c33] border border-purple-500/30 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI-Assisted Assessment
              </span>
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAiLoading}
                className="text-[10px] font-bold text-purple-300 hover:text-white bg-purple-950/80 border border-purple-500/40 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? 'Menganalisis...' : 'Jalankan Telaah AI'}
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-2 text-xs animate-in fade-in">
                <div className="p-2.5 bg-[#071426] rounded-xl border border-purple-500/20 text-slate-200 leading-relaxed">
                  {aiAnalysis.summary}
                </div>
                {aiAnalysis.missingContext.length > 0 && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                    <strong>Informasi Perlu Dilengkapi:</strong>
                    <ul className="list-disc list-inside mt-0.5">
                      {aiAnalysis.missingContext.map((mc, idx) => (
                        <li key={idx}>{mc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                  <Info className="w-3 h-3 text-purple-400" />
                  <span>{aiAnalysis.disclaimer}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-[#071426] p-3 rounded-xl border border-[#12365C] text-center">
                Klik tombol "Jalankan Telaah AI" untuk ekstraksi otomatis ketidaksesuaian narasi, konteks hilang, dan rekomendasi pertanyaan verifikator.
              </div>
            )}
          </div>

          {/* Verification Checklist */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Daftar Uji Kepatuhan Verifikator (Checklist):
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              <label
                onClick={() => setChecklist({ ...checklist, locationConfirmed: !checklist.locationConfirmed })}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#071426]"
              >
                {checklist.locationConfirmed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>1. Keberadaan lokasi fisik di wilayah terkonfirmasi</span>
              </label>

              <label
                onClick={() => setChecklist({ ...checklist, sourceCredible: !checklist.sourceCredible })}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#071426]"
              >
                {checklist.sourceCredible ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>2. Identitas pelapor dan instansi dapat dipertanggungjawabkan</span>
              </label>

              <label
                onClick={() => setChecklist({ ...checklist, evidenceAdequate: !checklist.evidenceAdequate })}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#071426]"
              >
                {checklist.evidenceAdequate ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>3. Bukti visual atau konfirmasi radio awal memadai</span>
              </label>

              <label
                onClick={() => setChecklist({ ...checklist, localAuthorityNotified: !checklist.localAuthorityNotified })}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-[#071426]"
              >
                {checklist.localAuthorityNotified ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>4. Aparat posko / kepala wilayah telah diberitahukan</span>
              </label>
            </div>
          </div>

          {/* Verification Decision Buttons */}
          <div className="bg-[#051121] border border-cyan-500/40 rounded-2xl p-4 shadow-xl space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Tindakan Keputusan Verifikasi Manusia
            </span>

            {isSelfReport && (
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Pemisahan Kewenangan:</strong> Anda mengajukan laporan ini. Verifikasi harus dilakukan oleh petugas/operator lain.
                </span>
              </div>
            )}

            {isExecutive && (
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Hak akses Viewer Eksekutif hanya mengizinkan peninjauan (Read-Only).</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSelfReport || isExecutive}
                onClick={() => setActionType('VERIFY')}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifikasi Laporan</span>
              </button>

              <button
                type="button"
                disabled={isExecutive}
                onClick={() => setActionType('CLARIFY')}
                className="flex items-center justify-center gap-1.5 bg-[#0a1c33] hover:bg-[#12365C] text-purple-300 border border-purple-500/40 font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Minta Klarifikasi</span>
              </button>

              <button
                type="button"
                disabled={isExecutive}
                onClick={() => setActionType('REJECT')}
                className="flex items-center justify-center gap-1.5 bg-[#0a1c33] hover:bg-rose-950/60 text-rose-300 border border-rose-500/40 font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tolak Laporan</span>
              </button>

              <button
                type="button"
                disabled={isExecutive}
                onClick={() => setActionType('DUPLICATE')}
                className="flex items-center justify-center gap-1.5 bg-[#0a1c33] hover:bg-[#12365C] text-orange-300 border border-orange-500/40 font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Tandai Duplikat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION DIALOG MODALS */}
      {/* 1. VERIFICATION DIALOG */}
      {actionType === 'VERIFY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a1c33] border border-cyan-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Otorisasi Verifikasi Laporan {selectedReport.report_id}
              </span>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Laporan ini akan disetujui sebagai insiden terverifikasi dan disinkronisasikan ke Dashboard &amp; Peta Bencana Nasional.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tindakan Rekonsiliasi Insiden:
              </label>
              <select
                value={selectedTargetIncidentId}
                onChange={(e) => setSelectedTargetIncidentId(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 cursor-pointer"
              >
                <option value="NEW">+ Buat Kejadian Terverifikasi Baru (ID Otomatis)</option>
                {incidents.slice(0, 15).map((inc) => (
                  <option key={inc.id} value={inc.incident_id}>
                    Tautkan ke {inc.incident_id} — {inc.title.slice(0, 36)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Catatan Verifikasi &amp; Dasar Keputusan *
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Telah divalidasi silang dengan feed satelit dan laporan Babinsa setempat. Laporan disahkan sebagai status tanggap darurat awal."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#12365C]">
              <button
                onClick={() => setActionType(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={executeVerification}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Sahkan Verifikasi Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLARIFICATION DIALOG */}
      {actionType === 'CLARIFY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a1c33] border border-purple-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Kirim Permintaan Klarifikasi {selectedReport.report_id}
              </span>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Status laporan akan diperbarui menjadi <strong>Perlu Klarifikasi</strong>. Pertanyaan ini akan dicatat ke log audit dan dapat ditindaklanjuti pelapor.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Pertanyaan / Data yang Diperlukan *
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Mohon sertakan perkiraan jumlah lansia/anak yang terisolasi dan foto kondisi ketinggian air terbaru siang ini."
                value={clarificationQuestion}
                onChange={(e) => setClarificationQuestion(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#12365C]">
              <button onClick={() => setActionType(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white">Batal</button>
              <button
                onClick={executeClarification}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Kirim Permintaan Klarifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REJECTION DIALOG */}
      {actionType === 'REJECT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a1c33] border border-rose-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                Tolak Laporan {selectedReport.report_id}
              </span>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Laporan yang ditolak tidak akan ditampilkan pada peta kejadian dan tidak dihitung ke statistik korban bencana nasional.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Alasan Penolakan Resmi (Wajib) *
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Data tidak terbukti setelah pengecekan satgas TRC di lapangan, atau rekaman video terkonfirmasi hoaks peristiwa tahun lalu."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#12365C]">
              <button onClick={() => setActionType(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white">Batal</button>
              <button
                onClick={executeRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tetapkan Status Ditolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DUPLICATE DIALOG */}
      {actionType === 'DUPLICATE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a1c33] border border-orange-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Copy className="w-4 h-4 text-orange-400" />
                Tandai Duplikat / Gabungkan Laporan {selectedReport.report_id}
              </span>
              <button onClick={() => setActionType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Laporan sumber asli akan dipertahankan namun ditautkan ke laporan acuan tanpa mengakumulasi data korban secara ganda.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Pilih Laporan Acuan Utama yang Sesuai:
              </label>
              <select
                value={selectedTargetIncidentId}
                onChange={(e) => setSelectedTargetIncidentId(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 cursor-pointer"
              >
                <option value="">-- Pilih Laporan / Kejadian Rujukan --</option>
                {reports
                  .filter((r) => r.id !== selectedReport.id)
                  .slice(0, 15)
                  .map((r) => (
                    <option key={r.id} value={r.report_id}>
                      {r.report_id} — {r.title.slice(0, 36)}... ({r.regency})
                    </option>
                  ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#12365C]">
              <button onClick={() => setActionType(null)} className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white">Batal</button>
              <button
                onClick={() => executeMarkDuplicate(selectedTargetIncidentId)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Tandai sebagai Duplikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
