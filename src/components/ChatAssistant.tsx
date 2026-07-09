import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  { text: "What is the purpose of Quantum?", label: "Purpose & VM" },
  { text: "Show me how to use pointers in Quantum", label: "Pointers & Address" },
  { text: "How do I define a class and extend it?", label: "OOP Classes" },
  { text: "Show the native crypto functions in Quantum", label: "Crypto Helpers" }
];

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

Here are some topics you can ask me about:
* **Syntax styles**: How we combine Python, JS, and C++.
* **Pointers**: How address-of (\`&\`) and dereferencing (\`*\`) work.
* **OOP**: Defining classes, methods, and using \`extends\`.
* **Standard Library**: Native crypto, math, and file functions.

Select a quick prompt below or type your questions directly!`
      }
    ];
  });

  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [isFallbackMode, setIsFallbackMode] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    sessionStorage.setItem('quantum_chat_history', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
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
        content: `❌ Connection Error: Make sure the local Quantum backend is running on port 5000.` 
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
    const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);

    return parts.map((part, partIdx) => {
      if (part.startsWith('```')) {
        const match = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
        const language = match ? match[1] : 'javascript';
        const code = match ? match[2] : part;
        const codeBlockId = `${messageIndex}-${partIdx}`;

        return (
          <div key={partIdx} className="my-3 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-black/5 dark:bg-[#06090e] font-mono text-xs text-left">
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/5 text-[9px] text-black/50 dark:text-white/40 uppercase font-bold tracking-wider">
              <span>{language || 'code'}</span>
              <button
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
            <pre className="p-3 overflow-x-auto whitespace-pre custom-scrollbar text-green-600 dark:text-green-400 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={partIdx} className="space-y-1">
          {lines.map((line, lineIdx) => {
            if (line.trim().startsWith('* ')) {
              return (
                <ul key={lineIdx} className="list-disc pl-4 my-1">
                  <li className="text-xs">{renderTextWithInlineFormatting(line.substring(2))}</li>
                </ul>
              );
            }
            if (line.trim().startsWith('### ')) {
              return (
                <h4 key={lineIdx} className="text-xs font-bold text-black dark:text-white mt-3 mb-1 uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  {renderTextWithInlineFormatting(line.substring(4))}
                </h4>
              );
            }
            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
              return (
                <p key={lineIdx} className="text-xs font-bold text-black dark:text-white mt-1">
                  {renderTextWithInlineFormatting(line.replace(/\*\*/g, ''))}
                </p>
              );
            }
            return line.trim() ? (
              <p key={lineIdx} className="text-xs leading-relaxed">
                {renderTextWithInlineFormatting(line)}
              </p>
            ) : <div key={lineIdx} className="h-1.5" />;
          })}
        </div>
      );
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
                  <Bot className="w-5 h-5 text-cyan-500" />
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
                  Running in **local fallback mode**. Create a `.env` in the backend and add `GEMINI_API_KEY` for live AI chat.
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
              <div ref={messagesEndRef} />
            </div>

            {/* Starter Chips */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex flex-wrap gap-2 justify-center">
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
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center text-black dark:text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 cursor-pointer relative"
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
              <X className="w-5 h-5 text-black" />
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
              <MessageSquare className="w-5 h-5 text-black" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-cyan-400 dark:text-cyan-300 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
