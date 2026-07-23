import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, Copy, Check, Trash2, Square, Menu, Plus, ThumbsUp, ThumbsDown, MoreVertical, Pin, Pencil } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Lottie from 'lottie-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { env } from '../config/env';
import liveChatbotAnimation from '../assets/live-chatbot.json';
import ligaHistoryAnimation from '../assets/liga-history.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  pinned?: boolean;
}

const ChatbotLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("w-6 h-6", className)}
  >
    <path
      d="M5 13a7 7 0 0114 0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

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

    <circle
      cx="12"
      cy="13"
      r="2"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M12 10v-1M12 17v-1M9 13H8M16 13h-1M9.9 10.9l-.7-.7M14.1 15.1l-.7-.7M9.9 15.1l-.7.7M14.1 10.9l.7-.7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    <path
      d="M19 14.5c0 3-2 3.5-3.5 3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
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

const API_BASE = env.API_URL;

export const ChatAssistant = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const INITIAL_WELCOME_CONTENT = `### Welcome to Quantum AI Assistant!
I'm here to help you learn and build applications using the **Quantum Language**.

Here is what you can ask me about:
* **Architecture & Internals**: Two execution paths (compile + bundle vs direct interpretation), compiler stack, and stack-based VM call frames.
* **Multi-Syntax & Language Features**: Combining Python, JS, and C/C++ syntax in a single file, closures, OOP with inheritance, exception handling, and pointers.
* **Standard Library & Crypto**: Over 200 native functions, including hashing (SHA-256/1, MD5), encryption (AES-128 ECB), rot13, base64, Shannon entropy, and file I/O.
* **Build & CLI Tools**: Running the REPL, running tests, compiling with \`quantum.exe\`, and using the \`qrun.exe\` interpreter.

Select a quick prompt below or type your questions directly!`;

  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [sessions, setSessions] = React.useState<ChatSession[]>(() => {
    const saved = sessionStorage.getItem('quantum_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    const legacySaved = sessionStorage.getItem('quantum_chat_history');
    if (legacySaved) {
      try {
        const legacyMessages = JSON.parse(legacySaved);
        return [{ id: 'legacy', title: 'Default Chat', messages: legacyMessages, updatedAt: Date.now() }];
      } catch (e) { }
    }
    return [
      {
        id: 'default',
        title: 'Default Chat',
        messages: [
          {
            role: 'assistant',
            content: INITIAL_WELCOME_CONTENT
          }
        ],
        updatedAt: Date.now()
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = React.useState<string>(() => {
    const savedId = sessionStorage.getItem('quantum_chat_active_id');
    return savedId || (sessions.length > 0 ? sessions[0].id : 'default');
  });

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isFallbackMode, setIsFallbackMode] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Record<string, 'liked' | 'disliked' | null>>({});
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = React.useState<string | null>(null);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [selectedReasons, setSelectedReasons] = React.useState<string[]>([]);
  const [contextMenuId, setContextMenuId] = React.useState<string | null>(null);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');

  const streamingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setIsTyping(false);
    setIsStreaming(false);
  };

  React.useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  const handleNewChat = () => {
    handleStop();
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Chat ${sessions.length + 1}`,
      messages: [
        {
          role: 'assistant',
          content: INITIAL_WELCOME_CONTENT
        }
      ],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = (id: string) => {
    handleStop();

    let nextActiveId = activeSessionId;
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      nextActiveId = remaining.length > 0 ? remaining[0].id : 'default';
    }

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: 'default',
            title: 'Default Chat',
            messages: [
              {
                role: 'assistant',
                content: INITIAL_WELCOME_CONTENT
              }
            ],
            updatedAt: Date.now()
          }
        ];
      }
      return filtered;
    });

    setActiveSessionId(nextActiveId);
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, title: newTitle.trim() } : s
    ));
    setRenamingId(null);
    setRenameValue('');
  };

  const handlePinSession = (id: string) => {
    setSessions(prev => prev.map(s =>
      s.id === id ? { ...s, pinned: !s.pinned } : s
    ));
    setContextMenuId(null);
  };

  const updateActiveSessionMessages = (newMessages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        let newTitle = s.title;
        if ((s.title.startsWith('Chat ') || s.title === 'Default Chat') && s.messages.filter(m => m.role === 'user').length === 0) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            newTitle = firstUserMsg.content.split(' ').slice(0, 5).join(' ');
            if (firstUserMsg.content.split(' ').length > 5) newTitle += '...';
          }
        }
        return { ...s, messages: newMessages, title: newTitle, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping || isStreaming) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    const nextMessages = [...messages, userMessage];
    updateActiveSessionMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextMessages
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsTyping(false);
        setIsStreaming(true);

        const fullMessage = data.message;
        const words = fullMessage.split(/(\s+)/);
        let currentWordIndex = 0;
        let currentText = '';

        updateActiveSessionMessages([...nextMessages, { role: 'assistant', content: '' }]);

        const interval = setInterval(() => {
          if (currentWordIndex < words.length) {
            currentText += words[currentWordIndex];
            currentWordIndex++;
            setSessions(prev => prev.map(s => {
              if (s.id === activeSessionId) {
                const copy = [...s.messages];
                copy[copy.length - 1] = { role: 'assistant', content: currentText };
                return { ...s, messages: copy };
              }
              return s;
            }));
          } else {
            if (streamingIntervalRef.current) {
              clearInterval(streamingIntervalRef.current);
              streamingIntervalRef.current = null;
            }
            setIsStreaming(false);
          }
        }, 12);
        streamingIntervalRef.current = interval;

        setIsFallbackMode(Boolean(data.isFallback));
      } else {
        updateActiveSessionMessages([...nextMessages, {
          role: 'assistant',
          content: `❌ Error: ${data.error || 'Failed to fetch response from backend.'}`
        }]);
        setIsTyping(false);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch request aborted');
        return;
      }
      console.error('Chat API request failed:', error);
      updateActiveSessionMessages([...nextMessages, {
        role: 'assistant',
        content: `❌ Connection Error: Make sure the Quantum backend server is running at ${API_BASE}.`
      }]);
      setIsTyping(false);
    } finally {
      abortControllerRef.current = null;
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

    const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

    return parts.flatMap((part, partIdx) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
        const language = match ? match[1] : 'javascript';
        const code = match ? match[2] : part;
        const codeBlockId = `${messageIndex}-${partIdx}`;

        return (
          <div key={partIdx} className="my-4 rounded-[20px] bg-[#22242b] font-mono text-xs text-left shadow-lg relative p-4 pt-10 border border-zinc-800/30">
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(code, codeBlockId)}
              className="absolute top-3.5 right-4 flex items-center gap-1 text-zinc-500 hover:text-cyan-400 transition-colors cursor-pointer text-[10px]"
            >
              {copiedId === codeBlockId ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <div className="overflow-x-auto custom-scrollbar">
              <SyntaxHighlighter
                language={language === 'sa' ? 'javascript' : language || 'javascript'}
                style={atomDark}
                customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '12px', lineHeight: '1.6' }}
              >
                {code.trim()}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      const lines = part.split('\n');
      const renderedElements: React.ReactNode[] = [];
      let i = 0;

      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
          renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
          i++;
          continue;
        }

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const tableLines: string[] = [];
          while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
            tableLines.push(lines[i].trim());
            i++;
          }

          if (tableLines.length > 0) {

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

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const listItems: string[] = [];
          while (i < lines.length && (lines[i].trim().startsWith('* ') || lines[i].trim().startsWith('- '))) {
            listItems.push(lines[i].trim().substring(2));
            i++;
          }

          renderedElements.push(
            <ul key={`ul-${i}`} className="my-3 space-y-2 text-xs">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed flex items-start gap-2 text-black/85 dark:text-white/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  <span>{renderTextWithInlineFormatting(item)}</span>
                </li>
              ))}
            </ul>
          );
          continue;
        }

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
            <ol key={`ol-${i}`} className="my-3 space-y-2 text-xs">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed flex items-start gap-2 text-black/85 dark:text-white/90">
                  <span className="font-mono font-bold text-[9px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20 px-1.5 py-0.5 rounded-md min-w-[18px] text-center shrink-0">
                    {itemIdx + 1}
                  </span>
                  <span className="mt-0.5">{renderTextWithInlineFormatting(item)}</span>
                </li>
              ))}
            </ol>
          );
          continue;
        }

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[calc(100vh-140px)] rounded-2xl flex flex-col overflow-hidden border mb-4 transition-all duration-300 relative",
              theme === 'dark'
                ? "glass-dark text-white border-cyan-400/40 shadow-[0_8px_32px_rgba(6,182,212,0.3)]"
                : "glass text-black border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.2)]"
            )}
          >
            <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  title="Chat history"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="p-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-500/30 dark:hover:border-cyan-400/30 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center justify-center transition-all cursor-pointer"
                >
                  <Menu className="w-5 h-5" />
                </motion.button>
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Lottie
                    animationData={liveChatbotAnimation}
                    loop={true}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#27c93f] border-2 border-white dark:border-zinc-950 animate-pulse shadow-sm" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 leading-none mb-1">QUANTUM ASSISTANT</h3>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono leading-none">Bytecode VM v2.0.0</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  type="button"
                  onClick={handleNewChat}
                  title="New chat"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-500/30 dark:hover:border-cyan-400/30 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close assistant"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-red-500/30 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.15)] flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>            {}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-y-0 left-0 w-56 backdrop-blur-2xl border-r z-40 flex flex-col p-3 shadow-2xl transition-all duration-300",
                    theme === 'dark'
                      ? "bg-zinc-950/90 border-cyan-500/20 text-white shadow-cyan-500/5"
                      : "bg-white/90 border-black/10 text-black shadow-black/5"
                  )}
                  onClick={() => setContextMenuId(null)}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6">
                        <Lottie
                          animationData={ligaHistoryAnimation}
                          loop={true}
                          className="w-full h-full pointer-events-none"
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">History</span>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
                      title="Close history"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-red-500/30 rounded-lg text-black/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:shadow-[0_0_8px_rgba(239,68,68,0.15)] flex items-center justify-center transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {[...sessions].sort((a, b) => {
                      if (a.pinned && !b.pinned) return -1;
                      if (!a.pinned && b.pinned) return 1;
                      return b.updatedAt - a.updatedAt;
                    }).map(s => {
                      const isActive = s.id === activeSessionId;
                      return (
                        <motion.div
                          key={s.id}
                          whileHover={{ x: 2 }}
                          className={cn(
                            "group relative flex items-center gap-2 rounded-xl p-2 transition-all cursor-pointer text-[11px] border",
                            isActive
                              ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-600 dark:text-cyan-400 font-semibold shadow-sm"
                              : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/5 dark:hover:border-white/5 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                          )}
                        >
                          {renamingId === s.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleRenameSession(s.id, renameValue);
                              }}
                              className="flex-1 flex gap-1"
                            >
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => handleRenameSession(s.id, renameValue)}
                                autoFocus
                                className="flex-1 bg-black/5 dark:bg-white/5 border border-cyan-500/30 rounded-lg px-1.5 py-0.5 text-[10px] outline-none text-black/80 dark:text-white/80"
                              />
                            </form>
                          ) : (
                            <>
                              {s.pinned && (
                                <Pin className="w-3 h-3 text-cyan-500 shrink-0 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]" />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSessionId(s.id);
                                  setIsHistoryOpen(false);
                                }}
                                className="flex-1 text-left truncate font-medium pr-1 cursor-pointer"
                              >
                                {s.title}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContextMenuId(contextMenuId === s.id ? null : s.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 hover:text-cyan-500 transition-all p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-black/40 dark:text-white/40"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <AnimatePresence>
                            {contextMenuId === s.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-2 top-full mt-1 z-50 w-28 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden py-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingId(s.id);
                                    setRenameValue(s.title);
                                    setContextMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-black/70 dark:text-white/70 hover:bg-cyan-500/10 hover:text-cyan-500 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                                >
                                  <Pencil className="w-3 h-3" /> Rename
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePinSession(s.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-black/70 dark:text-white/70 hover:bg-cyan-500/10 hover:text-cyan-500 dark:hover:text-cyan-400 cursor-pointer transition-colors"
                                >
                                  <Pin className="w-3 h-3" /> {s.pinned ? 'Unpin' : 'Pin'}
                                </button>
                                <div className="h-px bg-black/5 dark:bg-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteSession(s.id);
                                    setContextMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-2 border-t border-black/5 dark:border-white/5 text-[9px] font-mono text-black/40 dark:text-white/40 flex items-center justify-between">
                    <span>Chats: {sessions.length}</span>
                    <span>v2.0.0</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>            {}
            {isFallbackMode && (
              <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2 flex items-start gap-2 text-[10px] text-cyan-600 dark:text-cyan-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-normal">
                  Running in **local fallback mode**. Create a `.env` in the backend and add `GROQ_API_KEY` or `GEMINI_API_KEY` for live AI chat.
                </span>
              </div>
            )}

            <div className="flex-1 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-zinc-950 to-transparent pointer-events-none z-10 opacity-70" />

              <div className={cn(
                "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-6",
                theme === 'dark' ? "cyber-grid bg-zinc-950/30" : "cyber-grid-light bg-slate-50/30"
              )}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSessionId}
                    initial={{ opacity: 0, x: -15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 15, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    {messages.map((msg, index) => {
                      const msgId = `${activeSessionId}-${index}`;
                      const isCopied = copiedId === `msg-${index}`;

                      return (
                        <div key={index} className="flex flex-col space-y-1">
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className={cn(
                              "flex flex-col max-w-[85%] px-4 py-3 text-xs shadow-sm transition-all duration-200",
                              msg.role === 'user'
                                ? "ml-auto bg-[#cffafe] dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-400/40 text-cyan-950 dark:text-cyan-50 rounded-2xl rounded-br-none shadow-[0_4px_12px_rgba(6,182,212,0.06)] hover:bg-[#bbf7f9] dark:hover:bg-cyan-500/30"
                                : "mr-auto bg-[#f8fafc] dark:bg-[#161b22] border border-slate-200/80 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl rounded-bl-none shadow-sm"
                            )}
                          >
                            {parseMessageContent(msg.content, index)}
                          </motion.div>

                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 text-zinc-400 dark:text-zinc-500 mr-auto transition-opacity duration-200">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  setCopiedId(`msg-${index}`);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                                title="Copy message"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              {feedback[msgId] !== 'disliked' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFeedback(prev => ({
                                      ...prev,
                                      [msgId]: prev[msgId] === 'liked' ? null : 'liked'
                                    }));
                                  }}
                                  className={cn(
                                    "hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer",
                                    feedback[msgId] === 'liked' && "text-cyan-500 dark:text-cyan-400"
                                  )}
                                  title="Like message"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" fill={feedback[msgId] === 'liked' ? "currentColor" : "none"} />
                                </button>
                              )}

                              {feedback[msgId] !== 'liked' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (feedback[msgId] === 'disliked') {
                                      setFeedback(prev => {
                                        const copy = { ...prev };
                                        delete copy[msgId];
                                        return copy;
                                      });
                                    } else {
                                      setActiveFeedbackMsgId(msgId);
                                      setSelectedReasons([]);
                                      setFeedbackText("");
                                    }
                                  }}
                                  className={cn(
                                    "hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer",
                                    feedback[msgId] === 'disliked' && "text-red-500 dark:text-red-400"
                                  )}
                                  title="Dislike message"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" fill={feedback[msgId] === 'disliked' ? "currentColor" : "none"} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 p-3 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/5 mr-auto rounded-bl-none max-w-[50%]"
                      >
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </motion.div>
                    )}

                    {!isTyping && !isStreaming && (
                      <div className="pt-2 flex flex-wrap gap-1.5 justify-start">
                        {STARTER_PROMPTS.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSend(prompt.text)}
                            className="text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 bg-white dark:bg-zinc-900 text-black/60 dark:text-white/60 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-cyan-500/5 cursor-pointer"
                          >
                            {prompt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent pointer-events-none z-10 opacity-70" />
            </div>

            <AnimatePresence>
              {activeFeedbackMsgId && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-x-3 bottom-16 z-[60] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl border border-black/10 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs text-black/80 dark:text-white/80 uppercase tracking-wider">Share feedback</h3>
                    <button
                      type="button"
                      onClick={() => setActiveFeedbackMsgId(null)}
                      className="text-black/40 dark:text-white/40 hover:text-black/80 dark:hover:text-white/80 cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Incorrect or incomplete',
                      'Not what I asked for',
                      'Slow or buggy',
                      'Style or tone',
                      'Safety or legal concern',
                      'Other'
                    ].map(chip => {
                      const isSelected = selectedReasons.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setSelectedReasons(prev =>
                              prev.includes(chip)
                                ? prev.filter(c => c !== chip)
                                : [...prev, chip]
                            );
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] border transition-colors cursor-pointer",
                            isSelected
                              ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400"
                              : "bg-transparent border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-cyan-500/30"
                          )}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share details (optional)"
                    className="w-full h-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-2 text-xs outline-none focus:border-cyan-500/30 resize-none text-black/80 dark:text-white/80 placeholder:text-black/30 dark:placeholder:text-white/30 transition-colors"
                  />

                  <div className="bg-black/5 dark:bg-white/5 rounded-xl p-2.5 text-[10px] text-black/60 dark:text-white/65 leading-relaxed font-sans">
                    Your conversation will be included with your feedback to help improve Quantum Assistant.
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(prev => ({
                          ...prev,
                          [activeFeedbackMsgId]: 'disliked'
                        }));
                        setActiveFeedbackMsgId(null);
                        setFeedbackText("");
                        setSelectedReasons([]);
                      }}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full text-xs font-semibold shadow-md shadow-cyan-500/10 transition-colors cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 border-t border-black/10 dark:border-white/10 bg-transparent">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isTyping || isStreaming) {
                    handleStop();
                  } else {
                    handleSend(input);
                  }
                }}
                className="relative flex items-center bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-2xl shadow-inner focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all duration-200 pl-3 pr-1.5 py-1.5"
              >
                <input
                  type="text"
                  placeholder={
                    isTyping
                      ? "AI is thinking... click stop to cancel"
                      : isStreaming
                        ? "AI is writing... click stop to cancel"
                        : "Ask about Quantum Language..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none text-xs text-black dark:text-white pr-2 py-1 placeholder:text-black/40 dark:placeholder:text-white/30"
                />
                {isTyping || isStreaming ? (
                  <motion.button
                    type="button"
                    onClick={handleStop}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="p-2 rounded-xl transition-all cursor-pointer bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center"
                    title="Stop generating"
                  >
                    <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={!input.trim()}
                    whileHover={input.trim() ? { scale: 1.08 } : {}}
                    whileTap={input.trim() ? { scale: 0.92 } : {}}
                    className={cn(
                      "p-2 rounded-xl transition-all cursor-pointer group flex items-center justify-center border",
                      input.trim()
                        ? "bg-cyan-400 text-black border-cyan-300/50 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                        : "bg-black/5 dark:bg-white/5 border-transparent text-black/35 dark:text-white/30 cursor-not-allowed"
                    )}
                  >
                    <Send className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-[10deg] group-hover:scale-105" />
                  </motion.button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

