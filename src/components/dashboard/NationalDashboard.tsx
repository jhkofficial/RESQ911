import React from 'react';
import {
  AlertTriangle,
  Flame,
  Users,
  Home,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Activity,
  Radio,
  FileCheck,
  Send,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useDisaster } from '../../context/DisasterContext';
import { FilterBar } from '../common/FilterBar';

export const NationalDashboard: React.FC = () => {
  const {
    filteredIncidents,
    stats,
    reportStats,
    setActiveIncident,
    setActiveTab,
    setFilters,
  } = useDisaster();

  // Color palette for charts matching theme
  const DISASTER_COLORS: Record<string, string> = {
    'Banjir': '#00c8f8',
    'Gempa Bumi': '#f59e0b',
    'Tanah Longsor': '#e11d48',
    'Erupsi Gunung Api': '#ef4444',
    'Kebakaran Hutan & Lahan': '#f97316',
    'Cuaca Ekstrem': '#8b5cf6',
    'Tsunami': '#06b6d4',
  };

  // Group filtered incidents by disaster type for pie chart
  const typeDistributionData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIncidents.forEach((inc) => {
      counts[inc.disaster_type] = (counts[inc.disaster_type] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
      color: DISASTER_COLORS[key] || '#94a3b8',
    }));
  }, [filteredIncidents]);

  // Group by date for 7-day trend chart
  const trendData = React.useMemo(() => {
    const dayMap: Record<string, { date: string; count: number; affected: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dayMap[key] = { date: key, count: 0, affected: 0 };
    }

    filteredIncidents.forEach((inc) => {
      const d = new Date(inc.reported_at);
      const key = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (dayMap[key]) {
        dayMap[key].count += 1;
        dayMap[key].affected += Math.round(inc.affected_population / 100);
      }
    });

    return Object.values(dayMap);
  }, [filteredIncidents]);

  // Top 5 provinces by affected population
  const topProvincesData = React.useMemo(() => {
    const provMap: Record<string, number> = {};
    filteredIncidents.forEach((inc) => {
      provMap[inc.province] = (provMap[inc.province] || 0) + inc.affected_population;
    });

    return Object.entries(provMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({
        province: name,
        affected: total,
      }));
  }, [filteredIncidents]);

  // Critical alerts for live ticker
  const priorityAlerts = filteredIncidents
    .filter((i) => i.severity === 'Kritis')
    .slice(0, 3);

  // Recent 5 incidents
  const recentIncidents = [...filteredIncidents]
    .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Synchronized Filter Bar */}
      <FilterBar />

      {/* Emergency Alert Panel (Peringatan Dini Prioritas) */}
      {priorityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-[#0a1c33] to-red-950/80 border border-red-500/50 rounded-xl p-3.5 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PERINGATAN OPERASIONAL PRIORITAS KRITIS ({priorityAlerts.length} WILAYAH)
                </span>
                <p className="text-xs text-slate-200 mt-0.5">
                  {priorityAlerts.map((a) => `${a.title} (${a.regency})`).join(' • ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters({ severity: 'Kritis' });
                setActiveTab('map');
              }}
              className="shrink-0 flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span>Pantau di Peta Kritis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Potential Duplicates & Pending Verification Operational Alert (MVP 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Report Inbox Pipeline Banner */}
        <div className="bg-[#0a1c33] border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Alur Masukan Laporan (Report Pipeline)
                </span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30 font-mono-numbers">
                  {reportStats.totalReports} Masuk
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                <strong className="text-amber-400 font-mono-numbers">{reportStats.pendingVerification} laporan</strong> menunggu validasi verifikator manusia sebelum disahkan.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('verification-center')}
            className="shrink-0 flex items-center gap-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Buka Antrean Verifikasi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Duplicate Flag Alert */}
        <div className="bg-[#0a1c33] border border-orange-500/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Deteksi Duplikasi Laporan
                </span>
                <span className="text-[10px] font-bold text-orange-400 bg-orange-950 px-1.5 py-0.5 rounded border border-orange-500/40 font-mono-numbers">
                  {reportStats.potentialDuplicates} Flag
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Algoritma spasial-temporal menandai potensi laporan ganda pada bencana yang sama.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('duplicate-detection')}
            className="shrink-0 flex items-center gap-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>Tinjau Duplikasi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* KPI 1 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Total Kejadian</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono-numbers mt-1">
            {stats.totalIncidents}
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">Seluruh Kategori</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-amber-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Kejadian Aktif</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono-numbers mt-1">
            {stats.activeIncidents}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dalam Pemantauan</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Korban Terdampak</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono-numbers mt-1">
            {(stats.affectedPopulation / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono-numbers">
            {stats.affectedPopulation.toLocaleString('id-ID')} jiwa
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-amber-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Pengungsi</span>
            <Home className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono-numbers mt-1">
            {(stats.displacedPopulation / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-mono-numbers">
            {stats.displacedPopulation.toLocaleString('id-ID')} jiwa
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-red-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Wilayah Berisiko</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-400 font-mono-numbers mt-1">
            {stats.highRiskRegionsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Provinsi Kritis</div>
        </div>

        {/* KPI 6 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-purple-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Belum Diverifikasi</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono-numbers mt-1">
            {stats.unverifiedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Antrean Validasi</div>
        </div>

        {/* KPI 7 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-cyan-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Respons Berjalan</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono-numbers mt-1">
            {stats.activeResponseCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tim Lapangan Aktif</div>
        </div>

        {/* KPI 8 */}
        <div className="bg-[#0a1c33] border border-[#12365C] hover:border-emerald-400/40 rounded-xl p-3 transition-all">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center justify-between">
            <span>Respons Selesai</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono-numbers mt-1">
            {stats.completedResponseCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fase Pemulihan</div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: 7-Day Trend */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Tren Eskalasi Bencana (7 Hari Terakhir)
              </h3>
              <p className="text-[11px] text-slate-400">
                Fluktuasi jumlah insiden terlapor dan skala dampak populasi
              </p>
            </div>
            <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded font-mono-numbers">
              Live Ingest
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c8f8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00c8f8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Jumlah Kejadian"
                  stroke="#00c8f8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Disaster Type Distribution */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Komposisi Tipe Bencana
            </h3>
            <p className="text-[11px] text-slate-400">Proporsi ancaman bencana dalam filter aktif</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-[#12365C]">
            {typeDistributionData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="text-slate-400 font-mono-numbers ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Impacted Provinces & Recent Incidents Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top 5 Impacted Provinces */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              5 Provinsi Terpapar Terbesar
            </h3>
            <span className="text-[11px] text-slate-400">Total Korban Terdampak</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProvincesData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  dataKey="province"
                  type="category"
                  stroke="#cbd5e1"
                  fontSize={10}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString('id-ID')} jiwa`, 'Terdampak']}
                  contentStyle={{
                    backgroundColor: '#071426',
                    borderColor: '#12365C',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="affected" fill="#00c8f8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents Feed with 1-click Inspect */}
        <div className="lg:col-span-2 bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Laporan Insiden Terbaru (Pusdalops Feed)
              </h3>
              <p className="text-[11px] text-slate-400">
                Masukan mutakhir dari jajaran posko BPBD dan telemetri sensor
              </p>
            </div>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              Lihat Seluruh Tabel ({filteredIncidents.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setActiveIncident(inc)}
                className="p-2.5 rounded-xl bg-[#071426] border border-[#12365C] hover:border-cyan-400/50 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2 h-10 rounded-full shrink-0 ${
                      inc.severity === 'Kritis'
                        ? 'bg-red-500'
                        : inc.severity === 'Tinggi'
                        ? 'bg-orange-500'
                        : inc.severity === 'Sedang'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers text-[10px] text-cyan-400 font-bold">
                        {inc.incident_id}
                      </span>
                      <span className="text-[10px] text-slate-400">• {inc.disaster_type}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">• {inc.province}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Terdampak: {inc.affected_population.toLocaleString('id-ID')}</span>
                      <span>•</span>
                      <span>Pengungsi: {inc.displaced_population.toLocaleString('id-ID')}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{inc.verification_status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-300 bg-[#0a1c33] px-2 py-1 rounded border border-[#12365C] hidden sm:block">
                    {inc.response_status}
                  </span>
                  <div className="p-1 rounded-lg bg-[#0a1c33] text-slate-400 group-hover:text-cyan-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-2 border-t border-[#12365C] flex items-center justify-between text-xs text-slate-400">
            <span>Sistem sinkronisasi berkala setiap 60 detik</span>
            <button
              onClick={() => setActiveTab('map')}
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Lihat Tampilan Peta Penuh →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
