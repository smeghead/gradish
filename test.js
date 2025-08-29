import { add, PowerUpState, isColliding } from './core.js';

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

// --- Collision Primitive Tests ---
console.log('  Testing: isColliding()');
function testCollisionDetection() {
  const rect1 = { x: 10, y: 10, width: 50, height: 50 };

  // Case 1: Overlapping
  const rect2 = { x: 40, y: 40, width: 50, height: 50 };
  assert(isColliding(rect1, rect2) === true, 'Rects should be overlapping');

  // Case 2: Not overlapping
  const rect3 = { x: 100, y: 100, width: 50, height: 50 };
  assert(
    isColliding(rect1, rect3) === false,
    'Rects should not be overlapping'
  );

  // Case 3: Touching edges
  const rect4 = { x: 60, y: 10, width: 50, height: 50 };
  assert(
    isColliding(rect1, rect4) === false,
    'Rects should not be overlapping when touching edges'
  );

  // Case 4: One inside another
  const rect5 = { x: 20, y: 20, width: 20, height: 20 };
  assert(
    isColliding(rect1, rect5) === true,
    'Rects should be overlapping when one is inside another'
  );
}
testCollisionDetection();

// --- PowerUpState Class Tests ---
console.log('  Testing: PowerUpState');

function testInitialPowerUpState() {
  const state = new PowerUpState();
  const meter = state.getMeterState();
  const active = state.getActivePowerUps();
  assert(meter.currentIndex === -1, 'Initial cursor index should be -1');
  assert(active.speedLevel === 0, 'Initial speedLevel should be 0');
}
testInitialPowerUpState();

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

function testSpeedUpActivation() {
  const state = new PowerUpState();
  state.collectCapsule();
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

function testSequentialPowerUps() {
  const state = new PowerUpState();
  state.collectCapsule();
  state.activate();
  state.collectCapsule();
  state.collectCapsule();
  state.activate();
  const active = state.getActivePowerUps();
  assert(active.speedLevel === 1, '[Sequential] speedLevel should remain 1');
  assert(
    active.hasMissile === true,
    '[Sequential] hasMissile should become true'
  );
}
testSequentialPowerUps();

function testShotTypeOverride() {
  const state = new PowerUpState();
  state.collectCapsule();
  state.collectCapsule();
  state.collectCapsule();
  state.activate();
  assert(
    state.getActivePowerUps().shotType === 'double',
    'shotType should be double initially'
  );
  state.collectCapsule();
  state.collectCapsule();
  state.collectCapsule();
  state.collectCapsule();
  state.activate();
  assert(
    state.getActivePowerUps().shotType === 'laser',
    'shotType should be overridden by laser'
  );
}
testShotTypeOverride();

console.log('✅ All tests passed!');
