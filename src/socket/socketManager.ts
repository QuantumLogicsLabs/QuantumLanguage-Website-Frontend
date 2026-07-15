export class QuantumSocketManager {
  private socket: WebSocket | null = null;
  public onOutputReceived: ((text: string) => void) | null = null;
  public onStatusChange: ((status: string) => void) | null = null;
  private isConnected: boolean = false;

  connect() {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = new WebSocket("ws://localhost:5000");

    this.socket.onopen = () => {
      this.isConnected = true;
      if (this.onStatusChange) this.onStatusChange("connected");
      if (this.onOutputReceived) this.onOutputReceived("\x1b[32m🟢 Connected to Quantum Server\x1b[0m\r\n");
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      if (this.onStatusChange) this.onStatusChange("disconnected");
      if (this.onOutputReceived) this.onOutputReceived("\x1b[31m🔴 Connection closed by server\x1b[0m\r\n");
    };

    this.socket.onerror = (error) => {
      this.isConnected = false;
      if (this.onStatusChange) this.onStatusChange("error");
      if (this.onOutputReceived) this.onOutputReceived(`\x1b[31m🔴 Connection error: ${error}\x1b[0m\r\n`);
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
          if (this.onOutputReceived) this.onOutputReceived(`\x1b[33m[Status]: ${data.payload}\x1b[0m\r\n`);
          break;
        case "process_completion":
          if (this.onOutputReceived) this.onOutputReceived("\x1b[32m[Process Completed]\x1b[0m\r\n");
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
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (this.onOutputReceived) this.onOutputReceived("\x1b[33m⚠️  No backend connection. Start the backend server on port 5000.\x1b[0m\r\n");
      return;
    }

    this.socket.send(JSON.stringify({ type: "run", payload: code }));
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
}

export const socketManager = new QuantumSocketManager();
