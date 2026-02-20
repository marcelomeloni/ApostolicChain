import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ApostolicTree from './pages/ApostolicTree';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"      element={<ApostolicTree />} />
        <Route path="/sobre" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;