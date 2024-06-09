import { $ } from "bun";

export default class FFMPEGManipulator {
  static async getVideoDuration(filePath: string) {
    const result =
      await $`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`.text();
    return parseFloat(result);
  }

  static async getInfo(filePath: string) {
    const content =
      await $`ffprobe -v error -print_format json -select_streams v:0 -show_format -show_streams \
-show_entries stream=codec_name,width,height,bit_rate,r_frame_rate \
-show_entries format=duration,filename,nb_streams,size ${filePath}`.text();
    const data = JSON.parse(content);
    const info = {
      codec_name: data.streams[0].codec_name as string,
      width: Number(data.streams[0].width),
      height: Number(data.streams[0].height),
      bit_rate: Number(data.streams[0].bit_rate),
      r_frame_rate: convertFractionStringToNumber(data.streams[0].r_frame_rate),
      filename: data.format.filename as string,
      duration: Number(data.format.duration),
      nb_streams: data.format.nb_streams as number,
      size: Number(data.format.size),
    };
    return info;
  }

  static async getVideoFramerate(filePath: string) {
    const command = `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const frameRate =
      await $`ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=noprint_wrappers=1:nokey=1 "${filePath}"`.text();
    return convertFractionStringToNumber(frameRate);
  }

  static async compress(inputPath: string, outputPath: string) {
    await $`ffmpeg -y -i ${inputPath} -vcodec libx264 -crf 28 -acodec copy  ${outputPath}`.quiet();
  }

  static async createVideoSlice(
    input_path: string,
    output_path: string,
    inpoint: number,
    outpoint: number
  ) {
    if (inpoint >= outpoint) {
      throw new Error("inpoint must be less than outpoint");
    }
    if (inpoint < 0) {
      throw new Error("inpoint must be greater than or equal to 0");
    }
    const duration = await FFMPEGManipulator.getVideoDuration(input_path);
    if (outpoint > duration || inpoint > duration) {
      throw new Error("outpoint must be less than the video duration");
    }

    await $`ffmpeg -y -ss ${inpoint} -t ${
      outpoint - inpoint
    } -i ${input_path} -c copy ${output_path}`.quiet();
    return output_path;
  }

  static async cropVideo(
    inputPath: string,
    outputPath: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    await $`ffmpeg -y -i ${inputPath} -vf "crop=${width}:${height}:${x}:${y}" ${outputPath}`.quiet();
  }

  static async changeSize(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
  ) {
    await $`ffmpeg -y -i ${inputPath} -s ${width}x${height} ${outputPath}`.quiet();
  }

  static async changeFramerate(
    inputPath: string,
    outputPath: string,
    frameRate: number
  ) {
    await $`ffmpeg -y -i ${inputPath} -r ${frameRate} ${outputPath}`.quiet();
  }

  static async saveThumbnail(
    inputPath: string,
    outputPath: string,
    time: number
  ) {
    await $`ffmpeg -y -ss ${time} -i ${inputPath} -vframes 1 ${outputPath}`.quiet();
  }
}

function convertFractionStringToNumber(fractionString: string) {
  const [numerator, denominator] = fractionString.split("/").map(Number);
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    throw new Error("Invalid fraction string");
  }
  return numerator / denominator;
}
