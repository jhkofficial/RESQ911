import {
  IncidentReport,
  ReportVerificationStatus,
  ReporterType,
  ReportIncidentLink,
  VerificationLog,
  EvidenceItem,
  DisasterType,
  SeverityLevel,
} from '../types/disaster';
import { INITIAL_SIMULATED_INCIDENTS } from './simulatedDisasters';

// Sample evidence photos representing realistic disaster field situations
const SAMPLE_EVIDENCE_URLS = [
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80', // flood
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop&q=80', // damage / rescue
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80', // volcanic ash / haze
  'https://images.unsplash.com/photo-1628015081036-0747ec8f077a?w=600&auto=format&fit=crop&q=80', // landslide / mud
  'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=600&auto=format&fit=crop&q=80', // water levels
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80', // shelter
];

function generateSimulatedReports(): {
  reports: IncidentReport[];
  links: ReportIncidentLink[];
  logs: VerificationLog[];
} {
  const reports: IncidentReport[] = [];
  const links: ReportIncidentLink[] = [];
  const logs: VerificationLog[] = [];

  // Anchor reports directly corresponding to high-profile incidents
  // 1. Demak Flood Anchor Reports (Multiple source reports for one incident to test deduplication & reconciliation)
  const repDemak1: IncidentReport = {
    id: 'rep-1',
    report_id: 'LAP-2026-0101',
    incident_candidate_id: 'RSQ-2026-0888',
    disaster_type: 'Banjir',
    title: 'Tanggul Sungai Wulan Jebol Merendam Karanganyar Demak',
    event_date: '2026-10-28',
    event_time: '03:15',
    description: 'Debit banjir kiriman dari hulu melimpas tanggul utama desa Ketanjung. Ketinggian air genangan mencapai 220 cm dan menutup jalur Pantura.',
    urgency: 'Kritis',
    province: 'Jawa Tengah',
    regency: 'Demak',
    subdistrict: 'Karanganyar',
    village: 'Ketanjung',
    address_detail: 'Jalan Raya Pantura Km 42 & Sekitar Jembatan Tanggul Wulan',
    latitude: -6.8921,
    longitude: 110.7421,
    estimated_affected: 28400,
    estimated_displaced: 12300,
    estimated_injured: 45,
    estimated_fatalities: 2,
    infrastructure_damage: 'Tanggul jebol 25 meter, jalan nasional terputus total, 4 gardu PLN padam',
    urgent_needs: ['Perahu Karet Mesin', 'Pelampung', 'Pompa Alkon Kapasitas Besar', 'Makanan Siap Saji'],
    reporter_name: 'Suhartono, S.Sos',
    reporter_type: 'PETUGAS_LAPANGAN',
    reporter_agency: 'Pusdalops BPBD Demak',
    reporter_contact: '0812-2834-xxxx',
    evidence: [
      {
        id: 'ev-1',
        report_id: 'LAP-2026-0101',
        file_name: 'foto_tanggul_jebol_demak.jpg',
        file_type: 'image/jpeg',
        file_size: 2450000,
        url: SAMPLE_EVIDENCE_URLS[0],
        uploaded_at: '2026-10-28T04:00:00Z',
        caption: 'Kondisi air meluap melintasi jalan raya',
      },
      {
        id: 'ev-2',
        report_id: 'LAP-2026-0101',
        file_name: 'evakuasi_lansia_ketanjung.jpg',
        file_type: 'image/jpeg',
        file_size: 1890000,
        url: SAMPLE_EVIDENCE_URLS[1],
        uploaded_at: '2026-10-28T04:20:00Z',
        caption: 'Proses evakuasi perahu karet posko',
      },
    ],
    field_notes: 'Telah dikoordinasikan dengan BBWS Pemali Juana untuk pengiriman bronjong batu.',
    verification_status: 'Terverifikasi',
    potential_duplicate: false,
    created_at: '2026-10-28T03:30:00Z',
    updated_at: '2026-10-28T05:00:00Z',
    submitted_by_user_id: 'usr-2',
    verified_by: 'Dr. Raden Haryo Prabowo (Admin BNPB)',
    verified_at: '2026-10-28T05:00:00Z',
  };
  reports.push(repDemak1);

  // Link for repDemak1
  links.push({
    id: 'link-1',
    report_id: 'LAP-2026-0101',
    incident_id: 'RSQ-2026-0888',
    link_type: 'PRIMARY_EVIDENCE',
    linked_by: 'usr-1',
    linked_by_name: 'Dr. Raden Haryo Prabowo',
    linked_at: '2026-10-28T05:00:00Z',
    rationale: 'Laporan resmi pertama yang memvalidasi penetapan Status Tanggap Darurat Banjir Demak.',
  });

  // Duplicate candidate report for Demak submitted by citizen
  const repDemak2: IncidentReport = {
    id: 'rep-2',
    report_id: 'LAP-2026-0102',
    incident_candidate_id: 'RSQ-2026-0888',
    disaster_type: 'Banjir',
    title: 'Banjir Karanganyar Dekat Jembatan Tanggul Air Naik Cepat',
    event_date: '2026-10-28',
    event_time: '04:10',
    description: 'Air sungai meluap tinggi di jalan raya pantura desa ketanjung karanganyar demak, ratusan rumah sudah terendam air sedada orang dewasa.',
    urgency: 'Kritis',
    province: 'Jawa Tengah',
    regency: 'Demak',
    subdistrict: 'Karanganyar',
    village: 'Ketanjung',
    address_detail: 'Dekat gapura perbatasan Kudus-Demak RT 02 RW 01',
    latitude: -6.8945,
    longitude: 110.7452,
    estimated_affected: 3000,
    estimated_displaced: 1200,
    estimated_injured: 2,
    estimated_fatalities: 0,
    infrastructure_damage: 'Jalan tergenang 1,5 meter, rumah warga terendam',
    urgent_needs: ['Perahu Penolong', 'Bantuan Makanan Anak'],
    reporter_name: 'Ahmad Faisal',
    reporter_type: 'MASYARAKAT',
    reporter_contact: '0857-1122-xxxx',
    evidence: [
      {
        id: 'ev-3',
        report_id: 'LAP-2026-0102',
        file_name: 'warga_rekam_banjir.jpg',
        file_type: 'image/jpeg',
        file_size: 1420000,
        url: SAMPLE_EVIDENCE_URLS[4],
        uploaded_at: '2026-10-28T04:20:00Z',
      },
    ],
    verification_status: 'Duplikat',
    potential_duplicate: true,
    duplicate_matched_id: 'LAP-2026-0101',
    similarity_score: 0.92,
    created_at: '2026-10-28T04:15:00Z',
    updated_at: '2026-10-28T06:10:00Z',
    submitted_by_user_id: 'public-warga-1',
    verified_by: 'Ir. Siti Aminah Suryani (BPBD Jateng)',
    verified_at: '2026-10-28T06:10:00Z',
  };
  reports.push(repDemak2);

  links.push({
    id: 'link-2',
    report_id: 'LAP-2026-0102',
    incident_id: 'RSQ-2026-0888',
    link_type: 'DUPLICATE_SOURCE',
    linked_by: 'usr-2',
    linked_by_name: 'Ir. Siti Aminah Suryani',
    linked_at: '2026-10-28T06:10:00Z',
    rationale: 'Digabungkan sebagai sumber laporan warga tambahan. Angka dampak tidak diakumulasi ganda.',
  });

  // 2. Flores Timur Eruption Anchor Report
  const repFlotim: IncidentReport = {
    id: 'rep-3',
    report_id: 'LAP-2026-0103',
    incident_candidate_id: 'RSQ-2026-0891',
    disaster_type: 'Erupsi Gunung Api',
    title: 'Hujan Abu Vulkanik & Gemuruh Erupsi Gunung Lewotobi Laki-laki',
    event_date: '2026-10-29',
    event_time: '19:30',
    description: 'Terdengar dentuman kuat disertai lontaran batu pijar dan hujan pasir abu tebal di Desa Pululera dan Hokeng Jaya. Warga panik mengungsi ke arah barat.',
    urgency: 'Kritis',
    province: 'Nusa Tenggara Timur',
    regency: 'Flores Timur',
    subdistrict: 'Wulanggitang',
    village: 'Pululera',
    address_detail: 'Lereng barat daya kawah Lewotobi, Dusun Bawalatang',
    latitude: -8.5382,
    longitude: 122.7721,
    estimated_affected: 14250,
    estimated_displaced: 6840,
    estimated_injured: 32,
    estimated_fatalities: 4,
    infrastructure_damage: 'Ratusan atap seng jebol tertimpa kerikil, kabel listrik putus, jalan berdebu tebal',
    urgent_needs: ['Masker N95', 'Tenda Komando', 'Dapur Umum', 'Air Bersih Galon'],
    reporter_name: 'Kapten Hendra Gunawan',
    reporter_type: 'PETUGAS_LAPANGAN',
    reporter_agency: 'TRC Posko Aju Flores Timur',
    reporter_contact: '0821-3322-xxxx',
    evidence: [
      {
        id: 'ev-4',
        report_id: 'LAP-2026-0103',
        file_name: 'foto_hujan_abu_pululera.jpg',
        file_type: 'image/jpeg',
        file_size: 3100000,
        url: SAMPLE_EVIDENCE_URLS[2],
        uploaded_at: '2026-10-29T20:15:00Z',
        caption: 'Hujan abu pekat menyelimuti pemukiman warga',
      },
    ],
    field_notes: 'Zona bahaya direkomendasikan PVMBG diperluas menjadi 7 km.',
    verification_status: 'Terverifikasi',
    potential_duplicate: false,
    created_at: '2026-10-29T20:00:00Z',
    updated_at: '2026-10-29T21:00:00Z',
    submitted_by_user_id: 'usr-3',
    verified_by: 'Dr. Raden Haryo Prabowo (Admin BNPB)',
    verified_at: '2026-10-29T21:00:00Z',
  };
  reports.push(repFlotim);

  links.push({
    id: 'link-3',
    report_id: 'LAP-2026-0103',
    incident_id: 'RSQ-2026-0891',
    link_type: 'PRIMARY_EVIDENCE',
    linked_by: 'usr-1',
    linked_by_name: 'Dr. Raden Haryo Prabowo',
    linked_at: '2026-10-29T21:00:00Z',
    rationale: 'Dasar verifikasi data kejadian utama erupsi Gunung Lewotobi Laki-laki.',
  });

  // 3. Cianjur Earthquake Anchor Report
  const repCianjur: IncidentReport = {
    id: 'rep-4',
    report_id: 'LAP-2026-0104',
    incident_candidate_id: 'RSQ-2026-0885',
    disaster_type: 'Gempa Bumi',
    title: 'Guncangan Gempa Dangkal Terasa Kuat di Cugenang Cianjur',
    event_date: '2026-10-27',
    event_time: '14:42',
    description: 'Gempa guncangan terasa kuat selama 6 detik. Sejumlah dinding rumah warga retak dan roboh di Desa Cibulakan. Warga berhamburan ke tanah lapang.',
    urgency: 'Tinggi',
    province: 'Jawa Barat',
    regency: 'Cianjur',
    subdistrict: 'Cugenang',
    village: 'Cibulakan',
    address_detail: 'Kp. Cibulakan RT 03 RW 01',
    latitude: -6.8122,
    longitude: 107.0892,
    estimated_affected: 8600,
    estimated_displaced: 3100,
    estimated_injured: 58,
    estimated_fatalities: 1,
    infrastructure_damage: '320 rumah rusak sedang-berat, 1 mushola retak struktur, akses jalan desa terhalang puing',
    urgent_needs: ['Tenda Keluarga', 'Trauma Healing Kit', 'Genset Darurat', 'Terpal Plastik'],
    reporter_name: 'Dadan Ramdani',
    reporter_type: 'APARAT_DESA',
    reporter_agency: 'Pemerintah Desa Cibulakan',
    reporter_contact: '0813-9821-xxxx',
    evidence: [
      {
        id: 'ev-5',
        report_id: 'LAP-2026-0104',
        file_name: 'kerusakan_rumah_cibulakan.jpg',
        file_type: 'image/jpeg',
        file_size: 2800000,
        url: SAMPLE_EVIDENCE_URLS[1],
        uploaded_at: '2026-10-27T15:30:00Z',
      },
    ],
    verification_status: 'Terverifikasi',
    potential_duplicate: false,
    created_at: '2026-10-27T15:00:00Z',
    updated_at: '2026-10-27T16:30:00Z',
    submitted_by_user_id: 'usr-4',
    verified_by: 'Dr. Raden Haryo Prabowo (Admin BNPB)',
    verified_at: '2026-10-27T16:30:00Z',
  };
  reports.push(repCianjur);

  links.push({
    id: 'link-4',
    report_id: 'LAP-2026-0104',
    incident_id: 'RSQ-2026-0885',
    link_type: 'PRIMARY_EVIDENCE',
    linked_by: 'usr-1',
    linked_by_name: 'Dr. Raden Haryo Prabowo',
    linked_at: '2026-10-27T16:30:00Z',
    rationale: 'Verifikasi resmi insiden gempa Cianjur M 5.2.',
  });

  // 4. Report Requiring Clarification (Perlu Klarifikasi)
  const repClarify: IncidentReport = {
    id: 'rep-5',
    report_id: 'LAP-2026-0105',
    disaster_type: 'Tanah Longsor',
    title: 'Informasi Retakan Tanah di Perbukitan Cisarua Bogor',
    event_date: '2026-10-29',
    event_time: '18:15',
    description: 'Warga melihat tanah retak di belakang pemukiman vila jalan puncak. Takut terjadi longsor besar saat hujan lebat semalam.',
    urgency: 'Sedang',
    province: 'Jawa Barat',
    regency: 'Bogor',
    subdistrict: 'Cisarua',
    village: 'Tugu Selatan',
    address_detail: 'Perbukitan lereng kebun teh blok C',
    latitude: -6.7012,
    longitude: 106.9621,
    estimated_affected: 80,
    estimated_displaced: 0,
    estimated_injured: 0,
    estimated_fatalities: 0,
    infrastructure_damage: 'Retakan sepanjang 30 meter di halaman kebun',
    urgent_needs: ['Asesmen Geologi Lereng', 'Pemasangan Patok Pemantau'],
    reporter_name: 'Budi Santoso',
    reporter_type: 'RELAWAN',
    reporter_agency: 'Komunitas Siaga Bencana Puncak',
    reporter_contact: '0819-0821-xxxx',
    evidence: [],
    verification_status: 'Perlu Klarifikasi',
    potential_duplicate: false,
    clarification_notes: 'Mohon cantumkan lebar retakan tanah dalam centimeter, apakah ada pohon atau tiang listrik yang mulai miring, dan foto dokumentasi visual.',
    created_at: '2026-10-29T19:00:00Z',
    updated_at: '2026-10-30T02:00:00Z',
    submitted_by_user_id: 'relawan-budi',
  };
  reports.push(repClarify);

  // 5. Rejected Report (Ditolak)
  const repRejected: IncidentReport = {
    id: 'rep-6',
    report_id: 'LAP-2026-0106',
    disaster_type: 'Tsunami',
    title: 'Klaim Gelombang Pasang Tsunami di Pesisir Anyer',
    event_date: '2026-10-28',
    event_time: '23:30',
    description: 'Air laut terlihat surut drastis menurut postingan media sosial dan warga mendengar suara gemuruh dari laut selat sunda.',
    urgency: 'Kritis',
    province: 'Banten',
    regency: 'Serang',
    subdistrict: 'Anyar',
    village: 'Cikoneng',
    address_detail: 'Pesisir mercusuar Cikoneng',
    latitude: -6.0482,
    longitude: 105.8821,
    estimated_affected: 0,
    estimated_displaced: 400,
    estimated_injured: 0,
    estimated_fatalities: 0,
    infrastructure_damage: 'Nihil kerusakan',
    urgent_needs: ['Klarifikasi Hoaks'],
    reporter_name: 'Rian Kurnia',
    reporter_type: 'MASYARAKAT',
    evidence: [],
    verification_status: 'Ditolak',
    potential_duplicate: false,
    rejection_reason: 'Hasil verifikasi data sensor pasang surut BIG & buoy InaTEWS BMKG menunjukkan anomali gelombang nihil (kondisi pasang purnama normal 0.8m). Laporan merupakan kabar burung yang tidak dapat dikonfirmasi.',
    created_at: '2026-10-29T00:10:00Z',
    updated_at: '2026-10-29T01:30:00Z',
    submitted_by_user_id: 'public-rian',
    verified_by: 'Dr. Raden Haryo Prabowo (Admin BNPB)',
    verified_at: '2026-10-29T01:30:00Z',
  };
  reports.push(repRejected);

  // 6. Fresh unverified report waiting in inbox (Belum Diverifikasi)
  const repPending1: IncidentReport = {
    id: 'rep-7',
    report_id: 'LAP-2026-0107',
    disaster_type: 'Banjir',
    title: 'Luapan Sungai Belawan Rendam Ratusan Rumah di Sunggal',
    event_date: '2026-10-30',
    event_time: '04:30',
    description: 'Hujan deras semalam di pegunungan Karo mengakibatkan debit Sungai Belawan meluap merendam pemukiman warga Desa Lalang setinggi 80 - 120 cm. Arus cukup deras.',
    urgency: 'Tinggi',
    province: 'Sumatera Utara',
    regency: 'Deli Serdang',
    subdistrict: 'Sunggal',
    village: 'Lalang',
    address_detail: 'Dusun III bantaran Sungai Belawan',
    latitude: 3.5852,
    longitude: 98.5833,
    estimated_affected: 1850,
    estimated_displaced: 420,
    estimated_injured: 0,
    estimated_fatalities: 0,
    infrastructure_damage: 'Jalan lingkungan tergenang, air masuk ke dalam rumah warga',
    urgent_needs: ['Perahu Karet Evakuasi', 'Makanan Siap Santap', 'Air Bersih'],
    reporter_name: 'Sertu M. Ilham',
    reporter_type: 'APARAT_DESA',
    reporter_agency: 'Babinsa Koramil 01/Sunggal',
    reporter_contact: '0812-6677-xxxx',
    evidence: [
      {
        id: 'ev-6',
        report_id: 'LAP-2026-0107',
        file_name: 'luapan_sungai_belawan.jpg',
        file_type: 'image/jpeg',
        file_size: 2100000,
        url: SAMPLE_EVIDENCE_URLS[0],
        uploaded_at: '2026-10-30T05:15:00Z',
        caption: 'Ketinggian air di halaman pemukiman',
      },
    ],
    field_notes: 'Warga mulai mengevakuasi lansia dan anak-anak ke balai desa dataran lebih tinggi.',
    verification_status: 'Belum Diverifikasi',
    potential_duplicate: false,
    created_at: '2026-10-30T05:00:00Z',
    updated_at: '2026-10-30T05:00:00Z',
    submitted_by_user_id: 'babinsa-ilham',
  };
  reports.push(repPending1);

  // 7. Another pending report with potential duplicate in Sigi, Sulawesi Tengah
  const repSigi1: IncidentReport = {
    id: 'rep-8',
    report_id: 'LAP-2026-0108',
    disaster_type: 'Tanah Longsor',
    title: 'Longsor Tebing Tutup Jalan Poros Palu - Kulawi Sigi',
    event_date: '2026-10-29',
    event_time: '21:00',
    description: 'Material tanah dan bebatuan besar longsor menutupi seluruh badan jalan poros Palu-Kulawi di Desa Simoro. Kendaraan roda 2 dan 4 tidak dapat melintas sama sekali.',
    urgency: 'Tinggi',
    province: 'Sulawesi Tengah',
    regency: 'Sigi',
    subdistrict: 'Dolo Selatan',
    village: 'Simoro',
    address_detail: 'Jalan Poros Palu-Kulawi Km 34',
    latitude: -1.1482,
    longitude: 119.9241,
    estimated_affected: 1200,
    estimated_displaced: 0,
    estimated_injured: 0,
    estimated_fatalities: 0,
    infrastructure_damage: 'Akses jalan poros terputus total 40 meter, tiang telepon roboh',
    urgent_needs: ['Alat Berat Loader / Excavator', 'Petugas Pengatur Lalu Lintas Darurat'],
    reporter_name: 'Fadly Ramadhan',
    reporter_type: 'PETUGAS_LAPANGAN',
    reporter_agency: 'TRC BPBD Kabupaten Sigi',
    reporter_contact: '0852-4411-xxxx',
    evidence: [
      {
        id: 'ev-7',
        report_id: 'LAP-2026-0108',
        file_name: 'longsor_jalan_simoro.jpg',
        file_type: 'image/jpeg',
        file_size: 1980000,
        url: SAMPLE_EVIDENCE_URLS[3],
        uploaded_at: '2026-10-29T21:40:00Z',
      },
    ],
    verification_status: 'Dalam Verifikasi',
    potential_duplicate: false,
    created_at: '2026-10-29T21:20:00Z',
    updated_at: '2026-10-29T22:00:00Z',
    submitted_by_user_id: 'usr-3',
  };
  reports.push(repSigi1);

  // Duplicate candidate of Sigi landslide
  const repSigi2: IncidentReport = {
    id: 'rep-9',
    report_id: 'LAP-2026-0109',
    disaster_type: 'Tanah Longsor',
    title: 'Tebing Batu Longsor Menutupi Jalan Palu Kulawi Dolo Selatan',
    event_date: '2026-10-29',
    event_time: '21:30',
    description: 'Jalan menuju Kulawi tertutup longsoran batu besar di Simoro, antrean kendaraan sudah mencapai 2 km dari dua arah.',
    urgency: 'Tinggi',
    province: 'Sulawesi Tengah',
    regency: 'Sigi',
    subdistrict: 'Dolo Selatan',
    village: 'Simoro',
    address_detail: 'Jalan Palu Kulawi Km 35 dekat jembatan gantung',
    latitude: -1.1510,
    longitude: 119.9265,
    estimated_affected: 800,
    estimated_displaced: 0,
    estimated_injured: 0,
    estimated_fatalities: 0,
    infrastructure_damage: 'Jalan tertutup batu besar',
    urgent_needs: ['Alat Berat Pemecah Batu'],
    reporter_name: 'Baharuddin',
    reporter_type: 'MASYARAKAT',
    evidence: [],
    verification_status: 'Belum Diverifikasi',
    potential_duplicate: true,
    duplicate_matched_id: 'LAP-2026-0108',
    similarity_score: 0.88,
    created_at: '2026-10-29T22:15:00Z',
    updated_at: '2026-10-29T22:15:00Z',
    submitted_by_user_id: 'warga-bahar',
  };
  reports.push(repSigi2);

  // Now, procedurally populate the remaining reports to reach approximately 122 synthetic reports
  // linking appropriately to the existing 118 incidents in INITIAL_SIMULATED_INCIDENTS
  let counter = reports.length + 1;
  const targetTotal = 122;

  const reporterNames = [
    'Agus Salim', 'Dewi Lestari', 'Joko Prayitno', 'Tri Wahyudi', 'Rina Marlina',
    'Serka Dedi Irawan', 'Bripka Eko Prasetyo', 'Nurul Hidayah', 'Asep Saepudin',
    'I Made Wirawan', 'Anas Syahrir', 'Maria Magdalena', 'Fransiskus Xaverius'
  ];

  const reporterTypes: ReporterType[] = ['PETUGAS_LAPANGAN', 'APARAT_DESA', 'RELAWAN', 'MASYARAKAT'];

  // Iterate over existing incidents to generate matching verified reports
  INITIAL_SIMULATED_INCIDENTS.forEach((inc, idx) => {
    if (reports.length >= targetTotal) return;

    const reportId = `LAP-2026-${(100 + counter).toString().padStart(4, '0')}`;
    const dateObj = new Date(inc.reported_at);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const timeStr = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${dateObj.getUTCMinutes().toString().padStart(2, '0')}`;

    // Status distribution
    let status: ReportVerificationStatus = 'Terverifikasi';
    let isDuplicate = false;
    let matchedId: string | undefined = undefined;

    if (counter % 9 === 0) {
      status = 'Belum Diverifikasi';
    } else if (counter % 14 === 0) {
      status = 'Perlu Klarifikasi';
    } else if (counter % 19 === 0) {
      status = 'Ditolak';
    } else if (counter % 11 === 0) {
      status = 'Duplikat';
      isDuplicate = true;
      matchedId = `LAP-2026-${(100 + counter - 1).toString().padStart(4, '0')}`;
    }

    const reporterType = reporterTypes[counter % reporterTypes.length];
    const reporterName = reporterNames[counter % reporterNames.length];

    const rep: IncidentReport = {
      id: `rep-${counter}`,
      report_id: reportId,
      incident_candidate_id: status === 'Terverifikasi' || status === 'Duplikat' ? inc.incident_id : undefined,
      disaster_type: inc.disaster_type,
      title: inc.title,
      event_date: dateStr,
      event_time: timeStr,
      description: inc.description,
      urgency: inc.severity,
      province: inc.province,
      regency: inc.regency,
      subdistrict: inc.subdistrict || 'Pusat Kecamatan',
      village: 'Desa Terkait',
      address_detail: `Wilayah administrasi ${inc.regency}, ${inc.province}`,
      latitude: inc.latitude,
      longitude: inc.longitude,
      estimated_affected: inc.affected_population,
      estimated_displaced: inc.displaced_population,
      estimated_injured: inc.injured_count,
      estimated_fatalities: inc.fatalities_count,
      infrastructure_damage: `${inc.damaged_houses} unit rumah terdampak, fasilitas umum terancam`,
      urgent_needs: inc.needs,
      reporter_name: reporterName,
      reporter_type: reporterType,
      reporter_agency: reporterType === 'PETUGAS_LAPANGAN' ? `TRC BPBD ${inc.province}` : reporterType === 'APARAT_DESA' ? 'Aparat Desa Setempat' : undefined,
      reporter_contact: '081x-xxxx-xxxx',
      evidence: [
        {
          id: `ev-${counter}`,
          report_id: reportId,
          file_name: `bukti_lap_${counter}.jpg`,
          file_type: 'image/jpeg',
          file_size: 1800000 + (counter * 12345) % 1500000,
          url: SAMPLE_EVIDENCE_URLS[counter % SAMPLE_EVIDENCE_URLS.length],
          uploaded_at: inc.reported_at,
          caption: `Dokumentasi visual peristiwa ${inc.disaster_type.toLowerCase()}`,
        },
      ],
      field_notes: status === 'Perlu Klarifikasi' ? 'Menunggu kelengkapan rincian pengungsi rentan.' : undefined,
      verification_status: status,
      potential_duplicate: isDuplicate,
      duplicate_matched_id: matchedId,
      similarity_score: isDuplicate ? 0.85 : undefined,
      clarification_notes: status === 'Perlu Klarifikasi' ? 'Berapa jumlah balita dan lansia yang membutuhkan penanganan khusus di posko pengungsian?' : undefined,
      rejection_reason: status === 'Ditolak' ? 'Informasi setelah diverifikasi petugas lapangan merupakan peristiwa lama yang diunggah ulang (hoaks repetisi).' : undefined,
      created_at: inc.reported_at,
      updated_at: inc.last_updated,
      submitted_by_user_id: `user-sim-${counter}`,
      verified_by: status === 'Terverifikasi' ? 'Pusdalops BNPB Verification Desk' : undefined,
      verified_at: status === 'Terverifikasi' ? inc.last_updated : undefined,
    };

    reports.push(rep);

    // Link verified reports to incident
    if (status === 'Terverifikasi') {
      links.push({
        id: `link-${counter}`,
        report_id: rep.report_id,
        incident_id: inc.incident_id,
        link_type: 'PRIMARY_EVIDENCE',
        linked_by: 'usr-1',
        linked_by_name: 'Dr. Raden Haryo Prabowo',
        linked_at: inc.last_updated,
        rationale: 'Verifikasi kesesuaian laporan sumber dengan data telemetri dan asesmen kaji cepat posko.',
      });
    }

    counter++;
  });

  // Generate realistic initial audit logs
  reports.slice(0, 25).forEach((r, idx) => {
    logs.push({
      id: `log-sub-${r.id}`,
      report_id: r.report_id,
      report_title: r.title,
      actor_id: r.submitted_by_user_id || 'system',
      actor_name: r.reporter_name,
      actor_role: r.reporter_type === 'PETUGAS_LAPANGAN' ? 'PETUGAS_LAPANGAN' : 'OPERATOR_DAERAH',
      action: 'REPORT_SUBMITTED',
      old_status: '-',
      new_status: 'Belum Diverifikasi',
      notes: `Laporan baru diinput melalui kanal ${r.reporter_type}. Validasi deterministik format data: LOLOS.`,
      timestamp: r.created_at,
    });

    if (r.verification_status === 'Terverifikasi') {
      logs.push({
        id: `log-ver-${r.id}`,
        report_id: r.report_id,
        report_title: r.title,
        actor_id: 'usr-1',
        actor_name: 'Dr. Raden Haryo Prabowo',
        actor_role: 'ADMIN_NASIONAL',
        action: 'VERIFIED',
        old_status: 'Belum Diverifikasi',
        new_status: 'Terverifikasi',
        notes: `Verifikasi disetujui. Laporan ditautkan ke kejadian terkonfirmasi ${r.incident_candidate_id || ''}.`,
        timestamp: r.updated_at,
        linked_incident_id: r.incident_candidate_id,
      });
    } else if (r.verification_status === 'Perlu Klarifikasi') {
      logs.push({
        id: `log-cla-${r.id}`,
        report_id: r.report_id,
        report_title: r.title,
        actor_id: 'usr-2',
        actor_name: 'Ir. Siti Aminah Suryani',
        actor_role: 'OPERATOR_DAERAH',
        action: 'REQUESTED_CLARIFICATION',
        old_status: 'Belum Diverifikasi',
        new_status: 'Perlu Klarifikasi',
        notes: r.clarification_notes || 'Meminta konfirmasi data tambahan.',
        timestamp: r.updated_at,
      });
    } else if (r.verification_status === 'Ditolak') {
      logs.push({
        id: `log-rej-${r.id}`,
        report_id: r.report_id,
        report_title: r.title,
        actor_id: 'usr-1',
        actor_name: 'Dr. Raden Haryo Prabowo',
        actor_role: 'ADMIN_NASIONAL',
        action: 'REJECTED',
        old_status: 'Belum Diverifikasi',
        new_status: 'Ditolak',
        notes: r.rejection_reason || 'Laporan tidak valid.',
        timestamp: r.updated_at,
      });
    } else if (r.verification_status === 'Duplikat') {
      logs.push({
        id: `log-dup-${r.id}`,
        report_id: r.report_id,
        report_title: r.title,
        actor_id: 'usr-2',
        actor_name: 'Ir. Siti Aminah Suryani',
        actor_role: 'OPERATOR_DAERAH',
        action: 'MERGED',
        old_status: 'Belum Diverifikasi',
        new_status: 'Duplikat',
        notes: `Laporan ditandai duplikat dan digabungkan ke laporan acuan ${r.duplicate_matched_id || ''}.`,
        timestamp: r.updated_at,
        linked_incident_id: r.incident_candidate_id,
      });
    }
  });

  return { reports, links, logs };
}

const { reports, links, logs } = generateSimulatedReports();

export const INITIAL_SIMULATED_REPORTS: IncidentReport[] = reports;
export const INITIAL_REPORT_LINKS: ReportIncidentLink[] = links;
export const INITIAL_VERIFICATION_LOGS: VerificationLog[] = logs;
