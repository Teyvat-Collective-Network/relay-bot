import fs from 'fs/promises';
import XRegExp from 'xregexp';
import path from 'path';

const compiled = (await compileRegexes([
  'filter/offensive.txt',
  'filter/sexual.txt',
  'filter/slurs.txt',
  'filter/other.txt'
])).concat(await compileScams('filter/scamlinks.json'));

async function compileScams(source) {
  const data = await fs.readFile(path.resolve(source), 'utf-8');
  return JSON.parse(data).map(scam => XRegExp(`(^|\\W)(https?://)?${XRegExp.escape(scam)}([\\W/]|$)`, 'in'));
}

async function compileRegexes(sources) {
  const regexes = [];
  for (const src of sources) {
    const data = await fs.readFile(path.resolve(src), 'utf-8');
    regexes.push(data.split('\n'));
  }
  return regexes.flat().map(regex => XRegExp(regex.split(';')[0], 'in'));
}

export default function check(text) {
  for (const regex of compiled) {
    if (regex.test(text)) {
      return true;
    }
  }
  return false;
}