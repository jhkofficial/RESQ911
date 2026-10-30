import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Compass,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Inbox,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DisasterIncident, DisasterType, SeverityLevel, IncidentReport } from '../../types/disaster';
import { FilterBar } from '../common/FilterBar';

export const DisasterMap: React.FC = () => {
  const {
    filteredIncidents,
    activeIncident,
    setActiveIncident,
    reports,
    setActiveReport,
    setActiveTab,
    mapLayers,
    setMapLayers,
  } = useDisaster();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const unverifiedLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTileStyle, setActiveTileStyle] = useState<'dark' | 'standard'>('dark');
  const [selectedIncidentForDrawer, setSelectedIncidentForDrawer] = useState<DisasterIncident | null>(
    activeIncident
  );
  const [selectedReportForDrawer, setSelectedReportForDrawer] = useState<IncidentReport | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  // Pre-set focus regions across Indonesia
  const quickJumpRegions = [
    { name: 'Seluruh Indonesia', center: [-2.2, 118.0] as [number, number], zoom: 5 },
    { name: 'Sumatera', center: [0.5, 101.5] as [number, number], zoom: 6 },
    { name: 'Jawa & Bali', center: [-7.5, 110.5] as [number, number], zoom: 7 },
    { name: 'Nusa Tenggara', center: [-8.6, 120.0] as [number, number], zoom: 7 },
    { name: 'Kalimantan', center: [-1.2, 113.8] as [number, number], zoom: 6 },
    { name: 'Sulawesi', center: [-2.0, 121.0] as [number, number], zoom: 6 },
    { name: 'Maluku & Papua', center: [-3.5, 134.0] as [number, number], zoom: 6 },
  ];

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Kritis':
        return '#ef4444'; // Red
      case 'Tinggi':
        return '#f97316'; // Orange
      case 'Sedang':
        return '#eab308'; // Amber
      case 'Rendah':
        return '#00c8f8'; // Cyan
      default:
        return '#94a3b8';
    }
  };

  const getDisasterSymbol = (type: DisasterType) => {
    switch (type) {
      case 'Banjir':
        return '💧';
      case 'Gempa Bumi':
        return '⚡';
      case 'Tanah Longsor':
        return '⛰️';
      case 'Erupsi Gunung Api':
        return '🌋';
      case 'Kebakaran Hutan & Lahan':
        return '🔥';
      case 'Cuaca Ekstrem':
        return '🌪️';
      case 'Tsunami':
        return '🌊';
      default:
        return '⚠️';
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-2.2, 118.0],
        zoom: 5,
        minZoom: 4,
        maxZoom: 16,
        zoomControl: false,
      });

      const darkTiles = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      );

      darkTiles.addTo(map);
      tileLayerRef.current = darkTiles;

      const markersGroup = L.layerGroup().addTo(map);
      const unverifiedGroup = L.layerGroup().addTo(map);

      markersLayerRef.current = markersGroup;
      unverifiedLayerRef.current = unverifiedGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle tile switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl =
      activeTileStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTiles = L.tileLayer(newUrl, {
      attribution:
        activeTileStyle === 'dark'
          ? '&copy; CartoDB &copy; OpenStreetMap'
          : '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    newTiles.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  }, [activeTileStyle]);

  // Synchronize Verified Incident Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!mapLayers.showVerifiedIncidents) return;

    filteredIncidents.forEach((incident) => {
      const color = getSeverityColor(incident.severity);
      const symbol = getDisasterSymbol(incident.disaster_type);
      const isCritical = incident.severity === 'Kritis';
      const isSelected = selectedIncidentForDrawer?.id === incident.id;

      const customIcon = L.divIcon({
        className: 'custom-disaster-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isCritical
                ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${color}40; animation: pulse-critical 2s infinite;"></div>`
                : ''
            }
            <div style="
              width: ${isSelected ? '32px' : '26px'};
              height: ${isSelected ? '32px' : '26px'};
              background: #071426;
              border: 2px solid ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: ${isSelected ? '14px' : '12px'};
              box-shadow: 0 0 10px ${color}80;
              transition: all 0.2s ease;
            ">
              ${symbol}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([incident.latitude, incident.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f1f5f9; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 10px; color: #00c8f8; font-weight: bold;">${incident.incident_id}</span>
            <span style="background: ${color}30; color: ${color}; border: 1px solid ${color}60; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${incident.severity} • Terverifikasi
            </span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">
            ${incident.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            📍 ${incident.regency}, ${incident.province}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: rgba(7, 20, 38, 0.7); padding: 6px; border-radius: 6px; border: 1px solid rgba(18, 54, 92, 0.7); margin-bottom: 8px; font-size: 10px;">
            <div>
              <span style="color: #64748b; display: block;">Terdampak:</span>
              <strong style="color: #38bdf8; font-size: 11px;">${incident.affected_population.toLocaleString('id-ID')} jiwa</strong>
            </div>
            <div>
              <span style="color: #64748b; display: block;">Pengungsi:</span>
              <strong style="color: #f59e0b; font-size: 11px;">${incident.displaced_population.toLocaleString('id-ID')} jiwa</strong>
            </div>
          </div>
          <button id="btn-inspect-${incident.id}" style="
            width: 100%;
            background: #00c8f8;
            color: #071426;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          ">
            Buka Rincian Operasional →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedIncidentForDrawer(incident);
        setSelectedReportForDrawer(null);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${incident.id}`);
        if (btn) {
          btn.onclick = () => {
            setActiveIncident(incident);
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredIncidents, selectedIncidentForDrawer, mapLayers.showVerifiedIncidents]);

  // Synchronize Unverified Report Markers (MVP 2 distinct visual style)
  useEffect(() => {
    if (!mapInstanceRef.current || !unverifiedLayerRef.current) return;

    unverifiedLayerRef.current.clearLayers();

    if (!mapLayers.showUnverifiedReports) return;

    const unverifiedReports = reports.filter(
      (r) => r.verification_status === 'Belum Diverifikasi' || r.verification_status === 'Dalam Verifikasi'
    );

    unverifiedReports.forEach((rep) => {
      const isSelected = selectedReportForDrawer?.id === rep.id;

      // Distinct visual pin: Dashed border with warning badge & question mark
      const ghostIcon = L.divIcon({
        className: 'unverified-report-marker',
        html: `
          <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="
              width: ${isSelected ? '30px' : '24px'};
              height: ${isSelected ? '30px' : '24px'};
              background: rgba(10, 28, 51, 0.9);
              border: 2px dashed #f59e0b;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              color: #f59e0b;
              box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
              transform: rotate(45deg);
              transition: all 0.2s ease;
            ">
              <span style="transform: rotate(-45deg); font-weight: 900; font-family: monospace;">?</span>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: ghostIcon });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f1f5f9; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 10px; color: #f59e0b; font-weight: bold;">${rep.report_id}</span>
            <span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              Belum Diverifikasi
            </span>
          </div>
          <div style="font-weight: 700; font-size: 12px; color: #ffffff; margin-bottom: 4px;">
            ${rep.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            📍 ${rep.village}, ${rep.regency}
          </div>
          <div style="background: rgba(7, 20, 38, 0.7); padding: 6px; border-radius: 6px; border: 1px solid rgba(18, 54, 92, 0.7); margin-bottom: 8px; font-size: 10px;">
            <span style="color: #64748b; display: block;">Pelapor:</span>
            <span style="color: #cbd5e1;">${rep.reporter_name} (${rep.reporter_type.replace('_', ' ')})</span>
            <div style="margin-top: 4px; color: #38bdf8;">
              Estimasi Terdampak: <strong>${rep.estimated_affected.toLocaleString('id-ID')} jiwa</strong>
            </div>
          </div>
          <button id="btn-verify-${rep.id}" style="
            width: 100%;
            background: #f59e0b;
            color: #071426;
            border: none;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          ">
            Buka di Pusat Verifikasi →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedReportForDrawer(rep);
        setSelectedIncidentForDrawer(null);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-verify-${rep.id}`);
        if (btn) {
          btn.onclick = () => {
            setActiveReport(rep);
            setActiveTab('verification-center');
          };
        }
      });

      unverifiedLayerRef.current?.addLayer(marker);
    });
  }, [reports, selectedReportForDrawer, mapLayers.showUnverifiedReports]);

  // Jump to activeIncident if set
  useEffect(() => {
    if (activeIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeIncident.latitude, activeIncident.longitude], 10, {
        duration: 1.2,
      });
      setSelectedIncidentForDrawer(activeIncident);
      setSelectedReportForDrawer(null);
    }
  }, [activeIncident]);

  const handleRegionJump = (region: (typeof quickJumpRegions)[0]) => {
    mapInstanceRef.current?.flyTo(region.center, region.zoom, { duration: 1.2 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetIndonesia = () => mapInstanceRef.current?.flyTo([-2.2, 118.0], 5, { duration: 1 });

  return (
    <div className="space-y-3">
      {/* Top Filter Bar */}
      <FilterBar />

      {/* Main Map Container */}
      <div className="relative bg-[#071426] border border-[#12365C] rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-250px)] min-h-[580px]">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Top Left: Quick Region Jump Bar */}
        <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-1.5 bg-[#0a1c33]/90 border border-[#12365C] rounded-xl p-1.5 backdrop-blur-md shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Lompat Wilayah:
          </span>
          <div className="flex items-center gap-1">
            {quickJumpRegions.map((reg) => (
              <button
                key={reg.name}
                onClick={() => handleRegionJump(reg)}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#12365C] rounded-lg transition-colors cursor-pointer"
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Top Right: Layer Toggles & Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {/* Layer Filter Toggles (MVP 2 Requirement) */}
          <div className="flex items-center gap-1 bg-[#0a1c33]/95 border border-[#12365C] rounded-xl p-1.5 backdrop-blur-md shadow-lg text-xs">
            <button
              onClick={() =>
                setMapLayers({
                  ...mapLayers,
                  showVerifiedIncidents: !mapLayers.showVerifiedIncidents,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                mapLayers.showVerifiedIncidents
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Kejadian Terverifikasi</span>
            </button>

            <button
              onClick={() =>
                setMapLayers({
                  ...mapLayers,
                  showUnverifiedReports: !mapLayers.showUnverifiedReports,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                mapLayers.showUnverifiedReports
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 border border-dashed border-amber-400 bg-amber-950"></span>
              <span>Laporan Belum Terverifikasi</span>
            </button>
          </div>

          {/* Tile Layer Style */}
          <div className="flex items-center bg-[#0a1c33]/90 border border-[#12365C] rounded-xl p-1 backdrop-blur-md shadow-lg">
            <button
              onClick={() => setActiveTileStyle('dark')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTileStyle === 'dark'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode Gelap
            </button>
            <button
              onClick={() => setActiveTileStyle('standard')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTileStyle === 'standard'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standar OSM
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex flex-col bg-[#0a1c33]/90 border border-[#12365C] rounded-xl backdrop-blur-md shadow-lg overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#12365C] transition-colors border-b border-[#12365C] cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#12365C] transition-colors border-b border-[#12365C] cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetIndonesia}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#12365C] transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Floating Bottom Left: Legend */}
        <div className="absolute bottom-3 left-3 z-10">
          {showLegend ? (
            <div className="bg-[#0a1c33]/95 border border-[#12365C] rounded-xl p-3 shadow-xl backdrop-blur-md w-64 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#12365C]">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Legenda Geointelijen
                </span>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Ciutkan
                </button>
              </div>

              {/* Pin Types */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status Layer
                </div>
                <div className="space-y-1 text-[11px] text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 border border-slate-900 shrink-0"></span>
                    <span>Kejadian Terverifikasi (Solid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded border border-dashed border-amber-400 bg-amber-950 shrink-0"></span>
                    <span>Laporan Belum Diverifikasi (Ghost)</span>
                  </div>
                </div>
              </div>

              {/* Severity Colors */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tingkat Keparahan
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className="text-red-400 font-semibold">• Kritis (Pulse)</span>
                  <span className="text-orange-400 font-semibold">• Tinggi</span>
                  <span className="text-amber-400 font-semibold">• Sedang</span>
                  <span className="text-cyan-400 font-semibold">• Rendah</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLegend(true)}
              className="bg-[#0a1c33]/90 hover:bg-[#12365C] border border-[#12365C] rounded-lg px-3 py-1.5 text-xs text-slate-200 flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Buka Legenda Peta</span>
            </button>
          )}
        </div>

        {/* Floating Slide-over Details Drawer */}
        {selectedIncidentForDrawer && (
          <div className="absolute top-16 right-3 bottom-3 z-10 w-80 sm:w-96 bg-[#0a1c33]/95 border border-[#12365C] rounded-2xl shadow-2xl backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono-numbers text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {selectedIncidentForDrawer.incident_id}
                </span>
                <button
                  onClick={() => setSelectedIncidentForDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded uppercase mr-1.5">
                  Terverifikasi
                </span>
                <span
                  className="inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: `${getSeverityColor(selectedIncidentForDrawer.severity)}20`,
                    color: getSeverityColor(selectedIncidentForDrawer.severity),
                    border: `1px solid ${getSeverityColor(selectedIncidentForDrawer.severity)}50`,
                  }}
                >
                  {selectedIncidentForDrawer.severity} • {selectedIncidentForDrawer.disaster_type}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight mt-1.5">
                  {selectedIncidentForDrawer.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {selectedIncidentForDrawer.regency}, {selectedIncidentForDrawer.province}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#071426] p-2.5 rounded-xl border border-[#12365C]">
                <div>
                  <div className="text-[10px] text-slate-400">Korban Terdampak:</div>
                  <div className="text-sm font-bold text-white font-mono-numbers">
                    {selectedIncidentForDrawer.affected_population.toLocaleString('id-ID')} jiwa
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Pengungsi:</div>
                  <div className="text-sm font-bold text-amber-400 font-mono-numbers">
                    {selectedIncidentForDrawer.displaced_population.toLocaleString('id-ID')} jiwa
                  </div>
                </div>
              </div>

              {selectedIncidentForDrawer.linked_report_ids &&
                selectedIncidentForDrawer.linked_report_ids.length > 0 && (
                  <div className="p-2.5 bg-[#071426] rounded-xl border border-[#12365C]">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Laporan Sumber Terhubung ({selectedIncidentForDrawer.linked_report_ids.length})
                    </span>
                    <div className="flex flex-wrap gap-1 font-mono-numbers text-[10px]">
                      {selectedIncidentForDrawer.linked_report_ids.map((rid) => (
                        <span key={rid} className="bg-[#0a1c33] text-slate-300 px-1.5 py-0.5 rounded border border-[#12365C]">
                          {rid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-3 mt-3 border-t border-[#12365C] flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Lat: {selectedIncidentForDrawer.latitude.toFixed(2)} | Lng: {selectedIncidentForDrawer.longitude.toFixed(2)}
              </span>
              <button
                onClick={() => setActiveIncident(selectedIncidentForDrawer)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Detail Penuh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Slide-over Details Drawer for Unverified Report */}
        {selectedReportForDrawer && (
          <div className="absolute top-16 right-3 bottom-3 z-10 w-80 sm:w-96 bg-[#0a1c33]/95 border border-amber-500/40 rounded-2xl shadow-2xl backdrop-blur-md p-4 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono-numbers text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {selectedReportForDrawer.report_id}
                </span>
                <button
                  onClick={() => setSelectedReportForDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded uppercase mr-1.5">
                  Laporan Belum Diverifikasi
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-2 py-0.5 rounded border border-[#12365C]">
                  {selectedReportForDrawer.disaster_type}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight mt-1.5">
                  {selectedReportForDrawer.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {selectedReportForDrawer.village}, {selectedReportForDrawer.regency}
                </p>
              </div>

              <div className="bg-[#071426] p-2.5 rounded-xl border border-[#12365C] text-xs text-slate-300 space-y-1">
                <div>Pelapor: <strong>{selectedReportForDrawer.reporter_name}</strong></div>
                <div>Kategori: {selectedReportForDrawer.reporter_type.replace('_', ' ')}</div>
                <div>Estimasi Terdampak: <span className="font-mono-numbers text-cyan-300">{selectedReportForDrawer.estimated_affected.toLocaleString('id-ID')} jiwa</span></div>
              </div>

              <p className="text-xs text-slate-300 bg-[#071426]/70 p-2.5 rounded-lg border border-[#12365C] line-clamp-3">
                {selectedReportForDrawer.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[#12365C] flex items-center justify-between gap-2">
              <span className="text-[10px] text-amber-400 font-mono-numbers">
                Menunggu Verifikator
              </span>
              <button
                onClick={() => {
                  setActiveReport(selectedReportForDrawer);
                  setActiveTab('verification-center');
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Buka di Pusat Verifikasi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
