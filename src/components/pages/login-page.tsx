'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRHStore } from '@/store/rh-store';
import { User } from '@/types/rh';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, User as UserIcon, Shield, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { setCurrentView, setUser } = useRHStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }

    if (!password) {
      setError('Password wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login gagal');
        setIsLoading(false);
        return;
      }

      // Login success - set user from API response
      const user: User = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name || data.user.username,
        email: data.user.email || '',
        whatsapp: '',
        role: 'admin',
        createdAt: new Date(data.user.createdAt),
      };

      setUser(user);
      setIsLoading(false);

      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });

      setCurrentView('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    setCurrentView('register');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Logo/Brand Section */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          RH KADALUARSA
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Sistem Manajemen Tanggal Kedaluwarsa
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Login ke Akun
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Masukkan username dan password Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 sm:h-13 pl-10 sm:pl-12 text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 sm:h-13 pl-10 sm:pl-12 pr-12 sm:pr-14 text-base"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 sm:h-5 sm:w-5 rounded border-input bg-background"
              />
              <Label
                htmlFor="remember"
                className="text-sm sm:text-base cursor-pointer select-none"
              >
                Ingat saya
              </Label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 sm:p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 flex items-start gap-2">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 sm:h-13 text-base sm:text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Login
                </span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Belum punya akun?
          </p>
          <button
            type="button"
            onClick={handleRegister}
            className="text-sm sm:text-base font-medium text-primary hover:underline transition-colors disabled:opacity-50"
            disabled={isLoading}
            suppressHydrationWarning
          >
            Daftar Akun
          </button>
        </CardFooter>
      </Card>

      {/* Copyright */}
      <p className="text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8 text-center px-4">
        © Copyright Safir. All Rights Reserved.
      </p>
    </div>
  );
}
