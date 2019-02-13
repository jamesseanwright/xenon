const PLAYER_SPEED = 0.005;
const PLAYER_SIZE = 0.08;
const X_BASE_SPEED = 0.004;
const X_SIZE = 0.06;
const X_PADDING = 0.01;
const X_ROTATION_SPEED = 0.002;

/* shared logic for width and height
 * as game world and screen projection
 * are square. This will save bytes! */
const toPixels = (...inputs) => inputs.map(i => i * a.width);

const createPositionable = (x, y) => ({
  pos: [x, y],
});

const createMoveable = (xSpeed, ySpeed) => ({
  speed: [xSpeed, ySpeed]
});

const createPlayer = () => ({
  ...createPositionable(0.5 - PLAYER_SIZE / 2, 0.5 - PLAYER_SIZE / 2),
  ...createMoveable(PLAYER_SPEED, 0),
  type: 'player',
  health: 3,
});

const createX = (x, y) => ({
  ...createPositionable(x, y),
  ...createMoveable(X_BASE_SPEED, 0),
  type: 'x',
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
      ...toPixels(X_SIZE / 2 - X_PADDING, -X_SIZE /2 + X_PADDING),
    );

    c.closePath();
    c.stroke();

    c.resetTransform();
  },
  player: player => {
    player.speed.forEach((speed, i) => {
      player.pos[i] += speed;
    });

    if (keyboard.x) {
      rotate(player);
      keyboard.x = false; // to prevent infinite rotation
    }

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
};

const player = createPlayer();
const x = createX(0.2, 0.3); // TODO: autogenerate
const game = createGame(x, player);

const loop = time => {
  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = '#000';
  c.fillRect(0, 0, a.width, a.height);

  game.entities.forEach(entity => {
    entityOperations[entity.type](entity, time);
  });

  // requestAnimationFrame(loop);
};

// sweet tricks to pixelate output
a.width = a.width / 4;
a.height = a.height / 4;
c.imageSmoothingEnabled = false;
a.style.imageRendering = 'crisp-edges';

requestAnimationFrame(loop);
