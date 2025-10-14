// src/lib/types/jspdf.d.ts
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}
