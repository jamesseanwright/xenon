const audioContext = new AudioContext();
const baseScale = [0, 3, 5, 7, 11];

const lead = audioContext.createOscillator();
const bass = audioContext.createOscillator();
const gain = audioContext.createGain();

gain.gain.value = 0.1;
lead.type = 'square';
bass.type = 'triangle';

bass.connect(gain);
lead.connect(gain);
gain.connect(audioContext.destination);
lead.start();
bass.start();

// createGame();
let level = 1;
let score = 0;
let iterationCount = 0;
let over = false;

/* Going to comment this function because
 * it's more involved than the others */
const computeXProps = (i, spawnOffsetMs = 0) => {
  // the outer side at which the x sits, above or below the game world on the x or y axis
  const outerScalar = Math.random() + 0.5 | 0 === 0 ? -0.06 : 1;

  // the second coordinate _within_ the game world's bounds
  const innerScalar = Math.random();

  /* A means of randomising whether the outer or inner is
   * used for the x or y value, which can be spread */
  const pos = Math.random() + 0.5 | 0 === 0
    ? [outerScalar, innerScalar]
    : [innerScalar, outerScalar];

  /* negate the pos vector so the x travels in the
   * right direction. Sorry for the nested ternary! */
  const speed = pos.map(p =>
    p === -0.06
      ? 0.004
      : p === 1
        ? -0.004
        : 0
  );

  const spawnDelayMs = i * 1000 + spawnOffsetMs;

  return [pos, speed, spawnDelayMs];
};

const resetX = (x, time) => {
  const [pos, speed, spawnDelayMs] = computeXProps(0, time);

  x.pos = pos;
  x.speed = speed;
  x.spawnDelayMs = spawnDelayMs;
};

// createPlayer
let playerPos = [0.5 - 0.085 / 2, 0.5 - 0.085 / 2];
let playerSpeed = [0.005, 0];
let health = 1;

const xs = [0, 1, 2]
  .map(i => {
    const [pos, speed, spawnDelayMs] = computeXProps(i);

    return {
      pos,
      size: 0.06,
      speed,
      spawnable: true,
      deactivated: true,
      spawnDelayMs,
    };
  });

const keyboard = {};

// this === window in this scope
this.onkeydown = e => {
  if (audioContext.state === 'suspended') {
    audioContext.resume(); // Chrome autoplay policy
  }

  keyboard[e.key] = !over;
};

this.onkeyup = e => {
  keyboard[e.key] = false;
};

const loop = time => {
  // schedule music note change
  lead.frequency.setValueAtTime(
    18.35 * 1.0594 ** baseScale[Math.floor(Math.random() * (baseScale.length - 1))] * 8,
    audioContext.currentTime + 0.3 * iterationCount,
  );

  bass.frequency.setValueAtTime(
    18.35 * 1.0594 ** baseScale[Math.floor(Math.random() * (baseScale.length - 1))] * 4,
    audioContext.currentTime + 0.3 * iterationCount,
  );

  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, a.width, a.height);

  xs.forEach(x => {
    if (x.deactivated && x.spawnDelayMs < time) {
      x.deactivated = false;
    }

    if (x.deactivated) {
      return;
    }

    if (x.pos.some(p => p < 0 - x.size || p > 1 + x.size)) {
      resetX(x, time);
    }

    x.speed.forEach((speed, i) => {
      x.pos[i] += speed * level / 3;
    });

    c.fillStyle = '#008';

    c.translate((x.pos[0] + 0.06 / 2) * 480, (x.pos[1] + 0.06 / 2) * 480);
    c.rotate(0.002 * time);
    c.fillRect(-0.06 / 2 * 480, -0.06 / 2 * 480, 0.06 * 480, 0.06 * 480);

    c.fillStyle = '#fff';
    c.font = `${0.06 * 480}px sans-serif`;

    c.fillText('X', (-0.06 * 480) / 2.9, (0.06 * 480) / 2.8);

    c.resetTransform();

    if (
      playerPos[0] + 0.085 >= x.pos[0] &&
      playerPos[0] <= x.pos[0] + x.size &&
      playerPos[1] + 0.085 >= x.pos[1] &&
      playerPos[1] <= x.pos[1] + x.size
    ) {
      health = 1;
      score += 1;

      if (score % 8 === 0) {
        level++;
      }

      resetX(x, time);

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'square';
      osc.frequency.value = 166;

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.3);
    }
  });

  if (health <= 0) {
    over = true;
  } else {
    health -= 0.002;
  }

  playerSpeed.forEach((speed, i) => {
    playerPos[i] += speed;
  });

  if (keyboard.x) {
    playerSpeed = [-playerSpeed[1], playerSpeed[0]];
    keyboard.x = false; // to prevent infinite rotation
  }

  c.fillStyle = '#fff';
  c.translate((playerPos[0] + 0.085 / 2) * 480, (playerPos[1] + 0.085 / 2) * 480);
  c.rotate(Math.atan2(playerSpeed[1], playerSpeed[0]));

  c.beginPath();
  c.moveTo(-0.085 / 2 * 480, -0.085 / 2 * 480);
  c.lineTo(0.085 / 2 * 480, 0.085 / 8 * 480);
  c.lineTo(-0.085 / 2 * 480, 0.085 / 2 * 480);
  c.lineTo(-0.085 / 2 * 480, -0.085 / 2 * 480);
  c.closePath();
  c.fill();
  c.resetTransform();

  c.fillStyle = '#ff0';

  c.fillRect(
    0.05 * 480,
    0.05 * 480,
    (1 - 0.05 * 2) * health * 480,
    (0.06 - 0.05) * 480,
  );

  if (over) {
    c.fillStyle = '#fff';

    c.fillText(
      'Game Over!',
      a.width / 2 - c.measureText('Game Over!').width / 2,
      a.height / 2 - 8,
    );
  }

  iterationCount++;
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
