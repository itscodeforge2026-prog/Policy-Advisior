import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { LogIn, Key, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Retrieve the current user's session data and redirect to dashboard
      navigate('/');
    } catch (err: any) {
      setError(err || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-24 font-sans">
        <div className="rounded-3xl glass p-8 border border-slate-200 dark:border-white/5 space-y-6 shadow-xl">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold font-outfit tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-400">Sign in to Policy Advisor customer or advisor portal</p>
          </div>

          {isExpired && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs rounded-lg text-center font-medium">
              Your session expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-400 font-medium">Password</label>
                <span className="text-[10px] text-primary hover:underline cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-600 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 text-white"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
};
export default LoginPage;
