import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Calculator, LogOut, ArrowRight, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function StoreSelect() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [userName, setUserName] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('@acougue/isAuthenticated');
    if (!isAuth) {
      navigate('/login', { replace: true });
      return;
    }

    const raw = localStorage.getItem('@acougue/availableStores');
    if (raw) {
      try { setStores(JSON.parse(raw)); } catch (_) {}
    } else {
      // Fallback: user came from old login flow — build from known store
      const store = localStorage.getItem('@acougue/currentStore');
      if (store) setStores([store]);
      else navigate('/dashboard', { replace: true });
    }

    setUserName(localStorage.getItem('@acougue/userName') || '');
    setNetworkName(localStorage.getItem('@acougue/networkName') || '');
  }, [navigate]);

  const handleSelectStore = (store) => {
    if (isEntering) return;
    setSelectedStore(store);
    setIsEntering(true);
    localStorage.setItem('@acougue/currentStore', store);
    setTimeout(() => navigate('/dashboard', { replace: true }), 700);
  };

  const handleLogout = () => {
    localStorage.removeItem('@acougue/isAuthenticated');
    localStorage.removeItem('@acougue/availableStores');
    localStorage.removeItem('@acougue/currentStore');
    localStorage.removeItem('@acougue/userName');
    localStorage.removeItem('@acougue/networkName');
    navigate('/', { replace: true });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] } },
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-15%] right-[-10%] w-[55vw] h-[55vw] bg-blue-600/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-indigo-600/8 rounded-full blur-[110px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/50">
              <Calculator className="text-blue-500" size={16} />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-100">
              Balanço<span className="text-blue-500 font-extrabold">Digital</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50"
          >
            <LogOut size={14} />
            Desconectar
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-24 pb-16 px-4 min-h-screen flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 max-w-xl"
        >
          {networkName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider mb-4">
              <Building2 size={12} />
              {networkName}
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {userName ? `Bem-vindo, ${userName}!` : 'Seleção de Ponto de Venda'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {stores.length > 0 ? (
              <span className="text-blue-400 font-semibold">
                O sistema importou as {stores.length} lojas que você configurou no chat.
              </span>
            ) : null}
            <br />
            {stores.length > 1
              ? `Selecione abaixo a unidade para auditoria hoje.`
              : 'Selecione abaixo o ponto de venda para iniciar o apontamento.'}
          </p>
        </motion.div>

        {stores.length === 0 ? (
          <div className="text-slate-600 text-sm">Carregando lojas...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={clsx(
              'w-full max-w-3xl grid gap-3',
              stores.length === 1 ? 'grid-cols-1 max-w-sm' :
              stores.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-lg' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {stores.map((store, i) => {
              const isSelected = selectedStore === store;
              return (
                <motion.button
                  key={store}
                  variants={cardVariants}
                  onClick={() => handleSelectStore(store)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isEntering}
                  className={clsx(
                    'relative group text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-sm overflow-hidden',
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/70 shadow-[0_0_30px_rgba(37,99,235,0.25)]'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)] hover:border-blue-500/30'
                  )}
                >
                  {/* Glow on hover */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={clsx(
                        'w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0 transition-all',
                        isSelected
                          ? 'bg-blue-600/30 border-blue-500/50'
                          : 'bg-slate-800/80 border-slate-700/60 group-hover:bg-blue-900/30 group-hover:border-blue-800/60'
                      )}
                    >
                      {isSelected ? (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Store size={20} className="text-blue-400" />
                        </motion.div>
                      ) : (
                        <Store size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <ArrowRight
                        size={16}
                        className="text-slate-600 group-hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 shrink-0 mt-1"
                      />
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      PDV {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className={clsx(
                      'font-bold text-sm leading-snug transition-colors',
                      isSelected ? 'text-blue-300' : 'text-white group-hover:text-blue-200'
                    )}>
                      {store}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">
                      Toque para iniciar o apontamento
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
