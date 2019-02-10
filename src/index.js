'use strict';

const PLAYER_SPEED = 0.002;
const PLAYER_ROTATION_INCREMENT = 1.5708;
const PLAYER_SIZE = 0.1;
const PROJECTILE_BASE_SPEED = 0.01;

// world size to pixel mapping assumes portrait orientation
const aspectRatio = a.height / a.width;
const toPixelsX = x => x * a.width * aspectRatio;
const toPixelsY = y => y * a.height;
const toWorldUnitsX = x => x / a.width;
const toWorldUnitsY = y => y / a.height;
const projectToPixels = (x, y) => [toPixelsX(x), toPixelsY(y) * aspectRatio];

const createPositionable = (x, y) => ({ x, y });
const createMoveable = (xSpeed, ySpeed) => ({ xSpeed, ySpeed });

const createPlayer = () => ({
  ...createPositionable(0.5 - PLAYER_SIZE / 2, 0.5 - PLAYER_SIZE / 2),
  type: 'player',
  rotation: 0,
  health: 3,
});

const createX = (x, y) => ({
  ...createPositionable(x, y),
  ...createMoveable(PROJECTILE_BASE_SPEED, PROJECTILE_BASE_SPEED),
  type: 'x',
});

const createY = (x, y) => ({
  ...createPositionable(x, y),
  ...createMoveable(PROJECTILE_BASE_SPEED, PROJECTILE_BASE_SPEED),
  type: 'y',
});

const createGame = (...entities) => ({
  state: 'running',
  entities,
  score: 0,
});

const entityOperations = new Map([
  ['x', e => {

  }],

  ['y', e => {

  }],

  ['player', e => {
    e.x += PLAYER_SPEED;

    c.fillStyle = 'white';
    c.beginPath();

    c.moveTo(
      ...projectToPixels(e.x - PLAYER_SIZE / 2, e.y - PLAYER_SIZE / 2),
    );

    c.lineTo(
      ...projectToPixels(e.x + PLAYER_SIZE / 2, e.y + PLAYER_SIZE / 2),
    );

    c.lineTo(
      ...projectToPixels(e.x - PLAYER_SIZE / 2, e.y + PLAYER_SIZE),
    );

    c.lineTo(
      ...projectToPixels(e.x - PLAYER_SIZE / 2, e.y - PLAYER_SIZE / 2),
    );

    c.closePath();
    c.fill();
  }],
])

const player = createPlayer();
const game = createGame(player);

const loop = () => {
  c.clearRect(0, 0, a.width, a.height);
  c.fillStyle = 'black';
  c.fillRect(0, 0, a.width, a.height);

  for (let entity of game.entities) {
    entityOperations.get(entity.type)(entity);
  }

  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
