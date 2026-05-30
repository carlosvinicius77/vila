import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Save, Beef, Plus, Table2, Bird, PiggyBank, Flame, Store,
  ChevronDown, ArrowLeft, FolderOpen, TrendingDown, UtensilsCrossed,
  Apple, Carrot, Leaf, Egg, Boxes, Ham, Milk, Slice, Package
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { clsx } from "clsx";
import * as XLSX from "xlsx";
import { INITIAL_PRODUCTS } from "../initialData";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/ProductModal";
import { ExportDialog } from "../components/ExportDialog";
import { HistoryPage } from "../components/HistoryPage";
import { InventoryChat } from "../components/InventoryChat";
import { CategoryManager } from "../components/CategoryManager";
import { PerdasModule } from "../components/PerdasModule";
import { TransferenciasModule } from "../components/TransferenciasModule";
import { gerarNomeArquivo } from "../utils/exportTools";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalHeuristicDisabled, setModalHeuristicDisabled] = useState(false);
  
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [printingHistoryRecord, setPrintingHistoryRecord] = useState(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Categorias dinâmicas
  const [customCategories, setCustomCategories] = useState({});

  // Módulo de Perdas: [{ id, dept, itemId, itemNome, kg, formula, motivo, date, timestamp }]
  const [perdas, setPerdas] = useState([]);
  // Módulo de Transferências: [{ id, dept, itemId, itemNome, kg, formula, destino, date, timestamp }]
  const [transferencias, setTransferencias] = useState([]);

  const [currentStore, setCurrentStore] = useState("");
  const [availableStores, setAvailableStores] = useState([]);
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const navigate = useNavigate();

  // Load Initial State
  useEffect(() => {
    const isAuth = localStorage.getItem("@acougue/isAuthenticated");
    const store = localStorage.getItem("@acougue/currentStore");
    
    if (!isAuth || !store) {
      navigate("/login", { replace: true });
      return;
    }
    setCurrentStore(store);

    const savedAvailable = localStorage.getItem("@acougue/availableStores");
    if (savedAvailable) {
      try { setAvailableStores(JSON.parse(savedAvailable)); } catch (_) {}
    }

    const savedItems = localStorage.getItem("@acougue/items");
    if (savedItems) {
      try {
        let parsed = JSON.parse(savedItems);
        parsed = parsed.map(item => ({...item, dept: item.dept || 'Acougue'}));
        setItems(parsed);
      } catch (e) {
        setItems(INITIAL_PRODUCTS.map(it => ({...it, dept: 'Acougue'})));
      }
    } else {
      setItems(INITIAL_PRODUCTS.map(it => ({...it, dept: 'Acougue'})));
    }
    
    const savedHistory = localStorage.getItem("@acougue/history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        setHistory([]);
      }
    }

    // Categorias customizadas
    const savedCats = localStorage.getItem("@acougue/customCategories");
    if (savedCats) { try { setCustomCategories(JSON.parse(savedCats)); } catch (_) {} }

    // Perdas
    const savedPerdas = localStorage.getItem("@acougue/perdas");
    if (savedPerdas) { try { setPerdas(JSON.parse(savedPerdas)); } catch (_) {} }

    // Transferências
    const savedTransf = localStorage.getItem("@acougue/transferencias");
    if (savedTransf) { try { setTransferencias(JSON.parse(savedTransf)); } catch (_) {} }
  }, [navigate]);

  useEffect(() => {
    if (items.length > 0) localStorage.setItem("@acougue/items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("@acougue/perdas", JSON.stringify(perdas));
  }, [perdas]);

  useEffect(() => {
    localStorage.setItem("@acougue/transferencias", JSON.stringify(transferencias));
  }, [transferencias]);

  // Categorias padrão por departamento
  const DEFAULT_CATEGORIES = {
    Acougue: [
      { id: "BOVINOS", title: "Bovinos", icon: Beef, emoji: "🥩" },
      { id: "AVES", title: "Aves", icon: Bird, emoji: "🍗" },
      { id: "SUINOS", title: "Suínos", icon: PiggyBank, emoji: "🥓" },
      { id: "TIPICOS", title: "Típicos", icon: Flame, emoji: "🌭" },
      { id: "OUTROS", title: "Outros", icon: Store, emoji: "🛒" },
    ],
    Frios: [
      { id: "QUEIJOS", title: "Queijos", icon: Package, emoji: "🧀" },
      { id: "PRESUNTADOS", title: "Presuntados/Bacuetes", icon: Ham, emoji: "🥩" },
      { id: "DEFUMADOS", title: "Defumados", icon: Flame, emoji: "🔥" },
      { id: "LATICINIOS", title: "Laticínios", icon: Milk, emoji: "🥛" },
      { id: "FATIADOS", title: "Fatiados", icon: Slice, emoji: "🫕" },
    ],
    Hortifruti: [
      { id: "FOLHAS", title: "Folhagens", icon: Leaf, emoji: "🥬" },
      { id: "FRUTAS", title: "Frutas", icon: Apple, emoji: "🍎" },
      { id: "LEGUMES", title: "Legumes", icon: Carrot, emoji: "🥕" },
      { id: "OVOS", title: "Ovos", icon: Egg, emoji: "🥚" },
      { id: "CAIXAS", title: "Compras (Caixas)", icon: Boxes, emoji: "📦" },
    ],
  };

  // Retorna as categorias resolvidas (custom ou default), sempre com icon fallback
  const getCategories = (deptKey) => {
    const custom = customCategories[deptKey];
    const defaults = DEFAULT_CATEGORIES[deptKey] || [];
    if (!custom) return defaults;
    // Re-attach icon from defaults by id (pois ícones JSX não são serializáveis)
    return custom.map(c => {
      const def = defaults.find(d => d.id === c.id);
      return { ...c, icon: def?.icon || Store };
    });
  };

  // Department Configs Map
  const DEPARTMENTS_CONFIG = {
    Acougue: {
       name: "Açougue",
       color: "blue",
       bgClass: "bg-slate-950",
       accentClass: "text-blue-500",
       btnClass: "bg-blue-600 hover:bg-blue-500 border-blue-500/80 shadow-blue-500/20 active:bg-blue-700",
       panelBg: "bg-slate-900",
       icon: <Beef className="text-blue-500" size={32} />,
       get categories() { return getCategories("Acougue"); }
    },
    Frios: {
       name: "Frios",
       color: "yellow",
       bgClass: "bg-stone-950",
       accentClass: "text-yellow-400",
       btnClass: "bg-yellow-600 hover:bg-yellow-500 border-yellow-500/80 shadow-yellow-500/20 active:bg-yellow-700",
       panelBg: "bg-stone-900",
       icon: <Package className="text-yellow-400" size={32} />,
       get categories() { return getCategories("Frios"); }
    },
    Hortifruti: {
       name: "Hortifruti",
       color: "emerald",
       bgClass: "bg-emerald-950",
       accentClass: "text-emerald-500",
       btnClass: "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/80 shadow-emerald-500/20 active:bg-emerald-700",
       panelBg: "bg-emerald-900",
       icon: <Apple className="text-emerald-500" size={32} />,
       get categories() { return getCategories("Hortifruti"); }
    }
  };

  const handleSelectDepartment = (deptKey) => {
     setSelectedDepartment(deptKey);
     const cats = DEPARTMENTS_CONFIG[deptKey].categories;
     setExpandedCategory(cats.length > 0 ? cats[0].id : null);
     setActiveTab("home");
  };

  const handleSaveCategories = (newCats) => {
    const updated = { ...customCategories, [selectedDepartment]: newCats };
    setCustomCategories(updated);
    localStorage.setItem("@acougue/customCategories", JSON.stringify(updated));
    // Reset expandedCategory se a categoria aberta foi removida
    const ids = newCats.map(c => c.id);
    if (expandedCategory && !ids.includes(expandedCategory)) {
      setExpandedCategory(newCats[0]?.id || null);
    }
  };

  // ── Handlers de Perdas / Transferências ──────────────────────────────────────
  const handleAddPerda            = (p) => setPerdas(prev => [p, ...prev]);
  const handleRemovePerda         = (id) => setPerdas(prev => prev.filter(p => p.id !== id));
  const handleAddTransferencia    = (t) => setTransferencias(prev => [t, ...prev]);
  const handleRemoveTransferencia = (id) => setTransferencias(prev => prev.filter(t => t.id !== id));

  // Helper: totais por item considerando perdas e transferências do setor
  const getItemPerdas = (itemId) =>
    perdas.filter(p => p.dept === selectedDepartment && p.itemId === itemId)
          .reduce((s, p) => s + p.kg, 0);
  const getItemTransf = (itemId) =>
    transferencias.filter(t => t.dept === selectedDepartment && t.itemId === itemId)
                  .reduce((s, t) => s + t.kg, 0);

  const currentDeptConfig = selectedDepartment ? DEPARTMENTS_CONFIG[selectedDepartment] : null;

  const updateItemFields = (id, fields) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...fields } : it))
    );
  };

  const updateItem = (id, field, value) => {
    updateItemFields(id, { [field]: value });
  };

  const handleSaveProduct = (prodData) => {
    setItems((prev) => {
      if (editingItem) {
        return prev.map(it => 
           it.id === editingItem.id ? { ...it, id: prodData.id, nome: prodData.nome, categoria: prodData.categoria } : it
        ).sort((a,b) => a.id - b.id);
      }
      return [...prev, { 
         id: prodData.id, 
         nome: prodData.nome, 
         estoque_loja: 0, 
         estoque_camara: 0, 
         categoria: prodData.categoria,
         dept: selectedDepartment 
      }].sort((a,b) => a.id - b.id);
    });
    toast.success(editingItem ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
  };

  const handleDeleteProduct = (id) => {
    setItems((prev) => prev.filter(it => it.id !== id));
    toast.success("Produto removido do Departamento.");
  };

  const handleDeleteHistoryRecord = (dateStr) => {
    const updated = history.filter(r => r.date !== dateStr);
    setHistory(updated);
    localStorage.setItem("@acougue/history", JSON.stringify(updated));
    toast.success("Balanço histórico excluído.");
  };

  const handleFinalizarSemana = () => {
    if (!window.confirm(`FINALIZAR SEMANA - ${currentDeptConfig.name}\n\nDeseja realmente gravar o histórico e zerar todos os produtos deste setor? (Outros setores não serão afetados)`)) return;

    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString("pt-BR") + " " + dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Filter items of the current department
    const deptItems = items.filter(it => it.dept === selectedDepartment);
    
    const newRecord = { date: dateStr, items: [...deptItems], store: currentStore, dept: selectedDepartment };
    const newHistory = [newRecord, ...history];
    
    setHistory(newHistory);
    localStorage.setItem("@acougue/history", JSON.stringify(newHistory));

    // Clear quantities ONLY for current department
    const clearedItems = items.map((it) => 
       it.dept === selectedDepartment ? { ...it, estoque_loja: 0, estoque_camara: 0, formula_loja: "", formula_camara: "" } : it
    );
    setItems(clearedItems);

    toast.success(`Semana fechada para ${currentDeptConfig.name}!`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportarVR = () => {
    const lines = items
      .filter(it => it.dept === selectedDepartment && ((it.estoque_loja||0)+(it.estoque_camara||0)) > 0)
      .map(it => {
        const totalPesado = (it.estoque_loja||0) + (it.estoque_camara||0);
        return `${it.id}|${totalPesado.toFixed(3)}|KG`;
      });

    if (lines.length === 0) { toast.error(`Nenhum produto pesado em ${currentDeptConfig.name}.`); return; }

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${gerarNomeArquivo(`balanco_${selectedDepartment.toLowerCase()}`, null)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${currentDeptConfig.name} - TXT Inventário exportado!`);
  };

  const handleExportarExcel = () => {
    const dataToExport = items
      .filter(it => it.dept === selectedDepartment && ((it.estoque_loja||0)+(it.estoque_camara||0)) > 0)
      .map(it => {
        const totalPesado  = (it.estoque_loja||0) + (it.estoque_camara||0);
        return {
          "ID": it.id,
          "Nome": it.nome,
          "Loja (kg)": (it.estoque_loja||0).toFixed(3).replace(".",","),
          "Câmara (kg)": (it.estoque_camara||0).toFixed(3).replace(".",","),
          "Total Inventário (kg)": totalPesado.toFixed(3).replace(".",",")
        };
      });

    if (dataToExport.length === 0) { toast.error(`Nenhum produto pesado em ${currentDeptConfig.name}.`); return; }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balanço Geral");
    XLSX.writeFile(wb, `${gerarNomeArquivo(`inventario_${selectedDepartment.toLowerCase()}`, null)}.xlsx`);
    toast.success("Planilha de Inventário exportada com sucesso!");
  };

  const handleExportarPrint = () => {
    setPrintingHistoryRecord(null);
    setTimeout(() => window.print(), 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("@acougue/isAuthenticated");
    navigate("/login", { replace: true });
  }

  const handleSwitchStore = (storeName) => {
    setCurrentStore(storeName);
    localStorage.setItem("@acougue/currentStore", storeName);
    setIsStoreSelectorOpen(false);
    toast.success(`Unidade alterada para: ${storeName}`);
  };

  // Unit Selector Modal Component (Internal)
  const StoreSelectorModal = () => (
    <AnimatePresence>
      {isStoreSelectorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsStoreSelectorOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-panel bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800/80">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Store size={20} className="text-blue-500" /> Trocar Unidade
              </h3>
              <p className="text-slate-400 text-sm mt-1">Selecione o ponto de venda desejado.</p>
            </div>
            <div className="p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {availableStores.map((store) => (
                <button
                  key={store}
                  onClick={() => handleSwitchStore(store)}
                  className={clsx(
                    "w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group",
                    currentStore === store 
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300" 
                      : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  )}
                >
                  <span className="font-semibold text-sm">{store}</span>
                  {currentStore === store && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                </button>
              ))}
            </div>
            <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex justify-end px-6">
              <button 
                onClick={() => setIsStoreSelectorOpen(false)}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // HUB VIEW (If no department selected)
  if (!selectedDepartment) {
     return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-12 px-4 relative overflow-hidden">
           <Toaster position="top-center" theme="dark" richColors />
           <StoreSelectorModal />

           {/* Breadcrumbs */}
           <div className="max-w-2xl mx-auto w-full">
              <nav className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                 <span className="text-blue-500/100">Principal</span>
                 <span className="opacity-30">/</span>
                 <span>Seleção de Loja</span>
              </nav>
           </div>

           <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
           
           <div className="max-w-2xl mx-auto w-full flex-1">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">Painel Central</h1>
                    <div className="flex items-center gap-2">
                       <p className="text-slate-400 text-sm">Plataforma conectada: <span className="font-semibold text-slate-200">{currentStore}</span></p>
                       <button 
                          onClick={() => setIsStoreSelectorOpen(true)}
                          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-tight underline underline-offset-4 decoration-blue-500/30 transition-colors"
                       >
                          Alterar Unidade Alvo
                       </button>
                    </div>
                 </div>
                 <button onClick={handleLogout} className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-slate-700 active:scale-95 shadow-sm">
                    Desconectar
                 </button>
              </div>

              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Selecione o Departamento Ativo</h2>

              <div className="grid gap-4">
                 {Object.entries(DEPARTMENTS_CONFIG).map(([key, config]) => (
                    <motion.button 
                       key={key}
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => handleSelectDepartment(key)}
                       className={clsx(
                          "glass-panel w-full text-left p-6 rounded-[2rem] border border-slate-800/80 flex items-center justify-between group transition-all",
                          `hover:border-${config.color}-500/50 hover:bg-${config.color}-950/20`
                       )}
                    >
                       <div className="flex items-center gap-5">
                          <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner", `bg-${config.color}-900/30 border-${config.color}-800`)}>
                             {config.icon}
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-white tracking-tight">{config.name}</h3>
                             <p className="text-slate-400 text-sm mt-1">Lançar pesos e atualizar integrações VR.</p>
                          </div>
                       </div>
                       <ChevronDown className={clsx("opacity-0 group-hover:opacity-100 transition-opacity -rotate-90", `text-${config.color}-400`)} size={24} />
                    </motion.button>
                 ))}
              </div>
           </div>
        </div>
     );
  }

  // DEPT VIEW (If department is selected)
  // Base Filter
  const deptSpecificItems = items.filter(it => it.dept === selectedDepartment);
  const filteredItems = deptSpecificItems.filter(
    (it) => it.nome.toLowerCase().includes(searchQuery.toLowerCase()) || it.id.toString().includes(searchQuery)
  );

  return (
    <div className={clsx("max-w-2xl mx-auto min-h-screen flex flex-col pb-[120px] relative print:bg-white print:pb-0 font-sans transition-colors duration-500", currentDeptConfig.bgClass)}>
      <Toaster position="top-center" theme="dark" richColors />
      <StoreSelectorModal />
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4 text-black text-center pt-8">
        <h1 className="text-3xl font-black uppercase tracking-widest text-black">Relatório de Inventário - {currentDeptConfig.name}</h1>
        <p className="text-xl font-bold mt-2">Unidade: {printingHistoryRecord ? printingHistoryRecord.store || "Não informada" : currentStore}</p>
        
        {printingHistoryRecord ? (
           <p className="text-lg mt-2 font-bold text-black">Semana Extraída: Balanço - {printingHistoryRecord.date}</p>
        ) : (
           <p className="text-lg mt-2 text-black">Pendente Vigente - Data: {new Date().toLocaleString("pt-BR")}</p>
        )}
        <p className="text-lg font-bold mt-4 mb-4 text-left text-black">Resumo de Contagens:</p>
      </div>

      <header className="glass-header p-4 sticky top-0 z-20 print:hidden shadow-md">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedDepartment(null)} className="mr-2 p-2 hover:bg-slate-800/50 rounded-full transition-colors hidden sm:block">
               <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div className={clsx("p-2.5 rounded-xl border shadow-inner", `bg-${currentDeptConfig.color}-900/30 border-${currentDeptConfig.color}-800`)}>
               {currentDeptConfig.icon}
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                 {activeTab === 'home'          && <>{currentDeptConfig.name}</>}
                 {activeTab === 'history'       && <>Auditoria <span className={currentDeptConfig.accentClass}>Histórico</span></>}
                 {activeTab === 'perdas'        && <><span className="text-red-400">Perdas</span> <span className="text-slate-400 font-normal text-base">/</span> Quebras</>}
                 {activeTab === 'transferencias'&& <><span className="text-amber-400">Transferências</span> <span className="text-slate-400 font-normal text-base">/</span> Cozinha</>}
              </h1>
              <button 
                onClick={() => setIsStoreSelectorOpen(true)}
                className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group"
              >
                <Store size={12} className="group-hover:text-blue-400" />
                <span>{currentStore}</span>
                <ChevronDown size={10} className="opacity-50 group-hover:opacity-100" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'home' && (
              <>
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  title="Gerenciar Categorias"
                  className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <FolderOpen size={18} />
                </button>
                <button 
                  onClick={() => { setEditingItem(null); setModalHeuristicDisabled(false); setIsProductModalOpen(true); }}
                  className={clsx("font-semibold text-white py-2 px-3 rounded-lg flex items-center gap-2 transition-colors", currentDeptConfig.btnClass)}
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </>
            )}
            <button 
              onClick={() => setSelectedDepartment(null)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 border border-slate-700 rounded-lg text-sm transition-colors sm:hidden"
            >
              Voltar
            </button>
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="relative animate-in fade-in duration-300 mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-slate-500" size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar item ou código VR..."
              className={clsx(
                 "w-full bg-slate-900/80 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 transition-all outline-none placeholder:text-slate-500 shadow-inner",
                 `border-${currentDeptConfig.color}-900/40 focus:border-${currentDeptConfig.color}-500/80 focus:ring-${currentDeptConfig.color}-500/50`
              )}
            />
          </div>
        )}
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 print:p-0">
         {activeTab === 'perdas' && (
            <div className="print:hidden">
               <PerdasModule
                  items={deptSpecificItems}
                  perdas={perdas}
                  onAddPerda={handleAddPerda}
                  onRemovePerda={handleRemovePerda}
                  dept={selectedDepartment}
               />
            </div>
         )}

         {activeTab === 'transferencias' && (
            <div className="print:hidden flex flex-col gap-4 animate-in fade-in duration-300">
               {/* ── Métricas do Balanço ── */}
               {(() => {
                 const cats = currentDeptConfig.categories;
                 const totalItens = deptSpecificItems.length;
                 const pesados = deptSpecificItems.filter(it => (it.estoque_loja||0)+(it.estoque_camara||0) > 0);
                 const totalKg = pesados.reduce((a,it) => a + (it.estoque_loja||0) + (it.estoque_camara||0), 0);
                 const pct = totalItens > 0 ? Math.round((pesados.length / totalItens) * 100) : 0;

                 return (
                   <>
                     {/* Cards de resumo */}
                     <div className="grid grid-cols-3 gap-3">
                       <div className={clsx('flex flex-col items-center justify-center p-4 rounded-2xl border text-center', currentDeptConfig.btnClass.includes('blue') ? 'bg-blue-600/10 border-blue-500/30' : currentDeptConfig.btnClass.includes('yellow') ? 'bg-yellow-600/10 border-yellow-500/30' : 'bg-emerald-600/10 border-emerald-500/30')}>
                         <span className={clsx('text-3xl font-black', currentDeptConfig.accentClass)}>{pesados.length}</span>
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Pesados</span>
                       </div>
                       <div className="flex flex-col items-center justify-center p-4 rounded-2xl border bg-slate-900 border-slate-800 text-center">
                         <span className="text-3xl font-black text-white">{totalItens - pesados.length}</span>
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Pendentes</span>
                       </div>
                       <div className="flex flex-col items-center justify-center p-4 rounded-2xl border bg-slate-900 border-slate-800 text-center">
                         <span className={clsx('text-2xl font-black', currentDeptConfig.accentClass)}>{pct}%</span>
                         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Concluído</span>
                       </div>
                     </div>

                     {/* Barra de progresso */}
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Progresso do Balanço</span>
                         <span className={clsx('text-sm font-extrabold', currentDeptConfig.accentClass)}>{totalKg.toFixed(3)} kg total</span>
                       </div>
                       <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                         <div className={clsx('h-full rounded-full transition-all duration-700', currentDeptConfig.btnClass.split(' ')[0])} style={{ width: `${pct}%` }} />
                       </div>
                       <div className="text-xs text-slate-600 mt-1.5">{pesados.length} de {totalItens} itens pesados</div>
                     </div>

                     {/* Por categoria */}
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                       <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Por Categoria</span>
                       {cats.map(cat => {
                         const catItems = deptSpecificItems.filter(it => (it.categoria||'').toUpperCase() === cat.id);
                         const catPesados = catItems.filter(it => (it.estoque_loja||0)+(it.estoque_camara||0) > 0);
                         const catKg = catPesados.reduce((a,it) => a + (it.estoque_loja||0) + (it.estoque_camara||0), 0);
                         const catPct = catItems.length > 0 ? Math.round((catPesados.length / catItems.length) * 100) : 0;
                         return (
                           <div key={cat.id} className="flex flex-col gap-1">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <span className="text-sm">{cat.emoji}</span>
                                 <span className="text-sm font-bold text-white">{cat.title}</span>
                                 <span className="text-xs text-slate-600">{catPesados.length}/{catItems.length}</span>
                               </div>
                               <span className={clsx('text-xs font-extrabold', currentDeptConfig.accentClass)}>{catKg.toFixed(3)} kg</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                               <div className={clsx('h-full rounded-full', currentDeptConfig.btnClass.split(' ')[0])} style={{ width: `${catPct}%` }} />
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </>
                 );
               })()}
            </div>
         )}
         
         {activeTab === 'home' && (
            <div className="flex flex-col gap-0 animate-in fade-in zoom-in-95 duration-300">
               {currentDeptConfig.categories.map(cat => {
                  const catItems = filteredItems.filter(it => (it.categoria || '').toUpperCase() === cat.id);
                  if (catItems.length === 0 && searchQuery) return null;
                  const itemsContados = catItems.filter(it => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0).length;

                  return (
                    <div key={cat.id} className="mb-4">
                      {/* Cabeçalho da categoria */}
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.emoji}</span>
                          <span className={clsx("text-xs font-black uppercase tracking-widest", currentDeptConfig.accentClass)}>{cat.title}</span>
                          <span className="text-xs text-slate-600 font-medium">({itemsContados}/{catItems.length})</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedCategory(cat.id); setEditingItem(null); setModalHeuristicDisabled(true); setIsProductModalOpen(true); }}
                          className={clsx("print:hidden flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors text-slate-500 hover:text-white hover:bg-slate-800")}
                        >
                          <Plus size={12} /> Novo
                        </button>
                      </div>

                      {/* Lista de produtos */}
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        {catItems.length === 0 ? (
                          <div className="px-4 py-3 text-xs text-slate-600 italic">Nenhum produto cadastrado.</div>
                        ) : (
                          catItems.map((item, idx) => {
                            const pesado = (item.estoque_loja||0)+(item.estoque_camara||0) > 0;
                            return (
                              <div key={item.id}
                                className={clsx(
                                  "flex items-center gap-3 px-4 py-3 transition-colors",
                                  idx !== catItems.length - 1 && "border-b border-slate-800/70",
                                  !pesado && "opacity-50"
                                )}
                              >
                                <span className="text-slate-600 font-mono text-xs w-6 text-right shrink-0">{item.id}</span>
                                <span className="text-white font-semibold text-sm flex-1 truncate">{item.nome}</span>
                                <div className={clsx("w-2 h-2 rounded-full shrink-0", pesado ? currentDeptConfig.btnClass.split(' ')[0] : 'bg-slate-700')} />
                                <button
                                  onClick={() => { setEditingItem(item); setIsProductModalOpen(true); }}
                                  className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors print:hidden shrink-0"
                                >
                                  <Table2 size={13} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
               })}

               {filteredItems.length === 0 && (
                 <div className="text-center py-12 text-slate-600 flex flex-col items-center gap-3 print:hidden">
                   <Search size={48} className="opacity-20" />
                   <p className="text-sm font-medium">Nenhum registro correspondente.</p>
                 </div>
               )}
            </div>
         )}
         
         {activeTab === 'history' && (
            <div className="print:hidden">
               {/* Note: In History we only show history of THIS selected department! */}
               <HistoryPage
                  history={history.filter(h => !h.dept || h.dept === selectedDepartment)}
                  onDeleteRecord={handleDeleteHistoryRecord}
                  setPrintingRecord={setPrintingHistoryRecord}
               />
            </div>
         )}
         
         <div className="hidden print:block">
            {printingHistoryRecord && (
               <div className="flex flex-col">
                  {printingHistoryRecord.items.filter(it => (it.estoque_loja + it.estoque_camara) > 0).map(item => (
                     <div key={item.id} className="flex justify-between items-center py-2 border-b border-black">
                        <span className="font-bold w-16">{item.id}</span>
                        <span className="flex-1 font-semibold">{item.nome}</span>
                        <span className="w-24 text-right">Loja: {(item.estoque_loja || 0).toFixed(3)}</span>
                        <span className="w-24 text-right">Câmara: {(item.estoque_camara || 0).toFixed(3)}</span>
                        <span className="w-24 font-black text-right">Tot: {((item.estoque_loja || 0) + (item.estoque_camara || 0)).toFixed(3)}</span>
                     </div>
                  ))}
               </div>
            )}
         </div>

      </main>

      <div className="hidden print:flex flex-col items-center justify-end mt-24">
         <div className="border-t border-black w-64 mt-20 pt-2 text-center text-black font-bold uppercase">Assinatura do Responsável</div>
      </div>

      {activeTab === 'home' && (
        <div className="fixed bottom-24 left-4 right-4 max-w-2xl mx-auto flex gap-3 z-20 print:hidden animate-in slide-in-from-bottom-5">
          <button
            onClick={handleFinalizarSemana}
            className="flex-1 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white rounded-xl py-4 font-semibold backdrop-blur-md active:bg-slate-900 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Finalizar</span>
            <span className="sm:hidden">Gravar</span>
          </button>
          <button
            onClick={() => setIsExportDialogOpen(true)}
            className={clsx("flex-[2] text-white rounded-xl py-4 font-semibold backdrop-blur-md transition flex items-center justify-center gap-2 shadow-lg border", currentDeptConfig.btnClass)}
          >
            <Table2 size={18} />
            <span>Gerar TXT/Excel</span>
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-[76px] bg-slate-950/92 backdrop-blur-xl border-t border-slate-800/80 flex justify-around items-center z-30 print:hidden pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Balanço */}
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }}
          className={clsx("flex flex-col items-center justify-center w-full h-full transition-all border-t-2",
            activeTab === 'home'
              ? `text-${currentDeptConfig.color}-400 border-${currentDeptConfig.color}-500 bg-${currentDeptConfig.color}-900/10`
              : 'text-slate-500 hover:text-slate-300 border-transparent'
          )}
        >
          {currentDeptConfig.icon}
          <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Balanço</span>
        </button>

        {/* Perdas */}
        <button
          onClick={() => { setActiveTab('perdas'); window.scrollTo(0,0); }}
          className={clsx("flex flex-col items-center justify-center w-full h-full transition-all border-t-2",
            activeTab === 'perdas'
              ? 'text-red-400 border-red-500 bg-red-900/10'
              : 'text-slate-500 hover:text-red-400/70 border-transparent'
          )}
        >
          <TrendingDown size={20} className="mb-0.5 mt-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Perdas</span>
        </button>

        {/* Transferências */}
        <button
          onClick={() => { setActiveTab('transferencias'); window.scrollTo(0,0); }}
          className={clsx("flex flex-col items-center justify-center w-full h-full transition-all border-t-2",
            activeTab === 'transferencias'
              ? 'text-amber-400 border-amber-500 bg-amber-900/10'
              : 'text-slate-500 hover:text-amber-400/70 border-transparent'
          )}
        >
          <UtensilsCrossed size={20} className="mb-0.5 mt-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Métricas</span>
        </button>

        {/* Histórico */}
        <button
          onClick={() => { setActiveTab('history'); window.scrollTo(0,0); }}
          className={clsx("flex flex-col items-center justify-center w-full h-full transition-all border-t-2",
            activeTab === 'history'
              ? `text-${currentDeptConfig.color}-400 border-${currentDeptConfig.color}-500 bg-${currentDeptConfig.color}-900/10`
              : 'text-slate-500 hover:text-slate-300 border-transparent'
          )}
        >
          <Table2 size={20} className="mb-0.5 mt-0.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
      </nav>

      <ProductModal 
         isOpen={isProductModalOpen}
         onClose={() => setIsProductModalOpen(false)}
         onSave={handleSaveProduct}
         existingItems={deptSpecificItems}
         editingItem={editingItem}
         initialCategory={expandedCategory || currentDeptConfig.categories[0]?.id}
         disableHeuristic={modalHeuristicDisabled}
         currentDeptConfig={currentDeptConfig}
      />

      <ExportDialog 
         isOpen={isExportDialogOpen}
         onClose={() => setIsExportDialogOpen(false)}
         onExportVR={handleExportarVR}
         onExportExcel={handleExportarExcel}
         onExportPrint={handleExportarPrint}
      />

      <CategoryManager
         isOpen={isCategoryManagerOpen}
         onClose={() => setIsCategoryManagerOpen(false)}
         categories={currentDeptConfig.categories}
         onSave={handleSaveCategories}
         deptConfig={currentDeptConfig}
      />

      <InventoryChat items={items} allHistory={history} />
    </div>
  );
}
