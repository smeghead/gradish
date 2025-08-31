import { add, PowerUpState, isColliding, findCollisions } from './core.js';

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

// --- findCollisions Tests ---
console.log('  Testing: findCollisions()');

// Test 1: 基本的な衝突
function testFindCollisionsBasic() {
  const arr1 = [{ x: 0, y: 0, width: 10, height: 10, id: 'A' }];
  const arr2 = [{ x: 5, y: 5, width: 10, height: 10, id: 'B' }];
  const results = [];
  findCollisions(arr1, arr2, (obj1, obj2, index1, index2) =>
    results.push({ obj1, obj2, index1, index2 })
  );
  assert(results.length === 1, 'Should find one collision');
  assert(results[0].obj1.id === 'A', 'obj1 should be A');
  assert(results[0].obj2.id === 'B', 'obj2 should be B');
  assert(results[0].index1 === 0, 'index1 should be 0');
  assert(results[0].index2 === 0, 'index2 should be 0');
}
testFindCollisionsBasic();

// Test 2: 衝突なし
function testFindCollisionsNone() {
  const arr1 = [{ x: 0, y: 0, width: 10, height: 10 }];
  const arr2 = [{ x: 20, y: 20, width: 10, height: 10 }];
  const results = [];
  findCollisions(arr1, arr2, (obj1, obj2, index1, index2) =>
    results.push({ obj1, obj2, index1, index2 })
  );
  assert(results.length === 0, 'Should find no collisions');
}
testFindCollisionsNone();

// Test 3: 複数の衝突
function testFindCollisionsMultiple() {
  const arr1 = [
    { x: 0, y: 0, width: 10, height: 10, id: 'A' },
    { x: 50, y: 50, width: 10, height: 10, id: 'B' },
  ];
  const arr2 = [
    { x: 5, y: 5, width: 10, height: 10, id: 'C' },
    { x: 55, y: 55, width: 10, height: 10, id: 'D' },
    { x: 100, y: 100, width: 10, height: 10, id: 'E' },
  ];
  const results = [];
  findCollisions(arr1, arr2, (obj1, obj2, index1, index2) =>
    results.push({ obj1, obj2, index1, index2 })
  );
  assert(results.length === 2, 'Should find two collisions');
  assert(results[0].obj1.id === 'B', 'Second collision obj1 should be B');
  assert(results[0].obj2.id === 'D', 'Second collision obj2 should be D');
  assert(results[1].obj1.id === 'A', 'First collision obj1 should be A');
  assert(results[1].obj2.id === 'C', 'First collision obj2 should be C');
}
testFindCollisionsMultiple();

// Test 4: 空の配列
function testFindCollisionsEmpty() {
  const arr1 = [];
  const arr2 = [{ x: 0, y: 0, width: 10, height: 10 }];
  const results = [];
  findCollisions(arr1, arr2, (obj1, obj2, index1, index2) =>
    results.push({ obj1, obj2, index1, index2 })
  );
  assert(results.length === 0, 'Should find no collisions with empty array');
}
testFindCollisionsEmpty();

// --- PowerUpState Class Tests ---
console.log('  Testing: PowerUpState');

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
