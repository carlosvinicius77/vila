import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Beef, Package, Apple, ShieldCheck, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = [
  {
    key: 'Acougue',
    label: 'Açougue',
    emoji: '🥩',
    icon: Beef,
    color: 'blue',
    bg: 'bg-blue-600/10',
    border: 'border-blue-500/40',
    activeBorder: 'border-blue-500',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30',
  },
  {
    key: 'Frios',
    label: 'Frios',
    emoji: '📦',
    icon: Package,
    color: 'yellow',
    bg: 'bg-yellow-600/10',
    border: 'border-yellow-500/40',
    activeBorder: 'border-yellow-500',
    glow: 'shadow-yellow-500/20',
    text: 'text-yellow-400',
    btn: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/30',
  },
  {
    key: 'Hortifruti',
    label: 'Hortifruti',
    emoji: '🍎',
    icon: Apple,
    color: 'emerald',
    bg: 'bg-emerald-600/10',
    border: 'border-emerald-500/40',
    activeBorder: 'border-emerald-500',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=setor, 2=tipo acesso, 3=senha gerencia
  const [selectedDept, setSelectedDept] = useState(null);
  const [accessType, setAccessType] = useState(null); // 'normal' | 'gerencia'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('@acougue/isAuthenticated');
    const role = localStorage.getItem('@acougue/role');
    if (isAuth) {
      navigate(role === 'gerencia' ? '/dashboard' : '/quick-entry', { replace: true });
    }
  }, [navigate]);

  const dept = DEPARTMENTS.find(d => d.key === selectedDept);

  const handleSelectDept = (key) => {
    setSelectedDept(key);
    setStep(2);
  };

  const handleSelectAccess = (type) => {
    setAccessType(type);
    if (type === 'normal') {
      // Acesso normal não precisa de senha
      localStorage.setItem('@acougue/isAuthenticated', 'true');
      localStorage.setItem('@acougue/role', 'normal');
      localStorage.setItem('@acougue/currentDept', selectedDept);
      navigate('/quick-entry', { replace: true });
    } else {
      setStep(3);
    }
  };

  const handleGerenciaLogin = (e) => {
    e.preventDefault();
    setPwError('');
    if (!password) { setPwError('Digite a senha de gerência'); return; }

    setIsLoading(true);

    // Verifica usuários cadastrados
    const users = JSON.parse(localStorage.getItem('@acougue/users_db') || '[]');
    const user = users.find(u => u.password === password);

    setTimeout(() => {
      setIsLoading(false);
      if (user || password === 'admin123') {
        localStorage.setItem('@acougue/isAuthenticated', 'true');
        localStorage.setItem('@acougue/role', 'gerencia');
        localStorage.setItem('@acougue/currentDept', selectedDept);
        localStorage.setItem('@acougue/currentStore', user?.networkName || 'Loja Principal');
        localStorage.setItem('@acougue/availableStores', JSON.stringify([user?.networkName || 'Loja Principal']));
        toast.success('Acesso de gerência autorizado!');
        navigate('/dashboard', { replace: true });
      } else {
        setPwError('Senha incorreta');
        toast.error('Senha de gerência inválida');
      }
    }, 800);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Background glows */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/6 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Balanço<span className="text-blue-400">Digital</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Sistema de inventário de perecíveis</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* Step indicator */}
          <div className="flex border-b border-slate-800">
            {[1, 2, 3].map(s => (
              <div key={s} className={clsx(
                'flex-1 h-1 transition-all duration-500',
                step >= s ? (dept ? `bg-${dept.color}-500` : 'bg-blue-500') : 'bg-slate-800'
              )} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* STEP 1 — Selecionar setor */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Passo 1 de 3</p>
                <h2 className="text-xl font-extrabold text-white mb-1">Qual setor?</h2>
                <p className="text-sm text-slate-400 mb-6">Selecione o setor que você vai trabalhar.</p>

                <div className="flex flex-col gap-3">
                  {DEPARTMENTS.map(d => (
                    <button
                      key={d.key}
                      onClick={() => handleSelectDept(d.key)}
                      className={clsx(
                        'flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] text-left',
                        d.bg, d.border,
                        'hover:shadow-lg', `hover:${d.glow}`, 'hover:border-opacity-80'
                      )}
                    >
                      <span className="text-3xl">{d.emoji}</span>
                      <div>
                        <div className={clsx('font-extrabold text-base', d.text)}>{d.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {d.key === 'Acougue' && 'Bovinos, Aves, Suínos e mais'}
                          {d.key === 'Frios' && 'Queijos, Embutidos, Laticínios'}
                          {d.key === 'Hortifruti' && 'Frutas, Legumes, Folhagens'}
                        </div>
                      </div>
                      <ArrowRight size={16} className="ml-auto text-slate-600" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Tipo de acesso */}
            {step === 2 && dept && (
              <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6">
                <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-300 mb-4 flex items-center gap-1 transition-colors">
                  ← voltar
                </button>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Passo 2 de 3</p>
                <h2 className="text-xl font-extrabold text-white mb-1">
                  <span className={dept.text}>{dept.emoji} {dept.label}</span>
                </h2>
                <p className="text-sm text-slate-400 mb-6">Como você vai acessar o sistema?</p>

                <div className="flex flex-col gap-3">
                  {/* Acesso Normal */}
                  <button
                    onClick={() => handleSelectAccess('normal')}
                    className="flex items-center gap-4 p-5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/70 transition-all active:scale-[0.98] text-left"
                  >
                    <div className="w-11 h-11 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={22} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-base">Acesso Normal</div>
                      <div className="text-xs text-slate-400 mt-0.5">Pesagem rápida por código</div>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600" />
                  </button>

                  {/* Gerência */}
                  <button
                    onClick={() => handleSelectAccess('gerencia')}
                    className={clsx(
                      'flex items-center gap-4 p-5 rounded-xl border transition-all active:scale-[0.98] text-left',
                      dept.bg, dept.border, `hover:shadow-lg hover:${dept.glow}`
                    )}
                  >
                    <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', dept.bg, `border ${dept.border}`)}>
                      <ShieldCheck size={22} className={dept.text} />
                    </div>
                    <div>
                      <div className={clsx('font-extrabold text-base', dept.text)}>Gerência / Prevenção</div>
                      <div className="text-xs text-slate-400 mt-0.5">Acesso completo ao sistema</div>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-slate-600" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Senha de gerência */}
            {step === 3 && dept && (
              <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-6">
                <button onClick={() => setStep(2)} className="text-xs text-slate-500 hover:text-slate-300 mb-4 flex items-center gap-1 transition-colors">
                  ← voltar
                </button>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Passo 3 de 3</p>
                <h2 className="text-xl font-extrabold text-white mb-1">Senha de Gerência</h2>
                <p className="text-sm text-slate-400 mb-6">
                  <span className={dept.text}>{dept.emoji} {dept.label}</span> — Acesso completo
                </p>

                <form onSubmit={handleGerenciaLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setPwError(''); }}
                        placeholder="••••••••"
                        autoFocus
                        className={clsx(
                          'w-full pl-4 pr-12 py-3.5 rounded-xl border bg-slate-800/60 text-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-600 tracking-wider text-lg',
                          pwError ? 'border-red-500/60 focus:ring-red-500/40' : `border-slate-700 focus:${dept.activeBorder} focus:ring-${dept.color}-500/30`
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {pwError && <p className="text-red-400 text-xs mt-2 font-medium">{pwError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={clsx(
                      'w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg mt-2',
                      dept.btn
                    )}
                  >
                    {isLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><ShieldCheck size={18} /> Entrar como Gerência</>
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-slate-600 mt-4">
                  Senha padrão: <span className="text-slate-400 font-mono">admin123</span>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
