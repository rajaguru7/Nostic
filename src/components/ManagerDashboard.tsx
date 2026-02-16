import { useState, useEffect } from 'react';
import { calculateSalesStats } from '../lib/database';

export default function ManagerDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaySales = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const stats = await calculateSalesStats(today, tomorrow);
        
        setTotalRevenue(stats.totalRevenue);
        setTotalProfit(stats.totalProfit);
        setItemsSold(stats.totalItems);
      } catch (err) {
        console.error('Error fetching sales:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and then every 30 seconds for real-time updates
    fetchTodaySales();
    const interval = setInterval(fetchTodaySales, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-gray-600">Loading today's sales...</div>
        </div>
      </div>
    );
  }

  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="bg-gray-50 flex flex-col overflow-hidden h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-6 shadow-lg">
        <h1 className="text-xl sm:text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-blue-100 text-xs sm:text-base">Today's Sales Summary</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full">
        <div className="space-y-6">
          {/* Date Display */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm sm:text-base">
              📅 {new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Revenue</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-2">
                    ₹{totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="text-5xl opacity-20">💰</div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Total Profit</p>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600 mt-2">
                    ₹{totalProfit.toFixed(2)}
                  </p>
                </div>
                <div className="text-5xl opacity-20">📈</div>
              </div>
            </div>

            {/* Items Sold */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">Items Sold</p>
                  <p className="text-3xl sm:text-4xl font-bold text-orange-600 mt-2">
                    {itemsSold}
                  </p>
                </div>
                <div className="text-5xl opacity-20">🍦</div>
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm sm:text-base font-semibold mb-4">Profit Margin</p>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-5xl sm:text-6xl font-bold text-purple-600">
                  {profitMargin}%
                </p>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full transition-all" 
                  style={{ width: `${Math.min(parseFloat(profitMargin), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <p className="text-blue-800 text-sm sm:text-base">
              <strong>📌 Note:</strong> This dashboard shows real-time sales data for today only. Switch to the POS System tab to process transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
