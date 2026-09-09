'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  FileSpreadsheet,
  PieChart,
  Tag,
  CreditCard,
  Truck,
  Building2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { formatRupiah } from '@/lib/store';
import { Order, OrderItem } from '@/lib/types';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminLaporanPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [statusFilter, setStatusFilter] = useState<'completed' | 'all'>('completed');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Gagal mengambil data pesanan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter berdasarkan rentang tanggal & status
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      // Filter status
      if (statusFilter === 'completed' && order.status !== 'completed') {
        return false;
      }

      // Filter tanggal
      if (dateFilter === 'all') return true;
      const orderDate = new Date(order.createdAt);
      if (dateFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateFilter === '7days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (dateFilter === '30days') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [orders, dateFilter, statusFilter]);

  // Statistik Finansial
  const stats = useMemo(() => {
    const totalOmset = filteredOrders.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalDeliveryFee = filteredOrders.reduce((acc, curr) => acc + (curr.deliveryFee || 0), 0);
    const totalProductOmset = totalOmset - totalDeliveryFee;
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? totalOmset / orderCount : 0;

    // Pembayaran
    const cashOmset = filteredOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
    const transferOmset = filteredOrders
      .filter((o) => o.paymentMethod === 'transfer')
      .reduce((acc, curr) => acc + curr.totalPrice, 0);

    // Pengantaran
    const pickupCount = filteredOrders.filter((o) => o.deliveryMethod === 'pickup').length;
    const deliveryCount = filteredOrders.filter((o) => o.deliveryMethod === 'delivery').length;

    // Rekap per Produk
    const productMap = new Map<string, { name: string; quantity: number; totalRevenue: number }>();
    filteredOrders.forEach((ord) => {
      ord.items?.forEach((item) => {
        const existing = productMap.get(item.productId) || {
          name: item.productName,
          quantity: 0,
          totalRevenue: 0,
        };
        existing.quantity += item.quantity;
        existing.totalRevenue += item.subtotal;
        productMap.set(item.productId, existing);
      });
    });

    const productSales = Array.from(productMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    );

    return {
      totalOmset,
      totalProductOmset,
      totalDeliveryFee,
      orderCount,
      avgOrderValue,
      cashOmset,
      transferOmset,
      pickupCount,
      deliveryCount,
      productSales,
    };
  }, [filteredOrders]);

  const [emptyExportModal, setEmptyExportModal] = useState(false);

  // Fungsi Export ke CSV / Excel
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      setEmptyExportModal(true);
      return;
    }

    const headers = [
      'No',
      'Kode Pesanan',
      'Waktu Transaksi',
      'Nama Siswa',
      'Kelas',
      'No WhatsApp',
      'Metode Ambil',
      'Lokasi Antar',
      'Metode Bayar',
      'Status Bayar',
      'Rincian Produk (Qty x Harga)',
      'Subtotal Produk',
      'Biaya Pengantaran',
      'Total Omset',
      'Status Pesanan',
    ];

    const rows = filteredOrders.map((ord, idx) => {
      const itemsDetail = (ord.items || [])
        .map((it) => `${it.productName} (${it.quantity}x Rp${it.price})`)
        .join('; ');

      const subtotalProd = ord.totalPrice - (ord.deliveryFee || 0);
      const formattedDate = new Date(ord.createdAt).toLocaleString('id-ID');

      return [
        idx + 1,
        `"${ord.orderCode}"`,
        `"${formattedDate}"`,
        `"${ord.studentName.replace(/"/g, '""')}"`,
        `"${ord.studentClass}"`,
        `"${ord.whatsappNumber}"`,
        ord.deliveryMethod === 'pickup' ? 'Ambil di Koperasi' : 'Diantar ke Kelas',
        `"${(ord.deliveryAddress || '-').replace(/"/g, '""')}"`,
        ord.paymentMethod === 'cash' ? 'Tunai di Kasir' : 'Transfer Bank / QRIS',
        ord.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS',
        `"${itemsDetail.replace(/"/g, '""')}"`,
        subtotalProd,
        ord.deliveryFee || 0,
        ord.totalPrice,
        ord.status.toUpperCase(),
      ];
    });

    // Tambah Ringkasan di baris akhir
    rows.push([]);
    rows.push([
      'TOTAL REKAPITULASI',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      stats.totalProductOmset,
      stats.totalDeliveryFee,
      stats.totalOmset,
      `TOTAL ${stats.orderCount} TRANSAKSI`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_Koperasi_SMKN11_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Header & Controls (Hidden saat print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Laporan & Ekspor Keuangan
            </h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-md uppercase tracking-wider">
              Omset & Analisis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi pendapatan kotor, pembagian transaksi, dan ekspor data untuk pertanggungjawaban koperasi SMKN 11 Bandung.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor ke Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Hidden saat print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Rentang Waktu:
          </span>
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'all' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Semua Waktu
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === 'today' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === '7days' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1 rounded-lg transition ${
                dateFilter === '30days' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status Pesanan:
          </span>
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Pesanan Lunas/Selesai
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Semua Status
            </button>
          </div>
        </div>
      </div>

      {/* Printable Official Header (Hanya terlihat saat print) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              KOPERASI SISWA MARKET BIRU
            </h2>
            <p className="text-sm font-bold text-slate-700">SMK NEGERI 11 KOTA BANDUNG</p>
            <p className="text-xs text-slate-500">
              Jl. Budhi, Cilember, Kec. Cicendo, Kota Bandung, Jawa Barat 40175
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-900">LAPORAN KEUANGAN & OMSET</p>
            <p className="text-slate-500">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            <p className="text-slate-500">Filter: {dateFilter === 'all' ? 'Semua Periode' : dateFilter}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              Total Omset Penjualan
            </span>
            <div className="p-2 bg-white/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
            {formatRupiah(stats.totalOmset)}
          </p>
          <div className="flex justify-between text-[11px] text-blue-200 border-t border-white/10 pt-2">
            <span>Produk: {formatRupiah(stats.totalProductOmset)}</span>
            <span>Ongkir: {formatRupiah(stats.totalDeliveryFee)}</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Transaksi
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.orderCount}{' '}
            <span className="text-sm font-semibold text-slate-400">pesanan</span>
          </p>
          <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Ambil Koperasi: <strong>{stats.pickupCount}</strong></span>
            <span>Antar Kelas: <strong>{stats.deliveryCount}</strong></span>
          </div>
        </div>

        {/* Rata-rata Transaksi (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-rata / Pesanan
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatRupiah(stats.avgOrderValue)}
          </p>
          <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
            Nilai rata-rata per nota siswa
          </p>
        </div>

        {/* Metode Bayar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kanal Pembayaran
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>💵 Tunai di Kasir:</span>
              <span className="text-emerald-700">{formatRupiah(stats.cashOmset)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>📱 Transfer / QRIS:</span>
              <span className="text-blue-700">{formatRupiah(stats.transferOmset)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
            Rekap kas masuk & transfer
          </p>
        </div>
      </div>

      {/* Rekap Omset per Produk Resmi */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Rekap Penjualan per Produk Resmi SMKN 11</span>
            </h3>
            <p className="text-xs text-slate-400">
              Daftar kontribusi omset dari masing-masing seragam & atribut
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            {stats.productSales.length} Produk Terjual
          </span>
        </div>

        {stats.productSales.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada transaksi produk pada periode ini. Lakukan transaksi demo di halaman katalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4 text-center">Unit Terjual</th>
                  <th className="py-3 px-4 text-right">Total Pendapatan (Omset)</th>
                  <th className="py-3 px-4 text-right">Kontribusi %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.productSales.map((p, idx) => {
                  const percentage =
                    stats.totalProductOmset > 0
                      ? ((p.totalRevenue / stats.totalProductOmset) * 100).toFixed(1)
                      : '0';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600">
                        {p.quantity} pcs
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatRupiah(p.totalRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel Transaksi Terperinci */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Daftar Transaksi Terperinci ({filteredOrders.length} Pesanan)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Rincian seluruh pesanan masuk yang siap diexport untuk pembukuan keuangan
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada transaksi yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-3 px-4">Kode & Waktu</th>
                  <th className="py-3 px-4">Siswa / Kelas</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Rincian Barang</th>
                  <th className="py-3 px-4 text-right">Total Transaksi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-700">{ord.orderCode}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {ord.studentClass} • {ord.whatsappNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {ord.paymentMethod === 'cash' ? '💵 Tunai' : '📱 Transfer'}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {ord.deliveryMethod === 'pickup' ? 'Ambil di Kasir' : 'Antar ke Kelas'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        {ord.items?.map((it, i) => (
                          <div key={i} className="text-[11px] text-slate-700 truncate">
                            • {it.quantity}x {it.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-black text-slate-900">
                        {formatRupiah(ord.totalPrice)}
                      </div>
                      {ord.deliveryFee > 0 && (
                        <div className="text-[10px] text-slate-400">
                          (Termasuk ongkir {formatRupiah(ord.deliveryFee)})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lembar Tanda Tangan Resmi (Hanya muncul saat dicetak/print) */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-xs text-center">
        <div>
          <p className="text-slate-500 mb-16">Mengetahui,<br /><strong className="text-slate-800">Ketua Pengurus Koperasi SMKN 11</strong></p>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[200px]">
            ( .................................................. )
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">NIP / Identitas Pengurus</p>
        </div>

        <div>
          <p className="text-slate-500 mb-16">Bandung, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br /><strong className="text-slate-800">Petugas Kasir Koperasi</strong></p>
          <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[200px]">
            ( Petugas Kasir Koperasi 11 )
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Penanggung Jawab Transaksi</p>
        </div>
      </div>

      {/* Empty Export Modal */}
      <ConfirmModal
        isOpen={emptyExportModal}
        onClose={() => setEmptyExportModal(false)}
        onConfirm={() => setEmptyExportModal(false)}
        title="Tidak Ada Data Transaksi"
        description="Belum ada transaksi pada filter rentang waktu atau status yang dipilih. Silakan lakukan transaksi atau ubah filter laporan."
        confirmText="Tutup"
        cancelText="OK"
        variant="warning"
        icon="warning"
      />
    </div>
  );
}
