import fs from 'node:fs';
import path from 'node:path';
import { root, renderIndex } from './content.mjs';

fs.writeFileSync(path.join(root, 'docs/index.md'), renderIndex(), 'utf8');
console.log('Generated docs/index.md from the chapter catalog.');
