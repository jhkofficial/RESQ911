import React, { useState } from 'react';
import {
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  Archive,
  RotateCcw
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { ResourceInventory, ResourceCategory } from '../../types/operations';

export const ResourceLogisticsManagement: React.FC = () => {
  const {
    inventory,
    missions,
    allocateResourceToMission,
    returnAllocatedResource,
    currentUser
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [shortageOnly, setShortageOnly] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceInventory | null>(null);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [targetMissionId, setTargetMissionId] = useState<string>(missions[0]?.mission_id || '');
  const [allocateQuantity, setAllocateQuantity] = useState<number>(1);
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isReadOnly = currentUser.role === 'VIEWER_EKSEKUTIF';

  const categories: ResourceCategory[] = [
    'Kendaraan Operasional',
    'Peralatan SAR & Evakuasi',
    'Suplai Medis & Trauma',
    'Pangan & Dapur Umum',
    'Hunian Darurat & Tenda',
    'Komunikasi & Penerangan',
    'Sanitasi & Air Bersih',
    'Logistik Lainnya'
  ];

  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (shortageOnly && item.quantity_available > item.safety_threshold) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.resource_name.toLowerCase().includes(q) ||
        item.resource_id.toLowerCase().includes(q) ||
        item.storage_location.toLowerCase().includes(q) ||
        item.owner_institution.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const lowStockItems = inventory.filter((i) => i.quantity_available <= i.safety_threshold);

  const handleAllocate = () => {
    if (!selectedResource || !targetMissionId) return;
    const res = allocateResourceToMission(targetMissionId, selectedResource.resource_id, allocateQuantity);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Berhasil mengalokasikan ${allocateQuantity} ${selectedResource.unit} ${selectedResource.resource_name} ke misi ${targetMissionId}.`
      });
      setAllocateModalOpen(false);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal mengalokasikan sumber daya.'
      });
    }
  };

  const handleReturn = () => {
    if (!selectedResource || !targetMissionId) return;
    const res = returnAllocatedResource(targetMissionId, selectedResource.resource_id, returnQuantity);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Berhasil mengembalikan ${returnQuantity} ${selectedResource.unit} ${selectedResource.resource_name} ke inventori gudang.`
      });
      setReturnModalOpen(false);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal memproses pengembalian.'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SIMULASI MANAJEMEN LOGISTIK &amp; PERALATAN:</strong> Validasi stok matematis ketat mencegah alokasi berlebih di atas ketersediaan riil gudang logistik.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          LOGISTICS OFFICER: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Manajemen Logistik &amp; Sumber Daya Tanggap Darurat
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              INVENTORY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inventori nasional peralatan SAR, armada darurat, suplai farmasi, tenda shelter, dan rantai pasok dapur umum.
          </p>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-orange-950/40 border border-orange-500/40 rounded-2xl text-xs text-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <strong className="text-orange-300">Peringatan Kritis Ketersediaan Cadangan:</strong> Terdapat{' '}
              {lowStockItems.length} jenis sumber daya logistik yang berada di bawah ambang batas keselamatan minimum (Safety Threshold).
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShortageOnly(!shortageOnly)}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 cursor-pointer"
          >
            {shortageOnly ? 'Tampilkan Semua Barang' : 'Filter Barang Kritis'}
          </button>
        </div>
      )}

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-[#0a1c33] border border-[#12365C] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang, ID, gudang, atau instansi..."
            className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs pl-9 pr-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-3 py-2 rounded-xl outline-none"
          >
            <option value="all">Semua Kategori ({inventory.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#12365C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Daftar Inventori Sumber Daya ({filteredInventory.length} Item)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Kalkulasi Realtime: Total = Tersedia + Dicadangkan + Ditugaskan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#071426]/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-[#12365C]">
              <tr>
                <th className="py-3 px-4">Kode &amp; Nama Sumber Daya</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Total</th>
                <th className="py-3 px-4 text-center">Tersedia</th>
                <th className="py-3 px-4 text-center">Ditugaskan</th>
                <th className="py-3 px-4">Lokasi Gudang</th>
                <th className="py-3 px-4 text-right">Aksi Alokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12365C]/60">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    Tidak ada item inventori yang cocok.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.quantity_available <= item.safety_threshold;
                  return (
                    <tr
                      key={item.resource_id}
                      className={`hover:bg-[#071426]/50 transition-colors ${
                        isLow ? 'bg-orange-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-cyan-400 font-bold text-[11px]">
                          {item.resource_id}
                        </div>
                        <div className="font-semibold text-white max-w-xs truncate mt-0.5">
                          {item.resource_name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Pemilik: {item.owner_institution}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{item.maintenance_status}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#071426] border border-[#12365C] text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200">
                        {item.quantity_total} {item.unit}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isLow
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.quantity_available} {item.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-cyan-300">
                        {item.quantity_assigned} {item.unit}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white text-xs">{item.storage_location}</div>
                        <div className="text-[10px] text-slate-500">Ambang Aman: {item.safety_threshold} {item.unit}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isReadOnly || item.quantity_available <= 0}
                            onClick={() => {
                              setSelectedResource(item);
                              setAllocateQuantity(1);
                              setAllocateModalOpen(true);
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer shadow"
                          >
                            <span>Alokasikan</span>
                          </button>

                          {item.quantity_assigned > 0 && (
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => {
                                setSelectedResource(item);
                                setReturnQuantity(1);
                                setReturnModalOpen(true);
                              }}
                              className="bg-[#071426] hover:bg-[#12365C] border border-slate-600 text-slate-300 font-medium px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                              title="Kembalikan ke Gudang"
                            >
                              <RotateCcw className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Modal */}
      {allocateModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Alokasi Sumber Daya Lapangan
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedResource.resource_name}
                </h3>
              </div>
              <button
                onClick={() => setAllocateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#071426] rounded-xl border border-[#12365C] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gudang Penyimpanan:</span>
                  <span className="text-white font-medium">{selectedResource.storage_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sisa Stok Tersedia:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {selectedResource.quantity_available} {selectedResource.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Pilih Misi Tujuan Alokasi:
                </label>
                <select
                  value={targetMissionId}
                  onChange={(e) => setTargetMissionId(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                >
                  {missions.map((m) => (
                    <option key={m.mission_id} value={m.mission_id}>
                      {m.mission_id} — {m.title} ({m.regency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Jumlah yang Dialokasikan ({selectedResource.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedResource.quantity_available}
                  value={allocateQuantity}
                  onChange={(e) => setAllocateQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Maksimal yang dapat dialokasikan saat ini: {selectedResource.quantity_available} {selectedResource.unit}.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#12365C] pt-3">
              <button
                type="button"
                onClick={() => setAllocateModalOpen(false)}
                className="bg-[#071426] text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAllocate}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-cyan-500/20"
              >
                Konfirmasi Alokasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalOpen && selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pengembalian ke Gudang
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedResource.resource_name}
                </h3>
              </div>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Jumlah sedang ditugaskan: <strong>{selectedResource.quantity_assigned} {selectedResource.unit}</strong>
              </p>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Jumlah yang Dikembalikan ({selectedResource.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedResource.quantity_assigned}
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-[#071426] border border-[#12365C] text-white text-xs px-3 py-2 rounded-xl outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#12365C] pt-3">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="bg-[#071426] text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReturn}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black"
              >
                Konfirmasi Pengembalian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
