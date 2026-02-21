'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRHStore } from '@/store/rh-store';
import { User, UserRole } from '@/types/rh';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, User as UserIcon, Mail, Lock, UserCircle } from 'lucide-react';

export function RegisterPage() {
  const { setCurrentView, setUser } = useRHStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password minimal 3 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call register API
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registrasi gagal' });
        setIsLoading(false);
        return;
      }

      // Registration success - set user from API response
      const user: User = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name || data.user.username,
        email: data.user.email || '',
        whatsapp: '',
        role: 'user' as UserRole,
        createdAt: new Date(data.user.createdAt),
      };

      setUser(user);
      setIsLoading(false);

      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun Anda telah berhasil dibuat!',
      });

      // Auto login
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Register error:', error);
      setErrors({ general: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' });
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setCurrentView('login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={handleLogin}
          disabled={isLoading}
          className="mb-4 h-10 w-10 p-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg">
            <UserCircle className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Daftar untuk mulai mengelola RH produk
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Isi form di bawah untuk membuat akun
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm sm:text-base">Username *</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Username (min. 3 karakter)"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                  className="h-12 sm:h-13 pl-10 sm:pl-12 text-base"
                  disabled={isLoading}
                />
              </div>
              {errors.username && <p className="text-sm text-destructive pl-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Nama Lengkap *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                className="h-12 sm:h-13 text-base"
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-destructive pl-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="h-12 sm:h-13 pl-10 sm:pl-12 text-base"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
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
              {errors.password && <p className="text-sm text-destructive pl-1">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Password minimal 3 karakter
              </p>
            </div>

            {/* General Error Display */}
            {errors.general && (
              <div className="p-3 sm:p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {errors.general}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 px-4 sm:px-6 pb-4 sm:pb-6">
          <Button
            type="submit"
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full h-12 sm:h-13 text-base sm:text-lg font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              'Daftar Sekarang'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto mt-6 sm:mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <button
            type="button"
            onClick={handleLogin}
            className="font-medium text-primary hover:underline transition-colors disabled:opacity-50"
            disabled={isLoading}
            suppressHydrationWarning
          >
            Login
          </button>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-4">
          © Copyright Safir. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
