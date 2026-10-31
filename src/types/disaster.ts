export type DisasterType =
  | 'Banjir'
  | 'Gempa Bumi'
  | 'Tanah Longsor'
  | 'Erupsi Gunung Api'
  | 'Kebakaran Hutan & Lahan'
  | 'Cuaca Ekstrem'
  | 'Tsunami';

export type SeverityLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export type VerificationStatus =
  | 'Belum Diverifikasi'
  | 'Dalam Verifikasi'
  | 'Terverifikasi'
  | 'Tidak Valid';

export type ReportVerificationStatus =
  | 'Belum Diverifikasi'
  | 'Dalam Verifikasi'
  | 'Terverifikasi'
  | 'Perlu Klarifikasi'
  | 'Ditolak'
  | 'Duplikat';

export type ResponseStatus =
  | 'Belum Ditangani'
  | 'Siaga / Assessment'
  | 'Respons Aktif'
  | 'Penanganan Lanjutan'
  | 'Selesai';

export type UserRole =
  | 'ADMIN_NASIONAL'
  | 'OPERATOR_DAERAH'
  | 'PETUGAS_LAPANGAN'
  | 'VIEWER_EKSEKUTIF';

export type ReporterType =
  | 'PETUGAS_LAPANGAN'
  | 'APARAT_DESA'
  | 'RELAWAN'
  | 'MASYARAKAT';

export interface UserProfile {
  id: string;
  name: string;
  nim: string;
  role: UserRole;
  position?: string;
  agency: string;
  avatar: string;
  assignedRegion?: string;
}

export interface EvidenceItem {
  id: string;
  report_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  uploaded_at: string;
  caption?: string;
}

export interface IncidentReport {
  id: string;
  report_id: string; // e.g. LAP-2026-0101
  incident_candidate_id?: string; // ID of linked verified incident if verified/merged
  disaster_type: DisasterType;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time: string; // HH:mm
  description: string;
  urgency: SeverityLevel;
  province: string;
  regency: string; // Kabupaten/Kota
  subdistrict: string; // Kecamatan
  village: string; // Kelurahan/Desa
  address_detail: string;
  latitude: number;
  longitude: number;
  estimated_affected: number;
  estimated_displaced: number;
  estimated_injured: number;
  estimated_fatalities: number;
  infrastructure_damage: string;
  urgent_needs: string[];
  reporter_name: string;
  reporter_type: ReporterType;
  reporter_agency?: string;
  reporter_contact?: string; // Private / not displayed publicly
  evidence: EvidenceItem[];
  field_notes?: string;
  verification_status: ReportVerificationStatus;
  potential_duplicate: boolean;
  duplicate_matched_id?: string;
  similarity_score?: number;
  clarification_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  submitted_by_user_id?: string;
  verified_by?: string;
  verified_at?: string;
}

export interface DisasterIncident {
  id: string;
  incident_id: string;
  disaster_type: DisasterType;
  title: string;
  province: string;
  regency: string; // Kabupaten/Kota
  subdistrict?: string; // Kecamatan
  village?: string;
  latitude: number;
  longitude: number;
  reported_at: string; // ISO date string
  severity: SeverityLevel;
  affected_population: number;
  displaced_population: number; // Pengungsi
  injured_count: number;
  fatalities_count: number;
  damaged_houses: number;
  verification_status: VerificationStatus;
  response_status: ResponseStatus;
  data_source: string;
  last_updated: string;
  description: string;
  needs: string[];
  assigned_team?: string;
  weather_condition?: string;
  water_level_cm?: number;
  magnitude?: number;
  depth_km?: number;
  linked_report_ids?: string[];
  verified_by?: string;
  verified_at?: string;
}

export interface ReportIncidentLink {
  id: string;
  report_id: string;
  incident_id: string;
  link_type: 'PRIMARY_EVIDENCE' | 'DUPLICATE_SOURCE' | 'SECONDARY_CONFIRMATION';
  linked_by: string;
  linked_by_name: string;
  linked_at: string;
  rationale: string;
}

export interface VerificationLog {
  id: string;
  report_id: string;
  report_title?: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action:
    | 'REPORT_SUBMITTED'
    | 'VALIDATION_PASSED'
    | 'VERIFIED'
    | 'REQUESTED_CLARIFICATION'
    | 'REJECTED'
    | 'FLAGGED_DUPLICATE'
    | 'MERGED'
    | 'STATUS_UPDATED';
  old_status: string;
  new_status: string;
  notes: string;
  timestamp: string;
  linked_incident_id?: string;
}

export interface DuplicateCandidate {
  candidate_id: string;
  source_report_id: string;
  matched_report_id: string;
  similarity_score: number; // 0.0 - 1.0
  distance_km: number;
  time_diff_hours: number;
  disaster_type_match: boolean;
  matching_keywords: string[];
  breakdown: {
    geographic: number;
    time: number;
    disasterType: number;
    text: number;
  };
  explanation: string;
  review_status: 'PENDING_REVIEW' | 'CONFIRMED_DUPLICATE' | 'DISMISSED';
}

export interface AIAnalysisResult {
  summary: string;
  extractedCategory: DisasterType;
  missingContext: string[];
  inconsistencies: string[];
  suggestedQuestions: string[];
  confidenceScore: number;
  modelSource: 'GEMINI_LIVE' | 'SIMULATED_ENGINE';
  disclaimer: string;
  timestamp: string;
}

export interface FilterState {
  searchQuery: string;
  province: string;
  disasterType: string;
  severity: string;
  verificationStatus: string;
  responseStatus: string;
  dateRange: 'all' | '24h' | '7d' | '30d';
}

export interface ReportFilterState {
  searchQuery: string;
  province: string;
  disasterType: string;
  verificationStatus: string;
  reporterType: string;
  dateRange: 'all' | '24h' | '7d' | '30d';
  hasDuplicateFlag: 'all' | 'yes' | 'no';
}

export interface AIEngine {
  id: string;
  name: string;
  codeName: string;
  description: string;
  inputData: string[];
  outputData: string[];
  status: 'OPTIMAL' | 'PROCESSING' | 'STANDBY' | 'CALIBRATING';
  confidenceScore: number;
  lastRun: string;
  exampleRecommendation: string;
  actionRequired: string;
  uncertaintyMargin: string;
}
