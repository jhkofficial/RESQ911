import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Calendar,
  Check,
  Shield,
  Layers,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';

export const ReportsModule: React.FC = () => {
  const { filteredIncidents, stats, currentUser, timeZone } = useDisaster();
  const [copied, setCopied] = useState(false);
  const [reportType, setReportType] = useState<'SITREP' | 'EXECUTIVE' | 'LOGISTICS'>('SITREP');

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const criticals = filteredIncidents.filter((i) => i.severity === 'Kritis' || i.severity === 'Tinggi');

  const generatedSitrepText = `================================================================================
LAPORAN SITUASI BENCANA NASIONAL (SITREP) — PUSDALOPS BNPB / RESQ.911
KLASIFIKASI: LAPORAN SITUASI DARURAT RESMI (DOKUMEN SIMULASI PROTOTIPE)
TANGGAL & WAKTU CETAK: ${currentDate} • ${timeZone}
PETUGAS PENGUSUL: ${currentUser.name} (${currentUser.role.replace('_', ' ')})
INSTANSI: ${currentUser.agency}
================================================================================

1. RINGKASAN EKSEKUTIF STATUS DARURAT NASIONAL:
- Total Peristiwa Bencana Terlaporkan : ${stats.totalIncidents} Kejadian
- Peristiwa Tanggap Darurat Aktif     : ${stats.activeIncidents} Titik
- Estimasi Korban Terdampak          : ${stats.affectedPopulation.toLocaleString('id-ID')} Jiwa
- Jumlah Pengungsi Terdata            : ${stats.displacedPopulation.toLocaleString('id-ID')} Jiwa
- Wilayah Tingkat Risiko Kritis/Tinggi: ${stats.highRiskRegionsCount} Provinsi
- Laporan Dalam Antrean Verifikasi   : ${stats.unverifiedCount} Laporan
- Satuan Tugas Beroperasi di Lapangan : ${stats.activeResponseCount} Satgas

2. DAFTAR PERISTIWA PRIORITAS TINGKAT KRITIS:
${criticals.slice(0, 5).map((inc, i) => `${i + 1}. [${inc.incident_id}] ${inc.title}
   - Wilayah    : ${inc.regency}, Provinsi ${inc.province}
   - Tipe/Status: ${inc.disaster_type} / ${inc.response_status}
   - Dampak     : ${inc.affected_population.toLocaleString('id-ID')} Jiwa (${inc.displaced_population.toLocaleString('id-ID')} Mengungsi)
   - Kebutuhan  : ${inc.needs.join(', ')}
   - Tim Satgas : ${inc.assigned_team || 'Dalam mobilisasi awal'}`).join('\n\n')}

3. INSTRUKSI & REKOMENDASI TINDAKAN OPERASIONAL (HUMAN-IN-THE-LOOP):
a. Pastikan pendistribusian air bersih, tenda keluarga, dan paket permakanan siap santap ke seluruh titik kantong pengungsian prioritas.
b. Pantau ketat jalur komunikasi darurat HF/VHF pada frekuensi koordinasi lintas kementerian dan lembaga SAR.
c. Seluruh pengerahan alat berat dan status tanggap darurat memerlukan SK Tanggap Darurat resmi dari Bupati/Walikota atau Gubernur setempat.

--------------------------------------------------------------------------------
DITERBITKAN OLEH: SISTEM RESQ.911 DISASTER INTELLIGENCE PLATFORM (SIMULASI)
CATATAN: Dokumen ini dibuat otomatis dari dataset simulasi untuk pengujian teknis operasional.
================================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSitrepText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SITREP_RESQ911_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Generator Laporan Situasi Bencana (SitRep &amp; Briefing Eksekutif)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Penyusunan otomatis laporan darurat berkala terstandarisasi format komando BNPB
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#071426] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin SitRep'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Laporan (.TXT)</span>
          </button>
        </div>
      </div>

      {/* Report Template Selector */}
      <div className="flex items-center gap-2 bg-[#0a1c33] p-1.5 rounded-xl border border-[#12365C] text-xs">
        <button
          onClick={() => setReportType('SITREP')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            reportType === 'SITREP' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Laporan Situasi Harian (SitRep PB)
        </button>
        <button
          onClick={() => setReportType('EXECUTIVE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            reportType === 'EXECUTIVE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Briefing Eksekutif Kepala Badan / Menteri
        </button>
      </div>

      {/* SitRep Text Viewer */}
      <div className="bg-[#071426] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#12365C]">
          <span className="text-xs font-mono-numbers text-cyan-400 font-bold">
            PRATINJAU DOKUMEN RESMI SITREP ELEKTRONIK
          </span>
          <span className="text-[11px] text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded font-mono-numbers">
            DOKUMEN SIMULASI MVP 1
          </span>
        </div>

        <pre className="font-mono-numbers text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
          {generatedSitrepText}
        </pre>
      </div>
    </div>
  );
};
