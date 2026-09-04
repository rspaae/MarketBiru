'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  Camera, 
  Search, 
  CheckCircle2, 
  Store, 
  Truck, 
  AlertCircle, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw,
  Upload,
  SwitchCamera,
  Check,
  Zap,
  Phone,
  Clock,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore, formatRupiah } from '@/lib/store';
import { Order } from '@/lib/types';

export default function AdminScanPage() {
  const { orders, findOrderByCode, updateOrderStatus, isHydrated } = useStore();
  const [manualCode, setManualCode] = useState('');
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');

  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingPickupOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Extract clean order code from raw text, url, or query
  const extractOrderCode = (rawText: string): string => {
    let clean = rawText.trim();
    // Check if it's a URL (e.g., http://.../nota/MKT-20260904-0001)
    const matchUrl = clean.match(/MKT-\d{8}-\d{4}/i);
    if (matchUrl) {
      return matchUrl[0].toUpperCase();
    }
    return clean.toUpperCase();
  };

  const handleLookup = (rawText: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    const code = extractOrderCode(rawText);
    const order = findOrderByCode(code);

    if (order) {
      setScannedOrder(order);
      // Haptic feedback if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (e) {}
      }
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      setScannedOrder(null);
      setErrorMessage(`Pesanan dengan kode "${code}" tidak ditemukan dalam sistem.`);
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    setSuccessMessage('Pesanan berhasil diselesaikan dan barang telah diserahkan ke siswa!');
    setScannedOrder((prev) => (prev ? { ...prev, status: 'completed' } : null));

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {}
  };

  // Enumerate cameras when component mounts
  useEffect(() => {
    let isMounted = true;
    const loadCameras = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const devices = await Html5Qrcode.getCameras();
        if (isMounted && devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if found in label
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      } catch (err) {
        // Camera enumeration might require prior permission on some browsers
        console.log('Camera enumeration pending permission:', err);
      }
    };

    loadCameras();
    return () => {
      isMounted = false;
      stopScanner();
    };
  }, []);

  // Start Camera Scanner via html5-qrcode
  const startScanner = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Stop previous instance if exists
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch (e) {}
      }

      const scanner = new Html5Qrcode('qr-reader-container');
      html5QrCodeRef.current = scanner;

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.max(180, Math.floor(minEdge * 0.75));
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        cameraConfig,
        qrConfig,
        (decodedText: string) => {
          handleLookup(decodedText);
          stopScanner();
        },
        (error: any) => {
          // Scanning frame tick
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsCameraActive(false);
      
      let msg = 'Gagal mengakses kamera.';
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        msg = 'Browser membatasi kamera pada koneksi non-HTTPS. Silakan gunakan opsi Unggah Foto/File QR atau Forward HTTPS di VS Code.';
      } else if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        msg = 'Izin kamera ditolak. Silakan berikan izin akses kamera pada pengaturan browser.';
      } else {
        msg = `Kamera tidak dapat dimulai: ${err?.message || 'Pastikan tidak digunakan oleh tab lain'}. Kamu juga bisa menggunakan tombol 'Unggah Foto QR'.`;
      }
      setErrorMessage(msg);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Scan QR Code from uploaded image / camera capture file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-container');
      const decodedText = await scanner.scanFile(file, true);
      handleLookup(decodedText);
      scanner.clear();
    } catch (err: any) {
      console.error('File scan error:', err);
      setErrorMessage('QR Code tidak terdeteksi pada gambar ini. Pastikan gambar jelas dan tidak blur.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Memuat sistem pemindai...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <QrCode className="w-8 h-8 text-blue-600" />
            <span>Scanner QR Code Nota Siswa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pindai QR nota siswa lewat kamera live, ambil foto dari HP, atau input kode manual
          </p>
        </div>

        {/* Scan Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
          <button
            onClick={() => {
              setScanMode('camera');
              stopScanner();
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              scanMode === 'camera'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Kamera Live</span>
          </button>
          <button
            onClick={() => {
              setScanMode('upload');
              stopScanner();
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              scanMode === 'upload'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Foto / Galeri</span>
          </button>
          <button
            onClick={() => {
              setScanMode('manual');
              stopScanner();
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
              scanMode === 'manual'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Input Kode</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">Pemberitahuan Scanner:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Scanner Box */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 1. Camera Live Scanner */}
          {scanMode === 'camera' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Live Camera Scanner
                </h3>
                {isCameraActive && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kamera Aktif
                  </span>
                )}
              </div>

              {/* Camera Selection Dropdown if multiple cameras */}
              {cameras.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <SwitchCamera className="w-4 h-4 text-slate-500 shrink-0" />
                  <select
                    value={selectedCameraId}
                    onChange={(e) => {
                      setSelectedCameraId(e.target.value);
                      if (isCameraActive) {
                        stopScanner().then(() => startScanner());
                      }
                    }}
                    className="flex-1 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Kamera ${cam.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Video container */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 min-h-[260px] flex items-center justify-center border-2 border-slate-200 shadow-inner">
                <div id="qr-reader-container" className="w-full h-full min-h-[260px]" />

                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900/90 text-white">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                      <QrCode className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Arahkan Kamera ke QR Nota</h4>
                      <p className="text-xs text-slate-300 max-w-xs mt-1">
                        Sistem akan otomatis mendeteksi QR Code dan membuka data pesanan siswa.
                      </p>
                    </div>
                    <button
                      onClick={startScanner}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Nyalakan Kamera Scanner</span>
                    </button>
                  </div>
                )}
              </div>

              {isCameraActive && (
                <button
                  onClick={stopScanner}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>Matikan Kamera</span>
                </button>
              )}
            </div>
          )}

          {/* 2. Upload / Take Photo Scanner */}
          {scanMode === 'upload' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Unggah Foto QR / Tangkapan Layar
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ambil foto langsung dari kamera HP atau pilih screenshot nota siswa dari galeri.
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center text-blue-600">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">
                    {isProcessingFile ? 'Menganalisis QR Code...' : 'Pilih / Ambil Foto QR Code'}
                  </strong>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mendukung format JPG, PNG, WEBP, atau kamera langsung
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isProcessingFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                >
                  {isProcessingFile ? 'Memproses...' : 'Buka Kamera / Galeri'}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* 3. Manual Search Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-600" />
              Input Manual Kode Nota
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: MKT-20260904-0001"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Cari
              </button>
            </form>
          </div>

          {/* 4. Quick Test Buttons: Pending Orders */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Pesanan Belum Selesai ({pendingPickupOrders.length})
              </h4>
              <span className="text-[11px] text-blue-600 font-semibold">Klik untuk Tes Verifikasi</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {pendingPickupOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Semua pesanan sudah selesai! 🎉</p>
              ) : (
                pendingPickupOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setManualCode(ord.orderCode);
                      handleLookup(ord.orderCode);
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition flex items-center justify-between gap-2 group"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600 group-hover:underline">
                        {ord.orderCode}
                      </span>
                      <p className="font-bold text-slate-800">{ord.studentName} ({ord.studentClass})</p>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {ord.deliveryMethod === 'pickup' ? 'Ambil di Koperasi' : 'Antar ke Kelas'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {formatRupiah(ord.totalPrice)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        {ord.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Scanned Order Result Card */}
        <div className="lg:col-span-6">
          {scannedOrder ? (
            <div className="bg-white rounded-3xl border-2 border-blue-500 p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              
              {/* Header Result */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Nota Terverifikasi
                    </span>
                    <h3 className="font-mono font-black text-lg text-blue-700">
                      {scannedOrder.orderCode}
                    </h3>
                  </div>
                </div>

                <div>
                  {scannedOrder.status === 'completed' ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Sudah Selesai
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Siap Diserahkan
                    </span>
                  )}
                </div>
              </div>

              {/* Student Detail Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Nama Siswa:</span>
                  <strong className="text-slate-900 font-extrabold text-sm">{scannedOrder.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Kelas / Jurusan:</span>
                  <strong className="text-slate-900 font-extrabold text-sm">{scannedOrder.studentClass}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">WhatsApp:</span>
                  <strong className="text-slate-800">{scannedOrder.whatsappNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Metode Pengambilan:</span>
                  <strong className="text-slate-800">
                    {scannedOrder.deliveryMethod === 'pickup' ? 'Ambil Sendiri di Koperasi' : 'Diantar ke Kelas'}
                  </strong>
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Daftar Barang yang Diambil:
                </h4>
                <div className="space-y-2 border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                  {scannedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-slate-800">{item.productName}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Total */}
              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Status Pembayaran:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full uppercase text-[10px] ${
                    scannedOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {scannedOrder.paymentStatus === 'paid' ? 'LUNAS (QRIS/Transfer)' : 'BELUM BAYAR (Bayar Tunai di Kasir)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-800 font-extrabold text-sm pt-1 border-t border-blue-200/60">
                  <span>Total Tagihan:</span>
                  <span className="text-base text-blue-700">{formatRupiah(scannedOrder.totalPrice)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {scannedOrder.status !== 'completed' ? (
                  <button
                    onClick={() => handleCompleteOrder(scannedOrder.id)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verifikasi & Serahkan Barang ke Siswa</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl text-center text-xs font-extrabold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Barang Pesanan Ini Telah Sukses Diserahkan</span>
                  </div>
                )}

                <Link
                  href={`/nota/${scannedOrder.orderCode}`}
                  target="_blank"
                  className="w-full py-2.5 text-slate-600 hover:text-blue-600 text-xs font-semibold text-center block transition hover:underline"
                >
                  Buka Halaman Nota Lengkap $\rightarrow$
                </Link>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-base">Belum Ada Nota yang Di-Scan</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Arahkan kamera ke QR nota siswa atau pilih salah satu kode pesanan dari daftar di sebelah kiri untuk melihat rincian barang.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
