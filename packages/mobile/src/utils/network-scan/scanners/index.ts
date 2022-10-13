export interface IScanner {
  scan(ip: string): void;
  stop(): void;
}

export class FetchScanner implements IScanner {
  private readonly options: RequestInit;
  private readonly controller: AbortController = new AbortController();

  constructor(private readonly port: number, private readonly uri: string) {
    this.options = {
      signal: this.controller.signal,
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {},
    };
  }

  scan(ip: string): Promise<Response> {
    return fetch(`http://${ip}:${this.port}/${this.uri}`, this.options);
  }

  stop() {
    this.controller.abort();
  }
}
