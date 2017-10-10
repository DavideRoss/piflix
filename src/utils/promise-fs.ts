import * as fs from 'fs';
import { promisify } from 'util';

export let readdir = promisify(fs.readdir);