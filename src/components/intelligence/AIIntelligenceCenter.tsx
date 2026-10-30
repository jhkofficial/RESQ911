import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Cpu,
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Layers,
  Filter,
  Activity,
  FileText,
  Sliders,
  CheckSquare,
  HelpCircle,
  RefreshCw,
  Flame,
  Radio,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DEMO_SCENARIOS } from '../../utils/intelligenceEngine';

export const AIIntelligenceCenter: React.FC = () => {
  const {
    incidents,
    riskAssessments,
    priorityAssessments,
    recommendations,
    intelligenceStats,
    setActiveIncident,
    setActiveTab,
    loadDemoScenario,
    activeScenario,
    timeZone,
  } = useDisaster();

  // Map Filter states
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedDisasterType, setSelectedDisasterType] = useState<string>('all');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Filtered incidents for the intelligence map
  const analyzedIncidents = incidents.filter((inc) => {
    if (selectedProvince !== 'all' && inc.province !== selectedProvince) return false;
    if (selectedDisasterType !== 'all' && inc.disaster_type !== selectedDisasterType) return false;

    const risk = riskAssessments[inc.incident_id];
    if (selectedRiskCategory !== 'all') {
      if (!risk && selectedRiskCategory !== 'unassessed') return false;
      if (risk && risk.category !== selectedRiskCategory) return false;
    }
    return true;
  });

  // Unique lists for filter dropdowns
  const provinces = Array.from(new Set(incidents.map((i) => i.province))).sort();
  const disasterTypes = Array.from(new Set(incidents.map((i) => i.disaster_type))).sort();

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149], // Indonesia center
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for analyzed incidents
    analyzedIncidents.forEach((inc) => {
      const risk = riskAssessments[inc.incident_id];
      const prio = priorityAssessments.find((p) => p.incident_id === inc.incident_id);
      const score = risk ? risk.total_score : 50;

      let color = '#00C8F8'; // Cyan default
      if (score >= 75) color = '#ef4444'; // Red
      else if (score >= 50) color = '#f97316'; // Orange
      else if (score >= 25) color = '#eab308'; // Amber

      const marker = L.circleMarker([inc.latitude, inc.longitude], {
        radius: Math.max(8, Math.min(18, score / 5)),
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: inherit; color: #071426; min-width: 220px; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; color: ${color}; text-transform: uppercase;">
            ${risk ? `Skor Risiko: ${risk.total_score} (${risk.category})` : 'Belum Dianalisis'}
          </div>
          <div style="font-weight: bold; font-size: 13px; margin-top: 2px;">
            ${inc.title}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            ${inc.regency}, ${inc.province}
          </div>
          ${
            risk
              ? `
            <div style="margin-top: 8px; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <div>Bahaya: <b>${risk.factor_values.hazardSeverity}</b> | Paparan: <b>${risk.factor_values.populationExposure}</b></div>
              <div>Kerentanan: <b>${risk.factor_values.vulnerability}</b> | Akses: <b>${risk.factor_values.responseAccessDifficulty}</b></div>
            </div>
          `
              : ''
          }
          ${
            prio
              ? `
            <div style="font-size: 10px; color: #0284c7; margin-top: 4px; font-weight: bold;">
              Peringkat Prioritas: #${prio.rank} Nasional (Skor ${prio.total_score})
            </div>
          `
              : ''
          }
          <div style="margin-top: 8px; font-size: 10px; text-align: right; color: #0891b2; font-weight: 600;">
            Klik untuk membuka telaah ➔
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setActiveIncident(inc);
      });
    });

    return () => {
      // Map instance preserved
    };
  }, [analyzedIncidents, riskAssessments, priorityAssessments]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                SISTEM PENDUKUNG KEPUTUSAN KEBENCANAAN NASIONAL
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                RESQ.911 MVP 3 Engine
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Pusat Intelijen AI &amp; Analitik Keputusan
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Mengolah data bencana terverifikasi menjadi telaah risiko transparan, kaji cepat kerusakan multimodal,
              dan pemeringkatan prioritas respons operasional dengan kendali mutlak peninjauan manusia.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('decision-support')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(0,200,248,0.3)] cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Pusat Peninjauan Keputusan</span>
            </button>
          </div>
        </div>

        {/* 4 Demo Scenarios Quick Selector */}
        <div className="mt-4 pt-3 border-t border-[#12365C] flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            Skenario Demo MVP 3:
          </span>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
            {Object.values(DEMO_SCENARIOS).map((sc) => {
              const isSelected = activeScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  onClick={() => loadDemoScenario(sc.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-bold'
                      : 'bg-[#071426] text-slate-300 border-[#12365C] hover:border-cyan-400/50 hover:text-white'
                  }`}
                  title={sc.summary}
                >
                  <span className="font-mono-numbers">[{sc.key}]</span> {sc.name.split('—')[1]?.trim()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7 KPI Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {/* KPI 1 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Insiden Memenuhi Syarat
          </div>
          <div className="text-xl font-black text-cyan-400 font-mono-numbers mt-1">
            {intelligenceStats.eligibleIncidents}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Terverifikasi / Aktif</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Analisis Selesai
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono-numbers mt-1">
            {intelligenceStats.analysesCompleted}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Telaah Risiko Tersimpan</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Perlu Peninjauan
          </div>
          <div className="text-xl font-black text-amber-400 font-mono-numbers mt-1">
            {intelligenceStats.analysesRequiringReview}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Antrean Analis</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Data Tidak Memadai
          </div>
          <div className="text-xl font-black text-rose-400 font-mono-numbers mt-1">
            {intelligenceStats.insufficientDataCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Perlu Survei Tambahan</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Prioritas Tinggi
          </div>
          <div className="text-xl font-black text-purple-400 font-mono-numbers mt-1">
            {intelligenceStats.highPriorityRecommendations}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Skor &ge; 75 / 100</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Persetujuan Manusia
          </div>
          <div className="text-xl font-black text-blue-400 font-mono-numbers mt-1">
            {intelligenceStats.pendingHumanApprovals}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Belum Disahkan</div>
        </div>

        {/* KPI 7 */}
        <div className="bg-[#0a1c33] border border-[#12365C] p-3 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Stempel Waktu</span>
            <Clock className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-slate-200 font-mono-numbers mt-2">
            {new Date(intelligenceStats.latestAnalysisTimestamp).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}{' '}
            {timeZone}
          </div>
          <div className="text-[9px] text-cyan-400 truncate mt-0.5">Analisis Terkini</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Engine Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Geographic Intelligence Panel */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12365C]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Sebaran Spasial Risiko &amp; Analisis Insiden
              </h2>
            </div>
            <div className="text-[11px] text-slate-400 font-mono-numbers">
              {analyzedIncidents.length} Titik Terpeta
            </div>
          </div>

          {/* Map Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Filter Provinsi:</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] rounded-lg px-2.5 py-1 text-slate-200 focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Semua Provinsi ({provinces.length})</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Jenis Bencana:</label>
              <select
                value={selectedDisasterType}
                onChange={(e) => setSelectedDisasterType(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] rounded-lg px-2.5 py-1 text-slate-200 focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Semua Bencana ({disasterTypes.length})</option>
                {disasterTypes.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Kategori Risiko:</label>
              <select
                value={selectedRiskCategory}
                onChange={(e) => setSelectedRiskCategory(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] rounded-lg px-2.5 py-1 text-slate-200 focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="Sangat Tinggi">Sangat Tinggi (Merah)</option>
                <option value="Tinggi">Tinggi (Oranye)</option>
                <option value="Sedang">Sedang (Kuning)</option>
                <option value="Rendah">Rendah (Hijau)</option>
              </select>
            </div>
          </div>

          {/* Interactive Map Box */}
          <div
            ref={mapContainerRef}
            className="w-full h-80 sm:h-96 rounded-xl border border-[#12365C] overflow-hidden relative z-0"
          ></div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Sangat Tinggi (&ge;75)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Tinggi (50-74)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Sedang (25-49)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Rendah (&lt;25)</span>
              </span>
            </div>
            <span className="text-[10px] italic text-slate-400">
              *Radius lingkaran merefleksikan besaran estimasi dampak
            </span>
          </div>
        </div>

        {/* Right 1 Col: Module Shortcuts & Active Incidents Queue */}
        <div className="space-y-3">
          {/* Quick Engine Launchers */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Modul Intelijen Spesifik
                </h3>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setActiveTab('risk-intel')}
                className="w-full p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                    Intelijen Risiko Bencana
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Skoring 5 faktor deterministik 0–100
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => setActiveTab('damage-assessment')}
                className="w-full p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                    Kaji Cepat Kerusakan (RDA)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Multimodal foto lapangan &amp; observasi
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => setActiveTab('data-reconciliation')}
                className="w-full p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                    Rekonsiliasi Data Multi-Laporan
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Resolusi konflik selisih TMA &amp; korban
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => setActiveTab('priority-engine')}
                className="w-full p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                    Mesin Prioritas Respons
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Pemeringkatan multikriteria &amp; sensitivitas
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => setActiveTab('recovery-preview')}
                className="w-full p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                    Analitik Pemulihan (Prototype)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Pantau tren rehabilitasi infrastruktur
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Incidents Ready for Decision Support */}
          <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#12365C]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Antrean Keputusan Tanggap Darurat
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono-numbers">
                {recommendations.length} Draf
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recommendations.map((rec) => (
                <div
                  key={rec.recommendation_id}
                  onClick={() => {
                    const inc = incidents.find((i) => i.incident_id === rec.incident_id);
                    if (inc) setActiveIncident(inc);
                    setActiveTab('decision-support');
                  }}
                  className="p-2 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono-numbers text-[10px] text-cyan-400 font-bold">
                      {rec.incident_id}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        rec.status === 'Approved for Planning'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : rec.status === 'Under Review'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 line-clamp-1">{rec.incident_title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>
                      Prioritas: <b className="text-cyan-400 font-mono-numbers">{rec.priority_score}</b>
                    </span>
                    <span>
                      Risiko: <b className="text-amber-400 font-mono-numbers">{rec.risk_score}</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Engines Overview Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#12365C]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Status Mesin Intelijen Operasional (AI Engines Registry)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparansi algoritma, model versioning, dan batas kapabilitas sistem pendukung keputusan
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold self-start sm:self-auto">
            SEMUA ENGINE AKTIF (5/5)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Risk Intelligence Engine</span>
              <span className="text-[9px] font-mono-numbers text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                OPTIMAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kalkulasi bobot deterministik 5 faktor risiko (Bahaya, Paparan, Kerentanan, Dampak Fisik, Akses).
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">RESQ-RiskEngine-v1.4</span></div>
              <div>Batas: <span className="text-amber-300/90">Memerlukan validasi pakar kebencanaan</span></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Rapid Damage Assessment</span>
              <span className="text-[9px] font-mono-numbers text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                MULTIMODAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ekstraksi deformasi fisik dan infrastruktur dari bukti foto lapangan dan catatan teknis.
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">Gemini 3.8 Flash (Multimodal)</span></div>
              <div>Batas: <span className="text-amber-300/90">Dilarang menyimpulkan pondasi tanpa uji teknis</span></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Data Reconciliation Engine</span>
              <span className="text-[9px] font-mono-numbers text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Identifikasi pertentangan multi-laporan (ketinggian air, estimasi pengungsi, koordinat).
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">Gemini 3.8 Flash + Conflict Engine</span></div>
              <div>Batas: <span className="text-amber-300/90">Kebenaran fakta diputuskan petugas</span></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Response Priority Engine</span>
              <span className="text-[9px] font-mono-numbers text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                OPTIMAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pemeringkatan respons multikriteria (MCDM) dengan simulator sensitivitas pembobotan.
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">RESQ-PriorityRanking-v2.1</span></div>
              <div>Batas: <span className="text-amber-300/90">Bukan komando pengerahan otomatis</span></div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Executive Situation Briefing</span>
              <span className="text-[9px] font-mono-numbers text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                READY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Penyusunan ringkasan situasi 8 bagian yang memisahkan fakta terverifikasi dan inferensi AI.
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">Gemini 3.8 Flash</span></div>
              <div>Batas: <span className="text-amber-300/90">Dilarang mengarang kutipan instansi resmi</span></div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Recovery Intelligence Preview</span>
              <span className="text-[9px] font-mono-numbers text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pelacakan pemulihan sektoral pascabencana (jalan, tanggul, faskes) dan kebutuhan tertunda.
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-[#12365C]/60">
              <div>Model: <span className="text-cyan-300 font-mono-numbers">RESQ-RecoveryTrack-v1.0</span></div>
              <div>Batas: <span className="text-amber-300/90">Tidak meramalkan durasi tanpa model empiris</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
