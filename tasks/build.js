#!/usr/bin/env node

'use strict';

const path = require('path');
const fs = require('fs');
const terser = require('terser');
const { JSDOM } = require('jsdom');

const sourceDir = path.resolve(__dirname, '..', 'src');
const distDir = path.resolve(__dirname, '..', 'dist');
const jsPath = path.resolve(sourceDir, 'index.js');
const htmlPath = path.resolve(sourceDir, 'index.html');

const build = () => {
  const js = fs.readFileSync(jsPath).toString();
  const html = fs.readFileSync(htmlPath).toString();
  const dom = new JSDOM(html);
  const { error, code } = terser.minify(js);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const scriptTarget = dom.window.document.querySelector('script[type="demo"]');

  scriptTarget.textContent = code;

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  fs.writeFileSync(path.resolve(distDir, 'index.html'), dom.serialize());

  console.log(`Output successful! Core code is ${code.length} bytes!`);
};

module.exports = build;

build(); // Thus it's a module _and_ an executable. Cheeky!
