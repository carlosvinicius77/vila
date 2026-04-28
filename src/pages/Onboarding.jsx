import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, Minus, Plus, Eye, EyeOff, CheckCircle2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { PublicNavbar } from '../components/PublicNavbar';

// ─── Typing indicator bubble ───────────────────────────────────────────────────
function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className="flex items-end gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
        <Bot size={14} className="text-blue-400" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-md bg-slate-800/60 border border-slate-700/60 shadow-lg">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full block"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Bot message bubble ─────────────────────────────────────────────────────────
function BotBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
      className="flex items-end gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
        <Bot size={14} className="text-blue-400" />
      </div>
      <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-sm backdrop-blur-md bg-slate-800/60 border border-slate-700/60 shadow-lg text-sm text-slate-200 leading-relaxed">
        {text}
      </div>
    </motion.div>
  );
}

// ─── User reply bubble ──────────────────────────────────────────────────────────
function UserBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-blue-600/80 border border-blue-500/50 shadow-lg shadow-blue-500/10 text-sm text-white font-medium">
        {text}
      </div>
    </motion.div>
  );
}

// ─── Progress bar ───────────────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  return (
    <div className="px-6 pt-5 pb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Passo {step} de {total}
        </span>
        <span className="text-[10px] font-bold text-blue-400">
          {Math.round((step / total) * 100)}% concluído
        </span>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(step / total) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.04, 0.62, 0.23, 0.98] }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'w-1.5 h-1.5 rounded-full transition-all duration-500',
              i < step ? 'bg-blue-500' : 'bg-slate-700'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── STEPS CONFIG ───────────────────────────────────────────────────────────────
const TOTAL_STEPS = 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasInitialized = useRef(false);

  const [step, setStep] = useState(0); // 0 = initial greeting, 1-4 = steps
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [messages, setMessages] = useState([]); // { role: 'bot'|'user', text: string }

  // Form data
  const [userName, setUserName] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [storeCount, setStoreCount] = useState(3);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const STEP_QUESTIONS = {
    1: 'Olá! 👋 Para configurar seu Balanço Digital, como posso te chamar?',
    2: (name) => `Prazer, ${name}! 😊 Qual o nome da sua rede de supermercados?`,
    3: (net) => `Entendi, ${net}! ✨ E quantas lojas você deseja gerenciar com nosso sistema hoje?`,
    4: () => 'Perfeito! 🎉 Para finalizar seu acesso corporativo, digite seu melhor e-mail e crie uma senha segura.',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text, delayMs = 900) => {
    return new Promise((resolve) => {
      // Prevent duplicate messages if added too fast
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].text === text) return prev;
        setIsTyping(true);
        setShowInput(false);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((p) => {
            if (p.length > 0 && p[p.length - 1].text === text) return p;
            return [...p, { role: 'bot', text }];
          });
          setTimeout(() => {
            setShowInput(true);
            resolve();
          }, 350);
        }, delayMs);
        return prev;
      });
    });
  };

  // Clear any stale session so user can onboard fresh
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Always clear auth state when starting onboarding
    localStorage.removeItem('@acougue/isAuthenticated');
    localStorage.removeItem('@acougue/currentStore');
    localStorage.removeItem('@acougue/availableStores');
    localStorage.removeItem('@acougue/userName');
    localStorage.removeItem('@acougue/networkName');
    
    addBotMessage(STEP_QUESTIONS[1], 1200).then(() => setStep(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showInput]);

  useEffect(() => {
    if (showInput && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showInput, step]);

  // ─── Step handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting || isTyping) return;
    setInputError('');

    if (step === 1) {
      const val = inputValue.trim();
      if (!val) { setInputError('Por favor, insira seu nome.'); return; }
      setUserName(val);
      setMessages((prev) => [...prev, { role: 'user', text: val }]);
      setInputValue('');
      setStep(2);
      await addBotMessage(STEP_QUESTIONS[2](val));
    } else if (step === 2) {
      const val = inputValue.trim();
      if (!val) { setInputError('Por favor, insira o nome da sua rede.'); return; }
      setNetworkName(val);
      setMessages((prev) => [...prev, { role: 'user', text: val }]);
      setInputValue('');
      setStep(3);
      await addBotMessage(STEP_QUESTIONS[3](val));
    } else if (step === 3) {
      if (storeCount < 1) { setInputError('Mínimo de 1 loja.'); return; }
      if (storeCount > 100) { setInputError('Máximo de 100 lojas por vez.'); return; }
      const label = storeCount === 1 ? '1 loja' : `${storeCount} lojas`;
      setMessages((prev) => [...prev, { role: 'user', text: label }]);
      setStep(4);
      await addBotMessage(STEP_QUESTIONS[4]());
    } else if (step === 4) {
      if (!email) { setInputError('E-mail é obrigatório.'); return; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { setInputError('E-mail inválido.'); return; }
      if (!password || password.length < 6) { setInputError('Senha deve ter no mínimo 6 caracteres.'); return; }

      setIsSubmitting(true);
      setShowInput(false);
      setIsTyping(true);
      setMessages((prev) => [...prev, { role: 'user', text: `${email} • ${'•'.repeat(password.length)}` }]);

      // Simulate account creation
      await new Promise((r) => setTimeout(r, 1400));
      setIsTyping(false);

      const netName = networkName || 'Rede';
      const stores = Array.from({ length: storeCount }, (_, i) =>
        `${netName} - Loja ${String(i + 1).padStart(2, '0')}`
      );

      const successMsg = `Conta criada com sucesso, ${userName}! 🚀 ${stores.length > 1 ? `Suas ${stores.length} lojas foram configuradas` : 'Sua loja foi configurada'} e estão prontas para uso. Redirecionando...`;
      setMessages((prev) => [...prev, { role: 'bot', text: successMsg }]);
      setStep(5); // done

      localStorage.setItem('@acougue/isAuthenticated', 'true');
      localStorage.setItem('@acougue/userName', userName);
      localStorage.setItem('@acougue/networkName', netName);
      localStorage.setItem('@acougue/availableStores', JSON.stringify(stores));
      
      // PERSISTENCE: Save to mock users DB
      const existingUsers = JSON.parse(localStorage.getItem('@acougue/users_db') || '[]');
      const userExists = existingUsers.some(u => u.email === email);
      
      if (!userExists) {
        const newUser = {
          email,
          password,
          userName,
          networkName: netName,
          storeCount: storeCount
        };
        localStorage.setItem('@acougue/users_db', JSON.stringify([...existingUsers, newUser]));
      }

      setTimeout(() => navigate('/store-select', { replace: true }), 2000);
    }
  };

  const handleKeyDown = (e) => {
    // Redundant as form onSubmit handles Enter, 
    // but kept as safety for non-form cases if any.
    if (e.key === 'Enter' && step !== 4) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentStep = Math.min(step, TOTAL_STEPS);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <PublicNavbar />
      
      {/* Background glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Spacing for Navbar */}
      <div className="h-20 shrink-0" />

      {/* Chat card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
        className="w-full max-w-md backdrop-blur-md bg-slate-900/70 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* Progress bar */}
        <div className="border-b border-slate-800/80 shrink-0">
          <ProgressBar step={currentStep} total={TOTAL_STEPS} />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-[240px]"
          style={{ scrollbarWidth: 'none' }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) =>
              msg.role === 'bot'
                ? <BotBubble key={i} text={msg.text} />
                : <UserBubble key={i} text={msg.text} />
            )}
            {isTyping && <TypingBubble key="typing" />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <AnimatePresence>
          {showInput && step >= 1 && step <= 4 && (
            <motion.div
              key={`input-${step}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-800/80 p-4 shrink-0"
            >
              {/* Step 1 & 2: text input */}
              {(step === 1 || step === 2) && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setInputError(''); }}
                    placeholder={step === 1 ? 'Seu nome...' : 'Nome da rede...'}
                    className="flex-1 bg-slate-800/70 border border-slate-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-600 transition-all"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20 shrink-0"
                  >
                    <ArrowRight size={18} className="text-white" />
                  </button>
                </form>
              )}

              {/* Step 3: store count selector */}
              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => { setStoreCount((v) => Math.max(1, v - 1)); setInputError(''); }}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Minus size={20} className="text-slate-300" />
                    </button>
                    <div className="flex flex-col items-center">
                      <motion.span
                        key={storeCount}
                        initial={{ scale: 0.85, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-5xl font-black text-white tabular-nums w-24 text-center leading-none"
                      >
                        {storeCount}
                      </motion.span>
                      <span className="text-xs text-slate-500 mt-1 font-medium">
                        {storeCount === 1 ? 'loja' : 'lojas'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStoreCount((v) => Math.min(100, v + 1)); setInputError(''); }}
                      className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all active:scale-95"
                    >
                      <Plus size={20} className="text-slate-300" />
                    </button>
                  </div>
                  {/* Quick select chips */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[1, 3, 5, 10, 15, 20].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => { setStoreCount(n); setInputError(''); }}
                        className={clsx(
                          'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                          storeCount === n
                            ? 'bg-blue-600 text-white border border-blue-500'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-blue-500/50'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                  >
                    Confirmar {storeCount} {storeCount === 1 ? 'loja' : 'lojas'} <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Step 4: email + password */}
              {step === 4 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setInputError(''); }}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-800/70 border border-slate-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-600 transition-all"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setInputError(''); }}
                      placeholder="Crie uma senha segura..."
                      className="w-full bg-slate-800/70 border border-slate-700/80 text-white rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-600 transition-all tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><CheckCircle2 size={16} /> Criar Minha Conta Corporativa</>
                    )}
                  </button>
                </form>
              )}

              {inputError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-2 font-medium text-center"
                >
                  {inputError}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-5 text-xs text-slate-600"
      >
        Já possui conta?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
        >
          Entrar agora
        </button>
      </motion.p>
    </div>
  );
}
