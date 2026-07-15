import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, Copy, Check, Menu, Plus, Trash2, MoreHorizontal, Edit2, ThumbsUp, ThumbsDown, Pin, PinOff } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Lottie from 'lottie-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import liveChatbotAnimation from '../assets/live-chatbot.json';
import historyAnimation from '../assets/liga-history.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  isPinned?: boolean;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: `### Welcome to Quantum AI Assistant!
I'm here to help you learn and build applications using the **Quantum Language**.

Here is what you can ask me about:
* **Architecture & Internals**: Two execution paths (compile + bundle vs direct interpretation), compiler stack, and stack-based VM call frames.
* **Multi-Syntax & Language Features**: Combining Python, JS, and C/C++ syntax in a single file, closures, OOP with inheritance, exception handling, and pointers.
* **Standard Library & Crypto**: Over 200 native functions, including hashing (SHA-256/1, MD5), encryption (AES-128 ECB), rot13, base64, Shannon entropy, and file I/O.
* **Build & CLI Tools**: Running the REPL, running tests, compiling with \`quantum.exe\`, and using the \`qrun.exe\` interpreter.

Select a quick prompt below or type your questions directly!`
};

const ChatbotLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-6 h-6", className)}
  >
    {/* Headband */}
    <path
      d="M5 13a7 7 0 0114 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    
    {/* Left Ear Cup */}
    <rect
      x="3.5"
      y="11.5"
      width="2"
      height="4"
      rx="1"
      fill="#06b6d4"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    
    {/* Right Ear Cup */}
    <rect
      x="18.5"
      y="11.5"
      width="2"
      height="4"
      rx="1"
      fill="#06b6d4"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    
    {/* Gear in the center */}
    <circle
      cx="12"
      cy="13"
      r="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Gear Teeth */}
    <path
      d="M12 10v-1M12 17v-1M9 13H8M16 13h-1M9.9 10.9l-.7-.7M14.1 15.1l-.7-.7M9.9 15.1l-.7.7M14.1 10.9l.7-.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    
    {/* Microphone Arm */}
    <path
      d="M19 14.5c0 3-2 3.5-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Microphone Tip */}
    <rect
      x="12"
      y="17"
      width="3.5"
      height="2"
      rx="1"
      fill="#06b6d4"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

const STARTER_PROMPTS = [
  { text: "What is Quantum and how does the architecture work?", label: "Overview & Architecture" },
  { text: "Show me Quantum's language syntax (multi-syntax, pointers, OOP, exceptions)", label: "Language Syntax & OOP" },
  { text: "What functions are available in the Standard Library?", label: "Standard Library Functions" },
  { text: "How do I build Quantum and run programs?", label: "Build & CLI Reference" }
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ChatAssistant = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  const [sessions, setSessions] = React.useState<ChatSession[]>(() => {
    const saved = sessionStorage.getItem('quantum_chat_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const legacySaved = sessionStorage.getItem('quantum_chat_history');
    if (legacySaved) {
      try {
        const legacyMessages = JSON.parse(legacySaved);
        return [{ id: Date.now().toString(), title: 'Legacy Chat', messages: legacyMessages, updatedAt: Date.now() }];
      } catch (e) { }
    }
    return [{ id: Date.now().toString(), title: 'New Chat', messages: [INITIAL_MESSAGE], updatedAt: Date.now() }];
  });

  const [activeSessionId, setActiveSessionId] = React.useState<string>(() => {
    const savedId = sessionStorage.getItem('quantum_chat_active_id');
    return savedId || (sessions.length > 0 ? sessions[0].id : Date.now().toString());
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isFallbackMode, setIsFallbackMode] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Feedback State
  const [feedback, setFeedback] = React.useState<Record<string, 'liked' | 'disliked'>>({});
  const [feedbackModalOpenFor, setFeedbackModalOpenFor] = React.useState<string | null>(null);
  const [feedbackSelectedChips, setFeedbackSelectedChips] = React.useState<string[]>([]);
  const [feedbackText, setFeedbackText] = React.useState('');

  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    sessionStorage.setItem('quantum_chat_sessions', JSON.stringify(sessions));
    sessionStorage.setItem('quantum_chat_active_id', activeSessionId);
    scrollToBottom();
  }, [sessions, activeSessionId]);

  React.useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [isTyping]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [INITIAL_MESSAGE],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== id);
      if (newSessions.length === 0) {
        const newSession: ChatSession = { id: Date.now().toString(), title: 'New Chat', messages: [INITIAL_MESSAGE], updatedAt: Date.now() };
        setActiveSessionId(newSession.id);
        return [newSession];
      }
      if (activeSessionId === id) {
        setActiveSessionId(newSessions[0].id);
      }
      return newSessions;
    });
    setMenuOpenId(null);
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
    setMenuOpenId(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitle.trim() } : s));
    }
    setEditingSessionId(null);
    setMenuOpenId(null);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    
    const updateSessionMessages = (newMessages: Message[], newTitle?: string) => {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: newMessages,
            title: newTitle || s.title,
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    };

    let updatedTitle = activeSession.title;
    if (activeSession.title === 'New Chat' && activeSession.messages.length === 1) {
       updatedTitle = textToSend.split(' ').slice(0, 4).join(' ') + '...';
    }

    const currentMessages = [...messages, userMessage];
    updateSessionMessages(currentMessages, updatedTitle);
    
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: currentMessages })
      });

      const data = await response.json();

      if (data.success) {
        updateSessionMessages([...currentMessages, { role: 'assistant', content: data.message }]);
        setIsFallbackMode(Boolean(data.isFallback));
      } else {
        updateSessionMessages([...currentMessages, { role: 'assistant', content: `❌ Error: ${data.error || 'Failed to fetch response'}` }]);
      }
    } catch (error) {
      updateSessionMessages([...currentMessages, { role: 'assistant', content: `❌ Connection Error: Make sure the Quantum backend server is running at ${API_BASE}.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderTextWithInlineFormatting = (text: string) => {
    const boldAndCodePattern = /(\*\*.*?\*\*|`.*?`)/g;
    const tokens = text.split(boldAndCodePattern);

    return tokens.map((token, tokenIdx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={tokenIdx} className="font-bold text-black dark:text-white">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={tokenIdx} className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  const parseMessageContent = (content: string, messageIndex: number) => {
    // 1. Split by code blocks
    const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

    return parts.flatMap((part, partIdx) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
        const language = match ? match[1] : 'javascript';
        const code = match ? match[2] : part;
        const codeBlockId = `${messageIndex}-${partIdx}`;

        return (
          <div key={partIdx} className="my-4 rounded-2xl overflow-hidden bg-[#2d3135] font-mono text-xs text-left shadow-lg border border-black/10 dark:border-white/5 relative group">
            <div className="flex items-center gap-1.5 px-4 pt-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            
            <button
              type="button"
              onClick={() => handleCopyCode(code, codeBlockId)}
              className="absolute top-4 right-4 flex items-center gap-1 text-[#8b949e] hover:text-[#58a6ff] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            >
              {copiedId === codeBlockId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span className="text-[#3fb950]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <div className="px-4 pb-4 pt-2 overflow-x-auto custom-scrollbar">
              <SyntaxHighlighter
                language={language === 'sa' ? 'javascript' : language || 'javascript'}
                style={atomDark}
                customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '13px', lineHeight: '1.6' }}
              >
                {code.trim()}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      // 2. Parse inline lines (headings, lists, tables, paragraphs)
      const lines = part.split('\n');
      const renderedElements: React.ReactNode[] = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) {
          renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
          i++;
          continue;
        }

        // --- Table Parser ---
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const tableLines: string[] = [];
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            tableLines.push(lines[i].trim());
            i++;
          }

          if (tableLines.length > 0) {
            // Filter out separator lines (e.g., |---| or |:---|)
            const rowsData = tableLines.filter(l => !/^[|\s:-]+$/.test(l)).map(l => {
              return l.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            });

            if (rowsData.length > 0) {
              const headers = rowsData[0];
              const bodyRows = rowsData.slice(1);

              renderedElements.push(
                <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 shadow-sm bg-black/5 dark:bg-white/5">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-black/10 dark:bg-white/10 border-b border-black/10 dark:border-white/10">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-2.5 py-1.5 font-bold text-black dark:text-white uppercase tracking-wider text-[9px]">
                            {renderTextWithInlineFormatting(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {bodyRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-2.5 py-1.5 text-black/80 dark:text-white/80 font-mono text-[10px]">
                              {renderTextWithInlineFormatting(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }
          continue;
        }

        // --- Unordered List Parser ---
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const listItems: string[] = [];
          while (i < lines.length && (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))) {
            listItems.push(lines[i].trim().substring(2));
            i++;
          }

          renderedElements.push(
            <ul key={`ul-${i}`} className="list-disc pl-5 my-2 space-y-1 text-xs">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderTextWithInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
          continue;
        }

        // --- Ordered List Parser ---
        if (/^\d+\.\s/.test(trimmed)) {
          const listItems: string[] = [];
          while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
            const match = lines[i].trim().match(/^\d+\.\s(.*)/);
            if (match) {
              listItems.push(match[1]);
            }
            i++;
          }

          renderedElements.push(
            <ol key={`ol-${i}`} className="list-decimal pl-5 my-2 space-y-1 text-xs">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {renderTextWithInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
          continue;
        }

        // --- Headings Parser ---
        if (trimmed.startsWith('#')) {
          const headingLevel = (trimmed.match(/^#+/) || [''])[0].length;
          const text = trimmed.replace(/^#+\s*/, '');
          const formattedText = renderTextWithInlineFormatting(text);

          if (headingLevel === 1) {
            renderedElements.push(
              <h1 key={`h1-${i}`} className="text-sm font-extrabold text-black dark:text-white mt-4 mb-2 border-b border-black/10 dark:border-white/10 pb-1">
                {formattedText}
              </h1>
            );
          } else if (headingLevel === 2) {
            renderedElements.push(
              <h2 key={`h2-${i}`} className="text-xs font-bold text-black dark:text-white mt-4 mb-2 uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                {formattedText}
              </h2>
            );
          } else if (headingLevel === 3) {
            renderedElements.push(
              <h3 key={`h3-${i}`} className="text-xs font-bold text-black/85 dark:text-white/85 mt-3 mb-1">
                {formattedText}
              </h3>
            );
          } else {
            renderedElements.push(
              <h4 key={`h4-${i}`} className="text-[11px] font-bold text-black/70 dark:text-white/70 mt-2 mb-1">
                {formattedText}
              </h4>
            );
          }
          i++;
          continue;
        }

        // --- Standard Paragraph ---
        renderedElements.push(
          <p key={`p-${i}`} className="text-xs leading-relaxed my-1.5 text-black/85 dark:text-white/90">
            {renderTextWithInlineFormatting(trimmed)}
          </p>
        );
        i++;
      }

      return renderedElements;
    });
  };

  return (
    <div className="fixed bottom-8 right-8 z-[70] flex flex-col items-end">
      {/* Expanded Chat Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "w-[calc(100vw-2rem)] sm:w-[440px] h-[650px] max-h-[calc(100vh-120px)] rounded-2xl flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden border border-cyan-500/20 dark:border-cyan-500/30 mb-4",
              theme === 'dark' 
                ? "bg-black/80 backdrop-blur-2xl text-white bg-gradient-to-b from-black/60 to-[#08151f]/80" 
                : "bg-white/85 backdrop-blur-2xl text-black bg-gradient-to-b from-white/60 to-cyan-50/50"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-cyan-500/10 border-b border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-between relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              
              <div className="flex items-center gap-3 relative z-10">
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-black/50 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer hidden sm:block"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 hidden sm:flex">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <Lottie 
                      animationData={liveChatbotAnimation} 
                      loop={true} 
                      className="w-[120%] h-[120%] object-contain pointer-events-none drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]"
                    />
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-black shadow-[0_0_5px_rgba(34,197,94,0.8)] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300 drop-shadow-sm">Quantum Assistant</h3>
                    <span className="text-[9px] text-cyan-800/60 dark:text-cyan-100/50 font-mono hidden sm:inline-block">Bytecode VM v2.0.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 relative z-10">
                <button 
                  onClick={handleNewChat}
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-cyan-700 dark:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  title="New Chat"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-black/50 dark:text-white/50 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* History Drawer */}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute inset-y-0 left-0 w-64 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-r border-cyan-500/20 z-50 flex flex-col shadow-2xl"
                >
                  <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-cyan-500/5 dark:bg-cyan-500/10 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 relative flex items-center justify-center">
                        <Lottie 
                          animationData={historyAnimation} 
                          loop={true} 
                          className="w-[150%] h-[150%] object-contain pointer-events-none drop-shadow-[0_0_3px_rgba(6,182,212,0.5)]"
                        />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">History</h3>
                    </div>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-black/50 dark:text-white/50 hover:text-cyan-500 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {[...sessions].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)).map(session => (
                      <div key={session.id} className="relative group flex items-center">
                        {editingSessionId === session.id ? (
                          <form 
                            onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(session.id); }}
                            className="flex-1 px-3 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-cyan-500/30 flex items-center gap-2"
                          >
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => handleRenameSubmit(session.id)}
                              className="w-full bg-transparent text-xs text-black dark:text-white outline-none"
                            />
                          </form>
                        ) : (
                          <button
                            onClick={() => { setActiveSessionId(session.id); setIsHistoryOpen(false); }}
                            className={cn(
                              "flex-1 text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex flex-col gap-1 cursor-pointer pr-10",
                              activeSessionId === session.id
                                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                                : "hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 border border-transparent"
                            )}
                          >
                            <span className="font-semibold truncate w-full flex items-center gap-1.5">
                              {session.isPinned && <Pin className="w-3 h-3 text-cyan-500 fill-cyan-500 shrink-0" />}
                              {session.title}
                            </span>
                            <span className="text-[9px] opacity-60">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                        )}

                        {!editingSessionId && (
                          <div className="absolute right-2" ref={menuOpenId === session.id ? menuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenId(menuOpenId === session.id ? null : session.id);
                              }}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                menuOpenId === session.id || activeSessionId === session.id 
                                  ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                menuOpenId === session.id ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/10 dark:hover:bg-white/10"
                              )}
                            >
                              <MoreHorizontal className="w-4 h-4 text-black/60 dark:text-white/60" />
                            </button>

                            {menuOpenId === session.id && (
                              <div className="absolute top-8 right-0 w-32 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl py-1 z-50">
                                <button
                                  onClick={(e) => handleTogglePin(session.id, e)}
                                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 text-black/80 dark:text-white/80 cursor-pointer"
                                >
                                  {session.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                                  {session.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditTitle(session.title);
                                    setEditingSessionId(session.id);
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 text-black/80 dark:text-white/80 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  Rename
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSession(session.id, e)}
                                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-500/10 text-red-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dev Mode Fallback Banner */}
            {isFallbackMode && (
              <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2 flex items-start gap-2 text-[10px] text-cyan-600 dark:text-cyan-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-normal">
                  Running in **local fallback mode**. Create a `.env` in the backend and add `GROQ_API_KEY` or `GEMINI_API_KEY` for live AI chat.
                </span>
              </div>
            )}

            {/* Chat Messages */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSessionId}
                initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
              >
                {messages.map((msg, index) => {
                  const msgId = `${activeSessionId}-${index}`;
                  return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index === messages.length - 1 ? 0 : 0 }}
                    key={msgId}
                    className={cn(
                      "flex flex-col max-w-[85%] group",
                      msg.role === 'user' ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col rounded-2xl px-3.5 py-2.5 text-xs shadow-sm",
                        msg.role === 'user'
                          ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-900 dark:text-cyan-100 rounded-br-none"
                          : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-bl-none shadow-[0_0_15px_rgba(6,182,212,0.05)] dark:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      )}
                    >
                      {parseMessageContent(msg.content, index)}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedId(`msg-${index}`);
                            setTimeout(() => setCopiedId(null), 2000);
                          }} 
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-black/50 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {copiedId === `msg-${index}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {feedback[msgId] !== 'disliked' && (
                          <button 
                            onClick={() => setFeedback(prev => ({ ...prev, [msgId]: prev[msgId] === 'liked' ? undefined : 'liked' })) as any}
                            className={cn(
                              "p-1.5 rounded transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 hover:text-cyan-500 dark:hover:text-cyan-400",
                              feedback[msgId] === 'liked' ? "text-cyan-500 dark:text-cyan-400" : "text-black/50 dark:text-white/50"
                            )} 
                            title="Like"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" fill={feedback[msgId] === 'liked' ? 'currentColor' : 'none'} />
                          </button>
                        )}
                        {feedback[msgId] !== 'liked' && (
                          <button 
                            onClick={() => {
                              if (feedback[msgId] === 'disliked') {
                                setFeedback(prev => { const n = {...prev}; delete n[msgId]; return n; });
                              } else {
                                setFeedback(prev => ({ ...prev, [msgId]: 'disliked' }));
                                setFeedbackModalOpenFor(msgId);
                                setFeedbackSelectedChips([]);
                                setFeedbackText('');
                              }
                            }}
                            className={cn(
                              "p-1.5 rounded transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 hover:text-cyan-500 dark:hover:text-cyan-400",
                              feedback[msgId] === 'disliked' ? "text-cyan-500 dark:text-cyan-400" : "text-black/50 dark:text-white/50"
                            )} 
                            title="Unlike"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" fill={feedback[msgId] === 'disliked' ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )})}

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mr-auto rounded-bl-none max-w-[50%] shadow-[0_0_15px_rgba(6,182,212,0.05)] dark:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                )}
                {/* Starter Chips */}
                {!isTyping && (
                  <div className="pt-2 flex flex-wrap gap-1.5 justify-start">
                    {STARTER_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt.text)}
                        className="text-[9px] font-medium px-2 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400 bg-white dark:bg-zinc-900 text-black/60 dark:text-white/60 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors shadow-sm cursor-pointer"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
              {feedbackModalOpenFor !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  className="absolute inset-x-4 bottom-20 z-[80] rounded-2xl shadow-xl p-4 flex flex-col border border-black/5 dark:border-white/5 bg-white dark:bg-[#161b22]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-sm text-black/80 dark:text-white/80">Share feedback</h3>
                    <button onClick={() => setFeedbackModalOpenFor(null)} className="text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 cursor-pointer transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Incorrect or incomplete', 'Not what I asked for', 'Slow or buggy', 'Style or tone', 'Safety or legal concern', 'Other'].map(chip => (
                      <button
                        key={chip}
                        onClick={() => setFeedbackSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip])}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] border transition-colors cursor-pointer",
                          feedbackSelectedChips.includes(chip)
                            ? "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-800 dark:text-cyan-200"
                            : "bg-transparent border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-cyan-50/50 hover:border-cyan-200 hover:text-cyan-800 dark:hover:bg-cyan-900/20 dark:hover:border-cyan-700 dark:hover:text-cyan-200"
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share details (optional)"
                    className="w-full h-20 bg-black/5 dark:bg-white/5 border border-transparent rounded-xl p-3 text-xs outline-none focus:border-cyan-500/30 resize-none mb-4 text-black/80 dark:text-white/80 placeholder:text-black/40 dark:placeholder:text-white/40 transition-colors"
                  />

                  <div className="flex justify-between items-center gap-4">
                    <p className="text-[10px] text-black/50 dark:text-white/50 leading-tight">
                      Your conversation will be included with your feedback to help improve Quantum Assistant.
                    </p>
                    <button
                      onClick={() => setFeedbackModalOpenFor(null)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-black/5 dark:bg-[#06090e]/80 border-t border-cyan-500/20 dark:border-cyan-500/30 flex gap-2 backdrop-blur-md"
            >
              <input
                type="text"
                placeholder="Ask about Quantum Language..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white dark:bg-black border border-black/10 dark:border-cyan-500/30 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-300 text-black dark:text-white"
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center",
                  input.trim() && !isTyping
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105"
                    : "bg-black/10 dark:bg-white/5 text-black/35 dark:text-white/30 cursor-not-allowed"
                )}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#08252e] to-[#041217] hover:from-[#0c3745] hover:to-[#08252e] text-white flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-cyan-400/40 cursor-pointer relative group p-1"
        title="Ask Quantum AI"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/20 opacity-75" style={{ animationDuration: '3s' }} />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center relative"
            >
              <Lottie 
                animationData={liveChatbotAnimation} 
                loop={true} 
                className="w-full h-full object-contain pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
