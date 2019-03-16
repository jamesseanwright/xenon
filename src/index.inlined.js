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

/* shared logic for width and height
 * as game world and screen projection
 * are square. This will save bytes! */
const project = (...inputs) => inputs.map(i => i * a.width);

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

const generateXs = () =>
  [0, 1, 2]
    .map(i => {
      const [pos, speed, spawnDelayMs] = computeXProps(i);

      return {
        type: 'x',
        pos,
        size: 0.06,
        speed,
        spawnable: true,
        deactivated: true,
        spawnDelayMs,
      };
    });

const resetX = (x, time) => {
  const [pos, speed, spawnDelayMs] = computeXProps(0, time);

  x.pos = pos;
  x.speed = speed;
  x.spawnDelayMs = spawnDelayMs;
};

const player = {
  pos: [0.5 - 0.085 / 2, 0.5 - 0.085 / 2],
  size: 0.085,
  speed: [0.005, 0],
  health: 1,
};

const xs = generateXs(0);

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
      x.pos[i] += speed * level / 3 ;
    });

    c.fillStyle = '#008';

    c.translate(...project(x.pos[0] + 0.06 / 2, x.pos[1] + 0.06 / 2));
    c.rotate(0.002 * time);
    c.fillRect(...project(-0.06 / 2, -0.06 / 2, 0.06, 0.06));

    c.strokeStyle = '#fff';

    c.beginPath();
    c.moveTo(...project(-0.06 / 2 + 0.01, -0.06 / 2 + 0.01));
    c.lineTo(...project(0.06 / 2 - 0.01, 0.06 / 2 - 0.01));
    c.closePath();
    c.stroke();

    c.beginPath();
    c.moveTo(...project(-0.06 / 2 + 0.01, 0.06 / 2 - 0.01));
    c.lineTo(...project(0.06 / 2 - 0.01, -0.06 / 2 + 0.01));
    c.closePath();
    c.stroke();

    c.resetTransform();

    if (
      player.pos[0] + player.size >= x.pos[0] &&
      player.pos[0] <= x.pos[0] + x.size &&
      player.pos[1] + player.size >= x.pos[1] &&
      player.pos[1] <= x.pos[1] + x.size
    ) {
      player.health = 1;
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

  if (player.health <= 0) {
    over = true;
  } else {
    player.health -= 0.002;
  }

  player.speed.forEach((speed, i) => {
    player.pos[i] += speed;
  });

  if (keyboard.x) {
    player.speed = [-player.speed[1], player.speed[0]];
    keyboard.x = false; // to prevent infinite rotation
  }

  c.fillStyle = '#fff';
  c.translate(...project(player.pos[0] + 0.085 / 2, player.pos[1] + 0.085 / 2));
  c.rotate(Math.atan2(player.speed[1], player.speed[0]));

  c.beginPath();
  c.moveTo(...project(-0.085 / 2, -0.085 / 2));
  c.lineTo(...project(0.085 / 2, 0.085 / 8));
  c.lineTo(...project(-0.085 / 2, 0.085 / 2));
  c.lineTo(...project(-0.085 / 2, -0.085 / 2));
  c.closePath();
  c.fill();
  c.resetTransform();

  c.fillStyle = '#ff0';

  c.fillRect(
    ...project(
      0.05,
      0.05,
      (1 - 0.05 * 2) * player.health,
      0.06 - 0.05,
    ),
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

// sweet tricks to pixelate output
a.width /= 4;
a.height /= 4;

a.style.imageRendering = 'mozPaintCount' in this // shorter than user agent test
  ? 'optimizeSpeed'
  : 'pixelated';

requestAnimationFrame(loop);
