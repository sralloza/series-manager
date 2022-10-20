import { readFileSync } from 'fs';
import { Config } from './models/config';

const config: Config = JSON.parse(readFileSync('config.json').toString());
export default config;
