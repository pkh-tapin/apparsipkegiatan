import { LayoutDashboard, FolderOpen, UploadCloud, Settings, LogIn, LogOut, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeMenu, setActiveMenu, isAdmin, setIsAdmin }) {
  const handleLogin = (e) => {
    e.preventDefault();
    if (e.target.password.value === 'admin123') {
      setIsAdmin(true);
      sessionStorage.setItem('adminAccess', 'true');
      e.target.reset();
    } else alert('Password salah!');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('adminAccess');
    setActiveMenu('dashboard');
  };

  const MenuButton = ({ id, icon: Icon, label }) => {
    const isActive = activeMenu === id;
    return (
      <button 
        onClick={() => setActiveMenu(id)} 
        className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] translate-x-2' 
            : 'text-slate-500 hover:bg-white hover:shadow-md hover:text-blue-600'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
        {label}
      </button>
    );
  };

  return (
    <aside className="w-full md:w-72 bg-white/80 backdrop-blur-xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20 border-r border-white no-print">
      <div className="p-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">E-Galeri</h1>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">PKH Tapin</p>
          </div>
        </motion.div>
      </div>
      
      <nav className="flex-grow px-4 py-6 space-y-2">
        <MenuButton id="dashboard" icon={LayoutDashboard} label="Dashboard" />
        <MenuButton id="database" icon={FolderOpen} label="Database Kegiatan" />
        
        {/* Menu Report/Laporan yang Baru */}
        <MenuButton id="report" icon={FileText} label="Laporan Cetak" />
        
        {isAdmin && (
          <>
            <MenuButton id="upload" icon={UploadCloud} label="Upload Foto" />
            <MenuButton id="pengaturan" icon={Settings} label="Pengaturan Sistem" />
          </>
        )}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 p-4 rounded-3xl shadow-inner border border-slate-100">
          {isAdmin ? (
            <button onClick={handleLogout} className="w-full flex justify-center items-center gap-2 bg-white text-red-500 hover:bg-red-50 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
              <LogOut size={18} /> Logout Admin
            </button>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="relative">
                <LogIn size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input name="password" type="password" placeholder="PIN Admin" className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm outline-none shadow-sm focus:shadow-[0_0_0_2px_rgba(37,99,235,0.2)] transition-all border border-slate-100" required/>
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white hover:bg-blue-600 py-3 rounded-xl font-bold transition-all shadow-md">Akses Admin</button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}