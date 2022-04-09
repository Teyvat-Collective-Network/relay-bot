import {$} from 'zx';
import fs from 'fs/promises';
import path from 'path';

$.verbose = false;

export default class StickerCache {
  constructor(client, base) {
    this.client = client;
    this.base = base;
  }

  async store(sticker) {
    const stickerPath = path.resolve(this.base, sticker.id);
    switch (sticker.format) {
      case 'PNG': {
        await $`ffmpeg -y -i ${sticker.url} -lavfi "format=rgba,scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease" ${stickerPath}.png`;
        return `${stickerPath}.${this.ext(sticker)}`
      }
      case 'APNG': {
        await $`ffmpeg -y -i ${sticker.url} -lavfi "[0:v] scale=160:160:flags=lanczos:force_original_aspect_ratio=decrease,split [a][b]; [a] palettegen [p]; [b][p] paletteuse" ${stickerPath}.gif`;
        return `${stickerPath}.${this.ext(sticker)}`;
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
    })[sticker.format];
  }
}