# 🍦 Nostic Foods - Ice Cream Management System

A professional cloud-first ice cream franchise management system built with React, Tailwind CSS, Recharts, and Supabase.

## 📋 Features

- **POS System**: Visual product grid for quick checkout with cart management
- **Dynamic Pricing**: Automatic 30% profit margin calculation
- **Receipt Printing**: Professional receipts with 5% GST and Nostic Foods branding
- **Admin Dashboard**: 
  - Inventory management with stock tracking
  - Real-time sales analytics with date range filtering
  - Profit tracking and margin analysis
  - AI-powered restock recommendations
  - Top-selling items visualization
- **Cloud Database**: All data persisted in Supabase PostgreSQL
- **No LocalStorage**: Pure cloud-based data management

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 4
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Date Utilities**: date-fns

## 📦 Installation

### Prerequisites

- Node.js 16.15.1+ and npm
- A Supabase account (free tier available)

### 1. Clone the Project

```bash
cd /Users/raja-11299/JSWorkspace/nostic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Configuration

#### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a **New project**
3. Name it: **`nostic-foods-ice-cream`**
4. Create a strong database password and select your region
5. Wait for the project to initialize (~2 minutes)

#### Step 2: Create Database Tables

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New query** and paste the following SQL:

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

-- Create Stock History (for tracking stock changes)
CREATE TABLE stock_history (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES inventory(id),
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Pre-populate Nostic Foods Menu
INSERT INTO inventory (name, flavor, category, selling_price, cost_price, stock_quantity, reorder_level)
VALUES
-- Popsicles (₹20, Cost: ₹14)
('Popsicle', 'Watermelon', 'Popsicles', 20.00, 14.00, 50, 10),
('Popsicle', 'Grape', 'Popsicles', 20.00, 14.00, 45, 10),
('Popsicle', 'Chilli Guava', 'Popsicles', 20.00, 14.00, 40, 10),
('Popsicle', 'Mojito', 'Popsicles', 20.00, 14.00, 35, 10),
-- Milk-Based
('Milk-Based', 'Chikoo', 'Milk-Based', 30.00, 21.00, 60, 15),
('Milk-Based', 'Sitaphal', 'Milk-Based', 30.00, 21.00, 55, 15),
('Milk-Based', 'Tender Coconut', 'Milk-Based', 30.00, 21.00, 50, 15),
('Milk-Based', 'Mango', 'Milk-Based', 35.00, 24.50, 45, 15),
-- Premium
('Premium', 'Lotus Biscoff', 'Premium', 50.00, 35.00, 30, 8),
('Premium', 'Strawberry 500ml', 'Premium', 175.00, 122.50, 25, 5),
('Premium', 'Mango 750ml', 'Premium', 280.00, 196.00, 20, 5);

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;

-- Create policies for read/write access
CREATE POLICY "Enable read access for all users" ON inventory FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON inventory FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON sales FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON stock_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON stock_history FOR INSERT WITH CHECK (true);
```

3. Click **Run** to execute the SQL

#### Step 3: Get Credentials

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy **Anon (public)** key from the `anon` row
4. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

5. Edit `.env.local` and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 Running the Project

### Development Mode

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📱 How to Use

### POS System (💳 Tab)

1. **Select Items**: Click on products organized by category
   - Popsicles (₹20): Watermelon, Grape, Chilli Guava, Mojito
   - Milk-Based (₹30-35): Various flavors
   - Premium (₹50-280): High-end frozen treats

2. **Manage Cart**:
   - Cart appears on the right sidebar
   - Adjust quantities using +/- buttons
   - Remove items with the ✕ button
   - View real-time profit calculation

3. **Checkout**:
   - Click **"Checkout & Print Receipt"**
   - System updates database automatically
   - Receipt prints with Nostic Foods header
   - Inventory is updated in real-time

### Admin Dashboard (📊 Tab)

#### Sales Tab
- **View Sales Analytics**:
  - Filter by: Today, This Week, Last 7 Days, This Month, Last 30 Days, or Custom Range
  - Display metrics: Total Revenue, Total Profit, Items Sold
  - Top-selling items chart

#### Inventory Tab
- **Add New Items**: Form to add stock with custom pricing
- **View Current Inventory**: Table with all products
  - Selling price & cost price
  - Current stock quantity
  - Stock status (Low Stock/OK)

#### Analytics Tab
- **Restock Recommendations**: AI-powered insights for items approaching reorder level
- **Profit Analysis**: Revenue vs Profit breakdown with margin percentage

## 💰 Financial Logic

- **Cost Price Calculation**: Automatically set to 70% of selling price (30% profit margin)
- **Profit Per Unit**: `(Selling Price - Cost Price) × Quantity`
- **GST**: 5% added to every bill at checkout
- **Example**: 
  - Popsicle ₹20 selling = ₹14 cost, ₹6 profit per unit
  - Milk-Based ₹30 selling = ₹21 cost, ₹9 profit per unit

## 📊 Database Schema

### Inventory Table
- `id`: Unique identifier
- `name`, `flavor`, `category`: Item details
- `selling_price`, `cost_price`: Pricing (auto-calculated with 30% margin)
- `stock_quantity`: Current stock
- `reorder_level`: Threshold for low stock warnings

### Sales Table
- `id`: Transaction ID
- `item_id`: Reference to inventory item
- `quantity`: Units sold
- `total_revenue`, `total_profit`: Calculated totals
- `timestamp`: Transaction time

## 🐛 Troubleshooting

### "Failed to load inventory" Error
- Check your `.env.local` credentials
- Verify Supabase URL and Anon key are correct
- Ensure tables were created successfully in Supabase

### Receipt Won't Print
- Disable pop-up blockers
- Check browser print settings
- Ensure JavaScript is enabled

### Stock Not Updated
- Verify internet connection
- Check Supabase RLS policies are enabled (see SQL setup)
- Refresh the page to see changes

## 📝 Project Structure

```
nostic/
├── src/
│   ├── components/
│   │   ├── POS.tsx              # Point of Sale system
│   │   ├── AdminDashboard.tsx   # Admin analytics & management
│   │   └── Receipt.tsx          # Receipt display & printing
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client setup
│   │   └── database.ts          # Database operations & analytics
│   ├── App.tsx                  # Main app with navigation
│   ├── index.css                # Tailwind CSS styles
│   └── main.tsx                 # React entry point
├── package.json                 # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## 🔐 Security Notes

- The Anon key is designed for public access (safe to expose)
- RLS policies ensure proper data access control
- All database operations use parameterized queries (Supabase SDKs handle this)
- No API endpoints are exposed - Supabase handles authentication

## 📈 Future Enhancements

- User authentication & multi-user management
- Monthly sales reports & exports
- Supplier management integration
- Customer loyalty program
- WhatsApp order integration
- API for franchise coordination

## 💡 Tips

- Use the Admin Dashboard to monitor business health
- Check restock recommendations daily
- Archive old sales data monthly for better performance
- Monitor profit margins weekly to optimize pricing

## 📧 Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Nostic Foods - Ice Cream Management System**
Built with ❤️ for franchise management excellence
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
