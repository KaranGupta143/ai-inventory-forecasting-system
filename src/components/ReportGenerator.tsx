import { ForecastResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';

interface Props {
  results: ForecastResult[];
}

export default function ReportGenerator({ results }: Props) {
  const top5 = [...results].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.riskLevel] - order[b.riskLevel] || b.reorderQty - a.reorderQty;
  }).slice(0, 5);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setFontSize(22);
    doc.setTextColor(56, 189, 248);
    doc.text('SmartStock AI', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(180, 180, 200);
    doc.text('Weekly Stock Intelligence Report', 14, 30);
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 160);
    doc.text(`Generated: ${now}`, 14, 38);

    doc.setFontSize(13);
    doc.setTextColor(40, 40, 50);
    doc.text('Priority Items — Requiring Immediate Attention', 14, 58);

    autoTable(doc, {
      startY: 63,
      head: [['#', 'Product', 'SKU', 'Stock', 'Risk', '30d Demand', 'Reorder Qty']],
      body: top5.map((r, i) => [i + 1, r.Product_Name, r.SKU, r.Current_Stock, r.riskLevel, r.forecast30, r.reorderQty]),
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 4: { fontStyle: 'bold' } },
    });

    const afterTable = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 50);
    doc.text('Complete Inventory Forecast', 14, afterTable);

    autoTable(doc, {
      startY: afterTable + 5,
      head: [['Product', 'Stock', 'Risk', '15d', '30d', '60d', 'Reorder']],
      body: results.map(r => [r.Product_Name, r.Current_Stock, r.riskLevel, r.forecast15, r.forecast30, r.forecast60, r.reorderQty]),
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 2.5 },
      didParseCell: (data: any) => {
        if (data.column.index === 2 && data.section === 'body') {
          const val = data.cell.raw;
          if (val === 'High') { data.cell.styles.textColor = [239, 68, 68]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'Medium') { data.cell.styles.textColor = [234, 179, 8]; }
          else { data.cell.styles.textColor = [34, 197, 94]; }
        }
      },
    });

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text('AI-Powered Inventory Automation Tool  |  SmartStock AI  |  Confidential', 14, 287);

    doc.save('SmartStock_Intelligence_Report.pdf');
    toast.success('PDF report downloaded successfully');
  };

  const downloadCSV = () => {
    const headers = ['Product_Name', 'SKU', 'Current_Stock', 'Risk_Level', 'Forecast_15d', 'Forecast_30d', 'Forecast_60d', 'Reorder_Qty', 'Avg_Weekly_Sales', 'Trend'];
    const rows = results.map(r =>
      [r.Product_Name, r.SKU, r.Current_Stock, r.riskLevel, r.forecast15, r.forecast30, r.forecast60, r.reorderQty, r.avgWeeklySales, r.trend].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SmartStock_Forecast_Export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV data exported');
  };

  const riskIcon = (level: string) => {
    if (level === 'High') return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
    if (level === 'Medium') return <Clock className="h-4 w-4 text-warning shrink-0" />;
    return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
  };

  return (
    <div className="glass-card-elevated p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-display font-semibold">Weekly Stock Intelligence Report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top 5 products requiring immediate attention</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            className="gap-2 text-xs border-border/40 bg-card/40 hover:bg-card/80"
          >
            <FileDown className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            size="sm"
            onClick={downloadPDF}
            className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/85 shadow-lg shadow-primary/20"
          >
            <FileText className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {top5.map((r, i) => (
          <motion.div
            key={r.SKU}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-border/40 transition-colors"
          >
            <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 h-6 w-6 rounded-lg flex items-center justify-center">
                {i + 1}
              </span>
              {riskIcon(r.riskLevel)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold truncate">{r.Product_Name}</p>
                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
                  r.riskLevel === 'High' ? 'risk-badge-high' :
                  r.riskLevel === 'Medium' ? 'risk-badge-medium' :
                  'risk-badge-low'
                }`}>
                  {r.riskLevel}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.explanation}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
