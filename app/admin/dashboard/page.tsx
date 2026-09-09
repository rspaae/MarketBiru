'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  Truck,
  Store,
  Database,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';

export default function AdminDashboardPage() {
  const { orders, products, updateOrderStatus, isHydrated } = useStore();
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [checkingDb, setCheckingDb] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const checkDb = () => {
    setCheckingDb(true);
    fetch('/api/db/test')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => setDbStatus({ connected: false, message: 'MySQL belum aktif.' }))
      .finally(() => setCheckingDb(false));
  };

  useEffect(() => {
    checkDb();
  }, []);

  const handleSyncDb = async () => {
    setSyncLoading(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/db/init', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncMsg({ text: data.message, type: 'success' });
        setDbStatus({ connected: true, message: 'Database aktif dan tersinkronisasi!' });
      } else {
        setSyncMsg({ text: data.message || 'Gagal sinkronisasi.', type: 'error' });
      }
    } catch {
      setSyncMsg({ text: 'Gagal terhubung ke server MySQL Laragon.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  if (!isHydrated) {
    return <div className="p-8 text-center text-slate-400">Memuat data dashboard...</div>;
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const processingOrders = orders.filter((o) => o.status === 'processing');

  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="space-y-1">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            Selamat Datang, Petugas Koperasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Pengelola Koperasi 11
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            Kelola transaksi masuk, stok seragam, dan pemindaian barcode nota siswa di sini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/scan"
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2 transition active:scale-95"
          >
            <QrCode className="w-5 h-5" />
            <span>Buka Scanner QR</span>
          </Link>
        </div>
      </div>

      {/* Database MySQL Laragon Status Widget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            checkingDb
              ? 'bg-slate-100 text-slate-500'
              : dbStatus?.connected
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
          }`}>
            <Database className={`w-5 h-5 ${checkingDb ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Status Database MySQL Laragon:</span>
              {checkingDb ? (
                <span className="text-slate-400">Mengecek...</span>
              ) : dbStatus?.connected ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold text-[11px] border border-emerald-200">
                  ● Terhubung (market_biru)
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-extrabold text-[11px] border border-amber-200">
                  ● Belum Terhubung / Perlu Setup
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Host: 127.0.0.1:3306 &bull; DB: market_biru
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={checkDb}
            disabled={checkingDb}
            title="Refresh status koneksi"
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${checkingDb ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSyncDb}
            disabled={syncLoading}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {syncLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ Setup / Sync Database Otomatis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
          syncMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {syncMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{syncMsg.text}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Omset Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {formatRupiah(totalRevenue)}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-emerald-600 font-semibold">
              {completedOrders.length} transaksi selesai
            </span>
            <Link
              href="/admin/laporan"
              className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Laporan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pesanan Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 tracking-tight">
            {pendingOrders.length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Perlu disiapkan / diverifikasi
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sedang Diproses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 tracking-tight">
            {processingOrders.length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Siap diambil / diantar
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Produk Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {activeProducts.length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Dari {products.length} total produk
          </span>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Daftar Pesanan Masuk Terbaru
            </h3>
            <p className="text-xs text-slate-500">Pantau transaksi dan proses pesanan siswa secara langsung</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>Semua Pesanan ({orders.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Kode Nota</th>
                <th className="py-3 px-4">Siswa / Kelas</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    <Link href={`/nota/${order.orderCode}`} className="hover:underline">
                      {order.orderCode}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{order.studentName}</div>
                    <div className="text-[11px] text-slate-400">{order.studentClass}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {order.deliveryMethod === 'pickup' ? (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Store className="w-3.5 h-3.5 text-blue-600" /> Ambil Sendiri
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" /> Diantar ke Kelas
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {formatRupiah(order.totalPrice)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'ready_for_pickup'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {order.status !== 'completed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Selesaikan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
