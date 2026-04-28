import * as XLSX from "xlsx";
import { toast } from "sonner";

export const gerarNomeArquivo = (prefixo, dataStr) => {
  const safeData = (dataStr || new Date().toLocaleDateString("pt-BR")).replace(/[\/\s:]/g, "-");
  return `${prefixo}_${safeData}`;
};

export const exportarVR = (items, dataStr) => {
  const exportData = items
    .filter((it) => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0)
    .map((it) => {
      const total = (it.estoque_loja || 0) + (it.estoque_camara || 0);
      return `${it.id};${total.toFixed(3)}`;
    })
    .join("\n");

  if (!exportData) {
    toast.error("Nenhum produto pesou > 0.");
    return false;
  }

  const blob = new Blob([exportData], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${gerarNomeArquivo("balanco_geral", dataStr)}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("Arquivo TXT exportado com sucesso!");
  return true;
};

export const exportarExcel = (items, dataStr) => {
  const dataToExport = items
    .filter((it) => (it.estoque_loja || 0) + (it.estoque_camara || 0) > 0)
    .map(it => ({
      "ID": it.id,
      "Nome": it.nome,
      "Loja (kg)": (it.estoque_loja || 0).toFixed(3).replace(".", ","),
      "Câmara (kg)": (it.estoque_camara || 0).toFixed(3).replace(".", ","),
      "Total Geral (kg)": ((it.estoque_loja || 0) + (it.estoque_camara || 0)).toFixed(3).replace(".", ",")
    }));

  if (dataToExport.length === 0) {
    toast.error("Nenhum produto pesou > 0.");
    return false;
  }

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventário");
  XLSX.writeFile(wb, `${gerarNomeArquivo("balanco_planilha", dataStr)}.xlsx`);
  toast.success("Planilha Excel exportada com sucesso!");
  return true;
};
