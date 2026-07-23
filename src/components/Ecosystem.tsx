import React from 'react';
import { BookOpen, Activity, ChevronRight } from 'lucide-react';
import { env } from '../config/env';

export const Ecosystem = () => (
  <section id="ecosystem" className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-black/5 dark:border-white/5 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-4 uppercase">The Quantum Ecosystem</h2>
        <p className="text-black/50 dark:text-white/50 max-w-2xl mx-auto">
          Quantum is more than just a language. It's a suite of tools designed to simplify 
          development, documentation, and deployment.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <BookOpen className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">Code Explanation</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">QuantumLangCodeExplaination</p>
            </div>
          </div>
          <p className="text-black/50 dark:text-white/50 mb-6">
            A deep-dive repository that breaks down the compiler architecture, VM internals, 
            and standard library implementation for contributors and power users.
          </p>
          <a href={env.GITHUB_CODE_EXPLANATION_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 transition-colors">
            Explore Documentation <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="p-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity className="text-purple-600 dark:text-purple-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">Docs Syncer</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">Quantum-Docs-Syncer</p>
            </div>
          </div>
          <p className="text-black/50 dark:text-white/50 mb-6">
            An automated tool that ensures the documentation is always in sync with the 
            latest language changes, providing real-time updates for developers.
          </p>
          <a href={env.GITHUB_DOCS_SYNCER_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-2 transition-colors">
            View on GitHub <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </section>
);
