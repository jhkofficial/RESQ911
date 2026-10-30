import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  FileText,
  MapPin,
  Users,
  User,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Info,
  ShieldCheck,
  Send,
  Eye,
  Plus,
  Compass,
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { DisasterType, SeverityLevel, ReporterType, EvidenceItem } from '../../types/disaster';
import { validateIncidentReport } from '../../utils/validation';

export const IncidentReportingForm: React.FC = () => {
  const { currentUser, submitNewReport, setActiveTab, setActiveReport } = useDisaster();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formWarnings, setFormWarnings] = useState<string[]>([]);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Form State
  const [disasterType, setDisasterType] = useState<DisasterType>('Banjir');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<SeverityLevel>('Sedang');

  // Step 2: Location
  const [province, setProvince] = useState('Jawa Barat');
  const [regency, setRegency] = useState('Cianjur');
  const [subdistrict, setSubdistrict] = useState('Cugenang');
  const [village, setVillage] = useState('Cibulakan');
  const [addressDetail, setAddressDetail] = useState('');
  const [latitude, setLatitude] = useState<number>(-6.8122);
  const [longitude, setLongitude] = useState<number>(107.0892);

  // Step 3: Impacts
  const [estimatedAffected, setEstimatedAffected] = useState<number>(1200);
  const [estimatedDisplaced, setEstimatedDisplaced] = useState<number>(250);
  const [estimatedInjured, setEstimatedInjured] = useState<number>(4);
  const [estimatedFatalities, setEstimatedFatalities] = useState<number>(0);
  const [infrastructureDamage, setInfrastructureDamage] = useState('Akses jalan desa terendam 80 cm, jembatan gantung rusak ringan');
  const [urgentNeeds, setUrgentNeeds] = useState<string[]>([
    'Perahu Karet Mesin',
    'Tenda Darurat',
    'Makanan Siap Saji',
    'Air Bersih Galon',
  ]);
  const [customNeedInput, setCustomNeedInput] = useState('');

  // Step 4: Reporter Info
  const [reporterName, setReporterName] = useState(() => currentUser.name);
  const [reporterType, setReporterType] = useState<ReporterType>('PETUGAS_LAPANGAN');
  const [reporterAgency, setReporterAgency] = useState(() => currentUser.agency);
  const [reporterContact, setReporterContact] = useState('0812-3456-xxxx');

  // Step 5: Evidence
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [fieldNotes, setFieldNotes] = useState('');

  // Leaflet map container ref for picker
  const pickerMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Common needs pool for rapid selection
  const COMMON_NEEDS = [
    'Perahu Karet Mesin',
    'Tenda Darurat',
    'Dapur Umum Lapangan',
    'Makanan Siap Saji',
    'Air Bersih Galon',
    'Selimut & Matras',
    'Obat-Obatan & Vitamin',
    'Genset Penerangan',
    'Popok Bayi & Pembalut',
    'Alat Berat Excavator',
  ];

  // Draft autosave to localStorage
  useEffect(() => {
    const draftKey = 'resq911_report_draft_v2';
    const draft = {
      disasterType,
      title,
      eventDate,
      eventTime,
      description,
      urgency,
      province,
      regency,
      subdistrict,
      village,
      addressDetail,
      latitude,
      longitude,
      estimatedAffected,
      estimatedDisplaced,
      estimatedInjured,
      estimatedFatalities,
      infrastructureDamage,
      urgentNeeds,
      reporterName,
      reporterType,
      reporterAgency,
      reporterContact,
      fieldNotes,
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch (e) {
      // ignore
    }
  }, [
    disasterType,
    title,
    eventDate,
    eventTime,
    description,
    urgency,
    province,
    regency,
    subdistrict,
    village,
    addressDetail,
    latitude,
    longitude,
    estimatedAffected,
    estimatedDisplaced,
    estimatedInjured,
    estimatedFatalities,
    infrastructureDamage,
    urgentNeeds,
    reporterName,
    reporterType,
    reporterAgency,
    reporterContact,
    fieldNotes,
  ]);

  // Load draft on mount if available
  useEffect(() => {
    const saved = localStorage.getItem('resq911_report_draft_v2');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.disasterType) setDisasterType(d.disasterType);
        if (d.description) setDescription(d.description);
        if (d.province) setProvince(d.province);
        if (d.regency) setRegency(d.regency);
        if (d.subdistrict) setSubdistrict(d.subdistrict);
        if (d.village) setVillage(d.village);
        if (d.latitude) setLatitude(d.latitude);
        if (d.longitude) setLongitude(d.longitude);
        if (d.infrastructureDamage) setInfrastructureDamage(d.infrastructureDamage);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Initialize interactive map picker when entering Step 2
  useEffect(() => {
    if (currentStep !== 2) return;

    const timer = setTimeout(() => {
      if (!pickerMapRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(pickerMapRef.current, {
          center: [latitude, longitude],
          zoom: 12,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB &copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);

        const customPin = L.divIcon({
          className: 'picker-marker',
          html: `<div style="width: 24px; height: 24px; background: #00c8f8; border: 3px solid #071426; border-radius: 50%; box-shadow: 0 0 12px #00c8f8;"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([latitude, longitude], {
          icon: customPin,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          setLatitude(Number(latlng.lat.toFixed(4)));
          setLongitude(Number(latlng.lng.toFixed(4)));
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setLatitude(Number(e.latlng.lat.toFixed(4)));
          setLongitude(Number(e.latlng.lng.toFixed(4)));
        });

        markerRef.current = marker;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([latitude, longitude]);
        markerRef.current?.setLatLng([latitude, longitude]);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStep, latitude, longitude]);

  // Step Validation Check
  const validateCurrentStep = (step: number): boolean => {
    const currentPayload = {
      disaster_type: disasterType,
      title,
      event_date: eventDate,
      event_time: eventTime,
      description,
      urgency,
      province,
      regency,
      subdistrict,
      village,
      latitude,
      longitude,
      estimated_affected: estimatedAffected,
      estimated_displaced: estimatedDisplaced,
      estimated_injured: estimatedInjured,
      estimated_fatalities: estimatedFatalities,
      reporter_name: reporterName,
      reporter_type: reporterType,
    };

    const res = validateIncidentReport(currentPayload);
    setFormErrors(res.errors);
    setFormWarnings(res.warnings);

    if (step === 1) {
      return !res.errors.disaster_type && !res.errors.title && !res.errors.event_date && !res.errors.event_time && !res.errors.description && !res.errors.urgency;
    }
    if (step === 2) {
      return !res.errors.province && !res.errors.regency && !res.errors.subdistrict && !res.errors.village && !res.errors.latitude && !res.errors.longitude;
    }
    if (step === 3) {
      return !res.errors.estimated_affected && !res.errors.estimated_displaced && !res.errors.estimated_injured && !res.errors.estimated_fatalities;
    }
    if (step === 4) {
      return !res.errors.reporter_name && !res.errors.reporter_type;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      setFormErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddCustomNeed = () => {
    if (customNeedInput.trim() && !urgentNeeds.includes(customNeedInput.trim())) {
      setUrgentNeeds([...urgentNeeds, customNeedInput.trim()]);
      setCustomNeedInput('');
    }
  };

  const toggleNeed = (need: string) => {
    if (urgentNeeds.includes(need)) {
      setUrgentNeeds(urgentNeeds.filter((n) => n !== need));
    } else {
      setUrgentNeeds([...urgentNeeds, need]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newEvidence: EvidenceItem[] = [];
    Array.from(files).forEach((file, idx) => {
      newEvidence.push({
        id: `ev-upload-${Date.now()}-${idx}`,
        report_id: 'DRAFT',
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        url: URL.createObjectURL(file),
        uploaded_at: new Date().toISOString(),
        caption: `Bukti lapangan ${file.name}`,
      });
    });

    setEvidenceList((prev) => [...prev, ...newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((ev) => ev.id !== id));
  };

  const handleFinalSubmit = () => {
    const finalPayload = {
      disaster_type: disasterType,
      title: title.trim(),
      event_date: eventDate,
      event_time: eventTime,
      description: description.trim(),
      urgency,
      province: province.trim(),
      regency: regency.trim(),
      subdistrict: subdistrict.trim(),
      village: village.trim(),
      address_detail: addressDetail.trim() || `Kawasan ${subdistrict}, ${regency}`,
      latitude: Number(latitude),
      longitude: Number(longitude),
      estimated_affected: Number(estimatedAffected) || 0,
      estimated_displaced: Number(estimatedDisplaced) || 0,
      estimated_injured: Number(estimatedInjured) || 0,
      estimated_fatalities: Number(estimatedFatalities) || 0,
      infrastructure_damage: infrastructureDamage.trim() || 'Sedang dalam asesmen fisik lapangan',
      urgent_needs: urgentNeeds,
      reporter_name: reporterName.trim(),
      reporter_type: reporterType,
      reporter_agency: reporterAgency.trim() || 'Independen / Relawan',
      reporter_contact: reporterContact.trim(),
      evidence: evidenceList,
      field_notes: fieldNotes.trim(),
    };

    const res = submitNewReport(finalPayload);
    if (res.success && res.report) {
      setSubmittedReportId(res.report.report_id);
      setShowConfirmModal(false);
      localStorage.removeItem('resq911_report_draft_v2');
    } else {
      alert(`Gagal menyimpan laporan: ${res.error}`);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Informasi Kejadian', icon: FileText },
    { num: 2, label: 'Lokasi & Koordinat', icon: MapPin },
    { num: 3, label: 'Dampak Awal', icon: Users },
    { num: 4, label: 'Informasi Pelapor', icon: User },
    { num: 5, label: 'Bukti Pendukung', icon: Camera },
    { num: 6, label: 'Review & Submit', icon: CheckCircle2 },
  ];

  // Success view
  if (submittedReportId) {
    return (
      <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-mono-numbers text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">
            LAPORAN BERHASIL TERCATAT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {submittedReportId}
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
            Laporan Anda telah berhasil divalidasi secara deterministik dan masuk ke dalam{' '}
            <strong className="text-white">Kotak Masuk Laporan</strong> dengan status{' '}
            <span className="text-amber-400 font-semibold">Belum Diverifikasi</span>.
          </p>
        </div>

        <div className="bg-[#071426] p-3.5 rounded-xl border border-[#12365C] text-xs text-slate-400 max-w-md mx-auto text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Jenis Bencana:</span>
            <strong className="text-slate-200">{disasterType}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Lokasi:</span>
            <strong className="text-slate-200">{village}, {regency}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Pemeriksaan Duplikasi:</span>
            <span className="text-emerald-400">Model Spasial-Temporal Selesai</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            onClick={() => setActiveTab('report-inbox')}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Buka Kotak Masuk Laporan
          </button>
          <button
            onClick={() => setActiveTab('verification-center')}
            className="w-full sm:w-auto px-4 py-2 bg-[#071426] hover:bg-[#12365C] text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Buka Pusat Verifikasi
          </button>
          <button
            onClick={() => {
              setSubmittedReportId(null);
              setCurrentStep(1);
              setTitle('');
              setDescription('');
            }}
            className="w-full sm:w-auto px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
          >
            Input Laporan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-wider">
              Formulir 6-Tahap Multi-Step
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              Autosave Draft: Aktif
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-1">
            Pelaporan Kejadian Bencana Baru (Incident Reporting)
          </h1>
          <p className="text-xs text-slate-400">
            Formulir terstandarisasi untuk pencatatan laporan darurat lapangan sebelum verifikasi otoritas
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Bersihkan draf laporan saat ini?')) {
              localStorage.removeItem('resq911_report_draft_v2');
              setTitle('');
              setDescription('');
            }
          }}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Draf</span>
        </button>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-xl p-3 shadow-md overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {stepsHeader.map((s, idx) => {
            const Icon = s.icon;
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => {
                    if (s.num < currentStep || validateCurrentStep(currentStep)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,200,248,0.4)]'
                      : isDone
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-slate-950 text-cyan-400'
                        : isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-[#071426] text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
                {idx < stepsHeader.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 min-w-[16px] transition-colors ${
                      isDone ? 'bg-emerald-500/60' : 'bg-[#12365C]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Field Errors / Warnings Banner */}
      {Object.keys(formErrors).length > 0 && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Perbaiki kesalahan input berikut sebelum melanjutkan:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
              {Object.values(formErrors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        {/* STEP 1: INFORMASI KEJADIAN */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Langkah 1: Identifikasi &amp; Kronologi Kejadian
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jenis Bencana *
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 cursor-pointer"
                >
                  <option value="Banjir">Banjir</option>
                  <option value="Gempa Bumi">Gempa Bumi</option>
                  <option value="Tanah Longsor">Tanah Longsor</option>
                  <option value="Erupsi Gunung Api">Erupsi Gunung Api</option>
                  <option value="Kebakaran Hutan & Lahan">Kebakaran Hutan & Lahan</option>
                  <option value="Cuaca Ekstrem">Cuaca Ekstrem</option>
                  <option value="Tsunami">Tsunami</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tingkat Urgensi yang Dilaporkan *
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as SeverityLevel)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 cursor-pointer"
                >
                  <option value="Kritis">Kritis — Korban Jiwa / Bahaya Langsung</option>
                  <option value="Tinggi">Tinggi — Kerusakan Meluas / Warga Terisolir</option>
                  <option value="Sedang">Sedang — Genangan / Kerusakan Parsial</option>
                  <option value="Rendah">Rendah — Skala Kecil / Terkendali</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Judul Ringkas Laporan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Tanggul Jebol Sungai Wulan Merendam Karanganyar Demak"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tanggal Kejadian *
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Waktu / Jam Kejadian *
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Deskripsi Kronologi Kejadian *
              </label>
              <textarea
                rows={4}
                placeholder="Jelaskan secara runtut bagaimana peristiwa bermula, kondisi hujan/cuaca, ketinggian air atau sebaran retakan, dampak ke warga sekitar, serta tindakan darurat awal yang telah dilakukan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 2: LOKASI & INTERACTIVE MAP PICKER */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Langkah 2: Lokasi Geografis &amp; Pemilihan Titik Koordinat
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Provinsi *</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kabupaten/Kota *</label>
                <input
                  type="text"
                  value={regency}
                  onChange={(e) => setRegency(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kecamatan *</label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={(e) => setSubdistrict(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kelurahan / Desa *</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Alamat Spesifik / Keterangan Patokan Lokasi
              </label>
              <input
                type="text"
                placeholder="Contoh: Depan Kantor Balai Desa, RT 03 RW 02 dekat jembatan gantung"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2"
              />
            </div>

            {/* Coordinates and Leaflet Map Location Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Pilih Titik di Peta (Klik atau Geser Pin)
                </span>
                <span className="text-[11px] text-cyan-300 font-mono-numbers">
                  Lat: {latitude} | Lng: {longitude}
                </span>
              </div>

              <div
                ref={pickerMapRef}
                className="w-full h-64 rounded-xl border border-[#12365C] overflow-hidden shadow-inner z-0"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">Latitude (Lintang)</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">Longitude (Bujur)</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2 font-mono-numbers"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DAMPAK AWAL */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Langkah 3: Estimasi Dampak Awal Lapangan
              </h2>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Metodologi:</strong> Angka ini merupakan estimasi awal laporan sumber,{' '}
                <em>bukan statistik resmi terverifikasi</em>. Angka resmi akan ditetapkan setelah proses kaji cepat (Rapid Damage Assessment) posko.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Estimasi Terdampak (Jiwa)
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedAffected}
                  onChange={(e) => setEstimatedAffected(Number(e.target.value))}
                  className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Estimasi Pengungsi (Jiwa)
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedDisplaced}
                  onChange={(e) => setEstimatedDisplaced(Number(e.target.value))}
                  className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Korban Luka
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedInjured}
                  onChange={(e) => setEstimatedInjured(Number(e.target.value))}
                  className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Korban Meninggal
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedFatalities}
                  onChange={(e) => setEstimatedFatalities(Number(e.target.value))}
                  className="w-full bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kondisi Fisik / Kerusakan Infrastruktur
              </label>
              <textarea
                rows={2}
                placeholder="Rincian kerusakan jembatan, tanggul, sekolah, gardu listrik, sarana ibadah, atau jalan terputus..."
                value={infrastructureDamage}
                onChange={(e) => setInfrastructureDamage(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Kebutuhan Bantuan Mendesak
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_NEEDS.map((need) => {
                  const isSelected = urgentNeeds.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => toggleNeed(need)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                          : 'bg-[#071426] text-slate-400 border-[#12365C] hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {need}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tambah kebutuhan spesifik lainnya..."
                  value={customNeedInput}
                  onChange={(e) => setCustomNeedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomNeed();
                    }
                  }}
                  className="flex-1 bg-[#071426] border border-[#12365C] text-xs text-slate-200 rounded-lg p-2"
                />
                <button
                  type="button"
                  onClick={handleAddCustomNeed}
                  className="bg-[#12365C] hover:bg-cyan-500 hover:text-slate-950 text-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: INFORMASI PELAPOR */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Langkah 4: Identitas &amp; Afiliasi Pelapor
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Lengkap Pelapor *
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kategori Pelapor *
                </label>
                <select
                  value={reporterType}
                  onChange={(e) => setReporterType(e.target.value as ReporterType)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 cursor-pointer"
                >
                  <option value="PETUGAS_LAPANGAN">Petugas Lapangan / TRC BNPB-BPBD</option>
                  <option value="APARAT_DESA">Aparat Desa / Babinsa / Bhabinkamtibmas</option>
                  <option value="RELAWAN">Relawan Organisasi (PMI / Tagana / RAPI)</option>
                  <option value="MASYARAKAT">Masyarakat Umum / Saksi Mata</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Instansi / Organisasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BPBD Kab. Cianjur / Babinsa Koramil 02"
                  value={reporterAgency}
                  onChange={(e) => setReporterAgency(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Kontak / Saluran Komunikasi (Privat)
                </label>
                <input
                  type="text"
                  placeholder="Nomor Telepon atau Frekuensi Radio VHF"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5 font-mono-numbers"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  🛡️ Aman: Nomor kontak pelapor hanya dapat diakses oleh petugas verifikator resmi.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: BUKTI PENDUKUNG */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Langkah 5: Dokumentasi Foto Lapangan &amp; Bukti Pendukung
              </h2>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-[#12365C] hover:border-cyan-400/50 rounded-2xl p-6 text-center transition-colors bg-[#071426]/50">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white">Unggah Dokumentasi Foto atau Dokumen</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Format didukung: JPG, PNG, WebP, PDF (Maksimal 10 MB per file)
              </p>

              <label className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md">
                <span>Pilih Berkas dari Perangkat</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Previews */}
            {evidenceList.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Lampiran Berkas Terunggah ({evidenceList.length}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-[#071426] border border-[#12365C] rounded-xl overflow-hidden p-2 relative group"
                    >
                      <img
                        src={ev.url}
                        alt={ev.file_name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="text-[10px] text-slate-300 truncate mt-1.5 font-medium">
                        {ev.file_name}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono-numbers">
                        {(ev.file_size / 1024).toFixed(0)} KB
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(ev.id)}
                        className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white p-1 rounded-md transition-colors cursor-pointer"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Catatan Lapangan Tambahan (Field Notes)
              </label>
              <textarea
                rows={3}
                placeholder="Catatan tambahan seperti kontak saksi lain, cuaca setempat, atau indikator potensi bahaya susulan..."
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                className="w-full bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-xs text-slate-200 rounded-lg p-2.5"
              />
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & SUBMIT */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-[#12365C] pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Langkah 6: Tinjauan Lengkap &amp; Pengajuan Laporan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Summary Card 1 */}
              <div className="bg-[#071426] border border-[#12365C] rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Informasi Bencana &amp; Kronologi
                </span>
                <div className="text-sm font-bold text-white">{title || '(Judul belum diisi)'}</div>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="bg-[#0a1c33] px-2 py-0.5 rounded border border-[#12365C]">
                    {disasterType}
                  </span>
                  <span className="text-amber-400 font-semibold">Urgensi: {urgency}</span>
                  <span className="font-mono-numbers text-slate-400">
                    {eventDate} {eventTime}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-[#12365C]/80 line-clamp-3">
                  {description}
                </p>
              </div>

              {/* Summary Card 2 */}
              <div className="bg-[#071426] border border-[#12365C] rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Wilayah &amp; Titik Lokasi
                </span>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {village}, {subdistrict}, {regency}, {province}
                </div>
                <div className="text-[11px] text-slate-400">{addressDetail || 'Alamat patokan umum'}</div>
                <div className="text-xs text-cyan-300 font-mono-numbers">
                  Koordinat: {latitude}°, {longitude}°
                </div>
              </div>

              {/* Summary Card 3 */}
              <div className="bg-[#071426] border border-[#12365C] rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Estimasi Awal Dampak
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Terdampak:</span>
                    <strong className="text-white block font-mono-numbers">{estimatedAffected} jiwa</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Pengungsi:</span>
                    <strong className="text-amber-400 block font-mono-numbers">{estimatedDisplaced} jiwa</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Korban Jiwa:</span>
                    <strong className="text-rose-400 block font-mono-numbers">
                      {estimatedFatalities} wafat / {estimatedInjured} luka
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Lampiran Bukti:</span>
                    <strong className="text-emerald-400 block font-mono-numbers">
                      {evidenceList.length} berkas
                    </strong>
                  </div>
                </div>
              </div>

              {/* Summary Card 4 */}
              <div className="bg-[#071426] border border-[#12365C] rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Pelapor &amp; Kebutuhan
                </span>
                <div className="text-xs text-white">
                  <strong>{reporterName}</strong> ({reporterType.replace('_', ' ')})
                </div>
                <div className="text-[11px] text-slate-400">{reporterAgency}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {urgentNeeds.map((need, i) => (
                    <span key={i} className="text-[10px] bg-[#0a1c33] border border-[#12365C] px-1.5 py-0.5 rounded text-slate-300">
                      • {need}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#071426] border border-cyan-500/30 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Pemeriksaan Sistem Sebelum Submit:</span>
                <span className="text-slate-400">
                  Laporan akan divalidasi, diperiksa kemiripan dengan laporan terdaftar, dan diteruskan ke{' '}
                  <strong className="text-slate-200">Pusat Verifikasi</strong>. Laporan ini tidak akan langsung ditetapkan sebagai insiden resmi tanpa tinjauan petugas.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#12365C]">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#071426] hover:bg-[#12365C] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirimkan Laporan Kejadian</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a1c33] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Konfirmasi Pengajuan Laporan
                </h3>
                <p className="text-xs text-slate-400">Pusdalops Verification Gateway</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin data laporan untuk <strong>{title}</strong> di wilayah{' '}
              <strong>{village}, {regency}</strong> sudah sesuai? Laporan akan diberi ID resmi dan diajukan ke antrean verifikasi.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#12365C]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Ya, Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
