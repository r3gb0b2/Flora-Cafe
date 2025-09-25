
// This assumes jsPDF and jsPDF-AutoTable are loaded from a CDN in index.html
declare const jspdf: any;

export const exportToPDF = (title: string, headers: string[], data: (string|number)[][], filename: string) => {
  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  doc.text(title, 14, 16);
  (doc as any).autoTable({
    startY: 22,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] }
  });

  doc.save(`${filename}.pdf`);
};
