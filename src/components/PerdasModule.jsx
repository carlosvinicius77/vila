import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingDown, Plus, Trash2, AlertTriangle, FileDown, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { gerarNomeArquivo } from "../utils/exportTools";

// ─── Constantes ───────────────────────────────────────────────────────────────
const MOTIVOS = [
  { id: "VENCIMENTO",  label: "🗓️ Vencimento",          desc: "Produto fora do prazo" },
  { id: "QUEBRA_FRIO", label: "❄️ Quebra de Frio",      desc: "Falha no resfriamento" },
  { id: "ESTRAGO",     label: "🦠 Estrago / Deterioração", desc: "Produto comprometido" },
  { id: "OSSO",        label: "🦴 Osso / Invólucro",    desc: "Descarte de embalagem" },
  { id: "OUTRO",       label: "📋 Outro Motivo",         desc: "Registrar livremente" },
];

// ─── Utilitário de cálculo ────────────────────────────────────────────────────
function computeTotal(formula) {
  const sanitized = (formula || "").replace(/[,]/g, ".").replace(/[^\d.\-+*]/g, "");
  if (!sanitized) return 0;
  try {
    const r = new Function(`return ${sanitized}`)();
    return typeof r === "number" && !isNaN(r) ? Math.max(0, parseFloat(r.toFixed(3))) : 0;
  } catch (_) { return 0; }
}

// ─── Calculadora de fórmula inline ───────────────────────────────────────────
function FormulaCalc({ value, onChange }) {
  const total = computeTotal(value);

  const append = (char) => {
    if (char === ".") {
      const segs = value.split("+");
      const last = segs[segs.length - 1];
      if (last.includes(".")) return;
    }
    onChange(value + char);
  };
  const del = () => onChange(value.slice(0, -1));
  const clear = () => onChange("");

  const keys = ["7","8","9","⌫","4","5","6","+","1","2","3","+","C","0",".",""];

  return (
    <div className="bg-slate-950 border border-red-900/30 rounded-2xl overflow-hidden">
      {/* Display */}
      <div className="px-4 pt-4 pb-3">
        <div className="text-xs font-bold text-red-400/50 uppercase tracking-widest mb-1">
          Etiquetas (ex: 1.450 + 2.300 + 0.900)
        </div>
        <div className="text-right font-mono text-slate-400 text-sm min-h-[20px] break-all">
          {value || <span className="text-slate-700">0</span>}
        </div>
        <div className="flex justify-between items-baseline mt-2 border-t border-red-900/20 pt-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Total</span>
          <span className="text-3xl font-black text-red-400">
            {total.toFixed(3)}<span className="text-base text-red-600/60 ml-1">kg</span>
          </span>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-px bg-slate-800/30 border-t border-red-900/20">
        {keys.map((key, i) => {
          const isPlus  = key === "+" && (i === 7 || i === 11);
          const isDel   = key === "⌫";
          const isClear = key === "C";
          const isEmpty = key === "";
          if (isEmpty) return <div key={i} className="bg-slate-950 h-12" />;

          // "+" appears twice → first becomes real +, second reuses 
          const actual = isDel ? "DEL" : isClear ? "CLEAR" : key;

          return (
            <button
              key={i}
              onClick={() => {
                if (actual === "DEL") del();
                else if (actual === "CLEAR") clear();
                else if (actual === "+") append("+");
                else append(actual);
              }}
              className={`h-12 text-lg font-bold transition-colors ${
                isPlus  ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 text-xl" :
                isDel   ? "bg-slate-900 text-red-400/80 hover:bg-slate-800 text-base" :
                isClear ? "bg-slate-900 text-slate-500 hover:bg-slate-800 text-xs uppercase" :
                          "bg-slate-950 text-white hover:bg-slate-900"
              }`}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PerdasModule({ items, perdas, onAddPerda, onRemovePerda, dept }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formula, setFormula] = useState("");
  const [motivo, setMotivo] = useState("VENCIMENTO");
  const [showDropdown, setShowDropdown] = useState(false);

  const todayStr = new Date().toLocaleDateString("pt-BR");
  const todayPerdas = perdas.filter(p => p.dept === dept && p.date === todayStr);
  const totalHoje = todayPerdas.reduce((s, p) => s + p.kg, 0);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    return items.filter(it =>
      it.nome.toLowerCase().includes(search.toLowerCase()) ||
      it.id.toString().includes(search)
    ).slice(0, 6);
  }, [search, items]);

  const selectItem = (item) => {
    setSelectedItem(item);
    setSearch(item.nome);
    setFormula("");
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSearch("");
    setFormula("");
  };

  const handleRegister = () => {
    if (!selectedItem) { toast.error("Selecione um produto."); return; }
    const kg = computeTotal(formula);
    if (kg <= 0) { toast.error("Digite um peso válido."); return; }

    onAddPerda({
      id: Date.now(),
      dept,
      itemId: selectedItem.id,
      itemNome: selectedItem.nome,
      kg,
      formula,
      motivo,
      date: todayStr,
      timestamp: Date.now(),
    });
    toast.success(`📉 ${kg.toFixed(3)}kg de perda registrado — ${selectedItem.nome}`);
    clearSelection();
  };

  const exportRelatorio = () => {
    if (todayPerdas.length === 0) { toast.error("Nenhuma perda registrada hoje."); return; }
    const rows = todayPerdas.map(p => ({
      "Produto": p.itemNome,
      "Cód VR": p.itemId,
      "Motivo": MOTIVOS.find(m => m.id === p.motivo)?.label || p.motivo,
      "Peso (kg)": p.kg.toFixed(3).replace(".", ","),
      "Fórmula": p.formula || "-",
      "Data": p.date,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Perdas");
    XLSX.writeFile(wb, `${gerarNomeArquivo("relatorio_perdas", null)}.xlsx`);
    toast.success("Relatório de Perdas exportado!");
  };

  return (
    <div className="flex flex-col gap-4 pb-[140px] animate-in fade-in zoom-in-95 duration-300">

      {/* Banner */}
      <div className="bg-red-950/40 border border-red-900/40 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-900/50 border border-red-800/60 flex items-center justify-center shrink-0">
          <TrendingDown size={20} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-red-300 text-base leading-tight">Registro de Perdas / Quebras</h2>
          <p className="text-xs text-red-400/60 mt-0.5">Vencimentos, estragos e abatimentos do estoque</p>
        </div>
        {totalHoje > 0 && (
          <div className="text-right shrink-0">
            <div className="text-[10px] text-red-400/60 uppercase font-bold tracking-wider">Hoje</div>
            <div className="text-xl font-black text-red-400">-{totalHoje.toFixed(3)}kg</div>
          </div>
        )}
      </div>

      {/* Busca de produto */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-500" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedItem(null); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar produto por nome ou código VR..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-red-600/60 text-white rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all"
        />
        {search && (
          <button onClick={clearSelection} className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        )}

        <AnimatePresence>
          {showDropdown && filtered.length > 0 && !selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20"
            >
              {filtered.map(it => (
                <button
                  key={it.id}
                  onMouseDown={() => selectItem(it)}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-950/30 flex items-center gap-3 transition-colors border-b border-slate-800/50 last:border-0"
                >
                  <span className="text-slate-500 font-mono text-xs w-8 shrink-0">{it.id}</span>
                  <span className="text-white font-medium text-sm">{it.nome}</span>
                  <span className="ml-auto text-xs text-slate-600">
                    {((it.estoque_loja||0)+(it.estoque_camara||0)).toFixed(3)}kg em estoque
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Formulário de registro */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* Badge do produto */}
            <div className="bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-red-400/60 uppercase font-bold tracking-widest">Produto selecionado</div>
                <div className="text-white font-bold text-sm">[{selectedItem.id}] {selectedItem.nome}</div>
              </div>
              <button onClick={clearSelection} className="p-1 hover:text-red-400 text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Calculadora */}
            <FormulaCalc value={formula} onChange={setFormula} />

            {/* Motivos */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Motivo da Perda
              </label>
              <div className="grid grid-cols-1 gap-2">
                {MOTIVOS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMotivo(m.id)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold text-left transition-all border flex items-center gap-3 ${
                      motivo === m.id
                        ? "bg-red-900/30 border-red-600/60 text-red-200"
                        : "bg-slate-900/50 border-slate-800/60 text-slate-400 hover:border-red-900/50 hover:bg-red-950/20"
                    }`}
                  >
                    <span className="text-lg shrink-0">{m.label.split(" ")[0]}</span>
                    <div>
                      <div className="leading-tight">{m.label.slice(m.label.indexOf(" ")+1)}</div>
                      <div className="text-[10px] opacity-60 font-medium mt-0.5">{m.desc}</div>
                    </div>
                    {motivo === m.id && <span className="ml-auto text-red-400 text-lg">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão registrar */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              className="w-full bg-red-700 hover:bg-red-600 active:bg-red-800 text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/30 text-base"
            >
              <Plus size={20} />
              Registrar Perda · {computeTotal(formula).toFixed(3)}kg
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico do dia */}
      {todayPerdas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-500/60" />
              Perdas de Hoje ({todayPerdas.length})
            </h3>
            <button
              onClick={exportRelatorio}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-950/20"
            >
              <FileDown size={13} /> Exportar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {todayPerdas.map(p => {
              const mv = MOTIVOS.find(m => m.id === p.motivo);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{p.itemNome}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{mv?.label || p.motivo}</div>
                    {p.formula && (
                      <div className="text-[10px] font-mono text-slate-700 mt-0.5 truncate">{p.formula}</div>
                    )}
                  </div>
                  <span className="text-red-400 font-black text-base shrink-0">-{p.kg.toFixed(3)}kg</span>
                  <button
                    onClick={() => onRemovePerda(p.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-700 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-400">Total perdido hoje</span>
            <span className="text-2xl font-black text-red-400">-{totalHoje.toFixed(3)}<span className="text-sm text-red-600/70 ml-1">kg</span></span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayPerdas.length === 0 && !selectedItem && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-700">
          <TrendingDown size={52} className="opacity-20" />
          <p className="text-sm font-medium leading-relaxed">
            Nenhuma perda registrada hoje.<br />
            Busque um produto acima para começar.
          </p>
        </div>
      )}
    </div>
  );
}
