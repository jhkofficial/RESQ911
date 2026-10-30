import React, { useState } from 'react';
import {
  Cpu,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';
import { SIMULATED_AI_ENGINES } from '../../data/simulatedDisasters';
import { AIEngine } from '../../types/disaster';
import { useDisaster } from '../../context/DisasterContext';

export const AIIntelligenceOverview: React.FC = () => {
  const { currentUser } = useDisaster();
  const [engines, setEngines] = useState<AIEngine[]>(SIMULATED_AI_ENGINES);
  const [runningEngineId, setRunningEngineId] = useState<string | null>(null);
  const [approvedEngines, setApprovedEngines] = useState<Record<string, boolean>>({});

  const handleRunSimulation = (id: string) => {
    setRunningEngineId(id);
    setTimeout(() => {
      setEngines((prev) =>
        prev.map((engine) => {
          if (engine.id === id) {
            return {
              ...engine,
              lastRun: 'Baru saja dieksekusi (Simulasi Ingestion Selesai)',
              status: 'OPTIMAL',
            };
          }
          return engine;
        })
      );
      setRunningEngineId(null);
    }, 1200);
  };

  const handleApproveRecommendation = (id: string) => {
    setApprovedEngines((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Disclaimer Banner for AI */}
      <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Arsitektur 5 Mesin AI Intelligence Bencana (Simulasi MVP 1)
                </h2>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 border border-purple-500/30 px-2 py-0.5 rounded">
                  MODEL PROTOTYPE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Output rekomendasi bersifat prediktif simulasi. Berdasarkan tata kelola keselamatan BNPB, 
                seluruh dispatch logistik dan perintah evakuasi <strong>wajib melalui otorisasi manusia (Human-in-the-Loop)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#071426] px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs text-purple-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Human-in-the-Loop: Aktif</span>
          </div>
        </div>
      </div>

      {/* Grid of 5 AI Engines */}
      <div className="space-y-4">
        {engines.map((engine) => {
          const isRunning = runningEngineId === engine.id;
          const isApproved = approvedEngines[engine.id];

          return (
            <div
              key={engine.id}
              className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-500/40 rounded-2xl p-5 shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#12365C] gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#071426] border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{engine.name}</h3>
                      <span className="font-mono-numbers text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                        {engine.codeName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{engine.description}</p>
                  </div>
                </div>

                {/* Status Capsule & Confidence */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Tingkat Keyakinan</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono-numbers">
                      {engine.confidenceScore}% <span className="text-[10px] text-slate-400">Confidence</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      engine.status === 'OPTIMAL'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : engine.status === 'PROCESSING'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ● {engine.status}
                  </span>
                </div>
              </div>

              {/* Data Ingestion & Expected Output Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Inputs */}
                <div className="bg-[#071426] p-3.5 rounded-xl border border-[#12365C]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    Input Data yang Dibutuhkan (Data Feeds)
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {engine.inputData.map((inp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div className="bg-[#071426] p-3.5 rounded-xl border border-[#12365C]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Output Intelijen yang Dihasilkan
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {engine.outputData.map((outp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{outp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Simulated Example Recommendation */}
              <div className="bg-gradient-to-r from-[#071426] to-[#0d223f] border border-cyan-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Rekomendasi Operasional Terkini (Output Engine):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-numbers">
                    Margin Ketidakpastian: {engine.uncertaintyMargin}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed pl-2 border-l-2 border-cyan-400">
                  "{engine.exampleRecommendation}"
                </p>
                <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300/90">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Protokol: {engine.actionRequired}
                  </span>
                </div>
              </div>

              {/* Action bar for Human Review */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-[#12365C]">
                <div className="text-xs text-slate-400">
                  Siklus Eksekusi: <span className="text-slate-300">{engine.lastRun}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunSimulation(engine.id)}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 bg-[#071426] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Memproses Simulasi...' : 'Jalankan Inferensi'}</span>
                  </button>

                  <button
                    onClick={() => handleApproveRecommendation(engine.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Disetujui ({currentUser.role.replace('_', ' ')})</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Otorisasi Rekomendasi Manusia</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
