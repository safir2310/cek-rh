'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRHStore } from '@/store/rh-store';
import { NotificationList } from '@/components/notification-list';
import { ArrowLeft, Bell, AlertTriangle, XCircle, CheckCircle2, Filter, RefreshCw } from 'lucide-react';

export function NotificationsPage() {
  const { notifications, markNotificationRead, setCurrentView, generateNotifications } = useRHStore();
  const [filter, setFilter] = useState<'all' | 'warning' | 'expired'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const warningCount = notifications.filter(n => n.type === 'warning' && !n.isRead).length;
  const expiredCount = notifications.filter(n => n.type === 'expired' && !n.isRead).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    generateNotifications();
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) {
        markNotificationRead(n.id);
      }
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-300 pb-20 sm:pb-0">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 sm:gap-4 px-4 pt-4 sm:pt-6 pb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentView('dashboard')}
          className="h-11 w-11 flex-shrink-0 rounded-full border-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Notifikasi</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Pusat notifikasi produk RH
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-11 w-11 flex-shrink-0 rounded-full border-2"
          title="Refresh Notifikasi"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Hero Section */}
      <div className="px-4 pb-6">
        <Card className="border-2 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    Ringkasan Notifikasi
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} notifikasi belum dibaca
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllRead}
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs sm:text-sm border-2 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  Tandai Semua Dibaca
                </Button>
              )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Warning */}
              <Card className={`border-2 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card transition-all ${warningCount > 0 ? 'shadow-md shadow-orange-200 dark:shadow-orange-900/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${warningCount > 0 ? 'bg-orange-500' : 'bg-muted'}`}>
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-2xl sm:text-3xl font-bold ${warningCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                        {warningCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Wajib Retur</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expired */}
              <Card className={`border-2 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-card transition-all ${expiredCount > 0 ? 'shadow-md shadow-red-200 dark:shadow-red-900/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${expiredCount > 0 ? 'bg-red-500' : 'bg-muted'}`}>
                      <XCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className={`text-2xl sm:text-3xl font-bold ${expiredCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                        {expiredCount}
                      </p>
                      <p className="text-xs text-muted-foreground">Jatuh RH</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Read */}
              <Card className="border-2 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                        {notifications.filter(n => n.isRead).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sudah Dibaca</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={`flex-shrink-0 h-10 text-sm ${filter === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
          >
            Semua ({notifications.length})
          </Button>
          <Button
            variant={filter === 'warning' ? 'default' : 'outline'}
            onClick={() => setFilter('warning')}
            className={`flex-shrink-0 h-10 text-sm ${filter === 'warning' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Wajib Retur ({notifications.filter(n => n.type === 'warning').length})
          </Button>
          <Button
            variant={filter === 'expired' ? 'default' : 'outline'}
            onClick={() => setFilter('expired')}
            className={`flex-shrink-0 h-10 text-sm ${filter === 'expired' ? 'bg-red-500 hover:bg-red-600' : ''}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Jatuh RH ({notifications.filter(n => n.type === 'expired').length})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold mb-3 px-1">
          {filter === 'all' && 'Semua Notifikasi'}
          {filter === 'warning' && 'Produk Wajib Retur'}
          {filter === 'expired' && 'Produk Jatuh RH'}
        </h3>
        <NotificationList
          notifications={filteredNotifications}
          onMarkAsRead={markNotificationRead}
          maxHeight="max-h-[60vh]"
        />
      </div>
    </div>
  );
}
