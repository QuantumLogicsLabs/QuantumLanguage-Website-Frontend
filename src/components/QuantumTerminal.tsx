import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import { socketManager } from '../socket/socketManager';

export default function QuantumTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the div isn't ready, don't try to draw
    if (!terminalRef.current) return;

    // 1. Initialize the UI Terminal
    const term = new Terminal({
      theme: { background: 'transparent' },
      cursorBlink: true,
      fontFamily: 'Consolas, monospace',
      fontSize: 13,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    // 2. Delay the fit calculation so Tailwind has time to paint the layout
    const timeoutId = setTimeout(() => {
      try {
        fitAddon.fit();
        term.writeln('\x1b[36m➜\x1b[0m Welcome to the Quantum IDE Terminal...');
        term.writeln('\x1b[90m➜ Connecting to execution engine...\x1b[0m\r\n');
      } catch (err) {
        // Silently ignore if it unmounts before fitting
      }
    }, 100);

    // 3. Start the WebSocket Connection
    socketManager.connect();

    // 4. Pipe Backend Output -> Frontend Terminal UI
    socketManager.onOutputReceived = (text: string) => {
      term.write(text);
    };

    // 5. Pipe Frontend Keyboard Input -> Backend Server
    term.onData((data) => {
      socketManager.sendInput(data);
      term.write(data);
    });

    // 6. Handle dynamic window resizing seamlessly
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch (err) {}
    });
    resizeObserver.observe(terminalRef.current);

    // 7. Proper React Cleanup (Fixes the blank screen bug!)
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      socketManager.disconnect(); // <--- Added this line to kill the ghost socket
      socketManager.onOutputReceived = null;
      term.dispose(); // Destroys the canvas so it can cleanly rebuild
    };
  }, []);

  return (
    // We use relative/absolute positioning to force the terminal canvas to map perfectly to your UI block
    <div className="relative w-full h-full min-h-[160px]">
      <div 
        ref={terminalRef} 
        className="absolute inset-0 px-2 pt-1" 
        style={{ overflow: 'hidden' }}
      />
    </div>
  );
}