#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const firefox = require('puppeteer-firefox');
const build = require('./build');

(async () => {
  const srcDir = path.resolve(__dirname, '..', 'src');
  const htmlPath = path.resolve(__dirname, '..', 'dist', 'index.html');
  const browser = await firefox.launch({ headless: false });
  const page = await browser.newPage();
  const launchUrl = `file://${htmlPath}`;

  await page.goto(launchUrl);

  console.log('Watching for changes...');

  fs.watch(srcDir, eventType => {
    if (eventType !== 'change') {
      return;
    }

    try {
      build();
      page.reload();
    } catch (e) {
      console.error('Build failed', e);
    }

  });
})();
