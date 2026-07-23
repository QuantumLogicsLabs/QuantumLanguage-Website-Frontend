import React from 'react';
import { Github as GithubIcon, Globe, Terminal } from 'lucide-react';
import { env } from '../config/env';

export const Community = () => (
  <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-y border-black/5 dark:border-white/5 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-12 uppercase tracking-tight">Join the Revolution</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: "GitHub Stars", value: "[403 Forbidden]" },
          { label: "Contributors", value: "1" },
          { label: "Standard Libs", value: "12+" },
          { label: "Commits", value: "800+" }
        ].map((stat, i) => (
          <div key={i}>
            <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{stat.value}</div>
            <div className="text-[10px] text-black/30 dark:text-white/30 uppercase tracking-widest font-bold">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href={env.GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <GithubIcon className="w-5 h-5" />
          <span className="font-bold">Star on GitHub</span>
        </a>
        <div className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full hidden sm:block" />
        <a href={env.DISCORD_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <Globe className="w-5 h-5" />
          <span className="font-bold">Join Discord</span>
        </a>
        <div className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full hidden sm:block" />
        <a href="#ide" className="flex items-center gap-2 text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          <Terminal className="w-5 h-5" />
          <span className="font-bold">Contribute Code</span>
        </a>
      </div>
    </div>
  </section>
);
