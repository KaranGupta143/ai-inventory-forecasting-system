import { useState, useCallback } from 'react';
import { Product, ForecastResult } from '@/lib/types';
import { analyzeForecast } from '@/lib/forecasting';
import DashboardCards from '@/components/DashboardCards';
import DataUpload from '@/components/DataUpload';
import ForecastTable from '@/components/ForecastTable';
import Charts from '@/components/Charts';
import ReportGenerator from '@/components/ReportGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Zap } from 'lucide-react';

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<ForecastResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ForecastResult | null>(null);

  const handleAnalyze = useCallback(() => {
    if (products.length === 0) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const forecast = analyzeForecast(products);
      setResults(forecast);
      setIsAnalyzing(false);
      setSelectedProduct(forecast[0]);
    }, 1800);
  }, [products]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center stat-glow-cyan">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight leading-none">
                <span className="gradient-text">SmartStock</span>{' '}
                <span className="text-foreground">AI</span>
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5 font-medium">
                Inventory Intelligence & Demand Forecasting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-xs text-muted-foreground bg-success/5 border border-success/20 rounded-full px-3 py-1.5"
              >
                <Activity className="h-3 w-3 text-success animate-pulse-soft" />
                <span className="font-medium">{results.length} products analyzed</span>
              </motion.div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <Zap className="h-3 w-3" />
              <span>v2.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Cards */}
        <AnimatePresence>
          {results.length > 0 && <DashboardCards results={results} />}
        </AnimatePresence>

        {/* Data Upload */}
        <section>
          <SectionHeader title="Data Input" subtitle="Upload your inventory data or try with demo data" />
          <DataUpload
            onDataLoaded={setProducts}
            onAnalyze={handleAnalyze}
            hasData={products.length > 0}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Analysis Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              className="space-y-8"
            >
              <section>
                <SectionHeader title="Analytics & Visualizations" subtitle="Interactive charts — click table rows to explore individual products" />
                <Charts results={results} selectedProduct={selectedProduct} />
              </section>

              <section>
                <SectionHeader title="AI Forecast & Recommendations" subtitle="Expand rows for detailed business insights and suggested actions" />
                <ForecastTable results={results} onSelectProduct={setSelectedProduct} />
              </section>

              <section>
                <SectionHeader title="Intelligence Report" subtitle="Download professional reports for stakeholder review" />
                <ReportGenerator results={results} />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 mt-16 py-8">
        <p className="text-center text-[11px] text-muted-foreground/50 tracking-wide">
          AI-Powered Inventory Automation Tool &nbsp;·&nbsp; Built as part of AI Automation Portfolio
        </p>
      </footer>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div>
        <h2 className="text-sm font-display font-semibold text-foreground">{title}</h2>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
    </div>
  );
}
