import { useState } from 'react';
import { ref, push, update, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { buatFolderDrive } from '../services/driveApi';
import { motion } from 'framer-motion';
import { Settings, FolderPlus, Trash2, Edit2, Check, X, Calendar, Folder } from 'lucide-react';

export default function Pengaturan({ kegiatans = [] }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNama, setEditNama] = useState('');

  const handleTambah = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const namaKegiatan = e.target.nama.value;
      const folderId = await buatFolderDrive(namaKegiatan);
      await push(ref(db, 'kegiatans'), { 
        nama: namaKegiatan, 
        folderId, 
        timestamp: Date.now(),
        tanggal: new Date().toISOString().split('T')[0]
      });
      e.target.reset();
      alert("✅ Folder kegiatan berhasil dibuat di Google Drive!");
    } catch (error) { 
      alert("❌ Gagal membuat kegiatan: " + error.message); 
    }
    setIsProcessing(false);
  };

  const handleStartEdit = (k) => {
    setEditingId(k.id);
    setEditNama(k.nama);
  };

  const handleSaveEdit = async (id) => {
    if (!editNama.trim()) return alert("Nama tidak boleh kosong!");
    try {
      await update(ref(db, `kegiatans/${id}`), { nama: editNama });
      setEditingId(null);
      alert("✅ Kegiatan berhasil diperbarui!");
    } catch (err) {
      alert("Gagal memperbarui kegiatan.");
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`⚠️ Hapus kegiatan "${nama}" dari sistem?`)) {
      try {
        await remove(ref(db, `kegiatans/${id}`));
        alert("🗑️ Kegiatan berhasil dihapus.");
      } catch (err) {
        alert("Gagal menghapus kegiatan.");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-10 pb-10">
      <header className="text-center mb-6">
        <div className="w-20 h-20 bg-slate-800 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl -rotate-3">
          <Settings size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">Sistem Pengaturan</h2>
        <p className="text-slate-500 mt-1 font-medium">Kelola pembuatan folder Google Drive dan daftar kegiatan.</p>
      </header>

      {/* Form Buat Kegiatan */}
      <form onSubmit={handleTambah} className="bg-white p-8 rounded-[2rem] shadow-md border border-slate-100">
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-6 text-sm font-semibold flex items-start gap-3">
          <FolderPlus className="shrink-0 mt-0.5" />
          <p>Membuat kegiatan di sini akan secara otomatis mengeksekusi pembuatan folder baru di Google Drive.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nama Program / Kegiatan Baru</label>
          <input type="text" name="nama" required placeholder="Contoh: Penyaluran Bantuan Sosial 2026..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"/>
        </div>

        <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-2xl font-bold text-lg shadow-lg transition-all disabled:opacity-50">
          {isProcessing ? 'Sinkronisasi dengan Drive...' : 'Buat Folder & Kegiatan'}
        </button>
      </form>

      {/* Daftar Manajemen Kegiatan */}
      <div className="bg-white p-8 rounded-[2rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Folder size={20} className="text-blue-500" /> Manajemen Database Kegiatan ({kegiatans.length})
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {kegiatans.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60 gap-4">
              <div className="flex-1">
                {editingId === k.id ? (
                  <input 
                    type="text" 
                    value={editNama} 
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full bg-white border border-blue-400 p-2 rounded-xl text-sm font-bold outline-none"
                    autoFocus
                  />
                ) : (
                  <div>
                    <h4 className="font-bold text-slate-800">{k.nama}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> {k.tanggal || new Date(k.timestamp || Date.now()).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {editingId === k.id ? (
                  <>
                    <button onClick={() => handleSaveEdit(k.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleStartEdit(k)} title="Edit Nama" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(k.id, k.nama)} title="Hapus Kegiatan" className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            </div>
          ))}

          {kegiatans.length === 0 && (
            <p className="text-center text-slate-400 py-6 font-medium">Belum ada kegiatan terdaftar.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}