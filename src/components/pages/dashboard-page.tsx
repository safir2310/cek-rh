'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRHStore } from '@/store/rh-store';
import { RH_STATUS_LABELS, RH_STATUS_COLORS, RH_STATUS_ANIMATIONS } from '@/types/rh';
import { LogOut, QrCode, Search, Filter, Plus, Package, AlertTriangle, CheckCircle, XCircle, Settings, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { WhatsAppNotificationSettings } from '@/components/whatsapp-notification-settings';

export function DashboardPage() {
  const { user, products, summary, notifications, setCurrentView, setUser, generateNotifications, deleteProduct, updateSummary } = useRHStore();
  const [filter, setFilter] = useState<'all' | 'safe' | 'warning' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWhatsAppSettings, setShowWhatsAppSettings] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string; productName: string }>({ open: false, productId: '', productName: '' });

  useEffect(() => {
    // Generate notifications from products on load
    generateNotifications();
    
    // Auto-refresh summary and notifications
    const interval = setInterval(() => {
      // In real app, this would fetch fresh data
      generateNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [generateNotifications]);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    toast({
      title: 'Logout Berhasil',
      description: 'Sampai jumpa lagi!',
    });
  };

  const handleScan = () => {
    setCurrentView('scan');
  };

  const handleAddProduct = () => {
    setCurrentView('add-product');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteDialog({ open: true, productId, productName });
  };

  const confirmDeleteProduct = () => {
    deleteProduct(deleteDialog.productId);
    setDeleteDialog({ open: false, productId: '', productName: '' });
    updateSummary();
    toast({
      title: 'Produk Dihapus',
      description: `${deleteDialog.productName} telah dihapus`,
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode.includes(searchQuery) ||
                         product.plu.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;

    return matchesSearch && product.batches.some((batch) => batch.status === filter);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-300 pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 px-4 pt-4 sm:pt-6 pb-4 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              Dashboard RH
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Hai, {user?.name || 'User'} 👋
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentView('notifications')}
              className="h-10 w-10 sm:h-10 sm:w-10 rounded-full border-2 relative"
              title="Notifikasi"
            >
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Dialog open={showWhatsAppSettings} onOpenChange={setShowWhatsAppSettings}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-10 sm:w-10 rounded-full border-2"
                  title="Pengaturan Notifikasi WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Pengaturan Notifikasi WhatsApp
                  </DialogTitle>
                  <DialogDescription>
                    Atur notifikasi otomatis untuk produk yang membutuhkan perhatian
                  </DialogDescription>
                </DialogHeader>
                <WhatsAppNotificationSettings />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 sm:h-10 sm:w-10 rounded-full border-2"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Action Buttons - Mobile First */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Button
            onClick={handleAddProduct}
            className="h-14 sm:h-12 text-sm sm:text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-5 w-5 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Tambah</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
          <Button
            onClick={handleScan}
            className="h-14 sm:h-12 text-sm sm:text-base font-semibold bg-white dark:bg-card border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl shadow-lg"
          >
            <QrCode className="h-5 w-5 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Scan Barcode</span>
            <span className="sm:hidden">Scan</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama produk, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all"
            />
          </div>
          <Button
            variant={filter === 'all' ? 'outline' : 'default'}
            onClick={() => setFilter(filter === 'all' ? 'safe' : filter === 'safe' ? 'warning' : filter === 'warning' ? 'expired' : 'all')}
            title={`Filter: ${RH_STATUS_LABELS[filter]}`}
            className="h-12 w-12 rounded-xl flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white border-0"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
        {filter !== 'all' && (
          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 px-3 py-1 rounded-full text-xs"
              onClick={() => setFilter('all')}
            >
              {RH_STATUS_LABELS[filter]} ×
            </Badge>
          </div>
        )}
      </div>

      {/* Summary Cards - Mobile Friendly */}
      <div className="px-4 py-4 space-y-3">
        {unreadCount > 0 && (
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                    Perhatian!
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {unreadCount} produk perlu ditindaklanjuti
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {summary.totalSafe}
                  </p>
                  <p className="text-xs text-muted-foreground">Aman</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 ${summary.totalWarning > 0 ? 'animate-pulse' : ''}`}>
                    {summary.totalWarning}
                  </p>
                  <p className="text-xs text-muted-foreground">Retur</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 ${summary.totalExpired > 0 ? 'animate-pulse' : ''}`}>
                    {summary.totalExpired}
                  </p>
                  <p className="text-xs text-muted-foreground">Jatuh RH</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-orange-100/50 to-white dark:from-orange-950/30 dark:to-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {summary.totalProducts}
                  </p>
                  <p className="text-xs text-muted-foreground">Produk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product List - Mobile Friendly Cards */}
      <div className="px-4 pb-4">
        <h2 className="text-lg font-semibold mb-3 px-1">Daftar Produk</h2>
        {filteredProducts.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-all">
                <Accordion type="single" collapsible>
                  <AccordionItem value={product.id} className="border-0">
                    <AccordionTrigger className="hover:no-underline px-4 py-3">
                      <div className="flex flex-1 items-center justify-between pr-2">
                        <div className="flex flex-col items-start min-w-0 flex-1">
                          <span className="font-semibold text-sm sm:text-base truncate w-full">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                              {product.barcode}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                              {product.plu}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <Badge
                            className={`${RH_STATUS_COLORS[product.batches[0]?.status || 'safe']} ${RH_STATUS_ANIMATIONS[product.batches[0]?.status || 'safe']} text-xs px-2 py-1`}
                          >
                            {RH_STATUS_LABELS[product.batches[0]?.status || 'safe']}
                          </Badge>
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProduct(product.id, product.name);
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-4">
                        <ScrollArea className="rounded-md border-2 max-h-48">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="whitespace-nowrap text-xs font-semibold">Batch</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold">Kadaluarsa</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold">Tgl RH</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold text-right">Qty</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {product.batches.map((batch) => (
                                <TableRow key={batch.id}>
                                  <TableCell className="font-medium text-xs whitespace-nowrap">
                                    {batch.batchNumber}
                                  </TableCell>
                                  <TableCell className="text-xs whitespace-nowrap">
                                    {format(new Date(batch.expiryDate), 'dd MMM', { locale: id })}
                                  </TableCell>
                                  <TableCell className="text-xs whitespace-nowrap">
                                    {format(new Date(batch.rhDate), 'dd MMM', { locale: id })}
                                  </TableCell>
                                  <TableCell className="text-xs whitespace-nowrap text-right font-semibold">
                                    {batch.quantity}
                                  </TableCell>
                                  <TableCell className="text-xs whitespace-nowrap">
                                    <Badge
                                      className={`${RH_STATUS_COLORS[batch.status]} ${RH_STATUS_ANIMATIONS[batch.status]} text-xs px-2 py-0.5`}
                                    >
                                      {RH_STATUS_LABELS[batch.status]}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk <strong>{deleteDialog.productName}</strong>? Tindakan ini tidak dapat dibatalkan dan semua data batch produk akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive hover:bg-destructive/90">
              <Trash2 className="h-4 w-4 mr-2" />
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
