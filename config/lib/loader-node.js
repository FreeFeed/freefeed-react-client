import path from 'path';
import { readFileSync } from 'fs';

import base from '../default';
import { merge } from './merge';

global.CONFIG = base;
try {
  const content = readFileSync(path.join(__dirname, '../local.json'), { encoding: 'utf-8' });
  global.CONFIG = merge(base, JSON.parse(content));
} catch (err) {
  // do nothing
}
