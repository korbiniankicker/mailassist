export class WsClient {
  private static instance: WsClient;
  private ws!: WebSocket;
  private connected: boolean = false;
  private responseQueue: Array<string>;
  private progressQueue: Array<number>;

  constructor() {
    this.connect();

    this.responseQueue = new Array<string>();
    this.progressQueue = new Array<number>();
  }

  public static getInstance() {
    if (!WsClient.instance) {
      WsClient.instance = new WsClient();
    }
    return WsClient.instance;
  }

  public sendMessage(type: string, body?: unknown) {
    if (!this.connected) return;
    if (body) {
      this.ws.send(JSON.stringify({ type: type, body: body }));
    } else {
      this.ws.send(JSON.stringify({ type: type }));
    }
  }

  private connect() {
    this.ws = new WebSocket(import.meta.env.VITE_BACKEND_URL_WS);

    this.ws.onopen = () => {
      this.connected = true;
    };
    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);

      switch (type) {
        case "response":
          this.responseQueue.push(data);
          break;
        case "progress":
          this.progressQueue.push(data);
          break;
        default:
          console.warn(`Encountered unkown WS event: ${data}`);
      }
    };
  }
}
