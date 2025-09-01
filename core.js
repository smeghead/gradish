/**
 * 二つの数値を足し算するダミー関数
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}

/**
 * 二つの矩形が衝突しているかを判定する
 * @param {{x: number, y: number, width: number, height: number}} rect1 矩形1
 * @param {{x: number, y: number, width: number, height: number}} rect2 矩形2
 * @returns {boolean} 衝突していればtrue
 */
export function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * 2つのオブジェクト配列間で衝突を検出し、衝突したペアのリストを返す
 * @param {Array<Object>} arr1 最初のオブジェクト配列
 * @param {Array<Object>} arr2 2番目のオブジェクト配列
 * @param {(obj1: Object, obj2: Object, index1: number, index2: number) => void} 衝突したペアを引数に呼び出されるcallback関数
 */
export function findCollisions(arr1, arr2, callback) {
  const collisions = [];
  for (let i = arr1.length - 1; i >= 0; i--) {
    for (let j = arr2.length - 1; j >= 0; j--) {
      if (isColliding(arr1[i], arr2[j])) {
        callback(arr1[i], arr2[j], i, j);
        break;
      }
    }
  }
}

export class PowerUpState {
  #meter = ['SPEED UP', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', 'SHIELD'];
  #cursorIndex = -1;

  // 有効なパワーアップの状態もクラスの内部で管理する
  #activePowerUps = {
    speedLevel: 0,
    hasMissile: false,
    shotType: 'normal',
    optionCount: 0,
  };

  constructor() {}

  collectCapsule() {
    if (this.#cursorIndex < this.#meter.length - 1) {
      this.#cursorIndex++;
    }
  }

  getMeterState() {
    return {
      meter: [...this.#meter],
      currentIndex: this.#cursorIndex,
    };
  }

  getActivePowerUps() {
    // 外部で変更されないようコピーを返す
    return { ...this.#activePowerUps };
  }

  activate() {
    if (this.#cursorIndex === -1) {
      return; // 何も選択されていなければ何もしない
    }

    const powerUpName = this.#meter[this.#cursorIndex];

    // 内部の状態を直接変更する
    switch (powerUpName) {
      case 'SPEED UP':
        this.#activePowerUps.speedLevel++;
        break;
      case 'MISSILE':
        this.#activePowerUps.hasMissile = true;
        break;
      case 'DOUBLE':
        this.#activePowerUps.shotType = 'double';
        break;
      case 'LASER':
        this.#activePowerUps.shotType = 'laser';
        break;
      case 'OPTION':
        if (this.#activePowerUps.optionCount < 4) {
          this.#activePowerUps.optionCount++;
        }
        break;
      case 'SHIELD':
        // TODO: シールド機能の実装
        break;
    }

    this.#cursorIndex = -1; // カーソルをリセット
  }
}
