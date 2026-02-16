import { useState, useEffect } from 'react';
import type { InventoryItem } from '../lib/supabase';
import {
  fetchInventory,
  calculateSalesStats,
  getTopSellingItems,
  getRestockRecommendations,
  addInventoryItem,
  updateInventoryItem
} from '../lib/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  subDays,
  startOfMonth,
  endOfMonth
} from 'date-fns';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'analytics'>('sales');
  const [dateRange, setDateRange] = useState<'today' | 'week' | '7days' | 'month' | '30days' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, totalItems: 0 });
  const [topItems, setTopItems] = useState<any[]>([]);
  const [restockItems, setRestockItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    name: '',
    flavor: '',
    category: 'Popsicles',
    sellingPrice: '',
    quantity: ''
  });

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    flavor: '',
    category: 'Popsicles',
    sellingPrice: '',
    stockQuantity: '',
    reorderLevel: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const today = new Date();
    
    switch (dateRange) {
      case 'today':
        return { start: startOfToday(), end: endOfToday() };
      case 'week':
        return { start: startOfWeek(today), end: endOfWeek(today) };
      case '7days':
        return { start: subDays(today, 7), end: today };
      case 'month':
        return { start: startOfMonth(today), end: endOfMonth(today) };
      case '30days':
        return { start: subDays(today, 30), end: today };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate),
            end: new Date(customEndDate)
          };
        }
        return { start: startOfToday(), end: endOfToday() };
      default:
        return { start: startOfToday(), end: endOfToday() };
    }
  };

  const loadData = async () => {
    try {
      const [inventoryData, restockData] = await Promise.all([
        fetchInventory(),
        getRestockRecommendations()
      ]);
      setInventory(inventoryData);
      setRestockItems(restockData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      const [statsData, topItemsData] = await Promise.all([
        calculateSalesStats(start, end),
        getTopSellingItems(start, end, 5)
      ]);
      
      setStats(statsData);
      setTopItems(topItemsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addInventoryItem(
        newItem.name,
        newItem.flavor,
        newItem.category,
        parseFloat(newItem.sellingPrice),
        parseInt(newItem.quantity)
      );
      setNewItem({
        name: '',
        flavor: '',
        category: 'Popsicles',
        sellingPrice: '',
        quantity: ''
      });
      await loadData();
      alert('Item added successfully!');
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      flavor: item.flavor,
      category: item.category,
      sellingPrice: item.selling_price.toString(),
      stockQuantity: item.stock_quantity.toString(),
      reorderLevel: item.reorder_level.toString()
    });
  };

  const handleUpdateAllFields = async () => {
    if (!editingItem) return;

    // Validate inputs
    if (!editFormData.name || !editFormData.flavor || !editFormData.category || !editFormData.sellingPrice) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(editFormData.sellingPrice) <= 0) {
      alert('Selling price must be greater than 0');
      return;
    }

    if (parseInt(editFormData.stockQuantity) < 0 || parseInt(editFormData.reorderLevel) < 0) {
      alert('Quantity and reorder level cannot be negative');
      return;
    }

    try {
      await updateInventoryItem(
        editingItem.id,
        editFormData.name,
        editFormData.flavor,
        editFormData.category,
        parseFloat(editFormData.sellingPrice),
        parseInt(editFormData.stockQuantity),
        parseInt(editFormData.reorderLevel)
      );
      setEditingItem(null);
      setEditFormData({
        name: '',
        flavor: '',
        category: 'Popsicles',
        sellingPrice: '',
        stockQuantity: '',
        reorderLevel: ''
      });
      await loadData();
      alert('Item updated successfully!');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item');
    }
  };

  const profitMarginPercent = stats.totalRevenue > 0 
    ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)
    : '0';

  return (
    <div className="bg-gray-50 flex flex-col overflow-hidden h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-6 shadow-lg">
        <h1 className="text-xl sm:text-3xl font-bold">Nostic Foods - Admin</h1>
        <p className="text-green-100 text-xs sm:text-base">Manage inventory, sales, and analytics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 overflow-x-auto">
        <div className="flex gap-1 sm:gap-6 px-2 sm:px-4">
          {['sales', 'inventory', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 px-3 sm:px-2 font-semibold transition-colors border-b-2 text-xs sm:text-base whitespace-nowrap ${ 
                activeTab === tab
                  ? 'text-green-600 border-green-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full">
        {/* Sales Dashboard */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Select Period</h3>
              <div className="flex gap-2 flex-wrap">
                {['today', 'week', '7days', 'month', '30days', 'custom'].map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range as any)}
                    className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-colors text-xs sm:text-base ${
                      dateRange === range
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {range === 'today' ? 'Today' :
                     range === 'week' ? 'Week' :
                     range === '7days' ? '7d' :
                     range === 'month' ? 'Month' :
                     range === '30days' ? '30d' :
                     'Custom'}
                  </button>
                ))}
              </div>

              {dateRange === 'custom' && (
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input-field text-sm"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="card">
                <div className="text-gray-600 text-xs sm:text-sm font-semibold">Total Revenue</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
                  ₹{stats.totalRevenue.toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div className="text-gray-600 text-xs sm:text-sm font-semibold">Total Profit</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                  ₹{stats.totalProfit.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Margin: {profitMarginPercent}%
                </div>
              </div>
              <div className="card">
                <div className="text-gray-600 text-xs sm:text-sm font-semibold">Items Sold</div>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mt-2">
                  {stats.totalItems}
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : topItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="flavor" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#22c55e" name="Units Sold" />
                    <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No sales data available</p>
              )}
            </div>
          </div>
        )}

        {/* Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Add New Item Form */}
            <div className="card">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Add New Item</h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="input-field text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Flavor"
                  value={newItem.flavor}
                  onChange={(e) => setNewItem({ ...newItem, flavor: e.target.value })}
                  className="input-field text-sm"
                  required
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="input-field text-sm"
                >
                  <option>Popsicles</option>
                  <option>Milk-Based</option>
                  <option>Premium</option>
                </select>
                <input
                  type="number"
                  placeholder="Selling Price"
                  value={newItem.sellingPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellingPrice: e.target.value })}
                  className="input-field text-sm"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="input-field text-sm"
                  required
                />
                <button type="submit" className="btn-primary text-sm">
                  Add Item
                </button>
              </form>
            </div>

            {/* Current Inventory Table */}
            <div className="card overflow-hidden">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Current Inventory</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-100 border-b sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-2 sm:px-3">Item</th>
                      <th className="text-left py-2 px-2 sm:px-3 hidden sm:table-cell">Category</th>
                      <th className="text-right py-2 px-2 sm:px-3">Price</th>
                      <th className="text-right py-2 px-2 sm:px-3 hidden md:table-cell">Cost</th>
                      <th className="text-right py-2 px-2 sm:px-3">Stock</th>
                      <th className="text-center py-2 px-2 sm:px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 sm:px-3 font-semibold">{item.flavor}</td>
                        <td className="py-2 px-2 sm:px-3 hidden sm:table-cell text-xs">{item.category}</td>
                        <td className="py-2 px-2 sm:px-3 text-right">₹{item.selling_price}</td>
                        <td className="py-2 px-2 sm:px-3 text-right hidden md:table-cell">₹{item.cost_price}</td>
                        <td className="py-2 px-2 sm:px-3 text-right font-semibold text-xs sm:text-base">
                          {item.stock_quantity}
                        </td>
                        <td className="py-2 px-2 sm:px-3">
                          <div className="flex flex-col sm:flex-row gap-1 items-center justify-center">
                            {item.stock_quantity <= item.reorder_level ? (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                                Low
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                OK
                              </span>
                            )}
                            <button
                              onClick={() => openEditModal(item)}
                              className="btn-primary px-2 py-1 text-xs whitespace-nowrap"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Item Modal */}
              {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <h4 className="text-base sm:text-lg font-semibold mb-4">Edit Item</h4>
                    <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                      ID: {editingItem.id}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Item Name</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="input-field text-sm"
                          placeholder="E.g., Popsicle, Milk-Based"
                        />
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Flavor</label>
                        <input
                          type="text"
                          value={editFormData.flavor}
                          onChange={(e) => setEditFormData({ ...editFormData, flavor: e.target.value })}
                          className="input-field text-sm"
                          placeholder="E.g., Watermelon, Mango"
                        />
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Category</label>
                        <select
                          value={editFormData.category}
                          onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="input-field text-sm"
                        >
                          <option>Popsicles</option>
                          <option>Milk-Based</option>
                          <option>Premium</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Selling Price</label>
                        <input
                          type="number"
                          value={editFormData.sellingPrice}
                          onChange={(e) => setEditFormData({ ...editFormData, sellingPrice: e.target.value })}
                          className="input-field text-sm"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Cost: ₹{(parseFloat(editFormData.sellingPrice || '0') * 0.7).toFixed(2)} | Profit/Unit: ₹{(parseFloat(editFormData.sellingPrice || '0') * 0.3).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Stock Quantity</label>
                        <input
                          type="number"
                          value={editFormData.stockQuantity}
                          onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: e.target.value })}
                          className="input-field text-sm"
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">Reorder Level</label>
                        <input
                          type="number"
                          value={editFormData.reorderLevel}
                          onChange={(e) => setEditFormData({ ...editFormData, reorderLevel: e.target.value })}
                          className="input-field text-sm"
                          min="0"
                          placeholder="10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Alert when stock falls below this level
                        </p>
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-4">
                        <button
                          onClick={handleUpdateAllFields}
                          className="btn-primary flex-1 text-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(null);
                            setEditFormData({
                              name: '',
                              flavor: '',
                              category: 'Popsicles',
                              sellingPrice: '',
                              stockQuantity: '',
                              reorderLevel: ''
                            });
                          }}
                          className="btn-secondary flex-1 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics & Recommendations */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Restock Recommendations */}
            <div className="card">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-orange-600">🔄 Restock Recommendations</h3>
              {restockItems.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {restockItems.map(item => (
                    <div key={item.itemId} className="bg-orange-50 p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{item.flavor}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Current Stock: <span className="font-bold text-red-600">{item.currentStock}</span> / 
                            Reorder: <span className="font-bold">{item.reorderLevel}</span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm text-gray-600">Suggested</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{item.suggestedQuantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8 text-sm">All items are well-stocked!</p>
              )}
            </div>

            {/* Profit Analysis */}
            <div className="card">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Profit Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded">
                  <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">₹{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded">
                  <p className="text-xs sm:text-sm text-gray-600">Total Profit</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{stats.totalProfit.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 p-3 sm:p-4 bg-purple-50 rounded">
                <p className="text-xs sm:text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{profitMarginPercent}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
