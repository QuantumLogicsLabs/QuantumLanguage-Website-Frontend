import React from 'react';
import { motion } from 'motion/react';
import { Package, Zap, ShieldCheck, GitBranch, Terminal as TerminalIcon, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const PackageManager = () => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'qpm' | 'npm'>('qpm');

  const installCmd = 'qpm install crypto-toolkit';

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commandMap = [
    { action: 'Install a package', npm: 'npm install <pkg>', qpm: 'qpm install <pkg>' },
    { action: 'Install everything', npm: 'npm install', qpm: 'qpm install' },
    { action: 'Remove a package', npm: 'npm uninstall <pkg>', qpm: 'qpm remove <pkg>' },
    { action: 'Init a project', npm: 'npm init', qpm: 'qpm init' },
    { action: 'Run a script', npm: 'npm run <script>', qpm: 'qpm run <script>' },
    { action: 'Publish a package', npm: 'npm publish', qpm: 'qpm publish' },
    { action: 'Manifest file', npm: 'package.json', qpm: 'quantum.json' },
    { action: 'Lockfile', npm: 'package-lock.json', qpm: 'quantum.lock' },
  ];

  const pillars = [
    {
      icon: <Zap className="w-6 h-6 text-cyan-500" />,
      title: 'Bytecode-Aware Installs',
      desc: 'QPM understands the Quantum VM, so it can cache pre-compiled bytecode alongside source — no more re-parsing dependencies on every run.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-500" />,
      title: 'Verified by Default',
      desc: 'Every package is checksummed and lockfile-pinned automatically, closing the door on the supply-chain surprises npm has taught developers to fear.',
    },
    {
      icon: <GitBranch className="w-6 h-6 text-cyan-500" />,
      title: 'One Manifest, Any Syntax',
      desc: 'Since Quantum lets you write Python-, C-, or JS-style code in one file, QPM resolves dependencies without caring which syntax dialect consumes them.',
    },
  ];

  return (
    <section id="qpm" className="py-24 bg-white dark:bg-black transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Package className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Introducing QPM</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tighter">
            The npm You Already Know<br className="hidden md:block" /> Built for Quantum
          </h2>
          <p className="text-black/50 dark:text-white/50 max-w-2xl mx-auto leading-relaxed">
            <span className="font-bold text-black dark:text-white">QPM (Quantum Package Manager)</span> is Quantum's
            native dependency manager — the direct alternative to npm, but designed from the ground up for the
            Quantum VM and its bytecode toolchain.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
            >
              <div className="mb-6 p-3 bg-white dark:bg-zinc-900 rounded-2xl w-fit shadow-lg group-hover:scale-110 transition-transform">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-black dark:text-white uppercase tracking-tight">{p.title}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed text-sm">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Terminal + comparison table */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Terminal demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl bg-zinc-950"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                <TerminalIcon className="w-3.5 h-3.5" />
                qpm
              </div>
            </div>
            <div className="p-6 font-mono text-sm space-y-3">
              <div className="flex items-center justify-between group">
                <p className="text-white/90">
                  <span className="text-cyan-400">$</span> {installCmd}
                </p>
                <button
                  onClick={handleCopy}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white/10"
                  aria-label="Copy install command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                </button>
              </div>
              <p className="text-white/40">Resolving dependencies…</p>
              <p className="text-white/40">Fetching bytecode cache for <span className="text-cyan-400">crypto-toolkit@2.1.0</span></p>
              <p className="text-white/40">Verifying checksums… <span className="text-green-400">ok</span></p>
              <p className="text-white/40">Writing quantum.lock</p>
              <p className="text-cyan-400">✓ Installed 1 package in 340ms</p>
            </div>
          </motion.div>

          {/* Comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-zinc-50 dark:bg-zinc-950"
          >
            <div className="flex border-b border-black/10 dark:border-white/10">
              {(['qpm', 'npm'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest transition-all',
                    activeTab === tab
                      ? 'bg-cyan-500 text-black'
                      : 'text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {tab === 'qpm' ? 'QPM (Quantum)' : 'npm (Node.js)'}
                </button>
              ))}
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {commandMap.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-black/50 dark:text-white/50">{row.action}</span>
                  <code className="text-sm font-mono font-bold text-black dark:text-white">
                    {activeTab === 'qpm' ? row.qpm : row.npm}
                  </code>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-black/30 dark:text-white/30 text-xs mt-10 max-w-2xl mx-auto">
          QPM is under active development as part of the Quantum roadmap. Command syntax is stabilizing and may
          change before the first stable release.
        </p>
      </div>
    </section>
  );
};
