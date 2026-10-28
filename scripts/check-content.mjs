import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { root, catalog, read, markdownFiles, withoutFences, links, anchors, renderIndex } from './content.mjs';

assert.equal(catalog.chapters.length, 24, 'Expected the agreed 24-chapter main course');
const paths = new Set();
for (const [index, chapter] of catalog.chapters.entries()) {
  assert.equal(chapter.number, index + 1, 'Chapter numbers must be sequential');
  assert.equal(chapter.part, Math.floor(index / 4) + 1, 'Unexpected course part');
  assert.equal(chapter.status, 'written');
  assert(!paths.has(chapter.path), `Duplicate path: ${chapter.path}`);
  paths.add(chapter.path);
  const source = read(chapter.path);
  assert(source.startsWith(`# ${String(chapter.number).padStart(2, '0')} `), `Title mismatch: ${chapter.path}`);
  assert(source.includes('## 检查理解'), `Missing understanding questions: ${chapter.path}`);
  assert((source.match(/\*\*[^\n]+？\*\*/g) ?? []).length >= 2, `Need two answered questions: ${chapter.path}`);
  assert(source.includes('参考：'), `Missing source links: ${chapter.path}`);
  assert(links(source).includes('../index.md'), `Missing index navigation: ${chapter.path}`);
  if (index > 0) assert(links(source).includes(path.posix.basename(catalog.chapters[index - 1].path)), `Missing previous chapter: ${chapter.path}`);
  if (index < 23) assert(links(source).includes(path.posix.basename(catalog.chapters[index + 1].path)), `Missing next chapter: ${chapter.path}`);
}
const actualChapters = fs.readdirSync(path.join(root, 'docs/chapters')).filter(p => p.endsWith('.md'));
assert.equal(actualChapters.length, paths.size, 'Uncatalogued chapter');
assert.equal(read('docs/index.md'), renderIndex(), 'Index is stale: run npm run docs:index');

let local = 0;
const documents = markdownFiles();
for (const file of documents) {
  const source = fs.readFileSync(file, 'utf8');
  const label = path.relative(root, file);
  assert.equal((withoutFences(source).match(/^# /gm) ?? []).length, 1, `Expected one H1: ${label}`);
  assert(!/^(?:<<<<<<<|=======|>>>>>>>)(?: |$)/m.test(source), `Conflict marker: ${label}`);
  assert(!/[\t ]+\r?$/m.test(source), `Trailing whitespace: ${label}`);
  assert(source.endsWith('\n'), `Missing final newline: ${label}`);
  for (const link of links(source)) {
    if (/^(?:https?:|mailto:)/.test(link)) continue;
    const [target, fragment] = link.split('#');
    const full = target ? path.resolve(path.dirname(file), decodeURIComponent(target)) : file;
    const relative = path.relative(root, full);
    assert(!relative.startsWith('..') && !path.isAbsolute(relative), `Link escapes repository: ${label} -> ${link}`);
    assert(fs.statSync(full).isFile(), `Broken local link: ${label} -> ${link}`);
    if (fragment) assert(anchors(fs.readFileSync(full, 'utf8')).includes(decodeURIComponent(fragment)), `Missing anchor: ${label} -> ${link}`);
    local++;
  }
}
console.log(`PASS: 24 chapters, ${documents.length} Markdown files, ${local} local links, navigation, fences and text hygiene.`);
