export interface IScanner {
  scan(ip: string): void;
  stop(): void;
}

export class FetchScanner implements IScanner {
  private readonly options: RequestInit;
  private readonly controller: AbortController = new AbortController();

  constructor(
    private readonly port: number,
    private readonly uri: string,
    private readonly secure = false
  ) {
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
    return fetch(
      `${this.secure ? "https" : "http"}://${ip}:${this.port}/${this.uri}`,
      this.options
    );
  }

  stop() {
    this.controller.abort();
  }
}
