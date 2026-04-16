import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { sampleProducts } from '@/lib/sampleData';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Props {
  onDataLoaded: (data: Product[]) => void;
  onAnalyze: () => void;
  hasData: boolean;
  isAnalyzing: boolean;
}

export default function DataUpload({ onDataLoaded, onAnalyze, hasData, isAnalyzing }: Props) {
  const [preview, setPreview] = useState<Product[]>([]);
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Product>(sheet);
        if (json.length === 0) { toast.error('No data found in file'); return; }
        setPreview(json.slice(0, 5));
        onDataLoaded(json);
        toast.success(`Successfully loaded ${json.length} products from ${file.name}`);
      } catch {
        toast.error('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const loadSample = () => {
    setFileName('demo_data.csv');
    setPreview(sampleProducts.slice(0, 5));
    onDataLoaded(sampleProducts);
    toast.success('Loaded 10 sample products for demo');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex-1 glass-card p-8 border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center gap-4 ${
            dragOver ? 'border-primary/60 bg-primary/5 scale-[1.01]' : hasData ? 'border-success/30 bg-success/5' : 'border-border/40 hover:border-primary/30 hover:bg-primary/[0.02]'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.xlsx,.xls';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) processFile(file);
            };
            input.click();
          }}
        >
          {hasData ? (
            <>
              <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-success">Data loaded successfully</p>
                <p className="text-xs text-muted-foreground mt-1">{fileName} — click to replace</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Drop your CSV or Excel file here, or <span className="text-primary font-semibold">browse files</span>
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-2 font-mono">
                  Required columns: Product_Name, SKU, Current_Stock, Past_Sales_Week1…12
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:w-48">
          <Button
            variant="outline"
            onClick={loadSample}
            className="gap-2 h-12 border-border/40 bg-card/40 hover:bg-card/80 hover:border-primary/30 transition-all"
          >
            <Database className="h-4 w-4 text-primary" /> Load Demo Data
          </Button>
          <Button
            onClick={onAnalyze}
            disabled={!hasData || isAnalyzing}
            className="gap-2 h-12 bg-primary text-primary-foreground hover:bg-primary/85 font-semibold shadow-lg shadow-primary/20 disabled:shadow-none transition-all"
          >
            {isAnalyzing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing…' : 'Analyze with AI'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card overflow-x-auto">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Data Preview</span>
                <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">First 5 rows</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/20">
                    {['Product', 'SKU', 'Stock', 'W1 Sales', 'W12 Sales'].map(h => (
                      <th key={h} className={`px-4 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground ${h === 'Product' ? 'text-left' : 'text-right'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/10 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-sm">{p.Product_Name}</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground text-right">{p.SKU}</td>
                      <td className="px-4 py-2.5 font-mono text-right font-semibold">{p.Current_Stock.toLocaleString()}</td>
                      <td className="px-4 py-2.5 font-mono text-right">{p.Past_Sales_Week1}</td>
                      <td className="px-4 py-2.5 font-mono text-right">{p.Past_Sales_Week12}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
