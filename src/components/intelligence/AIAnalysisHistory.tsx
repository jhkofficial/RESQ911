import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  FileText,
  Eye,
  X,
  Sparkles,
  Download,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { AIAnalysisRun } from '../../types/intelligence';

export const AIAnalysisHistory: React.FC = () => {
  const { aiAnalysisRuns, timeZone } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<AIAnalysisRun | null>(null);

  const filteredRuns = aiAnalysisRuns.filter((run) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        run.analysis_id.toLowerCase().includes(q) ||
        run.incident_id.toLowerCase().includes(q) ||
        run.notes.toLowerCase().includes(q) ||
        run.engine_name.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (engineFilter !== 'all' && run.engine_type !== engineFilter) return false;
    if (statusFilter !== 'all' && run.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <History className="w-3 h-3 text-cyan-400" />
                AUDIT TRAIL &amp; AI PROVENANCE REGISTRY
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Riwayat Analisis AI &amp; Jejak Asal-Usul Data (Provenance)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Catatan komprehensif seluruh eksekusi inferensi model, versi prompt template, stempel waktu, dan masukan bukti
              sebagai jaminan transparansi akuntabilitas sistem.
            </p>
          </div>

          <div className="text-xs font-mono-numbers text-cyan-400 self-start sm:self-auto">
            {filteredRuns.length} Total Eksekusi
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-[#12365C]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID Run, Insiden, atau Kata Kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={engineFilter}
              onChange={(e) => setEngineFilter(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Semua Jenis Engine</option>
              <option value="RISK_SCORING">Risk Intelligence Engine</option>
              <option value="DAMAGE_ASSESSMENT">Rapid Damage Assessment</option>
              <option value="RECONCILIATION">Data Reconciliation Engine</option>
              <option value="PRIORITY_RANKING">Response Priority Engine</option>
              <option value="SITUATION_SUMMARY">Executive Situation Briefing</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Semua Status Eksekusi</option>
              <option value="SUCCESS">Berhasil (SUCCESS)</option>
              <option value="WARNING">Peringatan (WARNING)</option>
              <option value="FAILED">Gagal (FAILED)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071426] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#12365C]">
              <tr>
                <th className="py-3 px-3">Run ID</th>
                <th className="py-3 px-3">Engine &amp; Versi Model</th>
                <th className="py-3 px-3">Insiden ID</th>
                <th className="py-3 px-3">Masukan Snapshot</th>
                <th className="py-3 px-3 text-center">Durasi (ms)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Waktu Eksekusi</th>
                <th className="py-3 px-3 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/50">
              {filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan riwayat AI yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((run) => (
                  <tr key={run.analysis_id} className="hover:bg-[#071426]/60 transition-colors">
                    {/* Run ID */}
                    <td className="py-3 px-3 font-mono-numbers font-bold text-cyan-400 whitespace-nowrap">
                      {run.analysis_id}
                    </td>

                    {/* Engine & Model Version */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-white">{run.engine_name}</div>
                      <div className="text-[10px] text-cyan-300 font-mono-numbers">{run.model_version}</div>
                    </td>

                    {/* Incident ID */}
                    <td className="py-3 px-3 font-mono-numbers font-semibold text-slate-200 whitespace-nowrap">
                      {run.incident_id}
                    </td>

                    {/* Input Snapshot */}
                    <td className="py-3 px-3 max-w-xs text-slate-300 text-[11px] truncate">
                      {run.input_snapshot}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 text-center font-mono-numbers text-slate-300">
                      {run.execution_time_ms} ms
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono-numbers ${
                          run.status === 'SUCCESS'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {run.status}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 text-slate-400 font-mono-numbers text-[11px] whitespace-nowrap">
                      {new Date(run.created_at).toLocaleString('id-ID')}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold p-1 bg-[#071426] border border-[#12365C] rounded-lg transition-colors cursor-pointer"
                        title="Lihat Raw JSON & Rincian Log"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw JSON Inspection Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-[#071426]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-[#12365C] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Rincian Log Inferensi AI: {selectedRun.analysis_id}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono-numbers">
                  Engine: {selectedRun.engine_name} ({selectedRun.model_version})
                </span>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Ringkasan Keluaran (Output Summary):
                </label>
                <div className="p-2.5 bg-[#071426] rounded-xl border border-cyan-500/30 text-slate-200">
                  {selectedRun.output_summary}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Catatan Eksekusi:
                </label>
                <p className="text-slate-300">{selectedRun.notes}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Snapshot Objek JSON Penuh:
                </label>
                <pre className="p-3 bg-[#071426] rounded-xl border border-[#12365C] text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56">
                  {JSON.stringify(selectedRun, null, 2)}
                </pre>
              </div>

              <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[10px] text-amber-200/90 italic">
                Penafian: {selectedRun.disclaimer}
              </div>
            </div>

            <div className="p-3 border-t border-[#12365C] flex items-center justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="bg-[#071426] hover:bg-[#071426]/80 text-slate-200 px-4 py-1.5 rounded-lg border border-[#12365C] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
