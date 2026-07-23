import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Github as GithubIcon, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CommandPalette } from './CommandPalette';
import { env } from '../config/env';

export const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    if (pathname === '/') {
      // Already on homepage — just smooth-scroll with navbar offset
      const el = document.getElementById(target);
      if (el) {
        const navbarHeight = 64;
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      // On a sub-page — navigate to homepage with hash; App.tsx will scroll after render
      navigate(`/#${target}`);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/quantum.png" alt="Quantum Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            <span className="font-mono font-bold text-xl tracking-tighter text-black dark:text-white uppercase">QUANTUM</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60 dark:text-white/60">
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Features</a>
            <a href="#syntax" onClick={(e) => handleNavClick(e, 'syntax')} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Syntax</a>
            <a href="#ide" onClick={(e) => handleNavClick(e, 'ide')} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">IDE</a>
            <a href="#blog" onClick={(e) => handleNavClick(e, 'blog')} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Blog</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">FAQ</a>
            <a href={env.GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              <GithubIcon className="w-4 h-4" /> GitHub
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
            >
              <Search className="w-4 h-4 group-hover:text-cyan-500 transition-colors" />
              <span className="text-xs font-medium">Search...</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/10">⌘K</span>
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-black/60 dark:text-white/60"
            >
              <Search className="w-4 h-4" />
            </button>
            <ThemeToggle />
            <Link 
              to="/download"
              className="hidden sm:block bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-cyan-500 dark:hover:bg-cyan-400 transition-colors"
            >
              Get Started
            </Link>
            <motion.button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="md:hidden w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-cyan-500/30 dark:hover:border-cyan-400/30 text-black/60 dark:text-white/60 hover:text-cyan-500 dark:hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isMenuOpen ? 'close' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-zinc-900 border-b border-black/10 dark:border-white/10 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-lg font-bold hover:text-cyan-500 transition-colors">Features</a>
                <a href="#syntax" onClick={(e) => handleNavClick(e, 'syntax')} className="text-lg font-bold hover:text-cyan-500 transition-colors">Syntax</a>
                <a href="#ide" onClick={(e) => handleNavClick(e, 'ide')} className="text-lg font-bold hover:text-cyan-500 transition-colors">IDE</a>
                <a href="#blog" onClick={(e) => handleNavClick(e, 'blog')} className="text-lg font-bold hover:text-cyan-500 transition-colors">Blog</a>
                <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-lg font-bold hover:text-cyan-500 transition-colors">FAQ</a>
                <Link to="/download" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-cyan-500">Download</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
