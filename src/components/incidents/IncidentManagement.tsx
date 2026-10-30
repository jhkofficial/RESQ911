import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Eye,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DisasterIncident, VerificationStatus, ResponseStatus } from '../../types/disaster';
import { FilterBar } from '../common/FilterBar';

export const IncidentManagement: React.FC<{ onOpenNewModal: () => void }> = ({ onOpenNewModal }) => {
  const {
    filteredIncidents,
    setActiveIncident,
    setActiveTab,
    updateIncidentVerification,
    updateIncidentResponse,
    exportDataAsCSV,
    exportDataAsJSON,
    currentUser,
  } = useDisaster();

  // Sorting state
  const [sortField, setSortField] = useState<keyof DisasterIncident>('reported_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sorting handler
  const handleSort = (field: keyof DisasterIncident) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comp = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? comp : -comp;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredIncidents, sortField, sortOrder]);

  // Paginated slice
  const totalPages = Math.ceil(sortedIncidents.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedIncidents.slice(start, start + pageSize);
  }, [sortedIncidents, currentPage, pageSize]);

  const severityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'Kritis':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Tinggi':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Sedang':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Rendah':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Universal Filter Bar */}
      <FilterBar />

      {/* Table Action Bar */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Daftar Insiden Bencana &amp; Tindakan Tanggap Darurat
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola, verifikasi, dan koordinasikan respons bencana seluruh Indonesia
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Laporan Baru</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#12365C]">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#071426] text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-[#12365C]">
              <tr>
                <th
                  onClick={() => handleSort('incident_id')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    ID &amp; Tanggal
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('disaster_type')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Jenis &amp; Peristiwa
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('province')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Wilayah / Lokasi
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('severity')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Keparahan
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('affected_population')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Terdampak / Pengungsi
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Status Verifikasi</th>
                <th className="py-3 px-3">Status Respons</th>
                <th className="py-3 px-3 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60 bg-[#0a1c33]">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-amber-400" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada data insiden yang cocok dengan filter saat ini.
                      </p>
                      <p className="text-xs text-slate-500">
                        Coba ubah kata kunci pencarian atau reset filter provinsi dan kategori.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((incident) => {
                  const dateStr = new Date(incident.reported_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-[#071426]/70 transition-colors group"
                    >
                      {/* ID & Date */}
                      <td className="py-3 px-3">
                        <span className="font-mono-numbers font-bold text-cyan-400 block">
                          {incident.incident_id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono-numbers">{dateStr}</span>
                      </td>

                      {/* Disaster type & title */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-1.5 py-0.5 rounded border border-[#12365C] inline-block mb-1">
                          {incident.disaster_type}
                        </span>
                        <div className="font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {incident.title}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{incident.regency}</div>
                        <div className="text-[10px] text-slate-400">{incident.province}</div>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase ${severityBadgeClass(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      {/* Affected / Displaced */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono-numbers">
                        <div className="text-slate-200 font-semibold">
                          {incident.affected_population.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">jiwa</span>
                        </div>
                        <div className="text-amber-400 text-[11px]">
                          {incident.displaced_population.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] text-amber-400/70 font-normal">mengungsi</span>
                        </div>
                      </td>

                      {/* Quick Verification Selector */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={incident.verification_status}
                          onChange={(e) =>
                            updateIncidentVerification(incident.id, e.target.value as VerificationStatus)
                          }
                          className={`text-xs rounded-lg px-2 py-1 font-semibold border cursor-pointer focus:outline-none ${
                            incident.verification_status === 'Terverifikasi'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : incident.verification_status === 'Dalam Verifikasi'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : incident.verification_status === 'Belum Diverifikasi'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                          <option value="Dalam Verifikasi">Dalam Verifikasi</option>
                          <option value="Terverifikasi">Terverifikasi</option>
                          <option value="Tidak Valid">Tidak Valid</option>
                        </select>
                      </td>

                      {/* Quick Response Status Selector */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={incident.response_status}
                          onChange={(e) =>
                            updateIncidentResponse(incident.id, e.target.value as ResponseStatus)
                          }
                          className="text-xs bg-[#071426] border border-[#12365C] text-slate-200 rounded-lg px-2 py-1 font-medium cursor-pointer focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Belum Ditangani">Belum Ditangani</option>
                          <option value="Siaga / Assessment">Siaga / Assessment</option>
                          <option value="Respons Aktif">Respons Aktif</option>
                          <option value="Penanganan Lanjutan">Penanganan Lanjutan</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveIncident(incident);
                              setActiveTab('map');
                            }}
                            className="p-1.5 rounded-lg bg-[#071426] hover:bg-[#12365C] text-cyan-400 hover:text-cyan-300 border border-[#12365C] transition-colors cursor-pointer"
                            title="Tampilkan di Peta Spasial"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveIncident(incident)}
                            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rincian</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#12365C]">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sortedIncidents.length)} dari {sortedIncidents.length} entri
            </span>
            <div className="flex items-center gap-1">
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#071426] border border-[#12365C] rounded px-1.5 py-0.5 text-xs text-slate-200 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-[#071426] border border-[#12365C] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-300 font-mono-numbers px-2">
              Halaman <strong>{currentPage}</strong> dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-[#071426] border border-[#12365C] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
