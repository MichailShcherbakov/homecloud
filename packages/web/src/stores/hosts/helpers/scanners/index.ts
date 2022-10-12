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
      cache: "no-cache",
      credentials: "omit",
      headers: {},
      redirect: "manual",
      referrerPolicy: "no-referrer",
    };
  }

  scan(ip: string): Promise<Response> {
    return fetch(`http://localhost:${this.port}/${this.uri}`, this.options);
  }

  stop() {
    this.controller.abort();
  }
}
