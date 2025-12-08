import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportBoardAsImage(
  canvasElement: HTMLCanvasElement,
  boardTitle: string
): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(canvasElement, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  } catch (error) {
    console.error("Error exporting board as image:", error);
    return null;
  }
}

export async function exportBoardAsPDF(
  canvasElement: HTMLCanvasElement,
  boardTitle: string
): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(canvasElement, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      pdf.output("blob").then((blob) => {
        resolve(blob);
      });
    });
  } catch (error) {
    console.error("Error exporting board as PDF:", error);
    return null;
  }
}

export async function uploadExportedFile(
  file: Blob,
  fileName: string,
  mimeType: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/drive/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        fileContent: await file.arrayBuffer(),
        mimeType,
        type: "file",
        accessToken,
      }),
    });

    const data = await response.json();
    return data.fileId || null;
  } catch (error) {
    console.error("Error uploading exported file:", error);
    return null;
  }
}