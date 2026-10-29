import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, Image as ImageIcon, Folder, Calendar, ChevronRight } from 'lucide-react';

export default function Dashboard({ photos, kegiatans, setActiveMenu }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKegiatans = kegiatans.filter(k => 
    k.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CardStat = ({ title, count, icon: Icon, color, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-white/60 flex items-center gap-6"
    >
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={30} />
      </div>
      <div>
        <h3 className="text-slate-500 font-semibold text-sm">{title}</h3>
        <p className="text-4xl font-black text-slate-800 tracking-tight">{count}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-800">Dashboard Utama</h2>
        <p className="text-slate-500 mt-1">Ringkasan aktivitas dan daftar album kegiatan.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardStat title="Total Kegiatan" count={kegiatans.length} icon={Activity} color="bg-gradient-to-br from-blue-400 to-blue-600" delay={0.1} />
        <CardStat title="Total Foto Tersimpan" count={photos.length} icon={ImageIcon} color="bg-gradient-to-br from-emerald-400 to-emerald-600" delay={0.2} />
      </div>
      
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-4 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama kegiatan..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl outline-none shadow-sm border border-slate-100 font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKegiatans.map((kegiatan, i) => {
          const fotosKegiatan = photos.filter(p => p.kegiatanId === kegiatan.id);
          const jmlFoto = fotosKegiatan.length;
          const latestPhoto = fotosKegiatan[0];

          return (
            <motion.div 
              key={kegiatan.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 * i }} 
              onClick={() => { if (setActiveMenu) setActiveMenu('database'); }}
              className="bg-white rounded-[2.2rem] overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {latestPhoto ? (
                    <img 
                      src={`https://drive.google.com/thumbnail?id=${latestPhoto.fileId}&sz=w800`} 
                      alt={kegiatan.nama} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Folder size={40} className="text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Belum ada foto</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                      📁 Kegiatan
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
                      {jmlFoto} Foto
                    </div>
                  </div>
                </div>

                {/* Nama Kegiatan Multi-line (Tidak terpotong) */}
                <div className="p-5">
                  <h3 className="text-lg font-black text-slate-800 leading-snug min-h-[3.2rem]" title={kegiatan.nama}>
                    {kegiatan.nama}
                  </h3>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 pt-3">
                  <Calendar size={14} className="text-blue-500" />
                  <span>{kegiatan.tanggal || new Date(kegiatan.timestamp || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-blue-600 uppercase tracking-wider pt-3">
                  <span>Lihat Detail</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredKegiatans.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-[2rem] text-center border border-dashed border-slate-200">
            <Folder size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">Tidak ada kegiatan yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}