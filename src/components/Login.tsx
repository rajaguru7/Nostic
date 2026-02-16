import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'manager') => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager'>('manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (signInError) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Store auth token, email, and role to localStorage
        localStorage.setItem('nostic_admin_token', data.session?.access_token || '');
        localStorage.setItem('nostic_admin_email', data.user.email || '');
        localStorage.setItem('nostic_user_role', selectedRole);
        onLoginSuccess(selectedRole);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">🍦 Nostic Foods</h1>
          <p className="text-gray-600">Staff Login Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Login As</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors" style={{ borderColor: selectedRole === 'admin' ? '#22c55e' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager')}
                  className="w-4 h-4 text-green-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-semibold text-gray-800">Admin</span>
                  <span className="text-xs text-gray-600 block">Full access to all features</span>
                </span>
              </label>

              <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors" style={{ borderColor: selectedRole === 'manager' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={selectedRole === 'manager'}
                  onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'manager')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex-1">
                  <span className="font-semibold text-gray-800">Manager</span>
                  <span className="text-xs text-gray-600 block">POS and today's sales only</span>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ Demo:</strong> Use your Supabase auth credentials. You must have a Supabase account.
          </p>
        </div>
      </div>
    </div>
  );
}
