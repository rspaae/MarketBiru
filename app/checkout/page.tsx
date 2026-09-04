'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Store, 
  Truck, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Upload 
} from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';
import { DeliveryMethod, PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, createOrder, isHydrated } = useStore();

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isHydrated) return null;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Tidak Ada Item untuk di-Checkout</h1>
        <p className="text-xs text-slate-500">Keranjang kamu kosong.</p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const deliveryFee = deliveryMethod === 'delivery' ? 2000 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Mohon isi nama lengkap siswa.');
      return;
    }
    if (!studentClass.trim()) {
      setErrorMsg('Mohon isi kelas / jurusan siswa.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setErrorMsg('Mohon isi nomor WhatsApp aktif.');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Mohon sebutkan lokasi kelas / nomor meja pengantaran.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const newOrder = createOrder({
        studentName: studentName.trim(),
        studentClass: studentClass.trim(),
        whatsappNumber: whatsappNumber.trim(),
        deliveryMethod,
        deliveryFee,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
        paymentMethod,
        paymentStatus: paymentMethod === 'transfer' ? 'paid' : 'unpaid',
        paymentProofUrl: paymentProofUrl || undefined,
        notes: notes.trim() || undefined,
        totalPrice: grandTotal,
        status: 'pending',
        items: orderItems,
      });

      router.push(`/nota/${newOrder.orderCode}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat memproses pesanan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/keranjang"
          className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1.5 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Keranjang</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Formulir Pemesanan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi identitas siswa dan pilih opsi pengambilan pesanan
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Student Identity */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              Identitas Pemesan (Siswa / Guru)
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan Pratama"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kelas & Jurusan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="Contoh: XII RPL 2 / X TKJ 1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Option */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                2
              </span>
              Metode Pengambilan Barang
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  deliveryMethod === 'pickup'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800">Ambil di Koperasi</span>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tunjukkan barcode / QR nota di kasir koperasi pada jam istirahat.
                </p>
                <span className="text-xs font-extrabold text-emerald-600">Gratis (Rp 0)</span>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  deliveryMethod === 'delivery'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-800">Diantar ke Kelas</span>
                  </div>
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Petugas koperasi akan mengantar langsung ke ruang kelas kamu.
                </p>
                <span className="text-xs font-extrabold text-blue-600">+Rp 2.000</span>
              </label>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="pt-2 text-xs">
                <label className="block font-bold text-slate-700 mb-1.5">
                  Detail Lokasi Pengantaran (Gedung/Ruangan/Nomor Meja) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Contoh: Gedung B Lantai 2, Ruang XII RPL 2, Meja Baris ke-3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                3
              </span>
              Metode Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800">Bayar Tunai</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bayar langsung uang pas saat mengambil pesanan di kasir koperasi.
                </p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'transfer'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800">Transfer / QRIS</span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Transfer Bank BJB / QRIS Koperasi SMKN 11 Bandung.
                </p>
              </label>
            </div>

            {paymentMethod === 'transfer' && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-3 text-xs">
                <div className="font-bold text-blue-900">Rekening Resmi Koperasi SMKN 11:</div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 font-mono text-xs text-slate-700 space-y-1">
                  <div><strong>Bank:</strong> Bank BJB</div>
                  <div><strong>No. Rekening:</strong> 0110293847561</div>
                  <div><strong>Atas Nama:</strong> Koperasi Siswa SMKN 11 Bandung</div>
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1">
                    Upload / Link Bukti Transfer (Opsional):
                  </label>
                  <input
                    type="text"
                    value={paymentProofUrl}
                    onChange={(e) => setPaymentProofUrl(e.target.value)}
                    placeholder="Bisa sertakan link foto bukti atau konfirmasi langsung ke kasir"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-blue-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Notes */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3 text-xs">
            <label className="block font-bold text-slate-800">
              Catatan Khusus Pesanan (Opsional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tolong titipkan di meja piket, atau ukuran dasi jangan yang pendek."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
            />
          </div>

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
          <h3 className="font-extrabold text-slate-900 text-sm pb-3 border-b border-slate-100 uppercase tracking-wider">
            Rincian Pesanan
          </h3>

          {/* Items small list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 text-xs">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{product.name}</p>
                  <span className="text-[11px] text-slate-400">
                    {quantity} × {formatRupiah(product.price)}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900 shrink-0">
                  {formatRupiah(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Calculations */}
          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <strong className="text-slate-900">{formatRupiah(cartTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pengantaran:</span>
              <strong className={deliveryFee > 0 ? 'text-blue-600' : 'text-emerald-600'}>
                {deliveryFee > 0 ? formatRupiah(deliveryFee) : 'Gratis'}
              </strong>
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs font-bold text-slate-700">Total Tagihan</span>
              <span className="text-2xl font-black text-blue-600 tracking-tight">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Konfirmasi & Buat Pesanan</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              QR Code nota pesanan akan langsung muncul setelah kamu klik konfirmasi.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
