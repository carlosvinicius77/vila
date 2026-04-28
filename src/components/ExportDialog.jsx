import { X, FileText, FileSpreadsheet, Printer } from "lucide-react";

export function ExportDialog({ isOpen, onClose, onExportVR, onExportExcel, onExportPrint }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm print:hidden animate-in fade-in duration-200">
      <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-5 text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-full p-1"
        >
           <X size={24} />
        </button>
        
        <h2 className="text-xl font-black text-slate-100 mb-6 uppercase tracking-wide">
          Menu de Exportação
        </h2>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { onExportVR(); onClose(); }}
            className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-blue-500 hover:bg-zinc-800/50 p-4 rounded-2xl transition-all text-left group"
          >
            <div className="bg-blue-600/20 p-3 rounded-xl group-hover:bg-blue-600/30 text-blue-500">
              <FileText size={28} />
            </div>
            <div>
              <div className="font-bold text-slate-200">Exportar p/ VR Software</div>
              <div className="text-xs text-zinc-500 mt-0.5">TXT formatado com (;) e (.)</div>
            </div>
          </button>

          <button 
            onClick={() => { onExportExcel(); onClose(); }}
            className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 hover:bg-zinc-800/50 p-4 rounded-2xl transition-all text-left group"
          >
            <div className="bg-emerald-600/20 p-3 rounded-xl group-hover:bg-emerald-600/30 text-emerald-500">
              <FileSpreadsheet size={28} />
            </div>
            <div>
              <div className="font-bold text-slate-200">Exportar Planilha Excel</div>
              <div className="text-xs text-zinc-500 mt-0.5">Arquivo .xlsx com tabelas completas</div>
            </div>
          </button>

          <button 
            onClick={() => { onExportPrint(); onClose(); }}
            className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-slate-400 hover:bg-zinc-800/50 p-4 rounded-2xl transition-all text-left group"
          >
            <div className="bg-slate-600/20 p-3 rounded-xl group-hover:bg-slate-600/30 text-slate-400">
              <Printer size={28} />
            </div>
            <div>
              <div className="font-bold text-slate-200">Imprimir / Salvar PDF</div>
              <div className="text-xs text-zinc-500 mt-0.5">Layout formatado para folhas A4</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
