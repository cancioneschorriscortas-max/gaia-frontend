#!/usr/bin/env node
// ─────────────────────────────────────────────────────────
// scripts/migrate-api.js
// Substitúe en todo src/ a liña duplicada:
//   const API = process.env.REACT_APP_API || 'http://localhost:4000'
// por un import desde src/config/api.js, coa ruta relativa correcta.
//
// Uso (desde a raíz do frontend):
//   node scripts/migrate-api.js          → aplica os cambios
//   node scripts/migrate-api.js --dry    → só mostra que faría (non escribe)
//
// É reversible: revisa o resultado con `git diff` antes de commitear.
// ─────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const DRY = process.argv.includes('--dry');

const API_LINE = /^[ \t]*const API = process\.env\.REACT_APP_API \|\| 'http:\/\/localhost:4000';?[ \t]*\r?\n/m;

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'config') continue;
      walk(full, acc);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

// Ruta relativa desde o ficheiro ata src/config/api (sen extensión)
function relImport(file) {
  let rel = path.relative(path.dirname(file), path.join(SRC, 'config', 'api'));
  rel = rel.split(path.sep).join('/');           // Windows: \ → /
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

let changed = 0;
for (const file of walk(SRC)) {
  let code = fs.readFileSync(file, 'utf8');
  if (!API_LINE.test(code)) continue;

  const eol = code.includes('\r\n') ? '\r\n' : '\n';
  const importLine = `import { API } from '${relImport(file)}';${eol}`;

  // 1. quitar a liña const API
  code = code.replace(API_LINE, '');

  // 2. inserir o import despois do último import do bloque de cabeceira
  const lines = code.split(/(?<=\n)/);          // conserva os saltos
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import[\s{]/.test(lines[i])) lastImport = i;
    else if (lines[i].trim() !== '' && lastImport >= 0) break;
  }
  if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
  else lines.unshift(importLine);
  code = lines.join('');

  console.log(`${DRY ? '[dry] ' : ''}✓ ${path.relative(SRC, file)}  →  import { API } from '${relImport(file)}'`);
  if (!DRY) fs.writeFileSync(file, code, 'utf8');
  changed++;
}

console.log(`\n${DRY ? 'Faríanse' : 'Modificados'} ${changed} ficheiros.`);
if (changed && !DRY) console.log('Revisa con: git diff');
