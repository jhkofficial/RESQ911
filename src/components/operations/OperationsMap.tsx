import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Compass,
  Layers,
  MapPin,
  Shield,
  Truck,
  Users,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckSquare,
  Square,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { ResponseMission, SimulatedTeam, ResourceInventory, MissionEscalation } from '../../types/operations';

export const OperationsMap: React.FC = () => {
  const {
    missions,
    teams,
    inventory,
    escalations,
    incidents,
    currentUser,
    setActiveTab
  } = useDisaster();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const missionsLayerRef = useRef<L.LayerGroup | null>(null);
  const teamsLayerRef = useRef<L.LayerGroup | null>(null);
  const warehousesLayerRef = useRef<L.LayerGroup | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const escalationsLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer visibility toggles
  const [layers, setLayers] = useState({
    showMissions: true,
    showTeams: true,
    showWarehouses: true,
    showIncidents: true,
    showEscalations: true
  });

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'mission' | 'team' | 'warehouse' | 'escalation';
    data: any;
  } | null>(null);

  // Preset tactical focus sectors
  const tacticalSectors = [
    { name: 'Sektor Demak-Kudus (Banjir Tanggul)', center: [-6.8921, 110.7421] as [number, number], zoom: 11 },
    { name: 'Sektor Cianjur (Gempa Cugenang)', center: [-6.8122, 107.0892] as [number, number], zoom: 12 },
    { name: 'Sektor Cisarua Puncak (Longsor)', center: [-6.6991, 106.9602] as [number, number], zoom: 12 },
    { name: 'Sektor Maros (Cuaca Ekstrem)', center: [-5.0041, 119.5742] as [number, number], zoom: 11 },
    { name: 'Nasional NKRI', center: [-2.5, 118.0] as [number, number], zoom: 5 }
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-6.8921, 110.7421],
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      missionsLayerRef.current = L.layerGroup().addTo(map);
      teamsLayerRef.current = L.layerGroup().addTo(map);
      warehousesLayerRef.current = L.layerGroup().addTo(map);
      incidentsLayerRef.current = L.layerGroup().addTo(map);
      escalationsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Layers & Markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 1. Missions Layer
    if (missionsLayerRef.current) {
      missionsLayerRef.current.clearLayers();
      if (layers.showMissions) {
        missions.forEach((m) => {
          const icon = L.divIcon({
            className: 'custom-mission-marker',
            html: `
              <div style="
                background: rgba(0, 200, 248, 0.25);
                border: 2px solid #00C8F8;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(0, 200, 248, 0.6);
                cursor: pointer;
              ">
                <div style="background: #00C8F8; width: 12px; height: 12px; border-radius: 50%;"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([m.latitude, m.longitude], { icon });
          marker.on('click', () => {
            setSelectedEntity({ type: 'mission', data: m });
          });
          missionsLayerRef.current?.addLayer(marker);
        });
      }
    }

    // 2. Teams Layer
    if (teamsLayerRef.current) {
      teamsLayerRef.current.clearLayers();
      if (layers.showTeams) {
        teams.forEach((t) => {
          const icon = L.divIcon({
            className: 'custom-team-marker',
            html: `
              <div style="
                background: ${t.availability === 'Assigned' ? '#12365C' : '#072b22'};
                border: 2px solid ${t.availability === 'Assigned' ? '#38bdf8' : '#34d399'};
                width: 28px;
                height: 28px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 11px;
                font-weight: bold;
                box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
                cursor: pointer;
              ">
                TRC
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([t.base_coordinates.lat, t.base_coordinates.lng], { icon });
          marker.on('click', () => {
            setSelectedEntity({ type: 'team', data: t });
          });
          teamsLayerRef.current?.addLayer(marker);
        });
      }
    }

    // 3. Warehouses / Depots Layer
    if (warehousesLayerRef.current) {
      warehousesLayerRef.current.clearLayers();
      if (layers.showWarehouses) {
        const warehousePoints = [
          { name: 'Depo Regional BNPB Semarang', lat: -6.9750, lng: 110.4200, items: 12 },
          { name: 'Gudang Logistik BPBD Bandung', lat: -6.9147, lng: 107.6098, items: 8 },
          { name: 'Pusat Logistik PMI Surakarta', lat: -7.5666, lng: 110.8166, items: 10 },
          { name: 'Pusdalops BNPB Jakarta', lat: -6.2200, lng: 106.8600, items: 15 },
          { name: 'Depo Makassar Sulsel', lat: -5.1476, lng: 119.4327, items: 5 }
        ];

        warehousePoints.forEach((wh) => {
          const icon = L.divIcon({
            className: 'custom-wh-marker',
            html: `
              <div style="
                background: rgba(16, 185, 129, 0.25);
                border: 2px solid #10b981;
                width: 26px;
                height: 26px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #34d399;
                font-size: 11px;
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                cursor: pointer;
              ">
                📦
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const marker = L.marker([wh.lat, wh.lng], { icon });
          marker.on('click', () => {
            setSelectedEntity({ type: 'warehouse', data: wh });
          });
          warehousesLayerRef.current?.addLayer(marker);
        });
      }
    }

    // 4. Escalations / Bottlenecks Layer
    if (escalationsLayerRef.current) {
      escalationsLayerRef.current.clearLayers();
      if (layers.showEscalations) {
        escalations.filter((e) => e.status !== 'Resolved').forEach((esc, idx) => {
          // Approximate around Demak / Cianjur
          const lat = -6.8950 + (idx * 0.015);
          const lng = 110.7300 + (idx * 0.012);

          const icon = L.divIcon({
            className: 'custom-esc-marker',
            html: `
              <div style="
                background: rgba(239, 68, 68, 0.3);
                border: 2px solid #ef4444;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #f87171;
                font-size: 13px;
                font-weight: bold;
                animation: pulse 1.5s infinite;
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
                cursor: pointer;
              ">
                ⚠️
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([lat, lng], { icon });
          marker.on('click', () => {
            setSelectedEntity({ type: 'escalation', data: esc });
          });
          escalationsLayerRef.current?.addLayer(marker);
        });
      }
    }
  }, [missions, teams, inventory, escalations, layers]);

  const jumpTo = (center: [number, number], zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>PETA OPERASIONAL TANGGAP DARURAT (SIMULASI):</strong> Menampilkan sebaran spasial posisi misi, pangkalan satgas tim reaksi cepat, depo logistik, dan hambatan jalur.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          OPERATOR: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header & Quick Sector Jumps */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Peta Geospasial Operasi (Operations Map)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Integrasi visual koordinat pengerahan armada satgas, titik posko aju, dan hambatan rute darurat.
          </p>
        </div>

        {/* Tactical Sector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tacticalSectors.map((sector) => (
            <button
              key={sector.name}
              onClick={() => jumpTo(sector.center, sector.zoom)}
              className="px-2.5 py-1.5 rounded-xl bg-[#0a1c33] hover:bg-[#12365C] border border-[#12365C] text-slate-300 hover:text-white text-[11px] font-semibold shrink-0 transition-all cursor-pointer"
            >
              {sector.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container with Overlay Controls */}
      <div className="relative rounded-3xl overflow-hidden border border-[#12365C] shadow-2xl h-[620px] bg-[#071426]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Layer Controls */}
        <div className="absolute top-4 left-4 z-20 bg-[#0a1c33]/95 border border-[#12365C] rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-2 max-w-xs text-xs">
          <span className="font-bold text-white uppercase text-[10px] tracking-wider block flex items-center gap-1.5 border-b border-[#12365C] pb-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Layer Lapisan Operasi:
          </span>

          <div
            onClick={() => setLayers({ ...layers, showMissions: !layers.showMissions })}
            className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
          >
            {layers.showMissions ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00C8F8]" />
              Posko Misi ({missions.length})
            </span>
          </div>

          <div
            onClick={() => setLayers({ ...layers, showTeams: !layers.showTeams })}
            className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
          >
            {layers.showTeams ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-400" />
              Pangkalan Satgas ({teams.length})
            </span>
          </div>

          <div
            onClick={() => setLayers({ ...layers, showWarehouses: !layers.showWarehouses })}
            className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
          >
            {layers.showWarehouses ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              Gudang &amp; Depo Logistik
            </span>
          </div>

          <div
            onClick={() => setLayers({ ...layers, showEscalations: !layers.showEscalations })}
            className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white"
          >
            {layers.showEscalations ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              Hambatan / Titik Tertahan ({escalations.filter((e) => e.status !== 'Resolved').length})
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded-xl bg-[#0a1c33]/90 hover:bg-[#12365C] border border-[#12365C] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded-xl bg-[#0a1c33]/90 hover:bg-[#12365C] border border-[#12365C] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Entity Card Drawer */}
        {selectedEntity && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-[#0a1c33]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-2">
              <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider">
                {selectedEntity.type === 'mission' && 'Detail Misi Operasional'}
                {selectedEntity.type === 'team' && 'Pangkalan Satgas Tim'}
                {selectedEntity.type === 'warehouse' && 'Depo Logistik Regional'}
                {selectedEntity.type === 'escalation' && 'Peringatan Hambatan Jalur'}
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedEntity.type === 'mission' && (
              <div className="space-y-1.5">
                <div className="font-bold text-white text-sm">
                  {selectedEntity.data.title}
                </div>
                <p className="text-slate-300 line-clamp-2">
                  {selectedEntity.data.objective}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Prioritas: <strong className="text-red-400">{selectedEntity.data.priority}</strong></span>
                  <span>Progres: <strong className="text-cyan-300">{selectedEntity.data.progress_percentage}%</strong></span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'team' && (
              <div className="space-y-1.5">
                <div className="font-bold text-white text-sm">
                  {selectedEntity.data.team_name}
                </div>
                <p className="text-cyan-300 font-medium">
                  {selectedEntity.data.institution} • {selectedEntity.data.region}
                </p>
                <div className="text-[11px] text-slate-400">
                  Komandan: {selectedEntity.data.team_leader} ({selectedEntity.data.members_count} personel)
                </div>
                <div className="text-[10px] text-slate-500">
                  Status Kesiapan: <strong className="text-emerald-400">{selectedEntity.data.availability}</strong>
                </div>
              </div>
            )}

            {selectedEntity.type === 'warehouse' && (
              <div className="space-y-1.5">
                <div className="font-bold text-white text-sm">
                  {selectedEntity.data.name}
                </div>
                <p className="text-slate-300">
                  Fasilitas penyimpanan logistik strategis dengan stok terintegrasi ke sistem RESQ.911.
                </p>
              </div>
            )}

            {selectedEntity.type === 'escalation' && (
              <div className="space-y-1.5">
                <div className="font-bold text-red-400 text-sm flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>{selectedEntity.data.category}</span>
                </div>
                <p className="text-slate-200">
                  {selectedEntity.data.description}
                </p>
                <div className="text-[10px] text-slate-400">
                  Pelapor: {selectedEntity.data.raised_by}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
