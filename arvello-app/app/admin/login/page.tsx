'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setAuthError('Please enter a password');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to protected dashboard
        router.push('/admin');
        router.refresh();
      } else {
        setAuthError(data.error || 'Incorrect password');
      }
    } catch {
      setAuthError('Failed to log in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-[450px] mx-auto px-6 py-20 flex flex-col items-center">
      <div className="w-full bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-soft text-center space-y-6">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Editor Workspace</h1>
          <p className="text-xs text-foreground/50">Enter the administration password to publish articles.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-foreground/80 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-4 py-2.5 border border-outline-variant/60 rounded-xl text-sm bg-white text-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          {authError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{authError}</p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center py-3 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enter Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
