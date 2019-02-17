#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const { cmdRegPack } = require('regpack');
const terser = require('terser');
const terserConfig = require('../terserconfig.json');
const regPackConfig = require('../regpackconfig.json');
const js1kConfig = require('../js1kconfig.json');
const stats = require('../stats.json');

const sourceDir = path.resolve(__dirname, '..', 'src');
const distDir = path.resolve(__dirname, '..', 'dist');
const jsPath = path.resolve(sourceDir, 'index.js');
const htmlPath = path.resolve(sourceDir, 'index.html');
const statsPath = path.resolve(__dirname, '..', 'stats.json');

const serialiseSubmissionConfig = () =>
  Object.entries(js1kConfig).reduce(
    (serialised, [key, value]) => serialised + `\nvar ${key} = ${value};`,
    '',
  );

const addStats = (original, minified, packed) => {
  stats.push({
    original,
    minified,
    packed,
  });
};

const writeStats = () => {
  fs.writeFileSync(statsPath, JSON.stringify(stats));
};

const build = () => {
  const js = fs.readFileSync(jsPath).toString();
  const html = fs.readFileSync(htmlPath).toString();
  const dom = new JSDOM(html);
  const { error, code } = terser.minify(js, terserConfig);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const packedCode = cmdRegPack(code, regPackConfig);
  const scriptTarget = dom.window.document.querySelector('script[type="demo"]');
  const configTarget = dom.window.document.querySelector('script[id="config"]');

  scriptTarget.textContent = packedCode;
  configTarget.textContent = serialiseSubmissionConfig();

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  fs.writeFileSync(path.resolve(distDir, 'index.html'), dom.serialize());

  console.log(`Output successful! Final build is ${packedCode.length} bytes!`);
  addStats(js.length, code.length, packedCode.length);
};

module.exports = build;

// Thus it's a module _and_ an executable. Naughty!
build();

process.on('SIGINT', () => {
  writeStats();
});

process.on('exit', () => {
  writeStats();
});
