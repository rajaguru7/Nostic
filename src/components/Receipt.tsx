import { useEffect } from 'react';

export default function Receipt({ data, onDone }: any) {
  useEffect(() => {
    // Auto-print the receipt
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
          <h1 className="text-3xl font-bold text-green-600">NOSTIC FOODS</h1>
          <p className="text-sm text-gray-600">Ice Cream & Frozen Desserts</p>
          <p className="text-xs text-gray-500">Premium Quality Since 2020</p>
        </div>

        {/* Receipt Info */}
        <div className="text-xs mb-4 space-y-1">
          <p>Receipt No: {Math.floor(Math.random() * 100000)}</p>
          <p>Date: {formatDate(data.timestamp)}</p>
          <p className="border-t border-gray-300 pt-2 mt-2">Cashier: POS System</p>
        </div>

        {/* Items */}
        <div className="border-t border-b border-gray-300 py-3 mb-3">
          <div className="space-y-2 text-xs">
            {data.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <div className="font-semibold">{item.flavor}</div>
                  <div className="text-gray-600">₹{item.selling_price} × {item.quantity}</div>
                </div>
                <div className="text-right font-semibold">
                  ₹{(item.selling_price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold">₹{data.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-orange-600 font-semibold">
            <span>GST (5%):</span>
            <span>₹{data.gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-2 font-bold text-lg">
            <span>TOTAL:</span>
            <span className="text-green-700">₹{data.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center border-t border-gray-300 pt-3 text-xs">
          <p className="font-semibold text-gray-800 mb-2">Thank you for your purchase!</p>
          <p className="text-gray-600">We serve with love & quality.</p>
          <p className="text-gray-600 mt-1">Visit us again 🍦</p>
        </div>

        {/* Actions */}
        <div className="mt-6 print:hidden space-y-2">
          <button
            onClick={() => window.print()}
            className="btn-primary w-full"
          >
            Print Receipt
          </button>
          <button
            onClick={onDone}
            className="btn-secondary w-full"
          >
            New Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
