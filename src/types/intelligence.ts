import { DisasterType, SeverityLevel } from './disaster';

export interface RiskFactors {
  hazardSeverity: number; // 0 - 100
  populationExposure: number; // 0 - 100
  vulnerability: number; // 0 - 100
  infrastructureImpact: number; // 0 - 100
  responseAccessDifficulty: number; // 0 - 100
}

export interface RiskWeights {
  hazardSeverity: number; // default 0.30
  populationExposure: number; // default 0.25
  vulnerability: number; // default 0.20
  infrastructureImpact: number; // default 0.15
  responseAccessDifficulty: number; // default 0.10
}

export type RiskCategory = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

export interface RiskAssessment {
  assessment_id: string;
  incident_id: string;
  incident_title: string;
  province: string;
  regency: string;
  disaster_type: DisasterType;
  factor_values: RiskFactors;
  weights: RiskWeights;
  contributions: Record<keyof RiskFactors, number>;
  total_score: number; // 0 - 100
  category: RiskCategory;
  data_quality_status: 'Lengkap' | 'Cukup' | 'Data Tidak Memadai';
  missing_data: string[];
  source_data_summary: string;
  model_version: string;
  limitations: string[];
  assessed_at: string;
  reviewed_by: string | null;
  review_status: 'PENDING_REVIEW' | 'CONFIRMED' | 'ADJUSTED';
  analyst_notes?: string;
}

export interface DamageObservation {
  brief_description: string;
  visible_affected_structures: string[];
  potential_infrastructure_damage: string[];
  observable_environmental_conditions: string[];
  missing_information: string[];
  questions_requiring_field_confirmation: string[];
  evidence_references: string[];
  uncertainty_note: string;
  status: 'Perlu Verifikasi Lapangan' | 'Terkonfirmasi Petugas' | 'Ditolak';
}

export interface DamageAssessment {
  assessment_id: string;
  incident_id: string;
  incident_title: string;
  evidence_items: {
    id: string;
    url: string;
    title: string;
    type: string;
    captured_at: string;
    source: string;
  }[];
  observations: DamageObservation;
  reviewer_status: 'DRAFT' | 'REVIEWED' | 'VERIFIED_LAPANGAN' | 'REJECTED';
  reviewer_notes: string;
  analyst_name: string;
  model_version: string;
  created_at: string;
}

export interface ReconciliationDiscrepancy {
  field: string;
  field_label: string;
  conflicting_values: {
    report_id: string;
    reporter_name: string;
    reporter_type: string;
    value: string | number;
    timestamp: string;
  }[];
  suggested_resolution: string;
  resolved_value: string | number | null;
  status: 'OPEN' | 'RESOLVED';
  resolved_by?: string;
  resolved_at?: string;
}

export interface IncidentReconciliation {
  reconciliation_id: string;
  incident_id: string;
  incident_title: string;
  associated_reports_count: number;
  consistent_data: string[];
  discrepancies: ReconciliationDiscrepancy[];
  missing_evidence: string[];
  latest_verified_data: Record<string, any>;
  ai_summary: string;
  human_resolver_notes: string;
  status: 'MENUNGGU_REKONSILIASI' | 'TEREVALUASI' | 'SELESAI';
  resolved_at: string | null;
}

export interface PriorityCriteria {
  riskAndHazard: number; // 0 - 100
  humanitarianImpact: number; // 0 - 100
  urgency: number; // 0 - 100
  infrastructure: number; // 0 - 100
  accessConstraints: number; // 0 - 100
}

export interface PriorityWeights {
  riskAndHazard: number; // default 0.30
  humanitarianImpact: number; // default 0.30
  urgency: number; // default 0.20
  infrastructure: number; // default 0.10
  accessConstraints: number; // default 0.10
}

export interface PriorityAssessment {
  priority_id: string;
  incident_id: string;
  incident_title: string;
  province: string;
  regency: string;
  disaster_type: DisasterType;
  severity: SeverityLevel;
  criteria_values: PriorityCriteria;
  weights: PriorityWeights;
  contributions: Record<keyof PriorityCriteria, number>;
  total_score: number;
  rank: number;
  previous_rank: number;
  rank_delta: number; // +2, -1, 0
  calculation_version: string;
  data_sufficiency: 'Cukup' | 'Belum Dapat Dirangking';
  recommendation_explanation: string;
  last_updated: string;
}

export type DecisionReviewStatus =
  | 'Draft Analysis'
  | 'Awaiting Review'
  | 'Under Review'
  | 'Approved for Planning'
  | 'Revision Required'
  | 'Rejected'
  | 'Superseded';

export interface DecisionRecommendation {
  recommendation_id: string;
  incident_id: string;
  incident_title: string;
  disaster_type: DisasterType;
  province: string;
  regency: string;
  title: string;
  summary: string;
  response_actions: string[];
  alternative_considerations: string[];
  data_limitations: string[];
  resource_implications_preview: string[];
  risk_score: number;
  priority_score: number;
  status: DecisionReviewStatus;
  review_checklist: {
    dataVerified: boolean;
    noAutonomousDispatchConfirmed: boolean;
    fieldAccessValidated: boolean;
    localBpbdConsulted: boolean;
    limitationsAcknowledged: boolean;
  };
  reviewer_notes: string;
  reviewer_name: string | null;
  reviewer_role: string | null;
  reviewed_at: string | null;
  history: {
    timestamp: string;
    actor_name: string;
    role: string;
    action: string;
    notes: string;
  }[];
}

export interface RecoveryMetric {
  id: string;
  incident_id: string;
  incident_title: string;
  sector: string; // misal: Jembatan & Jalan, Hunian Sementara, Air Bersih, Fasilitas Kesehatan
  target_unit: string;
  target_value: number;
  current_value: number;
  progress_percent: number;
  status: 'Dalam Proses' | 'Terlambat' | 'Selesai' | 'Kritis';
  unresolved_needs: string[];
  timeline: {
    date: string;
    milestone: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED';
  }[];
}

export interface AIAnalysisRun {
  analysis_id: string;
  incident_id: string;
  engine_type:
    | 'RISK_SCORING'
    | 'DAMAGE_ASSESSMENT'
    | 'RECONCILIATION'
    | 'PRIORITY_RANKING'
    | 'SITUATION_SUMMARY';
  engine_name: string;
  model_version: string;
  prompt_template_version: string;
  input_snapshot: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  created_at: string;
  completed_at: string;
  execution_time_ms: number;
  notes: string;
  output_summary: string;
  disclaimer: string;
}

export interface SituationSummaryResult {
  summary: string;
  affectedLocations: string[];
  confirmedConditions: string[];
  verifiedImpacts: string[];
  riskFactors: string[];
  missingInformation: string[];
  preliminaryRecommendations: string[];
  sources: string[];
  modelSource: 'GEMINI_LIVE' | 'SIMULATED_ENGINE';
  timestamp: string;
  disclaimer: string;
}
