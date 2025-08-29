import { add } from './core.js';

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

// --- Test Cases ---

// Test 1: 正の数の足し算
assert(add(2, 3) === 5, '2 + 3 should equal 5');

// Test 2: 負の数を含む足し算
assert(add(-1, 5) === 4, '-1 + 5 should equal 4');

// Test 3: ゼロとの足し算
assert(add(10, 0) === 10, '10 + 0 should equal 10');


console.log('✅ All tests passed!');
