import { createReadStream } from "fs";
import * as crypto from "crypto-js";

export async function computeFileHash(path: string): Promise<string> {
  return new Promise((res, rej) => {
    const hasher = crypto.algo.MD5.create();

    const stream = createReadStream(path, "utf8");

    stream.on("data", chunk => {
      hasher.update(chunk as string);
    });

    stream.on("end", () => {
      const hash = hasher.finalize().toString(crypto.enc.Hex);

      res(hash);
    });

    stream.on("error", e => {
      rej(e);
    });
  });
}
