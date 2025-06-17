const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
  }
  scale(n) {
    this.x *= n;
    this.y *= n;
  }
  static fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }
}

class Ship {
  constructor() {
    this.pos = new Vector(canvas.width / 2, canvas.height / 2);
    this.vel = new Vector();
    this.angle = 0;
  }
  update() {
    this.pos.add(this.vel);
    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;
    this.vel.scale(0.99);
  }
  draw() {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, 7);
    ctx.lineTo(-10, -7);
    ctx.closePath();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();
  }
  thrust() {
    const force = Vector.fromAngle(this.angle);
    force.scale(0.1);
    this.vel.add(force);
  }
  rotate(dir) {
    this.angle += dir;
  }
}

class Asteroid {
  constructor() {
    this.pos = new Vector(Math.random() * canvas.width, Math.random() * canvas.height);
    this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    this.size = Math.random() * 40 + 20;
  }
  update() {
    this.pos.add(this.vel);
    this.pos.x = (this.pos.x + canvas.width) % canvas.width;
    this.pos.y = (this.pos.y + canvas.height) % canvas.height;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
    ctx.strokeStyle = '#888';
    ctx.stroke();
  }
}

class Bullet {
  constructor(position, angle) {
    this.pos = new Vector(position.x, position.y);
    this.vel = Vector.fromAngle(angle);
    this.vel.scale(5);
  }
  update() {
    this.pos.add(this.vel);
  }
  draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
  }
  isOut() {
    return this.pos.x < 0 || this.pos.x > canvas.width || this.pos.y < 0 || this.pos.y > canvas.height;
  }
}

const ship = new Ship();
const asteroids = [];
for (let i = 0; i < 5; i++) {
  asteroids.push(new Asteroid());
}
const bullets = [];
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') {
    bullets.push(new Bullet(ship.pos, ship.angle));
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function update() {
  if (keys.ArrowLeft) {
    ship.rotate(-0.05);
  }
  if (keys.ArrowRight) {
    ship.rotate(0.05);
  }
  if (keys.ArrowUp) {
    ship.thrust();
  }
  ship.update();
  for (const a of asteroids) {
    a.update();
  }
  for (const bullet of bullets) {
    bullet.update();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ship.draw();
  for (const a of asteroids) {
    a.draw();
  }
  for (const bullet of bullets) {
    bullet.draw();
  }
}

function loop() {
  update();
  draw();
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].isOut()) {
      bullets.splice(i, 1);
    }
  }
  requestAnimationFrame(loop);
}

loop();
