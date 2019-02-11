'use strict';

const PLAYER_SPEED = 0.002;
const PLAYER_ROTATION_INCREMENT = 1.5708;
const PLAYER_SIZE = 0.1;
const PROJECTILE_BASE_SPEED = 0.01;

/* shared logic for width and height
 * as game world and screen projection
 * are square. This will save bytes! */
const toPixels = (...inputs) => inputs.map(i => i * a.width);
const toWorldUnits = x => x / a.width;

const createPositionable = (x, y) => ({
  position: [x, y],
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
  ...createMoveable(PROJECTILE_BASE_SPEED, PROJECTILE_BASE_SPEED),
  type: 'x',
});

const createGame = (...entities) => ({
  state: 'running',
  entities,
  score: 0,
});

const bindKeyboard = eventTarget => {
  const bindings = new Map();

  eventTarget.onkeydown = e => {
    bindings.set(e.key, true);
  };

  eventTarget.onkeyup = e => {
    bindings.set(e.key, false);
  };

  return bindings;
};

const keyboard = bindKeyboard(document.body);

const rotate = entity => {
  const [xSpeed, ySpeed] = entity.speed;
  entity.speed = [-ySpeed, xSpeed];
};

const getRadians = entity => {

};

const entityOperations = new Map([
  ['x', e => {

  }],

  ['player', player => {
    player.speed.forEach((speed, i) => {
      player.position[i] += speed;
    });

    if (keyboard.get('x')) {
      rotate(player);
      keyboard.set('x', false); // to prevent infinite rotation
    }

    c.fillStyle = 'white';
    c.translate(...toPixels(player.position[0] + PLAYER_SIZE / 2, player.position[1] + PLAYER_SIZE / 2));
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
  }],
])

const player = createPlayer();
const game = createGame(player);

const loop = () => {
  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = 'black';
  c.fillRect(0, 0, a.width, a.height);

  game.entities.forEach(entity => {
    entityOperations.get(entity.type)(entity);
  });

  requestAnimationFrame(loop);
};

// sweet tricks to pixelate output
a.width = a.width / 4;
a.height = a.height / 4;
a.imageSmoothingEnabled = false;
a.style.imageRendering = 'crisp-edges';

requestAnimationFrame(loop);
