const fs = require('fs');
const path = require('path');
const stats = require('../stats.json');
const statsPath = path.resolve(__dirname, '..', 'stats.json');

const pruneStats = () =>
  stats.reduce((pruned, entry) =>
    [
      ...pruned,
      pruned.find(({ original, minified, packed }) =>
        original === entry.original &&
        minified === entry.minified &&
        packed === entry.packed
      ) ? undefined : entry,
    ]).filter(Boolean);

const addStats = (original, minified, packed) => {
  stats.push({
    original,
    minified,
    packed,
  });
};

const writeStats = (newStats) => {
  fs.writeFileSync(statsPath, JSON.stringify(newStats));
};
