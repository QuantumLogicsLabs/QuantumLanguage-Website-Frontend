const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

let activeConnection = null;
let activeProcess = null;

// Re-using your exact engine path resolution logic from server.js
function resolveQrunPath() {
    const candidates = [
        process.env.QRUN_PATH,
        path.resolve(__dirname, '..', '..', 'QuantumLanguage', 'qrun.exe'),
        path.resolve(__dirname, '..', '..', 'QuantumLanguage', 'qrun.bat'),
        path.join(process.cwd(), 'qrun.exe'),
        path.join(process.cwd(), 'qrun.bat'),
    ].filter(Boolean);

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    console.log("🟢 WebSocket Server initialized for Live Execution");

    wss.on('connection', (ws) => {
        // Enforce Single Session Only
        if (activeConnection) activeConnection.close();
        activeConnection = ws;

        ws.send(JSON.stringify({ type: 'status', payload: 'Connected to Quantum Execution Engine' }));

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                switch (data.type) {
                    case 'run':
                        // Kill any previously running code to free up memory
                        if (activeProcess) {
                            activeProcess.kill();
                            activeProcess = null;
                        }

                        ws.send(JSON.stringify({ type: 'status', payload: 'Compiling script...' }));

                        // Create a secure temporary file for the code
                        const fileHash = crypto.randomBytes(8).toString('hex');
                        const tempFilePath = path.join(process.cwd(), `sandbox_${fileHash}.sa`);

                        fs.writeFile(tempFilePath, data.payload, (err) => {
                            if (err) {
                                ws.send(JSON.stringify({ type: 'stderr', payload: '\x1b[31mSystem Error: Failed to allocate sandbox space.\x1b[0m\r\n' }));
                                ws.send(JSON.stringify({ type: 'process_completion' }));
                                return;
                            }

                            const qrunPath = resolveQrunPath();
                            if (!qrunPath) {
                                ws.send(JSON.stringify({ type: 'stderr', payload: '\x1b[31mExecution engine (qrun) not found in backend.\x1b[0m\r\n' }));
                                ws.send(JSON.stringify({ type: 'process_completion' }));
                                fs.unlink(tempFilePath, () => {});
                                return;
                            }

                            ws.send(JSON.stringify({ type: 'status', payload: 'Executing...' }));

                            // ⚡ REAL LIVE EXECUTION ⚡
                            activeProcess = spawn(qrunPath, [tempFilePath]);

                            // Stream Live stdout to frontend terminal
                            activeProcess.stdout.on('data', (outputData) => {
                                // Xterm requires \r\n for proper line breaks
                                const text = outputData.toString().replace(/\n/g, '\r\n');
                                ws.send(JSON.stringify({ type: 'stdout', payload: text }));
                            });

                            // Stream Live stderr to frontend terminal
                            activeProcess.stderr.on('data', (errorData) => {
                                const text = errorData.toString().replace(/\n/g, '\r\n');
                                ws.send(JSON.stringify({ type: 'stderr', payload: text }));
                            });

                            // Handle Process Completion
                            activeProcess.on('close', (code) => {
                                // Clean up the sandbox file
                                fs.unlink(tempFilePath, () => {});
                                activeProcess = null;
                                ws.send(JSON.stringify({ type: 'process_completion' }));
                            });
                        });
                        break;

                    case 'input':
                        // Stream user keystrokes from the frontend directly into the running terminal
                        if (activeProcess && activeProcess.stdin) {
                            activeProcess.stdin.write(data.payload);
                        }
                        break;

                    case 'stop':
                        if (activeProcess) {
                            activeProcess.kill();
                            activeProcess = null;
                            ws.send(JSON.stringify({ type: 'status', payload: '\x1b[31mProcess terminated by user.\x1b[0m' }));
                            ws.send(JSON.stringify({ type: 'process_completion' }));
                        }
                        break;
                }
            } catch (err) {
                console.error("WebSocket Error:", err);
            }
        });

        ws.on('close', () => {
            if (activeProcess) {
                activeProcess.kill();
                activeProcess = null;
            }
            if (activeConnection === ws) activeConnection = null;
        });
    });

    return wss;
}

module.exports = { setupWebSocket };