import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyPhase5Build } from '../scripts/phase5-build-verify.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('Vite emits one cacheable CSS asset rather than inlining entire global CSS into HTML', () => {
  const source = read('vite.config.js');
  assert.match(source, /cssCodeSplit\s*:\s*false/);
  assert.doesNotMatch(source, /inlineProductionCss\s*\(/);
  assert.doesNotMatch(source, /transformIndexHtml/);
});

test('HTML provides first-paint light/dark fallback without duplicating the global stylesheet', () => {
  const source = read('index.html');
  assert.match(source, /data-bf-critical-paint/);
  assert.match(source, /buddy_fleets_theme/);
  assert.match(source, /html\[data-theme="light"\]/);
  assert.ok(Buffer.byteLength(source) < 12000, 'HTML source must remain small');
  assert.doesNotMatch(source, /data-bf-inline-css/);
});

test('all existing company and demo portal page modules are route-lazy and have Suspense fallbacks', () => {
  for (const filename of ['ClientPortalApp.jsx', 'DemoPortalApp.jsx']) {
    const src = read(`src/clientPortal/${filename}`);
    assert.match(src, /import React,\{lazy,Suspense,/);
    assert.match(src, /<Suspense fallback=/);
    assert.match(src, /const DashboardPage=lazy\(\(\)=>import\('\.\/pages\/DashboardPage'\)\)/);
    assert.match(src, /const ComingSoonPage=lazy\(\(\)=>import\('\.\/pages\/ComingSoonPage'\)\)/);
    assert.match(src, /const ReportsPage=lazy\(\(\)=>import\('\.\/pages\/ReportsPage'\)\)/);
    assert.match(src, /const AuditActivityPage=lazy\(\(\)=>import\('\.\/pages\/AuditActivityPage'\)\)/);
    assert.doesNotMatch(src, /^import \w+ from '\.\/pages\//m);
    assert.match(src, /getModuleByRoute\(route\)/);
  }
});

test('Reports and Audit keep same XLSX export shapes, use on-demand import with controlled pending state', () => {
  const reports = read('src/clientPortal/pages/ReportsPage.jsx');
  const audit = read('src/clientPortal/pages/AuditActivityPage.jsx');
  for (const source of [reports, audit]) {
    assert.doesNotMatch(source, /import \* as XLSX from 'xlsx'/);
    assert.match(source, /exportExcel=async\(\)=>/);
    assert.match(source, /const XLSX=await import\('xlsx'\)/);
    assert.match(source, /disabled=\{!rows\.length\|\|exporting\}/);
    assert.match(source, /setExporting\(false\)/);
    assert.match(source, /role="alert"/);
  }
  assert.match(reports, /book_append_sheet\(wb,ws,'Report'\)/);
  assert.match(audit, /book_append_sheet\(wb,ws,'Audit'\)/);
  assert.match(audit, /Buddy_Fleets_Audit_Activity\.xlsx/);
  assert.match(reports, /replace\(\/\[\^a-z0-9\]\+\/gi,'_'\)/);
});

test('Vercel Hobby source entrypoint count remains 12 with pricing and liveness routes unchanged', () => {
  function jsCount(dir) {
    return readdirSync(dir, { withFileTypes: true }).reduce((count, entry) => {
      const sub = path.join(dir, entry.name);
      return count + (entry.isDirectory() ? jsCount(sub) : entry.isFile() && entry.name.endsWith('.js') ? 1 : 0);
    }, 0);
  }
  assert.equal(jsCount(path.join(root, 'api')), 12);
  assert.match(read('vercel.json'), /"source": "\/api\/health"/);
  assert.match(read('vercel.json'), /"destination": "\/api\/public\/pricing-plans\?__buddy_health=1"/);
  assert.doesNotMatch(read('vite.config.js'), /serverless|function/i);
});

test('session authority, Supabase auth and project dependencies are unchanged by Phase 5', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['check:session'], 'node scripts/session-phase5-check.mjs');
  assert.ok(pkg.dependencies['@supabase/supabase-js']);
  assert.ok(pkg.dependencies['react-router-dom']);
  assert.equal(pkg.dependencies.xlsx, '^0.18.5');
});

test('post-build gate accepts small HTML with linked CSS and JS chunks', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'bf-p5-'));
  try {
    mkdirSync(path.join(dir, 'assets'));
    writeFileSync(path.join(dir, 'index.html'), '<html><head><link rel="stylesheet" href="/assets/style-1.css"><style data-bf-critical-paint>html{background:black}</style></head><body></body></html>');
    writeFileSync(path.join(dir, 'assets', 'style-1.css'), 'body{margin:0}');
    writeFileSync(path.join(dir, 'assets', 'index-1.js'), 'console.log(42)');
    const result = verifyPhase5Build(dir);
    assert.deepEqual(result.errors, []);
    assert.equal(result.stylesheetLinks, 1);
  } finally { rmSync(dir, {recursive:true, force:true}); }
});

test('post-build gate fails if the whole CSS is still in HTML or CSS link is absent', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'bf-p5-'));
  try {
    mkdirSync(path.join(dir, 'assets'));
    writeFileSync(path.join(dir, 'index.html'), '<html><head><style data-bf-inline-css>body{margin:0}</style></head></html>');
    writeFileSync(path.join(dir, 'assets', 'style-1.css'), 'body{margin:0}');
    const result = verifyPhase5Build(dir);
    assert.ok(result.errors.some((e) => e.includes('Missing cacheable')));
    assert.ok(result.errors.some((e) => e.includes('Old whole-stylesheet')));
  } finally { rmSync(dir, {recursive:true, force:true}); }
});
