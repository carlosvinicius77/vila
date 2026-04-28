import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

export function ProductModal({ isOpen, onClose, onSave, existingItems = [], editingItem, initialCategory, disableHeuristic = false, currentDeptConfig }) {
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [userChangedCategory, setUserChangedCategory] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setId(editingItem.id.toString());
      setNome(editingItem.nome);
      setCategoria(editingItem.categoria || initialCategory);
      setUserChangedCategory(true);
    } else {
      setId("");
      setNome("");
      setCategoria(initialCategory);
      setUserChangedCategory(false);
    }
  }, [editingItem, isOpen, initialCategory]);

  const guessCategory = (text) => {
    if (!currentDeptConfig || currentDeptConfig.name !== "Açougue") return initialCategory;
    const n = text.toLowerCase();
    if (n.includes("frango") || n.includes("ave") || n.includes("peito") || n.includes("coxa") || n.includes("asa") || n.includes("galinha") || n.includes("filezinho") || n.includes("sassami")) return "AVES";
    if (n.includes("suíno") || n.includes("suino") || n.includes("porco") || n.includes("costelinha") || n.includes("pernil") || n.includes("lombo") || n.includes("panceta") || n.includes("bisteca")) return "SUINOS";
    if (n.includes("linguiça") || n.includes("linguica") || n.includes("salsicha") || n.includes("toscana") || n.includes("bacon") || n.includes("calabresa") || n.includes("salame")) return "TIPICOS";
    return "BOVINOS";
  };

  const handleNomeChange = (e) => {
    const val = e.target.value;
    setNome(val);
    if (!userChangedCategory && !disableHeuristic) {
      setCategoria(guessCategory(val));
    }
  };

  const handleCategoriaChange = (e) => {
    setCategoria(e.target.value);
    setUserChangedCategory(true);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!id || !nome.trim()) {
      toast.error("Por favor, preencha ID e Nome do produto.");
      return;
    }

    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
       toast.error("O ID deve ser um código numérico válido.");
       return;
    }

    // Checking duplicates logic
    // If we are editing, we ignore the match with our own original ID.
    const originalId = editingItem ? editingItem.id : null;
    const isDuplicate = existingItems.some(it => it.id === numId && it.id !== originalId);
    
    if (isDuplicate) {
      toast.error(`Atenção: O ID ${numId} já está vinculado a outro produto!`);
      return;
    }

    onSave({ id: numId, nome: nome.trim(), categoria });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:hidden">
      <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200 border-t-4 border-t-${currentDeptConfig?.color || 'blue'}-500`}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full p-1"
        >
           <X size={20} />
        </button>
        
        <h2 className="text-xl font-black text-slate-100 mb-6 uppercase tracking-wide">
          {editingItem ? "Editar Produto" : "Novo Produto"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold text-slate-400 mb-1 block">Código (ID ERP)</label>
            <input 
              type="number"
              value={id}
              onChange={e => setId(e.target.value)}
              disabled={!!editingItem}
              title={editingItem ? "O ID de um produto existente não pode ser modificado na edição." : ""}
              placeholder="Ex: 81"
              className="bg-slate-950 border border-slate-700 text-white font-mono text-lg rounded-xl p-3 w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <div>
             <label className="text-sm font-bold text-slate-400 mb-1 block">Nome do Produto</label>
             <input
               type="text"
               value={nome}
               autoFocus={!editingItem}
               onChange={handleNomeChange}
               placeholder="Ex: Novo Item"
               className="bg-slate-950 border border-slate-700 text-white font-medium text-lg rounded-xl p-3 w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
             />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-400 mb-1 block">Categoria de Organização</label>
            <select
              value={categoria}
              onChange={handleCategoriaChange}
              className="bg-slate-950 border border-slate-700 text-white font-medium text-lg rounded-xl p-3 w-full outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            >
              {currentDeptConfig?.categories?.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.emoji} {cat.title}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleSave} 
            className={`bg-${currentDeptConfig?.color || 'blue'}-600 hover:bg-${currentDeptConfig?.color || 'blue'}-500 text-white rounded-xl py-4 mt-4 font-bold flex justify-center items-center gap-2 transition-colors shadow-lg shadow-${currentDeptConfig?.color || 'blue'}-600/20`}
          >
             <Save size={20} />
             <span>{editingItem ? "Atualizar Registro" : "Adicionar ao Estoque"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
