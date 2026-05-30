import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Início', href: '/#inicio' },
    { name: 'Sobre', href: '/#sobre' },
    { name: 'Planos', href: '/#planos' },
    { name: 'Contato', href: '/#contato' }
  ];

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-[50] transition-all duration-300">
        <div className="backdrop-blur-md bg-slate-950/60 border border-white/10 rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>

          {/* Logo */}
          <div onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="cursor-pointer relative z-10">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center gap-8 relative z-10">
            {navLinks.map((item) => (
              <a 
                key={item.name} 
                href={item.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3 relative z-10">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-all px-4 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-sm font-bold text-white transition-all px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-500/50 hover:border-blue-400/60 shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
            >
              Começar Agora <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative z-10 p-2 text-slate-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-xl flex flex-col pt-28 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((item) => (
                <a 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-bold text-slate-400 hover:text-white transition-colors border-b border-white/5 pb-4"
                >
                  {item.name}
                </a>
              ))}
              
              <div className="flex flex-col gap-4 mt-8">
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold text-xl hover:bg-white/5 transition-all text-center"
                >
                  Entrar
                </button>
                <button
                  onClick={() => { navigate('/onboarding'); setIsMenuOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  Começar Agora <ArrowRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="mt-auto mb-10 text-center">
              <p className="text-sm text-slate-500 font-medium">TenTech S/A • 2026</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
