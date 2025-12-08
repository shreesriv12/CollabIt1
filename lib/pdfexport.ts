import { toJpeg, toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Exports the content of a DOM element (like the canvas main container) to a JPG, PNG, or PDF file.
 * @param element The DOM element (e.g., the <main> tag) to capture.
 * @param filename The base filename.
 * @param format The desired export format ('jpg', 'png', or 'pdf').
 */
export async function exportCanvas(
  element: HTMLElement,
  filename: string,
  format: 'jpg' | 'png' | 'pdf',
) {
  if (format === 'pdf') {
    // 1. Capture as PNG first (recommended for vector graphics + embedded HTML like ForeignObjects)
    const dataUrl = await toPng(element, {
      quality: 1,
      // Ensure background is captured (crucial for transparent SVG elements to be visible)
      backgroundColor: '#f5f5f5', // Neutral-100 background of your main
      // You may need to set a scale if the canvas size is small in relation to the layers, 
      // or to capture the entire visible area only.
    });

    // 2. Initialize PDF
    const pdf = new jsPDF({
      orientation: 'landscape', // or 'portrait' based on your board aspect ratio
      unit: 'px',
      format: 'a4',
    });

    // 3. Calculate dimensions for PDF fit
    const imgWidth = 842; // A4 landscape width in pixels @ 72dpi (common browser standard)
    const pageHeight = 595; // A4 landscape height in pixels @ 72dpi
    const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;
    let heightLeft = imgHeight;
    let position = 0;

    // 4. Add image, handling multi-page output if needed (simple)
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Simple multi-page implementation (for large boards)
    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } else if (format === 'jpg' || format === 'png') {
    const dataUrlFunction = format === 'jpg' ? toJpeg : toPng;
    
    const dataUrl = await dataUrlFunction(element, { 
        quality: format === 'jpg' ? 0.95 : 1,
        backgroundColor: '#f5f5f5', // Ensure background is captured
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    throw new Error('Unsupported export format.');
  }
}