import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronRight,
  CheckSquare,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { IncidentReconciliation, ReconciliationDiscrepancy } from '../../types/intelligence';

export const DataReconciliationModule: React.FC = () => {
  const {
    incidents,
    activeIncident,
    setActiveIncident,
    reports,
    reconciliations,
    reconcileIncidentReports,
    currentUser,
  } = useDisaster();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    return activeIncident?.incident_id || incidents[0]?.incident_id || '';
  });

  const [resolutionInput, setResolutionInput] = useState<Record<string, string>>({});
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0];
  const linkedReports = reports.filter((r) => r.incident_candidate_id === currentIncident.incident_id);
  const reconciliation: IncidentReconciliation | undefined = reconciliations[currentIncident.incident_id];

  const handleRunReconcile = async () => {
    if (!currentIncident) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await reconcileIncidentReports(
        currentIncident.incident_id,
        analystNotes || 'Rekonsiliasi perbedaan data disahkan oleh analis Pusdalops.'
      );
      setStatusMessage('Rekonsiliasi data berhasil disimpan dan disinkronkan ke log audit.');
    } catch (e) {
      setStatusMessage('Gagal menjalankan rekonsiliasi data.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Incident Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-blue-950/80 text-blue-300 border border-blue-500/40">
                <Layers className="w-3 h-3 text-cyan-400" />
                MULTI-REPORT CONFLICT RESOLUTION ENGINE
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Versi: RESQ-Reconcile-v1.2
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Rekonsiliasi Data &amp; Resolusi Inkonsistensi Laporan
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Mendeteksi dan merekonsiliasi perbedaan informasi antar-laporan lapangan yang terhubung ke satu insiden bencana
              (seperti perbedaan ketinggian air, angka pengungsi, atau titik koordinat) dengan persetujuan analis manusia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium">Insiden:</span>
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
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Discrepancies Resolution Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Discrepancy Synthesis */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sintesis Inkonsistensi oleh AI
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono-numbers">
                {linkedReports.length} Laporan Tertaut
              </span>
            </div>

            <div className="p-3 bg-[#071426] rounded-xl border border-cyan-500/30 text-xs text-slate-200 leading-relaxed">
              {reconciliation?.ai_summary ||
                'Sistem menganalisis seluruh laporan yang masuk untuk mengidentifikasi konsistensi waktu, lokasi, dan dampak riil.'}
            </div>

            <p className="text-[11px] text-amber-300/90 italic">
              *AI bertugas menyarikan perbedaan; keputusan angka resmi mutlak ditetapkan oleh petugas berwenang.
            </p>
          </div>

          {/* Consistent Facts vs Discrepancies */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#12365C]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Fakta Konsisten (Saling Menguatkan)
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              {(reconciliation?.consistent_data || [
                `Lokasi utama insiden berada di kawasan ${currentIncident.regency}, ${currentIncident.province}`,
                `Semua pelapor mengindikasikan jenis bencana ${currentIncident.disaster_type}`,
              ]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Identified Discrepancies Side-by-Side Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Daftar Pertentangan Data (Discrepancies)
              </h3>
              <span className="text-[10px] text-slate-400">
                {reconciliation?.discrepancies?.length || 0} Bidang Terdeteksi
              </span>
            </div>

            {(reconciliation?.discrepancies || []).map((disc: ReconciliationDiscrepancy, i: number) => (
              <div
                key={i}
                className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
                  <div>
                    <span className="text-xs font-bold text-white">{disc.field_label}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({disc.field})</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      disc.status === 'RESOLVED'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {disc.status === 'RESOLVED' ? 'TEREKONSILIASI' : 'TERBUKA / SELISIH'}
                  </span>
                </div>

                {/* Conflicting Source Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {disc.conflicting_values.map((item, valIdx) => (
                    <div
                      key={valIdx}
                      className="p-2.5 rounded-xl bg-[#071426] border border-[#12365C] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono-numbers text-cyan-400 font-bold">{item.report_id}</span>
                        <span className="text-slate-400">{item.reporter_type.replace('_', ' ')}</span>
                      </div>
                      <div className="font-semibold text-slate-200">{item.reporter_name}</div>
                      <div className="p-1.5 bg-[#0a1c33] rounded text-white font-mono-numbers font-bold text-[11px]">
                        {item.value}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Suggested Resolution */}
                <div className="p-2.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs space-y-1">
                  <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-tight flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Saran Resolusi AI:
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">{disc.suggested_resolution}</p>
                </div>

                {/* Human Resolution Box */}
                <div className="p-2.5 bg-[#071426] border border-[#12365C] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Nilai Resmi Hasil Rekonsiliasi:
                    </span>
                    {disc.resolved_by && (
                      <span className="text-[10px] text-emerald-400">
                        Oleh: {disc.resolved_by} ({new Date(disc.resolved_at || Date.now()).toLocaleDateString('id-ID')})
                      </span>
                    )}
                  </div>
                  <div className="font-mono-numbers text-xs font-bold text-emerald-400 bg-[#0a1c33] p-2 rounded border border-emerald-500/30">
                    {disc.resolved_value || 'Belum ditetapkan'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Latest Verified Stats & Action */}
        <div className="space-y-4">
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#12365C]">
              Ringkasan Data Resmi Terakhir
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#12365C]/60 text-slate-300">
                <span>Insiden ID:</span>
                <span className="font-mono-numbers text-cyan-400 font-bold">{currentIncident.incident_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#12365C]/60 text-slate-300">
                <span>Ketinggian Air / TMA:</span>
                <span className="font-mono-numbers text-white font-bold">
                  {reconciliation?.latest_verified_data?.tma_range || '0.8m - 2.5m (Zona Berbeda)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#12365C]/60 text-slate-300">
                <span>Total Pengungsi Resmi:</span>
                <span className="font-mono-numbers text-white font-bold">
                  {currentIncident.displaced_population?.toLocaleString('id-ID')} jiwa
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#12365C]/60 text-slate-300">
                <span>Total Terdampak Resmi:</span>
                <span className="font-mono-numbers text-white font-bold">
                  {currentIncident.affected_population?.toLocaleString('id-ID')} jiwa
                </span>
              </div>
            </div>
          </div>

          {/* Missing Evidence */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider pb-1 border-b border-[#12365C] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              Bukti Lapangan yang Masih Dibutuhkan
            </h4>
            <ul className="text-slate-300 space-y-1 pl-4 list-disc text-[11px]">
              {(reconciliation?.missing_evidence || [
                'Dokumen register posko pengungsian terpadu',
                'Foto penanda batas peilschaal debit air sungai',
              ]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Human Action Form */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider pb-1 border-b border-[#12365C]">
              Pengesahan Rekonsiliasi
            </h4>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan hasil verifikasi manual dengan posko lapangan..."
              value={analystNotes}
              onChange={(e) => setAnalystNotes(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleRunReconcile}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Rekonsiliasi...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Sahkan Rekonsiliasi Resmi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
