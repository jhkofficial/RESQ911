export type MissionStatus =
  | 'Draft'
  | 'Pending Authorization'
  | 'Authorized'
  | 'Assignment Pending'
  | 'Ready for Simulated Deployment'
  | 'In Progress'
  | 'Paused'
  | 'Completed'
  | 'Cancelled';

export type TaskStatus =
  | 'Pending'
  | 'Assigned'
  | 'Accepted'
  | 'In Progress'
  | 'Blocked'
  | 'Awaiting Review'
  | 'Completed'
  | 'Cancelled';

export type TeamAvailability =
  | 'Available'
  | 'Reserved'
  | 'Assigned'
  | 'Unavailable'
  | 'Offline';

export type ResourceCategory =
  | 'Kendaraan Operasional'
  | 'Peralatan SAR & Evakuasi'
  | 'Suplai Medis & Trauma'
  | 'Pangan & Dapur Umum'
  | 'Hunian Darurat & Tenda'
  | 'Komunikasi & Penerangan'
  | 'Sanitasi & Air Bersih'
  | 'Logistik Lainnya';

export type AllocationStatus =
  | 'Requested'
  | 'Reserved'
  | 'Allocated'
  | 'Returned';

export type EscalationCategory =
  | 'RESOURCE_SHORTAGE'
  | 'ACCESS_BLOCKED'
  | 'MEDICAL_EMERGENCY'
  | 'WEATHER_HAZARD'
  | 'COMMUNICATION_OUTAGE'
  | 'OTHER';

export type EscalationStatus =
  | 'Open'
  | 'Under Review'
  | 'Action Required'
  | 'Resolved'
  | 'Closed';

export interface ResponseMission {
  mission_id: string;
  incident_id: string;
  recommendation_id?: string;
  title: string;
  disaster_type: string;
  province: string;
  regency: string;
  subdistrict?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  objective: string;
  proposed_actions: string[];
  priority: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  estimated_start: string;
  estimated_end: string;
  actual_start?: string;
  actual_end?: string;
  required_capabilities: string[];
  required_team_size: number;
  required_resources_summary: string[];
  known_constraints: string[];
  planning_notes: string;
  created_by: string;
  created_by_nim?: string;
  created_at: string;
  status: MissionStatus;
  approved_by?: string;
  approved_by_role?: string;
  approved_at?: string;
  approval_notes?: string;
  assigned_team_ids: string[];
  allocated_resource_ids: string[];
  progress_percentage: number;
  target_victims_evacuated?: number;
  actual_victims_evacuated?: number;
}

export interface MissionTask {
  task_id: string;
  mission_id: string;
  task_title: string;
  description: string;
  assigned_team_id?: string;
  assigned_team_name?: string;
  priority: 'Kritis' | 'Tinggi' | 'Sedang' | 'Rendah';
  planned_start: string;
  planned_end: string;
  actual_start?: string;
  actual_end?: string;
  task_status: TaskStatus;
  progress_percentage: number;
  blockers: string[];
  last_updated: string;
  location_label?: string;
  required_skill?: string;
}

export interface SimulatedTeam {
  team_id: string;
  team_name: string;
  institution: string; // e.g. BPBD, BASARNAS, PMI, TNI, POLRI, TAGANA
  region: string;
  team_leader: string;
  members_count: number;
  skills_capabilities: string[]; // e.g. ['Water Rescue', 'Medical First Aid', 'USAR', 'Dapur Umum', 'Zeni']
  availability: TeamAvailability;
  current_assignment_mission_id?: string;
  operational_area: string;
  contact_reference: string;
  last_status_update: string;
  vehicle_assigned?: string;
  base_coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ResourceInventory {
  resource_id: string;
  resource_name: string;
  category: ResourceCategory;
  quantity_total: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_assigned: number;
  unit: string; // e.g. Unit, Set, Koli, Dus, Liter, Paket
  storage_location: string; // e.g. Gudang Regional BPBD Semarang
  owner_institution: string; // BNPB, BPBD Jateng, PMI Pusat, Kemenkes
  maintenance_status: 'Operasional Prima' | 'Perlu Pemeliharaan' | 'Dalam Servis';
  last_updated: string;
  safety_threshold: number; // threshold for shortage alert
}

export interface ResourceAllocation {
  allocation_id: string;
  resource_id: string;
  resource_name: string;
  mission_id: string;
  requested_quantity: number;
  approved_quantity: number;
  status: AllocationStatus;
  allocated_by: string;
  allocated_at: string;
  released_at?: string;
  notes?: string;
}

export interface FieldUpdate {
  update_id: string;
  mission_id: string;
  task_id?: string;
  reporter_id: string;
  reporter_name: string;
  reporter_role: string;
  timestamp: string;
  reported_location: string;
  situation_description: string;
  progress_status: string;
  progress_percentage: number;
  reported_obstacles?: string[];
  resource_usage_notes?: string;
  evidence_references?: {
    caption: string;
    url: string;
  }[];
  verification_status: 'Diverifikasi Posko' | 'Menunggu Konfirmasi' | 'Memerlukan Klarifikasi';
}

export interface MissionApproval {
  approval_id: string;
  mission_id: string;
  mission_version: number;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role: string;
  decision: 'Authorized' | 'Revision Required' | 'Rejected' | 'Cancelled';
  rationale: string;
  timestamp: string;
  checklist_results: {
    incident_verified: boolean;
    team_competency_checked: boolean;
    resources_available: boolean;
    safety_protocol_cleared: boolean;
  };
}

export interface MissionEscalation {
  escalation_id: string;
  mission_id: string;
  mission_title: string;
  raised_by: string;
  raised_by_role: string;
  category: EscalationCategory;
  description: string;
  priority: 'Kritis' | 'Tinggi' | 'Sedang';
  owner_id?: string;
  owner_name?: string;
  status: EscalationStatus;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface MissionAuditLog {
  log_id: string;
  mission_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  previous_state: string;
  new_state: string;
  timestamp: string;
  notes: string;
}

export interface CoordinationMessage {
  message_id: string;
  mission_id?: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_nim?: string;
  timestamp: string;
  channel: 'Komando Nasional' | 'Sektor Lapangan' | 'Logistik & Armada' | 'Medis & SAR';
  content: string;
  is_urgent?: boolean;
}
