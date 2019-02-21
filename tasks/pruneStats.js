#!/usr/bin/env node

'use strict';

const { pruneStats, writeStats } = require('./stats');

console.log('Pruning stats...');

pruneStats();
writeStats();
