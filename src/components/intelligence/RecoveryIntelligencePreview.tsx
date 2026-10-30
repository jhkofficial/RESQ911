import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Hammer,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { RecoveryMetric } from '../../types/intelligence';

export const RecoveryIntelligencePreview: React.FC = () => {
  const { recoveryMetrics, incidents, setActiveIncident, setActiveTab } = useDisaster();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('all');

  const filteredMetrics = recoveryMetrics.filter((m) => {
    if (selectedIncidentId !== 'all' && m.incident_id !== selectedIncidentId) return false;
    return true;
  });

  const uniqueIncidents = Array.from(
    new Map(recoveryMetrics.map((m) => [m.incident_id, m.incident_title])).entries()
  );

  return (
    <div className="space-y-4">
      {/* Prototype Warning Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-[#0a1c33] to-blue-950/80 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-950 text-purple-300 border border-purple-500/50">
                <Sparkles className="w-3 h-3 text-purple-400" />
                ANALITIK PEMULIHAN — PROTOTYPE
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Modul Pratinjau Fase Pascabencana
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Intelijen Rehabilitasi &amp; Rekonstruksi Pasca-Tanggap Darurat
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Memantau pemulihan fungsi infrastruktur publik, penutupan tanggul, pemulihan faskes, serta kebutuhan tertunda
              yang belum terselesaikan secara terstruktur.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-cyan-300 font-mono-numbers rounded-xl px-3 py-2 cursor-pointer"
            >
              <option value="all">Semua Insiden Pantauan ({uniqueIncidents.length})</option>
              {uniqueIncidents.map(([id, title]) => (
                <option key={id} value={id}>
                  {id} — {title.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-3 pt-3 border-t border-purple-500/30 flex items-start gap-2 text-xs text-purple-200/90 italic">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            Penafian: Modul ini adalah purwarupa (prototype) analitik. Sistem tidak meramalkan durasi atau tanggal pasti
            selesainya pemulihan tanpa model ekonometrik dan teknik sipil yang tervalidasi secara empiris di lapangan.
          </span>
        </div>
      </div>

      {/* Grid of Sector Recovery Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
                <div className="flex items-center gap-1.5">
                  <Hammer className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {metric.sector}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    metric.status === 'Selesai'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : metric.status === 'Dalam Proses'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {metric.status}
                </span>
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-bold text-slate-200">{metric.incident_title}</h3>
                <span className="text-[10px] text-cyan-400 font-mono-numbers">{metric.incident_id}</span>
              </div>

              {/* Progress Meter */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Progres Pemulihan Fisik:</span>
                  <span className="font-mono-numbers font-black text-cyan-300">
                    {metric.progress_percent}% ({metric.current_value} / {metric.target_value} {metric.target_unit})
                  </span>
                </div>
                <div className="w-full bg-[#071426] h-2.5 rounded-full overflow-hidden border border-[#12365C]">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metric.progress_percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Unresolved Needs */}
              <div className="mt-4 p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Kebutuhan yang Belum Terselesaikan (Unresolved Needs):
                </span>
                <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[11px]">
                  {metric.unresolved_needs.map((need, i) => (
                    <li key={i}>{need}</li>
                  ))}
                </ul>
              </div>

              {/* Milestones Timeline */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
                  Tahapan Garis Waktu Rekonstruksi:
                </span>
                <div className="space-y-1.5">
                  {metric.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#071426]/60 border border-[#12365C]/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            step.status === 'COMPLETED'
                              ? 'bg-emerald-400'
                              : step.status === 'IN_PROGRESS'
                              ? 'bg-cyan-400 animate-pulse'
                              : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className="text-slate-200 text-[11px] font-medium">{step.milestone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono-numbers">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#12365C] flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">Sinkronisasi: Pusdalops Terpadu</span>
              <button
                onClick={() => {
                  const inc = incidents.find((i) => i.incident_id === metric.incident_id);
                  if (inc) setActiveIncident(inc);
                  setActiveTab('decision-support');
                }}
                className="text-cyan-400 hover:underline font-bold text-[11px] flex items-center gap-1"
              >
                Buka Perencanaan ➔
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
