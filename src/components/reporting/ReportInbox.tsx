import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Plus,
  Layers,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { IncidentReport, ReportVerificationStatus, DisasterType, ReporterType } from '../../types/disaster';

export const ReportInbox: React.FC = () => {
  const {
    reports,
    filteredReports,
    reportFilters,
    setReportFilters,
    resetReportFilters,
    reportStats,
    setActiveReport,
    setActiveTab,
    exportReportsAsCSV,
  } = useDisaster();

  // Sorting
  const [sortField, setSortField] = useState<keyof IncidentReport>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const provinces = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.province))).sort();
  }, [reports]);

  const handleSort = (field: keyof IncidentReport) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
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
  }, [filteredReports, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedReports.slice(start, start + pageSize);
  }, [sortedReports, currentPage, pageSize]);

  const getStatusBadge = (status: ReportVerificationStatus) => {
    switch (status) {
      case 'Terverifikasi':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      case 'Belum Diverifikasi':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'Dalam Verifikasi':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      case 'Perlu Klarifikasi':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      case 'Ditolak':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      case 'Duplikat':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* 7 Interactive KPI Cards for Reports */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div
          onClick={() => setReportFilters({ verificationStatus: 'all' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Total Laporan</span>
            <Inbox className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono-numbers mt-1">
            {reportStats.totalReports}
          </div>
          <div className="text-[10px] text-cyan-300">Semua Kanal</div>
        </div>

        <div
          onClick={() => setReportFilters({ verificationStatus: 'Belum Diverifikasi' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-amber-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Menunggu Verifikasi</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono-numbers mt-1">
            {reportStats.pendingVerification}
          </div>
          <div className="text-[10px] text-slate-400">Antrean Verifikator</div>
        </div>

        <div
          onClick={() => setReportFilters({ verificationStatus: 'Dalam Verifikasi' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Dalam Asesmen</span>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono-numbers mt-1">
            {reportStats.pendingValidation}
          </div>
          <div className="text-[10px] text-slate-400">Sedang Ditelaah</div>
        </div>

        <div
          onClick={() => setReportFilters({ hasDuplicateFlag: 'yes' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-orange-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Potensi Duplikasi</span>
            <Copy className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-orange-300 font-mono-numbers mt-1">
            {reportStats.potentialDuplicates}
          </div>
          <div className="text-[10px] text-slate-400">Kemiripan Spasial</div>
        </div>

        <div
          onClick={() => setReportFilters({ verificationStatus: 'Terverifikasi' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-emerald-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Terverifikasi</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-numbers mt-1">
            {reportStats.verifiedReports}
          </div>
          <div className="text-[10px] text-slate-400">Insiden Resmi</div>
        </div>

        <div
          onClick={() => setReportFilters({ verificationStatus: 'Perlu Klarifikasi' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-purple-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Klarifikasi</span>
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono-numbers mt-1">
            {reportStats.clarificationRequired}
          </div>
          <div className="text-[10px] text-slate-400">Butuh Informasi</div>
        </div>

        <div
          onClick={() => setReportFilters({ verificationStatus: 'Ditolak' })}
          className="bg-[#0a1c33] border border-[#12365C] hover:border-rose-400/40 p-3 rounded-xl cursor-pointer transition-all"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Ditolak / Invalid</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono-numbers mt-1">
            {reportStats.rejectedReports}
          </div>
          <div className="text-[10px] text-slate-400">Tidak Memenuhi</div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-5 h-5 text-cyan-400" />
              Kotak Masuk Laporan Kejadian (Incident Report Inbox)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar seluruh masukan laporan bencana dari lapangan sebelum ditautkan ke insiden terverifikasi
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setActiveTab('new-report')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Laporan Baru</span>
            </button>
            <button
              onClick={exportReportsAsCSV}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-[#071426] border border-[#12365C] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Ekspor Seluruh Kotak Masuk Laporan ke CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-[#12365C]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Judul, Pelapor..."
              value={reportFilters.searchQuery}
              onChange={(e) => setReportFilters({ searchQuery: e.target.value })}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={reportFilters.province}
              onChange={(e) => setReportFilters({ province: e.target.value })}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Provinsi</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={reportFilters.disasterType}
              onChange={(e) => setReportFilters({ disasterType: e.target.value })}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Jenis Bencana</option>
              <option value="Banjir">Banjir</option>
              <option value="Gempa Bumi">Gempa Bumi</option>
              <option value="Tanah Longsor">Tanah Longsor</option>
              <option value="Erupsi Gunung Api">Erupsi Gunung Api</option>
              <option value="Kebakaran Hutan & Lahan">Kebakaran Hutan & Lahan</option>
              <option value="Cuaca Ekstrem">Cuaca Ekstrem</option>
              <option value="Tsunami">Tsunami</option>
            </select>
          </div>

          <div>
            <select
              value={reportFilters.verificationStatus}
              onChange={(e) => setReportFilters({ verificationStatus: e.target.value })}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status Verifikasi</option>
              <option value="Belum Diverifikasi">Belum Diverifikasi</option>
              <option value="Dalam Verifikasi">Dalam Verifikasi</option>
              <option value="Terverifikasi">Terverifikasi</option>
              <option value="Perlu Klarifikasi">Perlu Klarifikasi</option>
              <option value="Duplikat">Duplikat</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={reportFilters.hasDuplicateFlag}
              onChange={(e) => setReportFilters({ hasDuplicateFlag: e.target.value as any })}
              className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Flag Duplikasi</option>
              <option value="yes">Hanya Terindikasi Duplikat</option>
              <option value="no">Bukan Duplikat</option>
            </select>
            <button
              onClick={resetReportFilters}
              className="bg-[#071426] hover:bg-[#12365C] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs border border-[#12365C] transition-colors cursor-pointer shrink-0"
              title="Reset Filter"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#12365C]">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-[#071426] text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-[#12365C]">
              <tr>
                <th
                  onClick={() => handleSort('report_id')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    ID Laporan
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('disaster_type')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Bencana &amp; Judul
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('province')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Lokasi Wilayah
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Waktu Lapor
                    <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Pelapor</th>
                <th className="py-3 px-3 whitespace-nowrap">Status Verifikasi</th>
                <th className="py-3 px-3 whitespace-nowrap">Flag Duplikasi</th>
                <th className="py-3 px-3 whitespace-nowrap">Urgensi</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60 bg-[#0a1c33]">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="w-8 h-8 text-cyan-400" />
                      <p className="text-sm font-semibold text-slate-300">
                        Tidak ada laporan yang sesuai kriteria filter saat ini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => {
                  const dateStr = new Date(report.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-[#071426]/70 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3 px-3 font-mono-numbers font-bold text-cyan-400 whitespace-nowrap">
                        {report.report_id}
                        {report.incident_candidate_id && (
                          <span className="block text-[9px] text-emerald-400 font-mono-numbers">
                            ↳ {report.incident_candidate_id}
                          </span>
                        )}
                      </td>

                      {/* Disaster Type & Title */}
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-[10px] font-bold text-slate-300 bg-[#071426] px-1.5 py-0.5 rounded border border-[#12365C] inline-block mb-1">
                          {report.disaster_type}
                        </span>
                        <div className="font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {report.title}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{report.regency}</div>
                        <div className="text-[10px] text-slate-400">
                          {report.subdistrict}, {report.province}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-mono-numbers text-[11px]">
                        {dateStr}
                      </td>

                      {/* Reporter */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{report.reporter_name}</div>
                        <div className="text-[10px] text-cyan-400">
                          {report.reporter_type.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                            report.verification_status
                          )}`}
                        >
                          {report.verification_status}
                        </span>
                      </td>

                      {/* Duplicate Flag */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {report.potential_duplicate ? (
                          <span
                            onClick={() => setActiveTab('duplicate-detection')}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-500/40 px-2 py-0.5 rounded cursor-pointer hover:bg-orange-900/60"
                            title={`Potensi kesamaan dengan ${report.duplicate_matched_id || 'laporan lain'}`}
                          >
                            <Copy className="w-3 h-3" />
                            {report.similarity_score ? `${Math.round(report.similarity_score * 100)}%` : 'Duplikat'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">Unik</span>
                        )}
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            report.urgency === 'Kritis'
                              ? 'text-red-400 bg-red-950/60'
                              : report.urgency === 'Tinggi'
                              ? 'text-orange-400 bg-orange-950/60'
                              : report.urgency === 'Sedang'
                              ? 'text-amber-400 bg-amber-950/60'
                              : 'text-cyan-400 bg-cyan-950/60'
                          }`}
                        >
                          {report.urgency}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveReport(report);
                              setActiveTab('verification-center');
                            }}
                            className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Buka Lembar Verifikasi"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verifikasi</span>
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#12365C]">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, sortedReports.length)} dari {sortedReports.length} laporan
            </span>
            <div className="flex items-center gap-1">
              <span>Baris:</span>
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
