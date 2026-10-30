import React, { useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Info,
  Layers,
  ChevronDown,
  ExternalLink,
  Flame,
  UserCheck,
  FileText,
  Lock,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { RiskWeights, RiskFactors, RiskCategory } from '../../types/intelligence';
import { DEFAULT_RISK_WEIGHTS } from '../../utils/intelligenceEngine';

export const RiskIntelligenceModule: React.FC = () => {
  const {
    incidents,
    activeIncident,
    setActiveIncident,
    riskAssessments,
    runRiskAssessment,
    currentUser,
    setActiveTab,
  } = useDisaster();

  // Selected incident in focus
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => {
    return activeIncident?.incident_id || incidents[0]?.incident_id || '';
  });

  // Custom weights for interactive experimentation
  const [weights, setWeights] = useState<RiskWeights>(DEFAULT_RISK_WEIGHTS);
  const [isCustomWeights, setIsCustomWeights] = useState(false);
  const [analystNotes, setAnalystNotes] = useState('');
  const [signOffStatus, setSignOffStatus] = useState<string | null>(null);

  const currentIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0];
  const assessment = riskAssessments[currentIncident?.incident_id] || runRiskAssessment(currentIncident?.incident_id);

  // Recalculate with custom weights
  const handleRecalculate = () => {
    if (!currentIncident) return;
    runRiskAssessment(currentIncident.incident_id, weights);
    setSignOffStatus('Perhitungan ulang skor risiko berhasil diperbarui.');
    setTimeout(() => setSignOffStatus(null), 3000);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_RISK_WEIGHTS);
    setIsCustomWeights(false);
    if (currentIncident) {
      runRiskAssessment(currentIncident.incident_id, DEFAULT_RISK_WEIGHTS);
    }
  };

  // Weight sum check
  const totalWeightPercent = Math.round(
    (weights.hazardSeverity +
      weights.populationExposure +
      weights.vulnerability +
      weights.infrastructureImpact +
      weights.responseAccessDifficulty) *
      100
  );

  const getCategoryColor = (cat: RiskCategory) => {
    switch (cat) {
      case 'Sangat Tinggi':
        return 'text-red-400 bg-red-950/60 border-red-500/40';
      case 'Tinggi':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'Sedang':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'Rendah':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-4">
      {/* Module Header & Selector */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-orange-950/80 text-orange-300 border border-orange-500/40">
                <ShieldAlert className="w-3 h-3 text-orange-400" />
                DETERMINISTIC MULTI-FACTOR RISK ENGINE
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Versi: RESQ-RiskEngine-v1.4
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Intelijen &amp; Penilaian Risiko Bencana
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Metodologi penilaian risiko berbasis pembobotan terbuka dengan input terverifikasi. Seluruh faktor dinormalisasi
              ke skala 0–100 dan dapat ditelaah secara matematis tanpa efek black-box.
            </p>
          </div>

          {/* Incident Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Pilih Insiden:</span>
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
                  [{inc.severity}] {inc.incident_id} — {inc.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Scorecard & Methodology Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Total Risk Score Hero Card */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Skor Risiko Agregat
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                  assessment.category
                )}`}
              >
                {assessment.category}
              </span>
            </div>

            <div className="my-4 text-center">
              <div className="text-5xl sm:text-6xl font-black font-mono-numbers text-white tracking-tight">
                {assessment.total_score}
                <span className="text-xl text-slate-400 font-sans font-normal"> / 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Insiden: <span className="text-slate-200 font-semibold">{currentIncident.title}</span>
              </p>
              <p className="text-[11px] text-cyan-400 font-mono-numbers">
                {currentIncident.regency}, {currentIncident.province}
              </p>
            </div>

            {/* Quality Status Pill */}
            <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Status Kualitas Data:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    assessment.data_quality_status === 'Lengkap'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : assessment.data_quality_status === 'Cukup'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {assessment.data_quality_status}
                </span>
              </div>

              {assessment.missing_data.length > 0 && (
                <div className="text-[11px] text-rose-400/90 space-y-1 pt-1 border-t border-[#12365C]/60">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Data Belum Lengkap:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {assessment.missing_data.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 pt-2 border-t border-[#12365C] space-y-1">
            <div>
              Diperbarui: <span className="text-slate-300 font-mono-numbers">{new Date(assessment.assessed_at).toLocaleString('id-ID')}</span>
            </div>
            <div>
              Peninjau Resmi:{' '}
              <span className="text-cyan-300 font-medium">
                {assessment.reviewed_by || 'Menunggu Pengesahan Analis'}
              </span>
            </div>
          </div>
        </div>

        {/* Center & Right 2 Cols: Formula Breakdown & Factor Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Formula Capsule */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rumus Perhitungan Risiko (Mathematical Formulation)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono-numbers">
                Skala Normal: 0 - 100
              </span>
            </div>

            <div className="p-3 bg-[#071426] rounded-xl border border-cyan-500/20 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
              Risk Score = ({weights.hazardSeverity} &times; Bahaya) + ({weights.populationExposure} &times; Paparan) + (
              {weights.vulnerability} &times; Kerentanan) + ({weights.infrastructureImpact} &times; Dampak Fisik) + (
              {weights.responseAccessDifficulty} &times; Kesulitan Akses)
            </div>

            {/* Factor Weights Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-slate-400 text-[10px]">1. Bahaya Bencana</div>
                <div className="font-bold text-white mt-0.5 font-mono-numbers">
                  {assessment.factor_values.hazardSeverity} / 100
                </div>
                <div className="text-[10px] text-cyan-400">
                  +{assessment.contributions.hazardSeverity} Poin
                </div>
              </div>

              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-slate-400 text-[10px]">2. Paparan Warga</div>
                <div className="font-bold text-white mt-0.5 font-mono-numbers">
                  {assessment.factor_values.populationExposure} / 100
                </div>
                <div className="text-[10px] text-cyan-400">
                  +{assessment.contributions.populationExposure} Poin
                </div>
              </div>

              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-slate-400 text-[10px]">3. Kerentanan</div>
                <div className="font-bold text-white mt-0.5 font-mono-numbers">
                  {assessment.factor_values.vulnerability} / 100
                </div>
                <div className="text-[10px] text-cyan-400">
                  +{assessment.contributions.vulnerability} Poin
                </div>
              </div>

              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C]">
                <div className="text-slate-400 text-[10px]">4. Dampak Fisik</div>
                <div className="font-bold text-white mt-0.5 font-mono-numbers">
                  {assessment.factor_values.infrastructureImpact} / 100
                </div>
                <div className="text-[10px] text-cyan-400">
                  +{assessment.contributions.infrastructureImpact} Poin
                </div>
              </div>

              <div className="bg-[#071426] p-2 rounded-lg border border-[#12365C] col-span-2 sm:col-span-1">
                <div className="text-slate-400 text-[10px]">5. Aksesibilitas</div>
                <div className="font-bold text-white mt-0.5 font-mono-numbers">
                  {assessment.factor_values.responseAccessDifficulty} / 100
                </div>
                <div className="text-[10px] text-cyan-400">
                  +{assessment.contributions.responseAccessDifficulty} Poin
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Weight Tuning Simulator */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Konfigurasi Bobot Faktor (Sensitivity Adjustment)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono-numbers font-bold px-2 py-0.5 rounded ${
                    totalWeightPercent === 100
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  Total Bobot: {totalWeightPercent}%
                </span>
                {isCustomWeights && (
                  <button
                    onClick={handleResetWeights}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bobot Bahaya Bencana:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(weights.hazardSeverity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.hazardSeverity}
                  onChange={(e) => {
                    setWeights({ ...weights, hazardSeverity: parseFloat(e.target.value) });
                    setIsCustomWeights(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bobot Paparan Warga:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(weights.populationExposure * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.populationExposure}
                  onChange={(e) => {
                    setWeights({ ...weights, populationExposure: parseFloat(e.target.value) });
                    setIsCustomWeights(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bobot Kerentanan Kelompok:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(weights.vulnerability * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.05"
                  value={weights.vulnerability}
                  onChange={(e) => {
                    setWeights({ ...weights, vulnerability: parseFloat(e.target.value) });
                    setIsCustomWeights(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bobot Dampak Infrastruktur:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(weights.infrastructureImpact * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.infrastructureImpact}
                  onChange={(e) => {
                    setWeights({ ...weights, infrastructureImpact: parseFloat(e.target.value) });
                    setIsCustomWeights(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Bobot Hambatan Akses &amp; Medan:</span>
                  <span className="font-mono-numbers font-bold text-cyan-400">
                    {Math.round(weights.responseAccessDifficulty * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.05"
                  value={weights.responseAccessDifficulty}
                  onChange={(e) => {
                    setWeights({ ...weights, responseAccessDifficulty: parseFloat(e.target.value) });
                    setIsCustomWeights(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#12365C]">
              <span className="text-[10px] text-slate-400 italic">
                *Penyesuaian bobot otomatis ternormalisasi menjadi rasio 100%
              </span>
              <button
                onClick={handleRecalculate}
                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kalkulasi Ulang Skor</span>
              </button>
            </div>

            {signOffStatus && (
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{signOffStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Limitations and Methodology Notice */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Catatan Metodologi &amp; Batasan Tanggung Jawab Model (Limitations)
        </div>
        <ul className="text-xs text-slate-300 space-y-1 pl-5 list-disc leading-relaxed">
          {assessment.limitations.map((lim, i) => (
            <li key={i}>{lim}</li>
          ))}
          <li>
            Model ini tidak boleh digunakan sebagai satu-satunya penentu perintah evakuasi atau pengalihan anggaran tanpa
            kajian komprehensif tim komando resmi.
          </li>
        </ul>
      </div>
    </div>
  );
};
