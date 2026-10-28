import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { markdownFiles, links } from './content.mjs';

const execute = promisify(execFile);
const windowsFallback = fileURLToPath(new URL('./check-url.ps1', import.meta.url));
const urls = [...new Set(markdownFiles().flatMap(file => links(fs.readFileSync(file, 'utf8')))
  .filter(url => /^https?:/.test(url)))];
const failures = [];
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    let failure;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          redirect: 'follow', signal: AbortSignal.timeout(25000),
          headers: { 'User-Agent': 'hello-desktop-link-check/0.1.0' }
        });
        await response.body?.cancel();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        failure = undefined;
        break;
      } catch (error) {
        failure = `${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`;
        if (process.platform === 'win32') {
          try {
            const { stdout } = await execute('powershell.exe',
              ['-NoLogo', '-NoProfile', '-NonInteractive', '-File', windowsFallback, '-Url', url],
              { windowsHide: true, timeout: 30000, maxBuffer: 65536 });
            const status = Number(stdout.trim());
            if (status < 200 || status >= 400 || !Number.isFinite(status))
              throw new Error(`Native HTTP status ${stdout.trim()}`);
            failure = undefined;
            break;
          } catch (nativeError) { failure += `; native HTTP check failed: ${nativeError.message}`; }
        }
      }
    }
    if (failure) failures.push({ url, reason: failure });
  }
}));
console.log(`External links: ${urls.length - failures.length}/${urls.length} reachable. This does not verify technical claims.`);
for (const failure of failures) console.error(`${failure.url}: ${failure.reason}`);
if (failures.length) process.exitCode = 1;
