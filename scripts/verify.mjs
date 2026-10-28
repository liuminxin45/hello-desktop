import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const script of ['scripts/check-content.mjs', 'examples/sqlite/transactions.mjs'])
  execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' });
