import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { clsx } from 'clsx';
import {
  LogOut, Delete, Check, X, Search,
  ChefHat, Scale, Pencil, Trash2, ClipboardList,
  FileText, FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { gerarNomeArquivo, exportarVR } from '../utils/exportTools';
import { INITIAL_PRODUCTS } from '../initialData';

const DEPT_CONFIG = {
  Acougue:    { label: 'Açougue',    emoji: '🥩', color: 'blue',    btn: 'bg-blue-600 hover:bg-blue-500',      text: 'text-blue-400',    bg: 'bg-blue-600/10',   border: 'border-blue-500' },
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

export default function QuickEntry() {
  const navigate = useNavigate();
  const dept = localStorage.getItem('@acougue/currentDept') || 'Acougue';
  const deptCfg = DEPT_CONFIG[dept] || DEPT_CONFIG.Acougue;

  const COZINHA_CFG = { label: 'Cozinha', emoji: '🍳', color: 'amber', btn: 'bg-amber-600 hover:bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-600/10', border: 'border-amber-500' };

  const [items, setItems] = useState([]);

  // Abas: 'teclado' | 'historico'
  const [tab, setTab] = useState('teclado');

  // Fase do teclado
  const [phase, setPhase] = useState('code'); // 'code' | 'weight' | 'done'
  const [codeBuffer, setCodeBuffer] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [formula, setFormula] = useState('');
  const [location, setLocation] = useState('loja');
  const [mode, setMode] = useState('balanco'); // 'balanco' | 'cozinha'

  // cfg muda com o modo — cozinha = amarelo, balanço = cor do setor
  const cfg = mode === 'cozinha' ? COZINHA_CFG : deptCfg;

  // Busca por nome (lupa)
  const [showSearch, setShowSearch] = useState(false);

  // Histórico da sessão
  const [sessionLog, setSessionLog] = useState([]);

  // Edição
  const [editingLog, setEditingLog] = useState(null); // { index, entry }
  const [editFormula, setEditFormula] = useState('');

  const total = computeTotal(formula);
  const editTotal = computeTotal(editFormula);

  useEffect(() => {
    const saved = localStorage.getItem('@acougue/items');
    if (saved) { try { setItems(JSON.parse(saved)); } catch { setItems(INITIAL_PRODUCTS); } }
    else setItems(INITIAL_PRODUCTS);
  }, []);

  // ── Selecionar produto (por código ou pela busca) ──────────────────────────
  const selectProduct = (item) => {
    setFoundProduct(item);
    setFormula('');
    setLocation('loja');
    setPhase('weight');
    setShowSearch(false);
    setSearchQuery('');
    setCodeBuffer('');
    setTab('teclado');
  };

  // ── Teclado ───────────────────────────────────────────────────────────────
  const pressKey = (k) => {
    if (phase === 'code') {
      if (k === 'DEL') setCodeBuffer(p => p.slice(0, -1));
      else if (k === 'C') setCodeBuffer('');
      else if (k === 'OK') searchByCode();
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

  const searchByCode = () => {
    if (!codeBuffer.trim()) return;
    const found = items.find(it => it.id.toString() === codeBuffer.trim());
    if (found) {
      selectProduct(found);
    } else {
      toast.error(`Código ${codeBuffer} não encontrado`);
      setCodeBuffer('');
    }
  };

  // ── Confirmar pesagem ─────────────────────────────────────────────────────
  const confirmWeight = () => {
    if (total <= 0) { toast.error('Insira um peso válido'); return; }
    if (total > 500 && !window.confirm(`Peso ${total.toFixed(3)}kg parece alto. Confirmar?`)) return;

    const logId = Date.now();

    if (mode === 'balanco') {
      const field = location === 'loja' ? 'estoque_loja' : 'estoque_camara';
      const fField = location === 'loja' ? 'formula_loja' : 'formula_camara';
      const updated = items.map(it => it.id === foundProduct.id ? { ...it, [field]: total, [fField]: formula } : it);
      setItems(updated);
      localStorage.setItem('@acougue/items', JSON.stringify(updated));
    } else {
      const list = JSON.parse(localStorage.getItem('@acougue/transferencias') || '[]');
      list.push({ id: logId, dept, itemId: foundProduct.id, itemNome: foundProduct.nome, kg: total, formula, destino: '🍳 Cozinha', date: new Date().toLocaleString('pt-BR'), timestamp: logId });
      localStorage.setItem('@acougue/transferencias', JSON.stringify(list));
    }

    setSessionLog(p => [{
      id: logId, itemId: foundProduct.id, itemNome: foundProduct.nome,
      kg: total, formula, mode, location: mode === 'balanco' ? location : null,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }, ...p]);

    toast.success(`${foundProduct.nome} — ${total.toFixed(3)}kg ✓`);
    setPhase('done');
    setTimeout(() => { setFoundProduct(null); setCodeBuffer(''); setFormula(''); setPhase('code'); }, 1200);
  };

  // ── Editar registro do histórico ──────────────────────────────────────────
  const saveEdit = () => {
    if (editTotal <= 0) { toast.error('Peso inválido'); return; }
    const entry = editingLog.entry;

    if (entry.mode === 'balanco') {
      const field = entry.location === 'loja' ? 'estoque_loja' : 'estoque_camara';
      const fField = entry.location === 'loja' ? 'formula_loja' : 'formula_camara';
      const updated = items.map(it => it.id === entry.itemId ? { ...it, [field]: editTotal, [fField]: editFormula } : it);
      setItems(updated);
      localStorage.setItem('@acougue/items', JSON.stringify(updated));
    } else {
      const list = JSON.parse(localStorage.getItem('@acougue/transferencias') || '[]');
      localStorage.setItem('@acougue/transferencias', JSON.stringify(
        list.map(t => t.id === entry.id ? { ...t, kg: editTotal, formula: editFormula } : t)
      ));
    }

    setSessionLog(p => p.map((e, i) => i === editingLog.index ? { ...e, kg: editTotal, formula: editFormula } : e));
    toast.success('Registro atualizado ✓');
    setEditingLog(null);
    setEditFormula('');
  };

  // ── Apagar registro do histórico ──────────────────────────────────────────
  const deleteLog = (idx) => {
    const entry = sessionLog[idx];
    if (!window.confirm(`Apagar "${entry.itemNome}" do histórico?`)) return;

    if (entry.mode === 'balanco') {
      // Zera o campo no items
      const field = entry.location === 'loja' ? 'estoque_loja' : 'estoque_camara';
      const fField = entry.location === 'loja' ? 'formula_loja' : 'formula_camara';
      const updated = items.map(it => it.id === entry.itemId ? { ...it, [field]: 0, [fField]: '' } : it);
      setItems(updated);
      localStorage.setItem('@acougue/items', JSON.stringify(updated));
    } else {
      const list = JSON.parse(localStorage.getItem('@acougue/transferencias') || '[]');
      localStorage.setItem('@acougue/transferencias', JSON.stringify(list.filter(t => t.id !== entry.id)));
    }

    setSessionLog(p => p.filter((_, i) => i !== idx));
    toast.success('Registro removido');
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col select-none overflow-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800 bg-slate-900/95 shrink-0">
        <span className="text-lg">{cfg.emoji}</span>
        <span className={clsx('font-extrabold text-sm', cfg.text)}>{cfg.label}</span>
        <div className="flex-1" />

        {/* Lupa — busca por nome */}
        <button onClick={() => { setShowSearch(p => !p); setTab('teclado'); }}
          className="p-2 text-slate-400 hover:text-white transition-colors">
          <Search size={19} />
        </button>

        {/* Histórico — ao lado da lupa */}
        <button onClick={() => setTab(p => p === 'historico' ? 'teclado' : 'historico')}
          className={clsx('relative p-2 transition-colors', tab === 'historico' ? cfg.text : 'text-slate-400 hover:text-white')}>
          <ClipboardList size={19} />
          {sessionLog.length > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full text-[8px] font-black text-white flex items-center justify-center leading-none">
              {sessionLog.length > 9 ? '9+' : sessionLog.length}
            </span>
          )}
        </button>

        {/* Balanço */}
        <button onClick={() => setMode('balanco')}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all',
            mode === 'balanco' ? `${cfg.btn} text-white shadow-lg` : 'bg-slate-800 text-slate-400'
          )}>
          <Scale size={13} /> Balanço
        </button>

        {/* Cozinha */}
        <button onClick={() => setMode('cozinha')}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all',
            mode === 'cozinha' ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
          )}>
          <ChefHat size={13} /> Cozinha
        </button>

        {/* Sair */}
        <button onClick={() => { localStorage.removeItem('@acougue/isAuthenticated'); localStorage.removeItem('@acougue/role'); navigate('/', { replace: true }); }}
          className="p-2 text-slate-500 hover:text-red-400 transition-colors">
          <LogOut size={19} />
        </button>
      </div>

      {/* ── Busca por nome (modal full-screen, sem teclado do celular) ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed inset-0 z-40 bg-slate-950 flex flex-col">
            {/* Header do modal de busca */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <Search size={16} className={cfg.text} />
                <span className="font-extrabold text-sm text-white">Selecionar Produto</span>
              </div>
              <button onClick={() => setShowSearch(false)} className="p-2 text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {/* Lista de todos os produtos — scroll e toque */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
              {items.map(item => {
                const pesado = (item.estoque_loja || 0) + (item.estoque_camara || 0) > 0;
                return (
                  <button key={item.id} onClick={() => selectProduct(item)}
                    className={clsx('flex items-center justify-between px-4 py-3.5 rounded-xl border text-left active:scale-[0.98] transition-all',
                      pesado ? `${cfg.bg} ${cfg.border}` : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    )}>
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                        pesado ? `${cfg.bg} ${cfg.text}` : 'bg-slate-800 text-slate-400'
                      )}>{item.id}</div>
                      <span className="font-bold text-white text-sm">{item.nome}</span>
                    </div>
                    {pesado
                      ? <span className={clsx('text-sm font-extrabold shrink-0', cfg.text)}>{((item.estoque_loja||0)+(item.estoque_camara||0)).toFixed(3)}kg</span>
                      : <span className="text-xs text-slate-600 font-mono shrink-0">0.000kg</span>
                    }
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── ABA: TECLADO ──────────────────────────────────────────────── */}
      {tab === 'teclado' && (
        <div className="flex-1 flex flex-col px-4 pt-4 pb-3 gap-3 overflow-hidden">

          {/* Produto selecionado */}
          <AnimatePresence>
            {foundProduct && phase === 'weight' && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={clsx('flex items-center justify-between px-4 py-3 rounded-xl border shrink-0', cfg.bg, cfg.border)}>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">Cód. {foundProduct.id}</div>
                  <div className={clsx('font-extrabold text-base', cfg.text)}>{foundProduct.nome}</div>
                </div>
                <button onClick={() => { setPhase('code'); setFoundProduct(null); setFormula(''); }}
                  className="p-1 text-slate-500 hover:text-white"><X size={16} /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 flex flex-col gap-0.5 shrink-0">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">
              {phase === 'code'   && 'Digite o código'}
              {phase === 'weight' && (location === 'loja' ? '🏪 Peso — Loja' : '🧊 Peso — Câmara')}
              {phase === 'done'   && 'Salvo!'}
            </div>
            <div className="text-right font-mono text-slate-500 text-xs min-h-[14px]">
              {phase === 'weight' && formula}
            </div>
            <div className="text-right">
              {phase === 'code' && (
                <span className="text-5xl font-black text-white tracking-widest">
                  {codeBuffer || <span className="text-slate-700">_ _ _ _</span>}
                </span>
              )}
              {phase === 'weight' && (
                <div className="flex items-baseline justify-end gap-2">
                  <span className={clsx('text-5xl font-black tracking-tighter', cfg.text)}>{total.toFixed(3)}</span>
                  <span className="text-lg font-bold text-slate-500">kg</span>
                </div>
              )}
              {phase === 'done' && (
                <div className="flex items-center justify-end gap-3 py-1">
                  <Check size={32} className={cfg.text} strokeWidth={3} />
                  <span className={clsx('text-4xl font-black', cfg.text)}>{total.toFixed(3)} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Loja/Câmara */}
          {phase === 'weight' && (
            <div className="flex bg-slate-800 rounded-xl p-1 gap-1 shrink-0">
              <button onClick={() => setLocation('loja')}
                className={clsx('flex-1 py-2 rounded-lg text-sm font-bold transition-all', location === 'loja' ? `${cfg.btn} text-white shadow` : 'text-slate-400')}>
                🏪 Loja
              </button>
              <button onClick={() => setLocation('camara')}
                className={clsx('flex-1 py-2 rounded-lg text-sm font-bold transition-all', location === 'camara' ? `${cfg.btn} text-white shadow` : 'text-slate-400')}>
                🧊 Câmara
              </button>
            </div>
          )}

          {/* Teclado numérico */}
          {phase !== 'done' && (
            <div className="grid grid-cols-3 gap-2.5 flex-1">
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} onClick={() => pressKey(String(n))}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">
                  {n}
                </button>
              ))}
              {phase === 'code' ? (
                <>
                  <button onClick={() => pressKey('C')} className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-2xl text-sm active:scale-95 transition-all">Limpar</button>
                  <button onClick={() => pressKey('0')} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">0</button>
                  <button onClick={() => pressKey('DEL')} className="bg-slate-800 active:scale-95 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-700 transition-all"><Delete size={24} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => pressKey('+')} className={clsx('font-black text-3xl rounded-2xl border active:scale-95 transition-all', cfg.bg, cfg.border, cfg.text)}>+</button>
                  <button onClick={() => pressKey('0')} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">0</button>
                  <button onClick={() => pressKey('.')} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">.</button>
                  {/* Linha extra: apagar e limpar */}
                  <button onClick={() => pressKey('DEL')} className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-2xl border border-slate-700 transition-all flex items-center justify-center">
                    <Delete size={24} />
                  </button>
                  <button onClick={() => pressKey('C')} className="col-span-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-2xl text-sm active:scale-95 transition-all">
                    Limpar tudo
                  </button>
                </>
              )}
              <button onClick={() => pressKey('OK')}
                className={clsx('col-span-3 rounded-2xl font-extrabold text-white text-xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98]', cfg.btn)}>
                {phase === 'code'                          && <><Search size={20} /> Buscar Produto</>}
                {phase === 'weight' && mode === 'balanco'  && <><Check size={22} strokeWidth={3} /> Confirmar Pesagem</>}
                {phase === 'weight' && mode === 'cozinha'  && <><ChefHat size={20} /> Confirmar Cozinha</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── ABA: HISTÓRICO ────────────────────────────────────────────── */}
      {tab === 'historico' && (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Lista de registros */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {sessionLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
                <ClipboardList size={48} className="opacity-20" />
                <p className="text-sm font-medium">Nenhum registro nesta sessão.</p>
                <p className="text-xs text-slate-700">Pese um produto para aparecer aqui.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-2">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                  {sessionLog.length} registro{sessionLog.length !== 1 ? 's' : ''} nesta sessão
                </p>
                {sessionLog.map((log, idx) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm truncate">{log.itemNome}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className={clsx('font-bold', log.mode === 'balanco' ? deptCfg.text : 'text-amber-400')}>
                          {log.mode === 'balanco' ? `⚖️ ${log.location === 'loja' ? 'Loja' : 'Câmara'}` : '🍳 Cozinha'}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span>{log.time}</span>
                        {log.formula && <span className="font-mono text-slate-600 truncate max-w-[100px]">{log.formula}</span>}
                      </div>
                    </div>
                    <span className={clsx('text-base font-extrabold shrink-0', log.mode === 'balanco' ? deptCfg.text : 'text-amber-400')}>
                      {log.kg.toFixed(3)}<span className="text-xs text-slate-500 ml-0.5">kg</span>
                    </span>
                    <button onClick={() => { setEditingLog({ index: idx, entry: log }); setEditFormula(log.formula); }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteLog(idx)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Botões de Finalizar ─────────────────────────────────── */}
          {sessionLog.length > 0 && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-950 shrink-0 flex flex-col gap-2">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-1">Finalizar sessão</p>

              {/* Finalizar Balanço */}
              {sessionLog.some(l => l.mode === 'balanco') && (
                <div className={clsx('rounded-2xl border p-3 flex flex-col gap-2', deptCfg.bg, deptCfg.border)}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className={deptCfg.text} />
                    <span className={clsx('text-sm font-extrabold', deptCfg.text)}>Finalizar Balanço</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {sessionLog.filter(l => l.mode === 'balanco').length} itens
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        exportarVR(items, new Date().toLocaleDateString('pt-BR'));
                        toast.success('TXT VR gerado!');
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                    >
                      <FileText size={14} className="text-blue-400" /> TXT VR
                    </button>
                    <button
                      onClick={() => {
                        const ws = XLSX.utils.json_to_sheet(
                          sessionLog.filter(l => l.mode === 'balanco').map(l => ({
                            Código: l.itemId, Produto: l.itemNome,
                            Local: l.location === 'loja' ? 'Loja' : 'Câmara',
                            'Peso (kg)': l.kg.toFixed(3), Fórmula: l.formula, Hora: l.time
                          }))
                        );
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Balanço');
                        XLSX.writeFile(wb, `${gerarNomeArquivo('balanco', new Date().toLocaleDateString('pt-BR'))}.xlsx`);
                        toast.success('Excel gerado!');
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-400" /> Excel
                    </button>
                  </div>
                </div>
              )}

              {/* Finalizar Cozinha */}
              {sessionLog.some(l => l.mode === 'cozinha') && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-600/10 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ChefHat size={16} className="text-amber-400" />
                    <span className="text-sm font-extrabold text-amber-400">Finalizar Cozinha</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {sessionLog.filter(l => l.mode === 'cozinha').length} itens
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(
                        sessionLog.filter(l => l.mode === 'cozinha').map(l => ({
                          Código: l.itemId, Produto: l.itemNome,
                          'Peso (kg)': l.kg.toFixed(3), Fórmula: l.formula, Hora: l.time
                        }))
                      );
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Cozinha');
                      XLSX.writeFile(wb, `${gerarNomeArquivo('cozinha', new Date().toLocaleDateString('pt-BR'))}.xlsx`);
                      toast.success('Relatório Cozinha gerado!');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all active:scale-95"
                  >
                    <FileSpreadsheet size={14} className="text-amber-400" /> Exportar Excel Cozinha
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Modal de edição ───────────────────────────────────────────── */}
      <AnimatePresence>
        {editingLog && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Editando</div>
                <div className={clsx('font-extrabold text-lg leading-tight', cfg.text)}>{editingLog.entry.itemNome}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {editingLog.entry.mode === 'balanco'
                    ? `⚖️ Balanço · ${editingLog.entry.location === 'loja' ? 'Loja' : 'Câmara'}`
                    : '🍳 Cozinha'}
                </div>
              </div>
              <button onClick={() => { setEditingLog(null); setEditFormula(''); }} className="p-2 text-slate-500 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 flex flex-col gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shrink-0">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Novo peso</div>
                <div className="font-mono text-slate-500 text-xs text-right min-h-[14px]">{editFormula || '—'}</div>
                <div className="flex items-baseline justify-end gap-2 mt-1">
                  <span className={clsx('text-5xl font-black tracking-tighter', editingLog.entry.mode === 'balanco' ? deptCfg.text : 'text-amber-400')}>{editTotal.toFixed(3)}</span>
                  <span className="text-xl font-bold text-slate-500">kg</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 flex-1">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} onClick={() => setEditFormula(p => p + n)}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">
                    {n}
                  </button>
                ))}
                <button onClick={() => setEditFormula(p => p + '+')}
                  className={clsx('font-black text-3xl rounded-2xl border active:scale-95 transition-all', cfg.bg, cfg.border, cfg.text)}>+</button>
                <button onClick={() => setEditFormula(p => p + '0')}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-3xl font-bold rounded-2xl border border-slate-700 transition-all">0</button>
                <button onClick={() => setEditFormula(p => p.slice(0, -1))}
                  className="bg-slate-800 active:scale-95 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-700 transition-all">
                  <Delete size={22} />
                </button>
                <button onClick={saveEdit}
                  className={clsx('col-span-3 rounded-2xl font-extrabold text-white text-xl flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]',
                    editingLog.entry.mode === 'balanco' ? deptCfg.btn : 'bg-amber-600 hover:bg-amber-500'
                  )}>
                  <Check size={22} strokeWidth={3} /> Salvar Correção
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
