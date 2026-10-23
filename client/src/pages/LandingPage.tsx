import { ArrowDown, ArrowRight, ArrowUpRight, Check, Command, FileText, Layers3, LockKeyhole, MessageSquare, Sparkles, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const prompts = ['Map out a product launch', 'Explain this like I’m new to it', 'Turn notes into a clear brief'];

export function LandingPage() {
  return <main className="landing-page">
    <div className="landing-orb orb-one" /><div className="landing-orb orb-two" />
    <nav className="landing-nav">
      <Link className="landing-brand" to="/"><span className="landing-logo"><Command size={19} /></span><span>Nexus<span className="brand-ai"> AI</span></span></Link>
      <div className="landing-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a></div>
      <div className="landing-actions"><Link className="nav-signin" to="/login">Sign in</Link><Link className="nav-cta" to="/login?signup=true">Get started <ArrowUpRight size={15} /></Link></div>
    </nav>

    <section className="landing-hero">
      <div className="hero-copy">
        <div className="hero-kicker"><span className="kicker-spark"><Sparkles size={13} /></span> A calmer way to work with AI <span className="kicker-line" /></div>
        <h1>Make room for<br /><span className="headline-accent">better thinking.</span></h1>
        <p className="hero-description">A clear space to explore ideas, untangle the complex, and turn what’s next into something real.</p>
        <div className="hero-buttons"><Link to="/login?signup=true" className="hero-primary">Start a conversation <ArrowRight size={17} /></Link><a href="#features" className="hero-secondary">Meet your new workspace <ArrowDown size={15} /></a></div>
        <div className="hero-proof"><div className="proof-avatars"><span>N</span><span>✳</span><span>✦</span></div><p><strong>One thoughtful space.</strong><br />For all the things you’re figuring out.</p></div>
      </div>

      <div className="preview-wrap" aria-label="Nexus AI workspace preview">
        <div className="preview-glow" />
        <div className="preview-window">
          <div className="preview-topbar"><div className="window-dots"><i /><i /><i /></div><span className="preview-app-name"><span className="mini-mark">N</span> Nexus</span><span className="preview-top-right"><span className="live-dot" /> Private workspace</span></div>
          <div className="preview-layout">
            <aside className="preview-sidebar"><div className="preview-side-label">YOUR SPACE</div><div className="preview-side-item selected"><MessageSquare size={13} /> New conversation</div><div className="preview-side-label recent-label">RECENT</div><div className="preview-side-item"><span className="recent-glyph">◌</span> Launch planning</div><div className="preview-side-item"><span className="recent-glyph">◌</span> Reading notes</div><div className="preview-side-item"><span className="recent-glyph">◌</span> A new routine</div><div className="preview-profile"><span className="profile-dot">Y</span><span>Your workspace</span><span className="profile-more">···</span></div></aside>
            <div className="preview-chat"><div className="preview-chat-head"><span>NEW CONVERSATION</span><span className="head-spark"><Sparkles size={13} /> Ready when you are</span></div><div className="preview-welcome"><div className="preview-welcome-mark"><WandSparkles size={19} /></div><div className="preview-greeting">A fresh page.</div><h2>What’s on your mind?</h2><p>Big idea, small question, unfinished thought.<br />We can start anywhere.</p></div><div className="preview-prompt-label">A FEW PLACES TO START</div><div className="preview-prompts">{prompts.map((prompt, i) => <div className="preview-prompt" key={prompt}><span className="prompt-icon">{i === 0 ? <Layers3 size={13} /> : i === 1 ? <Sparkles size={13} /> : <FileText size={13} />}</span>{prompt}<ArrowUpRight size={12} /></div>)}</div><div className="preview-input"><span>Write a thought, ask a question...</span><span className="input-send"><ArrowRight size={13} /></span></div><div className="preview-caption"><LockKeyhole size={10} /> Your conversations stay in your workspace</div></div>
          </div>
        </div>
        <div className="floating-note"><span className="note-check"><Check size={13} /></span><span><strong>From thought to next step</strong><small>Keep the momentum going</small></span></div>
        <div className="orbit-label"><span>✳</span> Think freely</div>
      </div>
    </section>

    <section className="landing-strip" id="features"><div className="strip-intro"><span className="strip-kicker">YOUR THINKING, IN GOOD COMPANY</span><p>Less noise. More <em>possibility.</em></p></div><div className="strip-features"><div className="strip-feature"><span className="feature-index">01</span><div><strong>Start anywhere</strong><small>Bring a question, a draft, or a half-formed idea.</small></div></div><div className="strip-feature"><span className="feature-index">02</span><div><strong>Find your thread</strong><small>Explore, refine, and make sense of what matters.</small></div></div><div className="strip-feature"><span className="feature-index">03</span><div><strong>Keep what clicks</strong><small>Your conversations are here when you return.</small></div></div></div></section>
    <section className="landing-bottom" id="how-it-works"><span className="bottom-spark">✳</span><span>Curiosity is a good place to begin.</span><Link to="/login?signup=true">Come on in <ArrowRight size={14} /></Link><span className="bottom-footnote">A thoughtful workspace for whatever’s next.</span></section>
  </main>;
}
