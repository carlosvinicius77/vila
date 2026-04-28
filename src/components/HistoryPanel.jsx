import { useState } from "react";
import { ChevronDown, ChevronUp, History, Calendar } from "lucide-react";

export function HistoryPanel({ history }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!history || history.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg mb-6 w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800 p-2 rounded-lg">
            <History className="text-blue-400" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Histórico de Balanços</h3>
          <span className="bg-blue-900/40 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-800/50">
            {history.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="text-zinc-400" /> : <ChevronDown className="text-zinc-400" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex overflow-x-auto gap-4 custom-scrollbar">
          {history.map((record, idx) => (
            <div key={idx} className="min-w-[280px] bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-zinc-800 text-blue-400 font-semibold text-sm">
                <Calendar size={16} />
                <span>{record.date}</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {record.items.filter(it => (it.estoque_loja + it.estoque_camara) > 0).map(item => {
                   const total = (item.estoque_loja || 0) + (item.estoque_camara || 0);
                   return (
                     <div key={item.id} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 px-1 rounded transition-colors">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-zinc-500 w-6">{item.id}</span>
                         <span className="text-sm text-zinc-300 truncate max-w-[120px]" title={item.nome}>{item.nome}</span>
                       </div>
                       <span className="text-sm font-bold text-slate-200">{total.toFixed(3)}</span>
                     </div>
                   )
                })}
                {record.items.filter(it => (it.estoque_loja + it.estoque_camara) > 0).length === 0 && (
                   <div className="text-sm text-zinc-500 italic text-center py-6">Nenhum item pesou &gt; 0 nesta semana.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
