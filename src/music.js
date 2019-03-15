const twelthRootOfTwo = 1.0594;
const bazeHz = 18.35;
const baseScale = [0, 3, 5, 7, 11];

const ctx = new AudioContext();
const lead = ctx.createOscillator();
const bass = ctx.createOscillator();
const gain = ctx.createGain();

gain.gain.value = 0.4;
lead.type = 'square';
bass.type = 'triangle';

bass.connect(gain);
lead.connect(gain);
gain.connect(ctx.destination);
lead.start();
bass.start();

Array(200)
  .fill(0)
  .forEach((_, i) => {
    const noteStart = ctx.currentTime + 0.3 * i;
    const leadNote =
      baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
    const bassNote =
      baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
    const leadHz = bazeHz * twelthRootOfTwo ** leadNote * 8;
    const bassHz = bazeHz * twelthRootOfTwo ** bassNote * 4;

    lead.frequency.setValueAtTime(leadHz, noteStart);
    bass.frequency.setValueAtTime(bassHz, noteStart);
  });
