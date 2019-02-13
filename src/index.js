const PLAYER_SPEED = 0.005;
const PLAYER_SIZE = 0.08;
const PLAYER_MAX_HEALTH = 1;
const PLAYER_HEALTH_DECREMENT = 0.002;
const X_BASE_SPEED = 0.004;
const X_SIZE = 0.06;
const X_PADDING = 0.01;
const X_ROTATION_SPEED = 0.002;
const HEALTH_BAR_MARGIN = 0.05;
const HEALTH_BAR_HEIGHT = 0.06;

/* shared logic for width and height
 * as game world and screen projection
 * are square. This will save bytes! */
const toPixels = (...inputs) => inputs.map(i => i * a.width);

const createPositionable = (x, y, size) => ({
  pos: [x, y],
  size,
});

const createMoveable = (xSpeed, ySpeed) => ({
  speed: [xSpeed, ySpeed]
});

const createPlayer = () => ({
  ...createPositionable(0.5 - PLAYER_SIZE / 2, 0.5 - PLAYER_SIZE / 2, PLAYER_SIZE),
  ...createMoveable(PLAYER_SPEED, 0),
  type: 'player',
  health: PLAYER_MAX_HEALTH,
});

const createX = (x, y) => ({
  ...createPositionable(x, y, X_SIZE),
  ...createMoveable(X_BASE_SPEED, 0),
  type: 'x',
});

const createHealthBar = player => ({
  player,
  type: 'healthBar',
});

const createGame = (...entities) => ({
  entities,
  score: 0,
});

const bindKeyboard = eventTarget => {
  const bindings = {};

  eventTarget.onkeydown = e => {
    bindings[e.key] = true;
  };

  eventTarget.onkeyup = e => {
    bindings[e.key] = false;
  };

  return bindings;
};

// this === window in this scope
const keyboard = bindKeyboard(this);

const rotate = entity => {
  const [xSpeed, ySpeed] = entity.speed;
  entity.speed = [-ySpeed, xSpeed];
};

const areColliding = (a, b) =>
  a.pos[0] >= b.pos[0] && a.pos[1] >= b.pos[1] && a.pos[0] <= b.pos[0] + b.size && a.pos[1] <= b.pos[1] + b.size;

const handleCollisions = (player, entities) => {
  entities.forEach(entity => {
    if (entity.type !== 'x' || entity.deactivated) {
      return;
    }

    if (areColliding(player, entity)) {
      player.health = PLAYER_MAX_HEALTH;
      entity.deactivated = true;
    }
  });
};

const entityOperations = {
  x: (e, time) => {
    e.speed.forEach((speed, i) => {
      e.pos[i] += speed;
    });

    c.fillStyle = 'red';

    c.translate(
      ...toPixels(e.pos[0] + X_SIZE / 2, e.pos[1] + X_SIZE / 2),
    );

    c.rotate(X_ROTATION_SPEED * time);

    c.fillRect(
      ...toPixels(-X_SIZE / 2, -X_SIZE / 2, X_SIZE, X_SIZE),
    );

    c.strokeStyle = '#fff';

    c.moveTo(
      ...toPixels(-X_SIZE / 2 + X_PADDING, -X_SIZE / 2 + X_PADDING),
    );

    c.lineTo(
      ...toPixels(X_SIZE / 2 - X_PADDING, X_SIZE / 2 - X_PADDING),
    );

    c.closePath();
    c.stroke();

    c.moveTo(
      ...toPixels(-X_SIZE / 2 + X_PADDING, X_SIZE / 2 - X_PADDING),
    );

    c.lineTo(
      ...toPixels(X_SIZE / 2 - X_PADDING, -X_SIZE / 2 + X_PADDING),
    );

    c.closePath();
    c.stroke();

    c.resetTransform();
  },
  player: (player, time, entities) => {
    player.speed.forEach((speed, i) => {
      player.pos[i] += speed;
    });

    if (keyboard.x) {
      rotate(player);
      keyboard.x = false; // to prevent infinite rotation
    }

    player.health -= PLAYER_HEALTH_DECREMENT;

    handleCollisions(player, entities);

    c.fillStyle = 'white';
    c.translate(...toPixels(player.pos[0] + PLAYER_SIZE / 2, player.pos[1] + PLAYER_SIZE / 2));
    c.rotate(Math.atan2(player.speed[1], player.speed[0]));
    c.beginPath();

    c.moveTo(
      ...toPixels(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2),
    );

    c.lineTo(
      ...toPixels(PLAYER_SIZE, PLAYER_SIZE / 2),
    );

    c.lineTo(
      ...toPixels(-PLAYER_SIZE / 2, PLAYER_SIZE),
    );

    c.lineTo(
      ...toPixels(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2),
    );

    c.closePath();
    c.fill();
    c.resetTransform();
  },

  healthBar: healthBar => {
    c.fillStyle = 'yellow';

    c.fillRect(
      ...toPixels(
        HEALTH_BAR_MARGIN,
        HEALTH_BAR_MARGIN,
        (PLAYER_MAX_HEALTH - HEALTH_BAR_MARGIN * 2) * healthBar.player.health,
        HEALTH_BAR_HEIGHT - HEALTH_BAR_MARGIN,
      ),
    );
  },
};

const player = createPlayer();
const x = createX(0.2, 0.3); // TODO: autogenerate
const game = createGame(x, player, createHealthBar(player));

const loop = time => {
  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, a.width, a.height);

  game.entities.forEach(entity => {
    if (entity.deactivated) {
      return;
    }

    entityOperations[entity.type](entity, time, game.entities);
  });

  requestAnimationFrame(loop);
};

// sweet tricks to pixelate output
a.width = a.width / 4;
a.height = a.height / 4;
c.imageSmoothingEnabled = false;
a.style.imageRendering = 'crisp-edges';

requestAnimationFrame(loop);
