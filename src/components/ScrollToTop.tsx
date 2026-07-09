import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / height) * 100;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 z-[60] p-4 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-full shadow-2xl group hover:scale-110 transition-transform"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-black/5 dark:stroke-white/5 stroke-[4]"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="fill-none stroke-cyan-500 stroke-[4] transition-all duration-300"
              style={{
                strokeDasharray: '283',
                strokeDashoffset: 283 - (283 * scrollProgress) / 100
              }}
            />
          </svg>
          <ArrowUp className="w-5 h-5 text-black dark:text-white group-hover:text-cyan-500 transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
