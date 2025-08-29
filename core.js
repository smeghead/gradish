/**
 * 二つの数値を足し算するダミー関数
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
export function add(a, b) {
  return a + b;
}

export class PowerUpState {
  #meter = ['SPEED UP', 'MISSILE', 'DOUBLE', 'LASER', 'OPTION', 'SHIELD'];
  #cursorIndex = -1;

  constructor() {}

  collectCapsule() {
    if (this.#cursorIndex < this.#meter.length - 1) {
      this.#cursorIndex++;
    }
  }

  getMeterState() {
    return {
      meter: [...this.#meter], // 外部で変更されないようコピーを返す
      currentIndex: this.#cursorIndex,
    };
  }

  activate(currentActivePowerUps) {
    if (this.#cursorIndex === -1) {
      return currentActivePowerUps;
    }

    const powerUpName = this.#meter[this.#cursorIndex];
    // 元の状態を変更しないように、新しいオブジェクトを作成
    const newActivePowerUps = { ...currentActivePowerUps };

    switch (powerUpName) {
      case 'SPEED UP':
        newActivePowerUps.speedLevel = (newActivePowerUps.speedLevel || 0) + 1;
        break;
      case 'MISSILE':
        newActivePowerUps.hasMissile = true;
        break;
      case 'DOUBLE':
        newActivePowerUps.shotType = 'double';
        break;
      case 'LASER':
        newActivePowerUps.shotType = 'laser';
        break;
      // 他のパワーアップは今後のTDDサイクルで実装
    }

    this.#cursorIndex = -1; // カーソルをリセット
    return newActivePowerUps;
  }
}