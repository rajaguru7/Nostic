import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase credentials
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type InventoryItem = {
  id: number;
  name: string;
  flavor: string;
  category: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  created_at: string;
  updated_at: string;
};

export type SalesRecord = {
  id: number;
  item_id: number;
  quantity: number;
  total_revenue: number;
  total_profit: number;
  timestamp: string;
};

export type StockHistory = {
  id: number;
  item_id: number;
  quantity_change: number;
  reason: string;
  timestamp: string;
};
