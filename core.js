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

  // 有効なパワーアップの状態もクラスの内部で管理する
  #activePowerUps = {
    speedLevel: 0,
    hasMissile: false,
    shotType: 'normal',
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
    }

    this.#cursorIndex = -1; // カーソルをリセット
  }
}
