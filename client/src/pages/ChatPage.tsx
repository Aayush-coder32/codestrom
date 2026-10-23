import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Bot, Check, ChevronDown, Command, FileText, FolderOpen, LogOut, Menu, MessageSquare, MoreHorizontal, Plus, Search, Send, Settings2, Sparkles, Square, WandSparkles } from 'lucide-react';
import { api, baseUrl, type Conversation, type Message, type User } from '../services/api';

const starters = [
  { title: 'Untangle an idea', detail: 'Think through something on your mind', icon: Sparkles, prompt: 'Help me think through an idea I have.' },
  { title: 'Write something', detail: 'Find the words and shape the draft', icon: FileText, prompt: 'Help me write a clear, thoughtful first draft.' },
  { title: 'Learn a new topic', detail: 'Build understanding, one step at a time', icon: FolderOpen, prompt: 'Teach me a new topic, starting with the basics.' },
  { title: 'Make a plan', detail: 'Turn a goal into doable next steps', icon: Check, prompt: 'Help me make a practical plan for a goal.' }
];

export function ChatPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  const abortRef = useRef<AbortController>();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { api<{ conversations: Conversation[] }>('/conversations').then((r) => setConversations(r.conversations)).catch(() => undefined); }, []);
  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    let cancelled = false;
    setMessages([]);
    api<{ messages: Message[] }>(`/conversations/${conversationId}/messages`).then((r) => { if (!cancelled) setMessages(r.messages); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [conversationId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);
  const newChat = () => { setConversationId(undefined); setMessages([]); setInput(''); setMobileNav(false); };
  const send = async (event?: FormEvent, prompt?: string) => {
    event?.preventDefault(); const content = (prompt ?? input).trim(); if (!content || busy) return;
    setInput(''); setMessages((current) => [...current, { _id: crypto.randomUUID(), role: 'user', content }]); setBusy(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch(`${baseUrl}/chat/stream`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId, content }), signal: controller.signal });
      if (!response.ok || !response.body) throw new Error('Unable to start generation');
      const returnedId = response.headers.get('X-Conversation-Id');
      if (returnedId && !conversationId) { setConversationId(returnedId); setConversations((items) => [{ _id: returnedId, title: content.slice(0, 60), lastMessageAt: new Date().toISOString() }, ...items]); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let assistant = ''; let buffer = '';
      const assistantId = crypto.randomUUID(); setMessages((current) => [...current, { _id: assistantId, role: 'assistant', content: '' }]);
      while (true) {
        const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n'); buffer = events.pop() ?? '';
        for (const eventText of events) { const line = eventText.split('\n').find((item) => item.startsWith('data:')); if (!line) continue; try { const data = JSON.parse(line.slice(5)); if (data.delta) { assistant += data.delta; setMessages((current) => current.map((message) => message._id === assistantId ? { ...message, content: assistant } : message)); } } catch { /* Ignore incomplete SSE frames. */ } }
      }
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessages((current) => [...current, { _id: crypto.randomUUID(), role: 'assistant', content: 'I could not complete that request. Please try again.' }]); }
    finally { setBusy(false); abortRef.current = undefined; }
  };
  const shownConversations = conversations.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  const activeTitle = conversations.find((item) => item._id === conversationId)?.title;
  return <div className="workspace-shell">
    {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={mobileNav ? 'workspace-sidebar is-open' : 'workspace-sidebar'}>
      <div className="workspace-brand-row"><a className="workspace-brand" href="/"><span className="workspace-brand-mark"><Command size={17} /></span>Nexus <span>AI</span></a><button className="sidebar-collapse" onClick={() => setMobileNav(false)} aria-label="Close sidebar"><Menu size={17} /></button></div>
      <button className="workspace-new-chat" onClick={newChat}><Plus size={16} /> New conversation <span>⌘ K</span></button>
      <label className="conversation-search"><Search size={14} /><input aria-label="Search conversations" placeholder="Search your space" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="sidebar-section-label">YOUR SPACE <button aria-label="Conversation options"><MoreHorizontal size={15} /></button></div>
      <nav className="conversation-list">{shownConversations.length ? shownConversations.map((item) => <button className={item._id === conversationId ? 'workspace-conversation active' : 'workspace-conversation'} key={item._id} onClick={() => { setConversationId(item._id); setMobileNav(false); }}><MessageSquare size={14} /><span>{item.title}</span></button>) : <p className="no-conversations">{search ? 'No matching conversations' : 'Your conversations will show up here.'}</p>}</nav>
      <div className="sidebar-bottom"><div className="workspace-profile"><span className="profile-avatar">{user.displayName.slice(0, 1).toUpperCase()}</span><span className="profile-name">{user.displayName}<small>Personal workspace</small></span><button aria-label="Account options" className="profile-more"><ChevronDown size={15} /></button></div><button className="sidebar-logout" title="Sign out" onClick={onLogout}><LogOut size={15} /></button></div>
    </aside>
    <main className="workspace-main">
      <header className="workspace-header"><button className="workspace-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="workspace-breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{activeTitle ?? 'New conversation'}</strong><ChevronDown size={14} /></div><div className="workspace-header-right"><span className="workspace-status"><i /> All systems ready</span><button className="workspace-settings" aria-label="Settings"><Settings2 size={16} /></button><span className="header-avatar">{user.displayName.slice(0, 1).toUpperCase()}</span></div></header>
      <section className={messages.length ? 'workspace-messages has-messages' : 'workspace-messages'}>
        {!messages.length ? <div className="workspace-welcome"><div className="welcome-icon"><WandSparkles size={22} /></div><span className="workspace-welcome-kicker">A LITTLE SPACE TO THINK</span><h1>Where shall we<br /><em>begin?</em></h1><p>Bring a question, a new idea, or a knot you’d like to untangle.<br className="desktop-break" /> We can take it one thought at a time.</p><div className="starter-grid">{starters.map(({ title, detail, icon: Icon, prompt }) => <button className="starter-card" key={title} onClick={() => void send(undefined, prompt)}><span className="starter-icon"><Icon size={16} /></span><span className="starter-text"><strong>{title}</strong><small>{detail}</small></span><ArrowRight className="starter-arrow" size={15} /></button>)}</div><div className="welcome-note"><Sparkles size={12} /> No perfect prompt needed. Just start where you are.</div></div> : <div className="message-thread">{messages.map((message) => <article className={message.role === 'user' ? 'thread-message user-message' : 'thread-message assistant-message'} key={message._id}><div className="thread-avatar">{message.role === 'user' ? user.displayName.slice(0, 1).toUpperCase() : <Bot size={16} />}</div><div className="thread-body"><div className="thread-heading"><strong>{message.role === 'user' ? 'You' : 'Nexus'}</strong><span>{message.role === 'user' ? 'Just now' : 'Thinking partner'}</span></div><div className="message-content">{message.content || <span className="typing">•••</span>}</div></div></article>)}<div ref={bottomRef} /></div>}
      </section>
      <div className="workspace-composer-wrap"><form className="workspace-composer" onSubmit={(event) => void send(event)}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Write a thought, ask a question..." rows={1} disabled={busy} /><div className="composer-toolbar"><span className="composer-hint"><span>↵</span> to send <span className="hint-divider">·</span> <span>⇧ ↵</span> for a new line</span><button className="composer-send" type={busy ? 'button' : 'submit'} onClick={busy ? () => abortRef.current?.abort() : undefined} aria-label={busy ? 'Stop response' : 'Send message'}>{busy ? <Square size={14} /> : <Send size={15} />}</button></div></form><p className="composer-disclaimer"><LockKeyholeTiny /> Your conversations are private. Nexus can make mistakes, so check important details.</p></div>
    </main>
  </div>;
}

function LockKeyholeTiny() { return <span className="tiny-lock">◆</span>; }
