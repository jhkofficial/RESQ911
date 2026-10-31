import {
  ResponseMission,
  SimulatedTeam,
  ResourceInventory,
  MissionTask,
  MissionEscalation
} from '../types/operations';

export interface ResourceMatchRecommendation {
  team: SimulatedTeam;
  matchScore: number; // 0 - 100
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
  isAvailable: boolean;
}

export function recommendTeamsForMission(
  mission: ResponseMission,
  allTeams: SimulatedTeam[]
): ResourceMatchRecommendation[] {
  const reqCapabilities = mission.required_capabilities.map((c) => c.toLowerCase());

  return allTeams
    .map((team) => {
      let score = 0;
      const reasons: string[] = [];

      // Availability check (30 pts)
      if (team.availability === 'Available') {
        score += 30;
        reasons.push('Tim berstatus Tersedia (Ready to Deploy)');
      } else if (team.availability === 'Reserved') {
        score += 15;
        reasons.push('Tim berstatus Dicadangkan');
      } else {
        score += 0;
        reasons.push(`Tim saat ini berstatus ${team.availability}`);
      }

      // Capability matching (up to 40 pts)
      const matchingSkills: string[] = [];
      const missingSkills: string[] = [];

      reqCapabilities.forEach((reqCap) => {
        const hasSkill = team.skills_capabilities.some(
          (s) => s.toLowerCase().includes(reqCap) || reqCap.includes(s.toLowerCase())
        );
        if (hasSkill) {
          matchingSkills.push(reqCap);
        } else {
          missingSkills.push(reqCap);
        }
      });

      if (reqCapabilities.length > 0) {
        const skillRatio = matchingSkills.length / reqCapabilities.length;
        score += Math.round(skillRatio * 40);
        if (matchingSkills.length > 0) {
          reasons.push(`Kesesuaian keahlian spesifik: ${matchingSkills.join(', ')}`);
        }
      } else {
        score += 30;
      }

      // Regional proximity check (20 pts)
      const isSameProvince =
        team.region.toLowerCase().includes(mission.province.toLowerCase()) ||
        mission.province.toLowerCase().includes(team.region.toLowerCase()) ||
        team.region.toLowerCase().includes('nasional');

      if (isSameProvince) {
        score += 20;
        reasons.push(`Pangkalan tim berada di wilayah operasional ${mission.province}`);
      } else {
        score += 5;
        reasons.push('Pangkalan di luar provinsi (membutuhkan waktu mobilisasi lebih lama)');
      }

      // Team size fit (10 pts)
      if (team.members_count >= 10) {
        score += 10;
        reasons.push(`Kekuatan personil solid (${team.members_count} anggota)`);
      } else {
        score += 5;
      }

      return {
        team,
        matchScore: Math.min(100, score),
        matchingSkills,
        missingSkills,
        reasons,
        isAvailable: team.availability === 'Available'
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function validateResourceAllocation(
  inventory: ResourceInventory[],
  allocations: { resource_id: string; quantity: number }[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  allocations.forEach((item) => {
    const inv = inventory.find((r) => r.resource_id === item.resource_id);
    if (!inv) {
      errors.push(`Sumber daya ID "${item.resource_id}" tidak terdaftar dalam gudang.`);
      return;
    }

    if (item.quantity <= 0) {
      errors.push(`Jumlah permintaan untuk ${inv.resource_name} harus lebih dari 0.`);
      return;
    }

    if (item.quantity > inv.quantity_available) {
      errors.push(
        `Alokasi berlebih: Permintaan ${inv.resource_name} sebesar ${item.quantity} ${inv.unit} melebihi sisa stok tersedia (${inv.quantity_available} ${inv.unit}).`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function detectOperationalConflicts(
  missions: ResponseMission[],
  teams: SimulatedTeam[],
  inventory: ResourceInventory[]
): {
  doubleBookedTeams: { team: SimulatedTeam; missions: ResponseMission[] }[];
  criticalStockShortages: ResourceInventory[];
} {
  // Check double-booked teams
  const teamMissionMap = new Map<string, ResponseMission[]>();
  missions
    .filter((m) => m.status === 'In Progress' || m.status === 'Ready for Simulated Deployment')
    .forEach((m) => {
      m.assigned_team_ids.forEach((tid) => {
        const existing = teamMissionMap.get(tid) || [];
        existing.push(m);
        teamMissionMap.set(tid, existing);
      });
    });

  const doubleBookedTeams: { team: SimulatedTeam; missions: ResponseMission[] }[] = [];
  teamMissionMap.forEach((assignedMissions, tid) => {
    if (assignedMissions.length > 1) {
      const tm = teams.find((t) => t.team_id === tid);
      if (tm) {
        doubleBookedTeams.push({ team: tm, missions: assignedMissions });
      }
    }
  });

  // Check critical stock shortages
  const criticalStockShortages = inventory.filter(
    (inv) => inv.quantity_available <= inv.safety_threshold
  );

  return {
    doubleBookedTeams,
    criticalStockShortages
  };
}

export function calculateOperationsMetrics(
  missions: ResponseMission[],
  tasks: MissionTask[],
  teams: SimulatedTeam[],
  inventory: ResourceInventory[],
  escalations: MissionEscalation[]
) {
  const totalMissions = missions.length;
  const activeMissions = missions.filter(
    (m) => m.status === 'In Progress' || m.status === 'Ready for Simulated Deployment'
  ).length;
  const pendingAuthorization = missions.filter(
    (m) => m.status === 'Pending Authorization'
  ).length;
  const completedMissions = missions.filter((m) => m.status === 'Completed').length;
  const draftMissions = missions.filter((m) => m.status === 'Draft').length;

  const deployedTeams = teams.filter((t) => t.availability === 'Assigned').length;
  const availableTeams = teams.filter((t) => t.availability === 'Available').length;

  const lowStockResources = inventory.filter(
    (r) => r.quantity_available <= r.safety_threshold
  ).length;

  const openEscalations = escalations.filter(
    (e) => e.status === 'Open' || e.status === 'Action Required' || e.status === 'Under Review'
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.task_status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.task_status === 'In Progress').length;
  const blockedTasks = tasks.filter((t) => t.task_status === 'Blocked').length;

  return {
    totalMissions,
    activeMissions,
    pendingAuthorization,
    completedMissions,
    draftMissions,
    deployedTeams,
    availableTeams,
    lowStockResources,
    openEscalations,
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks
  };
}
