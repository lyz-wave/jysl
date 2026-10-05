/**
 * 手机陀螺仪/体感重力与触摸手势双态控制器
 * 沉淀自 webar-interactive-experience 技能规范
 */

export class SpatialSensorController {
  constructor(options = {}) {
    this.mode = 'pending'; // 'motion' | 'touch'
    this.onSensorChange = options.onSensorChange || (() => {});
    
    // 传感器物理读数
    this.orientation = { alpha: 0, beta: 0, gamma: 0 };
    this.motion = { x: 0, y: 0, z: 0, currentG: 9.8 };
    this.isSensorGranted = false;

    // 虚拟手势与调试回退
    this.virtualTilt = { x: 0, y: 0 };
    this.touchStart = { x: 0, y: 0, time: 0 };
    this.lastSwipe = null;
    this.tapCount = 0;
    this.lastTapTime = 0;
  }

  /**
   * 申请移动端权限（必须由用户手势如“启程”点击触发）
   */
  async requestPermission() {
    let oriGranted = false;
    let motGranted = false;

    try {
      if (typeof window.DeviceOrientationEvent !== 'undefined' &&
          typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        const res = await window.DeviceOrientationEvent.requestPermission();
        oriGranted = res === 'granted';
      } else {
        oriGranted = true; // Android / 现代 Chrome
      }
    } catch {
      oriGranted = false;
    }

    try {
      if (typeof window.DeviceMotionEvent !== 'undefined' &&
          typeof window.DeviceMotionEvent.requestPermission === 'function') {
        const res = await window.DeviceMotionEvent.requestPermission();
        motGranted = res === 'granted';
      } else {
        motGranted = true;
      }
    } catch {
      motGranted = false;
    }

    this.isSensorGranted = oriGranted && motGranted;
    if (this.isSensorGranted && window.DeviceOrientationEvent) {
      this.bindHardwareSensors();
      this.mode = 'motion';
    } else {
      console.info('[Sensor] 切换为触控手势模式');
      this.mode = 'touch';
    }

    this.bindTouchFallback();
    return this.mode;
  }

  bindHardwareSensors() {
    window.addEventListener('deviceorientation', (e) => {
      this.orientation.alpha = e.alpha || 0;
      this.orientation.beta = e.beta || 0;   // 前后仰角 [-180, 180]
      this.orientation.gamma = e.gamma || 0; // 左右倾角 [-90, 90]
      this.onSensorChange(this.getSensorPayload());
    });

    window.addEventListener('devicemotion', (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (acc) {
        this.motion.x = acc.x || 0;
        this.motion.y = acc.y || 0;
        this.motion.z = acc.z || 0;
        this.motion.currentG = Math.hypot(this.motion.x, this.motion.y, this.motion.z) || 9.8;
      }
    });
  }

  bindTouchFallback() {
    // 监听移动端与桌面端鼠标手势
    const onStart = (clientX, clientY) => {
      const now = performance.now();
      if (now - this.lastTapTime < 350) {
        this.tapCount++;
      } else {
        this.tapCount = 1;
      }
      this.lastTapTime = now;
      this.touchStart = { x: clientX, y: clientY, time: now };
    };

    const onMove = (clientX, clientY) => {
      if (this.mode !== 'motion') {
        // 映射鼠标/拖拽为虚拟倾角
        const dx = (clientX / window.innerWidth) * 2 - 1;
        const dy = (clientY / window.innerHeight) * 2 - 1;
        this.virtualTilt.x = dx * 45;
        this.virtualTilt.y = dy * 45;
        this.orientation.gamma = this.virtualTilt.x;
        this.orientation.beta = this.virtualTilt.y;
        this.onSensorChange(this.getSensorPayload());
      }
    };

    const onEnd = (clientX, clientY) => {
      const dx = clientX - this.touchStart.x;
      const dy = clientY - this.touchStart.y;
      const dt = performance.now() - this.touchStart.time;

      if (dt < 500) {
        if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) {
          this.lastSwipe = dy < 0 ? 'swipeUp' : 'swipeDown';
        } else if (Math.abs(dx) > 35) {
          this.lastSwipe = dx < 0 ? 'swipeLeft' : 'swipeRight';
        }
      }
    };

    window.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      onEnd(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => onEnd(e.clientX, e.clientY));
  }

  getSensorPayload() {
    return {
      mode: this.mode,
      beta: Math.round(this.orientation.beta),
      gamma: Math.round(this.orientation.gamma),
      gForce: this.motion.currentG.toFixed(1),
      lastSwipe: this.lastSwipe,
    };
  }

  // ================= 6 大经典叙事交互触发器 ================= //

  /**
   * 1. 第一幕：端平手机检测 (Leveling)
   */
  checkLeveling() {
    if (this.mode === 'motion') {
      return Math.abs(this.orientation.beta) < 14 && Math.abs(this.orientation.gamma) < 14;
    }
    // 降级：点击即可
    return this.tapCount >= 1;
  }

  /**
   * 2. 第二幕：摇一摇唤雷 (Shake)
   */
  checkShake(thresholdG = 16.5) {
    if (this.mode === 'motion') {
      return this.motion.currentG > thresholdG;
    }
    // 降级：双击即可
    return this.tapCount >= 2;
  }

  /**
   * 3. 第三幕：滑翔偏航角 (Steer)
   */
  getSteerYaw() {
    // 将 gamma [-45, 45] 归一化为 [-1.0, 1.0]
    const g = Math.max(-45, Math.min(45, this.orientation.gamma));
    return g / 45;
  }

  /**
   * 4. 第四幕：绝对静止检测 (Stillness)
   */
  isCompletelyStill(tolerance = 1.4) {
    const jitter = Math.abs(this.motion.currentG - 9.8);
    return jitter < tolerance;
  }

  /**
   * 5. 第五幕：倾斜加速倍率 (Time Tilt)
   */
  getTimeAcceleration() {
    const tilt = Math.max(0, this.orientation.gamma);
    return Math.min(1.0, tilt / 40);
  }

  /**
   * 6. 第六幕：仰头饮用 (Raise Phone)
   */
  checkRaisePhone() {
    if (this.mode === 'motion') {
      return this.orientation.beta > 58;
    }
    // 降级：上滑手势
    return this.lastSwipe === 'swipeUp';
  }

  consumeGesture() {
    this.lastSwipe = null;
    this.tapCount = 0;
  }
}
