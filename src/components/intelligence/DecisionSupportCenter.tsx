import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  User,
  Layers,
  Sparkles,
  FileText,
  MapPin,
  CheckSquare,
  Square,
  Lock,
  ChevronDown,
  RefreshCw,
  Send,
  ExternalLink,
  Flame,
  Radio,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DecisionRecommendation, DecisionReviewStatus, SituationSummaryResult } from '../../types/intelligence';

export const DecisionSupportCenter: React.FC = () => {
  const {
    incidents,
    activeIncident,
    setActiveIncident,
    recommendations,
    riskAssessments,
    priorityAssessments,
    updateRecommendationDecision,
    generateSituationSummary,
    currentUser,
  } = useDisaster();

  // Selected recommendation in focus
  const [selectedRecId, setSelectedRecId] = useState<string>(() => {
    return recommendations[0]?.recommendation_id || '';
  });

  const currentRec =
    recommendations.find((r) => r.recommendation_id === selectedRecId) || recommendations[0];
  const currentIncident =
    incidents.find((i) => i.incident_id === currentRec?.incident_id) || incidents[0];

  const currentRisk = riskAssessments[currentIncident?.incident_id];
  const currentPriority = priorityAssessments.find((p) => p.incident_id === currentIncident?.incident_id);

  // Reviewer checklist state
  const [checklist, setChecklist] = useState({
    dataVerified: currentRec?.review_checklist?.dataVerified ?? true,
    noAutonomousDispatchConfirmed: currentRec?.review_checklist?.noAutonomousDispatchConfirmed ?? true,
    fieldAccessValidated: currentRec?.review_checklist?.fieldAccessValidated ?? false,
    localBpbdConsulted: currentRec?.review_checklist?.localBpbdConsulted ?? true,
    limitationsAcknowledged: currentRec?.review_checklist?.limitationsAcknowledged ?? true,
  });

  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Situation Summary state
  const [situationSummary, setSituationSummary] = useState<SituationSummaryResult | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  // Mini-map ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Setup mini map
  useEffect(() => {
    if (!mapContainerRef.current || !currentIncident) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentIncident.latitude, currentIncident.longitude],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([currentIncident.latitude, currentIncident.longitude], 10);
    }

    const map = mapInstanceRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    L.circleMarker([currentIncident.latitude, currentIncident.longitude], {
      radius: 9,
      fillColor: '#00C8F8',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map);
  }, [currentIncident]);

  const handleGenerateSummary = async () => {
    if (!currentIncident) return;
    setIsGeneratingSummary(true);
    setActionMessage(null);
    try {
      const result = await generateSituationSummary(currentIncident.incident_id);
      setSituationSummary(result);
      setActionMessage({ type: 'success', text: 'Ringkasan situasi eksekutif berhasil disusun oleh Gemini AI.' });
    } catch (e) {
      setActionMessage({ type: 'error', text: 'Gagal membuat ringkasan situasi.' });
    } finally {
      setIsGeneratingSummary(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleAction = (status: DecisionReviewStatus) => {
    if (!currentRec) return;
    const res = updateRecommendationDecision(currentRec.recommendation_id, status, reviewerNotes, checklist);
    if (!res.success) {
      setActionMessage({ type: 'error', text: res.error || 'Aksi ditolak.' });
    } else {
      setActionMessage({
        type: 'success',
        text: `Keputusan berhasil disimpan: Status rekomendasi kini "${status}".`,
      });
      setReviewerNotes('');
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const isReadOnlyRole = currentUser.role === 'VIEWER_EKSEKUTIF';
  const isFieldOfficer = currentUser.role === 'PETUGAS_LAPANGAN';

  return (
    <div className="space-y-4">
      {/* Module Header and Target Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                HUMAN-IN-THE-LOOP DECISION SUPPORT DESK
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Role: {currentUser.name} ({currentUser.role})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Pusat Peninjauan Keputusan Respons Tanggap Darurat
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Ruang kerja operasional bagi pengambil keputusan Pusdalops untuk meninjau sintesis situasi AI, memeriksa
              keterbatasan data, dan mengesahkan rencana tanggap darurat secara bertanggung jawab.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium">Pilih Usulan Rencana:</span>
            <select
              value={selectedRecId}
              onChange={(e) => {
                setSelectedRecId(e.target.value);
                const rec = recommendations.find((r) => r.recommendation_id === e.target.value);
                if (rec) {
                  const inc = incidents.find((i) => i.incident_id === rec.incident_id);
                  if (inc) setActiveIncident(inc);
                }
              }}
              className="bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-cyan-300 font-mono-numbers rounded-xl px-3 py-2 cursor-pointer max-w-sm"
            >
              {recommendations.map((r) => (
                <option key={r.recommendation_id} value={r.recommendation_id}>
                  [{r.status}] {r.recommendation_id} — {r.incident_title.slice(0, 28)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {/* 3-Panel Operational Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PANEL KIRI (3 Cols): Identitas & Bukti Insiden */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Identitas Insiden
              </span>
              <span className="text-xs font-mono-numbers text-cyan-400 font-bold">
                {currentIncident.incident_id}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-1.5 py-0.5 rounded border border-[#12365C]">
                {currentIncident.disaster_type}
              </span>
              <h3 className="text-sm font-bold text-white mt-1.5">{currentIncident.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentIncident.regency}, {currentIncident.province}
              </p>
            </div>

            {/* Mini Map */}
            <div
              ref={mapContainerRef}
              className="w-full h-36 rounded-xl border border-[#12365C] overflow-hidden relative"
            ></div>

            {/* Key Verified Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-[10px] text-slate-400">Terdampak</div>
                <div className="font-bold text-white font-mono-numbers">
                  {currentIncident.affected_population?.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-[10px] text-slate-400">Pengungsi</div>
                <div className="font-bold text-cyan-400 font-mono-numbers">
                  {currentIncident.displaced_population?.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-[10px] text-slate-400">Korban Jiwa</div>
                <div className="font-bold text-rose-400 font-mono-numbers">
                  {currentIncident.fatalities_count || 0} jiwa
                </div>
              </div>
              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-[10px] text-slate-400">Luka-Luka</div>
                <div className="font-bold text-amber-400 font-mono-numbers">
                  {currentIncident.injured_count || 0} jiwa
                </div>
              </div>
            </div>

            {/* Score Badges */}
            <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Skor Risiko:</span>
                <span className="font-mono-numbers font-bold text-amber-400">
                  {currentRisk?.total_score || 88} / 100 ({currentRisk?.category || 'Tinggi'})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Peringkat Prioritas:</span>
                <span className="font-mono-numbers font-bold text-cyan-400">
                  #{currentPriority?.rank || 1} Nasional (Skor {currentPriority?.total_score || 91})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL TENGAH (5 Cols): Ringkasan Situasi & Pertimbangan Respons */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Situation Summary Card */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ringkasan Situasi Eksekutif (AI Briefing)
                </h3>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer disabled:opacity-50"
              >
                {isGeneratingSummary ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Menyusun...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate AI Briefing</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-[#071426] rounded-xl border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
              {situationSummary?.summary || currentRec?.summary}
            </div>

            {/* Structured Sections Accordion / Pills */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Kondisi Faktual Terkonfirmasi:
                </span>
                <ul className="text-slate-300 space-y-0.5 list-disc pl-4 text-[11px]">
                  {(situationSummary?.confirmedConditions || [
                    'Tanggul Sungai Wulan jebol selebar ~25 meter di Desa Ketanjung',
                    'Badan jalan nasional Pantura Demak-Kudus tergenang 1.5 - 2.5 meter',
                    '24.500 warga mengungsi di 42 titik posko terpadu',
                  ]).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Proposed Response Considerations */}
              <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tight flex items-center gap-1">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  Usulan Tindakan Respons Lapangan:
                </span>
                <ul className="text-slate-300 space-y-1 list-decimal pl-4 text-[11px]">
                  {currentRec?.response_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              {/* Alternative Considerations */}
              <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C] space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-amber-400" />
                  Opsi Alternatif Pertimbangan:
                </span>
                <ul className="text-slate-300 space-y-0.5 list-disc pl-4 text-[11px]">
                  {currentRec?.alternative_considerations.map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>

              {/* Data Limitations */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-tight flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Keterbatasan Data Diketahui:
                </span>
                <ul className="text-amber-200/90 space-y-0.5 list-disc pl-4 text-[10px]">
                  {currentRec?.data_limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL KANAN (4 Cols): Kendali Peninjauan & Persetujuan Manusia */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Status Alur Persetujuan
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentRec?.status === 'Approved for Planning'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : currentRec?.status === 'Under Review'
                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                    : currentRec?.status === 'Revision Required'
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                }`}
              >
                {currentRec?.status}
              </span>
            </div>

            {/* Mandatory Reviewer Checklist */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                Daftar Periksa Pengawasan Manusia:
              </span>

              <div
                onClick={() =>
                  !isReadOnlyRole &&
                  setChecklist({ ...checklist, dataVerified: !checklist.dataVerified })
                }
                className="flex items-start gap-2 p-2 bg-[#071426] rounded-lg border border-[#12365C] cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={checklist.dataVerified}
                  readOnly
                  className="mt-0.5 accent-cyan-400"
                />
                <span className="text-slate-300 text-[11px]">
                  Data dasar insiden dan laporan korban telah diverifikasi petugas
                </span>
              </div>

              <div
                onClick={() =>
                  !isReadOnlyRole &&
                  setChecklist({
                    ...checklist,
                    noAutonomousDispatchConfirmed: !checklist.noAutonomousDispatchConfirmed,
                  })
                }
                className="flex items-start gap-2 p-2 bg-[#071426] rounded-lg border border-[#12365C] cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={checklist.noAutonomousDispatchConfirmed}
                  readOnly
                  className="mt-0.5 accent-cyan-400"
                />
                <span className="text-slate-300 text-[11px]">
                  Konfirmasi TIDAK ADA pengerahan logistik/sumber daya otomatis oleh AI
                </span>
              </div>

              <div
                onClick={() =>
                  !isReadOnlyRole &&
                  setChecklist({ ...checklist, fieldAccessValidated: !checklist.fieldAccessValidated })
                }
                className="flex items-start gap-2 p-2 bg-[#071426] rounded-lg border border-[#12365C] cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={checklist.fieldAccessValidated}
                  readOnly
                  className="mt-0.5 accent-cyan-400"
                />
                <span className="text-slate-300 text-[11px]">
                  Aksesibilitas jalan alternatif telah dikonfirmasi tim lapangan
                </span>
              </div>

              <div
                onClick={() =>
                  !isReadOnlyRole &&
                  setChecklist({ ...checklist, localBpbdConsulted: !checklist.localBpbdConsulted })
                }
                className="flex items-start gap-2 p-2 bg-[#071426] rounded-lg border border-[#12365C] cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={checklist.localBpbdConsulted}
                  readOnly
                  className="mt-0.5 accent-cyan-400"
                />
                <span className="text-slate-300 text-[11px]">
                  Telah berkoordinasi dengan Pusdalops BPBD Kabupaten/Provinsi setempat
                </span>
              </div>

              <div
                onClick={() =>
                  !isReadOnlyRole &&
                  setChecklist({
                    ...checklist,
                    limitationsAcknowledged: !checklist.limitationsAcknowledged,
                  })
                }
                className="flex items-start gap-2 p-2 bg-[#071426] rounded-lg border border-[#12365C] cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={checklist.limitationsAcknowledged}
                  readOnly
                  className="mt-0.5 accent-cyan-400"
                />
                <span className="text-slate-300 text-[11px]">
                  Keterbatasan asumsi model risiko diakui dan dicatat
                </span>
              </div>
            </div>

            {/* Review Comments Box */}
            <div className="space-y-1.5 pt-1 text-xs">
              <label className="text-slate-400 font-semibold block text-[11px]">
                Catatan Peninjau (Rationale):
              </label>
              <textarea
                rows={3}
                disabled={isReadOnlyRole}
                placeholder={
                  isReadOnlyRole
                    ? 'Peran Anda hanya memiliki hak baca (Read-Only).'
                    : 'Tuliskan pertimbangan atau instruksi revisi sebelum pengesahan...'
                }
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Actions for Authorized Users */}
            {isReadOnlyRole ? (
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] text-xs text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Mode Tinjauan Eksekutif (Hanya Baca — Tidak dapat mengubah keputusan).</span>
              </div>
            ) : isFieldOfficer ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleAction('Under Review')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Ajukan untuk Peninjauan Pimpinan
                </button>
                <p className="text-[10px] text-slate-400 italic text-center">
                  *Petugas lapangan tidak berwenang mengesahkan rencana tanggap darurat resmi.
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleAction('Approved for Planning')}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui untuk Perencanaan (Approve for Planning)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('Revision Required')}
                    className="bg-[#071426] hover:bg-amber-950/40 text-amber-300 border border-amber-500/40 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Minta Revisi
                  </button>
                  <button
                    onClick={() => handleAction('Rejected')}
                    className="bg-[#071426] hover:bg-rose-950/40 text-rose-300 border border-rose-500/40 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Tolak Rekomendasi
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center pt-1">
                  *Persetujuan ini membuat catatan rencana untuk MVP 4 dan TIDAK memicu pengerahan pasukan/sirene otomatis.
                </p>
              </div>
            )}

            {/* Approval History Audit Trail */}
            <div className="pt-2 border-t border-[#12365C] space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                Riwayat Jejak Audit Persetujuan:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {(currentRec?.history || []).map((h, i) => (
                  <div
                    key={i}
                    className="p-2 bg-[#071426] rounded-lg border border-[#12365C] text-[10px] space-y-0.5"
                  >
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold text-slate-200">{h.actor_name}</span>
                      <span className="font-mono-numbers">{new Date(h.timestamp).toLocaleTimeString('id-ID')}</span>
                    </div>
                    <div className="text-cyan-400 font-bold">{h.action}</div>
                    <p className="text-slate-300 italic">"{h.notes}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
