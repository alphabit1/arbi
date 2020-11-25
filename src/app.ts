/*
 * Copyright (c) 2020 AlphaBit
 *
 * Author: DonkeyCoin
 */

import pino from 'pino';
import fs from 'fs';
import Arbi, { ArbiConfig } from './Arbi';

const log: pino.Logger = pino({ level: 'debug' });

const args = process.argv.slice(2);
let configPath = args[0];
if (!configPath) {
  configPath = 'config.json';
}
log.debug(`Loading config: ${configPath}`);
const config: ArbiConfig = JSON.parse(fs.readFileSync(configPath).toString()) as ArbiConfig;

const arbi = new Arbi(config, log);
arbi.start();
