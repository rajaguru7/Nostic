import { useState, useEffect } from 'react';
import type { InventoryItem } from '../lib/supabase';
import { fetchInventory, recordSale, updateInventoryStock } from '../lib/database';
import Receipt from './Receipt';

interface CartItem extends InventoryItem {
  quantity: number;
}

export default function POS() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const items = await fetchInventory();
      setInventory(items);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    if (item.stock_quantity <= 0) {
      alert('Item out of stock!');
      return;
    }

    const existingItem = cart.find(c => c.id === item.id);
    if (existingItem) {
      if (existingItem.quantity >= item.stock_quantity) {
        alert('Insufficient stock!');
        return;
      }
      setCart(
        cart.map(c =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const item = inventory.find(i => i.id === itemId);
    if (item && quantity > item.stock_quantity) {
      alert('Insufficient stock!');
      return;
    }

    setCart(
      cart.map(c =>
        c.id === itemId ? { ...c, quantity } : c
      )
    );
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.selling_price * item.quantity,
      0
    );
    const gst = subtotal * 0.05;
    const total = subtotal + gst;
    const profit = cart.reduce(
      (sum, item) => sum + (item.selling_price - item.cost_price) * item.quantity,
      0
    );

    return { subtotal, gst, total, profit };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      // Record sales and update inventory
      for (const item of cart) {
        await recordSale(
          item.id,
          item.quantity,
          item.selling_price,
          item.cost_price
        );
        await updateInventoryStock(
          item.id,
          item.stock_quantity - item.quantity
        );
      }

      const totals = calculateTotals();
      setReceiptData({
        items: cart,
        ...totals,
        timestamp: new Date()
      });
      setShowReceipt(true);
      setCart([]);
      
      // Reload inventory
      await loadInventory();
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  const { subtotal, gst, total, profit } = calculateTotals();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (showReceipt && receiptData) {
    return <Receipt data={receiptData} onDone={() => setShowReceipt(false)} />;
  }

  return (
    <div className="bg-gray-50 flex flex-col overflow-hidden h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 flex-1 overflow-hidden p-2 sm:p-4">
        {/* Products Grid */}
        <div className="lg:col-span-2 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Nostic Foods - POS</h2>
          
          {/* Search Input */}
          <div className="mb-4 sticky top-0 bg-gray-50 py-2 z-10">
            <input
              type="text"
              placeholder="🔍 Search flavor or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="input-field w-full text-sm"
            />
          </div>

          {/* Filtered Products Display */}
          {searchTerm ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Search Results ({inventory.filter(item => 
                    item.flavor.toLowerCase().includes(searchTerm) || 
                    item.category.toLowerCase().includes(searchTerm)
                  ).length} items)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {inventory
                    .filter(item => 
                      item.flavor.toLowerCase().includes(searchTerm) || 
                      item.category.toLowerCase().includes(searchTerm)
                    )
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        disabled={item.stock_quantity <= 0}
                        className={`p-2 sm:p-3 rounded-lg text-center font-semibold transition-all text-xs sm:text-sm ${
                          item.stock_quantity > 0
                            ? 'bg-white border-2 border-green-500 hover:bg-green-50 cursor-pointer'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold text-sm sm:text-base">{item.flavor}</div>
                        <div className="text-green-600 font-bold text-sm sm:text-base">₹{item.selling_price}</div>
                        <div className="text-xs text-gray-500">
                          Stock: {item.stock_quantity}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {['Popsicles', 'Milk-Based', 'Premium'].map((category) => (
                <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{category}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {inventory
                    .filter(item => item.category === category)
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart(item)}
                        disabled={item.stock_quantity <= 0}
                        className={`p-2 sm:p-3 rounded-lg text-center font-semibold transition-all text-xs sm:text-sm ${
                          item.stock_quantity > 0
                            ? 'bg-white border-2 border-green-500 hover:bg-green-50 cursor-pointer'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold text-sm sm:text-base">{item.flavor}</div>
                        <div className="text-green-600 font-bold text-sm sm:text-base">₹{item.selling_price}</div>
                        <div className="text-xs text-gray-500">
                          Stock: {item.stock_quantity}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="card bg-white sticky top-0 lg:top-4 h-fit overflow-y-auto max-h-[calc(100vh-180px)] lg:max-h-fit">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Cart</h3>
          
          <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.flavor}</div>
                    <div className="text-xs text-gray-500">
                      ₹{item.selling_price} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="btn-secondary px-2 py-1 text-xs"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="btn-secondary px-2 py-1 text-xs"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn-danger px-2 py-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-semibold text-orange-600">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between sm:text-base font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span className="text-green-600">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <span>Profit:</span>
              <span className="font-semibold">₹{profit.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn-primary w-full mt-3 text-sm"
          >
            Checkout & Print
          </button>
        </div>
      </div>
    </div>
  );
}
