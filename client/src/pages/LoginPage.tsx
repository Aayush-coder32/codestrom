import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Command, Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, setAccessToken, type User } from '../services/api';

export function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [searchParams] = useSearchParams();
  const [signup, setSignup] = useState(searchParams.get('signup') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ accessToken: string; user: User }>(signup ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password'), displayName: form.get('displayName') }) });
      setAccessToken(result.accessToken); onLogin(result.user);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to authenticate'); }
  };
  return <main className="auth-layout">
    <section className="auth-story">
      <Link className="auth-brand" to="/"><span className="auth-brand-icon"><Command size={18} /></span>Nexus <span>AI</span></Link>
      <Link className="auth-back" to="/"><ArrowLeft size={14} /> Back to home</Link>
      <div className="auth-story-copy"><span className="auth-story-kicker"><Sparkles size={13} /> YOUR SPACE TO THINK</span><h1>Good ideas<br />start with a<br /><em>conversation.</em></h1><p>Bring the messy first draft, the big question, the thing you can’t quite untangle yet.</p><div className="auth-story-quote"><span>“</span><p>A little clarity can change everything.</p></div></div>
      <div className="auth-story-foot"><LockKeyhole size={12} /> A private space that’s yours</div>
    </section>
    <section className="auth-form-side"><div className="auth-form-wrap">
      <div className="auth-mobile-brand"><span className="auth-brand-icon"><Command size={17} /></span>Nexus <span>AI</span></div>
      <span className="auth-form-kicker">{signup ? 'A GOOD PLACE TO BEGIN' : 'WELCOME BACK'}</span>
      <h2>{signup ? 'Create your workspace' : 'Pick up where you left off.'}</h2>
      <p className="auth-form-lead">{signup ? 'Your next clear thought is just a conversation away.' : 'Your thoughts are right where you left them.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {signup && <label>Your name<input name="displayName" placeholder="How should we call you?" required maxLength={80} autoComplete="name" /></label>}
        <label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" /></label>
        <label>Password<span className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" required minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
        {error && <p className="error auth-error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit">{signup ? 'Create my workspace' : 'Sign in'} <ArrowRight size={16} /></button>
      </form>
      <p className="auth-switch">{signup ? 'Already have a workspace?' : 'New to Nexus?'} <button onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Sign in' : 'Create an account'}</button></p>
      <p className="auth-terms">By continuing, you agree to use Nexus thoughtfully and kindly.</p>
    </div></section>
  </main>;
}
