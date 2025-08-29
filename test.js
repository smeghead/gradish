import { add, PowerUpState } from './core.js';

/**
 * 条件を検証し、偽の場合はエラーを出してプロセスを終了する
 * @param {boolean} condition 検証する条件
 * @param {string} message エラーメッセージ
 */
function assert(condition, message) {
  if (!condition) {
    console.error('❌ Assertion Failed:', message);
    process.exit(1);
  }
}

console.log('Running tests for core.js...');

// --- Dummy Function Tests ---
console.log('  Testing: add()');
assert(add(2, 3) === 5, '2 + 3 should equal 5');

// --- PowerUpState Class Tests ---
console.log('  Testing: PowerUpState');

// Test 1: 初期状態のテスト
function testInitialPowerUpState() {
  const powerUpState = new PowerUpState();
  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === -1, 'Initial cursor index should be -1');
  assert(meter.meter.length > 0, 'Meter should have power-ups');
}
testInitialPowerUpState();

// Test 2: カプセル取得のテスト
function testCollectCapsule() {
  const powerUpState = new PowerUpState();
  powerUpState.collectCapsule();
  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === 0, 'Cursor should be at index 0 after one capsule');
}
testCollectCapsule();

// Test 3: SPEED UP 有効化のテスト
function testSpeedUpActivation() {
  const powerUpState = new PowerUpState();
  powerUpState.collectCapsule(); // カーソルを0番目('SPEED UP')に

  const initialActiveUps = { speedLevel: 0, hasMissile: false, shotType: 'normal' };
  const newActiveUps = powerUpState.activate(initialActiveUps);

  assert(newActiveUps.speedLevel === 1, '[SPEED UP] speedLevel should become 1');
  assert(initialActiveUps.speedLevel === 0, '[SPEED UP] Initial state should not be mutated');

  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === -1, '[SPEED UP] Cursor should reset after activation');
}
testSpeedUpActivation();

// Test 4: MISSILE 有効化のテスト
function testMissileActivation() {
  const powerUpState = new PowerUpState();
  powerUpState.collectCapsule(); // -> SPEED UP
  powerUpState.collectCapsule(); // -> MISSILE

  const initialActiveUps = { speedLevel: 0, hasMissile: false, shotType: 'normal' };
  const newActiveUps = powerUpState.activate(initialActiveUps);

  assert(newActiveUps.hasMissile === true, '[MISSILE] hasMissile should become true');
  assert(newActiveUps.speedLevel === 0, '[MISSILE] speedLevel should not change');

  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === -1, '[MISSILE] Cursor should reset after activation');
}
testMissileActivation();


// Test 5: DOUBLE 有効化のテスト
function testDoubleActivation() {
  const powerUpState = new PowerUpState();
  powerUpState.collectCapsule(); // -> SPEED UP
  powerUpState.collectCapsule(); // -> MISSILE
  powerUpState.collectCapsule(); // -> DOUBLE

  const initialActiveUps = { speedLevel: 0, hasMissile: false, shotType: 'normal' };
  const newActiveUps = powerUpState.activate(initialActiveUps);

  assert(newActiveUps.shotType === 'double', '[DOUBLE] shotType should become \'double\'');
  assert(newActiveUps.hasMissile === false, '[DOUBLE] hasMissile should not change');

  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === -1, '[DOUBLE] Cursor should reset after activation');
}
testDoubleActivation();


// Test 6: LASER 有効化のテスト
function testLaserActivation() {
  const powerUpState = new PowerUpState();
  powerUpState.collectCapsule(); // -> SPEED UP
  powerUpState.collectCapsule(); // -> MISSILE
  powerUpState.collectCapsule(); // -> DOUBLE
  powerUpState.collectCapsule(); // -> LASER

  const initialActiveUps = { speedLevel: 0, hasMissile: false, shotType: 'double' }; // DOUBLEが有効な状態から
  const newActiveUps = powerUpState.activate(initialActiveUps);

  assert(newActiveUps.shotType === 'laser', '[LASER] shotType should become \'laser\'');

  const meter = powerUpState.getMeterState();
  assert(meter.currentIndex === -1, '[LASER] Cursor should reset after activation');
}
testLaserActivation();

console.log('✅ All tests passed!');