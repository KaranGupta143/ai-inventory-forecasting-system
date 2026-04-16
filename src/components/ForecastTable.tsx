import { useState } from 'react';
import { ForecastResult } from '@/lib/types';
import { ArrowUpDown, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  results: ForecastResult[];
  onSelectProduct: (product: ForecastResult) => void;
}

type SortKey = 'Product_Name' | 'riskLevel' | 'forecast30' | 'reorderQty' | 'Current_Stock';

const riskOrder = { High: 0, Medium: 1, Low: 2 };

export default function ForecastTable({ results, onSelectProduct }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('riskLevel');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...results]
    .filter(r => filter === 'All' || r.riskLevel === filter)
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'riskLevel') cmp = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      else if (sortKey === 'Product_Name') cmp = a.Product_Name.localeCompare(b.Product_Name);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filterCounts = {
    All: results.length,
    High: results.filter(r => r.riskLevel === 'High').length,
    Medium: results.filter(r => r.riskLevel === 'Medium').length,
    Low: results.filter(r => r.riskLevel === 'Low').length,
  };

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 1) return <TrendingUp className="h-3.5 w-3.5 text-success" />;
    if (trend < -1) return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const SortHeader = ({ label, k, align = 'left' }: { label: string; k: SortKey; align?: string }) => (
    <th
      className={`px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] cursor-pointer hover:text-foreground transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => toggleSort(k)}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === k ? 'text-primary' : 'opacity-40'}`} />
      </span>
    </th>
  );

  return (
    <div className="glass-card-elevated overflow-hidden">
      {/* Filter Bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <h3 className="text-sm font-display font-semibold">Forecast Results</h3>
        <div className="flex gap-1.5 bg-muted/30 p-1 rounded-xl">
          {(['All', 'High', 'Medium', 'Low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 ${
                filter === f
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f} <span className="opacity-50 ml-0.5">{filterCounts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/20">
              <SortHeader label="Product" k="Product_Name" />
              <th className="px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">SKU</th>
              <SortHeader label="Stock" k="Current_Stock" align="right" />
              <th className="px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] text-center">Trend</th>
              <SortHeader label="Risk" k="riskLevel" align="center" />
              <SortHeader label="30d Demand" k="forecast30" align="right" />
              <SortHeader label="Reorder" k="reorderQty" align="right" />
              <th className="px-4 py-3.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <motion.tr
                key={r.SKU}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.025 }}
                className="group border-b border-border/10 hover:bg-muted/15 cursor-pointer transition-colors"
                onClick={() => onSelectProduct(r)}
              >
                <td className="px-4 py-3.5">
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">{r.Product_Name}</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{r.SKU}</td>
                <td className="px-4 py-3.5 text-right font-mono font-semibold text-sm">{r.Current_Stock.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center">
                    <TrendIcon trend={r.trend} />
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                    r.riskLevel === 'High' ? 'risk-badge-high' :
                    r.riskLevel === 'Medium' ? 'risk-badge-medium' :
                    'risk-badge-low'
                  }`}>
                    {r.riskLevel}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-sm">{r.forecast30.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-right">
                  {r.reorderQty > 0 ? (
                    <span className="font-mono font-bold text-sm text-warning">{r.reorderQty.toLocaleString()}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(expanded === r.SKU ? null : r.SKU); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/30"
                  >
                    {expanded === r.SKU ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Expanded Rows */}
        {sorted.map(r => (
          <AnimatePresence key={`exp-${r.SKU}`}>
            {expanded === r.SKU && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-border/10 bg-muted/10"
              >
                <div className="px-6 py-4 space-y-3">
                  <p className="text-sm leading-relaxed text-foreground/85">{r.explanation}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {[
                      { label: '15-day forecast', val: r.forecast15.toLocaleString(), unit: 'units' },
                      { label: '30-day forecast', val: r.forecast30.toLocaleString(), unit: 'units' },
                      { label: '60-day forecast', val: r.forecast60.toLocaleString(), unit: 'units' },
                      { label: 'Avg weekly sales', val: r.avgWeeklySales.toLocaleString(), unit: 'units/wk' },
                      { label: 'Trend slope', val: r.trend > 0 ? `+${r.trend}` : `${r.trend}`, unit: 'units/wk' },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/30 rounded-xl px-3 py-2 min-w-[120px]">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</p>
                        <p className="font-mono font-semibold text-foreground">{s.val} <span className="text-muted-foreground font-normal">{s.unit}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
