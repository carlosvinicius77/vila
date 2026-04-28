import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Pencil, Trash2, Check, FolderOpen } from "lucide-react";
import { toast } from "sonner";

const EMOJI_OPTIONS = ["📦","🥩","🍗","🥓","🌭","🛒","🧀","🥛","🔥","🫕","🥬","🍎","🥕","🥚","🏷️","⭐","🍞","🍰","☕","🧁"];

export function CategoryManager({ isOpen, onClose, categories, onSave, deptConfig }) {
  const [localCats, setLocalCats] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEmoji, setEditEmoji] = useState("📦");
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("📦");
  const [showNewForm, setShowNewForm] = useState(false);

  // Sync local state when modal opens
  if (isOpen && localCats.length === 0 && categories.length > 0 && localCats !== categories) {
    setLocalCats([...categories]);
  }

  const handleOpen = () => {
    setLocalCats([...categories]);
    setEditingId(null);
    setShowNewForm(false);
    setNewTitle("");
    setNewEmoji("📦");
  };

  if (!isOpen) return null;

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditTitle(cat.title);
    setEditEmoji(cat.emoji || "📦");
    setShowNewForm(false);
  };

  const confirmEdit = () => {
    if (!editTitle.trim()) { toast.error("Nome não pode estar vazio."); return; }
    setLocalCats(prev => prev.map(c =>
      c.id === editingId ? { ...c, title: editTitle.trim(), emoji: editEmoji } : c
    ));
    setEditingId(null);
    toast.success("Categoria atualizada.");
  };

  const deleteCategory = (id, title) => {
    if (!window.confirm(`Excluir a categoria "${title}"?\n\nProdutos dessa categoria ficarão sem categoria até serem reatribuídos.`)) return;
    setLocalCats(prev => prev.filter(c => c.id !== id));
    toast.success(`"${title}" removida.`);
  };

  const addCategory = () => {
    if (!newTitle.trim()) { toast.error("Digite um nome para a nova categoria."); return; }
    const newId = newTitle.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "") + "_" + Date.now();
    const newCat = {
      id: newId,
      title: newTitle.trim(),
      emoji: newEmoji,
      icon: localCats[0]?.icon || null, // reuse first icon as fallback
      custom: true,
    };
    setLocalCats(prev => [...prev, newCat]);
    setNewTitle("");
    setNewEmoji("📦");
    setShowNewForm(false);
    toast.success(`Categoria "${newCat.title}" criada!`);
  };

  const handleSave = () => {
    if (localCats.length === 0) { toast.error("O setor precisa ter ao menos uma categoria."); return; }
    onSave(localCats);
    onClose();
    toast.success("Categorias salvas com sucesso!");
  };

  const color = deptConfig?.color || "blue";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className={`bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative border-t-4 border-t-${color}-500`}
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-${color}-900/40 border border-${color}-700/50 flex items-center justify-center`}>
              <FolderOpen size={18} className={`text-${color}-400`} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Gerenciar Categorias</h2>
              <p className="text-xs text-slate-500">{deptConfig?.name} · {localCats.length} sanfonas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {localCats.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden"
              >
                {editingId === cat.id ? (
                  <div className="p-3 flex flex-col gap-2">
                    {/* Emoji picker */}
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {EMOJI_OPTIONS.map(em => (
                        <button
                          key={em}
                          onClick={() => setEditEmoji(em)}
                          className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${editEmoji === em ? `bg-${color}-600` : "bg-slate-700 hover:bg-slate-600"}`}
                        >{em}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && confirmEdit()}
                        className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <button onClick={confirmEdit} className={`px-3 py-2 bg-${color}-600 hover:bg-${color}-500 text-white rounded-xl transition-colors`}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 flex items-center gap-3">
                    <span className="text-2xl shrink-0">{cat.emoji}</span>
                    <span className="flex-1 text-sm font-bold text-white truncate">{cat.title}</span>
                    {cat.custom && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider">custom</span>
                    )}
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.title)}
                      className="p-1.5 rounded-lg hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* New category form */}
          <AnimatePresence>
            {showNewForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`bg-${color}-950/30 border border-${color}-800/50 rounded-xl p-3 flex flex-col gap-2 mt-1`}
              >
                <p className={`text-xs font-bold text-${color}-400 uppercase tracking-widest`}>Nova Categoria</p>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${newEmoji === em ? `bg-${color}-600` : "bg-slate-700 hover:bg-slate-600"}`}
                    >{em}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCategory()}
                    placeholder="Nome da categoria..."
                    className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                  <button onClick={addCategory} className={`px-3 py-2 bg-${color}-600 hover:bg-${color}-500 text-white rounded-xl transition-colors`}>
                    <Check size={16} />
                  </button>
                  <button onClick={() => setShowNewForm(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowNewForm(true)}
                className={`w-full border border-dashed border-slate-700 hover:border-${color}-500/60 text-slate-500 hover:text-${color}-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold mt-1`}
              >
                <Plus size={16} /> Adicionar Nova Categoria
              </button>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleSave}
            className={`w-full bg-${color}-600 hover:bg-${color}-500 text-white rounded-xl py-3 font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2`}
          >
            <Check size={18} /> Salvar Alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
}
