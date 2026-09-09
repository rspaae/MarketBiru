'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  KeyRound, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { SMKN11_CLASSES } from '@/lib/constants';
import ConfirmModal from '@/components/ConfirmModal';

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'petugas' | 'kasir' | 'siswa';
  nisn: string | null;
  student_class: string | null;
  whatsapp: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'siswa' | 'admin' | 'kasir'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding user
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('admin123');
  const [newRole, setNewRole] = useState<'siswa' | 'admin' | 'kasir' | 'petugas'>('siswa');
  const [newClass, setNewClass] = useState<string>(SMKN11_CLASSES[0]);
  const [newNisn, setNewNisn] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
          student_class: newRole === 'siswa' ? newClass : null,
          nisn: newNisn || null,
          whatsapp: newWhatsapp || null,
          autoLogin: false, // Don't replace current admin session
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.message || 'Gagal mendaftarkan akun.' });
        setSaving(false);
        return;
      }

      setFeedback({ type: 'success', text: `Akun ${newName} berhasil didaftarkan!` });
      setShowAddModal(false);
      // Reset form
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewNisn('');
      setNewWhatsapp('');
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setSaving(false);
    }
  };

  const [deletingUser, setDeletingUser] = useState<{ id: number; name: string } | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deletingUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setFeedback({ type: 'success', text: `Akun ${deletingUser.name} telah berhasil dihapus.` });
      } else {
        setFeedback({ type: 'error', text: data.message || 'Gagal menghapus akun.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setIsDeletingLoading(false);
      setDeletingUser(null);
    }
  };

  const handleDeleteUser = (id: number, name: string) => {
    setDeletingUser({ id, name });
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.student_class && u.student_class.toLowerCase().includes(q)) ||
      (u.nisn && u.nisn.includes(q));
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Manajemen Akun & Siswa</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {users.length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola pendaftaran siswa, petugas kasir, dan hak akses Koperasi SMKN 11 Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setFeedback(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrasi Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700 font-bold">×</button>
        </div>
      )}

      {/* Controls: Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Role */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl w-full sm:w-auto overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterRole === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('siswa')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterRole === 'siswa' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🎓 Siswa ({users.filter((u) => u.role === 'siswa').length})
          </button>
          <button
            onClick={() => setFilterRole('kasir')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterRole === 'kasir' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏷️ Kasir ({users.filter((u) => u.role === 'kasir').length})
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterRole === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👑 Admin ({users.filter((u) => u.role === 'admin').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kelas, NISN..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-medium">Memuat data pengguna dari database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data pengguna yang cocok.</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter role.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Role / Hak Akses</th>
                  <th className="py-3 px-4">Kelas & NISN</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          u.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : u.role === 'kasir' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase font-mono ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : u.role === 'kasir'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {u.role === 'admin' && '👑 Admin'}
                        {u.role === 'kasir' && '🏷️ Kasir'}
                        {u.role === 'siswa' && '🎓 Siswa'}
                        {u.role === 'petugas' && '🛡️ Petugas'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.role === 'siswa' ? (
                        <div>
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {u.student_class || 'Belum Diatur'}
                          </span>
                          {u.nisn && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              NISN: {u.nisn}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Petugas Koperasi</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.whatsapp ? (
                        <a
                          href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-mono"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{u.whatsapp}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrasi Pengguna Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Registrasi Akun Baru</h3>
                  <p className="text-[11px] text-slate-500">Tambahkan akun siswa atau petugas koperasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Salma Supri Salsabila"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Role / Akses <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="siswa">🎓 Siswa</option>
                    <option value="kasir">🏷️ Petugas Kasir</option>
                    <option value="admin">👑 Administrator</option>
                  </select>
                </div>

                {newRole === 'siswa' && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Pilih Kelas <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <optgroup label="Kelas X">
                        {SMKN11_CLASSES.filter((c) => c.startsWith('X ')).map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Kelas XI">
                        {SMKN11_CLASSES.filter((c) => c.startsWith('XI ')).map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: salma11"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 huruf"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    NISN (Siswa)
                  </label>
                  <input
                    type="text"
                    value={newNisn}
                    onChange={(e) => setNewNisn(e.target.value)}
                    placeholder="006xxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Daftarkan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete User Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDeleteUser}
        title="Hapus Akun Pengguna"
        description={`Apakah Anda yakin ingin menghapus akun ${deletingUser?.name}? Pengguna ini tidak akan dapat login kembali ke sistem.`}
        confirmText="Hapus Akun"
        cancelText="Batal"
        variant="danger"
        icon="trash"
        isLoading={isDeletingLoading}
      />
    </div>
  );
}
