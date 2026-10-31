import { DisasterIncident, DisasterType, SeverityLevel, VerificationStatus, ResponseStatus, AIEngine, UserProfile } from '../types/disaster';

// Curated Indonesian provinces and regencies with plausible realistic coordinates
interface LocationSeed {
  province: string;
  regency: string;
  subdistrict: string;
  lat: number;
  lng: number;
  proneTo: DisasterType[];
}

const REGION_SEEDS: LocationSeed[] = [
  // Sumatera
  { province: 'Aceh', regency: 'Aceh Barat', subdistrict: 'Meulaboh', lat: 4.1449, lng: 96.1285, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Aceh', regency: 'Aceh Besar', subdistrict: 'Lhoong', lat: 5.2536, lng: 95.3421, proneTo: ['Tanah Longsor', 'Banjir'] },
  { province: 'Aceh', regency: 'Banda Aceh', subdistrict: 'Kutaraja', lat: 5.5483, lng: 95.3238, proneTo: ['Banjir', 'Cuaca Ekstrem', 'Tsunami'] },
  { province: 'Aceh', regency: 'Pidie', subdistrict: 'Tangse', lat: 4.9822, lng: 95.9611, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Sumatera Utara', regency: 'Karo', subdistrict: 'Simpang Empat (Gunung Sinabung)', lat: 3.1705, lng: 98.3926, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Sumatera Utara', regency: 'Medan', subdistrict: 'Medan Johor', lat: 3.5353, lng: 98.6722, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Sumatera Utara', regency: 'Deli Serdang', subdistrict: 'Sunggal', lat: 3.5852, lng: 98.5833, proneTo: ['Banjir'] },
  { province: 'Sumatera Utara', regency: 'Nias Selatan', subdistrict: 'Teluk Dalam', lat: 0.5623, lng: 97.8188, proneTo: ['Gempa Bumi', 'Cuaca Ekstrem'] },
  { province: 'Sumatera Barat', regency: 'Agam', subdistrict: 'Canduang (Gunung Marapi)', lat: -0.3814, lng: 100.4739, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor', 'Banjir'] },
  { province: 'Sumatera Barat', regency: 'Padang', subdistrict: 'Kuranji', lat: -0.9255, lng: 100.4132, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Sumatera Barat', regency: 'Pesisir Selatan', subdistrict: 'Tarusan', lat: -1.3541, lng: 100.4529, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Sumatera Barat', regency: 'Pasaman Barat', subdistrict: 'Talamau', lat: 0.1782, lng: 99.9834, proneTo: ['Gempa Bumi', 'Tanah Longsor'] },
  { province: 'Riau', regency: 'Pelalawan', subdistrict: 'Teluk Meranti', lat: 0.2882, lng: 102.5621, proneTo: ['Kebakaran Hutan & Lahan', 'Banjir'] },
  { province: 'Riau', regency: 'Dumai', subdistrict: 'Medang Kampai', lat: 1.6372, lng: 101.4468, proneTo: ['Kebakaran Hutan & Lahan'] },
  { province: 'Riau', regency: 'Kampar', subdistrict: 'Siak Hulu', lat: 0.3421, lng: 101.4889, proneTo: ['Banjir'] },
  { province: 'Jambi', regency: 'Kerinci', subdistrict: 'Kayu Aro (Gunung Kerinci)', lat: -1.6972, lng: 101.2642, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Jambi', regency: 'Muaro Jambi', subdistrict: 'Kumpeh Ilir', lat: -1.5283, lng: 103.8821, proneTo: ['Kebakaran Hutan & Lahan', 'Banjir'] },
  { province: 'Sumatera Selatan', regency: 'Ogan Ilir', subdistrict: 'Pemulutan', lat: -3.2241, lng: 104.7429, proneTo: ['Kebakaran Hutan & Lahan'] },
  { province: 'Sumatera Selatan', regency: 'Palembang', subdistrict: 'Kertapati', lat: -3.0142, lng: 104.7621, proneTo: ['Banjir'] },
  { province: 'Lampung', regency: 'Lampung Selatan', subdistrict: 'Rajabasa (Krakatau Sector)', lat: -5.7328, lng: 105.5892, proneTo: ['Tsunami', 'Erupsi Gunung Api', 'Cuaca Ekstrem'] },
  { province: 'Lampung', regency: 'Pesawaran', subdistrict: 'Padang Cermin', lat: -5.5821, lng: 105.1429, proneTo: ['Banjir', 'Tanah Longsor'] },

  // Jawa
  { province: 'Banten', regency: 'Pandeglang', subdistrict: 'Labuan', lat: -6.4022, lng: 105.8291, proneTo: ['Banjir', 'Cuaca Ekstrem', 'Tsunami'] },
  { province: 'Banten', regency: 'Lebak', subdistrict: 'Cibeber', lat: -6.7482, lng: 106.3211, proneTo: ['Tanah Longsor', 'Banjir'] },
  { province: 'DKI Jakarta', regency: 'Jakarta Timur', subdistrict: 'Kampung Melayu', lat: -6.2291, lng: 106.8642, proneTo: ['Banjir'] },
  { province: 'DKI Jakarta', regency: 'Jakarta Barat', subdistrict: 'Rawa Buaya', lat: -6.1624, lng: 106.7265, proneTo: ['Banjir'] },
  { province: 'DKI Jakarta', regency: 'Jakarta Utara', subdistrict: 'Penjaringan (Rob)', lat: -6.1242, lng: 106.7911, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'DKI Jakarta', regency: 'Jakarta Selatan', subdistrict: 'Petogogan', lat: -6.2482, lng: 106.8042, proneTo: ['Banjir'] },
  { province: 'Jawa Barat', regency: 'Cianjur', subdistrict: 'Cugenang', lat: -6.8122, lng: 107.0892, proneTo: ['Gempa Bumi', 'Tanah Longsor'] },
  { province: 'Jawa Barat', regency: 'Bogor', subdistrict: 'Sukajaya', lat: -6.5891, lng: 106.5291, proneTo: ['Tanah Longsor', 'Banjir'] },
  { province: 'Jawa Barat', regency: 'Karawang', subdistrict: 'Telukjambe Barat', lat: -6.3142, lng: 107.2842, proneTo: ['Banjir'] },
  { province: 'Jawa Barat', regency: 'Bandung Barat', subdistrict: 'Lembang', lat: -6.8142, lng: 107.6182, proneTo: ['Tanah Longsor', 'Gempa Bumi'] },
  { province: 'Jawa Barat', regency: 'Garut', subdistrict: 'Tarogong Kidul', lat: -7.2142, lng: 107.8921, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Jawa Barat', regency: 'Sukabumi', subdistrict: 'Cisolok', lat: -6.9521, lng: 106.4521, proneTo: ['Gempa Bumi', 'Tanah Longsor'] },
  { province: 'Jawa Tengah', regency: 'Demak', subdistrict: 'Karanganyar', lat: -6.8921, lng: 110.7421, proneTo: ['Banjir'] },
  { province: 'Jawa Tengah', regency: 'Magelang', subdistrict: 'Dukun (Gunung Merapi)', lat: -7.5621, lng: 110.3421, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Jawa Tengah', regency: 'Cilacap', subdistrict: 'Nusakambangan / Kroya', lat: -7.6291, lng: 109.2482, proneTo: ['Banjir', 'Cuaca Ekstrem', 'Tsunami'] },
  { province: 'Jawa Tengah', regency: 'Semarang', subdistrict: 'Genuk', lat: -6.9621, lng: 110.4621, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Jawa Tengah', regency: 'Banyumas', subdistrict: 'Tambak', lat: -7.6042, lng: 109.3821, proneTo: ['Tanah Longsor', 'Banjir'] },
  { province: 'D.I. Yogyakarta', regency: 'Sleman', subdistrict: 'Pakem (Lereng Merapi)', lat: -7.6742, lng: 110.4121, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'D.I. Yogyakarta', regency: 'Gunungkidul', subdistrict: 'Nglipar', lat: -7.9121, lng: 110.6482, proneTo: ['Tanah Longsor', 'Cuaca Ekstrem'] },
  { province: 'D.I. Yogyakarta', regency: 'Bantul', subdistrict: 'Imogiri', lat: -7.9242, lng: 110.3892, proneTo: ['Gempa Bumi', 'Banjir'] },
  { province: 'Jawa Timur', regency: 'Lumajang', subdistrict: 'Candipuro (Gunung Semeru)', lat: -8.1821, lng: 112.9842, proneTo: ['Erupsi Gunung Api', 'Banjir', 'Tanah Longsor'] },
  { province: 'Jawa Timur', regency: 'Malang', subdistrict: 'Pujon', lat: -7.8642, lng: 112.4821, proneTo: ['Tanah Longsor', 'Cuaca Ekstrem'] },
  { province: 'Jawa Timur', regency: 'Pacitan', subdistrict: 'Kebonagung', lat: -8.2241, lng: 111.1282, proneTo: ['Tanah Longsor', 'Banjir', 'Cuaca Ekstrem'] },
  { province: 'Jawa Timur', regency: 'Banyuwangi', subdistrict: 'Licin (Gunung Ijen)', lat: -8.1892, lng: 114.2821, proneTo: ['Erupsi Gunung Api', 'Cuaca Ekstrem'] },
  { province: 'Jawa Timur', regency: 'Sampang', subdistrict: 'Kota Sampang', lat: -7.1891, lng: 113.2421, proneTo: ['Banjir'] },

  // Bali & Nusa Tenggara
  { province: 'Bali', regency: 'Karangasem', subdistrict: 'Rendang (Gunung Agung)', lat: -8.3432, lng: 115.5081, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Bali', regency: 'Badung', subdistrict: 'Kuta Selatan', lat: -8.7921, lng: 115.1842, proneTo: ['Cuaca Ekstrem', 'Banjir'] },
  { province: 'Nusa Tenggara Barat', regency: 'Lombok Utara', subdistrict: 'Bayan (Gunung Rinjani)', lat: -8.2721, lng: 116.4282, proneTo: ['Gempa Bumi', 'Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Nusa Tenggara Barat', regency: 'Bima', subdistrict: 'Woha', lat: -8.5421, lng: 118.7282, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Nusa Tenggara Timur', regency: 'Flores Timur', subdistrict: 'Wulanggitang (Gunung Lewotobi)', lat: -8.5382, lng: 122.7721, proneTo: ['Erupsi Gunung Api', 'Banjir', 'Tanah Longsor'] },
  { province: 'Nusa Tenggara Timur', regency: 'Lembata', subdistrict: 'Ile Ape (Gunung Lewotolok)', lat: -8.2741, lng: 123.5121, proneTo: ['Erupsi Gunung Api', 'Tanah Longsor'] },
  { province: 'Nusa Tenggara Timur', regency: 'Kupang', subdistrict: 'Amarasi', lat: -10.2842, lng: 123.7421, proneTo: ['Cuaca Ekstrem', 'Banjir'] },

  // Kalimantan
  { province: 'Kalimantan Barat', regency: 'Sintang', subdistrict: 'Kayan Hilir', lat: 0.0821, lng: 111.4921, proneTo: ['Banjir'] },
  { province: 'Kalimantan Barat', regency: 'Ketapang', subdistrict: 'Kendawangan', lat: -2.3842, lng: 110.2241, proneTo: ['Kebakaran Hutan & Lahan'] },
  { province: 'Kalimantan Tengah', regency: 'Palangka Raya', subdistrict: 'Sebangau', lat: -2.2241, lng: 113.9142, proneTo: ['Kebakaran Hutan & Lahan', 'Banjir'] },
  { province: 'Kalimantan Tengah', regency: 'Katingan', subdistrict: 'Katingan Tengah', lat: -1.7482, lng: 113.3821, proneTo: ['Banjir'] },
  { province: 'Kalimantan Selatan', regency: 'Banjar', subdistrict: 'Martapura', lat: -3.4241, lng: 114.8421, proneTo: ['Banjir'] },
  { province: 'Kalimantan Selatan', regency: 'Tanah Laut', subdistrict: 'Bati-Bati', lat: -3.6121, lng: 114.7182, proneTo: ['Kebakaran Hutan & Lahan'] },
  { province: 'Kalimantan Timur', regency: 'Samarinda', subdistrict: 'Samarinda Utara', lat: -0.4721, lng: 117.1621, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Kalimantan Timur', regency: 'Mahakam Ulu', subdistrict: 'Long Bagun', lat: 0.4281, lng: 115.3421, proneTo: ['Banjir'] },
  { province: 'Kalimantan Utara', regency: 'Nunukan', subdistrict: 'Sembakung', lat: 3.8421, lng: 117.1892, proneTo: ['Banjir'] },

  // Sulawesi
  { province: 'Sulawesi Selatan', regency: 'Luwu Utara', subdistrict: 'Masamba', lat: -2.5482, lng: 120.3241, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Sulawesi Selatan', regency: 'Makassar', subdistrict: 'Biringkanaya', lat: -5.1182, lng: 119.5121, proneTo: ['Banjir', 'Cuaca Ekstrem'] },
  { province: 'Sulawesi Selatan', regency: 'Gowa', subdistrict: 'Parangloe', lat: -5.2842, lng: 119.7421, proneTo: ['Tanah Longsor', 'Banjir'] },
  { province: 'Sulawesi Tengah', regency: 'Palu', subdistrict: 'Palu Barat', lat: -0.8921, lng: 119.8521, proneTo: ['Gempa Bumi', 'Tsunami', 'Banjir'] },
  { province: 'Sulawesi Tengah', regency: 'Sigi', subdistrict: 'Dolo Selatan', lat: -1.1482, lng: 119.9241, proneTo: ['Banjir', 'Tanah Longsor', 'Gempa Bumi'] },
  { province: 'Sulawesi Utara', regency: 'Kepulauan Sitaro', subdistrict: 'Tagulandang (Gunung Ruang)', lat: 2.3021, lng: 125.3721, proneTo: ['Erupsi Gunung Api', 'Tsunami'] },
  { province: 'Sulawesi Utara', regency: 'Manado', subdistrict: 'Tuminting', lat: 1.5121, lng: 124.8482, proneTo: ['Banjir', 'Cuaca Ekstrem', 'Tanah Longsor'] },
  { province: 'Sulawesi Tenggara', regency: 'Kendari', subdistrict: 'Mandonga', lat: -3.9621, lng: 122.5241, proneTo: ['Banjir'] },

  // Maluku & Papua
  { province: 'Maluku', regency: 'Ambon', subdistrict: 'Sirimau', lat: -3.6842, lng: 128.1892, proneTo: ['Tanah Longsor', 'Cuaca Ekstrem'] },
  { province: 'Maluku', regency: 'Maluku Tengah', subdistrict: 'Tehoru', lat: -3.3241, lng: 129.5421, proneTo: ['Gempa Bumi', 'Tsunami'] },
  { province: 'Maluku Utara', regency: 'Ternate', subdistrict: 'Pulau Ternate (Gunung Gamalama)', lat: 0.8122, lng: 127.3421, proneTo: ['Erupsi Gunung Api', 'Cuaca Ekstrem'] },
  { province: 'Papua', regency: 'Jayapura', subdistrict: 'Sentani', lat: -2.5742, lng: 140.4821, proneTo: ['Banjir', 'Tanah Longsor'] },
  { province: 'Papua Tengah', regency: 'Nabire', subdistrict: 'Teluk Kimi', lat: -3.3642, lng: 135.5121, proneTo: ['Gempa Bumi', 'Banjir'] },
  { province: 'Papua Barat', regency: 'Sorong', subdistrict: 'Aimas', lat: -0.9241, lng: 131.3421, proneTo: ['Banjir', 'Tanah Longsor'] }
];

// Helper to generate representative synthetic data with consistency
function generateSimulatedIncidents(): DisasterIncident[] {
  const incidents: DisasterIncident[] = [];
  
  // Specific real-scenario simulated anchors (high fidelity for realistic operations)
  const anchorIncidents: Partial<DisasterIncident>[] = [
    {
      incident_id: 'RSQ-2026-0891',
      disaster_type: 'Erupsi Gunung Api',
      title: 'Aktivitas Erupsi Kolom Abu Vulkanik Gunung Lewotobi Laki-laki',
      province: 'Nusa Tenggara Timur',
      regency: 'Flores Timur',
      subdistrict: 'Wulanggitang',
      latitude: -8.5382,
      longitude: 122.7721,
      severity: 'Kritis',
      reported_at: '2026-10-29T19:30:00Z',
      affected_population: 14250,
      displaced_population: 6840,
      injured_count: 32,
      fatalities_count: 4,
      damaged_houses: 412,
      verification_status: 'Terverifikasi',
      response_status: 'Respons Aktif',
      data_source: 'PVMBG Pos Pengamatan & Pusdalops BPBD Flotim',
      last_updated: '2026-10-30T04:15:00Z',
      description: 'Lontaran material pijar setinggi 3.500 m di atas puncak. Zona bahaya radius 7 km diperluas. Jalur evakuasi utama tertutup hujan abu lebat.',
      needs: ['Masker N95', 'Tenda Pengungsian', 'Dapur Umum Lapangan', 'Air Bersih', 'Obat ISPA'],
      assigned_team: 'TRC BPBD Flores Timur & Basarnas Maumere',
    },
    {
      incident_id: 'RSQ-2026-0888',
      disaster_type: 'Banjir',
      title: 'Banjir Bandang & Tanggul Jebol Sungai Wulan Demak',
      province: 'Jawa Tengah',
      regency: 'Demak',
      subdistrict: 'Karanganyar',
      latitude: -6.8921,
      longitude: 110.7421,
      severity: 'Kritis',
      reported_at: '2026-10-28T03:15:00Z',
      affected_population: 28400,
      displaced_population: 12300,
      injured_count: 45,
      fatalities_count: 2,
      damaged_houses: 1850,
      verification_status: 'Terverifikasi',
      response_status: 'Respons Aktif',
      data_source: 'BBWS Pemali Juana & Posko Komando Demak',
      last_updated: '2026-10-30T06:00:00Z',
      description: 'Debit banjir kiriman melimpas tanggul utama. Ketinggian air genangan mencapai 150-250 cm di pemukiman dan memutus jalur Pantura.',
      needs: ['Perahu Karet Mesin', 'Pelampung', 'Pompa Alkon Kapasitas Besar', 'Makanan Siap Saji', 'Pembalut & Popok'],
      assigned_team: 'TRC BNPB & Kodim 0716/Demak',
      water_level_cm: 220,
    },
    {
      incident_id: 'RSQ-2026-0885',
      disaster_type: 'Gempa Bumi',
      title: 'Gempa Tektonik Dangkal Sesar Cianjur M 5.2',
      province: 'Jawa Barat',
      regency: 'Cianjur',
      subdistrict: 'Cugenang',
      latitude: -6.8122,
      longitude: 107.0892,
      severity: 'Tinggi',
      reported_at: '2026-10-27T14:42:00Z',
      affected_population: 8600,
      displaced_population: 3100,
      injured_count: 58,
      fatalities_count: 1,
      damaged_houses: 320,
      verification_status: 'Terverifikasi',
      response_status: 'Penanganan Lanjutan',
      data_source: 'Sensor BMKG Seismisitas & BPBD Jawa Barat',
      last_updated: '2026-10-29T11:20:00Z',
      description: 'Guncangan intensitas V-VI MMI merusak bangunan semi-permanen. Sejumlah tebing bukit longsor menutup akses jalan desa.',
      needs: ['Tenda Keluarga', 'Trauma Healing Kit', 'Genset Darurat', 'Semen & Terpal'],
      assigned_team: 'BPBD Kab. Cianjur & Tagana Jabar',
      magnitude: 5.2,
      depth_km: 10,
    },
    {
      incident_id: 'RSQ-2026-0879',
      disaster_type: 'Tanah Longsor',
      title: 'Longsor Jalur Lintas Agam - Bukittinggi Lembah Anai',
      province: 'Sumatera Barat',
      regency: 'Agam',
      subdistrict: 'Canduang',
      latitude: -0.3814,
      longitude: 100.4739,
      severity: 'Tinggi',
      reported_at: '2026-10-28T21:10:00Z',
      affected_population: 3200,
      displaced_population: 850,
      injured_count: 14,
      fatalities_count: 3,
      damaged_houses: 45,
      verification_status: 'Terverifikasi',
      response_status: 'Respons Aktif',
      data_source: 'Laporan Radio Pusdalops PB Sumatera Barat',
      last_updated: '2026-10-30T02:40:00Z',
      description: 'Material tebing setinggi 40 meter longsor setelah diguyur hujan intensitas ekstrem selama 6 jam tanpa henti.',
      needs: ['Alat Berat Excavator', 'Lampu Sorot Lapangan', 'Kantong Jenazah', 'Logistik Dapur'],
      assigned_team: 'Dinas Bina Marga & Basarnas Padang',
    },
    {
      incident_id: 'RSQ-2026-0874',
      disaster_type: 'Kebakaran Hutan & Lahan',
      title: 'Karhutla Lahan Gambut Berkelanjutan Teluk Meranti',
      province: 'Riau',
      regency: 'Pelalawan',
      subdistrict: 'Teluk Meranti',
      latitude: 0.2882,
      longitude: 102.5621,
      severity: 'Sedang',
      reported_at: '2026-10-26T10:00:00Z',
      affected_population: 5400,
      displaced_population: 120,
      injured_count: 18,
      fatalities_count: 0,
      damaged_houses: 4,
      verification_status: 'Terverifikasi',
      response_status: 'Respons Aktif',
      data_source: 'Hotspot Modis/VIIRS LAPAN-BRIN & Manggala Agni',
      last_updated: '2026-10-29T16:15:00Z',
      description: 'Titik api meluas di lapisan gambut dalam mencapai kedalaman 1,5 meter. Asap tebal mengganggu jarak pandang di radius 15 km.',
      needs: ['Helikopter Water Bombing', 'Nozzle Pompa Gambut', 'Masker Gas Respirator', 'Suplemen Vitamin'],
      assigned_team: 'Satgas Gabungan Karhutla Riau & Manggala Agni',
    },
    {
      incident_id: 'RSQ-2026-0870',
      disaster_type: 'Cuaca Ekstrem',
      title: 'Angin Puting Beliung & Gelombang Pasang Pesisir Labuan',
      province: 'Banten',
      regency: 'Pandeglang',
      subdistrict: 'Labuan',
      latitude: -6.4022,
      longitude: 105.8291,
      severity: 'Sedang',
      reported_at: '2026-10-25T16:20:00Z',
      affected_population: 4100,
      displaced_population: 620,
      injured_count: 9,
      fatalities_count: 0,
      damaged_houses: 180,
      verification_status: 'Terverifikasi',
      response_status: 'Penanganan Lanjutan',
      data_source: 'Pusdalops BPBD Kabupaten Pandeglang',
      last_updated: '2026-10-28T09:30:00Z',
      description: 'Angin kencang disertai hujan deras merobohkan 30 pohon peneduh jalan dan merusak atap ratusan rumah nelayan serta dermaga kapal ikan.',
      needs: ['Kayu & Seng Penutup Atap', 'Bantuan Terpal', 'Sembako Keluarga'],
      assigned_team: 'BPBD Pandeglang & Relawan PMI Banten',
    },
    {
      incident_id: 'RSQ-2026-0865',
      disaster_type: 'Banjir',
      title: 'Genangan Luapan Kali Ciliwung Kampung Melayu & Bidara Cina',
      province: 'DKI Jakarta',
      regency: 'Jakarta Timur',
      subdistrict: 'Kampung Melayu',
      latitude: -6.2291,
      longitude: 106.8642,
      severity: 'Sedang',
      reported_at: '2026-10-29T22:30:00Z',
      affected_population: 7800,
      displaced_population: 940,
      injured_count: 4,
      fatalities_count: 0,
      damaged_houses: 350,
      verification_status: 'Terverifikasi',
      response_status: 'Respons Aktif',
      data_source: 'Dinas SDA DKI & Bendung Katulampa Telemetri',
      last_updated: '2026-10-30T05:20:00Z',
      description: 'Debit Katulampa Siaga 2 diteruskan ke hilir ibukota. Air meluap merendam RW 07 dan RW 08 setinggi 70 - 140 cm.',
      needs: ['Makanan Cepat Saji', 'Air Minum Galon', 'Obat Kulit', 'Selimut'],
      assigned_team: 'PPSU Jaktim, Satpol PP, BPBD DKI',
      water_level_cm: 110,
    },
    {
      incident_id: 'RSQ-2026-0860',
      disaster_type: 'Tsunami',
      title: 'Peringatan Dini Simulasi / Uji Sirine Tsunami Pesisir Selatan',
      province: 'Jawa Timur',
      regency: 'Pacitan',
      subdistrict: 'Kebonagung',
      latitude: -8.2241,
      longitude: 111.1282,
      severity: 'Rendah',
      reported_at: '2026-10-24T08:00:00Z',
      affected_population: 1200,
      displaced_population: 0,
      injured_count: 0,
      fatalities_count: 0,
      damaged_houses: 0,
      verification_status: 'Terverifikasi',
      response_status: 'Selesai',
      data_source: 'InaTEWS BMKG & BPBD Pacitan Drill',
      last_updated: '2026-10-24T12:00:00Z',
      description: 'Latihan kesiapsiagaan tsunami desa pesisir tangguh bencana. Waktu evakuasi rata-rata warga 12 menit menuju TES (Tempat Evakuasi Sementara).',
      needs: ['Peremajaan Rambu Evakuasi', 'Baterai Cadangan Sirine'],
      assigned_team: 'Forum PRB Pacitan & BPBD',
    },
    {
      incident_id: 'RSQ-2026-0855',
      disaster_type: 'Banjir',
      title: 'Laporan Awal Banjir Luapan Sungai Palu',
      province: 'Sulawesi Tengah',
      regency: 'Palu',
      subdistrict: 'Palu Barat',
      latitude: -0.8921,
      longitude: 119.8521,
      severity: 'Sedang',
      reported_at: '2026-10-30T00:15:00Z',
      affected_population: 2900,
      displaced_population: 410,
      injured_count: 2,
      fatalities_count: 0,
      damaged_houses: 88,
      verification_status: 'Dalam Verifikasi',
      response_status: 'Siaga / Assessment',
      data_source: 'Laporan Relawan Komunitas RAPI',
      last_updated: '2026-10-30T05:00:00Z',
      description: 'Hujan deras semalam di hulu sungai Gumbasa mengakibatkan air naik ke jalan Diponegoro setinggi 40-60 cm.',
      needs: ['Tim Asesmen TRC', 'Draf Kebutuhan Logistik'],
      assigned_team: 'TRC BPBD Kota Palu',
      water_level_cm: 55,
    },
    {
      incident_id: 'RSQ-2026-0850',
      disaster_type: 'Tanah Longsor',
      title: 'Potensi Longsor Tebing Pemukiman Perbukitan Jayapura',
      province: 'Papua',
      regency: 'Jayapura',
      subdistrict: 'Sentani',
      latitude: -2.5742,
      longitude: 140.4821,
      severity: 'Tinggi',
      reported_at: '2026-10-29T07:20:00Z',
      affected_population: 1800,
      displaced_population: 520,
      injured_count: 7,
      fatalities_count: 0,
      damaged_houses: 24,
      verification_status: 'Dalam Verifikasi',
      response_status: 'Siaga / Assessment',
      data_source: 'Laporan Camat Sentani & Babinsa',
      last_updated: '2026-10-29T18:00:00Z',
      description: 'Retakan tanah selebar 25 cm sepanjang 60 meter muncul di pemukiman bukit. 80 KK diinstruksikan mengungsi mandiri.',
      needs: ['Tenda Pengungsi Darurat', 'Geolistrik Analisis Stabilitas Lereng', 'Makanan Bayi'],
      assigned_team: 'BPBD Kabupaten Jayapura',
    },
    {
      incident_id: 'RSQ-2026-0842',
      disaster_type: 'Cuaca Ekstrem',
      title: 'Puting Beliung Rusak Puluhan Kios dan Fasilitas Nelayan Kuta',
      province: 'Bali',
      regency: 'Badung',
      subdistrict: 'Kuta Selatan',
      latitude: -8.7921,
      longitude: 115.1842,
      severity: 'Rendah',
      reported_at: '2026-10-23T11:45:00Z',
      affected_population: 650,
      displaced_population: 0,
      injured_count: 3,
      fatalities_count: 0,
      damaged_houses: 35,
      verification_status: 'Terverifikasi',
      response_status: 'Selesai',
      data_source: 'Polairud & BPBD Badung',
      last_updated: '2026-10-25T16:00:00Z',
      description: 'Pusaran angin puting beliung terjadi di perairan lalu menyapu pesisir pantai Kedonganan. Pembersihan puing selesai dilakukan.',
      needs: ['Material Perbaikan Ringan'],
      assigned_team: 'BPBD Kab. Badung',
    },
    {
      incident_id: 'RSQ-2026-0839',
      disaster_type: 'Banjir',
      title: 'Laporan Belum Terverifikasi Genangan Luapan Sungai Martapura',
      province: 'Kalimantan Selatan',
      regency: 'Banjar',
      subdistrict: 'Martapura',
      latitude: -3.4241,
      longitude: 114.8421,
      severity: 'Rendah',
      reported_at: '2026-10-30T03:40:00Z',
      affected_population: 950,
      displaced_population: 0,
      injured_count: 0,
      fatalities_count: 0,
      damaged_houses: 0,
      verification_status: 'Belum Diverifikasi',
      response_status: 'Belum Ditangani',
      data_source: 'Laporan Aplikasi Warga (Simulasi Crowdsource)',
      last_updated: '2026-10-30T03:40:00Z',
      description: 'Warga melaporkan air sungai melimpas ke badan jalan Ahmad Yani km 38 setinggi 20-30 cm akibat pasang laut bersamaan hujan deras.',
      needs: ['Verifikasi Lapangan Petugas Posko'],
      water_level_cm: 25,
    }
  ];

  // Add the curated anchors first
  anchorIncidents.forEach((item, index) => {
    incidents.push({
      id: `inc-${index + 1}`,
      incident_id: item.incident_id!,
      disaster_type: item.disaster_type!,
      title: item.title!,
      province: item.province!,
      regency: item.regency!,
      subdistrict: item.subdistrict || 'Pusat Wilayah',
      latitude: item.latitude!,
      longitude: item.longitude!,
      reported_at: item.reported_at!,
      severity: item.severity!,
      affected_population: item.affected_population!,
      displaced_population: item.displaced_population!,
      injured_count: item.injured_count || 0,
      fatalities_count: item.fatalities_count || 0,
      damaged_houses: item.damaged_houses || 0,
      verification_status: item.verification_status!,
      response_status: item.response_status!,
      data_source: item.data_source!,
      last_updated: item.last_updated!,
      description: item.description!,
      needs: item.needs || ['Pangan Siap Saji', 'Terpal', 'Obat-obatan'],
      assigned_team: item.assigned_team,
      water_level_cm: item.water_level_cm,
      magnitude: item.magnitude,
      depth_km: item.depth_km,
    });
  });

  // Now procedurally generate realistic incidents to reach 115 total across all provinces
  const severities: SeverityLevel[] = ['Rendah', 'Sedang', 'Tinggi', 'Kritis'];
  const verifStatuses: VerificationStatus[] = ['Terverifikasi', 'Terverifikasi', 'Terverifikasi', 'Dalam Verifikasi', 'Belum Diverifikasi'];
  const responseStatuses: ResponseStatus[] = ['Respons Aktif', 'Penanganan Lanjutan', 'Siaga / Assessment', 'Selesai', 'Belum Ditangani'];
  const sources = [
    'Pusdalops BPBD Provinsi',
    'Sensor Telemetri AWLR',
    'Laporan Petugas Pos Lapangan',
    'Feed Otomatis BMKG (Simulasi)',
    'Citra Satelit Sentinel / LAPAN',
    'Laporan Warga Terverifikasi',
    'Posko Siaga Darurat TNI/Polri'
  ];

  const disasterTitles: Record<DisasterType, string[]> = {
    'Banjir': [
      'Luapan Aliran Sungai dan Genangan Pemukiman',
      'Banjir Bandang Pasca Hujan Lebat Berdurasi Panjang',
      'Genangan Pasang Air Laut (Rob) Kawasan Pesisir',
      'Banjir Rendam Akses Jalan Utama dan Lahan Pertanian'
    ],
    'Gempa Bumi': [
      'Gempa Tektonik Dangkal Mengguncang Pemukiman',
      'Aktivitas Seismik Sesar Lokal Terasa Sedang',
      'Gempa Bumi Terasa di Wilayah Pesisir dan Dataran Tinggi'
    ],
    'Tanah Longsor': [
      'Longsoran Tebing Menutup Akses Antar Desa',
      'Pergerakan Tanah Mengancam Puluhan Rumah di Lereng',
      'Runtuhan Batu dan Tanah Akibat Penjenuhan Air Hujan'
    ],
    'Erupsi Gunung Api': [
      'Peningkatan Emisi Kolom Asap dan Guguran Lava Pijar',
      'Hujan Abu Vulkanik Sedang Terbawa Angin ke Barat Daya',
      'Tremor Harmonik Meningkat dan Waspada Radius Bahaya'
    ],
    'Kebakaran Hutan & Lahan': [
      'Titik Panas (Hotspot) Meluas di Areal Vegetasi Kering',
      'Kebakaran Lahan Gambut Berasap Tebal Dekat Pemukiman',
      'Kebakaran Vegetasi Semak Belukar Perbukitan Kering'
    ],
    'Cuaca Ekstrem': [
      'Angin Kencang / Puting Beliung Tumbangkan Pepohonan',
      'Hujan Badai Disertai Kilat dan Gelombang Tinggi',
      'Hujan Es Sesaat Disertai Angin Kencang Rusak Atap Rumah'
    ],
    'Tsunami': [
      'Simulasi Jalur Evakuasi dan Gladi Evakuasi Mandiri Tsunami',
      'Deteksi Anomali Ketinggian Gelombang Pesisir Sensor Buoy'
    ]
  };

  const commonNeedsPool = [
    'Paket Sembako Siap Saji',
    'Tenda Gulung & Terpal',
    'Air Bersih & Tangki Distribusi',
    'Obat-Obatan & Vitamin',
    'Selimut & Matras Tidur',
    'Perahu Karet Operasional',
    'Peralatan Dapur Umum',
    'Genset Penerangan Malam',
    'Popok Balita & Pembalut',
    'Masker Debu & Pelindung Saluran Nafas'
  ];

  let currentId = anchorIncidents.length + 1;
  const targetTotal = 118;

  while (incidents.length < targetTotal) {
    const seed = REGION_SEEDS[(currentId * 7) % REGION_SEEDS.length];
    const disasterType = seed.proneTo[(currentId + 2) % seed.proneTo.length];
    
    // Slight offset coordinates around the seed (within ~0.08 degrees)
    const latOffset = ((Math.sin(currentId * 13) * 0.07) * 1000) / 1000;
    const lngOffset = ((Math.cos(currentId * 17) * 0.07) * 1000) / 1000;

    const severityIndex = (currentId % 7 === 0) ? 3 : (currentId % 3 === 0) ? 2 : (currentId % 2 === 0) ? 1 : 0;
    const severity = severities[severityIndex];

    const verif = verifStatuses[currentId % verifStatuses.length];
    const resp = verif === 'Belum Diverifikasi' 
      ? 'Belum Ditangani' 
      : verif === 'Dalam Verifikasi' 
      ? 'Siaga / Assessment' 
      : responseStatuses[currentId % responseStatuses.length];

    // Date generation within last 25 days
    const hoursAgo = (currentId * 4.7) % 600;
    const dateObj = new Date(Date.now() - hoursAgo * 3600 * 1000);
    const reported_at = dateObj.toISOString();

    const updateObj = new Date(dateObj.getTime() + (Math.min(hoursAgo * 0.5, 8)) * 3600 * 1000);
    const last_updated = updateObj.toISOString();

    const affectedBase = severity === 'Kritis' ? 12000 : severity === 'Tinggi' ? 4500 : severity === 'Sedang' ? 1400 : 350;
    const affected = Math.round(affectedBase * (0.6 + ((currentId * 19) % 80) / 100));
    const displaced = severity === 'Kritis' || severity === 'Tinggi' 
      ? Math.round(affected * (0.2 + ((currentId * 11) % 40) / 100))
      : Math.round(affected * (0.05 + ((currentId * 7) % 15) / 100));

    const injured = severity === 'Kritis' ? Math.round(15 + (currentId % 30)) : severity === 'Tinggi' ? Math.round(5 + (currentId % 15)) : Math.round(currentId % 5);
    const fatalities = severity === 'Kritis' && currentId % 3 === 0 ? Math.round(1 + (currentId % 4)) : 0;
    const damagedHouses = Math.round(displaced * (0.25 + ((currentId % 5) * 0.05)));

    const titleList = disasterTitles[disasterType];
    const titleLead = titleList[currentId % titleList.length];
    const title = `${titleLead} di ${seed.regency}`;

    const incidentNeeds = [
      commonNeedsPool[currentId % commonNeedsPool.length],
      commonNeedsPool[(currentId + 3) % commonNeedsPool.length],
      commonNeedsPool[(currentId + 6) % commonNeedsPool.length],
    ];

    incidents.push({
      id: `inc-${currentId}`,
      incident_id: `RSQ-2026-${(900 - currentId).toString().padStart(4, '0')}`,
      disaster_type: disasterType,
      title,
      province: seed.province,
      regency: seed.regency,
      subdistrict: seed.subdistrict,
      latitude: Number((seed.lat + latOffset).toFixed(4)),
      longitude: Number((seed.lng + lngOffset).toFixed(4)),
      reported_at,
      severity,
      affected_population: affected,
      displaced_population: displaced,
      injured_count: injured,
      fatalities_count: fatalities,
      damaged_houses: damagedHouses,
      verification_status: verif,
      response_status: resp,
      data_source: sources[currentId % sources.length],
      last_updated,
      description: `Peristiwa ${disasterType.toLowerCase()} tercatat di wilayah ${seed.subdistrict}, ${seed.regency}. Tim asesmen BPBD dan instansi teknis memantau dinamika lapangan dan mendistribusikan penanganan awal.`,
      needs: incidentNeeds,
      assigned_team: resp !== 'Belum Ditangani' ? `Satgas TRC ${seed.province} Pos Unit ${1 + (currentId % 4)}` : undefined,
      water_level_cm: disasterType === 'Banjir' ? 40 + ((currentId * 13) % 180) : undefined,
      magnitude: disasterType === 'Gempa Bumi' ? Number((4.5 + ((currentId % 30) / 10)).toFixed(1)) : undefined,
      depth_km: disasterType === 'Gempa Bumi' ? 10 + ((currentId * 7) % 80) : undefined
    });

    currentId++;
  }

  return incidents;
}

export const INITIAL_SIMULATED_INCIDENTS: DisasterIncident[] = generateSimulatedIncidents();

// Pre-configured AI Engines information
export const SIMULATED_AI_ENGINES: AIEngine[] = [
  {
    id: 'ai-engine-1',
    name: 'Engine 1: Risk Intelligence',
    codeName: 'RESQ-RISK-PREDICTOR',
    description: 'Analisis gabungan prakiraan curah hujan ekstrem GSMaP/BMKG, kerentanan topografi lereng, dan indeks elevasi banjir untuk mengidentifikasi ancaman multiriko dalam radius 48 jam ke depan.',
    inputData: [
      'Model Cuaca Numerik GFS / ECMWF 3-hari',
      'Digital Elevation Model (DEMNAS 8m)',
      'Riwayat Spasial Banjir & Longsor 10 Tahun BNPB',
      'Sensor Debit Air AWLR Sungai Utama'
    ],
    outputData: [
      'Peta Probabilitas Bahaya Spasial (H-48)',
      'Indeks Komposit Kerentanan Pemukiman (0-100)',
      'Early Warning Threshold Alert per Kecamatan'
    ],
    status: 'OPTIMAL',
    confidenceScore: 92,
    lastRun: '10 menit yang lalu (Siklus 15 Menit)',
    exampleRecommendation: 'Tingkatkan status kesiapsiagaan di hilir DAS Cimanuk (Garut-Majalengka) dari Waspada ke Siaga. Proyeksi debit puncak tiba pukul 02:30 WIB.',
    actionRequired: 'Rekomendasi diserahkan ke Pusdalops BPBD Jabar untuk verifikasi penerbitan Notice Siaga.',
    uncertaintyMargin: '± 12% (Koreksi Tutupan Awan Tropis)'
  },
  {
    id: 'ai-engine-2',
    name: 'Engine 2: Rapid Damage Assessment (RDA)',
    codeName: 'RESQ-RADAR-DAMAGE',
    description: 'Ekstraksi cepat tingkat kerusakan infrastruktur dan sebaran genangan pascabencana menggunakan inferensi radar sintetis SAR Sentinel-1 dan foto udara drone lapangan.',
    inputData: [
      'Citra Radar SAR Interferometrik Sebelum/Sesudah',
      'Feed Foto Drone Tim Reaksi Cepat BPBD',
      'OpenStreetMap Footprint Bangunan & Jalan',
      'Data Kepadatan Penduduk Dukcapil Kemendagri'
    ],
    outputData: [
      'Kalkulasi Estimasi Bangunan Rusak Berat/Sedang',
      'Peta Segmen Jalan Terputus / Jembatan Kritis',
      'Estimasi Awal Nilai Kerusakan Fisik (Miliar Rupiah)'
    ],
    status: 'PROCESSING',
    confidenceScore: 89,
    lastRun: 'Sedang berjalan (Batch Ingestion Flores Timur)',
    exampleRecommendation: 'Terdeteksi 412 atap bangunan terpapar material vulkanik tebal (>5cm) di radius 6 km barat daya kawah. Jalan akses Maumere-Larantuka tertutup material.',
    actionRequired: 'Butuh validasi ground check tim Basarnas sebelum penetapan zona steril relokasi.',
    uncertaintyMargin: '± 8% (Resolusi piksel satelit 10 meter)'
  },
  {
    id: 'ai-engine-3',
    name: 'Engine 3: Data Reconciliation & Deduplication',
    codeName: 'RESQ-SYNTH-RECON',
    description: 'Algoritma pencocokan multi-sumber untuk menyatukan laporan parsial yang tumpang tindih dari kanal publik, radio amatir (RAPI/ORARI), media sosial, dan laporan resmi posko.',
    inputData: [
      'Laporan WhatsApp Bot Darurat 911 (Crowdsource)',
      'Log Transkrip Radio Pusdalops PB',
      'Laporan Harian Puskesmas & Rumah Sakit Lapangan',
      'Database Verifikasi Kependudukan Desa'
    ],
    outputData: [
      'Single Source of Truth Korban Jiwa & Pengungsi',
      'Eliminasi Duplikasi Laporan Warga Lapangan (Deduplicated)',
      'Indeks Integritas Data (Credibility Rating)'
    ],
    status: 'OPTIMAL',
    confidenceScore: 95,
    lastRun: '1 menit yang lalu (Realtime Event Ingest)',
    exampleRecommendation: 'Menggabungkan 34 laporan warga mengenai banjir di Karanganyar Demak menjadi 1 kluster insiden terpadu ID RSQ-2026-0888 dengan akurasi koordinat 98%.',
    actionRequired: 'Status verifikasi otomatis disematkan "Terverifikasi Parsial" menunggu tanda tangan Kepala Posko.',
    uncertaintyMargin: '± 3% pada angka pengungsi terdaftar'
  },
  {
    id: 'ai-engine-4',
    name: 'Engine 4: Response Orchestration',
    codeName: 'RESQ-FLEET-DISPATCH',
    description: 'Pemodelan optimasi alokasi logistik, rute konvoi darurat terpendek terhindar dari jalan putus, dan rekomendasi penempatan posko kesehatan/dapur umum terdekat ke kantong pengungsi.',
    inputData: [
      'Inventori Gudang Regional Logistik BNPB/Kemsos',
      'Kapasitas & Status Personel TRC, TNI, Basarnas, PMI',
      'Peta Ketinggian Genangan & Status Ruas Jalan',
      'Data Demografi Rentan (Bayi, Lansia, Ibu Hamil)'
    ],
    outputData: [
      'Rencana Rute Konvoi Logistik (Navigasi Aman)',
      'Matriks Kebutuhan Mendesak per Titik Pengungsian',
      'Rekomendasi Pemindahan Posko dari Zona Terancam'
    ],
    status: 'OPTIMAL',
    confidenceScore: 91,
    lastRun: '15 menit yang lalu',
    exampleRecommendation: 'Alokasikan 4 perahu karet motor tempel dari Posko Kudus menuju Desa Undaan Kidul via rute alternatif jalan tanggul utara (estimasi tiba 35 menit).',
    actionRequired: 'Memerlukan persetujuan Komandan Lapangan Operasi Tanggap Darurat.',
    uncertaintyMargin: '± 10 menit estimasi waktu tempuh'
  },
  {
    id: 'ai-engine-5',
    name: 'Engine 5: Recovery & Reconstruction Intelligence',
    codeName: 'RESQ-RECOVER-INSIGHT',
    description: 'Proyeksi linimasa masa transisi darurat ke pemulihan dini, estimasi kebutuhan dana stimulan perbaikan rumah, serta rekomendasi mitigasi zonasi tata ruang berisiko.',
    inputData: [
      'Laporan Rekapitulasi Akhir Kerusakan Fisik',
      'Standar Biaya Khusus Rekonstruksi BNPB 2026',
      'Peta Rencana Tata Ruang Wilayah (RTRW) Kabupaten',
      'Indeks Ketahanan Sosial-Ekonomi Komunitas'
    ],
    outputData: [
      'Rencana Kebutuhan Anggaran Dana Siap Pakai (DSP)',
      'Peta Zona Merah Larangan Bangunan Tetap (ZNT)',
      'Timeline Rencana Aksi Rehabilitasi (0-180 Hari)'
    ],
    status: 'STANDBY',
    confidenceScore: 88,
    lastRun: '1 jam yang lalu (Kalkulasi Harian)',
    exampleRecommendation: 'Estimasi total kebutuhan stimulus perbaikan rumah di sektor Cugenang Cianjur tercatat Rp 16,8 Miliar untuk 320 unit dengan 3 kategori kerusakan.',
    actionRequired: 'Draf disiapkan untuk rapat koordinasi lintas kementerian Bappenas dan PUPR.',
    uncertaintyMargin: '± 15% estimasi biaya konstruksi lokal'
  }
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-johanes',
    name: 'Johanes Harindrias Kurniawan',
    nim: '2511600070',
    role: 'ADMIN_NASIONAL',
    position: 'Komandan Pengendali Operasi Pusdalops BNPB',
    agency: 'Pusdalops BNPB Pusat — Jakarta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Nasional (Seluruh NKRI)'
  },
  {
    id: 'usr-raviez',
    name: 'Raviez Perdana Putra',
    nim: '2511600021',
    role: 'ADMIN_NASIONAL',
    position: 'Koordinator Logistik & Sumber Daya Nasional',
    agency: 'Direktorat Logistik & Peralatan BNPB Pusat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Nasional (Otoritas Logistik Pusat)'
  },
  {
    id: 'usr-rizki',
    name: 'Rizki Awlia Fadjrin',
    nim: '2511600104',
    role: 'OPERATOR_DAERAH',
    position: 'Kepala Bidang Kedaruratan & Logistik BPBD Jawa Tengah',
    agency: 'BPBD Provinsi Jawa Tengah',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Jawa Tengah & D.I. Yogyakarta'
  },
  {
    id: 'usr-ilham',
    name: 'Ilham Nur Ramdani',
    nim: '2511600179',
    role: 'OPERATOR_DAERAH',
    position: 'Koordinator Satgas Posko Aju BPBD Jawa Barat',
    agency: 'BPBD Provinsi Jawa Barat',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Jawa Barat & DKI Jakarta'
  },
  {
    id: 'usr-imdad',
    name: 'Imdad Gusti',
    nim: '2511600393',
    role: 'PETUGAS_LAPANGAN',
    position: 'Komandan Satgas Reaksi Cepat (TRC) Lapangan',
    agency: 'Tim Reaksi Cepat (TRC) Basarnas & BNPB',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Garis Depan Lapangan (Semua Sektor Aktif)'
  },
  {
    id: 'usr-andre',
    name: 'Andre Oktora',
    nim: '2511600203',
    role: 'VIEWER_EKSEKUTIF',
    position: 'Tim Evaluator & Pengarah Eksekutif Kebijakan Penanggulangan',
    agency: 'Kemenko Pembangunan Manusia dan Kebudayaan (PMK)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assignedRegion: 'Nasional (Dashboard Pengawasan Eksekutif)'
  }
];
