import { useState } from "react";
import { Scale, TrendingDown, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { WeighingCalculator } from "./WeighingCalculator";

// ─── Campo de localização com calculadora ─────────────────────────────────────
function LocationField({ label, value, formula, onOpenCalculator, themeClasses }) {
  return (
    <div className={`p-3 rounded-xl border ${themeClasses.border} ${themeClasses.bg} flex flex-col gap-2 relative transition-all`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.text}`}>{label}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-white print:text-black">{value.toFixed(3)}kg</span>
        </div>
      </div>
      <div className="flex gap-2 print:hidden mt-2">
        <button
          onClick={onOpenCalculator}
          className="w-full bg-slate-900/60 hover:bg-slate-800 border border-slate-700/70 text-slate-300 rounded-lg py-2 flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm tracking-wide transition-colors active:bg-slate-950 hover:border-blue-500/50 hover:text-blue-200"
        >
          <Scale size={16} className="text-blue-500" />
          <span>Calculadora</span>
        </button>
      </div>
    </div>
  );
}

// ─── ProductCard principal ─────────────────────────────────────────────────────
export function ProductCard({
  item,
  updateItem,
  updateItemFields,
  onEdit,
  onDelete
}) {
  const totalPesado = (item.estoque_loja || 0) + (item.estoque_camara || 0);

  const [calculatorOpts, setCalculatorOpts] = useState(null);

  const handleCalculatorConfirm = (newTotal, newFormula) => {
    if (!calculatorOpts) return;
    if (calculatorOpts.location === "loja") {
      updateItemFields(item.id, { estoque_loja: newTotal, formula_loja: newFormula });
      toast.success(`Loja atualizada para ${newTotal}kg`);
    } else {
      updateItemFields(item.id, { estoque_camara: newTotal, formula_camara: newFormula });
      toast.success(`Câmara atualizada para ${newTotal}kg`);
    }
  };

  return (
    <div className="py-4 border-b border-slate-800/60 flex flex-col gap-3 w-full print:border-slate-300 print:bg-white print:text-black print:mb-2 print:break-inside-avoid last:border-0 hover:bg-slate-900/20 transition-colors px-2 -mx-2 rounded-xl">

      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 text-slate-300 font-bold text-sm rounded-lg w-10 h-10 flex items-center justify-center shrink-0 print:bg-transparent print:text-black print:border print:border-slate-300">
            {item.id}
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-white print:text-black leading-tight tracking-tight">{item.nome}</h2>
            <div className="flex gap-3 mt-1 print:hidden">
              <button
                onClick={() => onEdit(item)}
                className="text-[11px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => { if (window.confirm(`Excluir '${item.nome}'?`)) onDelete(item.id); }}
                className="text-[11px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Coluna de totais */}
        <div className="text-right flex flex-col items-end gap-0.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Inventário</span>
          <span className="text-2xl font-black text-emerald-400 tracking-tighter">
            {totalPesado.toFixed(3)}<span className="text-sm font-bold text-emerald-600/70 ml-1">kg</span>
          </span>
        </div>
      </div>

      {/* ── Loja + Câmara ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 print:gap-2">
        <LocationField
          label="Loja"
          value={item.estoque_loja || 0}
          formula={item.formula_loja}
          onOpenCalculator={() => setCalculatorOpts({ location: "loja", label: "Loja" })}
          themeClasses={{
            bg: "bg-slate-900/40 print:bg-transparent",
            border: "border-slate-800 print:border-slate-300",
            text: "text-slate-400 print:text-slate-700",
          }}
        />
        <LocationField
          label="Câmara"
          value={item.estoque_camara || 0}
          formula={item.formula_camara}
          onOpenCalculator={() => setCalculatorOpts({ location: "camara", label: "Câmara" })}
          themeClasses={{
            bg: "bg-blue-900/10 print:bg-transparent",
            border: "border-blue-900/30 print:border-slate-300",
            text: "text-blue-400 print:text-slate-700",
          }}
        />
      </div>

      {/* Print layout */}
      <div className="hidden print:flex print:justify-between print:text-xs print:border-t print:border-slate-300 print:pt-1 print:mt-1">
        <span>Loja: {(item.estoque_loja||0).toFixed(3)}</span>
        <span>Câmara: {(item.estoque_camara||0).toFixed(3)}</span>
        <span className="font-black">Total: {totalPesado.toFixed(3)}kg</span>
      </div>

      <AnimatePresence>
        {calculatorOpts && (
          <WeighingCalculator
            isOpen={!!calculatorOpts}
            onClose={() => setCalculatorOpts(null)}
            onConfirm={handleCalculatorConfirm}
            itemName={item.nome}
            locationName={calculatorOpts?.label}
            initialFormula={calculatorOpts ? item[`formula_${calculatorOpts.location}`] : ""}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
