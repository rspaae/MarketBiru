'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Store, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  QrCode,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { formatRupiah } from '@/lib/store';
import { Order, OrderStatus } from '@/lib/types';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbError, setDbError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setDbError('');
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      } else {
        setDbError(data.error || 'Gagal mengambil data pesanan.');
      }
    } catch (err) {
      setDbError('Gagal terhubung ke server. Pastikan database MySQL Laragon aktif.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrderModal?.id === orderId) setSelectedOrderModal(data.order);
      }
    } catch (err) {
      alert('Gagal mengupdate status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmPayment: true }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        if (selectedOrderModal?.id === orderId) setSelectedOrderModal(data.order);
      }
    } catch (err) {
      alert('Gagal konfirmasi pembayaran.');
    } finally {
      setUpdatingId(null);
    }
  };

  const [deletingOrder, setDeletingOrder] = useState<{ id: string; code: string } | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const confirmDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsDeletingLoading(true);
    try {
      await fetch(`/api/orders/${deletingOrder.id}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== deletingOrder.id));
      if (selectedOrderModal?.id === deletingOrder.id) setSelectedOrderModal(null);
      setDeletingOrder(null);
    } catch (err) {
      console.error('Gagal menghapus pesanan:', err);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleDeleteOrder = (orderId: string, orderCode: string) => {
    setDeletingOrder({ id: orderId, code: orderCode });
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = selectedStatus === 'all' || o.status === selectedStatus;
    const matchQuery =
      o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.studentClass.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const statuses = [
    { label: 'Semua', value: 'all', count: orders.length },
    { label: 'Pending', value: 'pending', count: orders.filter((o) => o.status === 'pending').length },
    { label: 'Diproses', value: 'processing', count: orders.filter((o) => o.status === 'processing').length },
    { label: 'Siap Diambil', value: 'ready_for_pickup', count: orders.filter((o) => o.status === 'ready_for_pickup').length },
    { label: 'Diantar', value: 'delivering', count: orders.filter((o) => o.status === 'delivering').length },
    { label: 'Selesai', value: 'completed', count: orders.filter((o) => o.status === 'completed').length },
  ];

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Belum ada pesanan untuk diexport.');
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
      'Total Biaya',
      'Status Pesanan',
    ];

    const rows = orders.map((ord, idx) => {
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

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Daftar_Pesanan_Koperasi_SMKN11_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Memuat pesanan dari database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manajemen Pesanan Masuk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data real-time dari database — semua pesanan siswa dari semua perangkat
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          <Link
            href="/admin/laporan"
            className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Laporan Omset</span>
          </Link>

          <Link
            href="/admin/scan"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Scanner QR</span>
          </Link>
        </div>
      </div>

      {/* DB Error */}
      {dbError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Koneksi Database Gagal</strong>
            <p>{dbError}</p>
            <p className="mt-1 text-rose-600">Pastikan MySQL Laragon sudah aktif dan database <code>market_biru</code> sudah diimport dari <code>database.sql</code>.</p>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st.value}
              onClick={() => setSelectedStatus(st.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedStatus === st.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedStatus === st.value ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode nota (MB11-...), nama siswa, atau kelas..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Kode Nota</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Pengambilan</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {orders.length === 0
                      ? 'Belum ada pesanan masuk. Pesanan akan muncul di sini setelah siswa checkout.'
                      : 'Tidak ada pesanan yang sesuai filter.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <button
                        onClick={() => setSelectedOrderModal(ord)}
                        className="hover:underline flex items-center gap-1.5 text-left"
                      >
                        <QrCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{ord.orderCode}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.studentName}</div>
                      <div className="text-[11px] text-slate-400">{ord.studentClass} • {ord.whatsappNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.deliveryMethod === 'pickup' ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Store className="w-3.5 h-3.5 text-blue-600" /> Ambil Sendiri
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" /> Diantar ke Kelas
                          </span>
                          <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[140px]">
                            {ord.deliveryAddress}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold block text-slate-800">
                          {ord.paymentMethod === 'cash' ? '💵 Tunai Kasir' : '📱 Transfer / QRIS'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      {formatRupiah(ord.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
                          ord.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.status === 'processing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : ord.status === 'ready_for_pickup'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        } disabled:opacity-50 disabled:cursor-wait`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Diproses</option>
                        <option value="ready_for_pickup">Siap Diambil</option>
                        <option value="delivering">Diantar</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {ord.paymentStatus === 'unpaid' && ord.paymentMethod === 'transfer' && (
                        <button
                          onClick={() => handleConfirmPayment(ord.id)}
                          disabled={updatingId === ord.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                          title="Konfirmasi Bukti Transfer"
                        >
                          Konfirmasi Lunas
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrderModal(ord)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(ord.id, ord.orderCode)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Pesanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rincian Nota</span>
                <h3 className="font-mono font-black text-base text-blue-900">
                  {selectedOrderModal.orderCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p><strong>Nama Siswa:</strong> {selectedOrderModal.studentName}</p>
                <p><strong>Kelas & Jurusan:</strong> {selectedOrderModal.studentClass}</p>
                <p><strong>No. WhatsApp:</strong> {selectedOrderModal.whatsappNumber}</p>
                <p><strong>Waktu Pesan:</strong> {new Date(selectedOrderModal.createdAt).toLocaleString('id-ID')}</p>
                {selectedOrderModal.notes && (
                  <p><strong>Catatan:</strong> {selectedOrderModal.notes}</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Item Barang:</h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 p-2">
                  {selectedOrderModal.items.map((i: any) => (
                    <div key={i.id} className="py-2 flex justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{i.productName}</p>
                        <span className="text-slate-400">{i.quantity} × {formatRupiah(i.price)}</span>
                      </div>
                      <strong className="text-slate-900">{formatRupiah(i.subtotal)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between font-extrabold text-sm text-blue-600">
                <span>Total Pesanan:</span>
                <span>{formatRupiah(selectedOrderModal.totalPrice)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                href={`/nota/${selectedOrderModal.orderCode}`}
                target="_blank"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Buka Halaman Nota →
              </Link>
              {selectedOrderModal.status !== 'completed' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedOrderModal.id, 'completed');
                    setSelectedOrderModal(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Selesaikan Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Delete Order Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={confirmDeleteOrder}
        title="Hapus Data Pesanan"
        description={`Apakah Anda yakin ingin menghapus pesanan ${deletingOrder?.code}? Data transaksi yang dihapus tidak dapat dipulihkan.`}
        confirmText="Hapus Pesanan"
        cancelText="Batal"
        variant="danger"
        icon="trash"
        isLoading={isDeletingLoading}
      />
    </div>
  );
}
