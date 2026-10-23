import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

// Observe production bundle size without breaking an otherwise healthy release.
// Run after npm run build. This is an advisory, not a bandwidth benchmark.
export function collectBuildStats(dir) {
  const assets = [];
  function walk(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:js|css|html)$/i.test(entry.name)) {
        const buf = readFileSync(full);
        assets.push({ file: path.relative(dir, full).replaceAll('\\', '/'), bytes: statSync(full).size, gzipBytes: gzipSync(buf).length });
      }
    }
  }
  walk(dir);
  return assets.sort((a, b) => b.gzipBytes - a.gzipBytes);
}

export function evaluateBudgets(assets) {
  const largestJsGzip = Math.max(0, ...assets.filter((a) => a.file.endsWith('.js')).map((a) => a.gzipBytes));
  const htmlBytes = Math.max(0, ...assets.filter((a) => a.file.endsWith('.html')).map((a) => a.bytes));
  return {
    largestJsGzip,
    htmlBytes,
    warnings: [
      ...(largestJsGzip > 350 * 1024 ? [`Largest JavaScript chunk exceeds 350 KiB gzipped (${largestJsGzip} bytes)`] : []),
      ...(htmlBytes > 200 * 1024 ? [`HTML exceeds 200 KiB (${htmlBytes} bytes); review inline CSS`] : []),
    ],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.resolve(process.argv[2] || 'dist');
  if (!existsSync(dir)) {
    console.error('Build output missing. Run npm run build first.');
    process.exitCode = 2;
  } else {
    const assets = collectBuildStats(dir);
    const result = evaluateBudgets(assets);
    console.log('Phase 4 bundle-size baseline (gzip bytes; JS/CSS/HTML only)');
    console.table(assets.slice(0, 12));
    console.log(`Largest JS (gzip): ${result.largestJsGzip} bytes; largest HTML: ${result.htmlBytes} bytes`);
    for (const warning of result.warnings) console.warn('WARN:', warning);
    if (!result.warnings.length) console.log('PASS: under advisory limits');
  }
}
