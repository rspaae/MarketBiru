'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Receipt, ArrowRight, Clock, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';

export default function LacakPesananPage() {
  const router = useRouter();
  const { orders, isHydrated } = useStore();
  const [searchCode, setSearchCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    const clean = searchCode.trim().toUpperCase();
    const result = orders.find((o) => o.orderCode.toUpperCase() === clean);
    setFoundOrder(result || null);
    setSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <Receipt className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Lacak Nota & Pesanan Kamu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan kode nota pesanan (contoh: <code>MKT-20260904-0001</code>) untuk melihat status penyiapan atau pengambilan barang.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto bg-white p-3 rounded-2xl border border-slate-200/80 shadow-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setSearched(false);
              }}
              placeholder="Ketik kode nota: MKT-..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            Lacak
          </button>
        </form>
      </div>

      {/* Search Result */}
      {searched && (
        <div className="max-w-xl mx-auto">
          {foundOrder ? (
            <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Kode Pesanan</span>
                  <p className="font-mono font-black text-blue-900 text-base">{foundOrder.orderCode}</p>
                </div>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  {foundOrder.status}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600">
                <p><strong>Nama Pemesan:</strong> {foundOrder.studentName} ({foundOrder.studentClass})</p>
                <p><strong>Total:</strong> {formatRupiah(foundOrder.totalPrice)}</p>
                <p><strong>Metode:</strong> {foundOrder.deliveryMethod === 'pickup' ? 'Ambil di Koperasi' : 'Diantar ke Kelas'}</p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/nota/${foundOrder.orderCode}`}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>Lihat Nota Lengkap & QR Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <strong className="text-rose-800 block text-sm">Pesanan Tidak Ditemukan</strong>
              <p className="text-rose-600">
                Kode pesanan <strong>{searchCode}</strong> tidak ada di riwayat. Periksa kembali penulisan kodenya.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders in Device */}
      {isHydrated && orders.length > 0 && !searched && (
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pesanan Terbaru di Perangkat Ini:
          </h3>
          <div className="space-y-2">
            {orders.slice(0, 3).map((ord) => (
              <Link
                key={ord.id}
                href={`/nota/${ord.orderCode}`}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 shadow-xs hover:shadow-md transition flex items-center justify-between gap-4 block"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-blue-600">{ord.orderCode}</span>
                  <p className="font-bold text-xs text-slate-800">{ord.studentName} ({ord.studentClass})</p>
                  <span className="text-[11px] text-slate-400">{formatRupiah(ord.totalPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {ord.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
