import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('config.json'));

export default config;
