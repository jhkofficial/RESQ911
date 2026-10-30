import React, { useState } from 'react';
import {
  Copy,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Info,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DUPLICATE_WEIGHTS, SIMILARITY_THRESHOLDS } from '../../utils/duplicateDetection';

export const DuplicateDetectionModule: React.FC = () => {
  const { duplicateCandidates, reports, setActiveReport, setActiveTab, markReportAsDuplicate } =
    useDisaster();

  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium'>('all');
  const [selectedPair, setSelectedPair] = useState<(typeof duplicateCandidates)[0] | null>(
    duplicateCandidates[0] || null
  );

  const filteredCandidates = duplicateCandidates.filter((cand) => {
    if (filterLevel === 'high') return cand.similarity_score >= SIMILARITY_THRESHOLDS.high;
    if (filterLevel === 'medium')
      return (
        cand.similarity_score >= SIMILARITY_THRESHOLDS.medium &&
        cand.similarity_score < SIMILARITY_THRESHOLDS.high
      );
    return true;
  });

  const sourceReport = selectedPair
    ? reports.find((r) => r.report_id === selectedPair.source_report_id)
    : null;
  const matchedReport = selectedPair
    ? reports.find((r) => r.report_id === selectedPair.matched_report_id)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/40 uppercase tracking-wider">
              Autonomous Duplicate Flagging Engine
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {duplicateCandidates.length} Pasangan Terdeteksi
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
            <Copy className="w-5 h-5 text-orange-400" />
            Deteksi Potensi Duplikasi Laporan Bencana
          </h1>
          <p className="text-xs text-slate-400">
            Model kesamaan spasial-temporal transparan untuk mengidentifikasi laporan tumpang tindih dari kanal publik
          </p>
        </div>

        {/* Filter by severity */}
        <div className="flex items-center gap-1.5 bg-[#071426] p-1 rounded-xl border border-[#12365C] text-xs">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterLevel === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({duplicateCandidates.length})
          </button>
          <button
            onClick={() => setFilterLevel('high')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterLevel === 'high' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Skor Tinggi ≥ 80%
          </button>
          <button
            onClick={() => setFilterLevel('medium')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterLevel === 'medium' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Skor Sedang 60-79%
          </button>
        </div>
      </div>

      {/* Model Transparency & Formula Explanation Card */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#12365C]">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Bobot Algoritma Kesamaan (Prototype Similarity Weights)
          </span>
          <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            Non-Destructive: Tidak Ada Penggabungan Otomatis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
            <div className="text-slate-400 text-[10px] uppercase">Kedekatan Spasial (Haversine)</div>
            <div className="text-base font-bold text-cyan-300 font-mono-numbers mt-0.5">35%</div>
            <div className="text-[10px] text-slate-500">Radius &lt; 40 km</div>
          </div>
          <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
            <div className="text-slate-400 text-[10px] uppercase">Kedekatan Waktu (Delta Jam)</div>
            <div className="text-base font-bold text-cyan-300 font-mono-numbers mt-0.5">25%</div>
            <div className="text-[10px] text-slate-500">Selisih &lt; 72 jam</div>
          </div>
          <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
            <div className="text-slate-400 text-[10px] uppercase">Kesesuaian Tipe Bencana</div>
            <div className="text-base font-bold text-cyan-300 font-mono-numbers mt-0.5">20%</div>
            <div className="text-[10px] text-slate-500">Kategori Identik</div>
          </div>
          <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
            <div className="text-slate-400 text-[10px] uppercase">Kesamaan Teks (Jaccard NLP)</div>
            <div className="text-base font-bold text-cyan-300 font-mono-numbers mt-0.5">20%</div>
            <div className="text-[10px] text-slate-500">Irisan Kata Kunci</div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column: Candidate List & Side-by-Side Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: List of Candidate Pairs (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 bg-[#0a1c33] border border-[#12365C] rounded-2xl text-center text-slate-400 text-xs">
              Tidak ada pasangan duplikasi dalam filter ini.
            </div>
          ) : (
            filteredCandidates.map((cand) => {
              const isSelected = selectedPair?.candidate_id === cand.candidate_id;
              const repA = reports.find((r) => r.report_id === cand.source_report_id);
              const repB = reports.find((r) => r.report_id === cand.matched_report_id);

              return (
                <div
                  key={cand.candidate_id}
                  onClick={() => setSelectedPair(cand)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-950/60 to-[#0a1c33] border-orange-400 shadow-lg'
                      : 'bg-[#0a1c33] border-[#12365C] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-mono-numbers text-xs font-bold text-cyan-300">
                      <span>{cand.source_report_id}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cand.matched_report_id}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono-numbers border ${
                        cand.similarity_score >= 0.8
                          ? 'bg-orange-950 text-orange-300 border-orange-500/50'
                          : 'bg-amber-950 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {Math.round(cand.similarity_score * 100)}% Cocok
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white truncate">
                    {repA?.title || cand.source_report_id}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                    <span>{repA?.regency}, {repA?.province}</span>
                    <span className="font-mono-numbers text-cyan-400">{cand.distance_km} km</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Side-by-Side Detailed Comparison (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedPair && sourceReport && matchedReport ? (
            <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#12365C]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">
                    Perbandingan Dua Arah (Side-by-Side Verification)
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Evaluasi Kesamaan antara {sourceReport.report_id} dan {matchedReport.report_id}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-orange-400 font-mono-numbers">
                    {Math.round(selectedPair.similarity_score * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Total Indeks Kemiripan</div>
                </div>
              </div>

              {/* Side-by-Side Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Column A */}
                <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-numbers text-xs font-bold text-cyan-400">
                      {sourceReport.report_id}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-[#0a1c33] px-1.5 py-0.5 rounded">
                      {sourceReport.verification_status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{sourceReport.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    {sourceReport.description}
                  </p>
                  <div className="pt-2 border-t border-[#12365C]/60 text-[10px] text-slate-400 space-y-0.5">
                    <div>Lokasi: {sourceReport.village}, {sourceReport.regency}</div>
                    <div>Waktu: {sourceReport.event_date} {sourceReport.event_time}</div>
                    <div>Pelapor: {sourceReport.reporter_name} ({sourceReport.reporter_type})</div>
                  </div>
                </div>

                {/* Column B */}
                <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-numbers text-xs font-bold text-cyan-400">
                      {matchedReport.report_id}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-[#0a1c33] px-1.5 py-0.5 rounded">
                      {matchedReport.verification_status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{matchedReport.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                    {matchedReport.description}
                  </p>
                  <div className="pt-2 border-t border-[#12365C]/60 text-[10px] text-slate-400 space-y-0.5">
                    <div>Lokasi: {matchedReport.village}, {matchedReport.regency}</div>
                    <div>Waktu: {matchedReport.event_date} {matchedReport.event_time}</div>
                    <div>Pelapor: {matchedReport.reporter_name} ({matchedReport.reporter_type})</div>
                  </div>
                </div>
              </div>

              {/* Similarity Breakdown Breakdown Card */}
              <div className="bg-[#071426] p-3.5 rounded-xl border border-orange-500/30 space-y-2">
                <span className="text-xs font-bold text-orange-300 uppercase tracking-wider block">
                  Rincian Parameter &amp; Penjelasan Kesamaan:
                </span>
                <p className="text-xs text-slate-200">{selectedPair.explanation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1 border-t border-[#12365C]/60">
                  <div>Jarak Geografis: <strong className="text-slate-200">{selectedPair.distance_km} km</strong></div>
                  <div>Selisih Waktu: <strong className="text-slate-200">{selectedPair.time_diff_hours} jam</strong></div>
                  <div>Tipe Bencana: <strong className="text-emerald-400">{selectedPair.disaster_type_match ? 'Sama' : 'Beda'}</strong></div>
                  <div>Kata Kunci: <strong className="text-cyan-300">{selectedPair.matching_keywords.length} kata</strong></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#12365C]">
                <button
                  onClick={() => {
                    setActiveReport(sourceReport);
                    setActiveTab('verification-center');
                  }}
                  className="flex items-center gap-1.5 bg-[#071426] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Buka di Pusat Verifikasi</span>
                </button>

                <button
                  onClick={() => {
                    markReportAsDuplicate(
                      sourceReport.id,
                      matchedReport.report_id,
                      `Dikonfirmasi duplikat dari ${matchedReport.report_id} melalui panel deteksi duplikasi.`
                    );
                    alert(`Laporan ${sourceReport.report_id} berhasil ditandai sebagai duplikat dari ${matchedReport.report_id}.`);
                  }}
                  className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Gabungkan ke {matchedReport.report_id}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-[#0a1c33] border border-[#12365C] rounded-2xl text-center text-slate-400 text-xs">
              Pilih salah satu pasangan laporan dari daftar di sebelah kiri untuk melihat perbandingan mendalam.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
