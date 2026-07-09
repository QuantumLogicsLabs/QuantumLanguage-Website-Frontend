import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CodeShowcase } from './components/CodeShowcase';
import { QuantumIDE } from './components/QuantumIDE';
import { Roadmap } from './components/Roadmap';
import { Community } from './components/Community';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollProgress } from './components/ScrollProgress';
import { ScrollToTop } from './components/ScrollToTop';
import { DownloadPage } from './components/DownloadPage';
import { LanguageComparison } from './components/LanguageComparison';
import { SyntaxVersatility } from './components/SyntaxVersatility';
import { StandardLibrary } from './components/StandardLibrary';
import { Vision } from './components/Vision';
// import { Blog } from './components/Blog';
import { Ecosystem } from './components/Ecosystem';
import { Installation } from './components/Installation';
import { Newsletter } from './components/Newsletter';
import { ChatAssistant } from './components/ChatAssistant';

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ErrorBoundary>
      <div className="noise" />
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-cyan-500 selection:text-black transition-colors duration-300 relative">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes location={pathname} key={pathname}>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Hero onNavigate={(page) => {
                    if (page === 'download') {
                      navigate('/download');
                    }
                  }} />
                  <Features />
                  <LanguageComparison />
                  <SyntaxVersatility />
                  <QuantumIDE />
                  <StandardLibrary />
                  <Vision />
                  {/* <Blog /> */}
                  <Roadmap />
                  <Ecosystem />
                  <FAQ />
                  <Community />
                  <CodeShowcase />
                  <Installation />
                  <Newsletter />
                </motion.div>
              } />
              <Route path="/download" element={
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DownloadPage />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <ScrollProgress />
        <ScrollToTop />
        <ChatAssistant />
        <CustomCursor />
      </div>
    </ErrorBoundary>
  );
}
