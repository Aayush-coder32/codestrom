import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { api, refreshSession, setAccessToken, type User } from '../services/api';
import { LoginPage } from '../pages/LoginPage';
import { ChatPage } from '../pages/ChatPage';
import { LandingPage } from '../pages/LandingPage';

function Shell() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { refreshSession().then((result) => setUser(result.user)).catch(() => setAccessToken(null)).finally(() => setChecking(false)); }, []);
  if (checking) return <div className="loading">Loading Nexus AI...</div>;
  return <Routes>
    <Route path="/" element={user ? <ChatPage user={user} onLogout={() => { api('/auth/logout', { method: 'POST' }).finally(() => { setAccessToken(null); setUser(null); }); }} /> : <LandingPage />} />
    <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={setUser} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
export function App() { return <BrowserRouter><Shell /></BrowserRouter>; }
