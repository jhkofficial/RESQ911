import React, { useState } from 'react';
import { X, Plus, AlertTriangle, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DisasterType, SeverityLevel, VerificationStatus, ResponseStatus } from '../../types/disaster';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose }) => {
  const { addNewIncident, currentUser } = useDisaster();

  const [disasterType, setDisasterType] = useState<DisasterType>('Banjir');
  const [title, setTitle] = useState('');
  const [province, setProvince] = useState('Jawa Barat');
  const [regency, setRegency] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [latitude, setLatitude] = useState(-6.8122);
  const [longitude, setLongitude] = useState(107.0892);
  const [severity, setSeverity] = useState<SeverityLevel>('Sedang');
  const [affectedPopulation, setAffectedPopulation] = useState(1500);
  const [displacedPopulation, setDisplacedPopulation] = useState(250);
  const [description, setDescription] = useState('');
  const [needs, setNeeds] = useState('Tenda Darurat, Air Bersih, Makanan Siap Saji');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !regency.trim()) return;

    addNewIncident({
      disaster_type: disasterType,
      title: title.trim(),
      province,
      regency: regency.trim(),
      subdistrict: subdistrict.trim() || 'Kecamatan Terkait',
      latitude: Number(latitude),
      longitude: Number(longitude),
      reported_at: new Date().toISOString(),
      severity,
      affected_population: Number(affectedPopulation) || 0,
      displaced_population: Number(displacedPopulation) || 0,
      injured_count: 0,
      fatalities_count: 0,
      damaged_houses: Math.round(Number(displacedPopulation) * 0.3) || 0,
      verification_status: 'Dalam Verifikasi',
      response_status: 'Siaga / Assessment',
      data_source: `Laporan Lapangan Petugas: ${currentUser.name} (${currentUser.agency})`,
      description: description.trim() || `Laporan operasional situasi awal penanganan bencana ${disasterType} di wilayah ${regency}, ${province}.`,
      needs: needs.split(',').map((s) => s.trim()).filter(Boolean),
      assigned_team: `Satgas Cepat Posko ${regency}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#12365C] bg-[#071426] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Input Laporan Insiden Baru (Simulasi)</h3>
              <p className="text-xs text-slate-400">
                Pencatatan data darurat lapangan terintegrasi Pusdalops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#12365C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Jenis Bencana *
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2 cursor-pointer"
              >
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
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tingkat Keparahan *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2 cursor-pointer"
              >
                <option value="Kritis">Kritis (Prioritas Nasional)</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Judul Ringkas Insiden *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Banjir Luapan Sungai Citarum Merendam 4 Desa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Provinsi *
              </label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kabupaten / Kota *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kab. Bandung"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kecamatan / Titik
              </label>
              <input
                type="text"
                placeholder="Contoh: Dayeuhkolot"
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Latitude (Lintang)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Longitude (Bujur)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Estimasi Terdampak
              </label>
              <input
                type="number"
                value={affectedPopulation}
                onChange={(e) => setAffectedPopulation(Number(e.target.value))}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Jumlah Pengungsi
              </label>
              <input
                type="number"
                value={displacedPopulation}
                onChange={(e) => setDisplacedPopulation(Number(e.target.value))}
                className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Deskripsi Situasi Lapangan
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan kondisi genangan/longsor/dampak, aksesibilitas jalan, dan langkah darurat yang sedang diambil..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Kebutuhan Mendesak (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
            />
          </div>

          <div className="p-3 bg-[#071426] border border-cyan-500/20 rounded-xl text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Laporan akan otomatis memiliki ID RSQ-2026 dan muncul secara real-time pada peta dan KPI analitik.</span>
          </div>

          <div className="pt-3 border-t border-[#12365C] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Laporan Lapangan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
