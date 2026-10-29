import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, ArrowLeft, Download, Calendar, ChevronRight, Image as ImageIcon, Archive, Edit2, Trash2, Check, X, FolderSync } from 'lucide-react';
import { ref, update, remove } from 'firebase/database';
import { db } from '../config/firebase';

export default function DatabaseKegiatan({ photos, kegiatans, isAdmin }) {
  const [selectedKegiatanId, setSelectedKegiatanId] = useState(null);
  const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);

  // State Edit Kegiatan
  const [editingKegiatanId, setEditingKegiatanId] = useState(null);
  const [editNamaKegiatan, setEditNamaKegiatan] = useState('');
  const [editTanggalKegiatan, setEditTanggalKegiatan] = useState('');

  // State Edit Foto (Keterangan, Tanggal, dan Pindah Kegiatan)
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoDate, setEditPhotoDate] = useState('');
  const [editPhotoKegiatan, setEditPhotoKegiatan] = useState('');

  // ================= HANDLER KEGIATAN =================
  const handleStartEditKegiatan = (kegiatan) => {
    setEditingKegiatanId(kegiatan.id);
    setEditNamaKegiatan(kegiatan.nama || '');
    setEditTanggalKegiatan(kegiatan.tanggal || new Date(kegiatan.timestamp || Date.now()).toISOString().split('T')[0]);
  };

  const handleSaveKegiatan = async (id) => {
    if (!editNamaKegiatan.trim()) return alert("Nama kegiatan tidak boleh kosong!");
    try {
      await update(ref(db, `kegiatans/${id}`), { 
        nama: editNamaKegiatan, 
        tanggal: editTanggalKegiatan 
      });
      setEditingKegiatanId(null);
      alert("✅ Kegiatan berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update kegiatan:", err);
      alert("Gagal memperbarui kegiatan.");
    }
  };

  const handleDeleteKegiatan = async (id, nama) => {
    if (window.confirm(`⚠️ PERHATIAN: Hapus kegiatan "${nama}"?\n\nMenghapus kegiatan tidak akan menghapus foto dari Google Drive secara fisik, tetapi data galeri di aplikasi ini akan hilang.`)) {
      try {
        await remove(ref(db, `kegiatans/${id}`));
        alert("🗑️ Kegiatan berhasil dihapus.");
      } catch (err) {
        console.error("Gagal hapus kegiatan:", err);
      }
    }
  };

  // ================= HANDLER FOTO =================
  const handleStartEditPhoto = (photo) => {
    setEditingPhotoId(photo.id);
    setEditPhotoTitle(photo.title || '');
    setEditPhotoKegiatan(photo.kegiatanId);
    
    // Konversi timestamp ke format yang bisa dibaca input datetime-local (YYYY-MM-DDTHH:mm)
    const dateObj = new Date(photo.timestamp || Date.now());
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);
    setEditPhotoDate(localISOTime);
  };

  const handleSavePhoto = async (id) => {
    if (!editPhotoTitle.trim()) return alert("Keterangan foto tidak boleh kosong!");
    try {
      const newTimestamp = new Date(editPhotoDate).getTime();
      await update(ref(db, `photos/${id}`), { 
        title: editPhotoTitle,
        kegiatanId: editPhotoKegiatan, // Memungkinkan pindah album
        timestamp: newTimestamp
      });
      setEditingPhotoId(null);
      alert("✅ Data foto berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update foto:", err);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm("Yakin ingin menghapus foto ini dari database aplikasi? (File asli di Drive tetap aman)")) {
      try {
        await remove(ref(db, `photos/${id}`));
        alert("🗑️ Foto berhasil dihapus.");
      } catch (err) {
        console.error("Gagal hapus foto:", err);
      }
    }
  };

  // ================= BATCH DOWNLOAD =================
  const handleBatchDownload = (fotosKegiatan, namaKegiatan) => {
    if (fotosKegiatan.length === 0) return alert("Tidak ada foto untuk diunduh.");
    if (!window.confirm(`Unduh ${fotosKegiatan.length} foto dari kegiatan "${namaKegiatan}"?`)) return;

    setIsDownloadingBatch(true);
    fotosKegiatan.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = `https://drive.google.com/uc?export=download&id=${photo.fileId}`;
        link.download = `${photo.title || 'dokumentasi'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (index === fotosKegiatan.length - 1) {
          setIsDownloadingBatch(false);
        }
      }, index * 400); 
    });
  };

  // ================= RENDER GALERI FOTO =================
  if (selectedKegiatanId) {
    const fotosKegiatan = photos.filter(p => p.kegiatanId === selectedKegiatanId);
    const kegiatan = kegiatans.find(k => k.id === selectedKegiatanId);
    
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button 
            onClick={() => setSelectedKegiatanId(null)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white backdrop-blur-md rounded-2xl shadow-sm text-slate-700 font-bold hover:bg-blue-600 hover:text-white transition-all border border-slate-200"
          >
            <ArrowLeft size={18} /> Kembali ke Daftar Kegiatan
          </button>

          {fotosKegiatan.length > 0 && (
            <button
              onClick={() => handleBatchDownload(fotosKegiatan, kegiatan?.nama)}
              disabled={isDownloadingBatch}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Archive size={18} />
              {isDownloadingBatch ? "Memproses Unduhan..." : `Unduh Semua Foto (${fotosKegiatan.length})`}
            </button>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-white/10 pointer-events-none">
            <Folder size={220} />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-3">
              <Folder size={12} /> Galeri Foto
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{kegiatan?.nama}</h2>
            <p className="text-blue-100 font-medium mt-2">Menampilkan total {fotosKegiatan.length} foto dokumentasi tersimpan.</p>
          </div>
        </div>

        {/* Grid Foto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fotosKegiatan.map((photo, i) => (
            <motion.div 
              key={photo.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 * i }} 
              className="bg-white rounded-[2rem] p-3 shadow-md border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="overflow-hidden rounded-[1.5rem] h-48 bg-slate-100 relative group">
                  <img 
                    src={`https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w800`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy" 
                    alt={photo.title} 
                  />
                  {/* Tombol Aksi Admin */}
                  {isAdmin && editingPhotoId !== photo.id && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEditPhoto(photo)} title="Edit Data Foto" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeletePhoto(photo.id)} title="Hapus Foto" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  {/* Form Edit Foto */}
                  {editingPhotoId === photo.id ? (
                    <div className="space-y-2 mb-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Keterangan</label>
                        <input type="text" value={editPhotoTitle} onChange={(e) => setEditPhotoTitle(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal & Jam</label>
                        <input type="datetime-local" value={editPhotoDate} onChange={(e) => setEditPhotoDate(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><FolderSync size={10}/> Pindah Kegiatan</label>
                        <select value={editPhotoKegiatan} onChange={(e) => setEditPhotoKegiatan(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-400">
                          {kegiatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => handleSavePhoto(photo.id)} className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1"><Check size={14}/> Simpan</button>
                        <button onClick={() => setEditingPhotoId(null)} className="flex-1 bg-slate-300 text-slate-700 py-1.5 rounded-lg text-xs font-bold flex justify-center items-center gap-1"><X size={14}/> Batal</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-slate-800 line-clamp-2 mb-1" title={photo.title}>{photo.title}</p>
                      <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(photo.timestamp).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WITA
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 pt-0 mt-auto">
                <a 
                  href={`https://drive.google.com/uc?export=download&id=${photo.fileId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all"
                >
                  <Download size={16} /> Unduh File
                </a>
              </div>
            </motion.div>
          ))}

          {fotosKegiatan.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-[2rem] text-center border border-dashed border-slate-200">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold">Belum ada foto yang diunggah untuk kegiatan ini.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  
  // ================= RENDER FOLDER KEGIATAN UTAMA =================
  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Database Kegiatan</h2>
        <p className="text-slate-500 mt-1 font-medium">Pilih kartu kegiatan di bawah ini untuk melihat album foto lengkap atau mengelola data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {kegiatans.map((kegiatan, i) => {
          const fotosKegiatan = photos.filter(p => p.kegiatanId === kegiatan.id);
          const jmlFoto = fotosKegiatan.length;
          const latestPhoto = fotosKegiatan[0];

          return (
            <motion.div 
              key={kegiatan.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 * i }} 
              className="bg-white rounded-[2.2rem] overflow-hidden shadow-md border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div 
                  onClick={() => setSelectedKegiatanId(kegiatan.id)}
                  className="relative h-52 w-full overflow-hidden bg-slate-100 cursor-pointer group"
                >
                  {latestPhoto ? (
                    <img 
                      src={`https://drive.google.com/thumbnail?id=${latestPhoto.fileId}&sz=w800`} 
                      alt={kegiatan.nama} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Folder size={40} className="text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Belum Ada Foto</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      📁 Kegiatan
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
                      {jmlFoto} Foto
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  {editingKegiatanId === kegiatan.id ? (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={editNamaKegiatan}
                        onChange={(e) => setEditNamaKegiatan(e.target.value)}
                        className="w-full bg-slate-50 border border-blue-300 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none"
                      />
                      <input 
                        type="date" 
                        value={editTanggalKegiatan}
                        onChange={(e) => setEditTanggalKegiatan(e.target.value)}
                        className="w-full bg-slate-50 border border-blue-300 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <button onClick={() => handleSaveKegiatan(kegiatan.id)} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Check size={14} /> Simpan</button>
                        <button onClick={() => setEditingKegiatanId(null)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><X size={14} /> Batal</button>
                      </div>
                    </div>
                  ) : (
                    <h3 
                      onClick={() => setSelectedKegiatanId(kegiatan.id)}
                      className="text-lg font-black text-slate-800 hover:text-blue-600 transition-colors cursor-pointer leading-snug min-h-[3.2rem]"
                      title={kegiatan.nama}
                    >
                      {kegiatan.nama}
                    </h3>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 pt-3">
                  <Calendar size={14} className="text-blue-500" />
                  <span>{kegiatan.tanggal || new Date(kegiatan.timestamp || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  {isAdmin && editingKegiatanId !== kegiatan.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStartEditKegiatan(kegiatan)} title="Edit Nama & Tanggal Kegiatan" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                      <button onClick={() => handleDeleteKegiatan(kegiatan.id, kegiatan.nama)} title="Hapus Kegiatan" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  )}
                  <div 
                    onClick={() => setSelectedKegiatanId(kegiatan.id)}
                    className="flex items-center gap-1 text-xs font-black text-blue-600 hover:translate-x-1 transition-transform uppercase tracking-wider cursor-pointer"
                  >
                    <span>Buka Album</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {kegiatans.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-[2rem] text-center border border-dashed border-slate-200">
            <Folder size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">Belum ada daftar kegiatan yang tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}