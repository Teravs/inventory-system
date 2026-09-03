import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityLog } from '../types';

interface ExportPdfOptions {
  logs: ActivityLog[];
  selectedMonth: string; // YYYY-MM
  operatorName?: string;
  operatorUsername?: string;
}

export const exportActivityLogsToPdf = ({
  logs,
  selectedMonth,
  operatorName = 'System User',
  operatorUsername = 'operator'
}: ExportPdfOptions) => {
  // Setup PDF document in Landscape A4 for optimal table spacing
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Format month label in Indonesian
  let monthLabel = selectedMonth;
  try {
    const [year, month] = selectedMonth.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, 1);
    monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  } catch {
    monthLabel = selectedMonth;
  }

  const currentDateFormatted = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Header Background Accent
  doc.setFillColor(37, 99, 235); // Primary Blue
  doc.rect(0, 0, pageWidth, 5, 'F');

  // 2. Company & Document Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('CHA ASSET — AUDIT & ACTIVITY LOG REPORT', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Sistem Informasi & Manajemen Inventaris Perangkat Internal', 14, 22);

  // 3. Metadata Information Card (Right and Left)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Border
  doc.roundedRect(14, 26, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  // Left info: Periode & Total Entries
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Audit:', 18, 32);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'bold');
  doc.text(monthLabel.toUpperCase(), 43, 32);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Total Catatan:', 18, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${logs.length} Aktivitas Terdaftar`, 43, 38);

  // Right info: Generated Date & Operator
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', pageWidth - 100, 32);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDateFormatted, pageWidth - 72, 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Dicetak Oleh:', pageWidth - 100, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${operatorName} (@${operatorUsername})`, pageWidth - 72, 38);

  // 4. Map Log Rows for Table
  const tableRows = logs.map((log, index) => {
    let formattedDate = log.createdAt;
    try {
      formattedDate = new Date(log.createdAt).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      formattedDate = log.createdAt;
    }

    const operator = log.user ? `${log.user.name}\n(@${log.user.username} - ${log.user.role})` : 'System';
    const entity = `${log.entityType}\n${log.entityId}`;

    return [
      (index + 1).toString(),
      formattedDate,
      operator,
      log.action,
      entity,
      log.description || '—'
    ];
  });

  // 5. Generate Styled Table
  autoTable(doc, {
    startY: 46,
    head: [['No', 'Waktu', 'Operator', 'Aksi', 'Entitas Target', 'Keterangan Aktivitas']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Dark Slate
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 2.8,
      valign: 'top'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 46 },
      3: { cellWidth: 26, fontStyle: 'bold' },
      4: { cellWidth: 40, fontStyle: 'bold' },
      5: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14, bottom: 16 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageNum = data.pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400

      doc.text(
        'Dokumen Rahasia Internal Kantor — CHA Asset Management System',
        14,
        pageHeight - 8
      );

      doc.text(
        `Halaman ${pageNum}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  });

  // 6. Save and Trigger Direct Download
  const filename = `Laporan_Audit_Log_CHA_Asset_${selectedMonth}.pdf`;
  doc.save(filename);
};

