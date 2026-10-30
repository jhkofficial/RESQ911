import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { FilterBar } from '../common/FilterBar';

export const DisasterAnalytics: React.FC = () => {
  const { filteredIncidents, stats, exportDataAsCSV } = useDisaster();

  // 1. Distribution by Disaster Type
  const disasterTypeData = useMemo(() => {
    const map: Record<string, { count: number; affected: number }> = {};
    filteredIncidents.forEach((i) => {
      if (!map[i.disaster_type]) {
        map[i.disaster_type] = { count: 0, affected: 0 };
      }
      map[i.disaster_type].count += 1;
      map[i.disaster_type].affected += i.affected_population;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      affected: data.affected,
    }));
  }, [filteredIncidents]);

  // 2. Severity distribution
  const severityData = useMemo(() => {
    const severities = ['Kritis', 'Tinggi', 'Sedang', 'Rendah'];
    const map: Record<string, number> = { Kritis: 0, Tinggi: 0, Sedang: 0, Rendah: 0 };
    filteredIncidents.forEach((i) => {
      map[i.severity] = (map[i.severity] || 0) + 1;
    });

    return severities.map((sev) => ({
      name: sev,
      count: map[sev] || 0,
      fill:
        sev === 'Kritis'
          ? '#ef4444'
          : sev === 'Tinggi'
          ? '#f97316'
          : sev === 'Sedang'
          ? '#eab308'
          : '#00c8f8',
    }));
  }, [filteredIncidents]);

  // 3. Verification status distribution
  const verificationData = useMemo(() => {
    const statuses = ['Terverifikasi', 'Dalam Verifikasi', 'Belum Diverifikasi', 'Tidak Valid'];
    const map: Record<string, number> = {};
    filteredIncidents.forEach((i) => {
      map[i.verification_status] = (map[i.verification_status] || 0) + 1;
    });

    return statuses.map((st) => ({
      name: st,
      count: map[st] || 0,
    }));
  }, [filteredIncidents]);

  // 4. Response progress breakdown
  const responseData = useMemo(() => {
    const statuses = ['Selesai', 'Respons Aktif', 'Penanganan Lanjutan', 'Siaga / Assessment', 'Belum Ditangani'];
    const map: Record<string, number> = {};
    filteredIncidents.forEach((i) => {
      map[i.response_status] = (map[i.response_status] || 0) + 1;
    });

    return statuses.map((st) => ({
      name: st,
      count: map[st] || 0,
    }));
  }, [filteredIncidents]);

  // 5. Top 8 provinces by incident count & affected population
  const topProvinces = useMemo(() => {
    const map: Record<string, { count: number; affected: number; displaced: number }> = {};
    filteredIncidents.forEach((i) => {
      if (!map[i.province]) {
        map[i.province] = { count: 0, affected: 0, displaced: 0 };
      }
      map[i.province].count += 1;
      map[i.province].affected += i.affected_population;
      map[i.province].displaced += i.displaced_population;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].affected - a[1].affected)
      .slice(0, 8)
      .map(([name, d]) => ({
        province: name,
        insiden: d.count,
        terdampak: d.affected,
        pengungsi: d.displaced,
      }));
  }, [filteredIncidents]);

  // Analytical Key Takeaway
  const dominantDisaster = disasterTypeData.length
    ? [...disasterTypeData].sort((a, b) => b.count - a.count)[0]
    : null;

  return (
    <div className="space-y-4">
      {/* Universal Filter Bar */}
      <FilterBar />

      {/* Intelligence Insights Summary Header */}
      <div className="bg-gradient-to-r from-[#0a1c33] via-[#071426] to-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Ringkasan Intelijen &amp; Analitik Bencana Nasional
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {dominantDisaster ? (
                  <>
                    <strong className="text-cyan-300">{dominantDisaster.name}</strong> merupakan ancaman paling dominan ({dominantDisaster.count} kejadian) dengan total dampak{' '}
                    <strong className="text-amber-300 font-mono-numbers">
                      {dominantDisaster.affected.toLocaleString('id-ID')} jiwa
                    </strong>{' '}
                    pada parameter filter aktif saat ini.
                  </>
                ) : (
                  'Tidak ada data yang cocok dengan kriteria filter.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={exportDataAsCSV}
            className="flex items-center gap-1.5 bg-[#071426] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Lembar Rekap</span>
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Top Provinces Impact */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Dampak per Provinsi (Top 8 Wilayah Terpapar)
              </h3>
              <p className="text-[11px] text-slate-400">Total Korban Terdampak dan Pengungsi</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProvinces} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12365C" />
                <XAxis
                  dataKey="province"
                  stroke="#94a3b8"
                  fontSize={10}
                  angle={-20}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString('id-ID')} jiwa`]}
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="terdampak" name="Korban Terdampak" fill="#00c8f8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengungsi" name="Pengungsi Terdata" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Disaster Type vs Affected Count */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Frekuensi vs Beban Korban per Tipe Bencana
              </h3>
              <p className="text-[11px] text-slate-400">Jumlah Kejadian vs Total Terdampak</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disasterTypeData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12365C" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" name="Jumlah Kejadian" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Severity Breakdown */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg">
          <div className="mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Sebaran Tingkat Keparahan Bencana
            </h3>
            <p className="text-[11px] text-slate-400">Klasifikasi tingkat keparahan dampak (Kritis hingga Rendah)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12365C" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Kejadian`]}
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Kejadian" radius={[0, 4, 4, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Verification & Response Status Pipeline */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg">
          <div className="mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Status Respons Lapangan (Pipeline Penanganan)
            </h3>
            <p className="text-[11px] text-slate-400">Distribusi status tahapan respons operasional tim satgas</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#12365C" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={10} tickLine={false} width={110} />
                <Tooltip
                  formatter={(val: any) => [`${val} Insiden`]}
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Insiden" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
