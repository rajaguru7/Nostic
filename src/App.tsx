import { useState, useEffect } from 'react';
import POS from './components/POS';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import './App.css';

type AppView = 'pos' | 'admin';

function App() {
  const [view, setView] = useState<AppView>('pos');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('nostic_admin_token');
      const email = localStorage.getItem('nostic_admin_email');

      if (token && email) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data.user) {
            setIsAdmin(true);
          } else {
            localStorage.removeItem('nostic_admin_token');
            localStorage.removeItem('nostic_admin_email');
            setIsAdmin(false);
          }
        } catch (err) {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('nostic_admin_token');
    localStorage.removeItem('nostic_admin_email');
    setIsAdmin(false);
    setView('pos');
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍦</div>
          <div className="text-gray-600">Loading Nostic Foods...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Login onLoginSuccess={() => setIsAdmin(true)} />;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md sticky top-0 z-50 flex-shrink-0">
        <div className="px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold truncate">🍦 Nostic Foods</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button
              onClick={() => setView('pos')}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                view === 'pos'
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            >
              <span className="hidden sm:inline">💳 POS System</span>
              <span className="sm:hidden">💳 POS</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                view === 'admin'
                  ? 'bg-white text-green-600 shadow-lg'
                  : 'bg-green-500 hover:bg-green-400 text-white'
              }`}
            >
              <span className="hidden sm:inline">📊 Admin Dashboard</span>
              <span className="sm:hidden">📊 Admin</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              <span className="hidden sm:inline">🚪 Logout</span>
              <span className="sm:hidden">🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto w-full">
        {view === 'pos' ? <POS /> : <AdminDashboard />}
      </div>
    </div>
  );
}

export default App;
