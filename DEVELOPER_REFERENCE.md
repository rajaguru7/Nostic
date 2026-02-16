# 🔧 Developer Reference - Nostic Foods API

This document provides a comprehensive reference for all database functions and API operations.

---

## Database Client Setup

### Supabase Client
```typescript
import { supabase } from './lib/supabase';
```

**Available exports from `src/lib/supabase.ts`**:
- `supabase` - Initialized Supabase client
- `InventoryItem` - TypeScript type for inventory records
- `SalesRecord` - TypeScript type for sales records
- `StockHistory` - TypeScript type for stock history records

---

## Inventory Operations

### 1. Fetch All Inventory

```typescript
import { fetchInventory } from '../lib/database';

const items = await fetchInventory();
// Returns: InventoryItem[]
```

**Returns**:
```javascript
[
  {
    id: 1,
    name: "Popsicle",
    flavor: "Watermelon",
    category: "Popsicles",
    selling_price: 20,
    cost_price: 14,
    stock_quantity: 50,
    reorder_level: 10,
    created_at: "2026-02-16T00:00:00",
    updated_at: "2026-02-16T10:30:00"
  },
  // ... more items
]
```

---

### 2. Update Stock Quantity

```typescript
import { updateInventoryStock } from '../lib/database';

await updateInventoryStock(itemId: number, newQuantity: number);
```

**Parameters**:
- `itemId` (number) - The inventory item ID
- `newQuantity` (number) - New stock quantity

**Example**:
```typescript
// Deduct 5 units from item ID 1
await updateInventoryStock(1, 45);
```

---

### 3. Add New Inventory Item

```typescript
import { addInventoryItem } from '../lib/database';

await addInventoryItem(
  name: string,
  flavor: string,
  category: string,
  sellingPrice: number,
  quantity: number
);
```

**Parameters**:
- `name` (string) - Product name (e.g., "Popsicle", "Milk-Based", "Premium")
- `flavor` (string) - Flavor name (e.g., "Watermelon", "Mango")
- `category` (string) - Category ("Popsicles", "Milk-Based", "Premium")
- `sellingPrice` (number) - Selling price in rupees
- `quantity` (number) - Initial stock quantity

**Note**: Cost price is automatically calculated as 70% of selling price (30% margin)

**Example**:
```typescript
// Add 25 units of Strawberry Swirl (₹45) in Premium category
await addInventoryItem(
  "Ice Cream",
  "Strawberry Swirl",
  "Premium",
  45,
  25
);
// Cost will be: ₹45 × 0.7 = ₹31.50
```

---

## Sales Operations

### 1. Record a Sale

```typescript
import { recordSale } from '../lib/database';

await recordSale(
  itemId: number,
  quantity: number,
  sellingPrice: number,
  costPrice: number
);
```

**Parameters**:
- `itemId` (number) - Inventory item ID being sold
- `quantity` (number) - Units sold
- `sellingPrice` (number) - Selling price per unit
- `costPrice` (number) - Cost price per unit
- Automatically calculates:
  - `total_revenue` = sellingPrice × quantity
  - `total_profit` = (sellingPrice - costPrice) × quantity

**Example**:
```typescript
// Customer buys 3 watermelon popsicles
await recordSale(
  1,           // item_id: Watermelon popsicle
  3,           // quantity
  20,          // selling_price
  14           // cost_price
);
// Records: revenue=60, profit=18
```

---

### 2. Fetch Sales by Date Range

```typescript
import { fetchSalesByDateRange } from '../lib/database';

const sales = await fetchSalesByDateRange(
  startDate: Date,
  endDate: Date
);
// Returns: SalesRecord[]
```

**Parameters**:
- `startDate` (Date) - Start date (inclusive)
- `endDate` (Date) - End date (inclusive)

**Example**:
```typescript
import { startOfDay, endOfDay } from 'date-fns';

// Get today's sales
const todaySales = await fetchSalesByDateRange(
  startOfDay(new Date()),
  endOfDay(new Date())
);

// Get last 7 days
const last7Days = await fetchSalesByDateRange(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
);
```

**Returns**:
```javascript
[
  {
    id: 1001,
    item_id: 1,
    quantity: 3,
    total_revenue: 60,
    total_profit: 18,
    timestamp: "2026-02-16T10:30:00"
  },
  // ... more sales
]
```

---

## Analytics Functions

### 1. Calculate Sales Statistics

```typescript
import { calculateSalesStats } from '../lib/database';

const stats = await calculateSalesStats(
  startDate: Date,
  endDate: Date
);
// Returns: { totalRevenue, totalProfit, totalItems }
```

**Parameters**:
- `startDate` (Date) - Period start
- `endDate` (Date) - Period end

**Returns**:
```javascript
{
  totalRevenue: 1250.50,  // Total revenue in rupees
  totalProfit: 375.15,    // Total profit in rupees
  totalItems: 45          // Total units sold
}
```

**Example**:
```typescript
const stats = await calculateSalesStats(
  new Date('2026-02-16'),
  new Date('2026-02-16')
);

console.log(`Today's Revenue: ₹${stats.totalRevenue}`);
console.log(`Today's Profit: ₹${stats.totalProfit}`);
console.log(`Items Sold: ${stats.totalItems}`);
```

---

### 2. Get Top Selling Items

```typescript
import { getTopSellingItems } from '../lib/database';

const topItems = await getTopSellingItems(
  startDate: Date,
  endDate: Date,
  limit?: number  // Optional, defaults to 10
);
```

**Parameters**:
- `startDate` (Date) - Period start
- `endDate` (Date) - Period end
- `limit` (number, optional) - Number of items to return (default: 10)

**Returns**:
```javascript
[
  {
    itemId: 1,
    name: "Popsicle",
    flavor: "Watermelon",
    quantity: 45,        // Units sold
    revenue: 900,        // Total revenue
    profit: 270          // Total profit
  },
  // ... more items sorted by quantity descending
]
```

**Example**:
```typescript
// Top 5 items this month
const topMonth = await getTopSellingItems(
  startOfMonth(new Date()),
  endOfMonth(new Date()),
  5
);

topMonth.forEach((item, index) => {
  console.log(`${index + 1}. ${item.flavor} - ${item.quantity} units`);
});
```

---

### 3. Get Restock Recommendations

```typescript
import { getRestockRecommendations } from '../lib/database';

const recommendations = await getRestockRecommendations();
// Returns all items with stock <= reorder_level
```

**Returns**:
```javascript
[
  {
    itemId: 5,
    name: "Milk-Based",
    flavor: "Sitaphal",
    currentStock: 8,          // Current stock
    reorderLevel: 15,         // Reorder threshold
    suggestedQuantity: 67     // Recommended order quantity
  },
  // ... more items
]
```

**Logic**: `suggestedQuantity = (reorderLevel × 5) - currentStock`

**Example**:
```typescript
const lowStock = await getRestockRecommendations();

if (lowStock.length > 0) {
  console.log("Items to reorder:");
  lowStock.forEach(item => {
    console.log(
      `${item.flavor}: Order ${item.suggestedQuantity} units (Now: ${item.currentStock})`
    );
  });
}
```

---

## Database Schema Reference

### Inventory Table
```sql
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100),           -- Product type
  flavor VARCHAR(100),         -- Flavor name
  category VARCHAR(50),        -- Category
  selling_price DECIMAL(10,2), -- Rupees
  cost_price DECIMAL(10,2),    -- Auto-calculated as selling × 0.7
  stock_quantity INTEGER,      -- Current units
  reorder_level INTEGER,       -- Alert threshold
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES inventory(id),  -- Sold item
  quantity INTEGER,                         -- Units sold
  total_revenue DECIMAL(10,2),             -- sellingPrice × qty
  total_profit DECIMAL(10,2),              -- (sellPrice-costPrice) × qty
  timestamp TIMESTAMP                      -- Transaction time
);
```

### Stock History Table
```sql
CREATE TABLE stock_history (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES inventory(id),
  quantity_change INTEGER,                 -- Units added/removed
  reason VARCHAR(100),                     -- "Sale", "Restock", etc
  timestamp TIMESTAMP
);
```

---

## TypeScript Types

### InventoryItem
```typescript
type InventoryItem = {
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
```

### SalesRecord
```typescript
type SalesRecord = {
  id: number;
  item_id: number;
  quantity: number;
  total_revenue: number;
  total_profit: number;
  timestamp: string;
};
```

### StockHistory
```typescript
type StockHistory = {
  id: number;
  item_id: number;
  quantity_change: number;
  reason: string;
  timestamp: string;
};
```

---

## Common Workflows

### Complete POS Checkout Flow

```typescript
import {
  fetchInventory,
  recordSale,
  updateInventoryStock
} from '../lib/database';

async function checkoutCart(cartItems) {
  // 1. Record each sale
  for (const item of cartItems) {
    await recordSale(
      item.id,
      item.quantity,
      item.selling_price,
      item.cost_price
    );
  }

  // 2. Update inventory
  for (const item of cartItems) {
    const newStock = item.stock_quantity - item.quantity;
    await updateInventoryStock(item.id, newStock);
  }

  // 3. Return success
  return { success: true, items: cartItems.length };
}
```

---

### Daily Sales Report

```typescript
import {
  calculateSalesStats,
  getTopSellingItems,
  getRestockRecommendations
} from '../lib/database';
import { startOfDay, endOfDay } from 'date-fns';

async function generateDailyReport() {
  const today = new Date();
  
  const stats = await calculateSalesStats(
    startOfDay(today),
    endOfDay(today)
  );
  
  const topItems = await getTopSellingItems(
    startOfDay(today),
    endOfDay(today),
    5
  );
  
  const restockItems = await getRestockRecommendations();
  
  return {
    date: today.toLocaleDateString(),
    sales: stats,
    topItems,
    restockNeeded: restockItems.length > 0,
    items: restockItems
  };
}
```

---

### Add Multiple Items

```typescript
import { addInventoryItem } from '../lib/database';

const newMenu = [
  { name: "Ice Cream", flavor: "Choco Chip", cat: "Premium", price: 60, qty: 20 },
  { name: "Sorbet", flavor: "Mango", cat: "Premium", price: 80, qty: 15 },
  { name: "Kulfi", flavor: "Cardamom", cat: "Premium", price: 50, qty: 30 }
];

for (const item of newMenu) {
  await addInventoryItem(
    item.name,
    item.flavor,
    item.cat,
    item.price,
    item.qty
  );
}
```

---

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  await recordSale(1, 5, 20, 14);
} catch (error) {
  console.error('Sale recording failed:', error.message);
  // Handle error - show user message, log to monitoring service, etc
}
```

Common errors:
- **Item not found**: Check item ID exists
- **Invalid quantity**: Check stock availability
- **Network error**: Check Supabase connectivity
- **Permission error**: Check RLS policies

---

## Performance Tips

1. **Batch Operations**: For multiple items, use Promise.all()
   ```typescript
   await Promise.all([
     recordSale(1, 2, 20, 14),
     recordSale(5, 1, 30, 21),
     recordSale(9, 3, 50, 35)
   ]);
   ```

2. **Cache Inventory**: Store inventory in React state between operations
3. **Debounce Updates**: For rapid stock updates, batch them
4. **Date Caching**: Pre-calculate date ranges to avoid repeated calculations

---

## Extending the System

### Add New Analytics Function

```typescript
// In src/lib/database.ts
export async function getHourlyBreakdown(date: Date) {
  const sales = await fetchSalesByDateRange(
    startOfDay(date),
    endOfDay(date)
  );
  
  // Group by hour
  const byHour = {};
  sales.forEach(sale => {
    const hour = new Date(sale.timestamp).getHours();
    byHour[hour] = (byHour[hour] || 0) + sale.total_profit;
  });
  
  return byHour;
}
```

### Add Custom Filters

```typescript
export async function getSalesByCategory(category: string, startDate: Date, endDate: Date) {
  const sales = await fetchSalesByDateRange(startDate, endDate);
  const inventory = await fetchInventory();
  
  const categoryIds = inventory
    .filter(i => i.category === category)
    .map(i => i.id);
  
  return sales.filter(s => categoryIds.includes(s.item_id));
}
```

---

## Support & Resources

- **Supabase SDK**: https://supabase.com/docs/reference/javascript
- **Date-fns**: https://date-fns.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Last Updated**: February 16, 2026
**Version**: 1.0.0
**Status**: Complete & Production-Ready
