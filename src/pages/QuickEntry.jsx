import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { clsx } from 'clsx';
import { LogOut, Delete, Check, X } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../initialData';

const DEPT_CONFIG = {
  Acougue:    { label: 'Açougue',    emoji: '🥩', color: 'blue',    btn: 'bg-blue-600 hover:bg-blue-500',     text: 'text-blue-400',    bg: 'bg-blue-600/10',   border: 'border-blue-500' },
  Frios:      { label: 'Frios',      emoji: '📦', color: 'yellow',  btn: 'bg-yellow-600 hover:bg-yellow-500',  text: 'text-yellow-400',  bg: 'bg-yellow-600/10', border: 'border-yellow-500' },
  Hortifruti: { label: 'Hortifruti', emoji: '🍎', color: 'emerald', btn: 'bg-emerald-600 hover:bg-emerald-500',text: 'text-emerald-400', bg: 'bg-emerald-600/10',border: 'border-emerald-500' },
};

function computeTotal(expr) {
  const s = (expr || '').replace(/,/g, '.').replace(/[^\d.+\-*]/g, '');
  if (!s) return 0;
  try {
    const r = new Function(`return ${s}`)();
    return typeof r === 'number' && !isNaN(r) ? Math.max(0, parseFloat(r.toFixed(3))) : 0;
  } catch { return 0; }
}

// Fases: 'code' → digita código  |  'weight' → digita peso  |  'done' → confirmado
export default function QuickEntry() {
  const navigate = useNavigate();
  const dept = localStorage.getItem('@acougue/currentDept') || 'Acougue';
  const cfg = DEPT_CONFIG[dept] || DEPT_CONFIG.Acougue;

  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState('code');   // 'code' | 'weight' | 'done'
  const [codeBuffer, setCodeBuffer] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [formula, setFormula] = useState('');
  const [location, setLocation] = useState('loja');

  const total = computeTotal(formula);

  useEffect(() => {
    const saved = localStorage.getItem('@acougue/items');
    if (saved) { try { setItems(JSON.parse(saved)); } catch { setItems(INITIAL_PRODUCTS); } }
    else setItems(INITIAL_PRODUCTS);
  }, []);

  // ── Teclado numérico genérico ──────────────────────────────────────────────
  const pressKey = (k) => {
    if (phase === 'code') {
      if (k === 'DEL') setCodeBuffer(p => p.slice(0, -1));
      else if (k === 'C') setCodeBuffer('');
      else if (k === 'OK') searchProduct();
      else setCodeBuffer(p => p + k);
    } else if (phase === 'weight') {
      if (k === 'DEL') setFormula(p => p.slice(0, -1));
      else if (k === 'C') setFormula('');
      else if (k === '+') appendFormula('+');
      else if (k === 'OK') confirmWeight();
      else appendFormula(k);
    }
  };

  const appendFormula = (char) => {
    if (char === '.') {
      const segs = formula.split('+');
      if (segs[segs.length - 1].includes('.')) return;
    }
    setFormula(p => p + char);
  };

  const searchProduct = () => {
    if (!codeBuffer.trim()) return;
    const found = items.find(it => it.id.toString() === codeBuffer.trim());
    if (found) {
      setFoundProduct(found);
      setFormula('');
      setLocation('loja');
      setPhase('weight');
    } else {
      toast.error(`Código ${codeBuffer} não encontrado`);
      setCodeBuffer('');
    }
  };

  const confirmWeight = () => {
    if (total <= 0) { toast.error('Insira um peso válido'); return; }
    if (total > 500) {
      if (!window.confirm(`Peso ${total.toFixed(3)}kg parece alto. Confirmar?`)) return;
    }
    const field = location === 'loja' ? 'estoque_loja' : 'estoque_camara';
    const fField = location === 'loja' ? 'formula_loja' : 'formula_camara';
    const updated = items.map(it => it.id === foundProduct.id ? { ...it, [field]: total, [fField]: formula } : it);
    setItems(updated);
    localStorage.setItem('@acougue/items', JSON.stringify(updated));
    toast.success(`${foundProduct.nome} — ${total.toFixed(3)}kg ✓`);
    setPhase('done');
    setTimeout(() => {
      setFoundProduct(null);
      setCodeBuffer('');
      setFormula('');
      setPhase('code');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col select-none">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{cfg.emoji}</span>
          <span className={clsx('font-extrabold text-base', cfg.text)}>{cfg.label}</span>
        </div>
        <button
          onClick={() => { localStorage.removeItem('@acougue/isAuthenticated'); localStorage.removeItem('@acougue/role'); navigate('/', { replace: true }); }}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={19} />
        </button>
      </div>

      {/* Área de display */}
      <div className="flex flex-col flex-1 px-4 pt-5 pb-2 gap-4">

        {/* Produto encontrado */}
        <AnimatePresence>
          {foundProduct && phase === 'weight' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={clsx('flex items-center justify-between px-4 py-3 rounded-xl border', cfg.bg, cfg.border)}
            >
              <div>
                <div className="text-[10px] text-slate-500 font-mono">Cód. {foundProduct.id}</div>
                <div className={clsx('font-extrabold text-base', cfg.text)}>{foundProduct.nome}</div>
              </div>
              <button onClick={() => { setPhase('code'); setFoundProduct(null); setFormula(''); }}
                className="p-1 text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-1">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">
            {phase === 'code'   && 'Digite o código do produto'}
            {phase === 'weight' && (location === 'loja' ? '🏪 Peso — Loja' : '🧊 Peso — Câmara')}
            {phase === 'done'   && 'Salvo!'}
          </div>

          {/* Expressão (peso) ou código */}
          <div className="text-right font-mono text-slate-400 text-sm min-h-[18px] break-all">
            {phase === 'weight' && formula}
          </div>

          {/* Valor grande */}
          <div className="text-right">
            {phase === 'code' && (
              <span className="text-5xl font-black text-white tracking-widest">
                {codeBuffer || <span className="text-slate-700">_ _ _ _</span>}
              </span>
            )}
            {phase === 'weight' && (
              <div className="flex items-baseline justify-end gap-2">
                <span className={clsx('text-5xl font-black tracking-tighter', cfg.text)}>{total.toFixed(3)}</span>
                <span className="text-xl font-bold text-slate-500">kg</span>
              </div>
            )}
            {phase === 'done' && (
              <div className="flex items-center justify-end gap-3 py-2">
                <Check size={36} className={cfg.text} strokeWidth={3} />
                <span className={clsx('text-4xl font-black', cfg.text)}>{total.toFixed(3)} kg</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Loja/Câmara — só na fase de peso */}
        {phase === 'weight' && (
          <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            <button onClick={() => setLocation('loja')}
              className={clsx('flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                location === 'loja' ? `${cfg.btn} text-white shadow` : 'text-slate-400'
              )}>🏪 Loja</button>
            <button onClick={() => setLocation('camara')}
              className={clsx('flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                location === 'camara' ? `${cfg.btn} text-white shadow` : 'text-slate-400'
              )}>🧊 Câmara</button>
          </div>
        )}

        {/* Teclado numérico */}
        {phase !== 'done' && (
          <div className="grid grid-cols-3 gap-3 flex-1">
            {[1,2,3, 4,5,6, 7,8,9].map(n => (
              <button key={n} onClick={() => pressKey(String(n))}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl py-5 border border-slate-700 transition-all">
                {n}
              </button>
            ))}

            {/* Linha inferior — muda conforme fase */}
            {phase === 'code' ? (
              <>
                <button onClick={() => pressKey('C')}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-2xl py-5 text-sm transition-all active:scale-95">
                  Limpar
                </button>
                <button onClick={() => pressKey('0')}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl py-5 border border-slate-700 transition-all">
                  0
                </button>
                <button onClick={() => pressKey('DEL')}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-2xl py-5 flex items-center justify-center border border-slate-700 transition-all">
                  <Delete size={24} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => pressKey('+')}
                  className={clsx('font-black text-3xl rounded-2xl py-5 border transition-all active:scale-95', cfg.bg, cfg.border, cfg.text)}>
                  +
                </button>
                <button onClick={() => pressKey('0')}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl py-5 border border-slate-700 transition-all">
                  0
                </button>
                <button onClick={() => pressKey('.')}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl py-5 border border-slate-700 transition-all">
                  .
                </button>
              </>
            )}

            {/* Botão OK / Confirmar — ocupa linha inteira */}
            <button
              onClick={() => pressKey('OK')}
              className={clsx('col-span-3 py-5 rounded-2xl font-extrabold text-white text-xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]', cfg.btn)}
            >
              {phase === 'code'   && <><Search16 /> Buscar Produto</>}
              {phase === 'weight' && <><Check size={22} strokeWidth={3} /> Confirmar Pesagem</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Search16() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
