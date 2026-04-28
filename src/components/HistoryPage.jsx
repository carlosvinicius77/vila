import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Trash2, FileText, FileSpreadsheet, Printer, CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { exportarVR, exportarExcel } from "../utils/exportTools";

export function HistoryPage({ history, onDeleteRecord, setPrintingRecord }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredHistory = history.filter(record => 
    record.date.includes(searchQuery) || 
    record.items.some(it => it.nome.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePrint = (record) => {
    setPrintingRecord(record);
    setTimeout(() => window.print(), 100);
  };

  const getDifferential = (currentWeight, previousRecord, itemId) => {
    if (!previousRecord) return null;
    const prevItem = previousRecord.items.find(it => it.id === itemId);
    const prevWeight = prevItem ? (prevItem.estoque_loja || 0) + (prevItem.estoque_camara || 0) : 0;
    
    const diff = currentWeight - prevWeight;
    if (Math.abs(diff) < 0.001) return { type: 'equal', val: 0 };
    return { type: diff > 0 ? 'up' : 'down', val: Math.abs(diff) };
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300 print:hidden">
      
      {/* Search Header */}
      <div className="relative mb-2">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-zinc-500" size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por data ou produto..."
          className="w-full bg-zinc-900 border border-zinc-800 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-zinc-500"
        />
      </div>

      {filteredHistory.length === 0 && (
         <div className="text-center py-20 text-zinc-500 flex flex-col items-center gap-4">
           <CalendarDays size={64} className="opacity-20" />
           <p className="text-xl font-medium">Nenhum histórico encontrado.</p>
         </div>
      )}

      {/* History List */}
      <div className="flex flex-col gap-4">
        {filteredHistory.map((record, index) => {
          const isExpanded = expandedId === record.date;
          // next historically older record is index + 1
          const previousRecord = history[history.indexOf(record) + 1]; 
          
          const validItems = record.items.filter(it => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0);
          const totalAccumulated = validItems.reduce((acc, it) => acc + (it.estoque_loja || 0) + (it.estoque_camara || 0), 0);

          return (
            <div key={record.date} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
              
              {/* Card Header (Toggle) */}
              <button 
                onClick={() => setExpandedId(isExpanded ? null : record.date)}
                className="w-full flex items-center justify-between p-5 hover:bg-zinc-800/80 transition-colors text-left"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-lg">
                    <CalendarDays size={20} />
                    <span>Balanço - {record.date.split(" ")[0]}</span>
                  </div>
                  <span className="text-sm text-zinc-500 font-medium">
                    {validItems.length} itens • Peso Total: <span className="text-slate-300 font-bold">{totalAccumulated.toFixed(3)}kg</span>
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-full border border-zinc-800">
                  {isExpanded ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-zinc-500" />}
                </div>
              </button>

              {/* Expansion Content */}
              {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-950/30 p-4 animate-in slide-in-from-top-2 duration-200">
                   
                   {/* Table / List Details */}
                   <div className="flex flex-col gap-2 mb-6">
                     <div className="hidden sm:grid grid-cols-12 gap-2 pb-2 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-4">Nome do Produto</div>
                        <div className="col-span-2 text-right">Loja</div>
                        <div className="col-span-2 text-right">Câmara</div>
                        <div className="col-span-2 text-right text-slate-300">Total</div>
                        <div className="col-span-1 text-center">Var.</div>
                     </div>

                     {validItems.map(item => {
                        const weight = (item.estoque_loja || 0) + (item.estoque_camara || 0);
                        const diff = getDifferential(weight, previousRecord, item.id);

                        return (
                          <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 sm:items-center gap-1 sm:gap-2 p-3 sm:p-2 bg-zinc-900 border border-zinc-800 sm:border-transparent sm:bg-transparent rounded-lg sm:rounded-none sm:border-b sm:border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center sm:hidden justify-between border-b border-zinc-800/50 pb-2 mb-2">
                               <span className="font-mono text-zinc-400 text-xs bg-zinc-950 px-2 py-1 rounded">#{item.id}</span>
                               <span className="font-bold text-slate-200">{item.nome}</span>
                            </div>

                            <div className="hidden sm:block col-span-1 font-mono text-zinc-500 text-xs">{item.id}</div>
                            <div className="hidden sm:block col-span-4 font-bold text-slate-300 truncate" title={item.nome}>{item.nome}</div>
                            
                            <div className="flex justify-between sm:block col-span-2 sm:text-right text-sm">
                               <span className="sm:hidden text-zinc-500">Loja:</span>
                               <span className="text-zinc-300">{(item.estoque_loja || 0).toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between sm:block col-span-2 sm:text-right text-sm">
                               <span className="sm:hidden text-zinc-500">Câmara:</span>
                               <span className="text-zinc-300">{(item.estoque_camara || 0).toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between sm:block col-span-2 sm:text-right text-base sm:text-sm font-bold text-slate-100 mt-1 sm:mt-0 pt-1 sm:pt-0 border-t border-zinc-800/50 sm:border-0">
                               <span className="sm:hidden text-zinc-400">Total:</span>
                               <span className="text-blue-400">{weight.toFixed(3)}</span>
                            </div>

                            <div className="col-span-1 flex justify-end sm:justify-center mt-1 sm:mt-0">
                                {diff && diff.type === 'up' && <div className="flex items-center text-emerald-500 text-xs font-bold gap-0.5" title={`+${diff.val.toFixed(3)}kg desde a última contagem`}><TrendingUp size={14}/> <span className="sm:hidden">+{diff.val.toFixed(3)}kg</span></div>}
                                {diff && diff.type === 'down' && <div className="flex items-center text-red-500 text-xs font-bold gap-0.5" title={`-${diff.val.toFixed(3)}kg desde a última contagem`}><TrendingDown size={14}/> <span className="sm:hidden">-{diff.val.toFixed(3)}kg</span></div>}
                                {diff && diff.type === 'equal' && <div className="flex items-center text-zinc-600 text-xs"><Minus size={14} /></div>}
                            </div>
                          </div>
                        )
                     })}
                     {validItems.length === 0 && (
                        <div className="text-center text-zinc-600 py-4 text-sm font-medium">Balanço vazio. Nenhum item contabilizado.</div>
                     )}
                   </div>

                   {/* Action Buttons for the week */}
                   <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <button onClick={() => exportarVR(record.items, record.date)} className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-blue-500 hover:bg-zinc-800 p-3 rounded-xl transition text-sm font-bold text-slate-300">
                         <FileText size={16} className="text-blue-500" /> Balanço (TXT)
                      </button>
                      <button onClick={() => exportarExcel(record.items, record.date)} className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-zinc-800 p-3 rounded-xl transition text-sm font-bold text-slate-300">
                         <FileSpreadsheet size={16} className="text-emerald-500" /> Excel
                      </button>
                      <button onClick={() => handlePrint(record)} className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-700 hover:border-slate-400 hover:bg-zinc-800 p-3 rounded-xl transition text-sm font-bold text-slate-300">
                         <Printer size={16} className="text-slate-400" /> PDF/Imprimir
                      </button>
                      <button onClick={() => {
                        if(window.confirm("Atenção! Esta ação é permanente. Deseja realmente excluir este balanço do histórico?")) {
                          onDeleteRecord(record.date);
                        }
                      }} className="flex items-center justify-center gap-2 bg-red-950/30 border border-red-900/50 hover:border-red-500 hover:bg-red-900/80 p-3 rounded-xl transition text-sm font-bold text-red-400">
                         <Trash2 size={16} /> Excluir
                      </button>
                   </div>

                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
