import React from 'react';
import { Terminal } from 'lucide-react';
import { env } from '../config/env';

export const Installation = () => (
  <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-y border-black/5 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-cyan-500/5 to-transparent" />
    <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 uppercase tracking-tight">Ready to build?</h2>
      <p className="text-black/50 dark:text-white/50 mb-10">Clone the repository and compile the binaries to start your journey with Quantum.</p>
      
      <div className="bg-white dark:bg-black rounded-xl p-6 border border-black/10 dark:border-white/10 text-left font-mono text-sm relative group shadow-2xl transition-colors duration-300">
        <div className="flex items-center gap-2 mb-4 text-black/30 dark:text-white/30">
          <Terminal className="w-4 h-4" />
          <span>Quick Start Guide</span>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="text-cyan-500/50">1</span>
            <span className="text-black/40 dark:text-white/40"># Clone the repo</span>
          </div>
          <div className="flex gap-3 pl-6">
            <span className="text-cyan-500">$</span>
            <span className="text-black dark:text-white">git clone {env.GITHUB_REPO_URL}.git</span>
          </div>
          
          <div className="flex gap-3">
            <span className="text-cyan-500/50">2</span>
            <span className="text-black/40 dark:text-white/40"># Build from source</span>
          </div>
          <div className="flex gap-3 pl-6">
            <span className="text-cyan-500">$</span>
            <span className="text-black dark:text-white">mkdir build && cd build && cmake .. && make</span>
          </div>

          <div className="flex gap-3">
            <span className="text-cyan-500/50">3</span>
            <span className="text-black/40 dark:text-white/40"># Run your first script</span>
          </div>
          <div className="flex gap-3 pl-6">
            <span className="text-cyan-500">$</span>
            <span className="text-black dark:text-white">./quantum hello_world.sa</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-black dark:text-white">100+</div>
          <div className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest">Standard Functions</div>
        </div>
        <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-bold text-black dark:text-white">C++17</div>
          <div className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest">Core Engine</div>
        </div>
        <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-bold text-black dark:text-white">.SA</div>
          <div className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest">File Extension</div>
        </div>
      </div>
    </div>
  </section>
);
