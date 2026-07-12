import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  const [messages, setMessages] = React.useState<Message[]>(() => {
    const saved = sessionStorage.getItem('quantum_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [
      {
        role: 'assistant',
        content: `### Welcome to Quantum AI Assistant!
I'm here to help you learn and build applications using the **Quantum Language**.

Here is what you can ask me about:
* **Architecture & Internals**: Two execution paths (compile + bundle vs direct interpretation), compiler stack, and stack-based VM call frames.
* **Multi-Syntax & Language Features**: Combining Python, JS, and C/C++ syntax in a single file, closures, OOP with inheritance, exception handling, and pointers.
* **Standard Library & Crypto**: Over 200 native functions, including hashing (SHA-256/1, MD5), encryption (AES-128 ECB), rot13, base64, Shannon entropy, and file I/O.
* **Build & CLI Tools**: Running the REPL, running tests, compiling with \`quantum.exe\`, and using the \`qrun.exe\` interpreter.

Select a quick prompt below or type your questions directly!`
      }
    ];
  });

  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isFallbackMode, setIsFallbackMode] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    sessionStorage.setItem('quantum_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        setIsFallbackMode(Boolean(data.isFallback));
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ Error: ${data.error || 'Failed to fetch response from backend.'}` 
        }]);
      }
    } catch (error) {
      console.error('Chat API request failed:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Connection Error: Make sure the Quantum backend server is running at ${API_BASE}.` 
      }]);
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
          <div key={partIdx} className="my-4 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-black/5 dark:bg-[#06090e] font-mono text-xs text-left shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/5 text-[9px] text-black/50 dark:text-white/40 uppercase font-bold tracking-wider">
              <span>{language || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(code, codeBlockId)}
                className="flex items-center gap-1 hover:text-cyan-500 transition-colors cursor-pointer"
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
            </div>
            <div className="p-3 overflow-x-auto custom-scrollbar">
              <SyntaxHighlighter
                language={language === 'sa' ? 'javascript' : language || 'javascript'}
                style={theme === 'dark' ? atomDark : undefined}
                customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '11px', lineHeight: '1.6' }}
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-[calc(100vw-2rem)] sm:w-96 h-[520px] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-black/10 dark:border-white/10 mb-4",
              theme === 'dark' 
                ? "bg-black/90 backdrop-blur-xl text-white" 
                : "bg-white/95 backdrop-blur-xl text-black"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ChatbotLogo className="w-5 h-5 text-cyan-500" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-black animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Quantum Assistant</h3>
                  <span className="text-[9px] text-black/40 dark:text-white/40 font-mono">Bytecode VM v2.0.0</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-black/50 dark:text-white/50 hover:text-red-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm",
                    msg.role === 'user'
                      ? "ml-auto bg-cyan-500/10 border border-cyan-500/20 text-cyan-900 dark:text-cyan-100 rounded-br-none"
                      : "mr-auto bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-bl-none"
                  )}
                >
                  {parseMessageContent(msg.content, index)}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 mr-auto rounded-bl-none max-w-[50%]">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
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
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about Quantum Language..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-500 transition-colors text-black dark:text-white"
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className={cn(
                  "p-2 rounded-xl transition-all cursor-pointer",
                  input.trim() && !isTyping
                    ? "bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105"
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
        className="w-12 h-12 rounded-full bg-[#08252e] hover:bg-[#0c3745] text-white flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-500/30 cursor-pointer relative"
        title="Ask Quantum AI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <ChatbotLogo className="w-6 h-6 text-white" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-cyan-400 dark:text-cyan-300 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
