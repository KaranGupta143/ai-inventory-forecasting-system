import { Product, ForecastResult } from './types';

function getWeeklySales(p: Product): number[] {
  return [
    p.Past_Sales_Week1, p.Past_Sales_Week2, p.Past_Sales_Week3, p.Past_Sales_Week4,
    p.Past_Sales_Week5, p.Past_Sales_Week6, p.Past_Sales_Week7, p.Past_Sales_Week8,
    p.Past_Sales_Week9, p.Past_Sales_Week10, p.Past_Sales_Week11, p.Past_Sales_Week12,
  ];
}

function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const xMean = (n - 1) / 2;
  const yMean = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (data[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: yMean - slope * xMean };
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function buildExplanation(
  productName: string,
  riskLevel: 'High' | 'Medium' | 'Low',
  weeksOfStock: number,
  avgWeeklySales: number,
  trend: number,
  reorderQty: number,
  forecast30: number,
  currentStock: number
): string {
  const trendPct = avgWeeklySales > 0 ? Math.abs(trend / avgWeeklySales * 100).toFixed(0) : '0';
  const trendDir = trend > 1 ? 'growing' : trend < -1 ? 'declining' : 'steady';
  const daysOfStock = Math.round(weeksOfStock * 7);

  if (riskLevel === 'High') {
    return `🚨 ${productName} has only ~${daysOfStock} days of inventory left at current sell-through rates. ` +
      `Demand is ${trendDir}${trend > 1 ? ` (+${trendPct}% week-over-week)` : ''}, ` +
      `with projected demand of ${formatNumber(forecast30)} units over the next 30 days — ` +
      `far exceeding the ${formatNumber(currentStock)} units on hand. ` +
      `Recommend placing an urgent reorder of ${formatNumber(reorderQty)} units to avoid lost sales and backorders.`;
  }
  if (riskLevel === 'Medium') {
    return `⚠️ ${productName} has approximately ${daysOfStock} days of stock remaining. ` +
      `Weekly sell-through averages ${formatNumber(avgWeeklySales)} units with a ${trendDir} trend${trend > 1 ? ` (+${trendPct}% WoW)` : ''}. ` +
      `Projected 30-day demand is ${formatNumber(forecast30)} units. ` +
      `Suggest scheduling a reorder of ${formatNumber(reorderQty)} units within the next 5–7 business days to maintain healthy buffer levels.`;
  }
  return `✅ ${productName} is well-stocked with ~${daysOfStock} days of coverage. ` +
    `Demand has been ${trendDir} at ${formatNumber(avgWeeklySales)} units/week. ` +
    `Current inventory of ${formatNumber(currentStock)} units comfortably covers the projected ${formatNumber(forecast30)} units of 30-day demand. ` +
    `${reorderQty > 0 ? `A routine restock of ${formatNumber(reorderQty)} units can be planned at standard lead time.` : 'No reorder needed at this time.'}`;
}

export function analyzeForecast(products: Product[]): ForecastResult[] {
  return products.map(p => {
    const sales = getWeeklySales(p);
    const avg = sales.reduce((a, b) => a + b, 0) / sales.length;
    const { slope, intercept } = linearRegression(sales);

    const forecastWeek = (w: number) => Math.max(0, Math.round(intercept + slope * (11 + w)));
    const forecast15 = Math.round(forecastWeek(2) * 15 / 7);
    const forecast30 = Math.round(forecastWeek(4) * 30 / 7);
    const forecast60 = Math.round(forecastWeek(8) * 60 / 7);

    const weeksOfStock = avg > 0 ? p.Current_Stock / avg : 999;
    const riskLevel: 'High' | 'Medium' | 'Low' =
      weeksOfStock < 1.5 ? 'High' : weeksOfStock < 4 ? 'Medium' : 'Low';

    const targetStock = Math.ceil(avg * 6 * (1 + Math.max(0, slope / avg) * 2));
    const reorderQty = Math.max(0, targetStock - p.Current_Stock);

    const explanation = buildExplanation(
      p.Product_Name, riskLevel, weeksOfStock, avg, slope, reorderQty, forecast30, p.Current_Stock
    );

    return {
      Product_Name: p.Product_Name,
      SKU: p.SKU,
      Current_Stock: p.Current_Stock,
      avgWeeklySales: Math.round(avg),
      trend: Math.round(slope * 100) / 100,
      forecast15,
      forecast30,
      forecast60,
      riskLevel,
      reorderQty,
      explanation,
      weeklySales: sales,
    };
  });
}
