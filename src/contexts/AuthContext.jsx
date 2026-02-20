// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { LoginService } from '../services/LoginService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa checando se já há um token no localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const email = localStorage.getItem('admin_email');
    
    if (token) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // 1. Chama o serviço puramente para API
    const response = await LoginService.login(email, password);
    
    // 2. Se a API retornou sucesso e o token, o Contexto assume e salva os dados
    if (response.success && response.token) {
      localStorage.setItem('admin_token', response.token);
      localStorage.setItem('admin_email', response.email || email);
      
      setIsAuthenticated(true);
      setUserEmail(response.email || email);
    } else {
      throw new Error(response.message || "Erro de autenticação.");
    }
    
    return response;
  };

  const logout = () => {
    // 3. O Contexto limpa a sessão
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);