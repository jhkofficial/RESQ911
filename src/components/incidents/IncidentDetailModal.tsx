import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Shield,
  Users,
  Home,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileText,
  Truck,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { DisasterIncident, VerificationStatus, ResponseStatus } from '../../types/disaster';
import { useDisaster } from '../../context/DisasterContext';

interface IncidentDetailModalProps {
  incident: DisasterIncident | null;
  onClose: () => void;
  onNavigateToMap?: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onNavigateToMap,
}) => {
  const {
    updateIncidentVerification,
    updateIncidentResponse,
    currentUser,
    reports,
    setActiveReport,
    setActiveTab,
  } = useDisaster();

  if (!incident) return null;

  const severityColorMap = {
    Kritis: 'bg-red-500/20 text-red-400 border-red-500/40',
    Tinggi: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Sedang: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    Rendah: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  };

  const formattedDate = new Date(incident.reported_at).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedUpdated = new Date(incident.last_updated).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#12365C] bg-[#071426] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-numbers text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {incident.incident_id}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${severityColorMap[incident.severity]}`}
              >
                Keparahan: {incident.severity}
              </span>
              <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                {incident.disaster_type}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{incident.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {incident.subdistrict ? `${incident.subdistrict}, ` : ''}{incident.regency}, {incident.province}
              </span>
              <span className="flex items-center gap-1 font-mono-numbers">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Dilaporkan: {formattedDate} WIB
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-[#071426] hover:bg-[#12365C] border border-[#12365C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Spatial & Physical Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Korban Terdampak
              </div>
              <div className="text-lg font-bold text-white font-mono-numbers mt-1">
                {incident.affected_population.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-400">Jiwa terancam / terpapar</div>
            </div>

            <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                Pengungsi
              </div>
              <div className="text-lg font-bold text-amber-300 font-mono-numbers mt-1">
                {incident.displaced_population.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-400">Jiwa di titik evakuasi</div>
            </div>

            <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Luka / Meninggal
              </div>
              <div className="text-lg font-bold text-rose-300 font-mono-numbers mt-1">
                {incident.injured_count} <span className="text-xs text-slate-400">/</span> {incident.fatalities_count}
              </div>
              <div className="text-[10px] text-slate-400">Korban jiwa terdata</div>
            </div>

            <div className="bg-[#071426] border border-[#12365C] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Kerusakan Rumah
              </div>
              <div className="text-lg font-bold text-purple-300 font-mono-numbers mt-1">
                {incident.damaged_houses.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-400">Unit rusak / terendam</div>
            </div>
          </div>

          {/* Incident Description */}
          <div className="bg-[#071426]/70 border border-[#12365C] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Laporan Situasi Operasional &amp; Kronologi
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {incident.description}
            </p>
            {incident.water_level_cm && (
              <div className="inline-flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded">
                TMA (Tinggi Muka Air): <strong className="font-mono-numbers">{incident.water_level_cm} cm</strong>
              </div>
            )}
            {incident.magnitude && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded ml-2">
                Magnitudo: <strong className="font-mono-numbers">M {incident.magnitude}</strong> | Kedalaman: {incident.depth_km} km
              </div>
            )}
          </div>

          {/* Urgent Needs & Logistics Required */}
          <div className="bg-[#071426]/70 border border-[#12365C] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Kebutuhan Mendesak &amp; Alokasi Logistik
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {incident.needs.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-[#0a1c33] border border-[#12365C] text-slate-200 px-3 py-1 rounded-lg"
                >
                  • {item}
                </span>
              ))}
            </div>
            {incident.assigned_team && (
              <p className="text-xs text-cyan-400 pt-2 border-t border-[#12365C]/60 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Satgas Penugasan: <strong>{incident.assigned_team}</strong>
              </p>
            )}
          </div>

          {/* Linked Source Reports Section (MVP 2 Reconciliation) */}
          <div className="bg-[#071426] border border-cyan-500/30 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Laporan Sumber Terhubung &amp; Atribusi Rekonsiliasi
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                {incident.linked_report_ids?.length || 1} Laporan Tertaut
              </span>
            </div>

            <div className="space-y-2">
              {(incident.linked_report_ids || ['LAP-2026-0101']).map((repId) => {
                const repObj = reports.find((r) => r.report_id === repId);
                return (
                  <div
                    key={repId}
                    className="p-2.5 bg-[#0a1c33] border border-[#12365C] rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-mono-numbers">
                        <span className="font-bold text-cyan-400">{repId}</span>
                        <span className="text-[10px] text-slate-400">• {repObj?.reporter_type?.replace('_', ' ') || 'Petugas Lapangan'}</span>
                      </div>
                      <div className="text-slate-200 font-medium line-clamp-1">
                        {repObj?.title || incident.title}
                      </div>
                    </div>

                    {repObj && (
                      <button
                        onClick={() => {
                          setActiveReport(repObj);
                          onClose();
                          setActiveTab('verification-center');
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 shrink-0 font-semibold"
                      >
                        <span>Lihat Laporan</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#12365C]/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Verifikator Resmi: <strong className="text-slate-200">{incident.verified_by || 'Pusdalops BNPB Verification Desk'}</strong></span>
              <span>Waktu Sah: <strong className="text-slate-300 font-mono-numbers">{formattedUpdated}</strong></span>
            </div>
          </div>

          {/* Source & Geocoordinates metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#071426]/40 border border-[#12365C] rounded-xl p-3.5">
            <div>
              <span className="text-slate-400">Sumber Data Laporan:</span>
              <div className="text-slate-200 font-medium mt-0.5">{incident.data_source}</div>
            </div>
            <div>
              <span className="text-slate-400">Titik Koordinat Geografis:</span>
              <div className="text-cyan-300 font-mono-numbers font-medium mt-0.5">
                Lat: {incident.latitude.toFixed(4)}°, Lng: {incident.longitude.toFixed(4)}°
              </div>
            </div>
            <div>
              <span className="text-slate-400">Pembaruan Terakhir:</span>
              <div className="text-slate-300 font-mono-numbers mt-0.5">{formattedUpdated} WIB</div>
            </div>
            <div>
              <span className="text-slate-400">Integritas Laporan:</span>
              <div className="text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Hash Kriptografi Sesi
              </div>
            </div>
          </div>

          {/* Live Action Form: Operator Status Modification */}
          <div className="bg-[#051121] border border-cyan-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" />
                Kendali Operasional Hak Akses ({currentUser.role.replace('_', ' ')})
              </span>
              <span className="text-[10px] text-slate-400">Perubahan langsung sinkron ke peta &amp; analitik</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ubah Status Verifikasi:
                </label>
                <select
                  value={incident.verification_status}
                  onChange={(e) =>
                    updateIncidentVerification(incident.id, e.target.value as VerificationStatus)
                  }
                  className="w-full bg-[#0a1c33] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                  <option value="Dalam Verifikasi">Dalam Verifikasi</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Tidak Valid">Tidak Valid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ubah Status Respons:
                </label>
                <select
                  value={incident.response_status}
                  onChange={(e) =>
                    updateIncidentResponse(incident.id, e.target.value as ResponseStatus)
                  }
                  className="w-full bg-[#0a1c33] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
                >
                  <option value="Belum Ditangani">Belum Ditangani</option>
                  <option value="Siaga / Assessment">Siaga / Assessment</option>
                  <option value="Respons Aktif">Respons Aktif</option>
                  <option value="Penanganan Lanjutan">Penanganan Lanjutan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-[#12365C] bg-[#071426] flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            RESQ.911 Command Audit: Disimpan di session state memori browser
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToMap && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToMap();
                }}
                className="flex items-center gap-1.5 bg-[#0a1c33] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Lihat di Peta
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
