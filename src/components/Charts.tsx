import { ForecastResult } from '@/lib/types';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, RadialBarChart, RadialBar, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';

interface Props {
  results: ForecastResult[];
  selectedProduct: ForecastResult | null;
}

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#eab308',
  Low: '#22c55e',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-semibold text-foreground">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function Charts({ results, selectedProduct }: Props) {
  const product = selectedProduct || results[0];

  // Build trend + forecast data
  const historicalData = product
    ? product.weeklySales.map((v, i) => ({
        week: `W${i + 1}`,
        sales: v,
      }))
    : [];

  const forecastData = product
    ? [13, 14, 15, 16].map(w => ({
        week: `W${w}`,
        forecast: Math.max(0, Math.round(product.avgWeeklySales + product.trend * (w - 6))),
      }))
    : [];

  // Bridge: last historical + first forecast
  const bridgePoint = product
    ? { week: 'W12', sales: product.weeklySales[11], forecast: product.weeklySales[11] }
    : null;

  const chartData = [
    ...historicalData,
    ...(bridgePoint ? [bridgePoint] : []),
    ...forecastData,
  ];

  // Risk distribution for donut
  const riskCounts = {
    High: results.filter(r => r.riskLevel === 'High').length,
    Medium: results.filter(r => r.riskLevel === 'Medium').length,
    Low: results.filter(r => r.riskLevel === 'Low').length,
  };
  const donutData = [
    { name: 'High Risk', value: riskCounts.High, fill: RISK_COLORS.High },
    { name: 'Medium Risk', value: riskCounts.Medium, fill: RISK_COLORS.Medium },
    { name: 'Low Risk', value: riskCounts.Low, fill: RISK_COLORS.Low },
  ].filter(d => d.value > 0);

  // Bar chart: stock vs 30d demand
  const stockDemandData = results
    .sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    })
    .map(r => ({
      name: r.Product_Name.length > 14 ? r.Product_Name.slice(0, 14) + '…' : r.Product_Name,
      stock: r.Current_Stock,
      demand: r.forecast30,
      risk: r.riskLevel,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sales Trend Chart - spans 2 cols */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-5 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-display font-semibold">Sales Trend & Forecast</h3>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-6 rounded-full bg-primary" />Historical
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-6 rounded-full bg-success opacity-60 border border-dashed border-success" />Forecast
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{product?.Product_Name || 'Select a product'} — 12-week history + 4-week projection</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(190 95% 50%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(190 95% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152 69% 53%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(152 69% 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 13%)" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: 'hsl(215 15% 45%)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(215 15% 45%)', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(190 95% 50%)"
              fill="url(#salesGrad)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'hsl(190 95% 50%)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'hsl(190 95% 50%)', stroke: 'hsl(190 95% 50% / 0.3)', strokeWidth: 6 }}
              name="Actual Sales"
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="hsl(152 69% 53%)"
              fill="url(#forecastGrad)"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: 'hsl(152 69% 53%)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'hsl(152 69% 53%)', stroke: 'hsl(152 69% 53% / 0.3)', strokeWidth: 6 }}
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Distribution Donut */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-display font-semibold mb-1">Risk Distribution</h3>
        <p className="text-xs text-muted-foreground mb-2">Across all {results.length} products</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-5 mt-2">
          {donutData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.fill }} />
              <span className="text-muted-foreground">{d.name.replace(' Risk', '')}</span>
              <span className="font-mono font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stock vs Demand Bar Chart - full width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 lg:col-span-3"
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-display font-semibold">Current Stock vs. 30-Day Projected Demand</h3>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-6 rounded-full bg-primary/60" />Current Stock
            </span>
            <span className="flex items-center gap-1.5">
              <div className="h-2 w-6 rounded-full bg-warning/70" />30d Demand
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Products where demand exceeds stock require immediate attention</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stockDemandData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 13%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215 15% 45%)', fontSize: 9 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fill: 'hsl(215 15% 45%)', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {stockDemandData.map((entry, i) => (
                <Cell
                  key={`stock-${i}`}
                  fill={entry.risk === 'High' ? 'hsl(0 84% 60% / 0.4)' : entry.risk === 'Medium' ? 'hsl(43 96% 56% / 0.3)' : 'hsl(190 95% 50% / 0.4)'}
                />
              ))}
            </Bar>
            <Bar dataKey="demand" name="30d Demand" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {stockDemandData.map((entry, i) => (
                <Cell
                  key={`demand-${i}`}
                  fill={entry.risk === 'High' ? 'hsl(0 84% 60% / 0.8)' : entry.risk === 'Medium' ? 'hsl(43 96% 56% / 0.7)' : 'hsl(152 69% 53% / 0.6)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
