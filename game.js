import { PowerUpState, isColliding, findCollisions } from './core.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ゲーム設定 ---
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 20;
const INITIAL_PLAYER_SPEED = 4;
const BULLET_SPEED = 8;
const MISSILE_SPEED = 4;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 1000;
const STAR_COUNT = 200;
const CAPSULE_DROP_RATE = 5;

// --- ゲーム状態の初期化 ---
const powerUpState = new PowerUpState();
const player = {
  x: 50,
  y: canvas.height / 2 - PLAYER_HEIGHT / 2,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  color: '#fff',
};
const powerUpCapsules = [];
let enemiesDestroyedSinceLastCapsule = 0;
const bullets = [];
const missiles = [];
const laserPoints = [];
const enemies = [];
const stars = [];
const options = [];
const playerHistory = [];
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  ' ': false,
  Shift: false,
};
let lastShotTime = 0;
const shotDelay = 200;
const laserPointDelay = 16;
let lastEnemySpawn = 0;
let shiftPressed = false;

// --- イベントリスナー設定 ---
document.addEventListener('keydown', (e) => {
  if (e.key in keys) {
    e.preventDefault();
    keys[e.key] = true;
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key in keys) {
    e.preventDefault();
    keys[e.key] = false;
  }
});

// --- 関数定義 ---

function initStars() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 1.5 + 0.5,
    });
  }
}

function fireNormalAndDouble(activePowerUps) {
  const now = Date.now();
  if (now - lastShotTime < shotDelay) return;
  lastShotTime = now;
  const shotType = activePowerUps.shotType;
  if (shotType === 'normal' || shotType === 'double') {
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 2,
      width: 15,
      height: 4,
      color: '#ff4500',
      dx: BULLET_SPEED,
      dy: 0,
    });
  }
  if (shotType === 'double') {
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 2,
      width: 15,
      height: 4,
      color: '#ff9900',
      dx: BULLET_SPEED * 0.9,
      dy: -BULLET_SPEED * 0.4,
    });
  }
  if (activePowerUps.hasMissile) {
    missiles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      width: 10,
      height: 10,
      color: '#f0e68c',
    });
  }

  // オプションから発射
  options.forEach((option) => {
    if (shotType === 'normal' || shotType === 'double') {
      bullets.push({
        x: option.x + option.width,
        y: option.y - 2, // y座標を微調整
        width: 15,
        height: 4,
        color: '#ff4500',
        dx: BULLET_SPEED,
        dy: 0,
      });
    }
    if (shotType === 'double') {
      bullets.push({
        x: option.x + option.width,
        y: option.y - 2, // y座標を微調整
        width: 15,
        height: 4,
        color: '#ff9900',
        dx: BULLET_SPEED * 0.9,
        dy: -BULLET_SPEED * 0.4,
      });
    }
  });
}

function fireLaser(activePowerUps) {
  const now = Date.now();
  if (now - lastShotTime < laserPointDelay) return;
  lastShotTime = now;
  laserPoints.push({
    x: player.x + player.width,
    y: player.y + player.height / 2,
  });

  // オプションからレーザー
  options.forEach((option) => {
    laserPoints.push({
      x: option.x + option.width,
      y: option.y,
    });
  });
  if (activePowerUps.hasMissile) {
    if (missiles.length === 0 || now - lastShotTime > shotDelay) {
      missiles.push({
        x: player.x + player.width / 2,
        y: player.y + player.height,
        width: 10,
        height: 10,
        color: '#f0e68c',
      });
    }
  }
}

function spawnEnemy() {
  if (Date.now() - lastEnemySpawn > ENEMY_SPAWN_INTERVAL) {
    const size = Math.random() * 20 + 20;
    enemies.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - size),
      width: size,
      height: size,
      color: '#00ff7f',
    });
    lastEnemySpawn = Date.now();
  }
}

function spawnPowerUpCapsule(x, y) {
  powerUpCapsules.push({ x: x, y: y, width: 20, height: 20, color: '#ffc107' });
}

function checkCollisions() {
  // 弾と敵
  findCollisions(bullets, enemies, (bullet, enemy, bulletIndex, enemyIndex) => {
    enemies.splice(enemyIndex, 1);
    bullets.splice(bulletIndex, 1);
    enemiesDestroyedSinceLastCapsule++;
    if (enemiesDestroyedSinceLastCapsule >= CAPSULE_DROP_RATE) {
      spawnPowerUpCapsule(enemy.x, enemy.y);
      enemiesDestroyedSinceLastCapsule = 0;
    }
  });
  // ミサイルと敵
  findCollisions(
    missiles,
    enemies,
    (missile, enemy, missileIndex, enemyIndex) => {
      enemies.splice(enemyIndex, 1);
      missiles.splice(missileIndex, 1);
    }
  );
  // レーザーと敵
  const hitBoxes = laserPoints.map((point) => ({
    x: point.x,
    y: point.y - 3,
    width: BULLET_SPEED,
    height: 6,
  }));
  findCollisions(
    hitBoxes,
    enemies,
    (hitBox, enemy, hitBoxIndex, enemyIndex) => {
      enemies.splice(enemyIndex, 1);
      enemiesDestroyedSinceLastCapsule++;
      if (enemiesDestroyedSinceLastCapsule >= CAPSULE_DROP_RATE) {
        spawnPowerUpCapsule(enemy.x, enemy.y);
        enemiesDestroyedSinceLastCapsule = 0;
      }
    }
  );
  // プレイヤーとカプセル
  findCollisions(
    [player],
    powerUpCapsules,
    (p, powerUpCapsule, pIndex, powerUpCapsuleIndex) => {
      powerUpCapsules.splice(powerUpCapsuleIndex, 1);
      powerUpState.collectCapsule();
    }
  );
}

function handlePowerUpActivation() {
  if (keys.Shift && !shiftPressed) {
    powerUpState.activate();
    shiftPressed = true;
  } else if (!keys.Shift) {
    shiftPressed = false;
  }
}

// --- 描画関数群 ---
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height / 2);
  ctx.closePath();
  ctx.fill();
}

function drawOptions() {
  options.forEach((option) => {
    ctx.fillStyle = '#93f2fa'; // 明るいシアン
    ctx.beginPath();
    ctx.arc(
      option.x + option.width / 2,
      option.y,
      option.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // 内側の白い輝き
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(
      option.x + option.width / 2,
      option.y,
      option.width / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function drawBullets() {
  bullets.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
}

function drawMissiles() {
  missiles.forEach((m) => {
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.arc(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLaserTrails() {
  if (laserPoints.length < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(137, 207, 240, 0.5)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(laserPoints[0].x, laserPoints[0].y);
  for (let i = 1; i < laserPoints.length; i++) {
    const p1 = laserPoints[i - 1];
    const p2 = laserPoints[i];
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (distance > 100) {
      ctx.moveTo(p2.x, p2.y);
    } else {
      ctx.lineTo(p2.x, p2.y);
    }
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(laserPoints[0].x, laserPoints[0].y);
  for (let i = 1; i < laserPoints.length; i++) {
    const p1 = laserPoints[i - 1];
    const p2 = laserPoints[i];
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (distance > 100) {
      ctx.moveTo(p2.x, p2.y);
    } else {
      ctx.lineTo(p2.x, p2.y);
    }
  }
  ctx.stroke();
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function drawPowerUpCapsules() {
  powerUpCapsules.forEach((capsule) => {
    ctx.fillStyle = capsule.color;
    ctx.fillRect(capsule.x, capsule.y, capsule.width, capsule.height);
    ctx.fillStyle = '#000';
    ctx.fillText('P', capsule.x + 6, capsule.y + 14);
  });
}

function updateAndDrawStars() {
  ctx.fillStyle = '#fff';
  stars.forEach((star) => {
    star.x -= star.speed;
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * canvas.height;
    }
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
}

function drawPowerUpMeter() {
  const { meter, currentIndex } = powerUpState.getMeterState();
  const activePowerUps = powerUpState.getActivePowerUps();
  const meterX = canvas.width / 2 - (meter.length * 85) / 2;
  const meterY = canvas.height - 40;
  ctx.font = '14px Arial';
  meter.forEach((name, index) => {
    const boxX = meterX + index * 90;
    if (index === currentIndex) {
      ctx.fillStyle = '#ffc107';
      ctx.strokeStyle = '#fff';
    } else {
      ctx.fillStyle = '#555';
      ctx.strokeStyle = '#888';
    }
    ctx.fillRect(boxX, meterY, 85, 25);
    ctx.strokeRect(boxX, meterY, 85, 25);
    let displayName = name;
    let isActive = false;
    if (name === 'SPEED UP' && activePowerUps.speedLevel > 0) {
      isActive = true;
      displayName = `SPEED ${activePowerUps.speedLevel}`;
    } else if (name === 'MISSILE' && activePowerUps.hasMissile) {
      isActive = true;
    } else if (name === 'DOUBLE' && activePowerUps.shotType === 'double') {
      isActive = true;
    } else if (name === 'LASER' && activePowerUps.shotType === 'laser') {
      isActive = true;
    }
    ctx.fillStyle = isActive ? '#adff2f' : '#fff';
    ctx.fillText(displayName, boxX + 5, meterY + 17);
  });
}

// --- ゲームループ ---
function gameLoop() {
  // --- 履歴とオプションの管理 ---
  playerHistory.unshift({ x: player.x, y: player.y });
  const OPTION_DELAY = 15; // オプション間の遅延フレーム
  const activePowerUps = powerUpState.getActivePowerUps();

  // 有効なオプションの数に合わせて `options` 配列を調整
  if (options.length < activePowerUps.optionCount) {
    options.push({ x: player.x, y: player.y, width: 12, height: 12 });
  }

  // 各オプションの位置を更新
  options.forEach((option, index) => {
    const historyIndex = (index + 1) * OPTION_DELAY;
    if (playerHistory.length > historyIndex) {
      const targetPos = playerHistory[historyIndex];
      option.x = targetPos.x;
      option.y = targetPos.y + player.height / 2; // プレイヤーの中心の高さに合わせる
    }
  });

  // 古い履歴を削除して配列が無限に大きくならないようにする
  if (playerHistory.length > (options.length + 1) * OPTION_DELAY + 10) {
    playerHistory.pop();
  }

  // 更新処理
  const currentSpeed = INITIAL_PLAYER_SPEED + activePowerUps.speedLevel;
  if (keys.ArrowUp && player.y > 0) player.y -= currentSpeed;
  if (keys.ArrowDown && player.y < canvas.height - player.height)
    player.y += currentSpeed;
  if (keys.ArrowLeft && player.x > 0) player.x -= currentSpeed;
  if (keys.ArrowRight && player.x < canvas.width - player.width)
    player.x += currentSpeed;

  if (keys[' ']) {
    if (activePowerUps.shotType === 'laser') {
      fireLaser(activePowerUps);
    } else {
      fireNormalAndDouble(activePowerUps);
    }
  }

  handlePowerUpActivation();

  bullets.forEach((b) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x > canvas.width) bullets.splice(bullets.indexOf(b), 1);
  });
  missiles.forEach((m) => {
    m.x += MISSILE_SPEED;
    m.y += MISSILE_SPEED / 2;
    if (m.x > canvas.width || m.y > canvas.height)
      missiles.splice(missiles.indexOf(m), 1);
  });
  laserPoints.forEach((p) => {
    p.x += BULLET_SPEED;
    if (p.x > canvas.width) laserPoints.splice(laserPoints.indexOf(p), 1);
  });
  enemies.forEach((e) => {
    e.x -= ENEMY_SPEED;
    if (e.x + e.width < 0) enemies.splice(enemies.indexOf(e), 1);
  });
  powerUpCapsules.forEach((c) => {
    c.x -= ENEMY_SPEED;
    if (c.x < 0) powerUpCapsules.splice(powerUpCapsules.indexOf(c), 1);
  });

  spawnEnemy();
  checkCollisions();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateAndDrawStars();
  drawPlayer();
  drawOptions();
  drawBullets();
  drawMissiles();
  drawLaserTrails();
  drawEnemies();
  drawPowerUpCapsules();
  drawPowerUpMeter();

  requestAnimationFrame(gameLoop);
}

// --- ゲーム開始 ---
console.log(
  'ゲームを開始します。矢印キー:移動, スペース:ショット, Shift:パワーアップ'
);
initStars();
gameLoop();
