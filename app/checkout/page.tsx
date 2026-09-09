'use client';

import React, { useState, useEffect } from 'react';
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
  Upload,
  UserCheck,
  LogIn,
  GraduationCap
} from 'lucide-react';
import { useStore, formatRupiah } from '@/lib/store';
import { DeliveryMethod, PaymentMethod } from '@/lib/types';
import { SMKN11_CLASSES } from '@/lib/constants';
import { AuthUser } from '@/lib/auth';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, createOrder, isHydrated } = useStore();

  const [studentUser, setStudentUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState<string>(SMKN11_CLASSES[0]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch logged-in user profile with localStorage fallback
  useEffect(() => {
    // 1. Instant check from localStorage
    if (typeof window !== 'undefined') {
      try {
        const localUserStr = localStorage.getItem('market_biru_user');
        if (localUserStr) {
          const localUser: AuthUser = JSON.parse(localUserStr);
          setStudentUser(localUser);
          if (localUser.name) setStudentName(localUser.name);
          if (localUser.student_class) setStudentClass(localUser.student_class);
          if (localUser.whatsapp) setWhatsappNumber(localUser.whatsapp);
        }
      } catch (e) {}
    }

    // 2. Verified check from server
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          const u: AuthUser = data.user;
          setStudentUser(u);
          if (u.name) setStudentName(u.name);
          if (u.student_class) setStudentClass(u.student_class);
          if (u.whatsapp) setWhatsappNumber(u.whatsapp);
          try {
            localStorage.setItem('market_biru_user', JSON.stringify(u));
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentUser && !studentName.trim()) {
      setErrorMsg('Anda harus masuk dengan akun Siswa SMKN 11 atau lengkapi identitas siswa terlebih dahulu.');
      return;
    }

    if (!studentName.trim()) {
      setErrorMsg('Mohon lengkapi nama lengkap siswa.');
      return;
    }
    if (!studentClass) {
      setErrorMsg('Mohon pilih kelas siswa dari daftar.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setErrorMsg('Mohon isi nomor WhatsApp aktif untuk verifikasi nota.');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Mohon sebutkan lokasi ruang kelas / nomor meja pengantaran.');
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

      // 1. Simpan ke localStorage (store) agar nota bisa dibuka offline
      const newOrder = createOrder({
        studentName: studentName.trim(),
        studentClass: studentClass,
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

      // 2. Sinkronisasi ke database MySQL agar kasir/admin bisa melihat pesanan ini
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newOrder,
            userId: studentUser?.id || null,
          }),
        });
      } catch (dbErr) {
        // DB sync gagal tidak membatalkan pesanan siswa, hanya log
        console.warn('Gagal sync pesanan ke database:', dbErr);
      }

      router.push(`/nota/${newOrder.orderCode}`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat memproses pesanan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
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
          Formulir Pemesanan Koperasi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi identitas siswa terverifikasi dan pilih opsi serah terima pesanan
        </p>
      </div>

      {/* Auth Notice Banner */}
      {!checkingAuth && !studentUser && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">
              Wajib masuk dengan akun Siswa SMKN 11 untuk menyelesaikan pesanan.
            </span>
          </div>
          <Link
            href="/masuk?redirect=/checkout"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shrink-0 transition"
          >
            Masuk Siswa
          </Link>
        </div>
      )}

      {/* Logged-in Banner */}
      {!checkingAuth && studentUser && (
        studentUser.role === 'admin' || studentUser.role === 'kasir' || studentUser.role === 'petugas' ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Akun Terdeteksi: <strong>{studentUser.name}</strong> ({studentUser.role === 'admin' ? '👑 Admin Utama' : studentUser.role === 'kasir' ? '🏷️ Kasir' : '🛡️ Petugas'}) — Mode Uji Coba Pesanan
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/dashboard"
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold transition shadow-xs"
              >
                Ke Dashboard Admin &rarr;
              </Link>
              <Link
                href="/masuk?redirect=/checkout"
                className="text-amber-800 font-bold hover:underline"
              >
                Ganti Akun Siswa
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 font-medium">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Akun Siswa Terverifikasi: <strong>{studentUser.name}</strong> ({studentUser.student_class || studentClass})
              </span>
            </div>
            <Link
              href="/masuk?redirect=/checkout"
              className="text-emerald-700 font-bold hover:underline shrink-0"
            >
              Ganti Akun
            </Link>
          </div>
        )
      )}

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
              Identitas Siswa Pemesan
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
                  placeholder="Contoh: Nayra Aulia Khoirunnisa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pilihan Kelas Dropdown */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Pilih Kelas <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-blue-600 font-semibold lowercase">pilih dari list</span>
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                    required
                  >
                    <optgroup label="=== KELAS X ===">
                      {SMKN11_CLASSES.filter((c) => c.startsWith('X ')).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="=== KELAS XI ===">
                      {SMKN11_CLASSES.filter((c) => c.startsWith('XI ')).map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </optgroup>
                  </select>
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
                <p className="text-[11px] text-slate-500">
                  Tunjukkan nota barcode di kasir koperasi sekolah saat istirahat/pulang.
                </p>
                <span className="text-[11px] font-black text-emerald-600 uppercase">Gratis (Rp 0)</span>
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
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800">Antar ke Kelas</span>
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
                <p className="text-[11px] text-slate-500">
                  Diantar langsung oleh petugas koperasi ke ruang kelas kamu.
                </p>
                <span className="text-[11px] font-black text-blue-600">+ Rp 2.000 Ongkir</span>
              </label>
            </div>

            {deliveryMethod === 'delivery' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detail Lokasi Pengantaran di Kelas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Contoh: Gedung B Lt. 2, Ruang X PPLG 1 (Meja Baris 3)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span className="font-bold text-xs text-slate-800">Bayar Tunai di Kasir</span>
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
                <p className="text-[11px] text-slate-500">
                  Bayar dengan uang pas di loket koperasi saat serah terima barang.
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
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-800">QRIS / Transfer Bank</span>
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
                <p className="text-[11px] text-slate-500">
                  Scan QRIS resmi Koperasi SMKN 11 via Gopay, OVO, Dana, ShopeePay, BCA.
                </p>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Khusus untuk Petugas Koperasi (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tolong titipkan ke KM kelas jika sedang upacara"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-lg shadow-slate-900/5 space-y-4">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Ringkasan Belanja</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {cart.length} Jenis Barang
              </span>
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.product.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} × {formatRupiah(item.product.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Barang</span>
                <span className="font-semibold text-slate-800">{formatRupiah(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Layanan Antar</span>
                <span className="font-semibold text-slate-800">
                  {deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Bayar</span>
                <span className="text-blue-600 text-base">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Action */}
            {studentUser ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl transition duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan & Dapatkan Nota QR'}</span>
              </button>
            ) : (
              <Link
                href="/masuk?redirect=/checkout"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition duration-200 flex items-center justify-center gap-2 active:scale-98 text-center"
              >
                <LogIn className="w-5 h-5" />
                <span>Masuk Akun Siswa untuk Pesan</span>
              </Link>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verifikasi Resmi Koperasi SMKN 11 Bandung</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
