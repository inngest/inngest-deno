import type { EventPayload } from "./types.d.ts";

export const _internals = { fetch };

/**
 * A set of options for configuring the Inngest client.
 */
export interface InngestClientOptions {
  /**
   * The base Inngest Source API URL to append the Source API Key to.
   *
   * Defaults to `"https://inn.gs/e/"`"
   */
  inngestApiUrl?: string;
}

export class Inngest {
  /**
   * Inngest Source API Key.
   */
  private readonly apiKey: string;

  /**
   * Full URL for the Inngest Source API.
   */
  private readonly inngestApiUrl: string;

  /**
   * Configuration for sending requests to Inngest for this instance.
   */
  private readonly reqConfig: RequestInit;

  constructor(apiKey: string, { inngestApiUrl = "https://inn.gs/e/" } = {}) {
    this.apiKey = apiKey;
    this.inngestApiUrl = new URL(this.apiKey, inngestApiUrl).toString();

    this.reqConfig = {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "InngestDeno 0.1.0",
      },
      redirect: "follow",
    };
  }

  public async send(payload: EventPayload | EventPayload[]): Promise<void> {
    const res = await _internals.fetch(this.inngestApiUrl, {
      ...this.reqConfig,
      body: JSON.stringify(payload),
    });

    if (res.status < 200 || res.status >= 300) {
      throw await Inngest.#getResError(res);
    }
  }

  static async #getResError(res: Response): Promise<Error> {
    let errorMessage = "Unknown error";

    switch (res.status) {
      case 401:
        errorMessage = "API Key Not Found";
        break;
      case 400:
        errorMessage = "Cannot process event payload";
        break;
      case 403:
        errorMessage = "Forbidden";
        break;
      case 404:
        errorMessage = "API Key not found";
        break;
      case 406:
        errorMessage = `${JSON.stringify(await res.text())}`;
        break;
      case 409:
      case 412:
        errorMessage = "Event transformation failed";
        break;
      case 413:
        errorMessage = "Event payload too large";
        break;
      case 500:
        errorMessage = "Internal server error";
        break;
    }

    return new Error(`Inngest API Error: ${res.status} ${errorMessage}`);
  }
}
