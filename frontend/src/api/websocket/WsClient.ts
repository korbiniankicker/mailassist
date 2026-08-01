import { io, Socket } from "socket.io-client";

type Callback = (data: unknown) => void;

export class WsClient {
  private static instance: WsClient;
  private ws: Socket | null = null;
  private subscribers: Map<string, Set<Callback>> = new Map();

  public static getInstance() {
    if (!WsClient.instance) {
      WsClient.instance = new WsClient();
    }
    return WsClient.instance;
  }

  public setCallback(type: string, cb: Callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(cb);
    if (this.ws) {
      this.ws.on(type, cb);
    }
    return () => {
      this.subscribers.get(type)?.delete(cb);
      this.ws?.off(type, cb);
    };
  }

  private attachSubscribers() {
    if (!this.ws) return;
    for (const [type, cbs] of this.subscribers) {
      for (const cb of cbs) {
        this.ws.on(type, cb);
      }
    }
  }

  public sendMessage(type: string, body?: unknown) {
    if (!this.ws) return;
    if (body) {
      this.ws.emit(type, body);
    } else {
      this.ws.emit(type);
    }
  }

  public connectWithToken(token: string) {
    this.disconnect();

    const backendUrl = String(import.meta.env.VITE_BACKEND_URL_WS)
      .trim()
      .replace(/^ws/i, "http")
      .replace(/\/+$/, "")
      .replace(/:8080\/api$/, ":8080")
      .replace(/:3000\/api$/, ":3000");

    this.ws = io(`${backendUrl}/api`, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      auth: { token },
    });

    this.ws.on("connect", () => {});

    this.ws.on("disconnect", () => {});

    this.ws.on("connect_error", (error) => {
      console.error(error);
    });

    this.ws.on("exception", (data: unknown) => {
      const err = data as { code?: number; message?: string };
      if (err.code === 401) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    });

    this.attachSubscribers();
  }

  public disconnect() {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.disconnect();
      this.ws = null;
    }
  }
}
