import React, { useState } from 'react';
import {
  Users,
  Truck,
  Shield,
  Radio,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  Send,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';

export const ResponseCoordination: React.FC = () => {
  const { filteredIncidents, currentUser, stats } = useDisaster();

  const [activeTeams, setActiveTeams] = useState([
    {
      id: 'team-1',
      name: 'Satgas TRC BNPB Unit Alpha',
      leader: 'Mayor Inf. Bambang W.',
      location: 'Kabupaten Demak, Jawa Tengah',
      assignedIncident: 'RSQ-2026-0888 (Banjir Tanggul Jebol Demak)',
      personnel: 24,
      equipment: ['4 Perahu Karet Bermesin', '2 Mobil Dapur Lapangan', '8 Pompa Alkon'],
      status: 'Operasi Aktif Lapangan',
      contact: 'HF 11.415 MHz / 0812-4455-xxxx',
    },
    {
      id: 'team-2',
      name: 'Tim SAR Gabungan Basarnas & BPBD Flotim',
      leader: 'Lettu Mar. Dedy Prasetyo',
      location: 'Flores Timur, Nusa Tenggara Timur',
      assignedIncident: 'RSQ-2026-0891 (Erupsi Gunung Lewotobi)',
      personnel: 38,
      equipment: ['6 Kendaraan Taktis 4x4', 'Tenda Komando Lapangan', '1000 Masker N95'],
      status: 'Evakuasi & Skrining Warga',
      contact: 'VHF 146.800 MHz / 0821-3322-xxxx',
    },
    {
      id: 'team-3',
      name: 'Satgas Manggala Agni Daops Riau',
      leader: 'Hendra Saputra, S.Hut',
      location: 'Pelalawan, Riau',
      assignedIncident: 'RSQ-2026-0874 (Karhutla Lahan Gambut)',
      personnel: 16,
      equipment: ['Pompa Nozzle Gambut', 'Selang 1200 Meter', 'Drone Termal Pantau'],
      status: 'Pemadaman Kepala Api',
      contact: 'Radio Komunikasi Induk 154.200 MHz',
    },
    {
      id: 'team-4',
      name: 'Tim Medis Reaksi Cepat PMI & Kemenkes',
      leader: 'dr. Anisa Rahmawati, Sp.EM',
      location: 'Cianjur, Jawa Barat',
      assignedIncident: 'RSQ-2026-0885 (Gempa Sesar Cianjur)',
      personnel: 12,
      equipment: ['2 Ambulans Gawat Darurat', 'Obat Bedah Minor', 'Tenda IGD Darurat'],
      status: 'Triase & Trauma Healing',
      contact: 'Kanal Darurat Medis 119',
    },
  ]);

  const [logisticsPool] = useState([
    { item: 'Tenda Gulung Pengungsi', total: '12.400 unit', deployed: '8.200 unit', available: '4.200 unit' },
    { item: 'Perahu Karet & Mesin Tempel', total: '340 unit', deployed: '210 unit', available: '130 unit' },
    { item: 'Dapur Umum Lapangan (Durlap)', total: '85 unit', deployed: '62 unit', available: '23 unit' },
    { item: 'Paket Sembako Siap Santap', total: '180.000 paket', deployed: '142.000 paket', available: '38.000 paket' },
    { item: 'Genset Darurat Penerangan', total: '620 unit', deployed: '480 unit', available: '140 unit' },
  ]);

  return (
    <div className="space-y-4">
      {/* Module Title */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Koordinasi Satuan Tugas &amp; Alokasi Logistik Darurat
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemantauan pergerakan tim penolong lapangan, logistik, dan kluster kebencanaan BNPB-BPBD
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#071426] px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">
              Operasi Aktif: <strong className="text-cyan-300">{stats.activeResponseCount} Titik</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Task Forces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTeams.map((team) => (
          <div
            key={team.id}
            className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg hover:border-cyan-400/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                  {team.status}
                </span>
                <span className="text-xs text-slate-400 font-mono-numbers flex items-center gap-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  {team.personnel} Personel
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{team.name}</h3>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {team.location}
              </p>
              <div className="text-xs text-cyan-300 font-medium mt-1">
                Sasaran: {team.assignedIncident}
              </div>

              <div className="mt-3 pt-3 border-t border-[#12365C]/80 space-y-2">
                <div className="text-[11px] text-slate-400">Komandan Lapangan: <strong>{team.leader}</strong></div>
                <div className="text-[11px] text-slate-400">Kanal Komunikasi: <span className="font-mono-numbers text-slate-200">{team.contact}</span></div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Inventori Alat Bawa:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {team.equipment.map((eq, i) => (
                      <span key={i} className="text-[10px] bg-[#071426] border border-[#12365C] text-slate-300 px-2 py-0.5 rounded">
                        • {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#12365C] flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> GPS Tracking Aktif
              </span>
              <button
                onClick={() => alert(`[SIMULASI PROTOKOL] Menghubungi Pos Komando Lapangan via kanal radio ${team.contact}`)}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Panggil Radio Posko
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Logistics Overview Board */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rekapitulasi Ketersediaan Cadangan Logistik Nasional (Gudang Regional)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Simulasi Kuota BNPB / Kemensos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-200">
            <thead className="bg-[#071426] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Komoditas Logistik</th>
                <th className="py-2.5 px-3">Total Stok Cadangan</th>
                <th className="py-2.5 px-3">Telah Didistribusikan</th>
                <th className="py-2.5 px-3">Sisa Siaga Cepat</th>
                <th className="py-2.5 px-3">Tingkat Ketahanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60 font-mono-numbers">
              {logisticsPool.map((log, idx) => (
                <tr key={idx} className="hover:bg-[#071426]/50">
                  <td className="py-2.5 px-3 font-bold text-white font-sans">{log.item}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.total}</td>
                  <td className="py-2.5 px-3 text-amber-400">{log.deployed}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{log.available}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#071426] h-2 rounded-full overflow-hidden border border-[#12365C]">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: '68%' }} />
                      </div>
                      <span className="text-[10px] text-cyan-300">Siap Kirim</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
