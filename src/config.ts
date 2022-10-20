import dotenv from "dotenv";
import { readFileSync } from 'fs';
import { Config } from './models/config';

dotenv.config();

const config: Config = JSON.parse(readFileSync('config.json').toString());
const token = process.env.TODOIST_API_TOKEN;
if (!token) {
  throw new Error('TODOIST_API_TOKEN not set');
}
config.todoist.token = token;
export default config;
