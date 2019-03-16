const audioContext = new AudioContext();
const baseScale = [0, 3, 5, 7];

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
let playerPos = [0.5 - 0.085 / 2, 0.5 - 0.085 / 2];
let playerSpeed = [0.005, 0];
let health = 1;

const xs = [0, 1, 2]
  .map(i => computeXPos(60 * i))
  .map((pos, i) => ({
    pos,
    speed: computeXSpeed(pos),
    deactivated: true,
    spawnDelayMs: 1000 * i,
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

const loop = time => {
  // schedule music note change
  if (time % 333 < 16.66) {
    lead.frequency.value = 18.35 * 1.0594 ** baseScale[time % 4 | 0] * 8;
    bass.frequency.value = 18.35 * 1.0594 ** baseScale[(time + 2) % 4 | 0] * 4;
  }

  c.fillStyle = '#000';
  c.fillRect(0, 0, 480, 480);

  xs.map(x => {
    if (x.deactivated && x.spawnDelayMs < time) {
      x.deactivated = false;
    }

    if (x.deactivated) {
      return;
    }

    if (x.pos.some(p => p < 0 - 0.06 || p > 1 + 0.06)) {
      x.pos = computeXPos(time);
      x.speed = computeXSpeed(x.pos);
      x.spawnDelayMs = time;
    }

    x.speed.map((speed, i) => {
      x.pos[i] += speed * level / 3;
    });

    c.fillStyle = '#008';

    c.translate((x.pos[0] + 0.06 / 2) * 480, (x.pos[1] + 0.06 / 2) * 480);
    c.rotate(0.002 * time);
    c.fillRect(-14.4, -14.4, 28.8, 28.8);

    c.fillStyle = '#fff';
    c.font = '28.8px sans-serif';

    c.fillText('X', (-28.8) / 2.9, (28.8) / 2.8);

    c.resetTransform();

    if (
      playerPos[0] + 0.085 >= x.pos[0] &&
      playerPos[0] <= x.pos[0] + 0.06 &&
      playerPos[1] + 0.085 >= x.pos[1] &&
      playerPos[1] <= x.pos[1] + 0.06
    ) {
      health = 1;
      score += 1;

      if (score % 8 === 0) {
        level++;
      }

      x.pos = computeXPos(time);
      x.speed = computeXSpeed(x.pos);
      x.spawnDelayMs = time;

      const osc = audioContext.createOscillator();

      osc.frequency.value = 340;

      osc.connect(gain);
      osc.start(time / 1000); // TODO: out of sync
      osc.stop(time / 1000 + 0.025);
    }
  });

  if (health <= 0) {
    over = true;
  } else {
    health -= 0.002;
  }

  playerSpeed.map((speed, i) => { // 'map'.length < 'forEach'.length
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
  c.moveTo(-20.4, -20.4);
  c.lineTo(20.4, 5.1);
  c.lineTo(-20.4, 20.4);
  c.closePath();
  c.fill();
  c.resetTransform();

  if (over) {
    c.fillText('Game Over!', 161.5, 232);
  }

  c.fillStyle = '#ff0';
  c.fillRect(24, 24, health * 432, 4.8);

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
