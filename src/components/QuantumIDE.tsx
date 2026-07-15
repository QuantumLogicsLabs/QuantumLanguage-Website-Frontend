/// <reference types="vite/client" />
import QuantumTerminal from './terminal/QuantumTerminal';
import { socketManager } from '../socket/socketManager'; // Added Socket Manager Import
import React from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Cpu, Maximize2, Minimize2, Copy, Download, Save, Check, Play, 
  Folder, Plus, FileCode, Trash2, Menu, X 
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

function levenshteinDistance(left: string, right: string) {
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array(right.length + 1).fill(0);

  for (let i = 1; i <= left.length; i++) {
    current[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const substitutionCost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
    }
    for (let j = 0; j <= right.length; j++) {
      previous[j] = current[j];
    }
  }

  return previous[right.length];
}

function runKnownSample(code: string): string[] | null {
  if (code.includes('socket(') && code.includes('listen(')) {
    const portMatch = code.match(/SecureServer\(\s*(\d+)\s*\)/) || code.match(/listen\(\s*(\d+)\s*\)/);
    const port = portMatch ? portMatch[1] : '8080';
    return [`Quantum Server listening on port ${port}`];
  }

  const similarityMatch = code.match(/checkSimilarity\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/);
  if (code.includes('levenshtein(') && similarityMatch) {
    const left = similarityMatch[1];
    const right = similarityMatch[2];
    const distance = levenshteinDistance(left, right);
    const score = 100 - ((distance / Math.max(left.length, right.length)) * 100);
    const formatted = Number.isInteger(score) ? String(score) : score.toFixed(1).replace(/\.0$/, '');
    return [`Similarity: ${formatted}%`];
  }

  return null;
}

export const QuantumIDE = () => {
  const { theme } = useTheme();
  const executionApiBase = import.meta.env.VITE_EXECUTION_API_URL ?? '/api';
  const starterScript = `print("Hello, Quantum!")`;
  const [files, setFiles] = React.useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('quantum_files');
    if (saved) {
      try {
        const parsedFiles = JSON.parse(saved);
        const mainFile = parsedFiles['main.sa'];
        if (typeof mainFile === 'string' && mainFile.includes('api.secure-node.io')) {
          return { ...parsedFiles, 'main.sa': starterScript };
        }
        return parsedFiles;
      } catch (e) {
        console.error('Failed to parse saved files', e);
      }
    }
    return {
      'main.sa': starterScript,
      'utils.sa': `// String distance utility
fn checkSimilarity(string s1, string s2) {
    int distance = levenshtein(s1, s2);
    int maxLength = max(s1.length(), s2.length());
    return (1.0 - (distance / maxLength)) * 100;
}

print("Similarity: " + checkSimilarity("quantum", "quantize") + "%");`,
      'server.sa': `class SecureServer {
    function init(int port) {
        this.port = port;
        this.socket = socket("tcp");
    }

    function start() {
        this.socket.bind(this.port);
        this.socket.listen(5);
        print("Quantum Server listening on port " + this.port);
    }
}

var srv = SecureServer(8080);
srv.start();`
    };
  });

  const [activeFile, setActiveFile] = React.useState(() => {
    const savedActive = localStorage.getItem('quantum_active_file');
    const savedFiles = localStorage.getItem('quantum_files');
    if (savedActive && savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        if (parsedFiles[savedActive]) return savedActive;
      } catch (e) {}
    }
    return 'main.sa';
  });
  
  const [output, setOutput] = React.useState<string[]>([]);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [newFileName, setNewFileName] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  
  const editorRef = React.useRef<HTMLTextAreaElement>(null);
  const preRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    localStorage.setItem('quantum_files', JSON.stringify(files));
  }, [files]);

  React.useEffect(() => {
    localStorage.setItem('quantum_active_file', activeFile);
  }, [activeFile]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      setFiles(prev => ({ ...prev, [activeFile]: newValue }));
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
        }
      }, 0);
    } else if (e.key === 'Enter') {
      const start = e.currentTarget.selectionStart;
      const value = e.currentTarget.value;
      const lines = value.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^\s*/)?.[0] || '';
      const extraIndent = currentLine.trim().endsWith('{') ? '    ' : '';
      if (indent || extraIndent) {
        e.preventDefault();
        const newValue = value.substring(0, start) + '\n' + indent + extraIndent + value.substring(start);
        setFiles(prev => ({ ...prev, [activeFile]: newValue }));
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 1 + indent.length + extraIndent.length;
          }
        }, 0);
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFiles(prev => ({ ...prev, [activeFile]: e.target.value }));
  };

  const saveFiles = () => {
    setIsSaving(true);
    localStorage.setItem('quantum_files', JSON.stringify(files));
    setTimeout(() => setIsSaving(false), 1000);
  };

  const runCode = async () => {
    setIsExecuting(true);
    const codeContent = files[activeFile] || '';

    // --- NEW WEBSOCKET INTEGRATION ---
    // Triggers the WebSocket connection instead of the HTTP fetch
    socketManager.runScript(codeContent);
    setTimeout(() => setIsExecuting(false), 500); // Visual reset for the button
    return; // Bypass the old HTTP logic below without removing it
    // ---------------------------------

    // --- OLD LOGIC PRESERVED BELOW ---
    /*
    setOutput(['Connecting to remote engine...', 'Executing code...']);
    
    const localResult = runKnownSample(codeContent);
    if (localResult) {
      setOutput(localResult);
      setIsExecuting(false);
      return;
    }
    
    // Extract the dynamic extension from the current active file (e.g., ".js", ".cpp", ".sa")
    const dynamicExt = activeFile.substring(activeFile.lastIndexOf('.'));

    try {
      const response = await fetch(`${executionApiBase}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: codeContent,
          ext: dynamicExt // Dynamically passes .js, .cpp, or .sa to your backend API
        })
      });

      const data = await response.json();

      if (data.success) {
      const finalOutput =
      data.compiledOutput ||
      data.output ||
      "Program executed with no output";

      setOutput(finalOutput.split(/\r?\n/));
    } else {
      const errorOutput =
      data.compilerError ||
      data.error ||
      "Unknown runtime error";

      setOutput(["Execution Failed:", ...errorOutput.split(/\r?\n/)]);
    }
    } catch (error) {
      setOutput([
        'Network Error: Failed to establish connection with execution backend API.',
        'Make sure your local backend is running on port 5000.'
      ]);
      console.error("Execution failed:", error);
    } finally {
      setIsExecuting(false);
    }
    */
  };

  const createFile = () => {
    if (!newFileName) return;
    
    // Check if it already has a valid allowed extension
    const hasValidExt =
    newFileName.endsWith('.sa') ||
    newFileName.endsWith('.js') ||
    newFileName.endsWith('.py') ||
    newFileName.endsWith('.cpp') ||
    newFileName.endsWith('.c');
    // If it doesn't have an extension, default to .sa
    const name = hasValidExt ? newFileName : `${newFileName}.sa`;
    
    if (files[name]) { alert('File already exists'); return; }
    
    // Put a clean default template inside depending on what type of file they make
    let defaultContent = '// New Quantum Script\n';
    if (name.endsWith('.js')) defaultContent = '// New JavaScript File\nconsole.log("Hello from JS!");\n';
    if (name.endsWith('.py')) defaultContent = '# New Python File\nprint("Hello from Python!")\n';
    if (name.endsWith('.cpp')) defaultContent = '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n';
    
    setFiles(prev => ({ ...prev, [name]: defaultContent }));
    setActiveFile(name);
    setNewFileName('');
    setIsCreateModalOpen(false);
  };

  const deleteFile = (fileName: string) => {
    if (Object.keys(files).length <= 1) { alert('Cannot delete the last file'); return; }
    const newFiles = { ...files };
    delete newFiles[fileName];
    setFiles(newFiles);
    if (activeFile === fileName) setActiveFile(Object.keys(newFiles)[0]);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([files[activeFile]], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
  };

  const lineCount = files[activeFile].split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <section id="ide" className="py-24 bg-white dark:bg-black relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-4 uppercase">Quantum Interactive IDE</h2>
          <p className="text-black/50 dark:text-white/50 max-w-2xl mx-auto">
            Experience the power of Quantum directly in your browser. 
            Test syntax, explore libraries, and see the compiler in action.
          </p>
        </div>

        <div className={cn(
          "bg-white dark:bg-[#0d1117] rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] flex flex-col transition-all duration-500",
          isFullScreen ? "fixed inset-0 z-[100] rounded-none h-screen" : "h-[600px] md:h-[800px]"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#f8fafc] dark:bg-[#161b22] border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all text-black/40 dark:text-white/40"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden sm:flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-inner" />
              </div>
              <div className="hidden sm:block h-4 w-px bg-black/10 dark:bg-white/10" />
              <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-black/40 dark:text-white/40 font-mono">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/5 dark:bg-white/5">
                  <Terminal className="w-3 h-3" />
                  <span className="hidden xs:inline text-cyan-500">quantum-cli v2.0.4</span>
                  <span className="xs:hidden text-cyan-500">v2.0.4</span>
                </div>
                <div className="hidden lg:flex items-center gap-2 px-2 py-1 rounded bg-black/5 dark:bg-white/5">
                  <Cpu className="w-3 h-3" />
                  <span>x64 JIT</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-1 mr-2">
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-md transition-all text-black/40 dark:text-white/40 hover:text-cyan-500 shadow-sm hover:shadow-md"
                  title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 md:gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(files[activeFile]);
                    const btn = document.activeElement as HTMLButtonElement;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<span class="flex items-center gap-2"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>COPIED</span>';
                    setTimeout(() => btn.innerHTML = originalText, 2000);
                  }}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
                >
                  <Copy className="w-3 h-3" />
                  COPY
                </button>
                <button 
                  onClick={downloadFile}
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
                >
                  <Download className="w-3 h-3" />
                  EXPORT
                </button>
                <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />
                <button 
                  onClick={runCode}
                  disabled={isExecuting}
                  className={cn(
                    "flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all shadow-lg shadow-cyan-500/20",
                    isExecuting 
                      ? "bg-black/10 dark:bg-white/10 text-black/40 dark:text-white/40 cursor-not-allowed" 
                      : "bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 hover:shadow-cyan-500/40"
                  )}
                >
                  <Play className={cn("w-3 h-3 fill-current", isExecuting ? "animate-pulse" : "")} />
                  {isExecuting ? 'RUNNING...' : 'RUN SCRIPT'}
                </button>
                <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />
                <button 
                  onClick={saveFiles}
                  className={cn(
                    "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    isSaving 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" 
                      : "bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 border-transparent"
                  )}
                >
                  {isSaving ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                  {isSaving ? 'SAVED' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar */}
            <div className={cn(
              "absolute md:relative inset-y-0 left-0 z-20 w-64 bg-[#f8fafc] dark:bg-[#0d1117] border-r border-black/10 dark:border-white/10 flex flex-col transition-all duration-300 shadow-2xl md:shadow-none",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:opacity-0"
            )}>
              <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Project Files</span>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all text-black/40 dark:text-white/40 hover:text-cyan-500"
                  title="New File"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                {Object.keys(files).map(file => (
                  <div key={file} className="group flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveFile(file);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left truncate",
                        activeFile === file 
                          ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" 
                          : "text-black/40 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black/60 dark:hover:text-white/60 border border-transparent"
                      )}
                    >
                      <FileCode className={cn("w-4 h-4 shrink-0", activeFile === file ? "text-cyan-500" : "text-black/20 dark:text-white/20")} />
                      <span className="truncate">{file}</span>
                    </button>
                    <button 
                      onClick={() => deleteFile(file)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-black/20 dark:text-white/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                <div className="flex items-center justify-between text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest mb-2">
                  <span>Environment</span>
                  <span className="text-green-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-black/40 dark:text-white/40">
                    <span>Memory</span>
                    <span>12.4 MB</span>
                  </div>
                  <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-cyan-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Toggle (Thin strip) */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex w-1 bg-black/5 dark:bg-white/5 hover:bg-cyan-500/20 transition-colors items-center justify-center group z-30"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <div className="w-1 h-8 bg-black/10 dark:bg-white/10 rounded-full group-hover:bg-cyan-500/50 transition-colors" />
            </button>

            {/* Editor & Terminal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex overflow-hidden relative bg-white dark:bg-[#0d1117] transition-colors duration-300">
                  {/* Line Numbers */}
                  <div className="w-10 md:w-14 bg-[#f8fafc] dark:bg-[#0d1117] border-r border-black/5 dark:border-white/5 flex flex-col items-end pt-5 pr-2 md:pr-3 select-none font-mono text-[10px] md:text-[11px] text-black/20 dark:text-white/20">
                    {lineNumbers.map(n => (
                      <div key={n} className="h-[1.6rem] leading-[1.6rem] flex items-center">
                        {n}
                      </div>
                    ))}
                  </div>
                  
                  {/* Editor Area */}
                  <div className="flex-1 relative overflow-hidden">
                    <textarea
                      ref={editorRef}
                      value={files[activeFile] || ''}
                      onChange={handleCodeChange}
                      onScroll={handleScroll}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                      aria-label="Quantum source code editor"
                      className="absolute inset-0 w-full h-full p-4 md:p-5 font-mono text-xs md:text-sm bg-transparent text-transparent caret-cyan-500 resize-none outline-none z-10 custom-scrollbar whitespace-pre overflow-auto leading-[1.6]"
                    />
                    <div 
                      ref={preRef}
                      className="absolute inset-0 p-4 md:p-5 font-mono text-xs md:text-sm pointer-events-none overflow-hidden leading-[1.6]"
                    >
                      <SyntaxHighlighter
                        language="javascript"
                        style={theme === 'dark' ? atomDark : undefined}
                        customStyle={{ 
                          background: 'transparent', 
                          padding: 0, 
                          margin: 0,
                          lineHeight: '1.6'
                        }}
                        showLineNumbers={false}
                      >
                        {files[activeFile] || ''}
                      </SyntaxHighlighter>
                    </div>
                  </div>
              </div>
              
              {/* Terminal Section (Replaced inner mapped output with QuantumTerminal) */}
              <div className="h-40 md:h-56 bg-[#f8fafc] dark:bg-black border-t border-black/10 dark:border-white/10 flex flex-col transition-colors duration-300">
                <div className="px-4 md:px-6 py-2 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Output Terminal</span>
                  </div>
                  <button 
                    onClick={() => setOutput([])} 
                    className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[10px] text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 uppercase font-bold transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>

                {/* NEW XTERM WEBSOCKET TERMINAL */}
                <div className="flex-1 w-full h-full overflow-hidden bg-transparent">
                  <QuantumTerminal files={files} activeFile={activeFile} />
                </div>

                {/* ORIGINAL FALLBACK OUTPUT (Commented out to preserve official code)
                <div className="flex-1 p-4 md:p-5 font-mono text-[10px] md:text-xs text-green-600 dark:text-green-400 overflow-auto custom-scrollbar">
                  {output.length === 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-black/30 dark:text-white/30">
                        <span className="text-cyan-500">➜</span>
                        <span>Quantum Runtime Environment [Version 2.0.4]</span>
                      </div>
                      <div className="flex items-center gap-2 text-black/20 dark:text-white/20 italic">
                        <span className="text-cyan-500">➜</span>
                        <span>Ready for execution. Click 'RUN SCRIPT' to begin...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {output.map((line, i) => (
                        <div key={i} className={cn(
                          "flex items-start gap-2",
                          line.includes('Error') ? 'text-red-500' : ''
                        )}>
                          <span className="text-cyan-500/50 shrink-0">➜</span>
                          <span className={cn(
                            line.startsWith('Compiling') || line.startsWith('Linking') || line.startsWith('Executing') 
                              ? "text-cyan-600 dark:text-cyan-400 font-bold"
                              : ""
                          )}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {isExecuting && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-cyan-500/50">➜</span>
                      <span className="w-2 h-4 bg-cyan-500 animate-pulse" />
                    </div>
                  )}
                </div>
                */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create File Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">Create New File</h3>
            <input 
              type="text"
              placeholder="filename.sa"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-black/5 dark:bg-black border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white mb-6 outline-none focus:border-cyan-500 transition-colors"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createFile()}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={createFile}
                className="flex-1 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};