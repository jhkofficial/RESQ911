import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  DisasterIncident,
  FilterState,
  UserProfile,
  UserRole,
  VerificationStatus,
  ResponseStatus,
  IncidentReport,
  ReportVerificationStatus,
  ReportIncidentLink,
  VerificationLog,
  DuplicateCandidate,
  ReportFilterState,
} from '../types/disaster';
import { INITIAL_SIMULATED_INCIDENTS, DEMO_USERS } from '../data/simulatedDisasters';
import {
  INITIAL_SIMULATED_REPORTS,
  INITIAL_REPORT_LINKS,
  INITIAL_VERIFICATION_LOGS,
} from '../data/simulatedReports';
import {
  RiskAssessment,
  RiskWeights,
  DamageAssessment,
  IncidentReconciliation,
  PriorityAssessment,
  PriorityWeights,
  DecisionRecommendation,
  DecisionReviewStatus,
  RecoveryMetric,
  AIAnalysisRun,
  SituationSummaryResult,
} from '../types/intelligence';
import {
  DEFAULT_RISK_WEIGHTS,
  DEFAULT_PRIORITY_WEIGHTS,
  calculateDeterministicRisk,
  calculatePriorityRankings,
  DEMO_SCENARIOS,
} from '../utils/intelligenceEngine';
import {
  INITIAL_RISK_ASSESSMENTS,
  INITIAL_DAMAGE_ASSESSMENTS,
  INITIAL_RECONCILIATIONS,
  INITIAL_DECISION_RECOMMENDATIONS,
  INITIAL_RECOVERY_METRICS,
  INITIAL_AI_RUNS,
} from '../data/simulatedIntelligence';
import { validateIncidentReport } from '../utils/validation';
import { findPotentialDuplicates, evaluateReportSimilarity } from '../utils/duplicateDetection';
import {
  ResponseMission,
  MissionTask,
  SimulatedTeam,
  ResourceInventory,
  ResourceAllocation,
  FieldUpdate,
  MissionApproval,
  MissionEscalation,
  MissionAuditLog,
  CoordinationMessage,
  TaskStatus,
  EscalationCategory
} from '../types/operations';
import {
  INITIAL_SIMULATED_TEAMS,
  INITIAL_RESOURCE_INVENTORY,
  INITIAL_RESPONSE_MISSIONS,
  INITIAL_MISSION_TASKS,
  INITIAL_FIELD_UPDATES,
  INITIAL_MISSION_ESCALATIONS,
  INITIAL_MISSION_AUDIT_LOGS,
  INITIAL_COORDINATION_MESSAGES
} from '../data/simulatedOperations';
import {
  calculateOperationsMetrics,
  validateResourceAllocation,
  recommendTeamsForMission,
  detectOperationalConflicts
} from '../utils/operationsEngine';

interface DisasterContextType {
  // Incidents (Verified / Active)
  incidents: DisasterIncident[];
  filteredIncidents: DisasterIncident[];
  filters: FilterState;
  activeIncident: DisasterIncident | null;

  // Reports (MVP 2 Core)
  reports: IncidentReport[];
  filteredReports: IncidentReport[];
  reportFilters: ReportFilterState;
  activeReport: IncidentReport | null;
  reportLinks: ReportIncidentLink[];
  verificationLogs: VerificationLog[];
  duplicateCandidates: DuplicateCandidate[];

  // MVP 3 Intelligence & Decision Support
  riskAssessments: Record<string, RiskAssessment>;
  damageAssessments: Record<string, DamageAssessment>;
  reconciliations: Record<string, IncidentReconciliation>;
  priorityAssessments: PriorityAssessment[];
  priorityWeights: PriorityWeights;
  recommendations: DecisionRecommendation[];
  recoveryMetrics: RecoveryMetric[];
  aiAnalysisRuns: AIAnalysisRun[];
  activeScenario: 'A' | 'B' | 'C' | 'D' | null;

  // Session & UI
  currentUser: UserProfile;
  isLoggedIn: boolean;
  activeTab: string;
  timeZone: 'WIB' | 'WITA' | 'WIT';
  mapLayers: {
    showVerifiedIncidents: boolean;
    showUnverifiedReports: boolean;
  };

  // KPIs
  stats: {
    totalIncidents: number;
    activeIncidents: number;
    affectedPopulation: number;
    displacedPopulation: number;
    highRiskRegionsCount: number;
    unverifiedCount: number;
    activeResponseCount: number;
    completedResponseCount: number;
  };
  reportStats: {
    totalReports: number;
    pendingValidation: number;
    pendingVerification: number;
    potentialDuplicates: number;
    verifiedReports: number;
    rejectedReports: number;
    clarificationRequired: number;
  };
  intelligenceStats: {
    eligibleIncidents: number;
    analysesCompleted: number;
    analysesRequiringReview: number;
    insufficientDataCount: number;
    highPriorityRecommendations: number;
    pendingHumanApprovals: number;
    latestAnalysisTimestamp: string;
  };

  // Incident methods
  setFilters: (update: Partial<FilterState>) => void;
  resetFilters: () => void;
  setActiveIncident: (incident: DisasterIncident | null) => void;
  updateIncidentVerification: (id: string, status: VerificationStatus) => void;
  updateIncidentResponse: (id: string, status: ResponseStatus) => void;
  addNewIncident: (incident: Omit<DisasterIncident, 'id' | 'incident_id' | 'last_updated'>) => void;

  // Report methods
  setReportFilters: (update: Partial<ReportFilterState>) => void;
  resetReportFilters: () => void;
  setActiveReport: (report: IncidentReport | null) => void;
  submitNewReport: (
    data: Omit<
      IncidentReport,
      'id' | 'report_id' | 'created_at' | 'updated_at' | 'verification_status' | 'potential_duplicate'
    >
  ) => { success: boolean; report?: IncidentReport; error?: string };
  verifyReport: (
    reportId: string,
    options: {
      createNewIncident?: boolean;
      targetIncidentId?: string;
      notes: string;
      overrideSeverity?: string;
    }
  ) => { success: boolean; error?: string };
  requestReportClarification: (reportId: string, question: string) => { success: boolean; error?: string };
  rejectReport: (reportId: string, reason: string) => { success: boolean; error?: string };
  markReportAsDuplicate: (
    reportId: string,
    matchedReportOrIncidentId: string,
    rationale: string
  ) => { success: boolean; error?: string };
  mergeReportToIncident: (
    reportId: string,
    incidentId: string,
    rationale: string
  ) => { success: boolean; error?: string };

  // MVP 3 Intelligence Methods
  runRiskAssessment: (incidentId: string, customWeights?: RiskWeights) => RiskAssessment;
  runDamageAssessment: (incidentId: string, fieldNotes: string, photos: any[]) => Promise<DamageAssessment>;
  reconcileIncidentReports: (incidentId: string, resolutionNotes: string) => Promise<IncidentReconciliation>;
  updatePriorityWeights: (newWeights: Partial<PriorityWeights>) => void;
  updateRecommendationDecision: (
    recId: string,
    decision: DecisionReviewStatus,
    notes: string,
    checklist: any
  ) => { success: boolean; error?: string };
  generateSituationSummary: (incidentId: string) => Promise<SituationSummaryResult>;
  loadDemoScenario: (key: 'A' | 'B' | 'C' | 'D') => void;

  // MVP 4 Response Orchestration & Field Operations
  missions: ResponseMission[];
  tasks: MissionTask[];
  teams: SimulatedTeam[];
  inventory: ResourceInventory[];
  fieldUpdates: FieldUpdate[];
  escalations: MissionEscalation[];
  auditLogs: MissionAuditLog[];
  coordinationMessages: CoordinationMessage[];
  operationsMetrics: {
    totalMissions: number;
    activeMissions: number;
    pendingAuthorization: number;
    completedMissions: number;
    draftMissions: number;
    deployedTeams: number;
    availableTeams: number;
    lowStockResources: number;
    openEscalations: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
  };

  // MVP 4 Operations Methods
  createMission: (missionData: Partial<ResponseMission>) => { success: boolean; mission?: ResponseMission; error?: string };
  updateMission: (missionId: string, updates: Partial<ResponseMission>) => { success: boolean; error?: string };
  authorizeMission: (
    missionId: string,
    decision: 'Authorized' | 'Revision Required' | 'Rejected',
    notes: string,
    checklist?: any
  ) => { success: boolean; error?: string };
  assignTeamToMission: (missionId: string, teamId: string) => { success: boolean; error?: string };
  removeTeamFromMission: (missionId: string, teamId: string) => { success: boolean; error?: string };
  allocateResourceToMission: (
    missionId: string,
    resourceId: string,
    quantity: number
  ) => { success: boolean; error?: string };
  returnAllocatedResource: (
    missionId: string,
    resourceId: string,
    quantity: number
  ) => { success: boolean; error?: string };
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus,
    progress: number,
    blockers?: string[]
  ) => { success: boolean; error?: string };
  createTask: (taskData: Partial<MissionTask>) => { success: boolean; task?: MissionTask; error?: string };
  submitFieldReport: (
    reportData: Omit<FieldUpdate, 'update_id' | 'timestamp' | 'reporter_id' | 'reporter_name' | 'reporter_role'>
  ) => { success: boolean; update?: FieldUpdate; error?: string };
  raiseEscalation: (
    escalationData: {
      mission_id: string;
      category: EscalationCategory;
      description: string;
      priority: 'Kritis' | 'Tinggi' | 'Sedang';
    }
  ) => { success: boolean; escalation?: MissionEscalation; error?: string };
  resolveEscalation: (escalationId: string, resolutionNotes: string) => { success: boolean; error?: string };
  sendCoordinationMessage: (
    channel: 'Komando Nasional' | 'Sektor Lapangan' | 'Logistik & Armada' | 'Medis & SAR',
    content: string,
    isUrgent?: boolean,
    missionId?: string
  ) => { success: boolean };

  // Shell methods
  setActiveTab: (tab: string) => void;
  setTimeZone: (tz: 'WIB' | 'WITA' | 'WIT') => void;
  setMapLayers: (layers: { showVerifiedIncidents: boolean; showUnverifiedReports: boolean }) => void;
  loginAsRole: (role: UserRole) => void;
  loginAsUser: (user: UserProfile) => void;
  loginByNim: (nim: string) => { success: boolean; user?: UserProfile; error?: string };
  logout: () => void;
  exportDataAsJSON: () => void;
  exportDataAsCSV: () => void;
  exportReportsAsCSV: () => void;
  resetToInitialData: () => void;
}

const defaultFilters: FilterState = {
  searchQuery: '',
  province: 'all',
  disasterType: 'all',
  severity: 'all',
  verificationStatus: 'all',
  responseStatus: 'all',
  dateRange: 'all',
};

const defaultReportFilters: ReportFilterState = {
  searchQuery: '',
  province: 'all',
  disasterType: 'all',
  verificationStatus: 'all',
  reporterType: 'all',
  dateRange: 'all',
  hasDuplicateFlag: 'all',
};

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Incidents state
  const [incidents, setIncidents] = useState<DisasterIncident[]>(() => {
    const saved = localStorage.getItem('resq911_incidents_mvp');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved incidents', e);
      }
    }
    return INITIAL_SIMULATED_INCIDENTS;
  });

  // Reports state (MVP 2)
  const [reports, setReports] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('resq911_reports_mvp2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved reports', e);
      }
    }
    return INITIAL_SIMULATED_REPORTS;
  });

  // Report-to-Incident links
  const [reportLinks, setReportLinks] = useState<ReportIncidentLink[]>(() => {
    const saved = localStorage.getItem('resq911_report_links_mvp2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved links', e);
      }
    }
    return INITIAL_REPORT_LINKS;
  });

  // Verification audit logs
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(() => {
    const saved = localStorage.getItem('resq911_verification_logs_mvp2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logs', e);
      }
    }
    return INITIAL_VERIFICATION_LOGS;
  });

  // Filters & selection
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [reportFilters, setReportFiltersState] = useState<ReportFilterState>(defaultReportFilters);
  const [activeIncident, setActiveIncident] = useState<DisasterIncident | null>(null);
  const [activeReport, setActiveReport] = useState<IncidentReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [timeZone, setTimeZone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);

  // MVP 4 Operations States
  const [missions, setMissions] = useState<ResponseMission[]>(() => {
    const saved = localStorage.getItem('resq911_missions_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved missions', e);
      }
    }
    return INITIAL_RESPONSE_MISSIONS;
  });

  const [tasks, setTasks] = useState<MissionTask[]>(() => {
    const saved = localStorage.getItem('resq911_tasks_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return INITIAL_MISSION_TASKS;
  });

  const [teams, setTeams] = useState<SimulatedTeam[]>(() => {
    const saved = localStorage.getItem('resq911_teams_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved teams', e);
      }
    }
    return INITIAL_SIMULATED_TEAMS;
  });

  const [inventory, setInventory] = useState<ResourceInventory[]>(() => {
    const saved = localStorage.getItem('resq911_inventory_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inventory', e);
      }
    }
    return INITIAL_RESOURCE_INVENTORY;
  });

  const [fieldUpdates, setFieldUpdates] = useState<FieldUpdate[]>(() => {
    const saved = localStorage.getItem('resq911_fupdates_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved field updates', e);
      }
    }
    return INITIAL_FIELD_UPDATES;
  });

  const [escalations, setEscalations] = useState<MissionEscalation[]>(() => {
    const saved = localStorage.getItem('resq911_escalations_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved escalations', e);
      }
    }
    return INITIAL_MISSION_ESCALATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<MissionAuditLog[]>(() => {
    const saved = localStorage.getItem('resq911_audit_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved audit logs', e);
      }
    }
    return INITIAL_MISSION_AUDIT_LOGS;
  });

  const [coordinationMessages, setCoordinationMessages] = useState<CoordinationMessage[]>(() => {
    const saved = localStorage.getItem('resq911_coord_mvp4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    return INITIAL_COORDINATION_MESSAGES;
  });

  // Map layer controls
  const [mapLayers, setMapLayers] = useState({
    showVerifiedIncidents: true,
    showUnverifiedReports: true,
  });

  // MVP 3 Intelligence States
  const [riskAssessments, setRiskAssessments] = useState<Record<string, RiskAssessment>>(() => {
    const saved = localStorage.getItem('resq911_risk_assessments_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved risk assessments', e);
      }
    }
    return INITIAL_RISK_ASSESSMENTS;
  });

  const [damageAssessments, setDamageAssessments] = useState<Record<string, DamageAssessment>>(() => {
    const saved = localStorage.getItem('resq911_damage_assessments_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved damage assessments', e);
      }
    }
    return INITIAL_DAMAGE_ASSESSMENTS;
  });

  const [reconciliations, setReconciliations] = useState<Record<string, IncidentReconciliation>>(() => {
    const saved = localStorage.getItem('resq911_reconciliations_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved reconciliations', e);
      }
    }
    return INITIAL_RECONCILIATIONS;
  });

  const [priorityWeights, setPriorityWeights] = useState<PriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);

  const [recommendations, setRecommendations] = useState<DecisionRecommendation[]>(() => {
    const saved = localStorage.getItem('resq911_recommendations_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved recommendations', e);
      }
    }
    return INITIAL_DECISION_RECOMMENDATIONS;
  });

  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetric[]>(() => {
    const saved = localStorage.getItem('resq911_recovery_metrics_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved recovery metrics', e);
      }
    }
    return INITIAL_RECOVERY_METRICS;
  });

  const [aiAnalysisRuns, setAiAnalysisRuns] = useState<AIAnalysisRun[]>(() => {
    const saved = localStorage.getItem('resq911_ai_runs_mvp3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved ai runs', e);
      }
    }
    return INITIAL_AI_RUNS;
  });

  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  // Persist state changes
  useEffect(() => {
    try {
      localStorage.setItem('resq911_incidents_mvp', JSON.stringify(incidents));
    } catch (e) {
      console.warn('LocalStorage save failed for incidents', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_reports_mvp2', JSON.stringify(reports));
    } catch (e) {
      console.warn('LocalStorage save failed for reports', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_report_links_mvp2', JSON.stringify(reportLinks));
    } catch (e) {
      console.warn('LocalStorage save failed for links', e);
    }
  }, [reportLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_verification_logs_mvp2', JSON.stringify(verificationLogs));
    } catch (e) {
      console.warn('LocalStorage save failed for logs', e);
    }
  }, [verificationLogs]);

  // Duplicate candidates computed across current reports
  const duplicateCandidates = useMemo(() => {
    return findPotentialDuplicates(reports);
  }, [reports]);

  // Filtered Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery =
          item.incident_id.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.province.toLowerCase().includes(query) ||
          item.regency.toLowerCase().includes(query) ||
          item.disaster_type.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (filters.province !== 'all' && item.province !== filters.province) return false;
      if (filters.disasterType !== 'all' && item.disaster_type !== filters.disasterType) return false;
      if (filters.severity !== 'all' && item.severity !== filters.severity) return false;
      if (filters.verificationStatus !== 'all' && item.verification_status !== filters.verificationStatus)
        return false;
      if (filters.responseStatus !== 'all' && item.response_status !== filters.responseStatus) return false;

      if (filters.dateRange !== 'all') {
        const incidentTime = new Date(item.reported_at).getTime();
        const now = Date.now();
        const diffHours = (now - incidentTime) / (1000 * 3600);
        if (filters.dateRange === '24h' && diffHours > 24) return false;
        if (filters.dateRange === '7d' && diffHours > 24 * 7) return false;
        if (filters.dateRange === '30d' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [incidents, filters]);

  // Filtered Reports (MVP 2)
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (reportFilters.searchQuery.trim()) {
        const query = reportFilters.searchQuery.toLowerCase();
        const matches =
          item.report_id.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.province.toLowerCase().includes(query) ||
          item.regency.toLowerCase().includes(query) ||
          item.subdistrict.toLowerCase().includes(query) ||
          item.reporter_name.toLowerCase().includes(query) ||
          item.disaster_type.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (reportFilters.province !== 'all' && item.province !== reportFilters.province) return false;
      if (reportFilters.disasterType !== 'all' && item.disaster_type !== reportFilters.disasterType)
        return false;
      if (
        reportFilters.verificationStatus !== 'all' &&
        item.verification_status !== reportFilters.verificationStatus
      )
        return false;
      if (reportFilters.reporterType !== 'all' && item.reporter_type !== reportFilters.reporterType)
        return false;

      if (reportFilters.hasDuplicateFlag === 'yes' && !item.potential_duplicate) return false;
      if (reportFilters.hasDuplicateFlag === 'no' && item.potential_duplicate) return false;

      if (reportFilters.dateRange !== 'all') {
        const reportTime = new Date(item.created_at).getTime();
        const now = Date.now();
        const diffHours = (now - reportTime) / (1000 * 3600);
        if (reportFilters.dateRange === '24h' && diffHours > 24) return false;
        if (reportFilters.dateRange === '7d' && diffHours > 24 * 7) return false;
        if (reportFilters.dateRange === '30d' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [reports, reportFilters]);

  // Incident Statistics (strictly derived from filtered incidents)
  const stats = useMemo(() => {
    const totalIncidents = filteredIncidents.length;
    const activeIncidents = filteredIncidents.filter(
      (i) => i.response_status === 'Respons Aktif' || i.response_status === 'Siaga / Assessment'
    ).length;
    const affectedPopulation = filteredIncidents.reduce((acc, curr) => acc + curr.affected_population, 0);
    const displacedPopulation = filteredIncidents.reduce((acc, curr) => acc + curr.displaced_population, 0);
    const highRiskProvinces = new Set(
      filteredIncidents
        .filter((i) => i.severity === 'Kritis' || i.severity === 'Tinggi')
        .map((i) => i.province)
    );
    const unverifiedCount = filteredIncidents.filter((i) => i.verification_status === 'Belum Diverifikasi').length;
    const activeResponseCount = filteredIncidents.filter((i) => i.response_status === 'Respons Aktif').length;
    const completedResponseCount = filteredIncidents.filter((i) => i.response_status === 'Selesai').length;

    return {
      totalIncidents,
      activeIncidents,
      affectedPopulation,
      displacedPopulation,
      highRiskRegionsCount: highRiskProvinces.size,
      unverifiedCount,
      activeResponseCount,
      completedResponseCount,
    };
  }, [filteredIncidents]);

  // Report Statistics (strictly derived from reports)
  const reportStats = useMemo(() => {
    const totalReports = reports.length;
    const pendingValidation = reports.filter((r) => r.verification_status === 'Dalam Verifikasi').length;
    const pendingVerification = reports.filter((r) => r.verification_status === 'Belum Diverifikasi').length;
    const potentialDuplicates = reports.filter((r) => r.potential_duplicate || r.verification_status === 'Duplikat').length;
    const verifiedReports = reports.filter((r) => r.verification_status === 'Terverifikasi').length;
    const rejectedReports = reports.filter((r) => r.verification_status === 'Ditolak').length;
    const clarificationRequired = reports.filter((r) => r.verification_status === 'Perlu Klarifikasi').length;

    return {
      totalReports,
      pendingValidation,
      pendingVerification,
      potentialDuplicates,
      verifiedReports,
      rejectedReports,
      clarificationRequired,
    };
  }, [reports]);

  // MVP 3 Priority Assessments (recalculated whenever incidents, riskAssessments, or weights change)
  const priorityAssessments = useMemo(() => {
    return calculatePriorityRankings(incidents, riskAssessments, priorityWeights);
  }, [incidents, riskAssessments, priorityWeights]);

  // MVP 3 Intelligence Statistics
  const intelligenceStats = useMemo(() => {
    const eligibleIncidents = incidents.filter(
      (i) => i.verification_status === 'Terverifikasi' || i.verification_status === 'Dalam Verifikasi'
    ).length;
    const analysesCompleted = Object.keys(riskAssessments).length;
    const analysesRequiringReview = recommendations.filter(
      (r) => r.status === 'Awaiting Review' || r.status === 'Under Review'
    ).length;
    const insufficientDataCount = Object.values(riskAssessments).filter(
      (r) => r.data_quality_status === 'Data Tidak Memadai'
    ).length;
    const highPriorityRecommendations = recommendations.filter((r) => r.priority_score >= 75).length;
    const pendingHumanApprovals = recommendations.filter((r) => r.status === 'Awaiting Review').length;
    const latestAnalysisTimestamp = aiAnalysisRuns[0]?.created_at || new Date().toISOString();

    return {
      eligibleIncidents,
      analysesCompleted,
      analysesRequiringReview,
      insufficientDataCount,
      highPriorityRecommendations,
      pendingHumanApprovals,
      latestAnalysisTimestamp,
    };
  }, [incidents, riskAssessments, recommendations, aiAnalysisRuns]);

  // MVP 4 Operations Metrics
  const operationsMetrics = useMemo(() => {
    return calculateOperationsMetrics(missions, tasks, teams, inventory, escalations);
  }, [missions, tasks, teams, inventory, escalations]);

  // Persist MVP 4 state changes
  useEffect(() => {
    try {
      localStorage.setItem('resq911_missions_mvp4', JSON.stringify(missions));
    } catch (e) {}
  }, [missions]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_tasks_mvp4', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_teams_mvp4', JSON.stringify(teams));
    } catch (e) {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_inventory_mvp4', JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_fupdates_mvp4', JSON.stringify(fieldUpdates));
    } catch (e) {}
  }, [fieldUpdates]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_escalations_mvp4', JSON.stringify(escalations));
    } catch (e) {}
  }, [escalations]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_audit_mvp4', JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('resq911_coord_mvp4', JSON.stringify(coordinationMessages));
    } catch (e) {}
  }, [coordinationMessages]);

  // Incident methods
  const setFilters = (update: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...update }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  const setReportFilters = (update: Partial<ReportFilterState>) => {
    setReportFiltersState((prev) => ({ ...prev, ...update }));
  };

  const resetReportFilters = () => {
    setReportFiltersState(defaultReportFilters);
  };

  const updateIncidentVerification = (id: string, status: VerificationStatus) => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id || item.incident_id === id) {
          const updated = {
            ...item,
            verification_status: status,
            last_updated: new Date().toISOString(),
          };
          if (activeIncident && (activeIncident.id === id || activeIncident.incident_id === id)) {
            setActiveIncident(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const updateIncidentResponse = (id: string, status: ResponseStatus) => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id === id || item.incident_id === id) {
          const updated = {
            ...item,
            response_status: status,
            last_updated: new Date().toISOString(),
          };
          if (activeIncident && (activeIncident.id === id || activeIncident.incident_id === id)) {
            setActiveIncident(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addNewIncident = (data: Omit<DisasterIncident, 'id' | 'incident_id' | 'last_updated'>) => {
    const nextNumber = 900 + incidents.length + 1;
    const newInc: DisasterIncident = {
      ...data,
      id: `inc-user-${Date.now()}`,
      incident_id: `RSQ-2026-${nextNumber.toString().padStart(4, '0')}`,
      last_updated: new Date().toISOString(),
    };
    setIncidents((prev) => [newInc, ...prev]);
    setActiveIncident(newInc);
  };

  // MVP 2: Report submission workflow
  const submitNewReport = (
    data: Omit<
      IncidentReport,
      'id' | 'report_id' | 'created_at' | 'updated_at' | 'verification_status' | 'potential_duplicate'
    >
  ) => {
    // 1. Run deterministic validation
    const validation = validateIncidentReport(data);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const nextIdNum = 100 + reports.length + 1;
    const reportId = `LAP-2026-${nextIdNum.toString().padStart(4, '0')}`;
    const nowIso = new Date().toISOString();

    const candidateReport: IncidentReport = {
      ...data,
      id: `rep-${Date.now()}`,
      report_id: reportId,
      verification_status: 'Belum Diverifikasi',
      potential_duplicate: false,
      created_at: nowIso,
      updated_at: nowIso,
      submitted_by_user_id: currentUser.id,
    };

    // 2. Run duplicate check against existing reports
    let foundDup = false;
    let matchedId: string | undefined = undefined;
    let highestScore = 0;

    for (const existing of reports) {
      const match = evaluateReportSimilarity(candidateReport, existing);
      if (match && match.similarity_score >= 0.70) {
        if (match.similarity_score > highestScore) {
          highestScore = match.similarity_score;
          matchedId = existing.report_id;
          foundDup = true;
        }
      }
    }

    if (foundDup) {
      candidateReport.potential_duplicate = true;
      candidateReport.duplicate_matched_id = matchedId;
      candidateReport.similarity_score = highestScore;
    }

    // 3. Save report
    setReports((prev) => [candidateReport, ...prev]);

    // 4. Log audit entry
    const newLog: VerificationLog = {
      id: `log-${Date.now()}`,
      report_id: reportId,
      report_title: candidateReport.title,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'REPORT_SUBMITTED',
      old_status: '-',
      new_status: 'Belum Diverifikasi',
      notes: `Laporan baru diajukan oleh ${currentUser.name} (${currentUser.role}). Validasi deterministik data: LOLOS.${
        foundDup ? ` Sistem menandai potensi kemiripan dengan laporan ${matchedId} (skor ${highestScore}).` : ''
      }`,
      timestamp: nowIso,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    setActiveReport(candidateReport);
    return { success: true, report: candidateReport };
  };

  // MVP 2: Verification Workflow
  const verifyReport = (
    reportId: string,
    options: {
      createNewIncident?: boolean;
      targetIncidentId?: string;
      notes: string;
      overrideSeverity?: string;
    }
  ) => {
    // Role permissions check
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Viewer Eksekutif tidak memiliki kewenangan verifikasi.' };
    }

    const report = reports.find((r) => r.id === reportId || r.report_id === reportId);
    if (!report) {
      return { success: false, error: 'Laporan tidak ditemukan.' };
    }

    // Prevent user from verifying their own report
    if (report.submitted_by_user_id === currentUser.id) {
      return {
        success: false,
        error: 'Pemisahan Kewenangan: Petugas tidak diperkenankan memverifikasi laporan yang diajukan sendiri.',
      };
    }

    const nowIso = new Date().toISOString();
    let assignedIncidentId = options.targetIncidentId;

    if (options.createNewIncident || !assignedIncidentId) {
      // Create a verified incident
      const nextNum = 900 + incidents.length + 1;
      assignedIncidentId = `RSQ-2026-${nextNum.toString().padStart(4, '0')}`;

      const newIncident: DisasterIncident = {
        id: `inc-ver-${Date.now()}`,
        incident_id: assignedIncidentId,
        disaster_type: report.disaster_type,
        title: report.title,
        province: report.province,
        regency: report.regency,
        subdistrict: report.subdistrict,
        village: report.village,
        latitude: report.latitude,
        longitude: report.longitude,
        reported_at: report.created_at,
        severity: (options.overrideSeverity as any) || report.urgency || 'Sedang',
        affected_population: report.estimated_affected || 0,
        displaced_population: report.estimated_displaced || 0,
        injured_count: report.estimated_injured || 0,
        fatalities_count: report.estimated_fatalities || 0,
        damaged_houses: Math.round((report.estimated_displaced || 0) * 0.25),
        verification_status: 'Terverifikasi',
        response_status: 'Siaga / Assessment',
        data_source: `Laporan Sumber Terverifikasi: ${report.report_id} (${report.reporter_name})`,
        last_updated: nowIso,
        description: report.description,
        needs: report.urgent_needs || ['Pangan', 'Air Bersih', 'Terpal'],
        assigned_team: `TRC Pos Komando ${report.regency}`,
        linked_report_ids: [report.report_id],
        verified_by: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
        verified_at: nowIso,
      };

      setIncidents((prev) => [newIncident, ...prev]);
    } else {
      // Link to existing incident and update linked_report_ids
      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.incident_id === assignedIncidentId || inc.id === assignedIncidentId) {
            const currentLinked = inc.linked_report_ids || [];
            return {
              ...inc,
              linked_report_ids: Array.from(new Set([...currentLinked, report.report_id])),
              last_updated: nowIso,
            };
          }
          return inc;
        })
      );
    }

    // Update Report status
    const updatedReport: IncidentReport = {
      ...report,
      verification_status: 'Terverifikasi',
      incident_candidate_id: assignedIncidentId,
      verified_by: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
      verified_at: nowIso,
      updated_at: nowIso,
    };

    setReports((prev) => prev.map((r) => (r.id === report.id ? updatedReport : r)));
    if (activeReport && activeReport.id === report.id) {
      setActiveReport(updatedReport);
    }

    // Create Report-Incident Link
    const newLink: ReportIncidentLink = {
      id: `link-${Date.now()}`,
      report_id: report.report_id,
      incident_id: assignedIncidentId,
      link_type: 'PRIMARY_EVIDENCE',
      linked_by: currentUser.id,
      linked_by_name: currentUser.name,
      linked_at: nowIso,
      rationale: options.notes || 'Verifikasi kelayakan laporan lapangan memenuhi kriteria insiden resmi.',
    };
    setReportLinks((prev) => [newLink, ...prev]);

    // Record Audit Log
    const newLog: VerificationLog = {
      id: `log-${Date.now()}`,
      report_id: report.report_id,
      report_title: report.title,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'VERIFIED',
      old_status: report.verification_status,
      new_status: 'Terverifikasi',
      notes: `Laporan berhasil diverifikasi oleh ${currentUser.name} (${currentUser.role}). Ditautkan ke Insiden Terverifikasi ${assignedIncidentId}. Catatan: ${options.notes}`,
      timestamp: nowIso,
      linked_incident_id: assignedIncidentId,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  const requestReportClarification = (reportId: string, question: string) => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Viewer Eksekutif tidak memiliki hak akses.' };
    }
    if (!question.trim()) {
      return { success: false, error: 'Pertanyaan klarifikasi wajib diisi.' };
    }

    const report = reports.find((r) => r.id === reportId || r.report_id === reportId);
    if (!report) return { success: false, error: 'Laporan tidak ditemukan.' };

    const nowIso = new Date().toISOString();
    const updated: IncidentReport = {
      ...report,
      verification_status: 'Perlu Klarifikasi',
      clarification_notes: question.trim(),
      updated_at: nowIso,
    };

    setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
    if (activeReport && activeReport.id === report.id) setActiveReport(updated);

    const newLog: VerificationLog = {
      id: `log-${Date.now()}`,
      report_id: report.report_id,
      report_title: report.title,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'REQUESTED_CLARIFICATION',
      old_status: report.verification_status,
      new_status: 'Perlu Klarifikasi',
      notes: `Permintaan klarifikasi diajukan: "${question.trim()}".`,
      timestamp: nowIso,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  const rejectReport = (reportId: string, reason: string) => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Viewer Eksekutif tidak memiliki hak akses.' };
    }
    if (!reason.trim()) {
      return { success: false, error: 'Alasan penolakan laporan wajib dicantumkan.' };
    }

    const report = reports.find((r) => r.id === reportId || r.report_id === reportId);
    if (!report) return { success: false, error: 'Laporan tidak ditemukan.' };

    const nowIso = new Date().toISOString();
    const updated: IncidentReport = {
      ...report,
      verification_status: 'Ditolak',
      rejection_reason: reason.trim(),
      updated_at: nowIso,
    };

    setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
    if (activeReport && activeReport.id === report.id) setActiveReport(updated);

    const newLog: VerificationLog = {
      id: `log-${Date.now()}`,
      report_id: report.report_id,
      report_title: report.title,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'REJECTED',
      old_status: report.verification_status,
      new_status: 'Ditolak',
      notes: `Laporan ditolak oleh ${currentUser.name}. Alasan: ${reason.trim()}`,
      timestamp: nowIso,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  const markReportAsDuplicate = (reportId: string, matchedReportOrIncidentId: string, rationale: string) => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Viewer Eksekutif tidak memiliki hak akses.' };
    }
    if (!matchedReportOrIncidentId) {
      return { success: false, error: 'Pilih laporan atau insiden rujukan yang menjadi acuan duplikasi.' };
    }

    const report = reports.find((r) => r.id === reportId || r.report_id === reportId);
    if (!report) return { success: false, error: 'Laporan tidak ditemukan.' };

    const nowIso = new Date().toISOString();
    const updated: IncidentReport = {
      ...report,
      verification_status: 'Duplikat',
      potential_duplicate: true,
      duplicate_matched_id: matchedReportOrIncidentId,
      updated_at: nowIso,
    };

    setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
    if (activeReport && activeReport.id === report.id) setActiveReport(updated);

    // Add link
    const newLink: ReportIncidentLink = {
      id: `link-${Date.now()}`,
      report_id: report.report_id,
      incident_id: matchedReportOrIncidentId,
      link_type: 'DUPLICATE_SOURCE',
      linked_by: currentUser.id,
      linked_by_name: currentUser.name,
      linked_at: nowIso,
      rationale: rationale || 'Ditandai sebagai laporan duplikat.',
    };
    setReportLinks((prev) => [newLink, ...prev]);

    const newLog: VerificationLog = {
      id: `log-${Date.now()}`,
      report_id: report.report_id,
      report_title: report.title,
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action: 'FLAGGED_DUPLICATE',
      old_status: report.verification_status,
      new_status: 'Duplikat',
      notes: `Ditandai duplikat dari ${matchedReportOrIncidentId}. Rationale: ${rationale}`,
      timestamp: nowIso,
    };
    setVerificationLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  const mergeReportToIncident = (reportId: string, incidentId: string, rationale: string) => {
    return markReportAsDuplicate(reportId, incidentId, rationale);
  };

  const loginAsRole = (role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(found);
    setIsLoggedIn(true);
  };

  const loginAsUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const loginByNim = (nim: string): { success: boolean; user?: UserProfile; error?: string } => {
    const cleanNim = nim.trim();
    const found = DEMO_USERS.find((u) => u.nim === cleanNim || u.nim.includes(cleanNim));
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
      return { success: true, user: found };
    }
    return {
      success: false,
      error: `Pengguna dengan NIM "${nim}" tidak terdaftar dalam basis data personel komando. Silakan pilih dari daftar 6 personel resmi.`
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // MVP 4 Operations Methods
  const createMission = (missionData: Partial<ResponseMission>): { success: boolean; mission?: ResponseMission; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Viewer Eksekutif hanya memiliki hak baca.' };
    }
    const newId = `MSN-2026-0${100 + missions.length + 1}`;
    const newMission: ResponseMission = {
      mission_id: newId,
      incident_id: missionData.incident_id || 'RSQ-2026-0001',
      recommendation_id: missionData.recommendation_id,
      title: missionData.title || `Operasi Tanggap Darurat ${newId}`,
      disaster_type: missionData.disaster_type || 'Banjir',
      province: missionData.province || 'Jawa Tengah',
      regency: missionData.regency || 'Demak',
      subdistrict: missionData.subdistrict || 'Karanganyar',
      location_name: missionData.location_name || 'Sektor Tanggap Darurat',
      latitude: missionData.latitude || -6.8921,
      longitude: missionData.longitude || 110.7421,
      objective: missionData.objective || 'Pelaksanaan operasi penyelamatan dan perlindungan pengungsi.',
      proposed_actions: missionData.proposed_actions || ['Penyelamatan warga terdampak', 'Pengamanan posko shelter'],
      priority: missionData.priority || 'Tinggi',
      estimated_start: missionData.estimated_start || new Date().toISOString(),
      estimated_end: missionData.estimated_end || new Date(Date.now() + 86400000 * 5).toISOString(),
      required_capabilities: missionData.required_capabilities || ['Water Rescue', 'Pertolongan Pertama'],
      required_team_size: missionData.required_team_size || 20,
      required_resources_summary: missionData.required_resources_summary || ['2x Perahu Karet LCR', '1x Tenda Peleton'],
      known_constraints: missionData.known_constraints || ['Akses jalan tergenang air'],
      planning_notes: missionData.planning_notes || 'Draf operasi disusun melalui sistem RESQ.911.',
      created_by: `${currentUser.name} (${currentUser.nim || ''})`,
      created_by_nim: currentUser.nim,
      created_at: new Date().toISOString(),
      status: missionData.status || 'Pending Authorization',
      assigned_team_ids: missionData.assigned_team_ids || [],
      allocated_resource_ids: missionData.allocated_resource_ids || [],
      progress_percentage: 0,
      target_victims_evacuated: missionData.target_victims_evacuated || 500,
      actual_victims_evacuated: 0
    };

    setMissions((prev) => [newMission, ...prev]);

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: newId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'CREATE_MISSION',
      previous_state: 'NONE',
      new_state: newMission.status,
      timestamp: new Date().toISOString(),
      notes: `Perencanaan misi "${newMission.title}" dibuat dengan status ${newMission.status}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true, mission: newMission };
  };

  const updateMission = (missionId: string, updates: Partial<ResponseMission>): { success: boolean; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Viewer Eksekutif hanya memiliki hak baca.' };
    }
    const target = missions.find((m) => m.mission_id === missionId);
    if (!target) return { success: false, error: 'Misi tidak ditemukan' };

    const updated = { ...target, ...updates };
    setMissions((prev) => prev.map((m) => (m.mission_id === missionId ? updated : m)));

    if (updates.status && updates.status !== target.status) {
      const newAudit: MissionAuditLog = {
        log_id: `AUD-${Date.now().toString().slice(-6)}`,
        mission_id: missionId,
        actor_id: currentUser.id,
        actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
        actor_role: currentUser.role,
        action: 'UPDATE_MISSION_STATUS',
        previous_state: target.status,
        new_state: updates.status,
        timestamp: new Date().toISOString(),
        notes: `Status misi diperbarui menjadi "${updates.status}".`
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }

    return { success: true };
  };

  const authorizeMission = (
    missionId: string,
    decision: 'Authorized' | 'Revision Required' | 'Rejected',
    notes: string,
    checklist?: any
  ): { success: boolean; error?: string } => {
    if (currentUser.role !== 'ADMIN_NASIONAL' && currentUser.role !== 'OPERATOR_DAERAH') {
      return {
        success: false,
        error: 'Akses Ditolak: Otorisasi misi tanggap darurat hanya dapat dilakukan oleh Administrator Nasional atau Operator Daerah.'
      };
    }

    const target = missions.find((m) => m.mission_id === missionId);
    if (!target) return { success: false, error: 'Misi tidak ditemukan' };

    let newStatus = target.status;
    if (decision === 'Authorized') newStatus = 'Authorized';
    else if (decision === 'Revision Required') newStatus = 'Pending Authorization';
    else if (decision === 'Rejected') newStatus = 'Cancelled';

    const updated: ResponseMission = {
      ...target,
      status: newStatus,
      approved_by: `${currentUser.name} (${currentUser.nim || ''})`,
      approved_by_role: currentUser.role,
      approved_at: new Date().toISOString(),
      approval_notes: notes
    };

    setMissions((prev) => prev.map((m) => (m.mission_id === missionId ? updated : m)));

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: decision === 'Authorized' ? 'AUTHORIZE_MISSION' : decision === 'Revision Required' ? 'REQUEST_REVISION' : 'REJECT_MISSION',
      previous_state: target.status,
      new_state: newStatus,
      timestamp: new Date().toISOString(),
      notes: `Keputusan otorisasi: ${decision}. Catatan: ${notes}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const assignTeamToMission = (missionId: string, teamId: string): { success: boolean; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Viewer Eksekutif hanya memiliki hak baca.' };
    }
    const mission = missions.find((m) => m.mission_id === missionId);
    if (!mission) return { success: false, error: 'Misi tidak ditemukan' };
    const team = teams.find((t) => t.team_id === teamId);
    if (!team) return { success: false, error: 'Tim tidak ditemukan' };

    if (mission.assigned_team_ids.includes(teamId)) {
      return { success: false, error: 'Tim ini sudah ditugaskan pada misi tersebut.' };
    }

    const updatedTeamIds = [...mission.assigned_team_ids, teamId];
    setMissions((prev) =>
      prev.map((m) =>
        m.mission_id === missionId
          ? {
              ...m,
              assigned_team_ids: updatedTeamIds,
              status: m.status === 'Authorized' || m.status === 'Draft' ? 'In Progress' : m.status
            }
          : m
      )
    );

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId
          ? {
              ...t,
              availability: 'Assigned',
              current_assignment_mission_id: missionId,
              last_status_update: 'Baru saja'
            }
          : t
      )
    );

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'ASSIGN_TEAM',
      previous_state: team.availability,
      new_state: 'Assigned',
      timestamp: new Date().toISOString(),
      notes: `Tim "${team.team_name}" ditugaskan ke misi ${missionId}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const removeTeamFromMission = (missionId: string, teamId: string): { success: boolean; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Viewer Eksekutif hanya memiliki hak baca.' };
    }
    setMissions((prev) =>
      prev.map((m) =>
        m.mission_id === missionId
          ? {
              ...m,
              assigned_team_ids: m.assigned_team_ids.filter((id) => id !== teamId)
            }
          : m
      )
    );

    setTeams((prev) =>
      prev.map((t) =>
        t.team_id === teamId
          ? {
              ...t,
              availability: 'Available',
              current_assignment_mission_id: undefined,
              last_status_update: 'Tersedia kembali'
            }
          : t
      )
    );

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'RELEASE_TEAM',
      previous_state: 'Assigned',
      new_state: 'Available',
      timestamp: new Date().toISOString(),
      notes: `Tim ${teamId} dilepas dari misi ${missionId}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const allocateResourceToMission = (
    missionId: string,
    resourceId: string,
    quantity: number
  ): { success: boolean; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Viewer Eksekutif hanya memiliki hak baca.' };
    }
    const mission = missions.find((m) => m.mission_id === missionId);
    if (!mission) return { success: false, error: 'Misi tidak ditemukan' };

    const inv = inventory.find((r) => r.resource_id === resourceId);
    if (!inv) return { success: false, error: 'Item sumber daya tidak terdaftar dalam inventori.' };

    if (quantity <= 0) return { success: false, error: 'Kuantitas alokasi harus lebih dari 0.' };
    if (quantity > inv.quantity_available) {
      return {
        success: false,
        error: `Stok tidak mencukupi: Permintaan (${quantity} ${inv.unit}) melebihi sisa stok tersedia (${inv.quantity_available} ${inv.unit}).`
      };
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.resource_id === resourceId
          ? {
              ...item,
              quantity_available: item.quantity_available - quantity,
              quantity_assigned: item.quantity_assigned + quantity,
              last_updated: 'Baru saja'
            }
          : item
      )
    );

    setMissions((prev) =>
      prev.map((m) =>
        m.mission_id === missionId
          ? {
              ...m,
              allocated_resource_ids: m.allocated_resource_ids.includes(resourceId)
                ? m.allocated_resource_ids
                : [...m.allocated_resource_ids, resourceId]
            }
          : m
      )
    );

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'ALLOCATE_RESOURCE',
      previous_state: `${inv.quantity_available} ${inv.unit}`,
      new_state: `${inv.quantity_available - quantity} ${inv.unit}`,
      timestamp: new Date().toISOString(),
      notes: `Alokasi ${quantity} ${inv.unit} ${inv.resource_name} untuk misi ${missionId}.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const returnAllocatedResource = (
    missionId: string,
    resourceId: string,
    quantity: number
  ): { success: boolean; error?: string } => {
    const inv = inventory.find((r) => r.resource_id === resourceId);
    if (!inv) return { success: false, error: 'Sumber daya tidak ditemukan' };

    setInventory((prev) =>
      prev.map((item) =>
        item.resource_id === resourceId
          ? {
              ...item,
              quantity_available: item.quantity_available + quantity,
              quantity_assigned: Math.max(0, item.quantity_assigned - quantity),
              last_updated: 'Baru saja'
            }
          : item
      )
    );

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'RETURN_RESOURCE',
      previous_state: `${inv.quantity_available} ${inv.unit}`,
      new_state: `${inv.quantity_available + quantity} ${inv.unit}`,
      timestamp: new Date().toISOString(),
      notes: `Pengembalian ${quantity} ${inv.unit} ${inv.resource_name} ke gudang.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const updateTaskStatus = (
    taskId: string,
    status: TaskStatus,
    progress: number,
    blockers?: string[]
  ): { success: boolean; error?: string } => {
    const targetTask = tasks.find((t) => t.task_id === taskId);
    if (!targetTask) return { success: false, error: 'Tugas operasional tidak ditemukan' };

    const updatedTask: MissionTask = {
      ...targetTask,
      task_status: status,
      progress_percentage: Math.min(100, Math.max(0, progress)),
      blockers: blockers !== undefined ? blockers : targetTask.blockers,
      last_updated: 'Baru saja',
      actual_start: status === 'In Progress' && !targetTask.actual_start ? new Date().toISOString() : targetTask.actual_start,
      actual_end: status === 'Completed' ? new Date().toISOString() : targetTask.actual_end
    };

    setTasks((prev) => prev.map((t) => (t.task_id === taskId ? updatedTask : t)));

    // Update parent mission progress
    const relatedTasks = tasks.map((t) => (t.task_id === taskId ? updatedTask : t)).filter((t) => t.mission_id === targetTask.mission_id);
    if (relatedTasks.length > 0) {
      const avgProgress = Math.round(
        relatedTasks.reduce((acc, t) => acc + t.progress_percentage, 0) / relatedTasks.length
      );
      setMissions((prev) =>
        prev.map((m) =>
          m.mission_id === targetTask.mission_id
            ? {
                ...m,
                progress_percentage: avgProgress,
                status: avgProgress === 100 ? 'Completed' : m.status
              }
            : m
        )
      );
    }

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: targetTask.mission_id,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'UPDATE_TASK',
      previous_state: `${targetTask.task_status} (${targetTask.progress_percentage}%)`,
      new_state: `${status} (${progress}%)`,
      timestamp: new Date().toISOString(),
      notes: `Tugas "${targetTask.task_title}" diperbarui.`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const createTask = (taskData: Partial<MissionTask>): { success: boolean; task?: MissionTask; error?: string } => {
    if (!taskData.mission_id) return { success: false, error: 'ID Misi harus disertakan' };
    const newTask: MissionTask = {
      task_id: `TSK-${Date.now().toString().slice(-6)}`,
      mission_id: taskData.mission_id,
      task_title: taskData.task_title || 'Tugas Baru Lapangan',
      description: taskData.description || 'Deskripsi tugas operasional tanggap darurat.',
      assigned_team_id: taskData.assigned_team_id,
      assigned_team_name: taskData.assigned_team_name,
      priority: taskData.priority || 'Tinggi',
      planned_start: taskData.planned_start || new Date().toISOString(),
      planned_end: taskData.planned_end || new Date(Date.now() + 86400000).toISOString(),
      task_status: 'Assigned',
      progress_percentage: 0,
      blockers: [],
      last_updated: 'Baru saja',
      location_label: taskData.location_label || 'Sektor Utama',
      required_skill: taskData.required_skill || 'Water Rescue'
    };

    setTasks((prev) => [newTask, ...prev]);
    return { success: true, task: newTask };
  };

  const submitFieldReport = (
    reportData: Omit<FieldUpdate, 'update_id' | 'timestamp' | 'reporter_id' | 'reporter_name' | 'reporter_role'>
  ): { success: boolean; update?: FieldUpdate; error?: string } => {
    const newUpdate: FieldUpdate = {
      ...reportData,
      update_id: `FUP-${Date.now().toString().slice(-6)}`,
      reporter_id: currentUser.id,
      reporter_name: `${currentUser.name} (${currentUser.nim || ''})`,
      reporter_role: currentUser.role,
      timestamp: new Date().toISOString(),
      verification_status: 'Diverifikasi Posko'
    };

    setFieldUpdates((prev) => [newUpdate, ...prev]);

    if (reportData.task_id) {
      updateTaskStatus(reportData.task_id, 'In Progress', reportData.progress_percentage);
    }

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: reportData.mission_id,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'SUBMIT_FIELD_UPDATE',
      previous_state: 'Laporan Lapangan',
      new_state: `${reportData.progress_percentage}% Selesai`,
      timestamp: new Date().toISOString(),
      notes: `Laporan situasi lapangan: ${reportData.situation_description.slice(0, 100)}...`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true, update: newUpdate };
  };

  const raiseEscalation = (escalationData: {
    mission_id: string;
    category: EscalationCategory;
    description: string;
    priority: 'Kritis' | 'Tinggi' | 'Sedang';
  }): { success: boolean; escalation?: MissionEscalation; error?: string } => {
    const mission = missions.find((m) => m.mission_id === escalationData.mission_id);
    const newEsc: MissionEscalation = {
      escalation_id: `ESC-${Date.now().toString().slice(-6)}`,
      mission_id: escalationData.mission_id,
      mission_title: mission?.title || `Misi ${escalationData.mission_id}`,
      raised_by: `${currentUser.name} (${currentUser.nim || ''})`,
      raised_by_role: currentUser.role,
      category: escalationData.category,
      description: escalationData.description,
      priority: escalationData.priority,
      status: 'Open',
      created_at: new Date().toISOString()
    };

    setEscalations((prev) => [newEsc, ...prev]);

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: escalationData.mission_id,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'RAISE_ESCALATION',
      previous_state: 'Normal',
      new_state: `Eskalasi ${escalationData.category}`,
      timestamp: new Date().toISOString(),
      notes: `Kendala darurat dilaporkan: ${escalationData.description}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true, escalation: newEsc };
  };

  const resolveEscalation = (escalationId: string, resolutionNotes: string): { success: boolean; error?: string } => {
    const esc = escalations.find((e) => e.escalation_id === escalationId);
    if (!esc) return { success: false, error: 'Eskalasi tidak ditemukan' };

    setEscalations((prev) =>
      prev.map((e) =>
        e.escalation_id === escalationId
          ? {
              ...e,
              status: 'Resolved',
              resolved_at: new Date().toISOString(),
              resolution_notes: resolutionNotes,
              owner_name: `${currentUser.name} (${currentUser.nim || ''})`
            }
          : e
      )
    );

    const newAudit: MissionAuditLog = {
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      mission_id: esc.mission_id,
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.nim || ''})`,
      actor_role: currentUser.role,
      action: 'RESOLVE_ESCALATION',
      previous_state: esc.status,
      new_state: 'Resolved',
      timestamp: new Date().toISOString(),
      notes: `Eskalasi diselesaikan: ${resolutionNotes}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return { success: true };
  };

  const sendCoordinationMessage = (
    channel: 'Komando Nasional' | 'Sektor Lapangan' | 'Logistik & Armada' | 'Medis & SAR',
    content: string,
    isUrgent?: boolean,
    missionId?: string
  ): { success: boolean } => {
    const newMsg: CoordinationMessage = {
      message_id: `MSG-${Date.now().toString().slice(-6)}`,
      mission_id: missionId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_nim: currentUser.nim,
      sender_role: currentUser.role,
      timestamp: new Date().toISOString(),
      channel,
      content,
      is_urgent: isUrgent
    };
    setCoordinationMessages((prev) => [...prev, newMsg]);
    return { success: true };
  };

  const resetToInitialData = () => {
    localStorage.removeItem('resq911_incidents_mvp');
    localStorage.removeItem('resq911_reports_mvp2');
    localStorage.removeItem('resq911_report_links_mvp2');
    localStorage.removeItem('resq911_verification_logs_mvp2');
    setIncidents(INITIAL_SIMULATED_INCIDENTS);
    setReports(INITIAL_SIMULATED_REPORTS);
    setReportLinks(INITIAL_REPORT_LINKS);
    setVerificationLogs(INITIAL_VERIFICATION_LOGS);
    setFiltersState(defaultFilters);
    setReportFiltersState(defaultReportFilters);
    setActiveIncident(null);
    setActiveReport(null);
  };

  const exportDataAsJSON = () => {
    const exportObject = {
      incidents: filteredIncidents,
      reports: filteredReports,
      links: reportLinks,
      logs: verificationLogs,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RESQ911_Intelligence_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportDataAsCSV = () => {
    const headers = [
      'incident_id',
      'disaster_type',
      'title',
      'province',
      'regency',
      'latitude',
      'longitude',
      'severity',
      'affected_population',
      'displaced_population',
      'verification_status',
      'response_status',
      'reported_at',
    ];

    const rows = filteredIncidents.map((i) =>
      [
        i.incident_id,
        `"${i.disaster_type}"`,
        `"${i.title.replace(/"/g, '""')}"`,
        `"${i.province}"`,
        `"${i.regency}"`,
        i.latitude,
        i.longitude,
        i.severity,
        i.affected_population,
        i.displaced_population,
        `"${i.verification_status}"`,
        `"${i.response_status}"`,
        i.reported_at,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `RESQ911_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportReportsAsCSV = () => {
    const headers = [
      'report_id',
      'disaster_type',
      'title',
      'province',
      'regency',
      'subdistrict',
      'village',
      'latitude',
      'longitude',
      'urgency',
      'estimated_affected',
      'estimated_displaced',
      'reporter_name',
      'reporter_type',
      'verification_status',
      'potential_duplicate',
      'created_at',
    ];

    const rows = filteredReports.map((r) =>
      [
        r.report_id,
        `"${r.disaster_type}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.province}"`,
        `"${r.regency}"`,
        `"${r.subdistrict}"`,
        `"${r.village}"`,
        r.latitude,
        r.longitude,
        r.urgency,
        r.estimated_affected,
        r.estimated_displaced,
        `"${r.reporter_name}"`,
        `"${r.reporter_type}"`,
        `"${r.verification_status}"`,
        r.potential_duplicate ? 'YA' : 'TIDAK',
        r.created_at,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `RESQ911_Reports_Inbox_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // MVP 3 Intelligence Methods
  const runRiskAssessment = (incidentId: string, customWeights?: RiskWeights): RiskAssessment => {
    const inc = incidents.find((i) => i.incident_id === incidentId);
    if (!inc) throw new Error('Insiden tidak ditemukan');

    const linked = reports.filter((r) => r.incident_candidate_id === incidentId);
    const assessment = calculateDeterministicRisk(inc, linked, customWeights || DEFAULT_RISK_WEIGHTS);

    setRiskAssessments((prev) => {
      const updated = { ...prev, [incidentId]: assessment };
      try {
        localStorage.setItem('resq911_risk_assessments_mvp3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const newRun: AIAnalysisRun = {
      analysis_id: `RUN-${Date.now().toString().slice(-6)}`,
      incident_id: incidentId,
      engine_type: 'RISK_SCORING',
      engine_name: 'Risk Intelligence Engine',
      model_version: 'RESQ-RiskEngine-v1.4',
      prompt_template_version: 'deterministic-scoring-v1.2',
      input_snapshot: `${linked.length} laporan terverifikasi + dampak: ${inc.affected_population || 0} jiwa`,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      execution_time_ms: 110,
      notes: `Kalkulasi skor risiko deterministik: ${assessment.total_score} (${assessment.category}).`,
      output_summary: `Skor: ${assessment.total_score}/100. Kualitas Data: ${assessment.data_quality_status}.`,
      disclaimer: 'Data hasil pembobotan indikatif, bukan komando resmi.',
    };

    setAiAnalysisRuns((prev) => [newRun, ...prev]);
    return assessment;
  };

  const runDamageAssessment = async (incidentId: string, fieldNotes: string, photos: any[]): Promise<DamageAssessment> => {
    const inc = incidents.find((i) => i.incident_id === incidentId);
    if (!inc) throw new Error('Insiden tidak ditemukan');

    let resultObs: any = null;
    let modelVer = 'RESQ-DamageEngine-v1.4 (Mode Simulasi)';

    try {
      const res = await fetch('/api/ai/rapid-damage-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: inc, fieldNotes, photos }),
      });
      if (res.ok) {
        const data = await res.json();
        resultObs = data;
        modelVer = data.modelVersion || modelVer;
      }
    } catch (e) {
      console.warn('Damage Assessment API error', e);
    }

    if (!resultObs) {
      resultObs = {
        brief_description: `Analisis dampak ${inc.disaster_type} di ${inc.regency}. Struktur terdampak mengalami deformasi parsial.`,
        visible_affected_structures: ['Badan jalan utama dan dinding bangunan sekitar'],
        potential_infrastructure_damage: ['Kelistrikan dan pipa saluran drainase terganggu'],
        observable_environmental_conditions: ['Endapan material dan aksesibilitas terhambat'],
        missing_information: ['Uji ketahanan sisa material oleh dinas teknis setempat'],
        questions_requiring_field_confirmation: ['Apakah akses alat berat dapat menjangkau titik kerusakan?'],
        uncertainty_note: 'Kekuatan struktural riil memerlukan verifikasi forensik di lapangan.',
        status: 'Perlu Verifikasi Lapangan',
      };
    }

    const newAssessment: DamageAssessment = {
      assessment_id: `DMG-${incidentId.replace('INC-', '')}`,
      incident_id: incidentId,
      incident_title: inc.title,
      evidence_items: photos.length > 0 ? photos : [
        {
          id: `EV-${Date.now().toString().slice(-4)}`,
          url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
          title: `Dokumentasi Lapangan ${inc.regency}`,
          type: 'IMAGE',
          captured_at: new Date().toISOString(),
          source: currentUser.name,
        },
      ],
      observations: resultObs,
      reviewer_status: 'DRAFT',
      reviewer_notes: fieldNotes || 'Menunggu verifikasi lapangan oleh personel BPBD.',
      analyst_name: currentUser.name,
      model_version: modelVer,
      created_at: new Date().toISOString(),
    };

    setDamageAssessments((prev) => {
      const updated = { ...prev, [incidentId]: newAssessment };
      try {
        localStorage.setItem('resq911_damage_assessments_mvp3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const newRun: AIAnalysisRun = {
      analysis_id: `RUN-${Date.now().toString().slice(-6)}`,
      incident_id: incidentId,
      engine_type: 'DAMAGE_ASSESSMENT',
      engine_name: 'Rapid Damage Assessment Engine',
      model_version: modelVer,
      prompt_template_version: 'multimodal-damage-v2.1',
      input_snapshot: `${photos.length} foto + catatan lapangan`,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      execution_time_ms: 2400,
      notes: 'Kaji cepat kerusakan multimodal selesai dieksekusi.',
      output_summary: resultObs.brief_description,
      disclaimer: 'Analisis AI — memerlukan verifikasi teknis petugas lapangan.',
    };

    setAiAnalysisRuns((prev) => [newRun, ...prev]);
    return newAssessment;
  };

  const reconcileIncidentReports = async (incidentId: string, resolutionNotes: string): Promise<IncidentReconciliation> => {
    const inc = incidents.find((i) => i.incident_id === incidentId);
    if (!inc) throw new Error('Insiden tidak ditemukan');

    const linked = reports.filter((r) => r.incident_candidate_id === incidentId);
    let aiResult: any = null;
    let modelVer = 'RESQ-ReconciliationEngine-v1.2 (Mode Simulasi)';

    try {
      const res = await fetch('/api/ai/reconcile-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: inc, reports: linked }),
      });
      if (res.ok) {
        const data = await res.json();
        aiResult = data;
        modelVer = data.modelVersion || modelVer;
      }
    } catch (e) {
      console.warn('Reconcile API failed', e);
    }

    const currentRec = reconciliations[incidentId];
    const newRec: IncidentReconciliation = {
      reconciliation_id: currentRec?.reconciliation_id || `REC-${incidentId.replace('INC-', '')}`,
      incident_id: incidentId,
      incident_title: inc.title,
      associated_reports_count: linked.length,
      consistent_data: aiResult?.consistent_data || [
        `Lokasi utama insiden berada di lingkup wilayah administratif ${inc.regency}`,
        `Semua pelapor mengindikasikan jenis bencana: ${inc.disaster_type}`,
      ],
      discrepancies: currentRec?.discrepancies || [
        {
          field: 'impact_variance',
          field_label: 'Variasi Estimasi Dampak',
          conflicting_values: linked.slice(0, 2).map((r) => ({
            report_id: r.report_id,
            reporter_name: r.reporter_name,
            reporter_type: r.reporter_type,
            value: `${r.estimated_affected} jiwa`,
            timestamp: r.created_at,
          })),
          suggested_resolution: 'Gunakan angka konsolidasi resmi BPBD setempat.',
          resolved_value: `${inc.affected_population || 0} jiwa`,
          status: 'RESOLVED',
          resolved_by: currentUser.name,
          resolved_at: new Date().toISOString(),
        },
      ],
      missing_evidence: aiResult?.missing_evidence || ['Dokumen register posko pengungsian terpadu'],
      latest_verified_data: {
        korban_terdampak: inc.affected_population,
        pengungsi: inc.displaced_population,
        status: inc.response_status,
      },
      ai_summary: aiResult?.discrepancies_summary || 'Perbedaan estimasi telah direkonsiliasi dengan catatan resmi.',
      human_resolver_notes: resolutionNotes || 'Rekonsiliasi disahkan oleh analis data.',
      status: 'SELESAI',
      resolved_at: new Date().toISOString(),
    };

    setReconciliations((prev) => {
      const updated = { ...prev, [incidentId]: newRec };
      try {
        localStorage.setItem('resq911_reconciliations_mvp3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const newRun: AIAnalysisRun = {
      analysis_id: `RUN-${Date.now().toString().slice(-6)}`,
      incident_id: incidentId,
      engine_type: 'RECONCILIATION',
      engine_name: 'Data Reconciliation Engine',
      model_version: modelVer,
      prompt_template_version: 'reconciliation-v1.0',
      input_snapshot: `${linked.length} laporan terkait dianalisis silang`,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      execution_time_ms: 1650,
      notes: `Rekonsiliasi multi-laporan insiden ${incidentId} disimpan.`,
      output_summary: newRec.ai_summary,
      disclaimer: 'Kebenaran fakta resmi ditetapkan oleh petugas manusia.',
    };

    setAiAnalysisRuns((prev) => [newRun, ...prev]);
    return newRec;
  };

  const updatePriorityWeights = (newWeights: Partial<PriorityWeights>) => {
    setPriorityWeights((prev) => ({ ...prev, ...newWeights }));
  };

  const updateRecommendationDecision = (
    recId: string,
    decision: DecisionReviewStatus,
    notes: string,
    checklist: any
  ): { success: boolean; error?: string } => {
    if (currentUser.role === 'VIEWER_EKSEKUTIF') {
      return { success: false, error: 'Akses Ditolak: Peran Viewer Eksekutif hanya memiliki hak baca (Read-Only).' };
    }
    if (currentUser.role === 'PETUGAS_LAPANGAN' && decision === 'Approved for Planning') {
      return { success: false, error: 'Akses Ditolak: Petugas Lapangan tidak berwenang menyetujui rencana tanggap darurat.' };
    }

    const rec = recommendations.find((r) => r.recommendation_id === recId);
    if (!rec) return { success: false, error: 'Rekomendasi tidak ditemukan' };

    const newHistory = [
      ...rec.history,
      {
        timestamp: new Date().toISOString(),
        actor_name: currentUser.name,
        role: currentUser.role,
        action: decision.toUpperCase().replace(/\s+/g, '_'),
        notes: notes || `Status diubah menjadi ${decision}.`,
      },
    ];

    const updatedRec: DecisionRecommendation = {
      ...rec,
      status: decision,
      reviewer_notes: notes,
      reviewer_name: currentUser.name,
      reviewer_role: currentUser.role,
      reviewed_at: new Date().toISOString(),
      review_checklist: checklist || rec.review_checklist,
      history: newHistory,
    };

    setRecommendations((prev) => {
      const updated = prev.map((r) => (r.recommendation_id === recId ? updatedRec : r));
      try {
        localStorage.setItem('resq911_recommendations_mvp3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    return { success: true };
  };

  const generateSituationSummary = async (incidentId: string): Promise<SituationSummaryResult> => {
    const inc = incidents.find((i) => i.incident_id === incidentId);
    if (!inc) throw new Error('Insiden tidak ditemukan');

    const linked = reports.filter((r) => r.incident_candidate_id === incidentId);
    const risk = riskAssessments[incidentId]?.total_score || 75;
    const prio = priorityAssessments.find((p) => p.incident_id === incidentId)?.total_score || 80;

    let summaryData: any = null;
    let modelVer = 'RESQ-SummaryEngine-v1.4 (Mode Simulasi)';

    try {
      const res = await fetch('/api/ai/situation-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident: inc, reports: linked, riskScore: risk, priorityScore: prio }),
      });
      if (res.ok) {
        summaryData = await res.json();
        modelVer = summaryData.modelVersion || modelVer;
      }
    } catch (e) {
      console.warn('Situation summary API failed', e);
    }

    if (!summaryData) {
      summaryData = {
        summary: `Peristiwa ${inc.disaster_type} terverifikasi melanda kawasan ${inc.regency}, ${inc.province}. Tingkat urgensi operasional berada pada skala ${inc.severity}.`,
        affectedLocations: [inc.regency, inc.province],
        confirmedConditions: [`Status kejadian resmi tercatat dalam sistem dengan ID ${inc.incident_id}`],
        verifiedImpacts: [
          `Jumlah jiwa terpapar: ${inc.affected_population || 0} jiwa`,
          `Pengungsi terdata: ${inc.displaced_population || 0} jiwa`,
        ],
        riskFactors: ['Keterbatasan jalur akses darat akibat material bencana atau genangan air'],
        missingInformation: ['Sensus rinci kelompok rentan di posko pengungsian mandiri'],
        preliminaryRecommendations: ['Prioritaskan pemenuhan kebutuhan dasar pengungsi'],
        sources: [`Catatan resmi Insiden ${inc.incident_id}`],
        modelSource: 'SIMULATED_ENGINE',
        timestamp: new Date().toISOString(),
        disclaimer: 'Executive Situation Briefing — berbasis bukti diverifikasi petugas (Mode Simulasi).',
      };
    }

    const newRun: AIAnalysisRun = {
      analysis_id: `RUN-${Date.now().toString().slice(-6)}`,
      incident_id: incidentId,
      engine_type: 'SITUATION_SUMMARY',
      engine_name: 'AI Situation Summary Generator',
      model_version: modelVer,
      prompt_template_version: 'situation-briefing-v2.0',
      input_snapshot: `Insiden ${incidentId} + ${linked.length} laporan`,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      execution_time_ms: 2100,
      notes: 'Pembuatan ringkasan situasi eksekutif selesai.',
      output_summary: summaryData.summary,
      disclaimer: 'Analisis berbasis data diverifikasi; bukan perintah otomatis.',
    };

    setAiAnalysisRuns((prev) => [newRun, ...prev]);
    return summaryData;
  };

  const loadDemoScenario = (key: 'A' | 'B' | 'C' | 'D') => {
    const sc = DEMO_SCENARIOS[key];
    if (!sc) return;
    setActiveScenario(key);
    const targetInc = incidents.find((i) => i.incident_id === sc.targetIncidentId);
    if (targetInc) {
      setActiveIncident(targetInc);
    }
  };

  return (
    <DisasterContext.Provider
      value={{
        incidents,
        filteredIncidents,
        filters,
        activeIncident,
        reports,
        filteredReports,
        reportFilters,
        activeReport,
        reportLinks,
        verificationLogs,
        duplicateCandidates,
        riskAssessments,
        damageAssessments,
        reconciliations,
        priorityAssessments,
        priorityWeights,
        recommendations,
        recoveryMetrics,
        aiAnalysisRuns,
        activeScenario,
        currentUser,
        isLoggedIn,
        activeTab,
        timeZone,
        mapLayers,
        stats,
        reportStats,
        intelligenceStats,
        setFilters,
        resetFilters,
        setActiveIncident,
        updateIncidentVerification,
        updateIncidentResponse,
        addNewIncident,
        setReportFilters,
        resetReportFilters,
        setActiveReport,
        submitNewReport,
        verifyReport,
        requestReportClarification,
        rejectReport,
        markReportAsDuplicate,
        mergeReportToIncident,
        runRiskAssessment,
        runDamageAssessment,
        reconcileIncidentReports,
        updatePriorityWeights,
        updateRecommendationDecision,
        generateSituationSummary,
        loadDemoScenario,
        setActiveTab,
        setTimeZone,
        setMapLayers,
        // MVP 4 Operations State & Metrics
        missions,
        tasks,
        teams,
        inventory,
        fieldUpdates,
        escalations,
        auditLogs,
        coordinationMessages,
        operationsMetrics,
        createMission,
        updateMission,
        authorizeMission,
        assignTeamToMission,
        removeTeamFromMission,
        allocateResourceToMission,
        returnAllocatedResource,
        updateTaskStatus,
        createTask,
        submitFieldReport,
        raiseEscalation,
        resolveEscalation,
        sendCoordinationMessage,
        loginAsRole,
        loginAsUser,
        loginByNim,
        logout,
        exportDataAsJSON,
        exportDataAsCSV,
        exportReportsAsCSV,
        resetToInitialData,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
