import DME from 'discord-markdown-embeds';
import fs from 'fs/promises';
import { resolve } from 'path';

const cache = new Map();

export async function getDocument(name) {
  const fp = resolve(`docs/${name}.md`);
  const stats = await fs.stat(fp);
  
  const cached = cache.get(name);
  if (cached?.mtime === stats.mtimeMs) return cached.doc;

  const doc = DME.template(await fs.readFile(fp, 'utf8'));

  cache.set(name, {
    mtime: stats.mtimeMs,
    doc,
  });

  return doc;
}

export default getDocument;