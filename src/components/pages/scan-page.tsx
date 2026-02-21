'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRHStore } from '@/store/rh-store';
import { ArrowLeft, Camera, ScanLine, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ScanPage() {
  const { setCurrentView, products, setPendingBarcode, pendingBarcode } = useRHStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [productName, setProductName] = useState('');
  const [isFound, setIsFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleBack = () => {
    setIsScanning(false);
    setCurrentView('dashboard');
  };

  const handleStartScan = () => {
    setIsScanning(true);
    setScannedCode('');
    setProductName('');
    setIsFound(false);
    setCameraError('');

    // Simulate camera access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err: Error) => {
          console.error('Error accessing camera:', err);
          setIsScanning(false);

          // Handle specific camera errors
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Akses kamera ditolak. Silakan izinkan akses kamera di browser Anda atau gunakan input manual.');
            toast({
              title: 'Akses Kamera Ditolak',
              description: 'Silakan izinkan akses kamera atau gunakan input manual.',
              variant: 'destructive',
            });
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera atau gunakan input manual.');
            toast({
              title: 'Kamera Tidak Ditemukan',
              description: 'Gunakan input manual sebagai alternatif.',
              variant: 'destructive',
            });
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setCameraError('Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain atau gunakan input manual.');
            toast({
              title: 'Kamera Sedang Digunakan',
              description: 'Gunakan input manual sebagai alternatif.',
              variant: 'destructive',
            });
          } else {
            setCameraError('Terjadi kesalahan saat mengakses kamera. Silakan gunakan input manual.');
            toast({
              title: 'Kamera Tidak Dapat Diakses',
              description: err.message || 'Gunakan input manual sebagai alternatif.',
              variant: 'destructive',
            });
          }
        });
    } else {
      setCameraError('Browser Anda tidak mendukung akses kamera. Silakan gunakan input manual.');
      toast({
        title: 'Browser Tidak Mendukung',
        description: 'Gunakan input manual sebagai alternatif.',
        variant: 'destructive',
      });
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const searchProductFromGoogle = async (code: string): Promise<string> => {
    try {
      setIsSearchingGoogle(true);

      const response = await fetch(`/api/search-product?barcode=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.success && data.productName) {
        toast({
          title: 'Produk Ditemukan di Google',
          description: `Nama: ${data.productName}`,
        });
        return data.productName;
      } else {
        toast({
          title: 'Tidak Ditemukan di Google',
          description: 'Silakan input nama produk secara manual',
          variant: 'destructive',
        });
        return '';
      }
    } catch (error) {
      console.error('Error searching Google:', error);
      toast({
        title: 'Gagal Mencari di Google',
        description: 'Silakan input nama produk secara manual',
        variant: 'destructive',
      });
      return '';
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  const simulateScan = async (code: string) => {
    setIsLoading(true);

    // Search in local database first
    const product = products.find(
      (p) => p.barcode === code || p.plu.toLowerCase() === code.toLowerCase()
    );

    setScannedCode(code);
    setIsFound(!!product);

    if (product) {
      setProductName(product.name);
      toast({
        title: 'Produk Ditemukan',
        description: `${product.name} (${product.barcode})`,
      });
      playBeepSound();
    } else {
      // Product not found locally, search in Google
      setProductName('');
      const googleProductName = await searchProductFromGoogle(code);
      if (googleProductName) {
        setProductName(googleProductName);
      }
    }

    setIsLoading(false);
    handleStopScan();
  };

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.error('Error playing beep:', e);
    }
  };

  const handleManualInput = (code: string) => {
    if (code.trim()) {
      simulateScan(code.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-300 px-2 sm:px-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Button variant="outline" size="icon" onClick={handleBack} className="h-11 w-11 flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Scan Barcode / PLU</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Scan kode produk untuk informasi RH
          </p>
        </div>
      </div>

      {/* Camera Error Display */}
      {cameraError && !isScanning && !scannedCode && (
        <Card className="shadow-lg border-2 border-destructive/50">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                </div>
              </div>
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-sm sm:text-base font-semibold text-destructive">Kamera Tidak Dapat Diakses</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{cameraError}</p>
                </div>

                {/* Demo Codes for Testing */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs sm:text-sm font-medium">Coba Simulasi (Demo):</p>
                  <div className="flex flex-wrap gap-2">
                    {['8991234567890', 'PLU001', '8999876543210', 'PLU002'].map((code) => (
                      <Badge
                        key={code}
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive/10 border-destructive/30 text-xs sm:text-sm"
                        onClick={() => {
                          setCameraError('');
                          simulateScan(code);
                        }}
                      >
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCameraError('')}
                    className="h-10 px-4 text-sm"
                  >
                    Tutup Pesan
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isScanning && !scannedCode && (
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Mulai Scan</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Scan barcode atau masukkan PLU produk secara manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={handleStartScan}
                size="lg"
                className="h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
              >
                <Camera className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Scan Barcode
              </Button>

              <div className="w-full">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Atau
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label htmlFor="manual-input" className="text-sm sm:text-base">Input Manual (Barcode/PLU)</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-input"
                    placeholder="Masukkan kode barcode atau PLU..."
                    onKeyPress={(e) => e.key === 'Enter' && handleManualInput((e.target as HTMLInputElement).value)}
                    className="h-11 text-sm sm:text-base"
                  />
                  <Button
                    onClick={() => {
                      const input = document.getElementById('manual-input') as HTMLInputElement;
                      handleManualInput(input?.value || '');
                    }}
                    className="h-11 px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Cari
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isScanning && (
        <Card className="shadow-lg border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-center text-lg sm:text-xl">Scan Barcode</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Arahkan kamera ke barcode produk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            {/* Camera Frame */}
            <div className="relative w-full aspect-[4/3] bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Scan Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 sm:w-64 h-32 sm:h-40 border-2 border-white/70 rounded-lg">
                  {/* Corner Markers */}
                  <div className="absolute top-0 left-0 w-4 sm:w-6 h-4 sm:h-6 border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-rh-safe" />
                  <div className="absolute top-0 right-0 w-4 sm:w-6 h-4 sm:h-6 border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-rh-safe" />
                  <div className="absolute bottom-0 left-0 w-4 sm:w-6 h-4 sm:h-6 border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-rh-safe" />
                  <div className="absolute bottom-0 right-0 w-4 sm:w-6 h-4 sm:h-6 border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-rh-safe" />

                  {/* Animated Scan Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-rh-safe animate-scan-line" />
                </div>
              </div>

              {/* Loading Indicator */}
              <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center">
                <Badge variant="outline" className="bg-black/50 text-white border-white/30 text-xs sm:text-sm">
                  <ScanLine className="w-3 h-3 mr-2 animate-pulse" />
                  Memindai...
                </Badge>
              </div>
            </div>

            {/* Demo Buttons for Testing */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Demo: Klik kode di bawah untuk simulasi
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['8991234567890', 'PLU001', '8999876543210', 'PLU002'].map((code) => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted text-xs sm:text-sm"
                    onClick={() => simulateScan(code)}
                  >
                    {code}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleStopScan}
              className="w-full h-11 text-sm sm:text-base"
            >
              Batalkan Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {scannedCode && (
        <Card className={`shadow-lg border-2 ${isFound ? 'border-rh-safe' : 'border-border'}`}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              {isFound ? (
                <>
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rh-safe" />
                  Produk Ditemukan
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                  Produk Tidak Ditemukan
                </>
              )}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isFound ? 'Data produk berhasil dimuat' : 'Silakan input nama produk secara manual'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Barcode / PLU</Label>
              <Input value={scannedCode} readOnly className="h-11 font-mono text-sm sm:text-base" />
            </div>

            {isFound ? (
              <>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Nama Produk</Label>
                  <Input value={productName} readOnly className="h-11 font-medium text-sm sm:text-base" />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleBack}
                    className="w-full h-11 text-sm sm:text-base"
                  >
                    Kembali ke Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setPendingBarcode(scannedCode);
                      setCurrentView('add-product');
                    }}
                    variant="outline"
                    className="w-full h-11 text-sm sm:text-base"
                  >
                    Gunakan untuk Tambah Produk
                  </Button>
                </div>
              </>
            ) : (
              <>
                {isSearchingGoogle ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3 py-6">
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Mencari di Google...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="manual-name" className="text-sm sm:text-base">Nama Produk</Label>
                    <Input
                      id="manual-name"
                      placeholder="Masukkan nama produk..."
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="h-11 text-sm sm:text-base"
                    />
                  </div>
                )}

                {!isSearchingGoogle && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setScannedCode('')}
                      className="flex-1 h-11 text-sm sm:text-base"
                    >
                      Scan Ulang
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Produk Ditambahkan',
                          description: `${productName} (${scannedCode})`,
                        });
                        setScannedCode('');
                        setProductName('');
                        setCurrentView('dashboard');
                      }}
                      className="flex-1 h-11 text-sm sm:text-base"
                      disabled={!productName.trim()}
                    >
                      Simpan
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingBarcode(scannedCode);
                    setCurrentView('add-product');
                  }}
                  className="w-full h-11 text-sm sm:text-base"
                  disabled={isSearchingGoogle}
                >
                  Gunakan Barcode untuk Tambah Produk Baru
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
