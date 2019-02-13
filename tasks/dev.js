#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const build = require('./build');

(async () => {
  const srcDir = path.resolve(__dirname, '..', 'src');

  console.log('Watching for changes...');

  fs.watch(srcDir, eventType => {
    if (eventType !== 'change') {
      return;
    }

    try {
      build();
    } catch (e) {
      console.error('Build failed', e);
    }
  });
})();
