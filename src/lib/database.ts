import type { InventoryItem, SalesRecord } from './supabase';
import { supabase } from './supabase';

// Inventory operations
export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('category', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function updateInventoryStock(
  itemId: number,
  newQuantity: number
): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', itemId);
  
  if (error) throw error;
}

export async function updateItemPrice(
  itemId: number,
  newSellingPrice: number
): Promise<void> {
  const costPrice = newSellingPrice * 0.7; // 30% margin
  
  const { error } = await supabase
    .from('inventory')
    .update({
      selling_price: newSellingPrice,
      cost_price: costPrice,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId);
  
  if (error) throw error;
}

export async function updateInventoryItem(
  itemId: number,
  name: string,
  flavor: string,
  category: string,
  sellingPrice: number,
  stockQuantity: number,
  reorderLevel: number
): Promise<void> {
  const costPrice = sellingPrice * 0.7; // 30% margin
  
  const { error } = await supabase
    .from('inventory')
    .update({
      name,
      flavor,
      category,
      selling_price: sellingPrice,
      cost_price: costPrice,
      stock_quantity: stockQuantity,
      reorder_level: reorderLevel,
      updated_at: new Date().toISOString()
    })
    .eq('id', itemId);
  
  if (error) throw error;
}

export async function addInventoryItem(
  name: string,
  flavor: string,
  category: string,
  sellingPrice: number,
  quantity: number
): Promise<void> {
  const costPrice = sellingPrice * 0.7; // 30% margin
  
  const { error } = await supabase
    .from('inventory')
    .insert([{
      name,
      flavor,
      category,
      selling_price: sellingPrice,
      cost_price: costPrice,
      stock_quantity: quantity,
      reorder_level: 10
    }]);
  
  if (error) throw error;
}

// Sales operations
export async function recordSale(
  itemId: number,
  quantity: number,
  sellingPrice: number,
  costPrice: number
): Promise<void> {
  const totalRevenue = sellingPrice * quantity;
  const totalProfit = (sellingPrice - costPrice) * quantity;
  
  const { error } = await supabase
    .from('sales')
    .insert([{
      item_id: itemId,
      quantity,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      timestamp: new Date().toISOString()
    }]);
  
  if (error) throw error;
}

// Sales analytics
export async function fetchSalesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<SalesRecord[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString())
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function calculateSalesStats(startDate: Date, endDate: Date) {
  const sales = await fetchSalesByDateRange(startDate, endDate);
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_revenue, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.total_profit, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  return { totalRevenue, totalProfit, totalItems };
}

// Top selling items
export async function getTopSellingItems(
  startDate: Date,
  endDate: Date,
  limit: number = 10
) {
  const sales = await fetchSalesByDateRange(startDate, endDate);
  
  const itemSales: Record<number, { quantity: number; revenue: number; profit: number }> = {};
  
  sales.forEach((sale) => {
    if (!itemSales[sale.item_id]) {
      itemSales[sale.item_id] = { quantity: 0, revenue: 0, profit: 0 };
    }
    itemSales[sale.item_id].quantity += sale.quantity;
    itemSales[sale.item_id].revenue += sale.total_revenue;
    itemSales[sale.item_id].profit += sale.total_profit;
  });
  
  const inventory = await fetchInventory();
  
  return Object.entries(itemSales)
    .map(([itemId, stats]) => {
      const item = inventory.find(i => i.id === parseInt(itemId));
      return {
        itemId: parseInt(itemId),
        name: item?.name,
        flavor: item?.flavor,
        ...stats
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

// Reorder recommendations
export async function getRestockRecommendations() {
  const inventory = await fetchInventory();
  
  return inventory
    .filter(item => item.stock_quantity <= item.reorder_level)
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .map(item => ({
      itemId: item.id,
      name: item.name,
      flavor: item.flavor,
      currentStock: item.stock_quantity,
      reorderLevel: item.reorder_level,
      suggestedQuantity: item.reorder_level * 5 - item.stock_quantity
    }));
}
