import React, { useState } from 'react';
import {
  BarChart3,
  Sliders,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { PriorityWeights, PriorityAssessment } from '../../types/intelligence';
import { DEFAULT_PRIORITY_WEIGHTS } from '../../utils/intelligenceEngine';

export const ResponsePriorityEngine: React.FC = () => {
  const {
    priorityAssessments,
    priorityWeights,
    updatePriorityWeights,
    incidents,
    setActiveIncident,
    setActiveTab,
  } = useDisaster();

  // Custom sensitivity simulator sliders state
  const [localWeights, setLocalWeights] = useState<PriorityWeights>(priorityWeights);
  const [selectedAssessment, setSelectedAssessment] = useState<PriorityAssessment | null>(
    priorityAssessments[0] || null
  );
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Validate weights sum
  const sumWeights = Math.round(
    (localWeights.riskAndHazard +
      localWeights.humanitarianImpact +
      localWeights.urgency +
      localWeights.infrastructure +
      localWeights.accessConstraints) *
      100
  );

  const handleApplyWeights = () => {
    updatePriorityWeights(localWeights);
    setAiExplanation(null);
  };

  const handleResetWeights = () => {
    setLocalWeights(DEFAULT_PRIORITY_WEIGHTS);
    updatePriorityWeights(DEFAULT_PRIORITY_WEIGHTS);
    setAiExplanation(null);
  };

  const handleFetchExplanation = async (item: PriorityAssessment) => {
    setSelectedAssessment(item);
    setIsExplaining(true);
    try {
      const res = await fetch('/api/ai/explain-priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityAssessment: item, weights: localWeights }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(item.recommendation_explanation);
      }
    } catch (e) {
      setAiExplanation(item.recommendation_explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40">
                <BarChart3 className="w-3 h-3 text-purple-400" />
                MULTI-CRITERIA DECISION ANALYSIS (MCDA)
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Versi: RESQ-PriorityRanking-v2.1
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Mesin Pemeringkat Prioritas Respons Nasional
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Memeringkat prioritas penanganan insiden bencana berdasarkan 5 kriteria terukur dengan verifikasi bukti faktual.
              Dilengkapi simulator analisis sensitivitas untuk menguji ketahanan urutan prioritas saat bobot kebijakan disesuaikan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <span
              className={`text-xs font-mono-numbers font-bold px-3 py-1.5 rounded-xl border ${
                sumWeights === 100
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}
            >
              Total Bobot: {sumWeights}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Table & Sensitivity Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Priority Rankings Table */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Tabel Urutan Prioritas Respons Insiden
            </h2>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              {priorityAssessments.length} Insiden Aktif
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#071426] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#12365C]">
                <tr>
                  <th className="py-2.5 px-3">Peringkat</th>
                  <th className="py-2.5 px-3">Insiden &amp; Wilayah</th>
                  <th className="py-2.5 px-3">Jenis Bencana</th>
                  <th className="py-2.5 px-3">Dampak Kemanusiaan</th>
                  <th className="py-2.5 px-3 text-center">Skor Prioritas</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#12365C]/50">
                {priorityAssessments.map((item) => {
                  const isSelected = selectedAssessment?.incident_id === item.incident_id;

                  return (
                    <tr
                      key={item.priority_id}
                      onClick={() => handleFetchExplanation(item)}
                      className={`hover:bg-[#071426]/70 transition-colors cursor-pointer ${
                        isSelected ? 'bg-cyan-950/20 ring-1 ring-cyan-500/30' : ''
                      }`}
                    >
                      {/* Rank & Delta */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono-numbers font-black ${
                              item.rank === 1
                                ? 'bg-red-500 text-white'
                                : item.rank === 2
                                ? 'bg-orange-500 text-white'
                                : item.rank === 3
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {item.rank}
                          </span>
                          {/* Rank Delta */}
                          {item.rank_delta > 0 ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                              <ArrowUp className="w-3 h-3" />
                              {item.rank_delta}
                            </span>
                          ) : item.rank_delta < 0 ? (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center">
                              <ArrowDown className="w-3 h-3" />
                              {Math.abs(item.rank_delta)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold flex items-center">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Incident Title & Regency */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{item.incident_title}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.regency}, {item.province}
                        </div>
                      </td>

                      {/* Disaster Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-1.5 py-0.5 rounded border border-[#12365C]">
                          {item.disaster_type}
                        </span>
                      </td>

                      {/* Humanitarian Impact Meter */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-[11px] font-mono-numbers text-slate-200">
                          {item.criteria_values.humanitarianImpact} / 100
                        </div>
                        <div className="w-24 bg-[#071426] h-1.5 rounded-full overflow-hidden mt-1 border border-[#12365C]">
                          <div
                            className="bg-cyan-400 h-full rounded-full"
                            style={{ width: `${item.criteria_values.humanitarianImpact}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-sm font-black font-mono-numbers text-cyan-300">
                          {item.total_score}
                        </span>
                        <span className="text-[10px] text-slate-500"> / 100</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const inc = incidents.find((i) => i.incident_id === item.incident_id);
                            if (inc) setActiveIncident(inc);
                            setActiveTab('decision-support');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] hover:underline"
                        >
                          Telaah Respons ➔
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] flex items-center justify-between text-[11px] text-slate-400">
            <span className="italic">
              *Pemeringkatan tidak merepresentasikan komando darurat otomatis; digunakan sebagai rujukan penugasan satgas.
            </span>
          </div>
        </div>

        {/* Right 1 Col: Sensitivity Analysis Simulator & Explainability */}
        <div className="space-y-4">
          {/* Sensitivity Sliders */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Simulator Analisis Sensitivitas
                </h3>
              </div>
              <button
                onClick={handleResetWeights}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                Reset Default
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Geser bobot salah satu kriteria di bawah untuk melihat bagaimana perubahan prioritas kebijakan mengubah urutan
              peringkat insiden secara langsung (*Dynamic Rank Shifts*).
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Risiko &amp; Bahaya:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(localWeights.riskAndHazard * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={localWeights.riskAndHazard}
                  onChange={(e) =>
                    setLocalWeights({ ...localWeights, riskAndHazard: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Dampak Kemanusiaan:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(localWeights.humanitarianImpact * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={localWeights.humanitarianImpact}
                  onChange={(e) =>
                    setLocalWeights({ ...localWeights, humanitarianImpact: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Urgensi Intervensi:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(localWeights.urgency * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={localWeights.urgency}
                  onChange={(e) =>
                    setLocalWeights({ ...localWeights, urgency: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Kerusakan Fisik &amp; Utilitas:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(localWeights.infrastructure * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={localWeights.infrastructure}
                  onChange={(e) =>
                    setLocalWeights({ ...localWeights, infrastructure: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Kendala Aksesibilitas:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(localWeights.accessConstraints * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.05"
                  value={localWeights.accessConstraints}
                  onChange={(e) =>
                    setLocalWeights({ ...localWeights, accessConstraints: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleApplyWeights}
              className="w-full flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-md mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulasikan Perubahan Peringkat</span>
            </button>
          </div>

          {/* Explainability Breakdown Card */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#12365C]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Penjelasan Matematis Peringkat (Explainability)
            </div>

            {selectedAssessment ? (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-200">
                  #{selectedAssessment.rank} — {selectedAssessment.incident_title}
                </div>

                {/* Factor Contribution points */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Dampak Kemanusiaan (30%):</span>
                    <span className="font-mono-numbers font-bold text-cyan-400">
                      +{selectedAssessment.contributions.humanitarianImpact} poin
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Risiko &amp; Bahaya (30%):</span>
                    <span className="font-mono-numbers font-bold text-cyan-400">
                      +{selectedAssessment.contributions.riskAndHazard} poin
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Urgensi Intervensi (20%):</span>
                    <span className="font-mono-numbers font-bold text-cyan-400">
                      +{selectedAssessment.contributions.urgency} poin
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Infrastruktur (10%):</span>
                    <span className="font-mono-numbers font-bold text-cyan-400">
                      +{selectedAssessment.contributions.infrastructure} poin
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>Kendala Akses (10%):</span>
                    <span className="font-mono-numbers font-bold text-cyan-400">
                      +{selectedAssessment.contributions.accessConstraints} poin
                    </span>
                  </div>
                </div>

                {/* AI Grounded Explanation */}
                <div className="p-2.5 bg-[#071426] border border-cyan-500/30 rounded-xl text-[11px] text-slate-200 leading-relaxed mt-2">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    Telaah Naratif Sistem:
                  </div>
                  {isExplaining ? (
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Menyusun penjelasan kontribusi kriteria...</span>
                    </div>
                  ) : (
                    aiExplanation || selectedAssessment.recommendation_explanation
                  )}
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1">
                  *Bukan estimasi SHAP model black-box; penjelasan ini berasal langsung dari dekomposisi linier bobot
                  multikriteria.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pilih salah satu baris insiden di tabel untuk melihat penjelasan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
