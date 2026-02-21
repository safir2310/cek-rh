'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRHStore } from '@/store/rh-store';
import { ArrowLeft, Package, Calendar, AlertTriangle, ScanLine, Plus, Trash2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

interface BatchEntry {
  id: string;
  expiryDate: string;
  quantity: string;
}

export function AddProductPage() {
  const { setCurrentView, addProduct, products, setPendingBarcode, pendingBarcode, addBatchToProduct } = useRHStore();

  // Product info
  const [productName, setProductName] = useState('');
  const [barcode, setBarcode] = useState(pendingBarcode || '');
  
  // Check if barcode matches existing product
  const [existingProduct, setExistingProduct] = useState<any>(null);
  const [isAddingBatch, setIsAddingBatch] = useState(false);

  // RH info
  const [rhDays, setRhDays] = useState('14'); // Default H-14
  const [batches, setBatches] = useState<BatchEntry[]>([
    { id: '1', expiryDate: '', quantity: '' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate auto PLU
  const generateAutoPlu = () => {
    const nextNumber = products.length + 1;
    return `PLU${String(nextNumber).padStart(3, '0')}`;
  };

  // Generate auto batch number
  const generateAutoBatchNumber = (barcodeValue: string, batchIndex: number) => {
    // Count existing batches for this barcode from products
    const existingBatchesForProduct = products
      .filter(p => p.barcode === barcodeValue)
      .reduce((count, p) => count + p.batches.length, 0);

    const nextNumber = existingBatchesForProduct + batchIndex + 1;
    return `BATCH${String(nextNumber).padStart(3, '0')}`;
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  // Check if barcode was scanned and clear it
  useEffect(() => {
    if (pendingBarcode) {
      setBarcode(pendingBarcode);
      setPendingBarcode(null);
    }
  }, [pendingBarcode, setPendingBarcode]);
  
  // Check if barcode matches existing product
  useEffect(() => {
    if (barcode.trim()) {
      const existing = products.find(p => p.barcode === barcode.trim());
      if (existing) {
        setExistingProduct(existing);
        setProductName(existing.name);
        setRhDays('14'); // Default to H-14
        setBatches([{ id: Date.now().toString(), expiryDate: '', quantity: '' }]);
        setIsAddingBatch(true);
        setError('');
      } else {
        setExistingProduct(null);
        setIsAddingBatch(false);
      }
    }
  }, [barcode, products]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Add new batch entry
  const handleAddBatch = () => {
    const newBatch: BatchEntry = {
      id: Date.now().toString(),
      expiryDate: '',
      quantity: ''
    };
    setBatches([...batches, newBatch]);
  };

  // Remove batch entry
  const handleRemoveBatch = (batchId: string) => {
    if (batches.length === 1) {
      setError('Minimal harus ada satu batch');
      return;
    }
    setBatches(batches.filter(b => b.id !== batchId));
  };

  // Update batch field
  const handleUpdateBatch = (batchId: string, field: keyof BatchEntry, value: string) => {
    setBatches(batches.map(b => 
      b.id === batchId ? { ...b, [field]: value } : b
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!productName.trim()) newErrors.push('Nama produk wajib diisi');
    if (!barcode.trim()) newErrors.push('Barcode wajib diisi');
    if (!rhDays || parseInt(rhDays) <= 0) newErrors.push('Hitungan hari RH harus lebih dari 0');

    // Validate each batch
    batches.forEach((batch, index) => {
      if (!batch.expiryDate) {
        newErrors.push(`Batch ${index + 1}: Tanggal kadaluarsa wajib diisi`);
      }
      if (!batch.quantity || parseInt(batch.quantity) <= 0) {
        newErrors.push(`Batch ${index + 1}: Jumlah harus lebih dari 0`);
      }
    });

    // Validate expiry dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    batches.forEach((batch, index) => {
      if (batch.expiryDate) {
        const expiry = new Date(batch.expiryDate);
        if (expiry <= today) {
          newErrors.push(`Batch ${index + 1}: Tanggal kadaluarsa harus setelah hari ini`);
        }
      }
    });

    // Only check duplicate barcode when adding new product
    if (!isAddingBatch) {
      const duplicate = products.find(
        (p) => p.barcode === barcode.trim()
      );
      if (duplicate) {
        newErrors.push(`Barcode sudah digunakan oleh produk: ${duplicate.name}. Sistem akan otomatis menambah batch ke produk yang sudah ada.`);
      }
    }

    if (newErrors.length > 0) {
      setError(newErrors.join('\n'));
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const today = new Date();
    const days = parseInt(rhDays) || 14;
    const barcodeValue = barcode.trim();

    // If adding batch to existing product
    if (isAddingBatch && existingProduct) {
      // Generate batch data for existing product
      const batchData = batches.map((batch) => {
        const expiry = new Date(batch.expiryDate);
        const rh = subDays(expiry, days);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let status: 'safe' | 'warning' | 'expired' = 'safe';
        if (daysUntilExpiry <= 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= days) {
          status = 'warning';
        }

        return {
          id: `batch-${Date.now()}-${Math.random()}`,
          productId: existingProduct.id,
          batchNumber: generateAutoBatchNumber(barcodeValue, existingProduct.batches.length),
          expiryDate: expiry,
          rhDate: rh,
          quantity: parseInt(batch.quantity),
          status,
          createdAt: new Date(),
        };
      });

      // Add each batch to the existing product
      batchData.forEach(batch => {
        addBatchToProduct(existingProduct.id, batch);
      });

      setIsLoading(false);

      toast({
        title: 'Batch Berhasil Ditambahkan',
        description: `${batches.length} batch baru ditambahkan ke ${existingProduct.name}`,
      });
    } else {
      // Create new product
      const autoPlu = generateAutoPlu();

      // Generate all batch data
      const batchData = batches.map((batch, index) => {
        const expiry = new Date(batch.expiryDate);
        const rh = subDays(expiry, days);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let status: 'safe' | 'warning' | 'expired' = 'safe';
        if (daysUntilExpiry <= 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= days) {
          status = 'warning';
        }

        return {
          id: `batch-${Date.now()}-${index}`,
          productId: Date.now().toString(),
          batchNumber: generateAutoBatchNumber(barcodeValue, index),
          expiryDate: expiry,
          rhDate: rh,
          quantity: parseInt(batch.quantity),
          status,
          createdAt: new Date(),
        };
      });

      // Add new product with all batches
      const newProduct = {
        id: Date.now().toString(),
        barcode: barcodeValue,
        plu: autoPlu,
        name: productName.trim(),
        description: '',
        category: '',
        batches: batchData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addProduct(newProduct);
      setIsLoading(false);

      toast({
        title: 'Produk Berhasil Ditambahkan',
        description: `${productName} dengan ${batches.length} batch`,
      });
    }

    setCurrentView('dashboard');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
  };

  const handleScanBarcode = () => {
    setCurrentView('scan');
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300 px-2 sm:px-0 pb-20 sm:pb-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pt-4 sm:pt-6">
        <Button variant="outline" size="icon" onClick={handleBack} className="h-11 w-11 flex-shrink-0 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Tambah Produk</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Input data produk dengan multiple batch
          </p>
        </div>
      </div>

      <Card className={`shadow-lg border-2 ${isAddingBatch ? 'border-orange-400 dark:border-orange-500' : ''}`}>
        <CardHeader className={`p-4 sm:p-6 ${isAddingBatch ? 'bg-orange-50 dark:bg-orange-950/20' : ''}`}>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className={`h-5 w-5 sm:h-6 sm:w-6 ${isAddingBatch ? 'text-orange-600' : 'text-orange-500'}`} />
            {isAddingBatch ? 'Tambah Batch ke Produk' : 'Informasi Produk'}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isAddingBatch 
              ? `Menambah batch baru ke produk: ${existingProduct?.name}`
              : 'Lengkapi data produk dan tanggal kedaluwarsa untuk setiap batch'
            }
          </CardDescription>
          {isAddingBatch && (
            <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md border border-orange-300 dark:border-orange-700">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <span className="font-semibold">Info:</span> Barcode sudah terdaftar. Anda sedang menambah batch baru ke produk yang sudah ada.
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Product Information */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Data Produk
              </h3>

              <div className="space-y-2">
                <Label htmlFor="productName" className="text-sm sm:text-base">
                  {isAddingBatch ? 'Nama Produk (Auto)' : 'Nama Produk *'}
                </Label>
                <Input
                  id="productName"
                  placeholder="Contoh: Indomie Goreng Spesial"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isLoading || isAddingBatch}
                  className={`h-11 text-sm sm:text-base ${isAddingBatch ? 'bg-muted' : ''}`}
                />
                {isAddingBatch && (
                  <p className="text-xs text-muted-foreground">
                    Nama produk otomatis dari data yang sudah ada
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-sm sm:text-base">Barcode *</Label>
                <div className="relative">
                  <Input
                    id="barcode"
                    type="text"
                    placeholder="8991234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    disabled={isLoading}
                    className="h-11 font-mono pr-12 text-sm sm:text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleScanBarcode}
                    disabled={isLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-muted text-orange-500"
                    title="Scan Barcode"
                  >
                    <ScanLine className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAddingBatch 
                    ? 'Barcode otomatis terisi dari produk yang sudah ada. Anda dapat menambah batch baru.'
                    : 'Klik ikon untuk scan barcode. PLU dan Nomor Batch akan otomatis di-generate.'
                  }
                </p>
              </div>
            </div>

            {/* Batch Information */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Batch Produk ({batches.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBatch}
                  disabled={isLoading}
                  className="h-9 text-xs sm:text-sm border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Tambah Batch
                </Button>
              </div>

              {/* Batch List */}
              <div className="space-y-3">
                {batches.map((batch, index) => (
                  <Card key={batch.id} className="border-2 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-sm font-medium">Batch {index + 1}</span>
                        </div>
                        {batches.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBatch(batch.id)}
                            disabled={isLoading}
                            className="h-7 w-7 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`expiry-${batch.id}`} className="text-xs sm:text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-orange-500" />
                            Tgl Kadaluarsa *
                          </Label>
                          <Input
                            id={`expiry-${batch.id}`}
                            type="date"
                            value={batch.expiryDate}
                            onChange={(e) => handleUpdateBatch(batch.id, 'expiryDate', e.target.value)}
                            disabled={isLoading}
                            className="h-10 text-sm sm:text-base"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`qty-${batch.id}`} className="text-xs sm:text-sm">
                            Jumlah *
                          </Label>
                          <Input
                            id={`qty-${batch.id}`}
                            type="number"
                            min="1"
                            placeholder="100"
                            value={batch.quantity}
                            onChange={(e) => handleUpdateBatch(batch.id, 'quantity', e.target.value)}
                            disabled={isLoading}
                            className="h-10 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* Display RH date for this batch */}
                      {batch.expiryDate && (
                        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tgl RH (H-{rhDays}):</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              {format(subDays(new Date(batch.expiryDate), parseInt(rhDays) || 14), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* RH Settings */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Pengaturan RH
              </h3>

              <div className="space-y-2">
                <Label htmlFor="rhDays" className="flex items-center gap-2 text-sm sm:text-base">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Hitungan Hari RH (Sama untuk Semua Batch) *
                </Label>
                <div className="relative">
                  <Input
                    id="rhDays"
                    type="number"
                    min="1"
                    placeholder="14"
                    value={rhDays}
                    onChange={(e) => setRhDays(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pl-12 text-sm sm:text-base"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-medium text-muted-foreground">
                    H-
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Berapa hari sebelum tanggal kadaluarsa produk harus diretur. Semua batch menggunakan hitungan hari yang sama.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 sm:p-4 text-xs sm:text-sm text-destructive bg-destructive/10 rounded-md border-2 border-destructive/20">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <pre className="whitespace-pre-wrap font-sans">{error}</pre>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex gap-2 p-4 sm:p-6 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1 h-11 text-sm sm:text-base"
          >
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 h-11 text-sm sm:text-base ${isAddingBatch ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
          >
            {isLoading 
              ? 'Menyimpan...' 
              : isAddingBatch 
                ? `Tambah ${batches.length} Batch ke Produk` 
                : `Simpan ${batches.length} Batch`
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
