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
const publicManifest = path.resolve(rootDir, 'public', 'manifest.json');
const distManifest = path.resolve(distDir, 'manifest.json');

console.log('📦 Packaging DsaKode for Chrome Web Store distribution...');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Always ensure latest manifest.json is in dist
if (fs.existsSync(publicManifest)) {
  fs.copyFileSync(publicManifest, distManifest);
}

// Verify critical Chrome Extension files
const requiredFiles = ['manifest.json', 'background.js', 'content.js'];
for (const file of requiredFiles) {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required extension file in dist: ${file}`);
    process.exit(1);
  }
}

// Remove old extension.zip if present
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

// Deterministic packaging via Python zipfile to avoid OS-specific zip anomalies
const pythonScript = `
import zipfile, os

dist = r"${distDir}"
target = r"${zipFile}"
ignored_names = {'.DS_Store', 'Thumbs.db'}

with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dist):
        for f in files:
            if f in ignored_names or f.startswith('.'):
                continue
            full_path = os.path.join(root, f)
            arcname = os.path.relpath(full_path, dist)
            zf.write(full_path, arcname)

# Verification
with zipfile.ZipFile(target, 'r') as zf:
    namelist = zf.namelist()
    assert 'manifest.json' in namelist, "manifest.json missing at root of zip!"
    print(f"Archive contents verified ({len(namelist)} files): manifest.json at root.")
`;

try {
  execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}'`, { stdio: 'inherit' });
} catch (err) {
  console.error('Python zip failed, falling back to zip CLI command...');
  execSync(`cd "${distDir}" && zip -r -q "${zipFile}" . -x ".*"`, { stdio: 'inherit' });
}

if (fs.existsSync(zipFile)) {
  const stats = fs.statSync(zipFile);
  const sizeKb = (stats.size / 1024).toFixed(1);
  console.log(`✅ Success! Generated valid Chrome Web Store extension package:`);
  console.log(`📍 Output: ${zipFile} (${sizeKb} KB)`);
  console.log(`🚀 Ready to upload to Chrome Web Store Developer Dashboard or Load Unpacked.`);
} else {
  console.error('❌ Failed to create extension.zip');
  process.exit(1);
}
