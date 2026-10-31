import React, { useState } from 'react';
import {
  MessageSquare,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Send,
  Radio,
  Users,
  Clock,
  Shield,
  Layers,
  Search,
  Filter,
  CheckSquare
} from 'lucide-react';
import { useDisaster } from '../../context/DisasterContext';
import { EscalationStatus } from '../../types/operations';

export const CoordinationEscalationModule: React.FC = () => {
  const {
    coordinationMessages,
    escalations,
    sendCoordinationMessage,
    resolveEscalation,
    currentUser
  } = useDisaster();

  // Active channel
  const [activeChannel, setActiveChannel] = useState<'Komando Nasional' | 'Sektor Lapangan' | 'Logistik & Armada' | 'Medis & SAR'>('Komando Nasional');
  const [messageInput, setMessageInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // Escalation resolution
  const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationFilter, setEscalationFilter] = useState<string>('all');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const channelMessages = coordinationMessages.filter((m) => m.channel === activeChannel);

  const filteredEscalations = escalations.filter((e) => {
    if (escalationFilter !== 'all' && e.status !== escalationFilter) return false;
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendCoordinationMessage(activeChannel, messageInput, isUrgent);
    setMessageInput('');
    setIsUrgent(false);
  };

  const handleResolveEscalation = (id: string) => {
    if (!resolutionNotes.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Catatan penyelesaian eskalasi wajib diisi.'
      });
      return;
    }

    const res = resolveEscalation(id, resolutionNotes);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: 'Eskalasi darurat telah berhasil diselesaikan dan statusnya diperbarui.'
      });
      setSelectedEscalationId(null);
      setResolutionNotes('');
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Gagal menyelesaikan eskalasi.'
      });
    }
  };

  const channels = [
    { id: 'Komando Nasional', label: 'Komando Nasional', desc: 'Instruksi strategis Pusdalops BNPB' },
    { id: 'Sektor Lapangan', label: 'Sektor Lapangan', desc: 'Komunikasi operasional Satgas TRC' },
    { id: 'Logistik & Armada', label: 'Logistik & Armada', desc: 'Konvoi & pergudangan bahan bantuan' },
    { id: 'Medis & SAR', label: 'Medis & SAR', desc: 'Triase darurat & evakuasi korban kritis' }
  ];

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>JARING KOORDINASI &amp; ESKALASI DARURAT:</strong> Kanal komunikasi internal terenkripsi antara Pusdalops Pusat, Operator Daerah BPBD, dan Tim TRC Lapangan.
          </span>
        </div>
        <span className="text-[10px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-500/30">
          OPERATOR: {currentUser.name} ({currentUser.nim})
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Koordinasi Taktis &amp; Manajemen Eskalasi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              REALTIME CHANNELS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pertukaran informasi cepat lintas satuan tugas dan penyelesaian kendala hambatan rute/logistik.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Main Grid: Left Coordination Chat, Right Escalation Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Coordination Channels & Chat */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 flex flex-col h-[600px] shadow-xl">
          <div className="border-b border-[#12365C] pb-3 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Kanal Komunikasi Taktis Inter-Agency:
            </span>

            {/* Channel Tabs */}
            <div className="grid grid-cols-2 gap-1.5">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id as any)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    activeChannel === ch.id
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow'
                      : 'bg-[#071426] border-[#12365C] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{ch.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{ch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
            {channelMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Belum ada pesan di kanal ini. Mulai percakapan koordinasi di bawah.
              </div>
            ) : (
              channelMessages.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    msg.is_urgent
                      ? 'bg-red-950/30 border-red-500/40 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'bg-[#071426] border-[#12365C] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{msg.sender_name}</span>
                      {msg.sender_nim && (
                        <span className="text-cyan-400 font-mono">({msg.sender_nim})</span>
                      )}
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {msg.sender_role}
                      </span>
                    </div>
                    <span className="text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed">{msg.content}</p>

                  {msg.is_urgent && (
                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 pt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Instruksi Mendesak / Prioritas Tinggi</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="border-t border-[#12365C] pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`Kirim pesan ke kanal #${activeChannel}...`}
                className="flex-1 bg-[#071426] border border-[#12365C] focus:border-cyan-400 text-white text-xs px-3 py-2 rounded-xl outline-none"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded accent-red-500 cursor-pointer"
                />
                <span className={isUrgent ? 'text-red-400 font-bold' : ''}>
                  Tandai sebagai Instruksi Mendesak (Urgent)
                </span>
              </label>
              <span className="text-[10px] text-slate-500">
                Pengirim: {currentUser.name}
              </span>
            </div>
          </form>
        </div>

        {/* Escalation Center */}
        <div className="bg-[#0a1c33] border border-[#12365C] rounded-2xl p-4 flex flex-col h-[600px] shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#12365C] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              Daftar Eskalasi Darurat Lapangan ({filteredEscalations.length})
            </span>

            <select
              value={escalationFilter}
              onChange={(e) => setEscalationFilter(e.target.value)}
              className="bg-[#071426] border border-[#12365C] text-slate-300 text-xs px-2.5 py-1 rounded-xl outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Open">Open</option>
              <option value="Action Required">Action Required</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Escalations List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredEscalations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Tidak ada eskalasi aktif saat ini.
              </div>
            ) : (
              filteredEscalations.map((esc) => {
                const isSelected = selectedEscalationId === esc.escalation_id;
                const isResolved = esc.status === 'Resolved';

                return (
                  <div
                    key={esc.escalation_id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      isResolved
                        ? 'bg-[#071426]/50 border-[#12365C] opacity-75'
                        : 'bg-[#071426] border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-red-400 font-bold text-[10px]">
                        {esc.escalation_id} • {esc.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        }`}
                      >
                        {esc.status}
                      </span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed">
                      {esc.description}
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-[#12365C]/60">
                      <span>Pelapor: <strong className="text-slate-300">{esc.raised_by}</strong></span>
                      <span>Misi: {esc.mission_id}</span>
                    </div>

                    {isResolved && esc.resolution_notes && (
                      <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-300">
                        <strong>Solusi Dijalankan:</strong> {esc.resolution_notes}
                      </div>
                    )}

                    {!isResolved && (
                      <div className="pt-2 border-t border-[#12365C]/60">
                        {isSelected ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              placeholder="Tuliskan tindakan penanganan eskalasi (misal: Rute dialihkan via Tol Pejagan, atau 2 LCR tambahan telah diberangkatkan)..."
                              className="w-full bg-[#0a1c33] border border-[#12365C] focus:border-cyan-400 text-white text-xs p-2 rounded-xl outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedEscalationId(null)}
                                className="bg-[#0a1c33] text-slate-300 px-2.5 py-1 rounded-lg text-xs"
                              >
                                Batal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveEscalation(esc.escalation_id)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs"
                              >
                                Simpan Solusi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedEscalationId(esc.escalation_id)}
                            className="bg-[#0a1c33] hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tindak Lanjuti &amp; Selesaikan</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
