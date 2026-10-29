import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './config/firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DatabaseKegiatan from './pages/DatabaseKegiatan';
import UploadFoto from './pages/UploadFoto';
import ReportGenerator from './pages/ReportGenerator'; // <-- Import Menu Laporan Baru
import Pengaturan from './pages/Pengaturan';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [kegiatans, setKegiatans] = useState([]);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem('adminAccess') === 'true') setIsAdmin(true);

    onValue(ref(db, 'kegiatans'), (snapshot) => {
      const data = snapshot.val();
      setKegiatans(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : []);
    });

    onValue(ref(db, 'photos'), (snapshot) => {
      const data = snapshot.val();
      setPhotos(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : []);
    });
  }, []);

  const renderPage = () => {
    switch (activeMenu) {
      case 'dashboard': 
        return <Dashboard photos={photos} kegiatans={kegiatans} />;
      case 'database': 
        return <DatabaseKegiatan photos={photos} kegiatans={kegiatans} />;
      case 'upload': 
        return isAdmin ? <UploadFoto kegiatans={kegiatans} /> : <Dashboard photos={photos} kegiatans={kegiatans} />;
      case 'report': // <-- Route Menu Laporan (Bisa diakses Admin/Umum sesuai kebutuhan)
        return <ReportGenerator kegiatans={kegiatans} photos={photos} />;
      case 'pengaturan': 
        return isAdmin ? <Pengaturan /> : <Dashboard photos={photos} kegiatans={kegiatans} />;
      default: 
        return <Dashboard photos={photos} kegiatans={kegiatans} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f3f4f6] text-slate-800 font-sans selection:bg-blue-200">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
      />
      
      <main className="flex-1 p-6 md:p-10 flex flex-col h-screen overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full flex-1">
          {renderPage()}
        </div>
        <footer className="text-center pt-10 pb-2 text-slate-400 text-sm mt-auto font-medium">
          &copy; M. Zaen Syachrullah 2026 - E-Galeri PKH Tapin
        </footer>
      </main>
    </div>
  );
}