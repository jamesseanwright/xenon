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
  Array(3).fill(0)
    .map((_, i) => {
      const [pos, speed, spawnDelayMs] = computeXProps(i);

      return {
        type: 'x',
        pos,
        size: 0.06,
        speed,
        spawnable: true,
        deactivated: true,
        spawnDelayMs,
      }
    });

const resetX = (x, time) => {
  const [pos, speed, spawnDelayMs] = computeXProps(1, time);

  x.pos = pos;
  x.speed = speed;
  x.spawnDelayMs = spawnDelayMs;
};

const incrementScore = () => {
  game.score += 1;

  if (game.score % 8 === 0) {
    game.level++;
  }
};

const rotate = entity => {
  const [xSpeed, ySpeed] = entity.speed;
  entity.speed = [-ySpeed, xSpeed]; // TODO: make mutable for perf?! Profile!
};

const hasLeftWorld = e => e.pos.some(p => p < 0 - e.size || p > 1 + e.size);

const player = {
  type: 'p',
  pos: [0.5 - 0.085 / 2, 0.5 - 0.085 / 2],
  size: 0.085,
  speed: [0.005, 0],
  health: 1,
};

const healthBar = {
  type: 'h',
  player,
};

const game = {
  entities: [...generateXs(0), player, healthBar],
  level: 1,
  score: 0,
  iterationCount: 0,
  over: false,
};

const keyboard = {};

// this === window in this scope
this.onkeydown = e => {
  if (audioContext.state === 'suspended') {
    audioContext.resume(); // Chrome autoplay policy
  }

  keyboard[e.key] = !game.over;
};

this.onkeyup = e => {
  keyboard[e.key] = false;
};

const loop = time => {
  // schedule music note change
  const leadNote = baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
  const bassNote = baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
  const leadHz = 18.35 * 1.0594 ** leadNote * 8;
  const bassHz = 18.35 * 1.0594 ** bassNote * 4;

  lead.frequency.setValueAtTime(leadHz, audioContext.currentTime + 0.3 * game.iterationCount);
  bass.frequency.setValueAtTime(bassHz, audioContext.currentTime + 0.3 * game.iterationCount);

  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, a.width, a.height);

  if (game.over) {
    const message = 'Game Over!';
    const { width } = c.measureText(message);

    c.fillStyle = '#fff';
    c.fillText(message, a.width / 2 - width / 2, a.height / 2 - 8); // default font size is 16px
  }

  game.entities.forEach(entity => {
    if (entity.deactivated && entity.spawnDelayMs < time) {
      entity.deactivated = false;
    }

    if (entity.deactivated) {
      return;
    }

    if (entity.type === 'x') {
      if (hasLeftWorld(entity)) {
        resetX(entity, time);
      }

      entity.speed.forEach((speed, i) => {
        /* would rather set this in computeXProps, but
         * we're dependent upon game declaration being
         * bound when called by generateXs at startup */
        // e.pos[i] += speed;
        entity.pos[i] += speed * game.level / 3 ;
      });

      c.fillStyle = '#008';

      c.translate(...project(entity.pos[0] + 0.06 / 2, entity.pos[1] + 0.06 / 2));
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
    } else if (entity.type === 'h') {
      c.fillStyle = '#ff0';

      c.fillRect(
        ...project(
          0.05,
          0.05,
          (1 - 0.05 * 2) * entity.player.health,
          0.06 - 0.05,
        ),
      );
    } else { // assume player
      if (entity.health <= 0) {
        game.over = true;
      } else {
        entity.health -= 0.002;
      }

      entity.speed.forEach((speed, i) => {
        entity.pos[i] += speed;
      });

      if (keyboard.x) {
        rotate(entity);
        keyboard.x = false; // to prevent infinite rotation
      }

      game.entities.forEach(entity => {
        if (entity.type !== 'x' || entity.deactivated) {
          return;
        }

        if (
          player.pos[0] + player.size >= entity.pos[0] &&
          player.pos[0] <= entity.pos[0] + entity.size &&
          player.pos[1] + player.size >= entity.pos[1] &&
          player.pos[1] <= entity.pos[1] + entity.size
        ) {
          player.health = 1;
          incrementScore();
          resetX(entity, time);

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

      c.fillStyle = '#fff';
      c.translate(...project(entity.pos[0] + 0.085 / 2, entity.pos[1] + 0.085 / 2));
      c.rotate(Math.atan2(entity.speed[1], entity.speed[0]));

      c.beginPath();
      c.moveTo(...project(-0.085 / 2, -0.085 / 2));
      c.lineTo(...project(0.085 / 2, 0.085 / 8));
      c.lineTo(...project(-0.085 / 2, 0.085 / 2));
      c.lineTo(...project(-0.085 / 2, -0.085 / 2));
      c.closePath();
      c.fill();
      c.resetTransform();
    }
  });


  game.iterationCount++;
  requestAnimationFrame(loop);
};

// sweet tricks to pixelate output
a.width /= 4;
a.height /= 4;

a.style.imageRendering = navigator.userAgent.includes('Firefox')
  ? 'optimizeSpeed'
  : 'pixelated';

requestAnimationFrame(loop);
