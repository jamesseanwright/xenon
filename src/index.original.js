const WORLD_SIZE = 1;
const PLAYER_SPEED = 0.005;
const PLAYER_SIZE = 0.085;
const PLAYER_MAX_HEALTH = 1;
const SCORE_INCREMENT = 1;
const LEVEL_UP_THRESHOLD = 8;
const PLAYER_HEALTH_DECREMENT = 0.002;
const X_COUNT = 3;
const X_BASE_SPEED = 0.004;
const X_SPEED_DIVISOR = 3;
const X_SIZE = 0.06;
const X_ROTATION_SPEED = 0.002;
const SPAWN_DELAY_INCREMENT_MS = 1000;
const HEALTH_BAR_MARGIN = 0.05;
const HEALTH_BAR_HEIGHT = 0.06;
const TWELTH_ROOT_OF_TWO = 1.0594;
const MUSIC_BASE_HZ = 18.35;

const baseScale = [0, 3, 5, 7, 11];

const range = n => Array(n).fill(0);
const randomBit = () => Math.random() + 0.5 | 0;

const audioContext = new AudioContext();

const playCollectionSound = () => {
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
};

const createMusicScheduler = () => {
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

  return i => {
    const noteStart = audioContext.currentTime + (0.3 - 0.02 * (game.level - 1)) * i;
    const leadNote = baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
    const bassNote = baseScale[Math.floor(Math.random() * (baseScale.length - 1))];
    const leadHz = MUSIC_BASE_HZ * TWELTH_ROOT_OF_TWO ** leadNote * 8;
    const bassHz = MUSIC_BASE_HZ * TWELTH_ROOT_OF_TWO ** bassNote * 4;

    lead.frequency.setValueAtTime(leadHz, noteStart);
    bass.frequency.setValueAtTime(bassHz, noteStart);
  };
};

/* shared logic for width and height
 * as game world and screen projection
 * are square. This will save bytes! */
const project = (...inputs) => inputs.map(i => i * a.width);

const createPositionable = (x, y, size) => ({
  pos: [x, y],
  size,
});

const createMoveable = (xSpeed, ySpeed) => ({
  speed: [xSpeed, ySpeed],
});

const createSpawnable = spawnDelayMs => ({
  spawnable: true,
  deactivated: true,
  spawnDelayMs,
});

const createPlayer = () => ({
  ...createPositionable(0.5 - PLAYER_SIZE / 2, 0.5 - PLAYER_SIZE / 2, PLAYER_SIZE),
  ...createMoveable(PLAYER_SPEED, 0),
  type: 'player',
  health: PLAYER_MAX_HEALTH,
});

const createX = (x, y, xSpeed, ySpeed, spawnDelayMs) => ({
  ...createPositionable(x, y, X_SIZE),
  ...createMoveable(xSpeed, ySpeed),
  ...createSpawnable(spawnDelayMs),
  type: 'x',
});

const createHealthBar = player => ({
  player,
  type: 'healthBar',
});

const createGame = (...entities) => ({
  entities,
  level: 1,
  score: 0,
  iterationCount: 0,
  over: false,
});

/* Going to comment this function because
 * it's more involved than the others */
const computeXProps = (i, spawnOffsetMs = 0) => {
  // the outer side at which the x sits, above or below the game world on the x or y axis
  const outerScalar = randomBit() === 0 ? -X_SIZE : WORLD_SIZE;

  // the second coordinate _within_ the game world's bounds
  const innerScalar = Math.random();

  /* A means of randomising whether the outer or inner is
   * used for the x or y value, which can be spread */
  const pos = randomBit() === 0
    ? [outerScalar, innerScalar]
    : [innerScalar, outerScalar];

  /* negate the pos vector so the x travels in the
   * right direction. Sorry for the nested ternary! */
  const speed = pos.map(p =>
    p === -X_SIZE
      ? X_BASE_SPEED
      : p === WORLD_SIZE
        ? -X_BASE_SPEED
        : 0
  );

  const spawnDelayMs = i * SPAWN_DELAY_INCREMENT_MS + spawnOffsetMs;

  return [pos, speed, spawnDelayMs];
};

const generateXs = () =>
  range(X_COUNT)
    .map((_, i) => {
      const [pos, speed, spawnDelayMs] = computeXProps(i);

      return createX(
        ...pos,
        ...speed,
        spawnDelayMs,
      );
    });

const resetX = (x, time) => {
  const [pos, speed, spawnDelayMs] = computeXProps(1, time);

  x.pos = pos;
  x.speed = speed;
  x.spawnDelayMs = spawnDelayMs;
};

const incrementScore = () => {
  game.score += SCORE_INCREMENT;

  if (game.score % LEVEL_UP_THRESHOLD === 0) {
    game.level++;
  }
};

const rotate = entity => {
  const [xSpeed, ySpeed] = entity.speed;
  entity.speed = [-ySpeed, xSpeed]; // TODO: make mutable for perf?! Profile!
};

const areColliding = (a, b) =>
  a.pos[0] + a.size >= b.pos[0] &&
  a.pos[0] <= b.pos[0] + b.size &&
  a.pos[1] + a.size >= b.pos[1] &&
  a.pos[1] <= b.pos[1] + b.size;

const handleCollisions = (player, entities, time) => {
  entities.forEach(entity => {
    if (entity.type !== 'x' || entity.deactivated) {
      return;
    }

    if (areColliding(player, entity)) {
      player.health = PLAYER_MAX_HEALTH;
      incrementScore();
      resetX(entity, time);
      playCollectionSound();
    }
  });
};

const hasLeftWorld = e => e.pos.some(p => p < 0 - e.size || p > 1 + e.size);

const entityOperations = {
  x: (e, time) => {
    if (hasLeftWorld(e)) {
      resetX(e, time);
    }

    e.speed.forEach((speed, i) => {
      /* would rather set this in computeXProps, but
       * we're dependent upon game declaration being
       * bound when called by generateXs at startup */
      // e.pos[i] += speed;
      e.pos[i] += speed * game.level / X_SPEED_DIVISOR ;
    });

    c.fillStyle = '#008';

    c.translate(...project(e.pos[0] + X_SIZE / 2, e.pos[1] + X_SIZE / 2));
    c.rotate(X_ROTATION_SPEED * time);
    c.fillRect(...project(-X_SIZE / 2, -X_SIZE / 2, X_SIZE, X_SIZE));

    const [fontSize] = project(X_SIZE);

    c.fillStyle = '#fff';
    c.font = `${fontSize}px sans-serif`;

    c.fillText('X', ...project(-X_SIZE / 2.9, X_SIZE / 2.8));
    c.resetTransform();
  },

  player: (player, time, entities) => {
    if (player.health <= 0) {
      game.over = true;
    } else {
      player.health -= PLAYER_HEALTH_DECREMENT;
    }

    player.speed.forEach((speed, i) => {
      player.pos[i] += speed;
    });

    if (keyboard.x) {
      rotate(player);
      keyboard.x = false; // to prevent infinite rotation
    }

    handleCollisions(player, entities, time);

    c.fillStyle = '#fff';
    c.translate(...project(player.pos[0] + PLAYER_SIZE / 2, player.pos[1] + PLAYER_SIZE / 2));
    c.rotate(Math.atan2(player.speed[1], player.speed[0]));

    c.beginPath();
    c.moveTo(...project(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2));
    c.lineTo(...project(PLAYER_SIZE / 2, PLAYER_SIZE / 8)); // TODO: still not exactly equilateral...
    c.lineTo(...project(-PLAYER_SIZE / 2, PLAYER_SIZE / 2));
    c.closePath();
    c.fill();
    c.resetTransform();
  },

  healthBar: healthBar => {
    c.fillStyle = '#ff0';

    c.fillRect(
      ...project(
        HEALTH_BAR_MARGIN,
        HEALTH_BAR_MARGIN,
        (PLAYER_MAX_HEALTH - HEALTH_BAR_MARGIN * 2) * healthBar.player.health,
        HEALTH_BAR_HEIGHT - HEALTH_BAR_MARGIN,
      ),
    );
  },
};

const renderGameOverMessage = () => {
  c.font = '24px sans-serif';

  const message = 'Game Over!';
  const { width } = c.measureText(message);

  c.fillStyle = '#fff';
  c.fillText(message, a.width / 2 - width / 2, a.height / 2 - 12);
};

const player = createPlayer();
const game = createGame(...generateXs(0), player, createHealthBar(player));

const bindKeyboard = eventTarget => {
  const bindings = {};

  eventTarget.onkeydown = e => {
    if (audioContext.state === 'suspended') {
      audioContext.resume(); // Chrome autoplay policy
    }

    bindings[e.key] = !game.over;
  };

  eventTarget.onkeyup = e => {
    bindings[e.key] = false;
  };

  return bindings;
};

// this === window in this scope
const keyboard = bindKeyboard(this);
const scheduleNoteChange = createMusicScheduler();

const loop = time => {
  scheduleNoteChange(game.iterationCount);

  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, a.width, a.height);

  if (game.over) {
    renderGameOverMessage();
  }

  game.entities.forEach(entity => {
    if (entity.deactivated && entity.spawnDelayMs < time) {
      entity.deactivated = false;
    }

    if (entity.deactivated) {
      return;
    }

    entityOperations[entity.type](entity, time, game.entities);
  });


  game.iterationCount++;
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
