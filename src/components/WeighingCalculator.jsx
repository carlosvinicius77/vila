import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Delete, Store } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function WeighingCalculator({ isOpen, onClose, onConfirm, initialFormula = "", itemName = "Produto", locationName = "Loja" }) {
  const [expression, setExpression] = useState("");
  const [currentTotal, setCurrentTotal] = useState(0);
  const [lastValidTotal, setLastValidTotal] = useState(0);
  const [errorStatus, setErrorStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      setExpression(initialFormula || "");
      // Lock scroll when open
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen, initialFormula]);

  useEffect(() => {
    if (!expression) {
       setCurrentTotal(0);
       setLastValidTotal(0);
       setErrorStatus("");
       return;
    }

    const sanitized = expression.replace(/[,]/g, '.').replace(/[^\d.\-+*]/g, '');
    try {
      const val = new Function(`return ${sanitized}`)();
      if (typeof val === 'number' && !isNaN(val)) {
         setCurrentTotal(parseFloat(val.toFixed(3)));
         setLastValidTotal(parseFloat(val.toFixed(3)));
         setErrorStatus("");
      }
    } catch (e) {
       setCurrentTotal(lastValidTotal);
       setErrorStatus("Incompleto...");
    }
  }, [expression, lastValidTotal]);

  if (!isOpen) return null;

  const handleChar = (char) => {
    setExpression(prev => prev + char);
  };

  const handleDelete = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (expression === "") {
        onClose();
    } else {
        setExpression("");
    }
  };

  const handleConfirm = () => {
    onConfirm(lastValidTotal, expression);
    onClose();
  };

  const historyParts = expression.split(/(?=[+\-*])/).filter(Boolean);

  const content = (
    <div className="fixed inset-0 z-[999] flex items-stretch justify-center bg-slate-950 print:hidden overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-slate-900 shadow-2xl relative pointer-events-auto h-full flex flex-col"
      >
        <div className="p-6 pb-safe flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          {/* Header - Fixed Top */}
          <div className="flex justify-between items-start mb-6 mt-4">
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80 mb-1 block">Item Selecionado</span>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none break-words pr-4">{itemName}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <Store size={12} className="text-blue-500" /> {locationName}
              </p>
            </div>
            <button   
              onClick={onClose} 
              className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all p-4 rounded-[2rem] border border-white/5 shadow-inner shrink-0"
            >
               <X size={28} />
            </button>
          </div>

          {/* Display Area - Filling Space */}
          <div className="bg-black/80 border border-white/10 rounded-[2.5rem] p-6 flex flex-col items-end mb-6 relative overflow-hidden group shadow-2xl shrink-0">
             <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full"></div>
             {errorStatus && <span className="absolute top-6 left-8 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] animate-pulse">{errorStatus}</span>}
             
             <div className="flex flex-wrap justify-end gap-2 mb-3 w-full opacity-60 text-sm font-mono overflow-auto max-h-[50px] scrollbar-hide items-end">
                {historyParts.length > 0 ? historyParts.map((part, i) => (
                  <span key={i} className="bg-white/10 px-3 py-1 rounded-lg text-slate-200 border border-white/5 shadow-sm">{part}</span>
                )) : <span className="text-slate-600 italic text-xs">Aguardando contagem...</span>}
             </div>

             <div className="w-full text-right mb-1">
                <input 
                  type="text" 
                  value={expression}
                  readOnly
                  className="w-full bg-transparent text-right text-5xl font-mono text-white outline-none pr-1 placeholder:text-slate-800 tracking-tighter"
                  placeholder="0.000"
                />
             </div>

             <div className="w-full h-[1px] bg-white/10 my-4 shadow-sm opacity-50"></div>
             
             <div className="flex justify-between items-end w-full">
               <span className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] pb-2">Peso Total</span>
               <div className="flex items-baseline gap-2">
                 <span className={`text-7xl font-black tracking-tighter transition-all duration-300 ${errorStatus ? 'text-slate-600' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]'}`}>
                   {currentTotal.toFixed(3)}
                 </span>
                 <span className="text-xl font-black text-emerald-600/60 lowercase italic pr-1">kg</span>
               </div>
             </div>
          </div>

          {/* Grid Turbo - Expanded */}
          <div className="flex-1 flex flex-col gap-4">
             {/* Keypad */}
             <div className="grid grid-cols-4 gap-4 flex-1">
                {/* 3 Columns for numbers */}
                <div className="col-span-3 grid grid-cols-3 gap-4">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                     <button 
                       key={num} 
                       onClick={() => handleChar(num.toString())} 
                       className="bg-white/[0.04] hover:bg-white/[0.08] active:scale-90 text-white text-3xl font-black rounded-[2rem] border border-white/10 transition-all shadow-xl flex items-center justify-center min-h-[70px]"
                     >
                       {num}
                     </button>
                   ))}
                   <button onClick={handleClear} className="bg-red-500/10 border border-red-500/30 text-red-500 font-black text-lg rounded-[2rem] active:scale-95 transition-all uppercase tracking-tighter flex items-center justify-center">Limpar</button>
                   <button onClick={() => handleChar('0')} className="bg-white/[0.04] hover:bg-white/[0.08] active:scale-90 text-white text-3xl font-black rounded-[2rem] border border-white/10 transition-all shadow-xl flex items-center justify-center">0</button>
                   <button onClick={() => handleChar('.')} className="bg-white/[0.04] hover:bg-white/[0.08] active:scale-90 text-white text-4xl font-black rounded-[2rem] border border-white/10 transition-all shadow-xl flex items-center justify-center pb-4">.</button>
                </div>

                {/* Vertical Operators */}
                <div className="col-span-1 flex flex-col gap-4">
                   <button onClick={handleDelete} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex-1 flex items-center justify-center rounded-[2rem] border border-white/5 transition-all shadow-md"><Delete size={28} /></button>
                   <button onClick={() => handleChar('*')} className="bg-blue-600/20 border border-blue-500/40 text-blue-400 text-3xl font-black flex-1 flex items-center justify-center rounded-[2rem] active:scale-95 transition-all shadow-md">×</button>
                   <button onClick={() => handleChar('-')} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-4xl font-black flex-1 flex items-center justify-center rounded-[2rem] border border-white/5 transition-all shadow-md">−</button>
                   <button onClick={() => handleChar('+')} className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-5xl font-black flex-1 flex items-center justify-center rounded-[2rem] transition-all shadow-2xl shadow-emerald-900/60">+</button>
                </div>
             </div>

             {/* Bottom Action */}
             <button 
               onClick={handleConfirm} 
               className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white h-20 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.1em] transition-all shadow-[0_15px_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 mt-2 border-t border-white/20 mb-safe"
             >
                <Check size={32} strokeWidth={4} />
                Confirmar Pesagem
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(content, document.body);
}
