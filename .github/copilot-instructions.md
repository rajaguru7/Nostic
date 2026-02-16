# Nostic Foods - Ice Cream Management System
## Workspace Configuration

This is a cloud-first ice cream franchise management system with the following setup requirements:

### Project Overview
- **Technology**: React 19 + TypeScript + Vite 4 + Tailwind CSS 3 + Supabase
- **Purpose**: Complete POS system and admin dashboard for ice cream franchise management
- **Key Features**: Dynamic pricing (30% margins), receipt printing, real-time analytics, inventory tracking

### Prerequisites Setup
1. Node.js 16.15.1+ installed
2. Supabase account created at https://supabase.com
3. Environment variables configured in `.env.local`

### Supabase Configuration (CRITICAL)
Before running the app, you MUST:

1. Create a Supabase project at https://supabase.com/dashboard
2. Go to SQL Editor and run the entire SQL schema from README.md
3. Get your credentials from Settings → API:
   - Project URL (VITE_SUPABASE_URL)
   - Anon Key (VITE_SUPABASE_ANON_KEY)
4. Create `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Main Components
- **src/components/POS.tsx** - Point of Sale system with cart management
- **src/components/AdminDashboard.tsx** - Analytics and inventory management
- **src/components/Receipt.tsx** - Digital receipt with print functionality
- **src/lib/supabase.ts** - Supabase client configuration
- **src/lib/database.ts** - Database operations and analytics functions

### Database Schema
- **inventory**: Product catalog with pricing and stock tracking
- **sales**: Transaction records with revenue and profit calculations
- **stock_history**: Historical stock changes for auditing

### Financial Logic
- All prices have 30% profit margin (cost = selling × 0.7)
- Profit automatically calculated as (selling - cost) × quantity
- 5% GST added at checkout

### Key Functions
- `fetchInventory()` - Get all products
- `recordSale()` - Record transaction and calculate profit
- `calculateSalesStats()` - Get revenue/profit for date range
- `getTopSellingItems()` - Analytics on best performers
- `getRestockRecommendations()` - AI-powered inventory alerts

### Troubleshooting
- **"Failed to connect to Supabase"**: Check credentials in .env.local
- **"Stock not updating"**: Verify RLS policies are enabled in Supabase
- **"Receipt won't print"**: Check browser security settings and disable pop-up blockers

### Project Structure
```
src/
├── components/
│   ├── POS.tsx              # Main checkout interface
│   ├── AdminDashboard.tsx   # Management dashboard
│   └── Receipt.tsx          # Receipt display & printing
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── database.ts          # Database operations
├── App.tsx                  # Main application
├── index.css                # Tailwind CSS
└── main.tsx                 # React entry point
```

### Important Notes
- DO NOT save credentials to git (.env.local is in .gitignore)
- All data is persisted in Supabase - NO localStorage usage
- RLS policies must be enabled for security
- Anon key is public-facing (designed for this)
- Always test Supabase connectivity before deployment

### Performance Considerations
- Charts use Recharts for optimized rendering
- Date filtering is done client-side with date-fns
- Consider pagination for large inventory/sales datasets
- Current build size: ~743KB (gzipped: ~217KB)

### Running the Application
1. Ensure all setup steps completed
2. Run `npm run dev`
3. Open http://localhost:5173
4. Use 💳 tab for POS, 📊 tab for Admin Dashboard
5. Create transactions to populate analytics

For detailed usage, see README.md
