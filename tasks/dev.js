#!/usr/bin/env node

'use strict';

const fs = require('fs');
const build = require('./build');

(async () => {
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
