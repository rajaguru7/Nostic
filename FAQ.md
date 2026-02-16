# ❓ Nostic Foods - FAQ & Troubleshooting

Your go-to resource for common questions and solutions.

---

## ⚙️ Setup Issues

### Q: "Module not found" or "Cannot find module"
**A**: Run `npm install` in the project directory:
```bash
cd /Users/raja-11299/JSWorkspace/nostic
npm install
```

### Q: "npm: command not found"
**A**: Node.js/npm is not installed:
1. Download from https://nodejs.org (LTS version)
2. Install and restart terminal
3. Verify: `node --version` and `npm --version`

### Q: ".env.local file not found"
**A**: Create the file:
```bash
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

### Q: "Error: Cannot find Supabase credentials"
**A**: Check your `.env.local` file:
- ✅ File exists in project root
- ✅ Contains `VITE_SUPABASE_URL`
- ✅ Contains `VITE_SUPABASE_ANON_KEY`
- ✅ No quotes around values
- ✅ URLs start with `https://`

**Example** (correct format):
```env
VITE_SUPABASE_URL=https://xyz123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌐 Connection Issues

### Q: "Failed to fetch inventory" Error
**A**: Check these in order:

1. **Internet Connection**
   - Verify you're online
   - Try: `ping google.com`

2. **Supabase Credentials**
   - Check `.env.local` has correct values
   - Copy fresh from Supabase Settings → API

3. **Supabase Project Status**
   - Go to https://supabase.com/dashboard
   - Click your project
   - Verify it's "Active" (not suspended)

4. **Database Tables**
   - In Supabase SQL Editor
   - Run: `SELECT COUNT(*) FROM inventory;`
   - Should return a number, not error

5. **RLS Policies**
   - Go to SQL Editor
   - Run the RLS policy SQL again
   - Ensure policies are created (see SETUP_GUIDE.md)

### Q: "Network Error: Failed to connect"
**A**: 
- Check your firewall/VPN settings
- Try a different network (mobile hotspot)
- Supabase may be experiencing issues (check status.supabase.com)

### Q: "Error 403: Forbidden"
**A**: Your RLS policies are blocking access:
1. Go to Supabase → Authentication → Policies
2. Verify that policies exist for each table
3. Run the SQL from SETUP_GUIDE.md again
4. Refresh the app

---

## 💳 POS Issues

### Q: "Cannot add item to cart"
**A**: 
- Check if item has stock (Stock > 0)
- Try refreshing the page: `Ctrl+R` or `Cmd+R`
- Check browser console for errors (F12)

### Q: "Stock not decreasing after checkout"
**A**:
1. Check Supabase: `SELECT * FROM inventory WHERE id=1;`
2. Verify RLS policies are enabled
3. Check network tab in browser (F12) - look for failed requests
4. Try checkout again after 5 seconds

### Q: "Receipt blank or partial"
**A**:
1. Check browser console (F12) for JavaScript errors
2. Try different browser (Chrome, Firefox, Safari)
3. Check if JavaScript is enabled in browser
4. Clear browser cache and reload

### Q: "Print dialog not appearing"
**A**:
1. Disable popup blockers
2. Check browser security settings
3. Try: Windows → Chrome → Settings → Privacy → Popup blocker (turn off)
4. For Mac: Safari → Preferences → Security

### Q: "Receipt showing ₹0 values"
**A**: 
- Database may not be calculating profit
- Try closing and reopening POS tab
- Check that item prices are > 0 in inventory
- Run checkout again

---

## 📊 Admin Dashboard Issues

### Q: "No data showing in analytics"
**A**:
1. Make sure you've completed transactions in POS
2. Check the date filter - ensure it covers your transaction dates
3. Click "Today" filter to see today's sales
4. If still blank:
   - Check Supabase: `SELECT * FROM sales;`
   - Should show records from your POS checkouts

### Q: "Charts not displaying"
**A**:
1. Check browser console (F12) for errors
2. Make sure you have data in the selected date range
3. Try different date filter
4. Clear browser cache and reload

### Q: "Profit calculation wrong"
**A**: Double-check:
- Cost should be 70% of selling price
- Formula: `Profit = (Selling - Cost) × Quantity + GST`
- Example: ₹20 selling = ₹14 cost, profit ₹6 per unit
- GST is 5% added to subtotal

### Q: "Restock recommendations always empty"
**A**:
- All items may be above reorder level
- To test: Go to Inventory → Update an item's stock to 5 (below default 10)
- Then check Analytics tab again

### Q: "Can't add new item"
**A**:
1. Fill ALL fields (Name, Flavor, Category, Price, Quantity)
2. Price must be > 0
3. Quantity must be ≥ 0
4. Check browser console for errors
5. Verify Supabase connection

---

## 🗄️ Database Issues

### Q: "Table doesn't exist" Error
**A**: You haven't created the SQL schema:
1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy-paste the entire SQL from SETUP_GUIDE.md
4. Click "Run"
5. Refresh the POS app

### Q: "Database connection timeout"
**A**:
1. Supabase project may be sleeping (free tier)
2. Go to https://supabase.com/dashboard
3. Click your project to wake it up
4. Try again in 10 seconds

### Q: "Duplicate key error"
**A**: You're trying to insert same data twice:
1. This shouldn't happen with the app
2. If it does, contact Supabase support
3. Try: Clear `.env.local` and create new Supabase project

### Q: "Permission denied"
**A**: Similar to 403 error - RLS issues:
1. Check RLS policies are created
2. Policy should allow UPDATE on inventory table
3. Run setup SQL again

---

## 🔒 Security Issues

### Q: "Should I commit .env.local?"
**A**: **NO - NEVER!**
- `.env.local` contains secrets
- Git ignore should block it (already does)
- Check: `cat .gitignore` should show `*.local`
- If accidentally committed, regenerate Anon Key in Supabase

### Q: "Is my Anon Key exposed?"
**A**: Yes, and that's fine:
- Anon Key is designed to be public
- RLS policies restrict what it can access
- If compromised, generate new key in Supabase Settings

### Q: "Can I use this in production?"
**A**: Yes! It's production-ready:
- Cloud database (Supabase)
- SSL encrypted
- RLS policies enabled
- No sensitive test data

---

## 📦 Installation Issues

### Q: "Node version too old"
**A**: Update Node.js:
1. Current version: `node --version`
2. Required: 16.15.1 or higher
3. Download: https://nodejs.org
4. Install LTS (latest recommended)
5. Restart terminal and verify

### Q: "npm install takes forever"
**A**:
1. Check internet speed
2. Try: `npm cache clean --force`
3. Then: `npm install`
4. On slow connection, can take 5-10 minutes

### Q: "TypeScript errors during build"
**A**:
1. Check: `npm run build` for full error
2. Common: Type import errors (fixed in current version)
3. Try: Delete `node_modules`, run `npm install`
4. Try: `npm run build` again

---

## 🎨 UI/UX Issues

### Q: "Buttons not responding"
**A**:
1. Check browser console (F12) for errors
2. Check network tab - connections failing?
3. Try refreshing page
4. Try different browser

### Q: "Tailwind CSS not loading (page looks broken)"
**A**:
1. Check network tab (F12) for failed CSS loads
2. Stop dev server: `Ctrl+C`
3. Run: `npm run dev` again
4. Wait 10 seconds for Tailwind to compile

### Q: "Cart sidebar not showing"
**A**:
1. On mobile, sidebar might be off-screen
2. Try landscape mode on mobile
3. Maximize browser window
4. Try desktop browser

---

## 🚀 Performance Issues

### Q: "App is slow / laggy"
**A**:
1. Check Supabase query time in browser console
2. Try refreshing page
3. Close other browser tabs
4. Verify internet speed: speedtest.net
5. For large datasets (1000+ transactions), pagination needed

### Q: "Build takes too long"
**A**: Normal behavior (Vite optimizes for dev):
- First build: 30-60 seconds
- Subsequent: <10 seconds
- Production build (`npm run build`): 3-5 seconds

---

## 🆘 Emergency Fixes

### "Everything is broken"
**A**: Complete reset:
```bash
# Stop dev server: Ctrl+C

# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Clear browser cache: Ctrl+Shift+Del

# Restart dev server
npm run dev
```

### "Need to revert changes"
**A**: Without git:
1. Re-run `npm run dev` (reloads from disk)
2. To revert: download fresh copy from GitHub

### "Lost inventory data"
**A**: Don't worry, it's in Supabase:
1. Go to SQL Editor
2. Run: `SELECT * FROM inventory;`
3. Data is safe and persisted

---

## 📞 When to Contact Support

**Supabase Issues**:
- https://supabase.com/support
- Project deleted or suspended
- Unable to access dashboard

**Technical Issues**:
- Check GitHub issues: Search problem
- Read React/Vite documentation
- Ask on Stack Overflow (tag: supabase, react, vite)

**Code Issues**:
- Error persists after trying all above solutions
- Prepare: error message + screenshot + browser console output

---

## ✅ Quick Checklist

If something's not working:

- [ ] Run `npm install`
- [ ] Check `.env.local` exists and is valid
- [ ] Verify Supabase project is active
- [ ] Open browser console (F12) for errors
- [ ] Try refreshing page
- [ ] Try different browser
- [ ] Restart dev server (`Ctrl+C`, `npm run dev`)
- [ ] Clear browser cache
- [ ] Check Supabase dashboard status
- [ ] Verify RLS policies are enabled

---

## 📚 Common Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run build  # Shows TypeScript errors

# Clear cache and reinstall
rm -rf node_modules package-lock.json && npm install
```

---

## 📊 Useful Supabase Queries

**Check inventory exists**:
```sql
SELECT COUNT(*) FROM inventory;
```

**Check sales records**:
```sql
SELECT * FROM sales ORDER BY timestamp DESC LIMIT 10;
```

**Check stock of item**:
```sql
SELECT flavor, stock_quantity FROM inventory WHERE id = 1;
```

**Total today's profit**:
```sql
SELECT SUM(total_profit) 
FROM sales 
WHERE DATE(timestamp) = DATE(NOW());
```

---

## 💡 Pro Tips

1. **Test Transaction**: Always do a test POS checkout to verify setup
2. **Monitor Profit**: Check Admin Dashboard daily
3. **Restock Weekly**: Review recommendations on Sunday
4. **Backup Data**: Supabase auto-backups weekly (free tier)
5. **Update Prices**: Use Inventory tab to adjust pricing seasonally

---

**Still Have Questions?**

1. Check README.md for full documentation
2. Read SETUP_GUIDE.md for detailed setup steps
3. Review DEVELOPER_REFERENCE.md for technical details
4. Check project status at https://supabase.com/status

---

**Last Updated**: February 16, 2026  
**Status**: Complete & Helpful
