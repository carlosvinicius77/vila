import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, CheckCircle2, Bot, ScanLine, Code2, Layers, ShieldCheck, HelpCircle, Mail, MapPin } from 'lucide-react';
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Logo } from "../components/Logo";
import { PublicNavbar } from "../components/PublicNavbar";

export default function Landing() {
  const navigate = useNavigate();

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.04, 0.62, 0.23, 0.98] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Radial Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none opacity-40 z-0"></div>

      {/* Navbar component */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-4 relative z-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUpVariant}
            className="flex flex-col items-center z-20 w-full max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-[0.2em] mb-8 backdrop-blur-sm">
              <ScanLine size={14} className="text-blue-500" /> SCALE SAAS PLATFORM
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.95] mb-8">
              Controle seu estoque com <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">inteligência</span>.
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-slate-400 mb-12 leading-relaxed font-medium max-w-2xl">
              O TenTech transforma o inventário do seu <span className="text-slate-200">Açougue, Frios e Hortifruti</span> em um processo rápido, digital e sem erros.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center">
              <button 
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.25)] active:scale-95 group"
              >
                Começar Agora 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 backdrop-blur-md"
              >
                Falar com Consultor <Mail size={20} />
              </button>
            </div>
          </motion.div>

          {/* SaaS Mockup Simulation — Centered Below for Mobile/Mid, Adaptive for LG */}
          <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
             className="relative z-10 mt-20 w-full flex justify-center"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full"></div>
             
             <div className="w-full max-w-[340px] h-[680px] bg-slate-900 border border-slate-800 rounded-[3rem] p-3 shadow-2xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-xl z-20 shadow-sm border-b border-x border-slate-800"></div>
                
                <div className="w-full h-full bg-slate-950 rounded-[2.5rem] overflow-hidden relative flex flex-col border border-slate-800/50">
                  <div className="px-5 pt-12 pb-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center backdrop-blur-md">
                     <span className="font-bold text-white text-lg tracking-tight">🥩 Bovinos</span>
                     <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-1 rounded">Rede: Matriz</span>
                  </div>
                  
                  <div className="p-4 bg-slate-900/40 border-b border-slate-800/80">
                     <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-white">Coxão Mole</span>
                        <span className="text-sm font-semibold tracking-wider text-emerald-400">30.000kg</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-2.5">
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Loja</span>
                           <div className="font-mono text-white">15.000kg</div>
                        </div>
                        <div className="bg-slate-800/50 border border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.1)] rounded-lg p-2.5">
                           <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">Câmara</span>
                           <div className="font-mono text-white flex items-center justify-between">
                              <span>15.000kg</span>
                              <div className="w-1.5 h-4 bg-blue-500 animate-pulse rounded-[1px]"></div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-3 bg-slate-900 border border-slate-700/80 rounded-xl p-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl"></div>
                        <div className="text-xs text-slate-400 mb-1 flex justify-between">
                           <span>Equação:</span>
                           <span className="font-mono">10 + 5</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mt-2">
                           {[7,8,9,'+', 4,5,6,'-', 1,2,3,'C', '.',0,'=','Enter'].map(btn => (
                              <div key={btn} className={clsx(
                                 "h-8 flex items-center justify-center font-bold text-xs rounded transition-colors",
                                 btn === 'Enter' ? "col-span-2 bg-blue-600 text-white" : 
                                 btn === '+' || btn === '-' || btn === '=' ? "bg-slate-800 text-blue-400" :
                                 btn === 'C' ? "bg-slate-800 text-red-400" :
                                 "bg-slate-800/60 text-slate-300"
                              )}>
                                 {btn}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-4 bg-slate-950 border-b border-slate-900 flex justify-between items-center opacity-60">
                     <span className="font-bold text-slate-300">Patinho</span>
                     <span className="text-xs font-semibold text-slate-500">0.000kg</span>
                  </div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-700/50 rounded-full"></div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Cross-Department Integration Visuals */}
      <section className="py-24 relative z-10 bg-slate-900/20 border-t border-slate-800/50">
         <div className="max-w-6xl mx-auto px-4">
            <motion.div 
               initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
               className="flex flex-col items-center mb-16 text-center"
            >
               <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Um app, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Três Motores</span> de Auditoria</h2>
               <p className="text-xl text-slate-400 max-w-2xl">O seu funcionário sente que está usando o aplicativo perfeito para o setor dele. Controle estoques, produções e perdas com interfaces color-coded que previnem erros.</p>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
               className="w-full mockup-container glass-panel rounded-3xl overflow-hidden p-2 ring-1 ring-slate-800 shadow-2xl relative"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-orange-500/10 to-emerald-500/10 opacity-30"></div>
               <img src="file:///C:/Users/User/.gemini/antigravity/brain/0df502c3-29a6-4526-afc2-4505d6def6f6/b2b_saas_pereciveis_mockup_1776015729267.png" alt="Açougue, Padaria e Hortifruti Interfaces" className="w-full h-auto object-cover rounded-2xl relative z-10 block" />
            </motion.div>
         </div>
      </section>

      {/* Corporate Scalability Banner */}
      <section className="py-24 border-t border-slate-800/50 relative z-10 overflow-hidden">
         <div className="absolute right-0 top-0 w-1/2 h-full bg-blue-600/5 blur-[150px]"></div>
         <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
            className="max-w-4xl mx-auto text-center px-4"
         >
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Auditoria Unificada</h2>
            <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto">
               <span className="text-white font-semibold">Controle Centralizado.</span> De 1 a 100 lojas, gerencie todos os balanços em uma única plataforma. Acompanhe a pesagem em tempo real e exporte dados precisos em TXT/Excel nativos para o ERP VR Software.
            </p>
         </motion.div>
      </section>

      {/* Value Drivers */}
      <section className="py-24 bg-slate-900/30 relative z-10 border-t border-slate-800/50">
        <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8"
         >
           <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <Bot className="text-blue-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Engenharia de Dados Centralizada</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                 Layout modular configurado por loja. O arquivo centralizado é direcionado imediatamente à matriz sem ruídos ou atrasos operacionais.
              </p>
           </motion.div>
           <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
              <CheckCircle2 className="text-indigo-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Alta Disponibilidade</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                 A aplicação trabalha via Offline-First e sincroniza quando a conexão é retomada. Auditores nunca paralizarão a contagem por falta de internet na câmara fria.
              </p>
           </motion.div>
           <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <Calculator className="text-emerald-400 mb-4" size={28} />
              <h3 className="text-xl font-bold text-white mb-2">Rastreabilidade Extrema</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                 O Head da Prevenção tem em mãos a "Caixa Preta" de como o auditor chegou naquele peso, somando as batidas exatas (ex: 15+15+10) blindando contra fraudes.
              </p>
           </motion.div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 relative z-10 border-t border-slate-800/50">
         <div className="max-w-6xl mx-auto px-4">
            <motion.div 
               initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
               className="text-center mb-20"
            >
               <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Escolha a Estrutura Ideal</h2>
               <p className="text-xl text-slate-400">Implementação única (Setup) com mensalidades ultra-acessíveis.</p>
            </motion.div>

            <motion.div 
               initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
               className="grid md:grid-cols-3 gap-8 items-stretch"
            >
               {/* Essencial */}
               <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-[2rem] flex flex-col border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Essencial</h3>
                  <p className="text-sm text-slate-400 mb-8 min-h-[40px]">Ideal para mercados locais e loja única.</p>
                  
                  <div className="mb-6 pb-6 border-b border-slate-800">
                     <span className="text-4xl font-extrabold text-white">R$ 99</span>
                     <span className="text-slate-500">/mês por loja</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Exportação TXT e Excel nítidas</li>
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Suporte em Horário Comercial</li>
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Calculadora Integrada</li>
                  </ul>
                  
                  <button className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors mt-auto">
                     Assinar Essencial
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">+ Setup Único de Integração VR</p>
               </motion.div>

               {/* Crescimento */}
               <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-[2rem] flex flex-col border border-blue-500/50 relative shadow-[0_0_50px_rgba(37,99,235,0.15)] bg-blue-950/10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                     Mais Escolhido
                  </div>
                  
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Crescimento</h3>
                  <p className="text-sm text-slate-400 mb-8 min-h-[40px]">O melhor custo-benefício para redes operantes (Até 10 lojas).</p>
                  
                  <div className="mb-6 pb-6 border-b border-slate-800">
                     <span className="text-4xl font-extrabold text-white">R$ 89</span>
                     <span className="text-slate-500">/mês por loja</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={16} className="text-blue-500" /> Tudo do Essencial</li>
                     <li className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={16} className="text-blue-500" /> Multi-Login com Trava de Unidade</li>
                     <li className="flex items-center gap-3 text-sm text-slate-200"><CheckCircle2 size={16} className="text-blue-500" /> Dashboard Dinâmico Central</li>
                  </ul>
                  
                  <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors mt-auto shadow-lg shadow-blue-500/20">
                     Iniciar Plano Escalável
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">+ Setup Único Reduzido</p>
               </motion.div>

               {/* Corporativo */}
               <motion.div variants={fadeUpVariant} className="glass-panel p-8 rounded-[2rem] flex flex-col border border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-2">Corporativo</h3>
                  <p className="text-sm text-slate-400 mb-8 min-h-[40px]">Gestão omni para grandes redes, franquias ou dezenas de filiais (Ilimitado).</p>
                  
                  <div className="mb-6 pb-6 border-b border-slate-800">
                     <span className="text-4xl font-extrabold text-white">Custom.</span>
                     <span className="text-slate-500"> volume adaptado</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-1">
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Tudo do Crescimento</li>
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Contratos com SLA 99.9%</li>
                     <li className="flex items-center gap-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-slate-500" /> Suporte Premium Plantão 24h</li>
                  </ul>
                  
                  <button className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors mt-auto">
                     Falar com Executivos
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">Isenção de Setup com base volumétrica</p>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* Modern Footer */}
      <footer className="pt-20 pb-10 border-t border-slate-800 bg-slate-950 relative z-10">
         <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
               <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     <Calculator className="text-blue-500" size={24} />
                     <span className="font-extrabold text-xl text-white tracking-tight">Balanço<span className="text-blue-500">Digital</span></span>
                  </div>
                  <p className="text-sm text-slate-500 max-w-xs">
                     Software corporativo B2B dedicado ao apontamento de balanços pesáveis com altíssima performance para grandes redes varejistas.
                  </p>
               </div>
               
               <div>
                  <h4 className="font-bold text-white mb-6">Soluções</h4>
                  <ul className="space-y-4 text-sm text-slate-400">
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Balanço Açougue (App)</a></li>
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Inventário Geral</a></li>
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Prevenção de Perdas VR</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-white mb-6">Empresa</h4>
                  <ul className="space-y-4 text-sm text-slate-400">
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre Nós</a></li>
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Blog Técnico</a></li>
                     <li><a href="#" className="hover:text-blue-400 transition-colors">Carreiras SaaS</a></li>
                  </ul>
               </div>

               <div>
                  <h4 className="font-bold text-white mb-6">Suporte e Vendas</h4>
                  <ul className="space-y-4 text-sm text-slate-400">
                     <li><a href="#" className="hover:text-blue-400 transition-colors flex justify-start items-center gap-2"><HelpCircle size={16}/> Central de Ajuda</a></li>
                     <li><a href="#" className="hover:text-blue-400 transition-colors flex justify-start items-center gap-2"><MapPin size={16}/> Contato Matriz</a></li>
                     <li><a href="#" className="hover:text-emerald-400 transition-colors flex justify-start items-center gap-2 text-emerald-500"><ScanLine size={16}/> Vendas WhatsApp</a></li>
                  </ul>
               </div>
            </div>
            
            <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
               <p className="text-sm text-slate-600">© {new Date().getFullYear()} TenTech S/A. Todos os direitos reservados para operações Cloud.</p>
               <div className="flex gap-4">
                  {/* Mock Social Icons */}
                  <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"><Mail size={14}/></div>
                  <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"><ShieldCheck size={14}/></div>
                  <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"><Layers size={14}/></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
