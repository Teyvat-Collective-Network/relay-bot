import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const $ = promisify(exec);

export default class StickerCache {
  constructor(path) {
    this.base = path;
  }

  async store(sticker) {
    const stickerPath = path.resolve(this.base, sticker.id);
    switch (sticker.format) {
      case 'PNG': {
        await $(`ffmpeg -y -i "${sticker.url}" -lavfi "format=rgba,scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease" "${stickerPath}.png"`);
        return `${stickerPath}.png`;
      }
      case 'APNG': {
        await $(`ffmpeg -y -i "${sticker.url}" -lavfi "[0:v] scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease,split [a][b]; [a] palettegen [p]; [b][p] paletteuse" :${stickerPath}.gif"`);
        return `${stickerPath}.gif`;
      }
      case 'LOTTIE': {
        const data = await fetch(sticker.url).then(res => res.arrayBuffer());
        await fs.writeFile(`${stickerPath}.json`, Buffer.from(data));
        await $(`
          lottie2gif "${stickerPath}.json" -o "${stickerPath}_.gif" 
          && ffmpeg -y -i "${stickerPath}_.gif" -lavfi "[0:v] scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease,split [a][b]; [a] palettegen [p]; [b][p] paletteuse" "${stickerPath}.gif"
          && rm "${stickerPath}.json" "${stickerPath}_.gif"
        `);
        return `${stickerPath}.gif`;
      }
    }
  }

  async fetch(sticker) {
    const stickerPath = path.resolve(this.base, `${sticker.id}.${this.ext(sticker)}`);
    return await fs.stat(stickerPath).catch(() => {}) 
      ? stickerPath
      : this.store(sticker);
  }

  ext(sticker) {
    return ({
      APNG: 'gif',
      PNG: 'png',
      LOTTIE: 'gif',
    })[sticker.format];
  }
}