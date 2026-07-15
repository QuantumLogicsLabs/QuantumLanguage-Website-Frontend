interface ExecutionRequest {
  code: string;
}

const isDebugMode = process.env.NODE_ENV === 'development' || process.env.VITE_DEBUG === 'true';

export class QuantumSocketManager {
  private socket: WebSocket | null = null;
  public onOutputReceived: ((text: string) => void) | null = null;
  public onStatusChange: ((status: string) => void) | null = null;
  private isConnected: boolean = false;
  private pendingExecution: ExecutionRequest | null = null;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.socket = new WebSocket("ws://localhost:5000");

    this.socket.onopen = () => {
      this.isConnected = true;

      if (this.onStatusChange) this.onStatusChange("connected");
      if (isDebugMode && this.onOutputReceived) {
        this.onOutputReceived("\x1b[32m🟢 Connected to Quantum Server\x1b[0m\r\n");
      }

      // Process any pending execution request
      if (this.pendingExecution) {
        this.socket?.send(JSON.stringify({ type: "run", payload: this.pendingExecution.code }));
        this.pendingExecution = null;
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      if (this.onStatusChange) this.onStatusChange("disconnected");
      if (isDebugMode && this.onOutputReceived) {
        this.onOutputReceived("\x1b[31m🔴 Connection closed by server\x1b[0m\r\n");
      }
    };

    this.socket.onerror = (error) => {
      this.isConnected = false;
      if (this.onStatusChange) this.onStatusChange("error");
      if (isDebugMode && this.onOutputReceived) {
        this.onOutputReceived(`\x1b[31m🔴 Connection error: ${error}\x1b[0m\r\n`);
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "stdout":
          if (this.onOutputReceived) this.onOutputReceived(data.payload);
          break;
        case "stderr":
          if (this.onOutputReceived) this.onOutputReceived(`\x1b[31m${data.payload}\x1b[0m`);
          break;
        case "status":
          // Only show status messages in debug mode
          if (isDebugMode && this.onOutputReceived) {
            this.onOutputReceived(`\x1b[33m[Status]: ${data.payload}\x1b[0m\r\n`);
          }
          break;
        case "process_completion":
          // Only show process completion in debug mode
          if (isDebugMode && this.onOutputReceived) {
            this.onOutputReceived("\x1b[32m[Process Completed]\x1b[0m\r\n");
          }
          break;
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  runScript(code: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "run", payload: code }));
      return;
    }

    if (this.socket?.readyState === WebSocket.CONNECTING) {
      this.pendingExecution = { code };
      return;
    }

    // No valid connection - store pending and trigger connect
    this.pendingExecution = { code };
    this.connect();
  }

  sendInput(userInput: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "input", payload: userInput }));
    }
  }

  stopScript() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "stop" }));
    }
  }

  getIsConnected() {
    return this.isConnected;
  }

  getReadyState() {
    return this.socket?.readyState;
  }
}

export const socketManager = new QuantumSocketManager();
