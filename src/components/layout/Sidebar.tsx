import React from 'react';
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  BarChart3,
  Cpu,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  Flame,
  Radio,
  FileEdit,
  Inbox,
  ShieldCheck,
  Copy,
  History,
  Sparkles,
  Hammer,
  CheckSquare,
  Compass,
  Truck,
  MessageSquare,
  PlusCircle,
  FileCheck,
  MapPin,
  ListTodo,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const {
    activeTab,
    setActiveTab,
    stats,
    reportStats,
    intelligenceStats,
    operationsMetrics,
    teams,
    currentUser,
    filteredIncidents,
  } = useDisaster();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Nasional',
      sublabel: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
      section: 'OVERVIEW',
    },
    {
      id: 'map',
      label: 'Peta Geointelijen',
      sublabel: 'Interactive Spatial Map',
      icon: Map,
      badge: `${filteredIncidents.length}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      section: 'OVERVIEW',
    },
    // MVP 4 Response Orchestration & Field Operations
    {
      id: 'response-center',
      label: 'Pusat Komando Operasi',
      sublabel: 'Command & Response Cockpit',
      icon: Compass,
      badge: operationsMetrics.activeMissions > 0 ? `${operationsMetrics.activeMissions} Misi` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'mission-planning',
      label: 'Perencanaan Misi',
      sublabel: 'Mission Planning Engine',
      icon: PlusCircle,
      badge: '+ Baru',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'mission-authorization',
      label: 'Meja Otorisasi Misi',
      sublabel: 'Human Authorization Gate',
      icon: FileCheck,
      badge: operationsMetrics.pendingAuthorization > 0 ? `${operationsMetrics.pendingAuthorization} Antre` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'team-management',
      label: 'Registri Tim Satgas',
      sublabel: 'Multi-Agency Taskforces',
      icon: Users,
      badge: `${teams.length}`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'resource-management',
      label: 'Logistik & Sumber Daya',
      sublabel: 'Fleet & Inventory Control',
      icon: Truck,
      badge: operationsMetrics.lowStockResources > 0 ? `${operationsMetrics.lowStockResources} Kritis` : null,
      badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'field-workspace',
      label: 'Workspace Lapangan',
      sublabel: 'TRC SitRep & Sektor',
      icon: Radio,
      badge: 'Frontline',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'field-tasks',
      label: 'Manajemen Tugas',
      sublabel: 'Kanban & Timeline Progress',
      icon: ListTodo,
      badge: `${operationsMetrics.totalTasks}`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'operations-map',
      label: 'Peta Geospasial Operasi',
      sublabel: 'Tactical Deployment Layers',
      icon: MapPin,
      badge: 'GIS Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'coordination-escalation',
      label: 'Koordinasi & Eskalasi',
      sublabel: 'Realtime Channels & Alerts',
      icon: MessageSquare,
      badge: operationsMetrics.openEscalations > 0 ? `${operationsMetrics.openEscalations} Kendala` : null,
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/40',
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    {
      id: 'mission-history',
      label: 'Rekam Jejak Operasi',
      sublabel: 'Immutable Audit Trail',
      icon: History,
      badge: null,
      section: 'OPERASI LAPANGAN (MVP 4)',
    },
    // MVP 3 AI Intelligence & Decision Support Modules
    {
      id: 'ai-center',
      label: 'AI Intelligence Center',
      sublabel: 'Executive Command Desk',
      icon: Sparkles,
      badge: 'Active',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      section: 'INTELIJEN AI',
    },
    {
      id: 'risk-intel',
      label: 'Risk Intelligence',
      sublabel: 'Deterministic Multi-Factor',
      icon: ShieldAlert,
      badge: null,
      section: 'INTELIJEN AI',
    },
    {
      id: 'damage-assessment',
      label: 'Rapid Damage Assessment',
      sublabel: 'Multimodal Image & Text',
      icon: Cpu,
      badge: 'Multimodal',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
      section: 'INTELIJEN AI',
    },
    {
      id: 'data-reconciliation',
      label: 'Data Reconciliation',
      sublabel: 'Multi-Report Conflict Resolver',
      icon: Layers,
      badge: null,
      section: 'INTELIJEN AI',
    },
    {
      id: 'priority-engine',
      label: 'Response Priority Engine',
      sublabel: 'MCDM Sensitivity Ranker',
      icon: BarChart3,
      badge: null,
      section: 'INTELIJEN AI',
    },
    {
      id: 'decision-support',
      label: 'Decision Support Center',
      sublabel: '3-Panel Human Approval Desk',
      icon: CheckSquare,
      badge: intelligenceStats.pendingHumanApprovals > 0 ? `${intelligenceStats.pendingHumanApprovals} Antre` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'INTELIJEN AI',
    },
    {
      id: 'recovery-preview',
      label: 'Recovery Intelligence',
      sublabel: 'Post-Disaster Tracker',
      icon: Hammer,
      badge: 'Prototype',
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-500/40',
      section: 'INTELIJEN AI',
    },
    {
      id: 'ai-history',
      label: 'AI Analysis History',
      sublabel: 'Audit Trail & Provenance',
      icon: History,
      badge: null,
      section: 'INTELIJEN AI',
    },
    // MVP 2 Workflow Modules
    {
      id: 'new-report',
      label: 'Pelaporan Kejadian',
      sublabel: '6-Step Field Report',
      icon: FileEdit,
      badge: '+ Baru',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      section: 'VERIFIKASI',
    },
    {
      id: 'report-inbox',
      label: 'Kotak Masuk Laporan',
      sublabel: 'Validation Queue',
      icon: Inbox,
      badge: `${reportStats.totalReports}`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      section: 'VERIFIKASI',
    },
    {
      id: 'verification-center',
      label: 'Pusat Verifikasi',
      sublabel: 'Human-in-the-Loop',
      icon: ShieldCheck,
      badge: reportStats.pendingVerification > 0 ? `${reportStats.pendingVerification} Antre` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'VERIFIKASI',
    },
    {
      id: 'duplicate-detection',
      label: 'Deteksi Duplikasi',
      sublabel: 'Spatial-Temporal Engine',
      icon: Copy,
      badge: reportStats.potentialDuplicates > 0 ? `${reportStats.potentialDuplicates} Flag` : null,
      badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      section: 'VERIFIKASI',
    },
    {
      id: 'activity-history',
      label: 'Riwayat Aktivitas',
      sublabel: 'Audit Trail Log',
      icon: History,
      badge: null,
      section: 'VERIFIKASI',
    },
    // Core Operational Modules
    {
      id: 'incidents',
      label: 'Manajemen Insiden',
      sublabel: 'Verified Incidents Table',
      icon: ShieldAlert,
      badge: `${stats.totalIncidents}`,
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/40',
      section: 'OPERASIONAL',
    },
    {
      id: 'analytics',
      label: 'Analitik Bencana',
      sublabel: 'Statistical Visualizer',
      icon: BarChart3,
      badge: null,
      section: 'OPERASIONAL',
    },
    {
      id: 'coordination',
      label: 'Koordinasi Respons',
      sublabel: 'Resource & Task Force',
      icon: Users,
      badge: `${stats.activeResponseCount} Aktif`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      section: 'OPERASIONAL',
    },
    {
      id: 'reports',
      label: 'Laporan & SitRep',
      sublabel: 'Situational Briefing',
      icon: FileText,
      badge: null,
      section: 'DOKUMEN',
    },
    {
      id: 'settings',
      label: 'Pengaturan Sistem',
      sublabel: 'RBAC & Audit Trail',
      icon: Settings,
      badge: null,
      section: 'DOKUMEN',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#071426] border-r border-[#12365C] transition-all duration-300 z-20 shrink-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top User Role Summary */}
      {!collapsed ? (
        <div className="p-3.5 border-b border-[#12365C] bg-[#0a1c33]/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Personel Aktif
            </span>
            {currentUser.nim && (
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-500/40">
                NIM: {currentUser.nim}
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-white truncate mt-1">
            {currentUser.name}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00c8f8]"></span>
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-tight">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.agency}</p>
        </div>
      ) : (
        <div className="p-3 border-b border-[#12365C] flex justify-center">
          <span
            className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00c8f8]"
            title={`${currentUser.name} (${currentUser.nim || ''}) - ${currentUser.role}`}
          ></span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const prevItem = navItems[idx - 1];
          const showSectionHeader = !collapsed && (!prevItem || prevItem.section !== item.section);

          return (
            <React.Fragment key={item.id}>
              {showSectionHeader && (
                <div className="pt-2 pb-1 px-3 text-[9px] uppercase font-bold tracking-widest text-slate-500">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-[#0a1c33] text-cyan-300 font-semibold border-l-3 border-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0a1c33]/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,200,248,0.5)]' : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="truncate">
                      <div className="text-xs truncate">{item.label}</div>
                      <div className="text-[9px] text-slate-500 truncate">{item.sublabel}</div>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono-numbers px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Operational Diagnostic Status Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-[#12365C] bg-[#050f1d] text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-400">
            <span>Status Pipeline</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between font-mono-numbers">
            <span>Kotak Masuk:</span>
            <span className="text-cyan-300">{reportStats.totalReports} Laporan</span>
          </div>
          <div className="flex items-center justify-between font-mono-numbers">
            <span>Kejadian Terverifikasi:</span>
            <span className="text-emerald-400">{filteredIncidents.length} Insiden</span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-[#12365C] flex flex-col items-center gap-1 text-slate-500">
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-[#0a1c33] border-t border-[#12365C] transition-colors"
        title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
