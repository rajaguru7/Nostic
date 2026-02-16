import { useState, useEffect } from 'react';
import POS from './components/POS';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import './App.css';

type AppView = 'pos' | 'admin' | 'manager-sales';
type UserRole = 'admin' | 'manager';

function App() {
  const [view, setView] = useState<AppView>('pos');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('nostic_admin_token');
      const email = localStorage.getItem('nostic_admin_email');
      const role = localStorage.getItem('nostic_user_role') as UserRole | null;

      if (token && email && role) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data.user) {
            setUserRole(role);
          } else {
            localStorage.removeItem('nostic_admin_token');
            localStorage.removeItem('nostic_admin_email');
            localStorage.removeItem('nostic_user_role');
            setUserRole(null);
          }
        } catch (err) {
          setUserRole(null);
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
    localStorage.removeItem('nostic_user_role');
    setUserRole(null);
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

  if (!userRole) {
    return <Login onLoginSuccess={(role) => setUserRole(role)} />;
  }

  // Determine which dashboard tabs to show based on role
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md sticky top-0 z-50 flex-shrink-0">
        <div className="px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold truncate">🍦 Nostic Foods</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            {/* POS Button */}
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

            {/* Admin Dashboard - Only for Admin */}
            {isAdmin && (
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
            )}

            {/* Manager Dashboard - Only for Manager */}
            {isManager && (
              <button
                onClick={() => setView('manager-sales')}
                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  view === 'manager-sales'
                    ? 'bg-white text-green-600 shadow-lg'
                    : 'bg-green-500 hover:bg-green-400 text-white'
                }`}
              >
                <span className="hidden sm:inline">📈 Today's Sales</span>
                <span className="sm:hidden">📈 Sales</span>
              </button>
            )}

            {/* User Info Badge */}
            <div className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-green-500 rounded-full">
              {isAdmin ? '👤 Admin' : '💼 Manager'}
            </div>

            {/* Logout Button */}
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
        {view === 'pos' && <POS />}
        {view === 'admin' && isAdmin && <AdminDashboard />}
        {view === 'manager-sales' && isManager && <ManagerDashboard />}
      </div>
    </div>
  );
}

export default App;
