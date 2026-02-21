'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRHStore } from '@/store/rh-store';
import { MessageCircle, Send, CheckCircle2, XCircle, Loader2, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WhatsAppNotificationSettings() {
  const { user } = useRHStore();
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize WhatsApp number from user
  useState(() => {
    if (user?.whatsapp) {
      setWhatsapp(user.whatsapp);
    }
  });

  const formatWhatsApp = (phone: string): string => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      return '62' + clean.substring(1);
    }
    if (!clean.startsWith('62')) {
      return '62' + clean;
    }
    return clean;
  };

  const handleUpdateWhatsApp = async () => {
    if (!whatsapp.trim()) {
      toast({
        title: 'Error',
        description: 'Nomor WhatsApp wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          whatsapp: formatWhatsApp(whatsapp),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal update nomor WhatsApp');
      }

      toast({
        title: 'Berhasil',
        description: 'Nomor WhatsApp berhasil diupdate',
      });

      // Update local user state (you might want to refresh user from store)
      setNotificationStatus('idle');
    } catch (error) {
      console.error('Update WhatsApp error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal update nomor WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!user?.whatsapp) {
      toast({
        title: 'Error',
        description: 'Silakan set nomor WhatsApp terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    setNotificationStatus('idle');

    try {
      const response = await fetch(`/api/send-whatsapp?userId=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim notifikasi');
      }

      setNotificationStatus('success');
      toast({
        title: 'Notifikasi Terkirim',
        description: 'Pesan test berhasil dikirim ke WhatsApp Anda',
      });
    } catch (error) {
      console.error('Send test notification error:', error);
      setNotificationStatus('error');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengirim notifikasi test',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDisplayPhone = (phone: string): string => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length >= 12) {
      return clean.replace(/(\d{2})(\d{4})(\d{4})(\d+)$/, '$1-$2-$3-$4');
    }
    return phone;
  };

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
          Notifikasi WhatsApp
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Atur notifikasi otomatis ke WhatsApp untuk produk yang membutuhkan perhatian
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Notifikasi Aktif
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Notifikasi dikirim otomatis saat produk mendekati tanggal RH
              </p>
            </div>
          </div>
          {user?.whatsapp && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700">
              ✅ Terhubung
            </Badge>
          )}
        </div>

        {/* WhatsApp Number Input */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-sm sm:text-base">
            Nomor WhatsApp
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="whatsapp"
                type="tel"
                placeholder="6281234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={isLoading}
                className="h-11 text-sm sm:text-base"
              />
              {user?.whatsapp && !whatsapp && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {formatDisplayPhone(user.whatsapp)}
                </span>
              )}
            </div>
            <Button
              onClick={handleUpdateWhatsApp}
              disabled={isLoading}
              className="h-11 px-4 sm:px-6 text-sm sm:text-base"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Gunakan format: 6281234567890 (kode negara 62 + nomor HP tanpa 0 di depan)
          </p>
        </div>

        {/* Test Notification */}
        <div className="space-y-2">
          <Label className="text-sm sm:text-base">Kirim Notifikasi Test</Label>
          <Button
            onClick={handleSendTestNotification}
            disabled={isSending || !user?.whatsapp}
            variant="outline"
            className="w-full h-11 text-sm sm:text-base border-2 border-dashed"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Kirim Pesan Test ke WhatsApp
              </span>
            )}
          </Button>

          {/* Notification Status */}
          {notificationStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Notifikasi berhasil dikirim! Silakan cek WhatsApp Anda.
              </p>
            </div>
          )}

          {notificationStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Gagal mengirim notifikasi. Silakan coba lagi.
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-medium">Provider: <strong>Fonnte API</strong></p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200 ml-4">
                <li>Server berlokasi Indonesia (cepat dan murah)</li>
                <li>Mendukung nomor Indonesia (+62)</li>
                <li>Dokumentasi: https://fonnte.com</li>
              </ul>
            </div>
          </div>
        </div>

        {/* WhatsApp API Status */}
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">API</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>Status: <span className="font-medium text-green-600 dark:text-green-400">Terintegrasi Fonnte</span></p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Pesan akan dikirim melalui API Fonnte ke WhatsApp Anda.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
