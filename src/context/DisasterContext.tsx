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

  // Shell methods
  setActiveTab: (tab: string) => void;
  setTimeZone: (tz: 'WIB' | 'WITA' | 'WIT') => void;
  setMapLayers: (layers: { showVerifiedIncidents: boolean; showUnverifiedReports: boolean }) => void;
  loginAsRole: (role: UserRole) => void;
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);

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

  const logout = () => {
    setIsLoggedIn(false);
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
        loginAsRole,
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
