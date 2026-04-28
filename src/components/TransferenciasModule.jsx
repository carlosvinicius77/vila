import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UtensilsCrossed, Plus, Trash2, FileDown, ClipboardList, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { gerarNomeArquivo } from "../utils/exportTools";

// ─── Destinos de transferência ─────────────────────────────────────────────────
const DESTINOS = [
  { id: "COZINHA",       label: "🍳 Cozinha",               desc: "Produção de pratos/marmitas" },
  { id: "FRANGO_ASSADO", label: "🍗 Frango Assado / Grelhado", desc: "Rotisserie e grelhados" },
  { id: "BUFFET",        label: "🍽️ Buffet / Self-Service", desc: "Praça de alimentação" },
  { id: "PADARIA",       label: "🥐 Padaria / Confeitaria", desc: "Produção de pães e doces" },
  { id: "OUTRO",         label: "📦 Outro Destino",         desc: "Registrar livremente" },
];

// ─── Utilitário ────────────────────────────────────────────────────────────────
function computeTotal(formula) {
  const sanitized = (formula || "").replace(/[,]/g, ".").replace(/[^\d.\-+*]/g, "");
  if (!sanitized) return 0;
  try {
    const r = new Function(`return ${sanitized}`)();
    return typeof r === "number" && !isNaN(r) ? Math.max(0, parseFloat(r.toFixed(3))) : 0;
  } catch (_) { return 0; }
}

// ─── Calculadora de etiquetas ──────────────────────────────────────────────────
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
    <div className="bg-slate-950 border border-amber-900/30 rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="text-xs font-bold text-amber-400/50 uppercase tracking-widest mb-1">
          Caderno digital — some etiqueta por etiqueta
        </div>
        <div className="text-right font-mono text-slate-400 text-sm min-h-[20px] break-all">
          {value || <span className="text-slate-700">0</span>}
        </div>
        <div className="flex justify-between items-baseline mt-2 border-t border-amber-900/20 pt-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Total do Lote</span>
          <span className="text-3xl font-black text-amber-400">
            {total.toFixed(3)}<span className="text-base text-amber-600/60 ml-1">kg</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px bg-slate-800/30 border-t border-amber-900/20">
        {keys.map((key, i) => {
          const isPlus  = key === "+" && (i === 7 || i === 11);
          const isDel   = key === "⌫";
          const isClear = key === "C";
          const isEmpty = key === "";
          if (isEmpty) return <div key={i} className="bg-slate-950 h-12" />;

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
                isPlus  ? "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 text-2xl" :
                isDel   ? "bg-slate-900 text-amber-400/70 hover:bg-slate-800 text-base" :
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

// ─── Componente principal ──────────────────────────────────────────────────────
export function TransferenciasModule({ items, transferencias, onAddTransferencia, onRemoveTransferencia, dept }) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formula, setFormula] = useState("");
  const [destino, setDestino] = useState("COZINHA");
  const [showDropdown, setShowDropdown] = useState(false);

  const todayStr = new Date().toLocaleDateString("pt-BR");
  const todayTransf = transferencias.filter(t => t.dept === dept && t.date === todayStr);
  const totalHoje = todayTransf.reduce((s, t) => s + t.kg, 0);

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
    if (kg <= 0) { toast.error("Digite um peso válido nas etiquetas."); return; }

    onAddTransferencia({
      id: Date.now(),
      dept,
      itemId: selectedItem.id,
      itemNome: selectedItem.nome,
      kg,
      formula,
      destino,
      date: todayStr,
      timestamp: Date.now(),
    });
    toast.success(`🍳 ${kg.toFixed(3)}kg transferido — ${selectedItem.nome} → ${DESTINOS.find(d => d.id === destino)?.label}`);
    clearSelection();
  };

  const exportPlanilhaCozinha = () => {
    if (todayTransf.length === 0) { toast.error("Nenhuma transferência registrada hoje."); return; }
    const rows = todayTransf.map(t => ({
      "Produto": t.itemNome,
      "Cód VR": t.itemId,
      "Destino": DESTINOS.find(d => d.id === t.destino)?.label || t.destino,
      "Peso (kg)": t.kg.toFixed(3).replace(".", ","),
      "Etiquetas": t.formula || "-",
      "Data": t.date,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cozinha");
    XLSX.writeFile(wb, `${gerarNomeArquivo("planilha_cozinha", null)}.xlsx`);
    toast.success("Planilha de Cozinha exportada!");
  };

  return (
    <div className="flex flex-col gap-4 pb-[140px] animate-in fade-in zoom-in-95 duration-300">

      {/* Banner */}
      <div className="bg-amber-950/40 border border-amber-800/40 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-700/60 flex items-center justify-center shrink-0">
          <UtensilsCrossed size={20} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-amber-300 text-base leading-tight">Transferências / Cozinha</h2>
          <p className="text-xs text-amber-400/60 mt-0.5">Itens enviados para produção interna — caderno digital</p>
        </div>
        {totalHoje > 0 && (
          <div className="text-right shrink-0">
            <div className="text-[10px] text-amber-400/60 uppercase font-bold tracking-wider">Hoje</div>
            <div className="text-xl font-black text-amber-400">{totalHoje.toFixed(3)}kg</div>
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
          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-600/60 text-white rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all"
        />
        {search && (
          <button onClick={clearSelection} className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-amber-400 transition-colors">
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
                  className="w-full text-left px-4 py-2.5 hover:bg-amber-950/30 flex items-center gap-3 transition-colors border-b border-slate-800/50 last:border-0"
                >
                  <span className="text-slate-500 font-mono text-xs w-8 shrink-0">{it.id}</span>
                  <span className="text-white font-medium text-sm">{it.nome}</span>
                  <span className="ml-auto text-xs text-slate-600">
                    {((it.estoque_loja||0)+(it.estoque_camara||0)).toFixed(3)}kg
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* Badge */}
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-400/60 uppercase font-bold tracking-widest">Produto selecionado</div>
                <div className="text-white font-bold text-sm">[{selectedItem.id}] {selectedItem.nome}</div>
              </div>
              <button onClick={clearSelection} className="p-1 hover:text-amber-400 text-slate-500 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Calculadora de etiquetas */}
            <FormulaCalc value={formula} onChange={setFormula} />

            {/* Destino */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Destino da Transferência
              </label>
              <div className="grid grid-cols-1 gap-2">
                {DESTINOS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDestino(d.id)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold text-left transition-all border flex items-center gap-3 ${
                      destino === d.id
                        ? "bg-amber-900/30 border-amber-600/60 text-amber-200"
                        : "bg-slate-900/50 border-slate-800/60 text-slate-400 hover:border-amber-800/50 hover:bg-amber-950/20"
                    }`}
                  >
                    <span className="text-lg shrink-0">{d.label.split(" ")[0]}</span>
                    <div>
                      <div className="leading-tight">{d.label.slice(d.label.indexOf(" ")+1)}</div>
                      <div className="text-[10px] opacity-60 font-medium mt-0.5">{d.desc}</div>
                    </div>
                    {destino === d.id && <span className="ml-auto text-amber-400 text-lg">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Registrar */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl py-4 font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-900/30 text-base"
            >
              <Plus size={20} />
              Transferir · {computeTotal(formula).toFixed(3)}kg
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico do lote */}
      {todayTransf.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList size={13} className="text-amber-500/60" />
              Lote de Hoje ({todayTransf.length})
            </h3>
            <button
              onClick={exportPlanilhaCozinha}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-lg hover:bg-amber-950/20"
            >
              <FileDown size={13} /> Planilha Cozinha
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {todayTransf.map(t => {
              const dv = DESTINOS.find(d => d.id === t.destino);
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{t.itemNome}</div>
                    <div className="text-xs text-amber-500/70 mt-0.5">{dv?.label || t.destino}</div>
                    {t.formula && (
                      <div className="text-[10px] font-mono text-slate-700 mt-0.5 truncate">{t.formula}</div>
                    )}
                  </div>
                  <span className="text-amber-400 font-black text-base shrink-0">{t.kg.toFixed(3)}kg</span>
                  <button
                    onClick={() => onRemoveTransferencia(t.id)}
                    className="p-1.5 rounded-lg hover:bg-amber-900/30 text-slate-700 hover:text-amber-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 bg-amber-950/30 border border-amber-800/30 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-400">Total transferido hoje</span>
            <span className="text-2xl font-black text-amber-400">{totalHoje.toFixed(3)}<span className="text-sm text-amber-600/70 ml-1">kg</span></span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayTransf.length === 0 && !selectedItem && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-slate-700">
          <UtensilsCrossed size={52} className="opacity-20" />
          <p className="text-sm font-medium leading-relaxed">
            Nenhuma transferência registrada hoje.<br />
            Busque um produto e some as etiquetas do caderno.
          </p>
        </div>
      )}
    </div>
  );
}
