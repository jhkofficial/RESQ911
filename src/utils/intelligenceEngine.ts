import { DisasterIncident, IncidentReport } from '../types/disaster';
import {
  RiskFactors,
  RiskWeights,
  RiskAssessment,
  RiskCategory,
  PriorityCriteria,
  PriorityWeights,
  PriorityAssessment,
  DecisionRecommendation,
  RecoveryMetric,
  IncidentReconciliation,
  DamageAssessment,
} from '../types/intelligence';

export const DEFAULT_RISK_WEIGHTS: RiskWeights = {
  hazardSeverity: 0.30,
  populationExposure: 0.25,
  vulnerability: 0.20,
  infrastructureImpact: 0.15,
  responseAccessDifficulty: 0.10,
};

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  riskAndHazard: 0.30,
  humanitarianImpact: 0.30,
  urgency: 0.20,
  infrastructure: 0.10,
  accessConstraints: 0.10,
};

export function getRiskCategory(score: number): RiskCategory {
  if (score < 25) return 'Rendah';
  if (score < 50) return 'Sedang';
  if (score < 75) return 'Tinggi';
  return 'Sangat Tinggi';
}

/**
 * Deterministic Risk Score Calculator
 * Risk Score = 0.30 * Hazard + 0.25 * Population + 0.20 * Vulnerability + 0.15 * Infrastructure + 0.10 * Access
 * All factors normalized to 0-100 scale.
 */
export function calculateDeterministicRisk(
  incident: DisasterIncident,
  linkedReports: IncidentReport[] = [],
  weights: RiskWeights = DEFAULT_RISK_WEIGHTS
): RiskAssessment {
  const missingData: string[] = [];

  // 1. Hazard Severity (0 - 100)
  let hazardScore = 50;
  if (incident.severity === 'Kritis') hazardScore = 95;
  else if (incident.severity === 'Tinggi') hazardScore = 75;
  else if (incident.severity === 'Sedang') hazardScore = 50;
  else if (incident.severity === 'Rendah') hazardScore = 25;

  // Additional modifier based on disaster dynamic
  if (incident.disaster_type === 'Gempa Bumi' || incident.disaster_type === 'Tsunami') {
    hazardScore = Math.min(100, hazardScore + 5);
  }

  // 2. Population Exposure (0 - 100)
  // Normalized against benchmark (e.g. 5,000+ affected = 100)
  const totalImpacted = (incident.affected_population || 0) + (incident.displaced_population || 0) * 1.5;
  let popScore = 0;
  if (totalImpacted === 0) {
    missingData.push('Data estimasi jumlah jiwa terpapar belum dilaporkan secara definitif');
    popScore = 30; // provisional baseline
  } else {
    popScore = Math.min(100, Math.round((totalImpacted / 4000) * 100));
  }

  // 3. Vulnerability (0 - 100)
  // Evaluates reported vulnerable groups from reports or incident notes
  let vulScore = 45;
  const combinedNotes = (
    (incident.description || '') +
    ' ' +
    linkedReports.map((r) => r.description + ' ' + (r.urgent_needs || []).join(' ')).join(' ')
  ).toLowerCase();

  const vulnerableKeywords = ['balita', 'bayi', 'lansia', 'disabilitas', 'ibu hamil', 'faskes lumpuh', 'isolasi'];
  let detectedVulCount = 0;
  vulnerableKeywords.forEach((kw) => {
    if (combinedNotes.includes(kw)) detectedVulCount++;
  });
  vulScore = Math.min(100, 40 + detectedVulCount * 12);

  if (detectedVulCount === 0 && linkedReports.length === 0) {
    missingData.push('Indikator kelompok rentan (bayi, lansia, ibu hamil) belum diverifikasi di lapangan');
  }

  // 4. Infrastructure Impact (0 - 100)
  let infraScore = 40;
  const infraKeywords = ['jembatan putus', 'jalan ambles', 'tanggul jebol', 'listrik padam', 'tiang roboh', 'puskesmas'];
  let infraMatches = 0;
  infraKeywords.forEach((kw) => {
    if (combinedNotes.includes(kw)) infraMatches++;
  });
  if (combinedNotes.includes('jembatan putus') || combinedNotes.includes('tanggul jebol')) {
    infraScore = 85;
  } else {
    infraScore = Math.min(100, 35 + infraMatches * 15);
  }

  // 5. Response Access Difficulty (0 - 100)
  let accessScore = 35;
  if (combinedNotes.includes('terisolir') || combinedNotes.includes('akses terputus') || combinedNotes.includes('hanya perahu')) {
    accessScore = 90;
  } else if (combinedNotes.includes('lumpur tebal') || combinedNotes.includes('kendaraan roda 4 terhambat')) {
    accessScore = 70;
  } else if (combinedNotes.includes('jalan tertutup')) {
    accessScore = 60;
  }

  // Quality check
  const dataQuality: RiskAssessment['data_quality_status'] =
    missingData.length >= 2 ? 'Data Tidak Memadai' : missingData.length === 1 ? 'Cukup' : 'Lengkap';

  // Normalization check on weights (ensure sum = 1.0)
  const weightSum =
    weights.hazardSeverity +
    weights.populationExposure +
    weights.vulnerability +
    weights.infrastructureImpact +
    weights.responseAccessDifficulty;

  const normWeights: RiskWeights =
    Math.abs(weightSum - 1.0) > 0.001
      ? {
          hazardSeverity: weights.hazardSeverity / weightSum,
          populationExposure: weights.populationExposure / weightSum,
          vulnerability: weights.vulnerability / weightSum,
          infrastructureImpact: weights.infrastructureImpact / weightSum,
          responseAccessDifficulty: weights.responseAccessDifficulty / weightSum,
        }
      : weights;

  // Compute contributions
  const contributions = {
    hazardSeverity: Math.round(hazardScore * normWeights.hazardSeverity * 10) / 10,
    populationExposure: Math.round(popScore * normWeights.populationExposure * 10) / 10,
    vulnerability: Math.round(vulScore * normWeights.vulnerability * 10) / 10,
    infrastructureImpact: Math.round(infraScore * normWeights.infrastructureImpact * 10) / 10,
    responseAccessDifficulty: Math.round(accessScore * normWeights.responseAccessDifficulty * 10) / 10,
  };

  const totalScore = Math.round(
    contributions.hazardSeverity +
      contributions.populationExposure +
      contributions.vulnerability +
      contributions.infrastructureImpact +
      contributions.responseAccessDifficulty
  );

  return {
    assessment_id: `RSK-${incident.incident_id.replace('INC-', '')}`,
    incident_id: incident.incident_id,
    incident_title: incident.title,
    province: incident.province,
    regency: incident.regency,
    disaster_type: incident.disaster_type,
    factor_values: {
      hazardSeverity: hazardScore,
      populationExposure: popScore,
      vulnerability: vulScore,
      infrastructureImpact: infraScore,
      responseAccessDifficulty: accessScore,
    },
    weights: normWeights,
    contributions,
    total_score: totalScore,
    category: getRiskCategory(totalScore),
    data_quality_status: dataQuality,
    missing_data: missingData,
    source_data_summary: `Berdasarkan ${linkedReports.length} laporan terverifikasi dan pembaruan log Pusdalops resmi.`,
    model_version: 'RESQ-RiskEngine-v1.4 (Deterministic Prototyping)',
    limitations: [
      'Model bobot adalah asumsi perancangan awal sistem, bukan metodologi penilaian risiko resmi BNPB.',
      'Kategori risiko memerlukan validasi pakar kebencanaan sebelum dipergunakan untuk keputusan evakuasi masal.',
      'Nilai kerentanan menggunakan heuristik teks laporan lapangan, belum mencakup sensus mikro BPS.',
    ],
    assessed_at: new Date().toISOString(),
    reviewed_by: null,
    review_status: 'PENDING_REVIEW',
  };
}

/**
 * Response Priority Ranker with Multi-Criteria Analysis & Sensitivity Detection
 */
export function calculatePriorityRankings(
  incidents: DisasterIncident[],
  riskAssessments: Record<string, RiskAssessment>,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS,
  previousRankings: Record<string, number> = {}
): PriorityAssessment[] {
  // Validate weights sum
  const sumWeights =
    weights.riskAndHazard +
    weights.humanitarianImpact +
    weights.urgency +
    weights.infrastructure +
    weights.accessConstraints;

  const normWeights: PriorityWeights =
    Math.abs(sumWeights - 1.0) > 0.001
      ? {
          riskAndHazard: weights.riskAndHazard / sumWeights,
          humanitarianImpact: weights.humanitarianImpact / sumWeights,
          urgency: weights.urgency / sumWeights,
          infrastructure: weights.infrastructure / sumWeights,
          accessConstraints: weights.accessConstraints / sumWeights,
        }
      : weights;

  const rawAssessments = incidents.map((inc) => {
    const risk = riskAssessments[inc.incident_id];

    // Criteria factors (0 - 100)
    const riskAndHazard = risk ? risk.total_score : inc.severity === 'Kritis' ? 90 : 65;
    
    // Humanitarian Impact (verified evidence)
    const humanImpact = Math.min(
      100,
      Math.round(((inc.affected_population || 0) * 0.4 + (inc.displaced_population || 0) * 0.8 + (inc.fatalities_count || 0) * 15) / 30)
    );

    // Urgency
    let urgency = 50;
    if (inc.severity === 'Kritis') urgency = 95;
    else if (inc.severity === 'Tinggi') urgency = 80;
    else if (inc.severity === 'Sedang') urgency = 55;
    else urgency = 30;

    // Infrastructure disruption
    const infraScore = risk ? risk.factor_values.infrastructureImpact : 50;

    // Access Constraints
    const accessScore = risk ? risk.factor_values.responseAccessDifficulty : 45;

    // Check data sufficiency
    const isSufficient = (inc.affected_population !== undefined || inc.displaced_population !== undefined) && inc.regency;

    const contributions = {
      riskAndHazard: Math.round(riskAndHazard * normWeights.riskAndHazard * 10) / 10,
      humanitarianImpact: Math.round(humanImpact * normWeights.humanitarianImpact * 10) / 10,
      urgency: Math.round(urgency * normWeights.urgency * 10) / 10,
      infrastructure: Math.round(infraScore * normWeights.infrastructure * 10) / 10,
      accessConstraints: Math.round(accessScore * normWeights.accessConstraints * 10) / 10,
    };

    const totalScore = Math.round(
      contributions.riskAndHazard +
        contributions.humanitarianImpact +
        contributions.urgency +
        contributions.infrastructure +
        contributions.accessConstraints
    );

    const explanation = `Skor ${totalScore}/100 didominasi oleh ${
      humanImpact >= riskAndHazard
        ? `dampak kemanusiaan (${contributions.humanitarianImpact} poin)`
        : `tingkat bahaya (${contributions.riskAndHazard} poin)`
    } dan urgensi intervensi (${contributions.urgency} poin).`;

    return {
      priority_id: `PRI-${inc.incident_id.replace('INC-', '')}`,
      incident_id: inc.incident_id,
      incident_title: inc.title,
      province: inc.province,
      regency: inc.regency,
      disaster_type: inc.disaster_type,
      severity: inc.severity,
      criteria_values: {
        riskAndHazard,
        humanitarianImpact: humanImpact,
        urgency,
        infrastructure: infraScore,
        accessConstraints: accessScore,
      },
      weights: normWeights,
      contributions,
      total_score: totalScore,
      data_sufficiency: (isSufficient ? 'Cukup' : 'Belum Dapat Dirangking') as PriorityAssessment['data_sufficiency'],
      recommendation_explanation: explanation,
      calculation_version: 'RESQ-PriorityRanking-v2.1',
      last_updated: new Date().toISOString(),
    };
  });

  // Sort descending by total score
  rawAssessments.sort((a, b) => b.total_score - a.total_score);

  // Assign ranks and calculate deltas
  return rawAssessments.map((item, index) => {
    const currentRank = index + 1;
    const prevRank = previousRankings[item.incident_id] || currentRank;
    const rankDelta = prevRank - currentRank; // Positive means rank moved up (higher priority)

    return {
      ...item,
      rank: currentRank,
      previous_rank: prevRank,
      rank_delta: rankDelta,
    };
  });
}

/**
 * 4 Demo Scenarios Data Seeds
 */
export const DEMO_SCENARIOS = {
  A: {
    key: 'A',
    name: 'Skenario A — Banjir Bandang Demak & Kudus',
    disaster_type: 'Banjir',
    province: 'Jawa Tengah',
    regency: 'Kab. Demak',
    summary:
      'Tanggul Sungai Wulan jebol di dua titik kritis mengakibatkan luapan air setinggi 1.5 - 2.5 meter. Jalur Pantura lumpuh total dan 24.500 warga mengungsi ke posko darurat.',
    targetIncidentId: 'INC-2026-001',
    evidenceCount: 6,
    conflictCount: 2,
  },
  B: {
    key: 'B',
    name: 'Skenario B — Gempa Bumi Cianjur & Sukabumi',
    disaster_type: 'Gempa Bumi',
    province: 'Jawa Barat',
    regency: 'Kab. Cianjur',
    summary:
      'Gempa darat M 5.6 kedalaman dangkal menimbulkan kerusakan struktural masif pada fasilitas kesehatan desa dan permukiman warga di lereng bukit.',
    targetIncidentId: 'INC-2026-002',
    evidenceCount: 8,
    conflictCount: 3,
  },
  C: {
    key: 'C',
    name: 'Skenario C — Tanah Longsor Cisarua Puncak',
    disaster_type: 'Tanah Longsor',
    province: 'Jawa Barat',
    regency: 'Kab. Bogor',
    summary:
      'Tebing setinggi 40 meter ambles menimbun jalan penghubung antardesa. Akses jalan terputus total memerlukan alat berat dan jalur evakuasi alternatif perahu karet.',
    targetIncidentId: 'INC-2026-003',
    evidenceCount: 5,
    conflictCount: 1,
  },
  D: {
    key: 'D',
    name: 'Skenario D — Cuaca Ekstrem & Angin Kencang Maros',
    disaster_type: 'Cuaca Ekstrem',
    province: 'Sulawesi Selatan',
    regency: 'Kab. Maros',
    summary:
      'Hujan lebat disertai angin puting beliung merusak atap ratusan rumah dan menumbangkan pohon peneduh jalan poros provinsi. Kualitas data awal masih bervariasi.',
    targetIncidentId: 'INC-2026-006',
    evidenceCount: 4,
    conflictCount: 2,
  },
};
