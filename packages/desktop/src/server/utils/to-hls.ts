import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const converOptions = [
  "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
  "-level 3.0",
  "-start_number 0", // start the first .ts segment at index 0
  "-hls_time 10", // 10 second segment duration
  "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
  "-f hls", // HLS format
];

export async function toHLS(inputPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    const convert = ffmpeg(inputPath);
    convert.addOptions(converOptions);
    convert.output(outputPath);

    convert.on("error", reject);
    convert.on("end", resolve);

    // convert.on("stderr", e => {});

    // start convert
    convert.run();
  });
}
