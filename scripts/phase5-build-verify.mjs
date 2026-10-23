import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Built-artifact gate, not a speculative source-size proxy. Run after vite build.
export function verifyPhase5Build(directory) {
  const htmlPath = path.join(directory, 'index.html');
  if (!existsSync(htmlPath)) {
    throw new Error('dist/index.html missing; run npm run build first.');
  }
  const html = readFileSync(htmlPath, 'utf8');
  const htmlBytes = Buffer.byteLength(html);
  const htmlGzipBytes = gzipSync(html).length;
  const styleTagCount = (html.match(/<style\b/gi) || []).length;
  const stylesheets = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => /\brel=["']stylesheet["']/i.test(tag) && /\bhref=["'][^"']+\.css(?:\?[^"']*)?["']/i.test(tag));

  const assetFolder = path.join(directory, 'assets');
  const assets = existsSync(assetFolder) ? readdirSync(assetFolder).filter((file) => /\.(js|css)$/.test(file)) : [];
  const jsAssets = assets.filter((name) => name.endsWith('.js'))
    .map((name) => {
      const full = path.join(assetFolder, name);
      return { file: name, bytes: statSync(full).size, gzipBytes: gzipSync(readFileSync(full)).length };
    }).sort((a, b) => b.gzipBytes - a.gzipBytes);

  const errors = [];
  if (htmlBytes >= 32768) errors.push(`HTML ${htmlBytes} bytes >= Phase 5 cap 32768`);
  if (!stylesheets.length) errors.push('Missing cacheable external CSS link in built HTML');
  if (styleTagCount > 1) errors.push(`Expected only small first-paint <style>; found ${styleTagCount} tags`);
  if (/data-bf-inline-css/.test(html)) errors.push('Old whole-stylesheet injection still present');
  if (!assets.some((name) => name.endsWith('.css'))) errors.push('No built CSS asset emitted');

  return {
    htmlBytes, htmlGzipBytes, styleTagCount, stylesheetLinks: stylesheets.length,
    biggestJs: jsAssets[0] || null,
    warnings: jsAssets[0]?.gzipBytes > 210 * 1024
      ? [`Largest JS chunk exceeds 210 KiB gzip (${jsAssets[0].file}); review actual use before changing chunk rules.`]
      : [],
    errors,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = verifyPhase5Build(path.resolve(process.argv[2] || 'dist'));
    console.log('Phase 5 production build measurement:', JSON.stringify(result, null, 2));
    if (result.errors.length) {
      console.error('FAIL: generated assets did not meet Phase 5 HTML/CSS gate.');
      process.exitCode = 1;
    } else {
      console.log('PASS: cacheable CSS and HTML payload gate; JS-size warnings are advisory.');
    }
  } catch (error) {
    console.error('FAIL:', error.message);
    process.exitCode = 1;
  }
}
