import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
// @ts-ignore
import ffprobePath from "@ffprobe-installer/ffprobe";
import { inspect } from "util";

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const converOptions = [
  "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
  "-level 3.0",
  "-start_number 0", // start the first .ts segment at index 0
  "-hls_time 10", // 10 second segment duration
  "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
  "-f hls", // HLS format
];

export type HLSProgress = {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: number;
  percent: number;
};

export const getMetadata = (path: string) => {
  return new Promise((res, rej) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) rej(err);

      res(inspect(metadata, false, null));
    });
  });
};

export async function toHLS(
  inputPath: string,
  outputPath: string,
  cb: (progress: HLSProgress) => void = () => {}
) {
  return new Promise((resolve, reject) => {
    const convert = ffmpeg(inputPath);
    convert.addOptions(converOptions);
    convert.output(outputPath);

    convert.on("error", reject);

    convert.on("progress", cb);

    convert.on("end", resolve);

    convert.run();
  });
}
