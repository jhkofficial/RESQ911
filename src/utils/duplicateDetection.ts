import { IncidentReport, DuplicateCandidate, DisasterType } from '../types/disaster';

// Configurable weights for duplicate detection model (prototype assumptions)
export const DUPLICATE_WEIGHTS = {
  geographic: 0.35,
  time: 0.25,
  disasterType: 0.20,
  text: 0.20,
};

export const SIMILARITY_THRESHOLDS = {
  high: 0.80,   // >= 0.80 : High similarity
  medium: 0.60, // >= 0.60 and < 0.80 : Medium similarity
};

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Calculates time difference in hours between two date strings
 */
export function calculateTimeDiffHours(dateStr1: string, dateStr2: string): number {
  const t1 = new Date(dateStr1).getTime();
  const t2 = new Date(dateStr2).getTime();
  const diffMs = Math.abs(t1 - t2);
  return Number((diffMs / (1000 * 3600)).toFixed(1));
}

const INDONESIAN_STOPWORDS = new Set([
  'di', 'dan', 'yang', 'ke', 'dari', 'pada', 'untuk', 'ini', 'itu', 'atau', 'dengan',
  'dalam', 'adalah', 'ada', 'oleh', 'akan', 'terjadi', 'telah', 'mengakibatkan',
  'laporan', 'wilayah', 'kejadian', 'mengalami', 'sekitar', 'pukul', 'hari', 'jam',
  'bencana', 'posko', 'kabupaten', 'kecamatan', 'desa', 'kelurahan', 'warga'
]);

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !INDONESIAN_STOPWORDS.has(w));
  return Array.from(new Set(words));
}

function calculateTextSimilarity(text1: string, text2: string): { score: number; commonKeywords: string[] } {
  const words1 = new Set(extractKeywords(text1));
  const words2 = new Set(extractKeywords(text2));

  if (words1.size === 0 || words2.size === 0) {
    return { score: 0, commonKeywords: [] };
  }

  const common: string[] = [];
  words1.forEach((w) => {
    if (words2.has(w)) common.push(w);
  });

  const unionSize = new Set([...words1, ...words2]).size;
  const jaccard = unionSize > 0 ? common.length / unionSize : 0;
  return {
    score: Number(jaccard.toFixed(3)),
    commonKeywords: common.slice(0, 8),
  };
}

/**
 * Computes transparent similarity between two reports
 */
export function evaluateReportSimilarity(
  reportA: IncidentReport,
  reportB: IncidentReport
): DuplicateCandidate | null {
  if (reportA.id === reportB.id) return null;

  // 1. Geographic proximity score:
  // 0 km -> 1.0, 50 km -> 0.0 (smooth linear decay)
  const distanceKm = calculateDistanceKm(
    reportA.latitude,
    reportA.longitude,
    reportB.latitude,
    reportB.longitude
  );
  const geoScore = Math.max(0, 1 - distanceKm / 40);

  // 2. Time proximity score:
  // 0 hrs -> 1.0, 72 hrs -> 0.0
  const timeA = `${reportA.event_date}T${reportA.event_time || '00:00'}:00Z`;
  const timeB = `${reportB.event_date}T${reportB.event_time || '00:00'}:00Z`;
  const timeDiffHours = calculateTimeDiffHours(timeA, timeB);
  const timeScore = Math.max(0, 1 - timeDiffHours / 72);

  // 3. Disaster Type match:
  const typeMatch = reportA.disaster_type === reportB.disaster_type;
  const typeScore = typeMatch ? 1.0 : 0.0;

  // 4. Text similarity:
  const textA = `${reportA.title} ${reportA.description} ${reportA.regency} ${reportA.subdistrict}`;
  const textB = `${reportB.title} ${reportB.description} ${reportB.regency} ${reportB.subdistrict}`;
  const { score: textSim, commonKeywords } = calculateTextSimilarity(textA, textB);

  // Composite normalized score
  const totalScore = Number(
    (
      geoScore * DUPLICATE_WEIGHTS.geographic +
      timeScore * DUPLICATE_WEIGHTS.time +
      typeScore * DUPLICATE_WEIGHTS.disasterType +
      textSim * DUPLICATE_WEIGHTS.text
    ).toFixed(3)
  );

  // Don't return if similarity is negligible
  if (totalScore < 0.40 && distanceKm > 30) {
    return null;
  }

  // Generate clear explanation
  const explanations: string[] = [];
  if (distanceKm < 5) {
    explanations.push(`Lokasi sangat berdekatan (${distanceKm} km) di wilayah ${reportA.regency}`);
  } else if (distanceKm < 25) {
    explanations.push(`Lokasi berada dalam radius ancaman yang sama (${distanceKm} km)`);
  }

  if (timeDiffHours < 12) {
    explanations.push(`Waktu kejadian berdekatan (selisih ${timeDiffHours} jam)`);
  }

  if (typeMatch) {
    explanations.push(`Jenis bencana identik (${reportA.disaster_type})`);
  }

  if (commonKeywords.length > 0) {
    explanations.push(`Kata kunci narasi beririsan (${commonKeywords.join(', ')})`);
  }

  return {
    candidate_id: `dup-${reportA.id}-${reportB.id}`,
    source_report_id: reportA.report_id,
    matched_report_id: reportB.report_id,
    similarity_score: totalScore,
    distance_km: distanceKm,
    time_diff_hours: timeDiffHours,
    disaster_type_match: typeMatch,
    matching_keywords: commonKeywords,
    breakdown: {
      geographic: Number(geoScore.toFixed(2)),
      time: Number(timeScore.toFixed(2)),
      disasterType: typeScore,
      text: textSim,
    },
    explanation: explanations.join('; ') || 'Terdeteksi kesamaan spasial dan temporal.',
    review_status: 'PENDING_REVIEW',
  };
}

/**
 * Finds all potential duplicate pairs across an array of reports
 */
export function findPotentialDuplicates(reports: IncidentReport[]): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];

  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const match = evaluateReportSimilarity(reports[i], reports[j]);
      if (match && match.similarity_score >= SIMILARITY_THRESHOLDS.medium) {
        candidates.push(match);
      }
    }
  }

  return candidates.sort((a, b) => b.similarity_score - a.similarity_score);
}
