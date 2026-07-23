import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Code2, 
  Terminal, 
  BookOpen, 
  Download, 
  Github as GithubIcon,
  Search,
  ArrowRight,
  Sparkles,
  History,
  HelpCircle
} from 'lucide-react';
import { useGlobalSearchNavigation } from '../hooks/useGlobalSearchNavigation';
import { env } from '../config/env';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  target: string;
  type?: string;
}

const actions: ActionItem[] = [
  { icon: <Zap className="w-4 h-4" />, label: 'Features', target: 'features' },
  { icon: <Code2 className="w-4 h-4" />, label: 'Syntax', target: 'syntax' },
  { icon: <Terminal className="w-4 h-4" />, label: 'IDE', target: 'ide' },
  { icon: <BookOpen className="w-4 h-4" />, label: 'Blog', target: 'blog' },
  { icon: <HelpCircle className="w-4 h-4" />, label: 'FAQ', target: 'faq' },
  { icon: <Download className="w-4 h-4" />, label: 'Download', target: '/download', type: 'route' },
  { icon: <GithubIcon className="w-4 h-4" />, label: 'GitHub', target: env.GITHUB_REPO_URL, type: 'external' }
];

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const navigate = useNavigate();
  const listContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const normalize = (text: string) => text.trim().toLowerCase();
    const q = normalize(query);

    if (q === "") {
      return [...actions].sort((a, b) => normalize(a.label).localeCompare(normalize(b.label)));
    }

    const matched = actions.filter(a => normalize(a.label).includes(q));

    return matched.sort((a, b) => {
      const aLabel = normalize(a.label);
      const bLabel = normalize(b.label);

      const aExact = aLabel === q;
      const bExact = bLabel === q;
      if (aExact !== bExact) return aExact ? -1 : 1;

      const aStarts = aLabel.startsWith(q);
      const bStarts = bLabel.startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      const aContains = aLabel.includes(q);
      const bContains = bLabel.includes(q);
      if (aContains !== bContains) return aContains ? -1 : 1;

      return aLabel.localeCompare(bLabel);
    });
  }, [query]);

  const { navigateToSection } = useGlobalSearchNavigation();

  const handleSelect = (action: ActionItem) => {
    setQuery(action.label);
    if (action.type === 'route') {
      navigate(action.target);
    } else if (action.type === 'external') {
      window.open(action.target, '_blank');
    } else {
      navigateToSection(action.target);
    }
    onClose();
  };

  React.useEffect(() => {
    if (query.trim() === "") {
      setHighlightedIndex(-1);
      return;
    }

    if (filtered.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [query, filtered.length]);

  React.useEffect(() => {
    setQuery('');
    setHighlightedIndex(-1);
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(
        `#suggestion-item-${highlightedIndex}`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filtered.length > 0) {
          setHighlightedIndex(prev => {
            if (prev < filtered.length - 1) {
              return prev + 1;
            }
            return prev;
          });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filtered.length > 0) {
          setHighlightedIndex(prev => {
            if (prev > 0) {
              return prev - 1;
            }
            return prev;
          });
        }
      } else if (e.key === 'Enter') {
        const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          e.preventDefault();
          handleSelect(filtered[highlightedIndex]);
        } else {
          const exactMatch = filtered.find(
            item => normalize(item.label) === normalize(query)
          );
          if (exactMatch) {
            e.preventDefault();
            handleSelect(exactMatch);
          } else if (filtered.length > 0) {
            e.preventDefault();
            handleSelect(filtered[0]);
          } else {
            // Existing fallback behavior
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, highlightedIndex, onClose, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden relative z-10"
      >
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
          <Search className="w-5 h-5 text-black/40 dark:text-white/40" />
          <input 
            ref={inputRef}
            autoFocus
            placeholder="Search Quantum ecosystem... (⌘K)"
            className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-black/20 dark:placeholder:text-white/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-results-list"
            aria-activedescendant={highlightedIndex >= 0 ? `suggestion-item-${highlightedIndex}` : undefined}
          />
          <div className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded text-[10px] font-bold text-black/40 dark:text-white/40">ESC</div>
        </div>
        
        <div 
          ref={listContainerRef}
          className="max-h-[60vh] overflow-y-auto p-2"
          role="listbox"
          id="search-results-list"
        >
          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((action, i) => {
                const isHighlighted = highlightedIndex === i;
                return (
                  <button
                    key={i}
                    id={`suggestion-item-${i}`}
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(action)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors group hover:bg-black/5 dark:hover:bg-white/5 ${
                      isHighlighted ? 'bg-black/5 dark:bg-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-black/5 dark:bg-white/5 rounded-lg transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-500 ${
                        isHighlighted ? 'bg-cyan-500/10 text-cyan-500' : ''
                      }`}>
                        {action.icon}
                      </div>
                      <span className={`font-bold transition-colors text-black/70 dark:text-white/70 group-hover:text-black dark:group-hover:text-white ${
                        isHighlighted ? 'text-black dark:text-white' : ''
                      }`}>
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-all text-cyan-500 group-hover:opacity-100 group-hover:translate-x-0 ${
                      isHighlighted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                    }`} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-black/10 dark:text-white/10 mx-auto mb-4" />
              <p className="text-black/40 dark:text-white/40 font-medium">No results found for "{query}"</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><History className="w-3 h-3" /> Recent Searches</span>
          </div>
          <div className="flex gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
