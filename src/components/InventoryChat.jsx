import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Zap } from "lucide-react";

// ─── Semantic Query Engine ────────────────────────────────────────────────────
function processQuery(input, items) {
  const text = input.toLowerCase().trim();

  const findItemByCode = (code) => items.find((it) => it.id.toString() === code.toString());
  const findItemsByName = (term) =>
    items.filter((it) => it.nome.toLowerCase().includes(term.toLowerCase()));

  const formatTotal = (it) => ({
    total: (it.estoque_loja || 0) + (it.estoque_camara || 0),
    loja: it.estoque_loja || 0,
    camara: it.estoque_camara || 0,
  });

  const deptLabel = (dept) => {
    const map = { Acougue: "Açougue", Frios: "Frios", Hortifruti: "Hortifruti", Padaria: "Padaria" };
    return map[dept] || dept;
  };

  // 1. Consulta por CÓDIGO
  const codeMatch = text.match(/(?:código|cod|cód|item|produto|id)[\s:]*([0-9]+)/);
  const rawNumber = text.match(/^([0-9]+)$/);
  const targetCode = codeMatch ? codeMatch[1] : rawNumber ? rawNumber[1] : null;

  if (targetCode) {
    const item = findItemByCode(targetCode);
    if (!item)
      return `Não encontrei nenhum produto com o código **${targetCode}**. Verifique e tente novamente.`;
    const { total, loja, camara } = formatTotal(item);
    if (total === 0)
      return `O item **${item.nome}** (Cód. ${item.id}) ainda não foi pesado.\nSetor: ${deptLabel(item.dept)}.`;
    return `O item **${item.nome}** (Cód. ${item.id}) registrou um total de **${total.toFixed(3)} kg** no setor de ${deptLabel(item.dept)}.\n→ Loja: ${loja.toFixed(3)} kg  |  Câmara: ${camara.toFixed(3)} kg`;
  }

  // 2. Resumo geral
  if (text.includes("resumo") || text.includes("situação") || text.includes("geral")) {
    const contados = items.filter((it) => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0);
    const pendentes = items.length - contados.length;
    const totalKg = contados.reduce((acc, it) => acc + (it.estoque_loja || 0) + (it.estoque_camara || 0), 0);

    if (contados.length === 0)
      return `Nenhum produto pesado ainda. O inventário está em branco. Comece pelos setores com maior giro!`;

    const byDept = {};
    contados.forEach((it) => {
      byDept[it.dept] = (byDept[it.dept] || 0) + (it.estoque_loja || 0) + (it.estoque_camara || 0);
    });

    const deptLines = Object.entries(byDept)
      .map(([d, kg]) => `  • ${deptLabel(d)}: ${kg.toFixed(3)} kg`)
      .join("\n");

    return `📊 **Resumo do Balanço Atual:**\n\nContados: **${contados.length}** de ${items.length} (${pendentes} pendentes)\nPeso total: **${totalKg.toFixed(3)} kg**\n\nPor setor:\n${deptLines}`;
  }

  // 3. Total por setor
  const deptKeywords = [
    { keys: ["açougue", "acougue", "carne", "bovino", "boi"], dept: "Acougue" },
    { keys: ["frios", "queijo", "presunto", "laticínio", "defumado", "fatiado"], dept: "Frios" },
    { keys: ["hortifruti", "horti", "fruta", "legume", "verdura", "folha"], dept: "Hortifruti" },
  ];

  for (const { keys, dept } of deptKeywords) {
    if (keys.some((k) => text.includes(k))) {
      const deptItems = items.filter((it) => it.dept === dept);
      const contados = deptItems.filter((it) => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0);
      const totalKg = contados.reduce((acc, it) => acc + (it.estoque_loja || 0) + (it.estoque_camara || 0), 0);

      if (deptItems.length === 0)
        return `O setor de **${deptLabel(dept)}** ainda não possui produtos cadastrados.`;
      if (contados.length === 0)
        return `O setor de **${deptLabel(dept)}** tem ${deptItems.length} produto(s) cadastrado(s), mas nenhum pesado ainda.`;

      const top3 = [...contados]
        .sort((a, b) => ((b.estoque_loja||0)+(b.estoque_camara||0)) - ((a.estoque_loja||0)+(a.estoque_camara||0)))
        .slice(0, 3);

      const topLines = top3
        .map((it) => `  • ${it.nome}: ${((it.estoque_loja||0)+(it.estoque_camara||0)).toFixed(3)} kg`)
        .join("\n");

      return `🏷️ **${deptLabel(dept)}** — Total: **${totalKg.toFixed(3)} kg**\n${contados.length}/${deptItems.length} itens contados.\n\nTop pesados:\n${topLines}`;
    }
  }

  // 4. Itens pendentes
  if (text.includes("pendente") || text.includes("faltam") || text.includes("faltando") || text.includes("não pesado")) {
    const pendentes = items.filter((it) => (it.estoque_loja || 0) + (it.estoque_camara || 0) === 0);
    if (pendentes.length === 0)
      return `✅ Todos os produtos já foram pesados! Balanço completo.`;

    const lista = pendentes
      .slice(0, 8)
      .map((it) => `  • [${it.id}] ${it.nome} (${deptLabel(it.dept)})`)
      .join("\n");
    const extra = pendentes.length > 8 ? `\n  ...e mais ${pendentes.length - 8} produto(s).` : "";
    return `⏳ **${pendentes.length} produto(s) não pesados:**\n\n${lista}${extra}`;
  }

  // 5. Busca por nome
  if (text.length > 2) {
    const found = findItemsByName(text);
    if (found.length === 1) {
      const { total, loja, camara } = formatTotal(found[0]);
      return total === 0
        ? `**${found[0].nome}** (Cód. ${found[0].id}) ainda não foi pesado.\nSetor: ${deptLabel(found[0].dept)}.`
        : `**${found[0].nome}** (Cód. ${found[0].id}) — ${deptLabel(found[0].dept)}\nTotal: **${total.toFixed(3)} kg** | Loja: ${loja.toFixed(3)} | Câmara: ${camara.toFixed(3)} kg`;
    }
    if (found.length > 1 && found.length <= 5) {
      const lista = found
        .map((it) => {
          const { total } = formatTotal(it);
          return `  • [${it.id}] ${it.nome} — ${total > 0 ? total.toFixed(3) + " kg" : "Não pesado"}`;
        })
        .join("\n");
      return `Encontrei **${found.length} produtos** com "${text}":\n\n${lista}`;
    }
    if (found.length > 5)
      return `Encontrei ${found.length} resultados para "${text}". Seja mais específico ou use o código VR.`;
  }

  // Fallback
  return `Não entendi sua consulta. Tente:\n• **"código 91"** — busca por código\n• **"total açougue"** — total do setor\n• **"itens pendentes"** — o que falta pesar\n• **"resumo geral"** — visão completa`;
}

// ─── Atalhos ──────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "📊 Resumo Geral", query: "resumo geral" },
  { label: "🥩 Açougue", query: "total açougue" },
  { label: "🧀 Frios", query: "total frios" },
  { label: "🥬 Hortifruti", query: "total hortifruti" },
  { label: "⏳ Pendentes", query: "itens pendentes" },
];

// ─── Bolha de mensagem ────────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const isBot = msg.role === "bot";

  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex items-end gap-2 ${isBot ? "flex-row" : "flex-row-reverse"}`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
          isBot
            ? "bg-gradient-to-br from-amber-500 to-yellow-600"
            : "bg-gradient-to-br from-slate-600 to-slate-700"
        }`}
      >
        {isBot ? <Bot size={15} className="text-white" /> : <User size={15} className="text-white" />}
      </div>

      <div
        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-md ${
          isBot
            ? "bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-sm"
            : "bg-amber-600 text-white rounded-br-sm"
        }`}
      >
        {renderContent(msg.content)}
        <span className="block mt-1 text-[10px] opacity-40 text-right">{msg.time}</span>
      </div>
    </motion.div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function InventoryChat({ items, allHistory }) {
  const getTime = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      content:
        "Olá! 👋 Sou o **Assistente de Balanço**.\n\nDigite um código VR, nome de produto ou use os atalhos abaixo para consultar o inventário em tempo real.",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [isOpen, messages]);

  const sendMessage = (text) => {
    const query = (text !== undefined ? text : input).trim();
    if (!query) return;

    const userMsg = { id: Date.now(), role: "user", content: query, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = processQuery(query, items);
      const botMsg = { id: Date.now() + 1, role: "bot", content: response, time: getTime() };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        id="chat-toggle-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-[100px] right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_8px_32px_rgba(245,158,11,0.45)] border-2 border-amber-400/40 print:hidden"
        aria-label="Abrir Assistente de Balanço"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute inset-0 rounded-full ring-2 ring-amber-400/60 animate-ping pointer-events-none" />
        )}
      </motion.button>

      {/* Janela do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-[182px] right-4 z-40 w-[calc(100vw-2rem)] max-w-sm print:hidden"
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
              style={{
                background: "rgba(15, 23, 42, 0.88)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                height: "480px",
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-amber-600/25 to-yellow-600/15 border-b border-white/10 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white leading-tight">Assistente de Balanço</h3>
                  <p className="text-[10px] text-amber-300/70 font-medium truncate">
                    💡 Consulta em tempo real · {items.length} produtos cadastrados
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg} />
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-end gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                      <Bot size={15} className="text-white" />
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 bg-amber-400 rounded-full block"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Atalhos */}
              <div className="px-3 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: "none" }}>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.query}
                    onClick={() => sendMessage(action.query)}
                    className="shrink-0 text-[10px] font-semibold bg-slate-800/70 hover:bg-amber-600/25 border border-slate-700/50 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1"
                  >
                    <Zap size={9} className="shrink-0" />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 shrink-0">
                <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-3 py-2 focus-within:border-amber-500/60 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: código 91 / total açougue..."
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Send size={14} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
