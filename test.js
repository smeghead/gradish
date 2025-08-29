import { add, PowerUpState } from './core.js';

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
  const state = new PowerUpState();
  const meter = state.getMeterState();
  const active = state.getActivePowerUps();

  assert(meter.currentIndex === -1, 'Initial cursor index should be -1');
  assert(active.speedLevel === 0, 'Initial speedLevel should be 0');
  assert(active.hasMissile === false, 'Initial hasMissile should be false');
  assert(active.shotType === 'normal', "Initial shotType should be 'normal'");
}
testInitialPowerUpState();

// Test 2: カプセル取得のテスト
function testCollectCapsule() {
  const state = new PowerUpState();
  state.collectCapsule();
  const meter = state.getMeterState();
  assert(
    meter.currentIndex === 0,
    'Cursor should be at index 0 after one capsule'
  );
}
testCollectCapsule();

// Test 3: SPEED UP 有効化のテスト
function testSpeedUpActivation() {
  const state = new PowerUpState();
  state.collectCapsule(); // -> SPEED UP
  state.activate();

  const active = state.getActivePowerUps();
  assert(active.speedLevel === 1, '[SPEED UP] speedLevel should become 1');

  const meter = state.getMeterState();
  assert(
    meter.currentIndex === -1,
    '[SPEED UP] Cursor should reset after activation'
  );
}
testSpeedUpActivation();

// Test 4: 連続したパワーアップのテスト
function testSequentialPowerUps() {
  const state = new PowerUpState();
  state.collectCapsule(); // -> SPEED UP
  state.activate();

  state.collectCapsule(); // -> SPEED UP
  state.collectCapsule(); // -> MISSILE
  state.activate();

  const active = state.getActivePowerUps();
  assert(active.speedLevel === 1, '[Sequential] speedLevel should remain 1');
  assert(
    active.hasMissile === true,
    '[Sequential] hasMissile should become true'
  );
}
testSequentialPowerUps();

// Test 5: ショットタイプの排他制御テスト (LASERはDOUBLEを上書きする)
function testShotTypeOverride() {
  const state = new PowerUpState();
  state.collectCapsule(); // S
  state.collectCapsule(); // M
  state.collectCapsule(); // D
  state.activate(); // Double is now active
  assert(
    state.getActivePowerUps().shotType === 'double',
    'shotType should be double initially'
  );

  state.collectCapsule(); // S
  state.collectCapsule(); // M
  state.collectCapsule(); // D
  state.collectCapsule(); // L
  state.activate(); // Laser is now active

  assert(
    state.getActivePowerUps().shotType === 'laser',
    'shotType should be overridden by laser'
  );
}
testShotTypeOverride();

console.log('✅ All tests passed!');
