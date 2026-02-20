import { useState, useEffect } from 'react';
import { User, Hash, Calendar, Check, Loader2, Crown, AlertTriangle } from 'lucide-react';
import { AdminService } from '../../services/AdminService';

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
    {children}
  </label>
);

const Input = ({ icon: Icon, disabled, ...props }) => (
  <div className="relative">
    {Icon && (
      <div className={`absolute left-3 top-2.5 ${disabled ? 'text-slate-300' : 'text-slate-400'}`}>
        <Icon size={18} />
      </div>
    )}
    <input
      {...props}
      disabled={disabled}
      className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 
      ${disabled 
        ? 'cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
        : 'border-slate-200 focus:border-indigo-500'
      } ${Icon ? 'pl-10' : ''}`}
    />
  </div>
);

const Switch = ({ checked, onCheckedChange, label }) => (
  <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 shadow-sm bg-white hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onCheckedChange(!checked)}>
    <div className="space-y-0.5">
      <label className="text-base font-medium text-slate-900 cursor-pointer flex items-center gap-2">
        {checked ? <Crown size={18} className="text-yellow-500 fill-yellow-500" /> : <User size={18} />}
        {label}
      </label>
      <p className="text-xs text-slate-500">
        Habilite se este bispo foi eleito Sumo Pontífice.
      </p>
    </div>
    <div className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}>
      <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </div>
);

const Button = ({ children, isLoading, ...props }) => (
  <button
    {...props}
    disabled={isLoading}
    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2 w-full shadow-md"
  >
    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
    {children}
  </button>
);

function CreateBishop() {
  const [formData, setFormData] = useState({
    name: '',
    consecratorHash: '',
    consecrationDate: '',
    isPope: false,
    consecratorUnknown: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formData.consecratorUnknown) {
      setFormData(prev => ({ ...prev, consecratorHash: '00x00x00' }));
    } else if (formData.consecratorHash === '00x00x00') {
      setFormData(prev => ({ ...prev, consecratorHash: '' }));
    }
  }, [formData.consecratorUnknown]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (val) => {
    setFormData({ ...formData, isPope: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        parentHash: formData.consecratorHash,
        role: formData.isPope ? 'POPE' : 'BISHOP',
        startDate: formData.consecrationDate,
        papacyStartDate: formData.isPope ? formData.consecrationDate : null
      };

      await AdminService.createClergy(payload);
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setFormData({ 
          name: '', 
          consecratorHash: '', 
          consecrationDate: '', 
          isPope: false, 
          consecratorUnknown: false 
        });
      }, 3000);
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      setError(err.message || 'Ocorreu um erro ao processar a transação na blockchain.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">Registro Criado!</h3>
        <p className="text-green-600 mb-6">O novo registro foi adicionado à árvore apostólica com sucesso.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="text-sm font-medium text-green-700 hover:text-green-800 underline"
        >
          Cadastrar outro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Novo Registro</h1>
        <p className="text-slate-500 mt-2">
          Preencha os dados abaixo para adicionar um novo bispo ou papa à linhagem apostólica.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-slate-100">
          <div className="h-full bg-indigo-500 w-1/3 rounded-r-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Religioso</Label>
            <Input 
              id="name"
              name="name" 
              placeholder="Ex: Dom Pedro Casaldáliga" 
              required
              icon={User}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="consecratorHash">Hash do Consagrador</Label>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      name="consecratorUnknown"
                      checked={formData.consecratorUnknown}
                      onChange={handleChange}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-slate-300 shadow-sm transition-all checked:border-red-500 checked:bg-red-500 hover:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Check size={12} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-red-600 transition-colors select-none">
                    Consagrante não encontrado?
                  </span>
                </label>
              </div>

              <Input 
                id="consecratorHash"
                name="consecratorHash" 
                placeholder={formData.consecratorUnknown ? "Registro Perdido (00x00x00)" : "0x..."} 
                required
                icon={formData.consecratorUnknown ? AlertTriangle : Hash}
                value={formData.consecratorHash}
                onChange={handleChange}
                disabled={formData.consecratorUnknown}
                className={`font-mono text-xs transition-colors ${formData.consecratorUnknown ? 'text-red-500 font-bold' : ''}`}
              />
              {formData.consecratorUnknown && (
                <p className="text-[10px] text-red-500 mt-1">
                  * Este registro será marcado como uma quebra na linhagem histórica.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consecrationDate">Data de Consagração</Label>
              <Input 
                id="consecrationDate"
                type="date"
                name="consecrationDate" 
                required
                icon={Calendar}
                value={formData.consecrationDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-2">
             <div className="border-t border-slate-100 my-4"></div>
             <Switch 
                checked={formData.isPope} 
                onCheckedChange={handleSwitchChange} 
                label="Este registro é um Papa?"
             />
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={loading}>
              {loading ? 'Processando na Blockchain...' : 'Salvar Registro na Blockchain'}
            </Button>
          </div>

        </form>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
          A ação será registrada permanentemente. Certifique-se da veracidade dos dados.
        </div>
      </div>
    </div>
  );
}

export default CreateBishop;