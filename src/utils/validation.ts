import { IncidentReport } from '../types/disaster';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

export function validateIncidentReport(
  report: Partial<IncidentReport>,
  evidenceFiles?: { name: string; size: number; type: string }[]
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Step 1: Basic Information
  if (!report.disaster_type) {
    errors.disaster_type = 'Jenis bencana wajib dipilih';
  }

  if (!report.title || report.title.trim().length < 5) {
    errors.title = 'Judul laporan wajib diisi minimal 5 karakter';
  } else if (report.title.trim().length > 150) {
    errors.title = 'Judul laporan maksimal 150 karakter';
  }

  if (!report.event_date) {
    errors.event_date = 'Tanggal kejadian wajib diisi';
  } else {
    const reportDate = new Date(`${report.event_date}T${report.event_time || '00:00'}`);
    const now = new Date();
    if (reportDate.getTime() > now.getTime() + 5 * 60 * 1000) {
      errors.event_date = 'Tanggal kejadian tidak boleh mendahului waktu saat ini (masa depan)';
    }
  }

  if (!report.event_time) {
    errors.event_time = 'Waktu kejadian wajib diisi (format jam:menit)';
  }

  if (!report.description || report.description.trim().length < 15) {
    errors.description = 'Deskripsi kronologi wajib diisi minimal 15 karakter';
  }

  if (!report.urgency) {
    errors.urgency = 'Tingkat urgensi laporan wajib dipilih';
  }

  // Step 2: Location Information
  if (!report.province || report.province.trim() === '') {
    errors.province = 'Provinsi wajib dipilih/diisi';
  }

  if (!report.regency || report.regency.trim() === '') {
    errors.regency = 'Kabupaten/Kota wajib diisi';
  }

  if (!report.subdistrict || report.subdistrict.trim() === '') {
    errors.subdistrict = 'Kecamatan wajib diisi';
  }

  if (!report.village || report.village.trim() === '') {
    errors.village = 'Kelurahan / Desa wajib diisi';
  }

  if (report.latitude === undefined || report.latitude === null || isNaN(Number(report.latitude))) {
    errors.latitude = 'Garis lintang (Latitude) wajib diisi angka valid';
  } else {
    const lat = Number(report.latitude);
    // Indonesia latitude spans roughly between -11.5 and 6.5
    if (lat < -11.5 || lat > 6.5) {
      errors.latitude = 'Latitude di luar rentang geografis Indonesia (-11.5° s/d 6.5°)';
    }
  }

  if (report.longitude === undefined || report.longitude === null || isNaN(Number(report.longitude))) {
    errors.longitude = 'Garis bujur (Longitude) wajib diisi angka valid';
  } else {
    const lng = Number(report.longitude);
    // Indonesia longitude spans roughly between 94.5 and 141.5
    if (lng < 94.5 || lng > 141.5) {
      errors.longitude = 'Longitude di luar rentang geografis Indonesia (94.5° s/d 141.5°)';
    }
  }

  // Step 3: Impact Estimates & Logical Consistency
  const affected = Number(report.estimated_affected || 0);
  const displaced = Number(report.estimated_displaced || 0);
  const injured = Number(report.estimated_injured || 0);
  const fatalities = Number(report.estimated_fatalities || 0);

  if (affected < 0) errors.estimated_affected = 'Jumlah korban terdampak tidak boleh bernilai negatif';
  if (displaced < 0) errors.estimated_displaced = 'Jumlah pengungsi tidak boleh bernilai negatif';
  if (injured < 0) errors.estimated_injured = 'Jumlah korban luka tidak boleh bernilai negatif';
  if (fatalities < 0) errors.estimated_fatalities = 'Jumlah korban meninggal tidak boleh bernilai negatif';

  // Logical consistency rules
  if (affected > 0 && displaced > affected) {
    errors.estimated_displaced = `Pengungsi (${displaced}) melebihi estimasi populasi terdampak (${affected})`;
  }

  if (affected > 0 && (injured + fatalities) > affected) {
    warnings.push(`Total korban fisik (${injured + fatalities}) mendekati atau melampaui estimasi terdampak (${affected}). Pastikan data diverifikasi ulang.`);
  }

  if (affected === 0 && displaced === 0) {
    warnings.push('Estimasi korban terdampak dan pengungsi masih tercatat 0. Lengkapi bila data lapangan sudah tersedia.');
  }

  // Step 4: Reporter Information
  if (!report.reporter_name || report.reporter_name.trim().length < 2) {
    errors.reporter_name = 'Nama pelapor wajib diisi minimal 2 karakter';
  }

  if (!report.reporter_type) {
    errors.reporter_type = 'Kategori pelapor wajib dipilih';
  }

  // Step 5: Evidence Validation
  if (evidenceFiles && evidenceFiles.length > 0) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB

    evidenceFiles.forEach((file, index) => {
      if (!allowedMimeTypes.includes(file.type)) {
        errors[`evidence_${index}`] = `Format file "${file.name}" tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.`;
      }
      if (file.size > maxSizeBytes) {
        errors[`evidence_${index}_size`] = `Ukuran file "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)}MB) melebihi batas maksimal 10MB.`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}
