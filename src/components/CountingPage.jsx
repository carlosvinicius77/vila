import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Check, Delete, Keyboard } from "lucide-react";

export function CountingPage({ items, updateItem }) {
  const [barcode, setBarcode] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("loja"); // 'loja' or 'camara'
  
  const barcodeInputRef = useRef(null);

  // Focus barcode input on mount and after registering
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const handleBarcodeChange = (e) => {
    const val = e.target.value;
    setBarcode(val);
    
    // Auto-lookup
    const found = items.find((it) => it.id.toString() === val);
    if (found) {
      setActiveItem(found);
    } else {
      setActiveItem(null);
    }
  };

  const handleKeypadPress = (key) => {
    if (key === "DEL") {
      setQuantity((prev) => prev.slice(0, -1));
    } else if (key === "clear") {
      setQuantity("");
    } else if (key === ".") {
      if (!quantity.includes(".")) {
        setQuantity((prev) => (prev ? prev + "." : "0."));
      }
    } else {
      setQuantity((prev) => prev + key);
    }
  };

  const handleRegister = () => {
    if (!activeItem) {
      toast.error("Produto não encontrado. Digite um código válido.");
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
      return;
    }

    const numValue = parseFloat(quantity);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("Insira uma quantidade válida.");
      return;
    }

    // Alerta de discrepância
    if (numValue > 100) {
      const confirmed = window.confirm(`Atenção! Você está registrando ${numValue} para o produto ${activeItem.nome}.\n\nTem certeza de que o valor está correto?`);
      if (!confirmed) return;
    }

    const field = location === "loja" ? "estoque_loja" : "estoque_camara";
    
    // Atualiza o item (Substituindo o valor existente. Em um cenário real de soma, faria prev + numValue, mas Balanço costuma ser substituição ou soma dependendo da regra. O App.jsx não nos dá prev value na updateItem facilmente se passarmos um absolute value. Assumiremos substituição para Balanço de Inventário).
    updateItem(activeItem.id, field, numValue);

    toast.success(`Registrado: ${numValue} ${activeItem.nome}`);
    
    // Reset state
    setBarcode("");
    setActiveItem(null);
    setQuantity("");
    
    // Refocus
    if (barcodeInputRef.current) barcodeInputRef.current.focus();
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300 pb-[80px]">
      
      {/* Location Toggle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-4 flex">
        <button
          onClick={() => setLocation("loja")}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
            location === "loja"
              ? "bg-blue-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Loja
        </button>
        <button
          onClick={() => setLocation("camara")}
          className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
            location === "camara"
              ? "bg-blue-600 text-white shadow"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Câmara
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col gap-4">
        {/* Field: Barcode */}
        <div className="flex flex-col">
          <label className="text-zinc-400 font-semibold mb-1 text-sm uppercase tracking-wider">Código de Barras</label>
          <input
            ref={barcodeInputRef}
            type="text"
            inputMode="numeric"
            value={barcode}
            onChange={handleBarcodeChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeItem) {
                 // Move to quantity logic or register directly if quantity exists
                 // Mas no coletor a pessoa vai bipar e preencher a qtd no teclado
              }
            }}
            placeholder="Biapar código..."
            className="bg-zinc-950 border-2 border-zinc-700 focus:border-blue-500 rounded-xl px-4 py-4 text-xl font-bold text-white outline-none w-full shadow-inner tracking-widest"
          />
        </div>

        {/* Field: Product Name (Read Only) */}
        <div className="flex flex-col">
          <label className="text-zinc-400 font-semibold mb-1 text-sm uppercase tracking-wider">Produto</label>
          <input
            type="text"
            readOnly
            value={activeItem ? activeItem.nome : ""}
            placeholder={activeItem ? "" : "Produto não encontrado"}
            className={`bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-lg font-medium outline-none w-full ${
              activeItem ? "text-emerald-400" : "text-zinc-600"
            }`}
             tabIndex={-1}
          />
        </div>

        {/* Field: Quantity Display */}
        <div className="flex flex-col mt-2">
          <label className="text-zinc-400 font-semibold mb-1 text-sm uppercase tracking-wider">Quantidade</label>
          <div className="bg-zinc-950 border-2 border-zinc-700 rounded-xl px-4 py-4 flex items-center justify-between">
            <span className={`text-4xl font-black ${quantity ? "text-white" : "text-zinc-600"}`}>
              {quantity || "0.00"}
            </span>
            <span className="text-zinc-500 font-bold">KG/UN</span>
          </div>
        </div>
      </div>

      {/* Numeric Keypad Panel */}
      <div className="bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-4 -mx-4 pb-8 flex-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
            {/* Row 1 */}
            <button onClick={() => handleKeypadPress("7")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">7</button>
            <button onClick={() => handleKeypadPress("8")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">8</button>
            <button onClick={() => handleKeypadPress("9")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">9</button>
            
            <button onClick={() => handleKeypadPress("DEL")} className="bg-red-900/40 hover:bg-red-900/60 active:bg-red-800/80 text-white border border-red-900/50 rounded-2xl h-16 text-xl font-bold transition-colors flex items-center justify-center row-span-2">
              <Delete size={28} />
            </button>

            {/* Row 2 */}
            <button onClick={() => handleKeypadPress("4")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">4</button>
            <button onClick={() => handleKeypadPress("5")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">5</button>
            <button onClick={() => handleKeypadPress("6")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">6</button>
            
            {/* Row 3 */}
            <button onClick={() => handleKeypadPress("1")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">1</button>
            <button onClick={() => handleKeypadPress("2")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">2</button>
            <button onClick={() => handleKeypadPress("3")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">3</button>

            <button onClick={handleRegister} className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl h-[136px] text-xl font-bold transition-colors shadow-lg shadow-emerald-900/20 flex flex-col items-center justify-center gap-2 row-span-2">
               <Check size={32} />
               <span className="text-sm">ENTER</span>
            </button>

            {/* Row 4 */}
            <button onClick={() => handleKeypadPress("clear")} className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-600 rounded-2xl h-16 text-sm font-bold transition-colors uppercase">Limpar</button>
            <button onClick={() => handleKeypadPress("0")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-2xl font-bold transition-colors">0</button>
            <button onClick={() => handleKeypadPress(".")} className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white rounded-2xl h-16 text-4xl font-bold transition-colors leading-[0px] pb-3">.</button>
         </div>
      </div>
    </div>
  );
}
