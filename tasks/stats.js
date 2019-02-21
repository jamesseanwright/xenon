'use strict';

const fs = require('fs');
const path = require('path');
const statsPath = path.resolve(__dirname, '..', 'stats.json');
let stats = require('../stats.json');

const doDatesMatch = (currentEntry, nextEntry) => {
  const currentDate = new Date(currentEntry.date);
  const nextDate = new Date(nextEntry.date);

  return ['getDate', 'getMonth', 'getYear'].every(
    method => currentDate[method]() === nextDate[method](),
  );
};

/* Removes adjacant stats that share
 * the same date, month, and year */
const pruneStats = () =>
  (stats = stats.map((currentEntry, i) => {
    const nextEntry = currentEntry[i + 1];

    return currentEntry &&
      nextEntry &&
      doDatesMatch(currentEntry, nextEntry)
      ? undefined
      : currentEntry;
  }).filter(Boolean));

const addStats = (original, minified, packed) => {
  stats.push({
    date: new Date(),
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
