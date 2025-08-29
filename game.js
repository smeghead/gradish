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

// --- パワーアップ ---
const powerUpMeter = ['SPEED UP', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', 'SHIELD'];
let currentPowerUpIndex = -1;
const powerUpCapsules = [];
let enemiesDestroyedSinceLastCapsule = 0;

// --- 星空 ---
const stars = [];
function initStars() { for (let i = 0; i < STAR_COUNT; i++) { stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 + 1, speed: Math.random() * 1.5 + 0.5 }); } }
function updateAndDrawStars() { ctx.fillStyle = '#fff'; stars.forEach(star => { star.x -= star.speed; if (star.x < 0) { star.x = canvas.width; star.y = Math.random() * canvas.height; } ctx.fillRect(star.x, star.y, star.size, star.size); }); }

// --- プレイヤー ---
const player = {
    x: 50,
    y: canvas.height / 2 - PLAYER_HEIGHT / 2,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    color: '#fff',
    activePowerUps: {
        hasMissile: false,
        shotType: 'normal', // 'normal', 'double', 'laser'
        speedLevel: 0
    }
};

// --- 操作キー ---
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, ' ': false, Shift: false };
document.addEventListener('keydown', (e) => { if (e.key in keys) { e.preventDefault(); keys[e.key] = true; } });
document.addEventListener('keyup', (e) => { if (e.key in keys) { e.preventDefault(); keys[e.key] = false; } });

// --- 武器 ---
const bullets = [];
const missiles = [];
const laserPoints = [];
let lastShotTime = 0;
const shotDelay = 200;
const laserPointDelay = 16;

function fireNormalAndDouble() {
    const now = Date.now();
    if (now - lastShotTime < shotDelay) return;
    lastShotTime = now;
    const shotType = player.activePowerUps.shotType;
    if (shotType === 'normal' || shotType === 'double') {
        bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 - 2, width: 15, height: 4, color: '#ff4500', dx: BULLET_SPEED, dy: 0 });
    }
    if (shotType === 'double') {
        bullets.push({ x: player.x + player.width, y: player.y + player.height / 2 - 2, width: 15, height: 4, color: '#ff9900', dx: BULLET_SPEED * 0.9, dy: -BULLET_SPEED * 0.4 });
    }
    if (player.activePowerUps.hasMissile) {
        missiles.push({ x: player.x + player.width / 2, y: player.y + player.height, width: 10, height: 10, color: '#f0e68c' });
    }
}

function fireLaser() {
    const now = Date.now();
    if (now - lastShotTime < laserPointDelay) return;
    lastShotTime = now;
    laserPoints.push({ x: player.x + player.width, y: player.y + player.height / 2 });
    if (player.activePowerUps.hasMissile) {
        if (missiles.length === 0 || now - lastShotTime > shotDelay) {
             missiles.push({ x: player.x + player.width / 2, y: player.y + player.height, width: 10, height: 10, color: '#f0e68c' });
        }
    }
}

// --- 敵 ---
const enemies = [];
let lastEnemySpawn = 0;
function spawnEnemy() { if (Date.now() - lastEnemySpawn > ENEMY_SPAWN_INTERVAL) { const size = Math.random() * 20 + 20; enemies.push({ x: canvas.width, y: Math.random() * (canvas.height - size), width: size, height: size, color: '#00ff7f' }); lastEnemySpawn = Date.now(); } }

// --- パワーアップカプセル ---
function spawnPowerUpCapsule(x, y) { powerUpCapsules.push({ x: x, y: y, width: 20, height: 20, color: '#ffc107' }); }
function updateAndDrawCapsules() { powerUpCapsules.forEach((capsule, index) => { capsule.x -= ENEMY_SPEED; if (capsule.x + capsule.width < 0) powerUpCapsules.splice(index, 1); ctx.fillStyle = capsule.color; ctx.fillRect(capsule.x, capsule.y, capsule.width, capsule.height); ctx.fillStyle = '#000'; ctx.fillText('P', capsule.x + 6, capsule.y + 14); }); }

// --- 当たり判定 ---
function checkCollisions() {
    // 弾と敵
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const enemy = enemies[j];
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                enemiesDestroyedSinceLastCapsule++;
                if (enemiesDestroyedSinceLastCapsule >= CAPSULE_DROP_RATE) { spawnPowerUpCapsule(enemy.x, enemy.y); enemiesDestroyedSinceLastCapsule = 0; }
                break;
            }
        }
    }
    // ミサイルと敵
    for (let i = missiles.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const missile = missiles[i];
            const enemy = enemies[j];
            if (missile.x < enemy.x + enemy.width && missile.x + missile.width > enemy.x && missile.y < enemy.y + enemy.height && missile.y + missile.height > enemy.y) {
                enemies.splice(j, 1);
                missiles.splice(i, 1);
                break;
            }
        }
    }
    // レーザーと敵
    for (let i = laserPoints.length - 1; i >= 0; i--) {
        const point = laserPoints[i];
        const hitBox = { x: point.x, y: point.y - 3, width: BULLET_SPEED, height: 6 };
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (hitBox.x < enemy.x + enemy.width && hitBox.x + hitBox.width > enemy.x && hitBox.y < enemy.y + enemy.height && hitBox.y + hitBox.height > enemy.y) {
                enemies.splice(j, 1);
                enemiesDestroyedSinceLastCapsule++;
                if (enemiesDestroyedSinceLastCapsule >= CAPSULE_DROP_RATE) { spawnPowerUpCapsule(enemy.x, enemy.y); enemiesDestroyedSinceLastCapsule = 0; }
            }
        }
    }
    // プレイヤーとカプセル
    for (let i = powerUpCapsules.length - 1; i >= 0; i--) {
        const capsule = powerUpCapsules[i];
        if (player.x < capsule.x + capsule.width && player.x + player.width > capsule.x && player.y < capsule.y + capsule.height && player.y + player.height > capsule.y) {
            powerUpCapsules.splice(i, 1);
            if (currentPowerUpIndex < powerUpMeter.length - 1) currentPowerUpIndex++;
        }
    }
}

// --- パワーアップ発動 ---
let shiftPressed = false;
function handlePowerUpActivation() {
    if (keys.Shift && !shiftPressed) {
        if (currentPowerUpIndex !== -1) { activatePowerUp(currentPowerUpIndex); currentPowerUpIndex = -1; }
        shiftPressed = true;
    } else if (!keys.Shift) { shiftPressed = false; }
}

function activatePowerUp(index) {
    const powerUpName = powerUpMeter[index];
    console.log(`${powerUpName} activated!`);
    switch (powerUpName) {
        case 'SPEED UP': player.activePowerUps.speedLevel++; break;
        case 'MISSILE': player.activePowerUps.hasMissile = true; break;
        case 'DOUBLE': player.activePowerUps.shotType = 'double'; break;
        case 'LASER': player.activePowerUps.shotType = 'laser'; break;
    }
}

// --- 描画 ---
function drawPlayer() { ctx.fillStyle = player.color; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(player.x, player.y + player.height); ctx.lineTo(player.x + player.width, player.y + player.height / 2); ctx.closePath(); ctx.fill(); }
function drawBullets() { bullets.forEach(b => { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height); }); }
function drawMissiles() { missiles.forEach(m => { ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, 0, Math.PI * 2); ctx.fill(); }); }
function drawLaserTrails() {
    if (laserPoints.length < 2) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(137, 207, 240, 0.5)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(laserPoints[0].x, laserPoints[0].y);
    for (let i = 1; i < laserPoints.length; i++) {
        const p1 = laserPoints[i-1];
        const p2 = laserPoints[i];
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (distance > 100) { ctx.moveTo(p2.x, p2.y); } else { ctx.lineTo(p2.x, p2.y); }
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(laserPoints[0].x, laserPoints[0].y);
    for (let i = 1; i < laserPoints.length; i++) {
        const p1 = laserPoints[i-1];
        const p2 = laserPoints[i];
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (distance > 100) { ctx.moveTo(p2.x, p2.y); } else { ctx.lineTo(p2.x, p2.y); }
    }
    ctx.stroke();
}
function drawEnemies() { enemies.forEach(enemy => { ctx.fillStyle = enemy.color; ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height); }); }
function drawPowerUpMeter() {
    const meterX = canvas.width / 2 - (powerUpMeter.length * 85) / 2;
    const meterY = canvas.height - 40;
    ctx.font = '14px Arial';
    powerUpMeter.forEach((name, index) => {
        const boxX = meterX + index * 90;
        if (index === currentPowerUpIndex) { ctx.fillStyle = '#ffc107'; ctx.strokeStyle = '#fff'; } else { ctx.fillStyle = '#555'; ctx.strokeStyle = '#888'; }
        ctx.fillRect(boxX, meterY, 85, 25);
        ctx.strokeRect(boxX, meterY, 85, 25);
        let displayName = name;
        let isActive = false;
        if (name === 'SPEED UP' && player.activePowerUps.speedLevel > 0) { isActive = true; displayName = `SPEED ${player.activePowerUps.speedLevel}`; }
        else if (name === 'MISSILE' && player.activePowerUps.hasMissile) { isActive = true; }
        else if (name === 'DOUBLE' && player.activePowerUps.shotType === 'double') { isActive = true; }
        else if (name === 'LASER' && player.activePowerUps.shotType === 'laser') { isActive = true; }
        ctx.fillStyle = isActive ? '#adff2f' : '#fff';
        ctx.fillText(displayName, boxX + 5, meterY + 17);
    });
}

// --- ゲームループ ---
function gameLoop() {
    // 更新処理
    const currentSpeed = INITIAL_PLAYER_SPEED + player.activePowerUps.speedLevel;
    if (keys.ArrowUp && player.y > 0) player.y -= currentSpeed;
    if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += currentSpeed;
    if (keys.ArrowLeft && player.x > 0) player.x -= currentSpeed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += currentSpeed;
    
    if (keys[' ']) {
        if (player.activePowerUps.shotType === 'laser') {
            fireLaser();
        } else {
            fireNormalAndDouble();
        }
    }

    handlePowerUpActivation();

    // 各オブジェクトの位置を更新
    bullets.forEach((b, i) => { b.x += b.dx; b.y += b.dy; if (b.x > canvas.width) bullets.splice(i, 1); });
    missiles.forEach((m, i) => { m.x += MISSILE_SPEED; m.y += MISSILE_SPEED / 2; if (m.x > canvas.width || m.y > canvas.height) missiles.splice(i, 1); });
    laserPoints.forEach((p, i) => { p.x += BULLET_SPEED; if (p.x > canvas.width) laserPoints.splice(i, 1); });
    enemies.forEach((e, i) => { e.x -= ENEMY_SPEED; if (e.x + e.width < 0) enemies.splice(i, 1); });
    
    spawnEnemy();
    checkCollisions();

    // 描画処理
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateAndDrawStars();
    drawPlayer();
    drawBullets();
    drawMissiles();
    drawLaserTrails();
    drawEnemies();
    updateAndDrawCapsules();
    drawPowerUpMeter();

    requestAnimationFrame(gameLoop);
}

// ゲーム開始
console.log('ゲームを開始します。矢印キー:移動, スペース:ショット, Shift:パワーアップ');
initStars();
gameLoop();