'use strict';

const fs = require('fs');
const path = require('path');
const statsPath = path.resolve(__dirname, '..', 'stats.json');
let stats = require('../stats.json');

const areEntriesIdentical = (currentEntry, nextEntry) => {
  ['original', 'minified', 'packed'].every(
    prop => currentEntry[prop]() === nextEntry[prop],
  );
};

/* Removes adjacant stats that share
 * the same date, month, and year */
const pruneStats = () =>
  (stats = stats.map((currentEntry, i) => {
    const nextEntry = currentEntry[i + 1];

    return currentEntry &&
      nextEntry &&
      areEntriesIdentical(currentEntry, nextEntry)
      ? undefined
      : currentEntry;
  }).filter(Boolean));

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

module.exports = {
  pruneStats,
  addStats,
  writeStats,
};
