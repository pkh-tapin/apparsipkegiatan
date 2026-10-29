import { useState } from 'react';
import { FileText, Printer, Building2 } from 'lucide-react';

export default function ReportGenerator({ kegiatans = [], photos = [] }) {
  const [selectedKegiatanId, setSelectedKegiatanId] = useState('');

  // Filter foto berdasarkan kegiatan yang dipilih
  const filteredPhotos = photos.filter(photo => photo.kegiatanId === selectedKegiatanId);
  const selectedKegiatanObj = kegiatans.find(k => k.id === selectedKegiatanId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Kontrol (Hilang saat dicetak) */}
      <header className="no-print mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Cetak Laporan Resmi</h2>
        <p className="text-slate-500 mt-1 font-medium">Pilih kegiatan untuk merangkum dokumentasi foto menjadi format laporan kedinasan siap cetak.</p>
      </header>

      {/* Panel Pilihan Kegiatan */}
      <div className="no-print bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">PILIH KEGIATAN / PROGRAM</label>
          <select 
            value={selectedKegiatanId}
            onChange={(e) => setSelectedKegiatanId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none font-bold text-slate-700"
          >
            <option value="">-- Pilih Kegiatan --</option>
            {kegiatans.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        {selectedKegiatanId && (
          <button 
            onClick={handlePrint}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all mt-auto"
          >
            <Printer size={18} /> Cetak / Simpan ke PDF
          </button>
        )}
      </div>

      {/* LEMBAR LAPORAN RESMI (Format Kedinasan) */}
      {selectedKegiatanId ? (
        <div className="bg-white p-8 sm:p-14 rounded-[1.5rem] shadow-xl border border-slate-200 space-y-8 print:shadow-none print:border-none print:p-0">
          
          {/* KOP SURAT / INSTANSI */}
          <div className="border-b-4 border-slate-800 pb-6 text-center space-y-1">
            <div className="flex items-center justify-center gap-3 text-slate-800 mb-1">
              <Building2 size={28} />
              <h2 className="text-lg font-black tracking-widest uppercase">PEMERINTAH KABUPATEN TAPIN</h2>
            </div>
            <h1 className="text-xl font-extrabold text-blue-900 uppercase">DINAS SOSIAL</h1>
            <p className="text-xs text-slate-500 font-semibold">PROGRAM KELUARGA HARAPAN (PKH) KABUPATEN TAPIN</p>
            <p className="text-[10px] text-slate-400 italic">Kawasan Sekretariat Pendamping Sosial PKH, Kalimantan Selatan</p>
          </div>

          {/* JUDUL LAPORAN */}
          <div className="text-center space-y-2 pt-2">
            <h3 className="text-lg font-black text-slate-800 uppercase underline decoration-2 underline-offset-4">
              LAPORAN DOKUMENTASI KEGIATAN
            </h3>
            <p className="text-sm font-bold text-slate-600">{selectedKegiatanObj?.nama}</p>
          </div>

          {/* DETAIL INFORMASI KEGIATAN */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-slate-500">Nama Kegiatan:</span>
              <span className="font-extrabold text-slate-800">{selectedKegiatanObj?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-500">Tanggal Pelaksanaan:</span>
              <span className="font-bold text-slate-800">{selectedKegiatanObj?.tanggal || new Date(selectedKegiatanObj?.timestamp || Date.now()).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-500">Total Dokumentasi:</span>
              <span className="font-bold text-blue-600">{filteredPhotos.length} Berkas Foto</span>
            </div>
          </div>

          {/* LAMPIRAN FOTO DOKUMENTASI */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest border-b pb-2">
              III. Lampiran Foto Dokumentasi Lapangan
            </h4>

            {filteredPhotos.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-8 text-center bg-slate-50 rounded-xl">Belum ada foto yang diunggah untuk kegiatan ini.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {filteredPhotos.map((photo, index) => (
                  <div key={photo.id} className="border border-slate-300 rounded-xl p-4 space-y-3 bg-white break-inside-avoid shadow-sm">
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                      <img 
                        src={`https://drive.google.com/thumbnail?id=${photo.fileId}&sz=w800`} 
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-blue-600 uppercase">Dokumentasi #{index + 1}</p>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{photo.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Waktu: {new Date(photo.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TANDA TANGAN PEJABAT / KETUA TIM */}
          <div className="pt-10 flex justify-end break-inside-avoid">
            <div className="text-center space-y-16 w-64">
              <p className="text-xs font-bold text-slate-700">
                Rantau, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                <br />
                <span className="font-extrabold">Ketua Tim Kabupaten Tapin</span>
              </p>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 underline uppercase">M. ZAEN SYACHRULLAH, S.Pd</p>
                <p className="text-[10px] text-slate-500 font-bold">NIP. 1990.......................</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] p-12 text-center text-slate-400">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold">Silakan pilih kegiatan terlebih dahulu untuk melihat pratinjau lembar laporan.</p>
        </div>
      )}

      {/* Style CSS Khusus untuk Mode Cetak Print */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          aside, nav, footer {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}