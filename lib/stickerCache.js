import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import DJS from '@aroleaf/djs-bot';

const $ = promisify(exec);

export default class StickerCache {
  constructor(path, fallback) {
    this.base = path;
    this.fallback = fallback;
  }

  async store(sticker) {
    const stickerPath = path.resolve(this.base, sticker.id);
    switch (sticker.format) {
      case DJS.StickerFormatType.PNG: {
        await $(`ffmpeg -y -i "${sticker.url}" -lavfi "format=rgba,scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease" "${stickerPath}.png"`);
        return `${stickerPath}.png`;
      }
      case DJS.StickerFormatType.APNG: {
        await $(`ffmpeg -y -i "${sticker.url}" -lavfi "[0:v] scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease,split [a][b]; [a] palettegen [p]; [b][p] paletteuse" "${stickerPath}.gif"`);
        return `${stickerPath}.gif`;
      }
      case DJS.StickerFormatType.Lottie: {
        const data = await fetch(sticker.url).then(res => res.arrayBuffer());
        await fs.writeFile(`${stickerPath}.json`, Buffer.from(data));
        await $(`lottie2gif "${stickerPath}.json" -o "${stickerPath}_.gif" && ffmpeg -y -i "${stickerPath}_.gif" -lavfi "[0:v] scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease,split [a][b]; [a] palettegen [p]; [b][p] paletteuse" "${stickerPath}.gif" && rm "${stickerPath}.json" "${stickerPath}_.gif"`);
        return `${stickerPath}.gif`;
      }
    }
  }

  async fetch(sticker) {
    const stickerPath = path.resolve(this.base, `${sticker.id}.${this.ext(sticker)}`);
    const stats = await fs.stat(stickerPath).catch(() => {});
    if (stats) return stats.size ? stickerPath : path.resolve(this.fallback);
    return this.store(sticker).catch(() => {}).then(res => res || path.resolve(this.fallback));
  }

  ext(sticker) {
    return ({
      [DJS.StickerFormatType.PNG]: 'png',
      [DJS.StickerFormatType.APNG]: 'gif',
      [DJS.StickerFormatType.Lottie]: 'gif',
    })[sticker.format];
  }
}