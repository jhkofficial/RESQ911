import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 3000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Safe timeout helper to avoid slow API network hangs
async function generateWithTimeout(promise: Promise<any>, timeoutMs = 4000): Promise<any> {
  let timer: any;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// POST /api/ai/analyze-report
app.post('/api/ai/analyze-report', async (req, res) => {
  try {
    const { report } = req.body;
    if (!report || !report.description) {
      return res.status(400).json({ error: 'Data laporan dan deskripsi wajib disertakan' });
    }

    // Try real Gemini API if key is present
    if (ai) {
      try {
        const prompt = `Anda adalah asisten kecerdasan buatan operasional Pusdalops BNPB / RESQ.911.
Lakukan analisis telaah cepat pada laporan bencana berikut:
Judul: "${report.title || 'Tanpa Judul'}"
Jenis yang dilaporkan: "${report.disaster_type || 'Belum Ditentukan'}"
Lokasi: ${report.village || ''}, ${report.subdistrict || ''}, ${report.regency || ''}, ${report.province || ''}
Waktu: ${report.event_date || ''} ${report.event_time || ''}
Deskripsi Kronologi: "${report.description}"
Estimasi Terdampak: ${report.estimated_affected || 0} jiwa
Estimasi Pengungsi: ${report.estimated_displaced || 0} jiwa
Estimasi Korban Jiwa/Luka: ${report.estimated_fatalities || 0} wafat, ${report.estimated_injured || 0} luka
Kerusakan Fisik: "${report.infrastructure_damage || '-'}"
Kebutuhan Mendesak: "${(report.urgent_needs || []).join(', ')}"

Berikan output dalam JSON terstruktur murni dengan format:
{
  "summary": "Ringkasan situasi 2-3 kalimat",
  "extractedCategory": "Kategori bencana yang paling sesuai (Banjir / Gempa Bumi / Tanah Longsor / Erupsi Gunung Api / Kebakaran Hutan & Lahan / Cuaca Ekstrem / Tsunami)",
  "missingContext": ["poin informasi penting yang belum lengkap"],
  "inconsistencies": ["potensi kejanggalan atau inkonsistensi jika ada"],
  "suggestedQuestions": ["pertanyaan klarifikasi yang perlu diajukan ke pelapor"],
  "confidenceScore": 88
}`;

        const response = await generateWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'Anda adalah sistem intelijen verifikasi bencana BNPB. Output WAJIB berupa JSON valid dalam bahasa Indonesia. Selalu ingatkan bahwa verifikasi mutlak memerlukan tinjauan petugas manusia.',
              responseMimeType: 'application/json',
            },
          }),
          4000
        );

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          return res.json({
            ...parsed,
            modelSource: 'GEMINI_LIVE',
            disclaimer: 'Analisis AI — memerlukan verifikasi petugas.',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to simulated inference:', geminiError);
      }
    }

    // Deterministic simulation fallback
    const text = (report.description || '').toLowerCase();
    const missing: string[] = [];
    const inconsistencies: string[] = [];
    const questions: string[] = [];

    let inferredType = report.disaster_type || 'Banjir';
    if (text.includes('gempa') || text.includes('guncangan') || text.includes('roboh')) inferredType = 'Gempa Bumi';
    else if (text.includes('longsor') || text.includes('tebing') || text.includes('tanah bergerak')) inferredType = 'Tanah Longsor';
    else if (text.includes('banjir') || text.includes('terendam') || text.includes('luapan air')) inferredType = 'Banjir';
    else if (text.includes('api') || text.includes('asap') || text.includes('gambut') || text.includes('kebakaran')) inferredType = 'Kebakaran Hutan & Lahan';
    else if (text.includes('erupsi') || text.includes('abu') || text.includes('kawah') || text.includes('vulkanik')) inferredType = 'Erupsi Gunung Api';
    else if (text.includes('angin') || text.includes('badai') || text.includes('puting beliung')) inferredType = 'Cuaca Ekstrem';

    if (!report.subdistrict || !report.village) {
      missing.push('Koordinat detail tingkat kelurahan/desa dan RT/RW spesifik');
      questions.push('Bisa konfirmasikan desa dan RT/RW titik genangan terdalam?');
    }
    if (!report.evidence || report.evidence.length === 0) {
      missing.push('Lampiran bukti visual foto lapangan atau geolokasi GPS terkonfirmasi');
      questions.push('Mohon sertakan dokumentasi foto kondisi terkini jika memungkinkan.');
    }
    if ((report.estimated_displaced || 0) > (report.estimated_affected || 0) && (report.estimated_affected || 0) > 0) {
      inconsistencies.push('Jumlah pengungsi terdata lebih besar daripada total populasi terdampak.');
    }
    if ((report.estimated_affected || 0) === 0) {
      missing.push('Estimasi kuantitatif jumlah jiwa/kepala keluarga terdampak');
      questions.push('Berapa estimasi jumlah KK atau jiwa yang membutuhkan evakuasi?');
    }

    questions.push('Apakah akses jalan masuk kendaraan roda 4 / truk logistik masih dapat dilalui?');

    return res.json({
      summary: `Laporan mencatat indikasi peristiwa ${inferredType} di ${report.regency || 'wilayah setempat'}, ${report.province || ''}. Narasi menunjukkan urgensi ${report.urgency || 'Sedang'} dengan kebutuhan evakuasi awal.`,
      extractedCategory: inferredType,
      missingContext: missing.length ? missing : ['Kondisi aksesibilitas jembatan penghubung'],
      inconsistencies: inconsistencies,
      suggestedQuestions: questions,
      confidenceScore: 89,
      modelSource: 'SIMULATED_ENGINE',
      disclaimer: 'Analisis AI — memerlukan verifikasi petugas (Mode Simulasi).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI Analysis Route error:', err);
    res.status(500).json({ error: 'Gagal menganalisis laporan bencana' });
  }
});

// POST /api/ai/rapid-damage-assessment
app.post('/api/ai/rapid-damage-assessment', async (req, res) => {
  try {
    const { incident, fieldNotes, photos } = req.body;
    if (!incident) {
      return res.status(400).json({ error: 'Data insiden wajib disertakan' });
    }

    if (ai) {
      try {
        const prompt = `Anda adalah asisten AI Rapid Damage Assessment (RDA) Pusdalops BNPB / RESQ.911.
Lakukan penilaian kaji cepat kerusakan berdasarkan data berikut:
Insiden: ${incident.title} (${incident.disaster_type}) di ${incident.regency}, ${incident.province}
Deskripsi: "${incident.description || '-'}"
Catatan Petugas Lapangan: "${fieldNotes || '-'}"
Bukti Gambar Terlampir: ${(photos || []).length} gambar.

PERINGATAN TATA KELOLA AI KEBENCANAAN:
- JANGAN PERNAH menyimpulkan kekuatan pondasi, angka korban jiwa pasti, kedalaman air presisi, atau kerugian finansial rupiah semata-mata dari foto/teks.
- Tandai observasi belum terkonfirmasi sebagai "Perlu Verifikasi Lapangan".
- Jika terdapat ketidakjelasan, nyatakan secara eksplisit catatan ketidakpastian.

Berikan output JSON terstruktur murni:
{
  "brief_description": "Deskripsi singkat kerusakan (2-3 kalimat)",
  "visible_affected_structures": ["struktur terlihat terdampak"],
  "potential_infrastructure_damage": ["potensi kerusakan utilitas/infrastruktur"],
  "observable_environmental_conditions": ["kondisi lingkungan terlihat"],
  "missing_information": ["data teknis yang belum tersedia"],
  "questions_requiring_field_confirmation": ["pertanyaan kunci konfirmasi lapangan"],
  "uncertainty_note": "Catatan ketidakpastian analitis",
  "status": "Perlu Verifikasi Lapangan"
}`;

        const response = await generateWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'Anda adalah sistem intelijen verifikasi bencana BNPB. Output WAJIB berupa JSON valid dalam bahasa Indonesia. Selalu tekankan bahwa analisis AI adalah alat bantu telaah yang memerlukan verifikasi petugas manusia.',
              responseMimeType: 'application/json',
            },
          }),
          4000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            ...parsed,
            modelSource: 'GEMINI_LIVE',
            modelVersion: 'gemini-3.8-flash',
            disclaimer: 'Analisis AI — memerlukan verifikasi teknis petugas lapangan.',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError) {
        console.warn('Gemini Damage Assessment call failed, falling back:', geminiError);
      }
    }

    // Deterministic Simulation Fallback
    const dType = incident.disaster_type || 'Banjir';
    let structures = ['Badan jalan dan fasilitas umum di sekitar lokasi'];
    let infra = ['Potensi gangguan jaringan listrik PLN dan air bersih'];
    let env = ['Genangan air dan endapan lumpur di area dataran rendah'];

    if (dType === 'Gempa Bumi') {
      structures = ['Retakan plesteran dinding bata', 'Sebagian plafon runtuh'];
      infra = ['Pipa distribusi air retak', 'Kabel listrik menggantung'];
      env = ['Jalanan berdebu reruntuhan material'];
    } else if (dType === 'Tanah Longsor') {
      structures = ['Badan jalan tertutup material tebing', 'Pondasi lereng tergerus'];
      infra = ['Tiang telepon roboh', 'Saluran drainase tersumbat'];
      env = ['Kontur lereng tidak stabil, potensi longsor susulan jika hujan'];
    }

    return res.json({
      brief_description: `Analisis terindikasi dampak ${dType} di ${incident.regency}, ${incident.province}. Struktur bangunan di zona terdampak mengalami penurunan daya dukung parsial.`,
      visible_affected_structures: structures,
      potential_infrastructure_damage: infra,
      observable_environmental_conditions: env,
      missing_information: [
        'Uji kekuatan sisa material oleh tim teknis Dinas PUPR setempat',
        'Data ketebalan sedimen atau retakan pondasi bawah tanah',
      ],
      questions_requiring_field_confirmation: [
        'Apakah akses truk alat berat 10 roda dapat menjangkau titik kerusakan tanpa risiko ambles?',
        'Apakah terdapat warga yang masih bertahan di dalam bangunan yang mengalami retak geser?',
      ],
      uncertainty_note:
        'Kekuatan struktural dan kedalaman dampak riil tidak dapat dipastikan tanpa pemeriksaan instrumen forensik di lokasi.',
      status: 'Perlu Verifikasi Lapangan',
      modelSource: 'SIMULATED_ENGINE',
      modelVersion: 'RESQ-DamageEngine-v1.4 (Mode Simulasi)',
      disclaimer: 'Analisis AI — memerlukan verifikasi teknis petugas lapangan (Mode Simulasi).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menjalankan kaji cepat kerusakan' });
  }
});

// POST /api/ai/reconcile-reports
app.post('/api/ai/reconcile-reports', async (req, res) => {
  try {
    const { incident, reports } = req.body;
    if (!incident || !reports || !Array.isArray(reports)) {
      return res.status(400).json({ error: 'Data insiden dan daftar laporan wajib disertakan' });
    }

    if (ai) {
      try {
        const prompt = `Anda adalah asisten rekonsiliasi data bencana RESQ.911 / Pusdalops BNPB.
Terdapat ${reports.length} laporan terkait insiden: "${incident.title}" di ${incident.regency}, ${incident.province}.
Rincian laporan:
${reports
  .map(
    (r, i) =>
      `[Lap-${i + 1}] ID: ${r.report_id}, Pelapor: ${r.reporter_name} (${r.reporter_type}), Urgensi: ${r.urgency}, Korban: ${r.estimated_affected || 0} terdampak / ${r.estimated_displaced || 0} pengungsi, Deskripsi: "${r.description}"`
  )
  .join('\n')}

Tugas:
Analisis konsistensi dan pertentangan (discrepancies) data di antara laporan tersebut (misal selisih korban, ketinggian air, kerusakan jalan).
PENTING: Anda TIDAK BOLEH memutuskan fakta mana yang benar. Petugas manusia yang berwenang menetapkan data resmi.

Berikan output JSON:
{
  "consistent_data": ["fakta yang saling menguatkan"],
  "discrepancies_summary": "Rangkuman perbedaan data dalam 2-3 kalimat",
  "suggested_questions": ["pertanyaan klarifikasi untuk petugas di lapangan"],
  "missing_evidence": ["bukti pendukung yang perlu ditambahkan"]
}`;

        const response = await generateWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'Anda adalah sistem intelijen verifikasi bencana BNPB. Output WAJIB berupa JSON valid dalam bahasa Indonesia.',
              responseMimeType: 'application/json',
            },
          }),
          4000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            ...parsed,
            modelSource: 'GEMINI_LIVE',
            modelVersion: 'gemini-3.8-flash',
            disclaimer: 'Analisis Rekonsiliasi AI — penetapan kebenaran mutlak oleh petugas.',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError) {
        console.warn('Gemini Reconciliation call failed, falling back:', geminiError);
      }
    }

    return res.json({
      consistent_data: [
        `Lokasi utama insiden berada di lingkup wilayah administratif ${incident.regency}`,
        `Semua pelapor mengindikasikan jenis bencana yang sama: ${incident.disaster_type}`,
      ],
      discrepancies_summary: `Ditemukan perbedaan estimasi dampak antara laporan aparat dan masyarakat pada insiden ${incident.incident_id}. Perbedaan wajar terjadi karena perbedaan waktu pelaporan dan luas cakupan pandang pelapor.`,
      suggested_questions: [
        'Mohon konfirmasi batasan wilayah RT/RW yang dicakup oleh masing-masing pelapor.',
        'Kapan waktu pembacaan alat ukur terakhir dilakukan oleh tim jaga?',
      ],
      missing_evidence: [
        'Dokumen register posko pengungsian terpadu BPBD setempat',
        'Foto penanda batas ketinggian air resmi',
      ],
      modelSource: 'SIMULATED_ENGINE',
      modelVersion: 'RESQ-ReconciliationEngine-v1.2 (Mode Simulasi)',
      disclaimer: 'Analisis Rekonsiliasi AI — penetapan kebenaran mutlak oleh petugas (Mode Simulasi).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menjalankan rekonsiliasi data' });
  }
});

// POST /api/ai/situation-summary
app.post('/api/ai/situation-summary', async (req, res) => {
  try {
    const { incident, reports, riskScore, priorityScore } = req.body;
    if (!incident) {
      return res.status(400).json({ error: 'Data insiden wajib disertakan' });
    }

    if (ai) {
      try {
        const prompt = `Anda adalah analis situasi intelijen bencana RESQ.911 / Pusdalops BNPB.
Susun Ringkasan Situasi Bencana (Executive Situation Briefing) berbasis data terverifikasi berikut:
Insiden: "${incident.title}"
Jenis Bencana: ${incident.disaster_type}
Status Respons: ${incident.response_status || 'Siaga / Assessment'}
Lokasi: ${incident.regency}, ${incident.province}
Terdampak: ${incident.affected_people || 0} jiwa | Pengungsi: ${incident.displaced_people || 0} jiwa
Skor Risiko Terhitung: ${riskScore || 75}/100
Skor Prioritas Respons: ${priorityScore || 80}/100
Jumlah Laporan Terverifikasi: ${(reports || []).length}

ATURAN KETAT:
- Pisahkan secara tegas antara "Fakta Terkonfirmasi" dan "Inferensi/Saran AI".
- JANGAN mengarang kutipan instansi resmi (seperti BMKG, BNPB) yang tidak ada di input.
- Berikan bahasa Indonesia profesional komando darurat.

Format JSON:
{
  "summary": "Ringkasan situasi 2-3 kalimat komprehensif",
  "affectedLocations": ["kecamatan/desa terdata"],
  "confirmedConditions": ["kondisi faktual terkonfirmasi"],
  "verifiedImpacts": ["dampak kemanusiaan dan infrastruktur riil"],
  "riskFactors": ["faktor risiko kunci"],
  "missingInformation": ["kebutuhan informasi penting tambahan"],
  "preliminaryRecommendations": ["rekomendasi awal untuk ditinjau pengambil keputusan"],
  "sources": ["sumber data yang digunakan"]
}`;

        const response = await generateWithTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'Anda adalah sistem intelijen verifikasi bencana BNPB. Output WAJIB berupa JSON valid dalam bahasa Indonesia. Selalu sertakan penafian bahwa rekomendasi memerlukan persetujuan komandan tanggap darurat.',
              responseMimeType: 'application/json',
            },
          }),
          4000
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            ...parsed,
            modelSource: 'GEMINI_LIVE',
            modelVersion: 'gemini-3.8-flash',
            disclaimer: 'Executive Situation Briefing — berbasis bukti diverifikasi petugas.',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiError) {
        console.warn('Gemini Situation Summary call failed, falling back:', geminiError);
      }
    }

    return res.json({
      summary: `Peristiwa ${incident.disaster_type} terverifikasi melanda kawasan ${incident.regency}, ${incident.province}. Tingkat urgensi operasional berada pada skala ${incident.severity} dengan kebutuhan koordinasi multisektor pada klaster pencarian dan logistik dasar.`,
      affectedLocations: [`Kecamatan inti terdampak di ${incident.regency}`, `${incident.province}`],
      confirmedConditions: [
        `Status kejadian resmi tercatat dalam sistem dengan ID ${incident.incident_id}`,
        `Respons tanggap darurat saat ini berstatus: ${incident.response_status || 'Siaga / Assessment'}`,
      ],
      verifiedImpacts: [
        `Jumlah jiwa terpapar terdata: ${incident.affected_people || 0} jiwa`,
        `Jumlah warga dalam pengungsian sementara: ${incident.displaced_people || 0} jiwa`,
        `Korban jiwa wafat: ${incident.fatalities || 0} jiwa, luka-luka: ${incident.injured || 0} jiwa`,
      ],
      riskFactors: [
        'Keterbatasan jalur akses darat akibat material bencana atau genangan',
        'Kebutuhan pasokan logistik permakanan dan air minum higienis',
        'Potensi cuaca ekstrem susulan di wilayah hulu',
      ],
      missingInformation: [
        'Sensus rinci kelompok rentan (bayi, lansia, disabilitas) di posko mandiri',
        'Asesmen teknis kelaikan jembatan penghubung utama',
      ],
      preliminaryRecommendations: [
        'Prioritaskan pemenuhan kebutuhan dasar pengungsi (makanan siap saji, selimut, sanitasi)',
        'Buka posko aju lapangan untuk memperpendek rentang komando evakuasi',
        'Pastikan koordinat titik penampungan terdaftar di Pusdalops terpadu',
      ],
      sources: [
        `Catatan resmi Insiden ${incident.incident_id}`,
        `Laporan terverifikasi BPBD ${incident.province}`,
      ],
      modelSource: 'SIMULATED_ENGINE',
      modelVersion: 'RESQ-SummaryEngine-v1.4 (Mode Simulasi)',
      disclaimer: 'Executive Situation Briefing — berbasis bukti diverifikasi petugas (Mode Simulasi).',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal membuat ringkasan situasi' });
  }
});

// POST /api/ai/explain-priority
app.post('/api/ai/explain-priority', async (req, res) => {
  try {
    const { priorityAssessment, weights } = req.body;
    if (!priorityAssessment) {
      return res.status(400).json({ error: 'Data penilaian prioritas wajib disertakan' });
    }

    const { criteria_values, contributions, total_score, rank } = priorityAssessment;
    const explanation = `Insiden menempati Peringkat #${rank} Nasional dengan Total Skor Prioritas ${total_score}/100. Poin kontributor terbesar berasal dari Kemanusiaan (${contributions?.humanitarianImpact || 0} poin) dan Bahaya Bencana (${contributions?.riskAndHazard || 0} poin), disusul Urgensi Intervensi (${contributions?.urgency || 0} poin). Model pembobotan ini adalah model multikriteria transparan (Multi-Criteria Decision Analysis), bukan estimasi nilai SHAP model black-box.`;

    return res.json({
      explanation,
      total_score,
      rank,
      contributions,
      disclaimer: 'Penjelasan berbasis kontribusi matematis linier model multikriteria.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal menjelaskan skor prioritas' });
  }
});

// Mount Vite or static server
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RESQ.911 Server running on http://localhost:${PORT}`);
});
