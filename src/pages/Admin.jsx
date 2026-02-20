import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import Dashboard from '../components/admin/Dashboard';
import CreateBishop from '../components/admin/CreateBishop';
import { BishopList, PopeList } from '../components/admin/DataLists';
import { useAuth } from '../contexts/AuthContext';

const TITLES = {
  'dashboard': 'Visão Geral',
  'create-bishop': 'Adicionar Registro',
  'bishops': 'Catálogo de Bispos',
  'popes': 'Linhagem Papal',
};

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, loading, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':     return <Dashboard />;
      case 'create-bishop': return <CreateBishop />;
      case 'bishops':       return <BishopList />;
      case 'popes':         return <PopeList />;
      default:              return <Dashboard />;
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="flex flex-row min-h-screen bg-slate-50 w-full overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col h-screen relative w-full">
        <Header title={TITLES[activeTab] ?? 'Admin'} />

        <main className="flex-1 overflow-y-auto p-6 w-full">
          <div className="mx-auto max-w-7xl w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Admin;