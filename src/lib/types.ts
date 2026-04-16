export interface Product {
  Product_Name: string;
  SKU: string;
  Current_Stock: number;
  Past_Sales_Week1: number;
  Past_Sales_Week2: number;
  Past_Sales_Week3: number;
  Past_Sales_Week4: number;
  Past_Sales_Week5: number;
  Past_Sales_Week6: number;
  Past_Sales_Week7: number;
  Past_Sales_Week8: number;
  Past_Sales_Week9: number;
  Past_Sales_Week10: number;
  Past_Sales_Week11: number;
  Past_Sales_Week12: number;
}

export interface ForecastResult {
  Product_Name: string;
  SKU: string;
  Current_Stock: number;
  avgWeeklySales: number;
  trend: number;
  forecast15: number;
  forecast30: number;
  forecast60: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  reorderQty: number;
  explanation: string;
  weeklySales: number[];
}
