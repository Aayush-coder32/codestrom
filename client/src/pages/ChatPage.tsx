import { FormEvent, useEffect, useRef, useState } from 'react';
import { LogOut, Menu, Plus, Send, Sparkles, Square, Trash2 } from 'lucide-react';
import { api, baseUrl, type Conversation, type Message, type User } from '../services/api';

export function ChatPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const abortRef = useRef<AbortController>();
  useEffect(() => { api<{ conversations: Conversation[] }>('/conversations').then((r) => setConversations(r.conversations)).catch(() => undefined); }, []);
  useEffect(() => { if (conversationId) api<{ messages: Message[] }>(`/conversations/${conversationId}/messages`).then((r) => setMessages(r.messages)); }, [conversationId]);
  const newChat = () => { setConversationId(undefined); setMessages([]); setMobileNav(false); };
  const send = async (event: FormEvent) => {
    event.preventDefault(); const content = input.trim(); if (!content || busy) return;
    setInput(''); setMessages((current) => [...current, { _id: crypto.randomUUID(), role: 'user', content }]); setBusy(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch(`${baseUrl}/chat/stream`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId, content }), signal: controller.signal });
      if (!response.ok || !response.body) throw new Error('Unable to start generation');
      const returnedId = response.headers.get('X-Conversation-Id'); if (returnedId && !conversationId) { setConversationId(returnedId); setConversations((items) => [{ _id: returnedId, title: content.slice(0, 60), lastMessageAt: new Date().toISOString() }, ...items]); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let assistant = ''; setMessages((current) => [...current, { _id: crypto.randomUUID(), role: 'assistant', content: '' }]);
      while (true) { const { value, done } = await reader.read(); if (done) break; const chunk = decoder.decode(value); for (const event of chunk.split('\n\n')) { const line = event.split('\n').find((item) => item.startsWith('data:')); if (!line) continue; const data = JSON.parse(line.slice(5)); if (data.delta) { assistant += data.delta; setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, content: assistant } : message)); } } }
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessages((current) => [...current, { _id: crypto.randomUUID(), role: 'assistant', content: 'I could not complete that request. Please try again.' }]); } finally { setBusy(false); abortRef.current = undefined; }
  };
  return <div className="app-shell"><aside className={mobileNav ? 'sidebar open' : 'sidebar'}><div className="logo"><div className="brand-mark small">N</div><strong>Nexus</strong></div><button className="new-chat" onClick={newChat}><Plus size={17} /> New chat</button><p className="sidebar-label">Recent conversations</p><nav>{conversations.map((item) => <button className={item._id === conversationId ? 'conversation active' : 'conversation'} key={item._id} onClick={() => { setConversationId(item._id); setMobileNav(false); }}>{item.title}</button>)}</nav><div className="sidebar-bottom"><span>{user.displayName}</span><button className="icon-button" title="Sign out" onClick={onLogout}><LogOut size={17} /></button></div></aside><main className="chat-main"><header><button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu /></button><div><p className="eyebrow">NEXUS AI / WORKSPACE</p><h2>{conversationId ? conversations.find((c) => c._id === conversationId)?.title ?? 'Conversation' : 'New conversation'}</h2></div><div className="header-status"><span className="status-dot" /> Online</div></header><section className="messages">{messages.length === 0 ? <div className="welcome"><Sparkles size={28} /><h1>What can I help you with today?</h1><p>Ask a question, explore an idea, or build something remarkable.</p><div className="suggestions">{['Explain a programming concept', 'Build a full-stack application', 'Summarize a document', 'Research a topic'].map((prompt) => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}<span>↗</span></button>)}</div></div> : messages.map((message) => <article className={message.role === 'user' ? 'message user' : 'message assistant'} key={message._id}><div className="avatar">{message.role === 'user' ? user.displayName.slice(0, 1).toUpperCase() : 'N'}</div><div><div className="message-role">{message.role === 'user' ? 'You' : 'Nexus AI'}</div><div className="message-content">{message.content || <span className="typing">● ● ●</span>}</div></div></article>)}</section><form className="composer" onSubmit={send}><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(e); } }} placeholder="Message Nexus AI..." rows={1} disabled={busy} /><button className="send-button" type={busy ? 'button' : 'submit'} onClick={busy ? () => abortRef.current?.abort() : undefined} title={busy ? 'Stop generation' : 'Send'}>{busy ? <Square size={17} /> : <Send size={17} />}</button><small>Nexus can make mistakes. Check important information.</small></form></main></div>;
}
