import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, ArrowRight, LockKeyhole, Building2, Workflow } from 'lucide-react';
import { clsx } from 'clsx';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../components/Logo';
import { PublicNavbar } from '../components/PublicNavbar';

export default function Login() {
  const navigate = useNavigate();

  // UX States
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    store: ''
  });
  const [errors, setErrors] = useState({});
  const [availableStores, setAvailableStores] = useState([]);

  useEffect(() => {
    // If they are already authenticated, redirect to dashboard.
    const isAuth = localStorage.getItem("@acougue/isAuthenticated");
    if (isAuth) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const STORES_MOCK_DB = {
    "padrao": ["Supermercado Central", "Loja Bairro Norte"],
    "grande_rede": [
      "Hipermercado Rede (Matriz)", 
      "Filial Centro", 
      "Filial Sul", 
      "Express Shopping", 
      "CD (Centro de Distribuição)"
    ]
  };

  const fakeApiFetchStores = async (email, password) => {
    return new Promise((resolve, reject) => {
       setTimeout(() => {
          const users = JSON.parse(localStorage.getItem('@acougue/users_db') || '[]');
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            const netName = user.networkName || 'Rede';
            const stores = Array.from({ length: user.storeCount || 2 }, (_, i) =>
              `${netName} - Loja ${String(i + 1).padStart(2, '0')}`
            );
            resolve({ stores, userName: user.userName, networkName: netName });
          } else if (email.includes("rede") || email.includes("hiper")) {
             // Fallback for demo emails
             resolve({ 
               stores: STORES_MOCK_DB.grande_rede, 
               userName: 'Gestor Matriz', 
               networkName: 'Hiper Rede' 
             });
          } else {
             reject(new Error('Credenciais inválidas.'));
          }
       }, 1500);
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'E-mail corporativo é obrigatório';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    
    if (!formData.password) newErrors.password = 'Senha é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    
    // Authenticating and fetching stores from mock DB
    try {
      const authResult = await fakeApiFetchStores(formData.email, formData.password);
      setAvailableStores(authResult.stores);
      
      // Save info to session
      localStorage.setItem('@acougue/isAuthenticated', 'true');
      localStorage.setItem('@acougue/availableStores', JSON.stringify(authResult.stores));
      localStorage.setItem('@acougue/userName', authResult.userName);
      localStorage.setItem('@acougue/networkName', authResult.networkName);
      
      toast.success('Credenciais validadas. Buscando unidades...');
      setStep(2);
    } catch (e) {
      toast.error(e.message || 'Erro na comunicação com a Matriz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalLogin = (e) => {
    e.preventDefault();
    if (!formData.store) {
       setErrors({ store: 'Selecione uma Unidade baseada na Matriz.' });
       return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('@acougue/currentStore', formData.store);
      toast.success(`Acesso autorizado: ${formData.store}`);
      navigate('/dashboard', { replace: true });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-center" richColors theme="dark" />
      
      <PublicNavbar />

      {/* Background Central Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none opacity-50"></div>


      <div className="z-10 flex flex-col items-center">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, ease: "easeOut" }}
           className="w-full max-w-md glass-panel rounded-2xl overflow-hidden relative flex flex-col"
        >
        
        {/* Dynamic Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-800/80 bg-slate-900/50 transition-colors">
            <div className="flex flex-col items-center mb-6 scale-90 opacity-80">
               <Logo iconSize={24} textSize="text-xl" />
            </div>
           <div className="mx-auto w-14 h-14 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10 transition-all">
              {step === 1 ? <LockKeyhole className="text-blue-500" size={28} /> : <Workflow className="text-emerald-500" size={28} />}
           </div>
           <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {step === 1 ? "Acesso Corporativo" : "Seleção de Instância"}
           </h2>
           <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              {step === 1 
                 ? "Plataforma SaaS para balanços unificados." 
                 : `Olá, ${formData.email.split('@')[0]}. Selecione a unidade para auditoria.`}
           </p>
        </div>

        <div className="relative overflow-hidden min-h-[300px]">
           <AnimatePresence mode="wait">
              {/* STEP 1: CREDENTIALS */}
              {step === 1 && (
                 <motion.form 
                   key="step1"
                   onSubmit={handleStep1Submit} 
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   transition={{ duration: 0.3 }}
                   className="p-8 space-y-6"
                 >
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">E-mail Operacional</label>
                     <input 
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       placeholder="Seu e-mail da rede"
                       className={clsx(
                         "w-full px-4 py-3 rounded-xl border bg-slate-900/80 text-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-600",
                         errors.email ? "border-red-500/50 focus:ring-red-500/50" : "border-slate-700/80 focus:border-blue-500/80 focus:ring-blue-500/50"
                       )}
                     />
                     {errors.email && <p className="text-red-400 text-xs mt-2 font-medium">{errors.email}</p>}
                   </div>

                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Senha do VR</label>
                     <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"}
                         value={formData.password}
                         onChange={(e) => setFormData({...formData, password: e.target.value})}
                         placeholder="••••••••"
                         className={clsx(
                           "w-full pl-4 pr-12 py-3 rounded-xl border bg-slate-900/80 text-white focus:ring-1 focus:outline-none transition-all placeholder:text-slate-600 tracking-wider",
                           errors.password ? "border-red-500/50 focus:ring-red-500/50" : "border-slate-700/80 focus:border-blue-500/80 focus:ring-blue-500/50"
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
                     {errors.password && <p className="text-red-400 text-xs mt-2 font-medium">{errors.password}</p>}
                   </div>

                   <button 
                     type="submit"
                     disabled={isLoading}
                     className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-8 shadow-lg shadow-blue-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
                   >
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>Validar e Buscar Lojas <ArrowRight size={18} /></>
                     )}
                   </button>
                 </motion.form>
              )}

              {/* STEP 2: DYNAMIC STORE SELECTION */}
              {step === 2 && (
                 <motion.form 
                   key="step2"
                   onSubmit={handleFinalLogin} 
                   initial={{ opacity: 0, x: 50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 50 }}
                   transition={{ duration: 0.4 }}
                   className="p-8 space-y-6 flex-1 flex flex-col justify-center"
                 >
                   <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex items-start gap-4 mb-2">
                     <Building2 className="text-blue-500 shrink-0 mt-0.5" size={20} />
                     <div>
                        <span className="text-sm font-bold text-white block mb-0.5">Sincronização Ativa</span>
                        <p className="text-xs text-slate-400">O sistema importou {availableStores.length} lojas licenciadas conectadas ao seu banco de dados empresarial.</p>
                     </div>
                   </div>

                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Ponto de Venda Alvo</label>
                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500">
                           <Store size={18} />
                        </div>
                        <select 
                          value={formData.store}
                          onChange={(e) => setFormData({...formData, store: e.target.value})}
                          className={clsx(
                            "w-full pl-11 pr-10 py-3.5 rounded-xl border appearance-none text-white focus:ring-1 focus:outline-none transition-all font-semibold",
                            errors.store 
                              ? "bg-slate-900/80 border-red-500/50 focus:ring-red-500/50" 
                              : "bg-emerald-950/20 border-emerald-900/50 focus:border-emerald-500/80 focus:ring-emerald-500/50"
                          )}
                        >
                          <option value="" disabled className="bg-slate-900 text-slate-500">Selecione onde atuar...</option>
                          {availableStores.map(store => (
                            <option key={store} value={store} className="bg-slate-800 text-white font-medium">{store}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
                     </div>
                     {errors.store && <p className="text-red-400 text-xs mt-2 font-medium">{errors.store}</p>}
                   </div>

                   <button 
                     type="submit"
                     disabled={isLoading || !formData.store}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:active:scale-100 mt-4 shadow-lg shadow-emerald-500/20 shadow-[inset_0_1px_rgba(255,255,255,0.2)]"
                   >
                     {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     ) : (
                        <>Iniciar Apontamento SaaS <ArrowRight size={18} /></>
                     )}
                   </button>
                 </motion.form>
              )}
           </AnimatePresence>
        </div>

        <div className="border-t border-slate-800/80 p-4 text-center bg-slate-900/30">
           <button 
             type="button"
             onClick={() => step === 2 ? setStep(1) : navigate('/')} 
             className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1 mx-auto"
           >
             {step === 2 ? "Voltar ao Login Seguro" : "Retornar ao Portal Principal"}
           </button>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
