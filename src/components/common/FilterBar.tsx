import React from 'react';
import {
  Filter,
  RotateCcw,
  Download,
  Calendar,
  AlertCircle,
  MapPin,
  Flame,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DisasterType, SeverityLevel, VerificationStatus, ResponseStatus } from '../../types/disaster';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    incidents,
    filteredIncidents,
    exportDataAsCSV,
    exportDataAsJSON,
  } = useDisaster();

  // Extract unique provinces available in dataset, sorted alphabetically
  const provinces = Array.from(new Set(incidents.map((i) => i.province))).sort();

  const disasterTypes: DisasterType[] = [
    'Banjir',
    'Gempa Bumi',
    'Tanah Longsor',
    'Erupsi Gunung Api',
    'Kebakaran Hutan & Lahan',
    'Cuaca Ekstrem',
    'Tsunami',
  ];

  const severities: SeverityLevel[] = ['Kritis', 'Tinggi', 'Sedang', 'Rendah'];

  const verificationStatuses: VerificationStatus[] = [
    'Belum Diverifikasi',
    'Dalam Verifikasi',
    'Terverifikasi',
    'Tidak Valid',
  ];

  const responseStatuses: ResponseStatus[] = [
    'Belum Ditangani',
    'Siaga / Assessment',
    'Respons Aktif',
    'Penanganan Lanjutan',
    'Selesai',
  ];

  const isFilterActive =
    filters.province !== 'all' ||
    filters.disasterType !== 'all' ||
    filters.severity !== 'all' ||
    filters.verificationStatus !== 'all' ||
    filters.responseStatus !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-[#0a1c33]/90 border border-[#12365C] rounded-xl p-3 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-[#12365C]/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Filter Operasional Terpadu
          </span>
          <span className="text-xs text-slate-400 font-mono-numbers ml-1">
            (Menampilkan <strong className="text-cyan-300 font-bold">{filteredIncidents.length}</strong> dari {incidents.length} data insiden)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          )}

          {/* Export Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportDataAsCSV}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-[#071426] hover:bg-[#12365C] border border-[#12365C] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Unduh Data Terfilter dalam format CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportDataAsJSON}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-[#071426] hover:bg-[#12365C] border border-[#12365C] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Unduh Data Terfilter dalam format GeoJSON / JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selectors grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Province Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Wilayah / Provinsi
          </label>
          <div className="relative">
            <select
              value={filters.province}
              onChange={(e) => setFilters({ province: e.target.value })}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Provinsi (Nasional)</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Disaster Type Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Jenis Bencana
          </label>
          <select
            value={filters.disasterType}
            onChange={(e) => setFilters({ disasterType: e.target.value })}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Jenis Bencana</option>
            {disasterTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tingkat Keparahan
          </label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ severity: e.target.value })}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Tingkat (Kritis - Rendah)</option>
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Rentang Waktu Laporan
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ dateRange: e.target.value as any })}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Riwayat (30 Hari)</option>
            <option value="24h">24 Jam Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Status Verifikasi
          </label>
          <select
            value={filters.verificationStatus}
            onChange={(e) => setFilters({ verificationStatus: e.target.value })}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status Verifikasi</option>
            {verificationStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Response Status */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Status Penanganan
          </label>
          <select
            value={filters.responseStatus}
            onChange={(e) => setFilters({ responseStatus: e.target.value })}
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 appearance-none focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status Tanggap</option>
            {responseStatuses.map((resp) => (
              <option key={resp} value={resp}>
                {resp}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
