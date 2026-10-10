import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const report = {};
for (const name of ['baseline', 'optimized']) {
  const root = `.services-validation/${name}`;
  const html = await readFile(`${root}/index.html`, 'utf8');
  const paths = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map(match => match[1]))];
  const initial = await Promise.all(paths.map(async path => {
    const data = await readFile(root + path);
    return { path, bytes: data.length, gzipBytes: gzipSync(data).length };
  }));
  const files = (await readdir(root + '/assets')).filter(file => file.endsWith('.js'));
  const chunks = await Promise.all(files.map(async file => {
    const data = await readFile(`${root}/assets/${file}`);
    return { file, bytes: data.length, gzipBytes: gzipSync(data).length };
  }));
  report[name] = { entry: initial[0], initialHtmlJavaScriptBytes: initial.reduce((sum, file) => sum + file.bytes, 0), initialHtmlJavaScriptGzipBytes: initial.reduce((sum, file) => sum + file.gzipBytes, 0), totalEmittedJavaScriptBytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0), initial, chunks };
}
const images = JSON.parse(await readFile('.services-validation/images.json', 'utf8'));
report.images = {
  originalBytes: images.filter(item => item.format === 'webp' && item.width === 1024).reduce((sum, item) => sum + item.originalBytes, 0),
  largestWebpBytes: images.filter(item => item.format === 'webp' && item.width === 1024).reduce((sum, item) => sum + item.bytes, 0),
  largestAvifBytes: images.filter(item => item.format === 'avif' && item.width === 1024).reduce((sum, item) => sum + item.bytes, 0),
};
await mkdir('.services-validation', { recursive: true });
await writeFile('.services-validation/build-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ baseline: { entry: report.baseline.entry, initialGzip: report.baseline.initialHtmlJavaScriptGzipBytes, totalJs: report.baseline.totalEmittedJavaScriptBytes }, optimized: { entry: report.optimized.entry, initialGzip: report.optimized.initialHtmlJavaScriptGzipBytes, totalJs: report.optimized.totalEmittedJavaScriptBytes }, images: report.images }, null, 2));
