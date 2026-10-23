#!/usr/bin/env node
/**
 * Buddy Fleets Phase 3 Part 3: source-to-database object inventory.
 * Read-only: parses literal .from('table') / .rpc('function') calls and emits
 * JSON, or a SELECT-only Postgres existence check suitable for SQL Editor.
 * Dynamic names, SQL strings and indirect references are intentionally outside
 * this scanner's coverage; do not treat a clean result as full schema proof.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['api', 'server', 'src', 'supabase/functions'];
const validExtension = /\.(?:js|jsx|ts|tsx|mjs)$/;
const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);
const objectName = /^[A-Za-z_][A-Za-z_0-9.]*$/;
const literalFrom = /\.from\s*\(\s*(['"`])([A-Za-z_][A-Za-z_0-9.]*)\1\s*\)/g;
const literalRpc = /\.rpc\s*\(\s*(['"`])([A-Za-z_][A-Za-z_0-9.]*)\1\s*[,)]/g;

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory() && !ignoredDirs.has(item.name)) {
      files.push(...sourceFiles(path.join(dir, item.name)));
    } else if (item.isFile() && validExtension.test(item.name)) {
      files.push(path.join(dir, item.name));
    }
  }
  return files;
}

export function inspectSource() {
  const tables = new Set();
  const functions = new Set();
  let scannedFiles = 0;
  for (const root of roots) {
    for (const file of sourceFiles(path.join(projectRoot, root))) {
      scannedFiles++;
      const content = readFileSync(file, 'utf8');
      for (const [, , table] of content.matchAll(literalFrom)) {
        if (objectName.test(table)) tables.add(table);
      }
      for (const [, , rpc] of content.matchAll(literalRpc)) {
        if (objectName.test(rpc)) functions.add(rpc);
      }
    }
  }
  return {
    scannedFiles,
    tablesOrViews: [...tables].sort(),
    rpcNames: [...functions].sort(),
    coverage: 'Literal Supabase .from() and .rpc() names only; no dynamic identifiers or column contract validation',
  };
}

function quoteSqlString(value) {
  if (!objectName.test(value)) throw new Error(`Unsafe object identifier: ${value}`);
  return `'${value.replaceAll("'", "''")}'`;
}

export function sqlForInventory({ tablesOrViews, rpcNames }) {
  const asArray = values => `ARRAY[${values.map(quoteSqlString).join(', ')}]::text[]`;
  return `-- Buddy Fleets generated READ-ONLY source-to-live object existence check.\n-- Paste into Supabase SQL Editor; never use this as a migration.\n-- Presence by RPC name DOES NOT verify overload signatures or argument types.\nWITH source_refs AS (\n  SELECT 'table_or_view'::text AS object_type, unnest(${asArray(tablesOrViews)}) AS object_name\n  UNION ALL\n  SELECT 'rpc'::text AS object_type, unnest(${asArray(rpcNames)}) AS object_name\n), checked AS (\n  SELECT object_type, object_name,\n    CASE WHEN object_type = 'rpc' THEN EXISTS (\n      SELECT 1 FROM pg_proc p\n      WHERE p.pronamespace = 'public'::regnamespace AND p.proname = object_name\n    ) ELSE to_regclass('public.' || object_name) IS NOT NULL END AS is_present\n  FROM source_refs\n)\nSELECT object_type, count(*) AS scanned,\n       count(*) FILTER (WHERE is_present) AS present,\n       array_agg(object_name ORDER BY object_name) FILTER (WHERE NOT is_present) AS missing\nFROM checked GROUP BY object_type ORDER BY object_type;\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inventory = inspectSource();
  if (process.argv.includes('--sql')) {
    process.stdout.write(sqlForInventory(inventory));
  } else {
    process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
  }
}
