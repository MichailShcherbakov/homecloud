import * as crypto from "crypto-js";

export function computeHash(data: string): string {
  return crypto.MD5(data).toString(crypto.enc.Hex);
}
