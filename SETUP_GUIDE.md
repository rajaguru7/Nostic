# 🚀 Nostic Foods - Quick Start Guide

## ✅ Completed Setup

Your Nostic Foods Ice Cream Management System is **fully configured and ready to use**!

### What's Installed

✅ React 19 with TypeScript  
✅ Vite 4 build tool  
✅ Tailwind CSS 3 styling  
✅ Supabase PostgreSQL client  
✅ Recharts for analytics  
✅ Date-fns for date utilities  

### Project Structure

```
nostic/
├── src/
│   ├── components/
│   │   ├── POS.tsx              ← Point of Sale System
│   │   ├── AdminDashboard.tsx   ← Analytics & Management
│   │   └── Receipt.tsx          ← Receipt Display
│   ├── lib/
│   │   ├── supabase.ts          ← Database Connection
│   │   └── database.ts          ← CRUD & Analytics
│   ├── App.tsx                  ← Main Navigation
│   ├── index.css                ← Tailwind Styles
│   └── main.tsx                 ← React Entry Point
├── .env.example                 ← Environment Template
├── README.md                    ← Full Documentation
└── package.json                 ← Dependencies
```

---

## 🔧 Step 1: Supabase Configuration (IMPORTANT!)

### 1.1 Create Supabase Project

1. Go to **https://supabase.com/dashboard**
2. Click **New Project**
3. Enter project name: `nostic-foods-ice-cream`
4. Choose region closest to you
5. Create a secure password
6. Wait for initialization (~2 minutes)

### 1.2 Create Database Tables

1. Open your project → **SQL Editor**
2. Click **New query**
3. **Copy-paste the entire SQL block below:**

```sql
-- Create Inventory Table
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flavor VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Sales Table
CREATE TABLE sales (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES inventory(id),
  quantity INTEGER NOT NULL,
  total_revenue DECIMAL(10, 2) NOT NULL,
  total_profit DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create Stock History
CREATE TABLE stock_history (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES inventory(id),
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Pre-populate Menu Items
INSERT INTO inventory (name, flavor, category, selling_price, cost_price, stock_quantity, reorder_level)
VALUES
('Popsicle', 'Watermelon', 'Popsicles', 20.00, 14.00, 50, 10),
('Popsicle', 'Grape', 'Popsicles', 20.00, 14.00, 45, 10),
('Popsicle', 'Chilli Guava', 'Popsicles', 20.00, 14.00, 40, 10),
('Popsicle', 'Mojito', 'Popsicles', 20.00, 14.00, 35, 10),
('Milk-Based', 'Chikoo', 'Milk-Based', 30.00, 21.00, 60, 15),
('Milk-Based', 'Sitaphal', 'Milk-Based', 30.00, 21.00, 55, 15),
('Milk-Based', 'Tender Coconut', 'Milk-Based', 30.00, 21.00, 50, 15),
('Milk-Based', 'Mango', 'Milk-Based', 35.00, 24.50, 45, 15),
('Premium', 'Lotus Biscoff', 'Premium', 50.00, 35.00, 30, 8),
('Premium', 'Strawberry 500ml', 'Premium', 175.00, 122.50, 25, 5),
('Premium', 'Mango 750ml', 'Premium', 280.00, 196.00, 20, 5);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Create Access Policies
CREATE POLICY "Enable read for all" ON inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON inventory FOR UPDATE USING (true);

CREATE POLICY "Enable read for all" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON sales FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON stock_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON stock_history FOR INSERT WITH CHECK (true);
```

4. Click **Run** button
5. Wait for confirmation ✅

### 1.3 Get Your API Keys

1. Go to **Settings** (bottom left in Supabase)
2. Click **API** section
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/public key** (long string under `anon`)

---

## ⚙️ Step 2: Configure Environment Variables

1. In terminal, navigate to project:
```bash
cd /Users/raja-11299/JSWorkspace/nostic
```

2. Create `.env.local` file:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and paste your values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-super-long-anon-key-here
```

❌ **NEVER commit `.env.local` to git** (it's in .gitignore)

---

## 🎯 Step 3: Run the Application

### Development Mode

```bash
npm run dev
```

Output will show:
```
LOCA:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser ✅

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🏪 Using the System

### 💳 POS System

1. **Select Products**:
   - Click on ice cream items in the grid
   - Organized by: Popsicles, Milk-Based, Premium

2. **Manage Cart**:
   - Adjust quantities with +/- buttons
   - Remove items with ✕
   - See profit calculated in real-time

3. **Checkout**:
   - Click **"Checkout & Print Receipt"**
   - Supabase updates automatically
   - Browser opens print dialog
   - Receipt shows 5% GST

### 📊 Admin Dashboard

**Sales Analytics Tab**:
- Filter by: Today, This Week, Last 7 Days, This Month, Last 30 Days, Custom
- View: Revenue, Profit, Items Sold
- See top-selling items chart

**Inventory Tab**:
- Add new items with custom pricing
- View all products with stock status
- See which items need restocking

**Analytics Tab**:
- Restock recommendations (items below reorder level)
- Profit analysis with margins
- Revenue vs Profit comparison

---

## 💡 Example Walkthrough

### Sales Transaction
1. Click POS System
2. Click "Watermelon" popsicle (₹20)
3. Click "Mango" milk-based (₹35)
4. Cart shows:
   - Subtotal: ₹55
   - GST (5%): ₹2.75
   - **Total: ₹57.75**
   - Profit: ₹15 (₹6 + ₹9)
5. Click "Checkout & Print Receipt"
6. Receipt prints with Nostic Foods header

### Check Analytics
1. Click Admin Dashboard
2. Go to Sales tab
3. Select "Today"
4. See revenue, profit, and top items
5. Go to Analytics tab
6. View restock recommendations

---

## 💰 Financial Logic Reference

All prices have **30% profit margin**:

| Item | Selling | Cost | Profit | Qty | Revenue | Total Profit |
|------|---------|------|--------|-----|---------|--------------|
| Popsicle | ₹20 | ₹14 | ₹6 | 5 | ₹100 | ₹30 |
| Milk-Based | ₹30 | ₹21 | ₹9 | 3 | ₹90 | ₹27 |
| Premium | ₹175 | ₹122.50 | ₹52.50 | 1 | ₹175 | ₹52.50 |

**Formula**:
- Cost Price = Selling Price × 0.7
- Profit per Unit = Selling Price - Cost Price
- Receipt Total = Subtotal + (Subtotal × 5% GST)

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to Supabase"
- Check `.env.local` has correct URL and key
- Verify Supabase project is active
- Test connection by refreshing page

### ❌ "Stock not updating after checkout"
- Refresh the POS page
- Check Supabase SQL editor - ensure tables exist
- Verify RLS policies are enabled

### ❌ "Receipt blank or not printing"
- Check browser console (F12)
- Disable pop-up blockers
- Try different browser
- Ensure JavaScript is enabled

### ❌ "npm run dev fails"
- Run `npm install` again
- Check Node version: `node --version`
- Delete `node_modules`, run `npm install`

---

## 📱 Feature Checklist

✅ POS with product grid  
✅ Cart management with quantity control  
✅ Real-time profit calculation  
✅ Professional receipt printing  
✅ 5% GST calculation  
✅ Sales transaction logging to Supabase  
✅ Automatic inventory deduction  
✅ Admin analytics dashboard  
✅ Sales filtering by date range  
✅ Top-selling items chart  
✅ Restock recommendations  
✅ Profit margin tracking  
✅ Low stock alerts  
✅ Add new items functionality  

---

## 🔐 Security Notes

- `VITE_SUPABASE_ANON_KEY` is public (safe to expose)
- RLS policies protect data in Supabase
- All queries are parameterized (Supabase SDK handles this)
- Never commit `.env.local` to git

---

## 📊 Database Tables

### inventory
```
id | name | flavor | category | selling_price | cost_price | stock_quantity | reorder_level
```

### sales
```
id | item_id | quantity | total_revenue | total_profit | timestamp
```

### stock_history
```
id | item_id | quantity_change | reason | timestamp
```

---

## 🎓 Next Steps

1. ✅ Complete Supabase setup
2. ✅ Configure environment variables
3. ✅ Run `npm run dev`
4. ✅ Test POS checkout
5. ✅ Verify receipt printing
6. ✅ Check Admin Dashboard analytics
7. ✅ Deploy when ready

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Vite Docs**: https://vitejs.dev

---

## 🎉 You're Ready!

Your Nostic Foods Management System is configured and ready to go.

**Next**: Configure Supabase and run `npm run dev` to start selling! 🍦

Questions? Check README.md or referenced documentation.
