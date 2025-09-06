import { io, Socket } from "socket.io-client";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(): Socket {
    if (!this.socket) {
      console.log('Creating new socket connection...');
      this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
        withCredentials: true,
        autoConnect: false
      });
    }

    if (!this.socket.connected) {
      console.log('Connecting socket...');
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket?.connected) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  destroy(): void {
    if (this.socket) {
      if (this.socket.connected) {
        this.socket.disconnect();
      }
      this.socket = null;
      console.log('Socket destroyed');
    }
  }
}

export const socketManager = SocketManager.getInstance();

export const connectSocket = () => socketManager.connect();
export const disconnectSocket = () => socketManager.disconnect();
export const getSocket = () => socketManager.getSocket();
export const isSocketConnected = () => socketManager.isConnected();
export const destroySocket = () => socketManager.destroy();
