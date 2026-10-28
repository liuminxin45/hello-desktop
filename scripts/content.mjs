import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(fs.readFileSync(path.join(root, 'content/chapters.json'), 'utf8'));
export const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

export function markdownFiles(directory = root) {
  const ignore = new Set(['.git', '.cache', 'node_modules', 'bin', 'obj', 'artifacts', '.vs']);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (ignore.has(entry.name)) return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(full) : entry.name.endsWith('.md') ? [full] : [];
  });
}

export function withoutFences(source) {
  let inFence = false;
  const lines = source.split(/\r?\n/).map(line => {
    if (/^```/.test(line)) { inFence = !inFence; return ''; }
    return inFence ? '' : line;
  });
  if (inFence) throw new Error('Unclosed code fence');
  return lines.join('\n');
}

export function links(source) {
  return [...withoutFences(source).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(m => m[1]);
}

export function anchors(source) {
  const seen = new Map();
  return [...withoutFences(source).matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => {
    const slug = match[1].toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
    const number = seen.get(slug) ?? 0;
    seen.set(slug, number + 1);
    return number ? `${slug}-${number}` : slug;
  });
}

export function renderIndex() {
  const lines = ['# 阅读目录', '',
    '从[第 01 章](chapters/01-deliverable-client.md)开始，或按问题进入。24 章均已有首版正文，代码片段、独立实验和待读者执行的练习分别标注；正文完成不代表成品客户端已经实现。', '',
    '[学习方法](learning-method.md) · [框架路线](frameworks.md) · [实验与运行条件](../examples/README.md) · [毕业项目](capstone.md) · [实际验证范围](../editorial/validation.md)', ''];
  for (const part of catalog.parts) {
    lines.push(`## ${part.title}`, '');
    for (const chapter of catalog.chapters.filter(c => c.part === part.number && c.status === 'written')) {
      const title = read(chapter.path).match(/^# (.+)$/m)?.[1];
      if (!title) throw new Error(`Missing chapter title: ${chapter.path}`);
      lines.push(`- [${title}](${path.posix.relative('docs', chapter.path)})`);
    }
    lines.push('');
  }
  lines.push('目录由 `content/chapters.json` 和章节标题生成。编辑后运行 `npm run docs:index`；`npm test` 会检查目录是否一致。', '');
  return lines.join('\n');
}
