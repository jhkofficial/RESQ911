import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export const SimulatedBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-3 right-3 z-50 flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md transition-all cursor-pointer"
        title="Klik untuk membuka informasi status simulasi"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>DATA SIMULASI</span>
      </button>
    );
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-950/80 via-slate-900/95 to-amber-950/80 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase text-amber-400 shrink-0 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            DATA SIMULASI — BUKAN INFORMASI DARURAT RESMI
          </span>
          <span className="hidden md:inline-block text-amber-200/70 border-l border-amber-500/30 pl-2.5 truncate">
            Prototipe Intelijen Bencana &amp; Komando Terpadu BNPB-BPBD. Seluruh koordinasi lapangan dan dispatch logistik memerlukan otorisasi resmi komandan posko.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            <span>Human-in-the-Loop Enforced</span>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-300/60 hover:text-amber-200 p-0.5 rounded transition-colors"
            title="Sembunyikan banner ke sudut kanan bawah"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
