#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const zipFile = path.resolve(rootDir, 'extension.zip');

console.log('📦 Packaging extension for Chrome Web Store / Load Unpacked distribution...');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Remove old zip if present
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

try {
  // Use zip CLI command from inside dist folder so paths in zip are root-relative
  execSync(`cd "${distDir}" && zip -r -q "${zipFile}" . *`, { stdio: 'inherit' });
} catch (err) {
  console.log('Falling back to Python zipfile module...');
  // Cross-platform Python fallback
  const pyScript = `
import zipfile, os
dist = "${distDir}"
target = "${zipFile}"
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dist):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, dist)
            zf.write(full, rel)
`;
  execSync(`python3 -c '${pyScript.replace(/\n/g, ';')}'`);
}

if (fs.existsSync(zipFile)) {
  const stats = fs.statSync(zipFile);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`✅ Success! Created extension.zip (${sizeKb} KB)`);
  console.log(`📍 Path: ${zipFile}`);
} else {
  console.error('❌ Failed to create extension.zip');
  process.exit(1);
}
