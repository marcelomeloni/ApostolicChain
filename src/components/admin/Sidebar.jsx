// src/components/admin/Sidebar.jsx
import { LayoutDashboard, PlusCircle, Users, Scroll, LogOut, Church } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';

function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'create-bishop', label: 'Novo Registro', icon: PlusCircle },
    { id: 'bishops', label: 'Bispos', icon: Users },
    { id: 'popes', label: 'Papas', icon: Scroll },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 h-screen transition-all duration-300">
      
      {/* Logo Area */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Church size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">ApostolicChain</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;