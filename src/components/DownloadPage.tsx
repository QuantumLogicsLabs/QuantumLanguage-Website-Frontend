import React from 'react';
import { motion } from 'motion/react';
import { Globe, Terminal, Cpu, Download, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const DownloadPage = () => (
  <div className="pt-32 pb-20 min-h-screen bg-white dark:bg-black relative overflow-hidden transition-colors duration-300">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] dark:[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6 uppercase">Get Quantum</h1>
        <p className="text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto font-light">
          Deploy the Quantum runtime and compiler to your local environment. 
          High-performance execution starts here.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          { os: "Windows", icon: Globe, version: "v2.0.4", arch: "x64 / ARM64", link: "/downloads/QuantumSetup-v2.0.4-x64.exe", download: "QuantumSetup-v2.0.4-x64.exe", available: true, color: "from-blue-500/20" },
          { os: "Linux", icon: Terminal, version: "v2.0.4", arch: "x64 / ARM64 / RISC-V", link: "https://github.com/SENODROOM/Quantum-Language/releases", available: false, color: "from-orange-500/20" },
          { os: "macOS", icon: Cpu, version: "v2.0.4", arch: "Apple Silicon / Intel", link: "https://github.com/SENODROOM/Quantum-Language/releases", available: false, color: "from-purple-500/20" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all group relative overflow-hidden",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-0 hover:before:opacity-100 before:transition-opacity",
              item.color
            )}
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="text-cyan-500 dark:text-cyan-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{item.os}</h3>
              <div className="flex items-center gap-2 text-black/40 dark:text-white/40 text-sm mb-6">
                <span>{item.version}</span>
                <span className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full" />
                <span>{item.arch}</span>
              </div>
              <a
                href={item.link}
                {...(item.available
                  ? { download: item.download }
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:bg-cyan-500 dark:hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-5 h-5" /> {item.available ? "Download Installer" : "View Releases"}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
          <Terminal className="text-cyan-500 dark:text-cyan-400 w-6 h-6" /> Build from Source
        </h2>
        <div className="bg-white dark:bg-black rounded-xl p-6 border border-black/10 dark:border-white/10 font-mono text-sm text-black/80 dark:text-white/80 space-y-4 relative group">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                const text = `git clone https://github.com/SENODROOM/Quantum-Language.git\ncd Quantum-Language && mkdir build && cd build\ncmake .. && make -j$(nproc)\nsudo make install`;
                navigator.clipboard.writeText(text);
              }}
              className="text-[10px] bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 px-2 py-1 rounded text-black/60 dark:text-white/60 uppercase font-bold"
            >
              Copy All
            </button>
          </div>
          <div className="flex gap-4">
            <span className="text-cyan-500 select-none">$</span>
            <span className="text-black/80 dark:text-white/80">git clone https://github.com/SENODROOM/Quantum-Language.git</span>
          </div>
          <div className="flex gap-4">
            <span className="text-cyan-500 select-none">$</span>
            <span className="text-black/80 dark:text-white/80">cd Quantum-Language && mkdir build && cd build</span>
          </div>
          <div className="flex gap-4">
            <span className="text-cyan-500 select-none">$</span>
            <span className="text-black/80 dark:text-white/80">cmake .. && make -j$(nproc)</span>
          </div>
          <div className="flex gap-4">
            <span className="text-cyan-500 select-none">$</span>
            <span className="text-black/80 dark:text-white/80">sudo make install</span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4 text-sm text-black/40 dark:text-white/40 italic">
          <Info className="w-4 h-4" />
          <span>Requires C++17 compatible compiler (GCC 8+, Clang 7+, or MSVC 2019+)</span>
        </div>
      </motion.div>
    </div>
  </div>
);
