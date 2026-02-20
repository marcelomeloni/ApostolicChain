import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, ShieldCheck, Power, Server, DatabaseZap, AlertCircle } from 'lucide-react';
import { AdminService } from '../../services/AdminService';

function Dashboard() {
  const [appReady, setAppReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBishops: 0,
    totalPopes: 0,
    totalViews: 0
  });

  // Busca o status real do sistema ao carregar o componente
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getStats();
      setAppReady(data.initialized);
      setStats({
        totalBishops: data.totalBishops,
        totalPopes: data.totalPopes,
        totalViews: data.totalViews
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async () => {
    // Verifica se está autenticado antes de tentar
    if (!localStorage.getItem('admin_token')) {
        setError("Você precisa estar logado para ativar o sistema.");
        // Redireciona para login após 2 segundos
        setTimeout(() => { window.location.href = '/login'; }, 2000);
        return;
    }

    setActivating(true);
    setError(null);
    try {
        await AdminService.initializeGenesis({
            peterName: "São Pedro",
            peterStartDate: "0033-04-01"
        });
        await fetchDashboardData();
    } catch (err) {
        setError(err.message || "Falha ao inicializar o Gênesis.");
    } finally {
        setActivating(false);
    }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <DatabaseZap className="animate-bounce text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 animate-pulse">Sincronizando com a Blockchain...</p>
      </div>
    );
  }

  // --- TELA DE ATIVAÇÃO (Caso a conta Root não exista na Solana) ---
  if (!appReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center animate-in fade-in zoom-in duration-500">
        
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-slate-100">
          <Server size={48} className="text-slate-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Aplicação Não Inicializada</h2>
        <p className="text-slate-500 max-w-md mb-8">
          A Blockchain Apostólica está offline. É necessário gerar o bloco Gênesis para iniciar a árvore sagrada.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          onClick={handleActivation}
          disabled={activating}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white transition-all shadow-lg hover:shadow-xl
            ${activating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}
          `}
        >
          {activating ? (
            <>
              <DatabaseZap className="animate-pulse" />
              Processando na Solana...
            </>
          ) : (
            <>
              <Power />
              ATIVAR APLICAÇÃO
            </>
          )}
        </button>
      </div>
    );
  }

  // --- DASHBOARD NORMAL (Sistema Online) ---
  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center gap-3 text-emerald-800">
        <ShieldCheck size={20} />
        <span className="font-medium">Rede Online: Gênesis verificado na Solana Devnet.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <StatCard title="Acessos Totais" value={stats.totalViews} icon={Eye} trend="+0%" />
        <StatCard title="Linhagem Papal" value={stats.totalPopes} icon={Users} sub="Papado ativo" />
        <StatCard title="Total de Bispos" value={stats.totalBishops} icon={ShieldCheck} />
        <StatCard title="Status do Sistema" value="Online" icon={TrendingUp} sub="Sincronizado" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Atividade da Rede</h3>
          <div className="h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            Monitoramento de Transações em Tempo Real
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Integridade de Dados</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 break-all">
              Program ID: HKUdr1NeewdqE3vEzHmAu9waow5p4bHg6V6t4iM5cLhK
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-700">
              Sincronização com Supabase: OK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, sub }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {(trend || sub) && (
          <p className="text-xs text-slate-500 mt-1">
            {trend && <span className="text-green-600 font-medium mr-1">{trend}</span>}
            {sub || 'sincronizado com DB'}
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;