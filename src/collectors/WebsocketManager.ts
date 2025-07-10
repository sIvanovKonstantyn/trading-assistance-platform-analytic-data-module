import WebSocket from 'ws';

export class WebsocketManager {
  private sockets: Map<string, WebSocket> = new Map();

  addConnection(key: string, url: string) {
    if (this.sockets.has(key)) return;
    const ws = new WebSocket(url);
    this.sockets.set(key, ws);
  }

  removeConnection(key: string) {
    const ws = this.sockets.get(key);
    if (ws) ws.close();
    this.sockets.delete(key);
  }

  getConnection(key: string): WebSocket | undefined {
    return this.sockets.get(key);
  }
} 