import { useState, useRef } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../config/firebase';
import { uploadToDrive } from '../services/driveApi';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Folder as FolderIcon, X, CheckCircle, AlertCircle, FileImage, Loader2, Plus } from 'lucide-react';

export default function UploadFoto({ kegiatans }) {
  const [selectedKegiatan, setSelectedKegiatan] = useState('');
  const [baseTitle, setBaseTitle] = useState('');
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      status: 'idle', // idle, uploading, success, error
    }));

    setQueuedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idToRemove) => {
    if (isUploading) return;
    setQueuedFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  // Eksekusi upload berurutan (aman untuk 50+ foto sekaligus)
  const executeUpload = async () => {
    if (queuedFiles.length === 0) return alert("Pilih minimal 1 foto untuk diunggah!");
    if (!selectedKegiatan) return alert("Pilih folder kegiatan terlebih dahulu!");

    setIsUploading(true);
    const selectedObj = kegiatans.find(k => k.id === selectedKegiatan);
    if (!selectedObj || !selectedObj.folderId) {
      setIsUploading(false);
      return alert("Folder Google Drive untuk kegiatan ini tidak ditemukan!");
    }
    const folderId = selectedObj.folderId;
    let successCount = 0;

    for (let i = 0; i < queuedFiles.length; i++) {
      const currentItem = queuedFiles[i];
      if (currentItem.status === 'success') continue;

      // Update status ke uploading
      setQueuedFiles(prev => prev.map(f => f.id === currentItem.id ? { ...f, status: 'uploading' } : f));

      const finalTitle = baseTitle 
        ? (queuedFiles.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle) 
        : currentItem.file.name.replace(/\.[^/.]+$/, "");

      try {
        // Upload satu per satu ke Google Drive via GAS
        const fileId = await uploadToDrive(currentItem.file, folderId);

        // Simpan ke Firebase Realtime Database
        await push(ref(db, 'photos'), { 
          title: finalTitle, 
          fileId, 
          kegiatanId: selectedKegiatan, 
          timestamp: Date.now() 
        });

        setQueuedFiles(prev => prev.map(f => f.id === currentItem.id ? { ...f, status: 'success' } : f));
        successCount++;
      } catch (err) {
        console.error(`Gagal upload file ${currentItem.file.name}:`, err);
        setQueuedFiles(prev => prev.map(f => f.id === currentItem.id ? { ...f, status: 'error' } : f));
      }
    }

    setIsUploading(false);

    if (successCount === queuedFiles.length) {
      setTimeout(() => {
        setQueuedFiles([]);
        setBaseTitle('');
        alert(`✅ Berhasil! Semua ${successCount} foto telah diunggah.`);
      }, 1000);
    } else {
      alert(`⚠️ Selesai: ${successCount} berhasil, ${queuedFiles.length - successCount} gagal.`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Unggah Dokumentasi Sekaligus</h2>
        <p className="text-slate-500 mt-1 font-medium">Pilih hingga 50+ foto sekaligus. Sistem akan mengunggahnya secara berurutan dengan aman.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
              <FolderIcon size={16} className="text-blue-500"/> Metadata Foto
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">FOLDER KEGIATAN <span className="text-red-500">*</span></label>
                <select 
                  value={selectedKegiatan}
                  onChange={(e) => setSelectedKegiatan(e.target.value)}
                  disabled={isUploading}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- Pilih Kegiatan --</option>
                  {kegiatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>DESKRIPSI / KPM</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">OPSIONAL</span>
                </label>
                <input 
                  type="text" 
                  value={baseTitle}
                  onChange={(e) => setBaseTitle(e.target.value)}
                  disabled={isUploading}
                  placeholder="Nama dokumen..." 
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100">
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[1.5rem] p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isUploading ? 'bg-slate-50 border-slate-200 opacity-50' : 'bg-blue-50/50 border-blue-300 hover:bg-blue-50 hover:border-blue-500'
              }`}
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-2">
                <ImageIcon size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-700">Klik untuk Pilih Banyak Foto (Bisa 50+ Foto)</h4>
              <p className="text-sm font-medium text-slate-400">Tahan tombol <kbd className="bg-white border px-1.5 py-0.5 rounded text-xs">Ctrl</kbd> atau pilih semua foto sekaligus.</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*" 
                multiple 
                className="hidden" 
              />
            </div>

            {queuedFiles.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <FileImage size={16} className="text-emerald-500"/> Antrean Foto ({queuedFiles.length})
                  </h3>
                  {!isUploading && (
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <Plus size={14} /> Tambah Foto Lagi
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {queuedFiles.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          item.status === 'success' ? 'bg-emerald-50 border-emerald-200' :
                          item.status === 'error' ? 'bg-red-50 border-red-200' :
                          item.status === 'uploading' ? 'bg-blue-50 border-blue-200' :
                          'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`p-2 rounded-lg ${
                            item.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            item.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-white text-slate-400 shadow-sm'
                          }`}>
                            <FileImage size={18} />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-700 truncate">{item.file.name}</p>
                            <p className="text-xs font-medium text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-3">
                          {item.status === 'uploading' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
                          {item.status === 'success' && <CheckCircle size={18} className="text-emerald-500" />}
                          {item.status === 'error' && <AlertCircle size={18} className="text-red-500" />}
                          
                          {item.status === 'idle' && (
                            <button onClick={() => removeFile(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {queuedFiles.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={executeUpload}
                disabled={isUploading}
                className={`w-full mt-6 text-white p-4 rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-3 ${
                  isUploading ? 'bg-blue-400 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1'
                }`}
              >
                {isUploading ? (
                  <><Loader2 size={24} className="animate-spin" /> Mengunggah Antrean Berurutan...</>
                ) : (
                  <><UploadCloud size={24} /> Mulai Unggah {queuedFiles.length} Foto Sekarang</>
                )}
              </motion.button>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
}