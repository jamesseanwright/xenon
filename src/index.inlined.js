const audioContext = new AudioContext();
const baseScale = [0, 3, 5, 7];

const lead = audioContext.createOscillator();
const bass = audioContext.createOscillator();
const gain = audioContext.createGain();

gain.gain.value = 0.1;
lead.type = 'square';
bass.type = 'triangle';

[bass, lead].map(n => {
  n.connect(gain);
  n.start();
});

gain.connect(audioContext.destination);

// createGame();
let level = 1;
let score = 0;
let over = false;

const computeXPos = time =>
  time % 2 | 0
    ? [time % 2 | 0 ? -0.06 : 1, time % 1]
    : [time % 1, time % 2 | 0 ? -0.06 : 1];

const computeXSpeed = pos =>
  pos.map(p =>
    p === -0.06
      ? 0.004
      : p === 1
        ? -0.004
        : 0
  );

// createPlayer
let playerPos = [0.46, 0.46];
let playerSpeed = [0.005, 0];
let health = 1;

const xs = [0, 1, 2]
  .map(i => computeXPos(60 * i))
  .map((pos, i) => ({
    pos,
    s: computeXSpeed(pos), // speed - reserved Terser prop, but overriding in config isn't working
    deactivated: true,
    spawnDelayMs: i * 1000,
  }));

const keyboard = {};

// this === window in this scope
this.onkeydown = e => {
  audioContext.resume(); // Chrome autoplay policy
  keyboard[e.key] = !over;
};

this.onkeyup = e => {
  keyboard[e.key] = false;
};

const loop = now => {
  const time = Math.max(now, 0);

  // schedule music note change
  if (time % 333 < 16.66) {
    lead.frequency.value = 18.35 * 1.059 ** baseScale[time % 3 | 0] * 8;
    bass.frequency.value = 18.35 * 1.059 ** baseScale[(time + 1) % 4 | 0] * 4;
  }

  c.fillStyle = '#000';
  c.fillRect(0, 0, 98, 98);

  if (health <= 0) {
    over = true;
  } else {
    health -= 0.002;
  }

  playerSpeed.map((speed, i) => {
    playerPos[i] += speed;
  });

  if (keyboard.x) {
    playerSpeed = [-playerSpeed[1], playerSpeed[0]];
    keyboard.x = false; // to prevent infinite rotation
  }

  c.fillStyle = '#fff';
  c.translate((playerPos[0] + 0.0425) * 98, (playerPos[1] + 0.0425) * 98);
  c.rotate(Math.atan2(playerSpeed[1], playerSpeed[0]));

  c.beginPath();
  c.moveTo(-5.1, -5.1);
  c.lineTo(5.1, 1.275);
  c.lineTo(-5.1, 5.1);
  c.closePath();
  c.fill();
  c.resetTransform();

  xs.map(x => { // 'map'.length < 'forEach'.length
    if (x.deactivated && x.spawnDelayMs < time) {
      x.deactivated = false;
    }

    if (!x.deactivated) {
      if (x.pos.some(p => p < -0.06 || p > 1.06)) {
        x.pos = computeXPos(time);
        x.s = computeXSpeed(x.pos);
        x.spawnDelayMs = time;
      }

      x.s.map((speed, i) => {
        x.pos[i] += speed * level / 3 ;
      });

      c.fillStyle = '#ff0';

      c.translate((x.pos[0] + 0.03) * 98, (x.pos[1] + 0.03) * 98);
      c.rotate(0.002 * time);
      c.fillRect(-3.6, -3.6, 7.2, 7.2);

      c.beginPath();
      c.moveTo(-2.4, -2.4);
      c.lineTo(2.4, 2.4);
      c.stroke();

      c.beginPath();
      c.moveTo(-2.4, 2.4);
      c.lineTo(2.4, -2.4);
      c.stroke();

      c.resetTransform();

      if (
        playerPos[0] + 0.08 >= x.pos[0] &&
        playerPos[0] <= x.pos[0] + 0.06 &&
        playerPos[1] + 0.08 >= x.pos[1] &&
        playerPos[1] <= x.pos[1] + 0.06
      ) {
        health = 1;
        score += 1;

        if (score % 8 === 0) {
          level++;
        }

        x.pos = computeXPos(time);
        x.s = computeXSpeed(x.pos);
        x.spawnDelayMs = time;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'square';
        osc.frequency.value = 166;
        gain.gain.value = 0.2;

        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(time / 1000);
        osc.stop(time / 1000 + 0.05);
      }
    }
  });

  c.fillRect(6, 6, 0.9 * health * 98, 1.2);

  if (over) {
    c.fillStyle = '#fff';
    c.fillText('😢', 54, 64);
  }

  requestAnimationFrame(loop);
};

// sweet tricks to pixelate output
a.width = a.height = 98;

a.style.imageRendering = 'mozPaintCount' in this // shorter than user agent test
  ? 'optimizeSpeed'
  : 'pixelated';

requestAnimationFrame(loop);
