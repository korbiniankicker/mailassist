import { io, Socket } from "socket.io-client";

export class WsClient {
  private static instance: WsClient;
  private ws!: Socket;
  private connected: boolean = false;

  constructor() {
    console.log(import.meta.env.VITE_BACKEND_URL_WS);
    this.connect();
  }

  public static getInstance() {
    if (!WsClient.instance) {
      WsClient.instance = new WsClient();
    }
    return WsClient.instance;
  }

  public setCallback(type: string, cb: (data: unknown) => void) {
    this.ws.on(type, cb);
    return () => this.ws.off(type, cb);
  }

  public sendMessage(type: string, body?: unknown) {
    if (body) {
      this.ws.emit(type, body);
    } else {
      this.ws.emit(type);
    }
  }

  private connect() {
    if (this.connected) return;

    this.ws = io(import.meta.env.VITE_BACKEND_URL_WS);

    this.ws.on("connect_error", (error) => {
      console.error(error);
    });
    this.ws.on("connect", () => {
      this.connected = true;
    });
  }
}
