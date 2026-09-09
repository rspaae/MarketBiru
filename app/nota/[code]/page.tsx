'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  Store, 
  Truck, 
  Printer, 
  Share2, 
  ArrowLeft, 
  ShoppingBag, 
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles as SparkleIcon
} from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';
import { Order, OrderItem, OrderStatus } from '@/lib/types';

export default function NotaPage() {
  const params = useParams();
  const { findOrderByCode, isHydrated, updateOrderStatus } = useStore();
  const code = params.code as string;
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  const fetchLiveOrder = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder((prev: any) => {
            if (prev && prev.status !== 'completed' && data.order.status === 'completed') {
              try {
                confetti({
                  particleCount: 100,
                  spread: 80,
                  origin: { y: 0.5 },
                });
              } catch (_) {}
            }
            return data.order;
          });
          // Also sync to local store if available
          try {
            updateOrderStatus(data.order.id, data.order.status);
          } catch (_) {}
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    finally {
      if (isManual) setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    // Initial local cache display for instant render
    const localOrder = findOrderByCode(code);
    if (localOrder) {
      setOrder(localOrder);
      setLoading(false);
    }

    // Always fetch fresh data from MySQL immediately
    fetchLiveOrder();

    // Auto-poll live status from MySQL every 3.5 seconds until completed
    const interval = setInterval(() => {
      fetchLiveOrder();
    }, 3500);

    return () => clearInterval(interval);
  }, [code, isHydrated]);

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe ignore
      }
    }
  }, [order]);

  if (!isHydrated || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400">
        Memuat data nota pesanan...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-800">Nota Pesanan Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500">
          Kode pesanan <strong>{code}</strong> tidak terdaftar pada sistem kami.
        </p>
        <Link
          href="/lacak-pesanan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cari Kode Lain</span>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pesanan Selesai (Sudah Diterima)
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            Siap Diambil di Koperasi
          </span>
        );
      case 'delivering':
        return (
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            Sedang Diantar ke Kelas
          </span>
        );
      case 'processing':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Sedang Disiapkan Petugas
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            Pesanan Dibatalkan
          </span>
        );
      default:
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Verifikasi Kasir
          </span>
        );
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top action bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLiveOrder(true)}
            disabled={isRefreshing}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Perbarui Status Pesanan dari Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Cek Status Terbaru</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Nota</span>
          </button>
        </div>
      </div>

      {/* Verified Banner when Completed */}
      {order.status === 'completed' && (
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg flex items-center gap-3 animate-in zoom-in-95 no-print">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">Pesanan Selesai & Berhasil Diserahkan!</h3>
            <p className="text-xs text-emerald-100">
              Barang pesanan Anda telah diverifikasi dan diserahkan oleh petugas koperasi. Terima kasih!
            </p>
          </div>
        </div>
      )}

      {/* Main Printable Invoice Card */}
      <div id="printable-invoice" className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              11
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900 leading-tight">
                KOPERASI SISWA SMKN 11 BANDUNG
              </h2>
              <p className="text-xs text-slate-500">
                Bukti Transaksi & Nota Pengambilan Barang Resmi
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Status Pesanan
            </span>
            <div className="mt-1 flex items-center sm:justify-end gap-1.5">
              {getStatusBadge(order.status)}
              <button
                onClick={() => fetchLiveOrder(true)}
                disabled={isRefreshing}
                title="Refresh status pesanan"
                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition no-print"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Barcode Highlight Banner */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/80 rounded-2xl p-6 text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              Kode Barcode / QR Nota Siswa
            </span>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Tunjukkan QR Code ini kepada petugas kasir koperasi atau petugas pengantar barang.
            </p>
          </div>

          {/* Render QR Code — encode URL penuh agar scanner kasir bisa lookup otomatis */}
          <div className="inline-block p-4 bg-white rounded-2xl shadow-md border border-blue-100">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/admin/scan?code=${order.orderCode}`}
              size={180}
              level="H"
              includeMargin={true}
              className="mx-auto"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-xs">
              <span className="font-mono text-base font-extrabold text-blue-900 tracking-wider">
                {order.orderCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-[10px] font-bold text-blue-600 hover:underline no-print"
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="text-slate-400 block">Nama Siswa:</span>
            <strong className="text-slate-800 text-sm">{order.studentName}</strong>
            <span className="text-slate-500 block mt-1">Kelas: {order.studentClass}</span>
            <span className="text-slate-500 block">WhatsApp: {order.whatsappNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Waktu Pemesanan:</span>
            <strong className="text-slate-800">
              {new Date(order.createdAt).toLocaleString('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </strong>
            <div className="mt-2 space-y-1">
              <span className="text-slate-500 block">
                <strong>Metode Ambil:</strong>{' '}
                {order.deliveryMethod === 'pickup'
                  ? '🏢 Ambil Sendiri di Koperasi'
                  : `🛵 Diantar (${order.deliveryAddress || 'Ke Kelas'})`}
              </span>
              <span className="text-slate-500 block">
                <strong>Pembayaran:</strong>{' '}
                {order.paymentMethod === 'cash' ? '💵 Bayar Tunai di Kasir' : '📱 Transfer Bank / QRIS'}
              </span>
            </div>
          </div>
        </div>

        {/* Item Details Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Daftar Barang Dipesan
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800">{item.productName}</p>
                  <span className="text-[11px] text-slate-400">
                    {item.quantity} × {formatRupiah(item.price)}
                  </span>
                </div>
                <strong className="text-slate-900">{formatRupiah(item.subtotal)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Summary */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatRupiah(order.totalPrice - order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Biaya Pengantaran:</span>
            <span>{order.deliveryFee > 0 ? formatRupiah(order.deliveryFee) : 'Gratis (Rp 0)'}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-blue-600 pt-2 border-t border-slate-100">
            <span>Total Tagihan:</span>
            <span>{formatRupiah(order.totalPrice)}</span>
          </div>
        </div>

        {/* Bottom instructions */}
        <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 space-y-1">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Petunjuk Pengambilan Barang di Koperasi:</span>
          </div>
          <p>
            1. Simpan halaman ini atau catat kode nota <strong>{order.orderCode}</strong>.
          </p>
          <p>
            2. Datang ke koperasi pada jam istirahat pertama/kedua atau sepulang sekolah.
          </p>
          <p>
            3. Tunjukkan QR Code pada layar HP kepada petugas kasir untuk dipindai.
          </p>
        </div>

      </div>

      {/* Footer Navigation */}
      <div className="text-center no-print pt-4">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Lanjut Belanja Barang Lain</span>
        </Link>
      </div>

    </div>
  );
}
