import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const available = ['platform', 'auth', 'workspace', 'hiring', 'management', 'image-optimization', 'header', 'home'];
const requested = process.argv.slice(2);
const unknown = requested.filter(name => !available.includes(name));
if (unknown.length) throw new Error(`Verificaciones desconocidas: ${unknown.join(', ')}`);
const checks = requested.length ? [...new Set(requested)] : available;
const results = [];

for (const name of checks) {
  console.log(`\nVerificando ${name}…`);
  const started = Date.now();
  const result = await new Promise(resolve => {
    const child = spawn(process.execPath, [`scripts/verify-${name}.mjs`], { cwd: root, stdio: 'inherit' });
    child.once('error', error => resolve({ code: 1, error: error.message }));
    child.once('close', (code, signal) => resolve({ code: code ?? 1, signal }));
  });
  results.push({ name, ...result, durationMs: Date.now() - started });
}

const failed = results.filter(result => result.code !== 0);
const out = new URL('../artifacts/verification/', import.meta.url);
await mkdir(out, { recursive: true });
await writeFile(new URL('summary.json', out), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
console.log(`\n${checks.length - failed.length}/${checks.length} verificaciones correctas.`);
if (failed.length) {
  console.error(`Fallaron: ${failed.map(result => result.name).join(', ')}`);
  process.exitCode = 1;
}
