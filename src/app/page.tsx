'use client';

import { useEffect } from 'react';
import { useRHStore } from '@/store/rh-store';
import { LoginPage } from '@/components/pages/login-page';
import { RegisterPage } from '@/components/pages/register-page';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { ScanPage } from '@/components/pages/scan-page';
import { AddProductPage } from '@/components/pages/add-product-page';
import { NotificationsPage } from '@/components/pages/notifications-page';
import { AppFooter } from '@/components/layout/app-footer';

export default function Home() {
  const { currentView, updateSummary } = useRHStore();

  useEffect(() => {
    updateSummary();
  }, [updateSummary]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        {currentView === 'login' && <LoginPage />}
        {currentView === 'register' && <RegisterPage />}
        {currentView === 'dashboard' && <DashboardPage />}
        {currentView === 'scan' && <ScanPage />}
        {currentView === 'add-product' && <AddProductPage />}
        {currentView === 'notifications' && <NotificationsPage />}
      </main>
      <AppFooter />
    </div>
  );
}
