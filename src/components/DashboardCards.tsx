import { motion } from 'framer-motion';
import { Package, ShieldCheck, AlertTriangle, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { ForecastResult } from '@/lib/types';

interface Props {
  results: ForecastResult[];
}

export default function DashboardCards({ results }: Props) {
  const totalProducts = results.length;
  const highRisk = results.filter(r => r.riskLevel === 'High').length;
  const medRisk = results.filter(r => r.riskLevel === 'Medium').length;
  const urgentReorder = results.filter(r => r.riskLevel === 'High').length;
  const healthScore = totalProducts > 0
    ? Math.round(((totalProducts - highRisk - medRisk * 0.5) / totalProducts) * 100)
    : 0;
  const totalReorder = results.reduce((sum, r) => sum + r.reorderQty, 0);

  const cards = [
    {
      label: 'Total Products',
      value: totalProducts,
      subtitle: `${results.filter(r => r.trend > 0).length} trending up`,
      icon: Package,
      color: 'text-primary',
      glow: 'stat-glow-cyan',
      iconBg: 'bg-primary/10',
    },
    {
      label: 'Stock Health Score',
      value: `${healthScore}%`,
      subtitle: healthScore >= 70 ? 'Healthy inventory' : 'Needs attention',
      icon: ShieldCheck,
      color: 'text-success',
      glow: 'stat-glow-green',
      iconBg: 'bg-success/10',
    },
    {
      label: 'Stock-out Risk (30d)',
      value: highRisk,
      subtitle: `${medRisk} medium risk items`,
      icon: AlertTriangle,
      color: highRisk > 0 ? 'text-destructive' : 'text-success',
      glow: highRisk > 0 ? 'stat-glow-red' : 'stat-glow-green',
      iconBg: highRisk > 0 ? 'bg-destructive/10' : 'bg-success/10',
    },
    {
      label: 'Urgent Reorders',
      value: urgentReorder,
      subtitle: `${totalReorder.toLocaleString()} total units needed`,
      icon: RotateCcw,
      color: urgentReorder > 0 ? 'text-warning' : 'text-success',
      glow: urgentReorder > 0 ? 'stat-glow-amber' : 'stat-glow-green',
      iconBg: urgentReorder > 0 ? 'bg-warning/10' : 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
          className={`glass-card p-5 ${c.glow} group hover:scale-[1.02] transition-transform duration-300`}
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{c.label}</span>
            <div className={`h-9 w-9 rounded-xl ${c.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <c.icon className={`h-[18px] w-[18px] ${c.color}`} />
            </div>
          </div>
          <p className={`text-4xl font-display font-bold tracking-tight ${c.color} mb-1`}>{c.value}</p>
          <p className="text-xs text-muted-foreground">{c.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
}
