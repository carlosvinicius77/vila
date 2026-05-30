import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Trash2, FileText, FileSpreadsheet, Printer, CalendarDays } from "lucide-react";
import { exportarVR, exportarExcel } from "../utils/exportTools";
import { clsx } from "clsx";

const CATEGORIES = {
  Acougue: [
    { id: 'BOVINOS', label: 'Bovinos', emoji: '🥩' },
    { id: 'AVES',    label: 'Aves',    emoji: '🍗' },
    { id: 'SUINOS',  label: 'Suínos',  emoji: '🐖' },
    { id: 'TIPICOS', label: 'Típicos', emoji: '🌭' },
    { id: 'OUTROS',  label: 'Outros',  emoji: '🛒' },
  ],
  Frios: [
    { id: 'QUEIJOS',     label: 'Queijos',       emoji: '🧀' },
    { id: 'PRESUNTADOS', label: 'Presuntados',   emoji: '🥩' },
    { id: 'DEFUMADOS',   label: 'Defumados',     emoji: '🔥' },
    { id: 'LATICINIOS',  label: 'Laticínios',    emoji: '🥛' },
    { id: 'FATIADOS',    label: 'Fatiados',      emoji: '🫕' },
  ],
  Hortifruti: [
    { id: 'FOLHAS',  label: 'Folhagens', emoji: '🥬' },
    { id: 'FRUTAS',  label: 'Frutas',    emoji: '🍎' },
    { id: 'LEGUMES', label: 'Legumes',   emoji: '🥕' },
    { id: 'OVOS',    label: 'Ovos',      emoji: '🥚' },
    { id: 'CAIXAS',  label: 'Caixas',    emoji: '📦' },
  ],
};

const DEPT_COLOR = {
  Acougue:    { text: 'text-blue-400',    bg: 'bg-blue-600/10',   border: 'border-blue-500/30' },
  Frios:      { text: 'text-yellow-400',  bg: 'bg-yellow-600/10', border: 'border-yellow-500/30' },
  Hortifruti: { text: 'text-emerald-400', bg: 'bg-emerald-600/10',border: 'border-emerald-500/30' },
};

export function HistoryPage({ history, onDeleteRecord, setPrintingRecord }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredHistory = history.filter(record =>
    record.date.includes(searchQuery) ||
    (record.items || []).some(it => it.nome?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePrint = (record) => {
    setPrintingRecord(record);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 print:hidden">

      {/* Busca */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text" value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por data ou produto..."
          className="w-full bg-zinc-900 border border-zinc-800 text-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all placeholder:text-zinc-600"
        />
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-20 text-zinc-600 flex flex-col items-center gap-4">
          <CalendarDays size={56} className="opacity-20" />
          <p className="text-base font-medium">Nenhum balanço finalizado ainda.</p>
          <p className="text-xs text-zinc-700">Finalize um balanço pelo acesso rápido para aparecer aqui.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredHistory.map((record) => {
          const isExpanded = expandedId === record.date;
          const dept = record.dept || 'Acougue';
          const cats = CATEGORIES[dept] || CATEGORIES.Acougue;
          const deptColor = DEPT_COLOR[dept] || DEPT_COLOR.Acougue;
          const allItems = record.items || [];
          const pesados = allItems.filter(it => (it.estoque_loja||0)+(it.estoque_camara||0) > 0);
          const totalKg = pesados.reduce((a, it) => a + (it.estoque_loja||0) + (it.estoque_camara||0), 0);
          const isCozinha = record.origin === 'cozinha';

          return (
            <div key={record.date} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">

              {/* Header do card */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : record.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/60 transition-colors text-left"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CalendarDays size={16} className={deptColor.text} />
                    <span className="font-extrabold text-white text-base">
                      {isCozinha ? 'Cozinha' : 'Balanço'} — {record.date.split(' ')[0]}
                    </span>
                    <span className={clsx('text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                      isCozinha ? 'bg-amber-600/15 text-amber-400 border-amber-500/30' : `${deptColor.bg} ${deptColor.text} ${deptColor.border}`
                    )}>
                      {isCozinha ? '🍳 Cozinha' : '⚖️ Balanço'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{record.date.split(' ')[1]}</span>
                    {record.store && <span>· {record.store}</span>}
                    <span>· <span className={clsx('font-bold', deptColor.text)}>{pesados.length}</span>/{allItems.length} itens</span>
                    <span>· <span className="font-bold text-white">{totalKg.toFixed(3)} kg</span></span>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {isExpanded
                    ? <ChevronUp size={18} className={deptColor.text} />
                    : <ChevronDown size={18} className="text-zinc-500" />
                  }
                </div>
              </button>

              {/* Conteúdo expandido — por categoria */}
              {isExpanded && (
                <div className="border-t border-zinc-800 bg-zinc-950/40">

                  {cats.map(cat => {
                    const catItems = allItems.filter(it => (it.categoria || '').toUpperCase() === cat.id);
                    if (catItems.length === 0) return null;
                    const catKg = catItems.reduce((a, it) => a + (it.estoque_loja||0) + (it.estoque_camara||0), 0);

                    return (
                      <div key={cat.id} className="border-b border-zinc-800/60 last:border-0">
                        {/* Cabeçalho da categoria */}
                        <div className={clsx('flex items-center justify-between px-4 py-2.5', deptColor.bg)}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cat.emoji}</span>
                            <span className={clsx('text-xs font-extrabold uppercase tracking-widest', deptColor.text)}>{cat.label}</span>
                          </div>
                          <span className={clsx('text-sm font-extrabold', deptColor.text)}>{catKg.toFixed(3)} kg</span>
                        </div>

                        {/* Produtos da categoria */}
                        {catItems.map((item, idx) => {
                          const lojaKg = item.estoque_loja || 0;
                          const camaraKg = item.estoque_camara || 0;
                          const totalItem = lojaKg + camaraKg;
                          const pesado = totalItem > 0;

                          return (
                            <div key={item.id}
                              className={clsx(
                                'flex items-center gap-3 px-4 py-3',
                                idx !== catItems.length - 1 && 'border-b border-zinc-800/40',
                                !pesado && 'opacity-40'
                              )}
                            >
                              <span className="text-zinc-600 font-mono text-xs w-6 text-right shrink-0">{item.id}</span>
                              <span className="text-zinc-200 font-semibold text-sm flex-1 truncate">{item.nome}</span>

                              {pesado ? (
                                <div className="flex items-center gap-3 shrink-0 text-right">
                                  <div className="text-xs text-zinc-500">
                                    <div>L: <span className="text-zinc-300 font-mono">{lojaKg.toFixed(3)}</span></div>
                                    <div>C: <span className="text-zinc-300 font-mono">{camaraKg.toFixed(3)}</span></div>
                                  </div>
                                  <span className={clsx('text-base font-extrabold font-mono', deptColor.text)}>
                                    {totalItem.toFixed(3)}<span className="text-xs text-zinc-500 ml-0.5">kg</span>
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-700 text-xs font-mono shrink-0">não pesado</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Botões de ação — igual estilo do Balanço */}
                  <div className="flex items-center gap-2 p-4 pt-3">
                    <button onClick={() => handlePrint(record)}
                      className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-3.5 rounded-xl transition text-sm font-bold text-slate-300 flex-1">
                      <Printer size={16} /> Finalizar
                    </button>
                    <button onClick={() => { exportarVR(allItems, record.date); exportarExcel(allItems, record.date); }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-3.5 rounded-xl transition text-sm font-bold text-white flex-[2] shadow-lg shadow-blue-500/20">
                      <FileSpreadsheet size={16} /> Gerar TXT/Excel
                    </button>
                    <button onClick={() => { if (window.confirm('Excluir este balanço?')) onDeleteRecord(record.date); }}
                      className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 hover:border-red-500 transition text-red-400 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
