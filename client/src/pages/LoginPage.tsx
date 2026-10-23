import { FormEvent, useState } from 'react';
import { api, setAccessToken, type User } from '../services/api';

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ accessToken: string; user: User }>(signup ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password'), displayName: form.get('displayName') }) });
      setAccessToken(result.accessToken); onLogin(result.user);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to authenticate'); }
  };
  return <main className="auth-page"><section className="auth-card"><div className="brand-mark">N</div><p className="eyebrow">NEXUS AI</p><h1>{signup ? 'Create your workspace' : 'Welcome back'}</h1><p className="muted">A focused, private place to think with AI.</p><form onSubmit={submit}>{signup && <input name="displayName" placeholder="Display name" required maxLength={80} />}<input name="email" type="email" placeholder="Email address" required /><input name="password" type="password" placeholder="Password" required minLength={8} />{error && <p className="error">{error}</p>}<button className="primary" type="submit">{signup ? 'Create account' : 'Sign in'} <span>→</span></button></form><button className="text-button" onClick={() => setSignup(!signup)}>{signup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></section></main>;
}
