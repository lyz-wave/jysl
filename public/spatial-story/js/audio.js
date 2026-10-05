/**
 * 纯算法 Web Audio DSP 空间声学引擎
 * 沉淀自 webar-interactive-experience 技能规范
 * 
 * 特性：
 * 1. 零外部音频文件依赖，纯数学公式与振荡器实时合成环境音、惊雷、风声、古磬与水滴；
 * 2. 四总线拓扑架构 (music, ambience, sfx, voice)；
 * 3. 动态侧链闪避 (Sidechain Ducking)；
 * 4. 移动端 iOS / Android 首触静音锁穿透与后台挂起保护。
 */

export class SpatialDSPAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.isUnlocked = false;
    this.isMuted = false;

    this.buses = {
      music: null,
      ambience: null,
      sfx: null,
      voice: null,
    };

    // 活跃人声/重点音效计数，用于侧链下潜
    this.duckingCount = 0;
    this.windNode = null;
    this.rainNode = null;
    this.droneOscs = [];
  }

  init() {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. 全局母带压限器，防止多层算法叠加爆音
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12.0;
    this.compressor.knee.value = 6.0;
    this.compressor.ratio.value = 5.0;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // 2. 总音量节点
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // 3. 4 轨子总线
    for (const busName of ['music', 'ambience', 'sfx', 'voice']) {
      const bus = this.ctx.createGain();
      bus.gain.value = 1.0;
      bus.connect(this.masterGain);
      this.buses[busName] = bus;
    }

    // 监听移动端前后台切换
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) {
        this.ctx.suspend();
      } else if (this.isUnlocked) {
        this.ctx.resume();
      }
    });

    return this.ctx;
  }

  unlock() {
    this.init();
    if (this.isUnlocked) return Promise.resolve();

    return this.ctx.resume().then(() => {
      // 播放 1 个微型样本静音脉冲穿透静音锁
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(0);
      osc.stop(this.ctx.currentTime + 0.02);
      this.isUnlocked = true;
      console.info('[DSPAudio] Web Audio 上下文已解锁');
    });
  }

  updateDucking() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duck = this.duckingCount > 0;

    // 闪避时背景音乐压到 40%，环境音压到 50%
    const musicTarget = duck ? 0.38 : 0.85;
    const ambTarget = duck ? 0.45 : 0.90;

    this.buses.music.gain.setTargetAtTime(musicTarget, now, duck ? 0.12 : 0.5);
    this.buses.ambience.gain.setTargetAtTime(ambTarget, now, duck ? 0.12 : 0.5);
  }

  // ================= 纯算法 DSP 声学合成原语 ================= //

  /**
   * 1. 动态山谷风声（算法合成双二阶带通滤波白噪波）
   */
  startWind(intensity = 0.5) {
    this.init();
    if (this.windNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 420;
    filter.Q.value = 2.4;

    const gain = this.ctx.createGain();
    gain.gain.value = intensity * 0.4;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.buses.ambience);
    whiteNoise.start(0);

    this.windNode = { whiteNoise, filter, gain };
  }

  setWindModulation(freqMod, gainMod) {
    if (!this.windNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetFreq = Math.max(120, Math.min(1800, 380 + freqMod * 500));
    const targetGain = Math.max(0.01, Math.min(0.9, gainMod * 0.4));
    this.windNode.filter.frequency.setTargetAtTime(targetFreq, now, 0.2);
    this.windNode.gain.gain.setTargetAtTime(targetGain, now, 0.2);
  }

  stopWind(fadeSeconds = 1.0) {
    if (!this.windNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.windNode.gain.gain.setTargetAtTime(0.001, now, fadeSeconds * 0.5);
    setTimeout(() => {
      try {
        this.windNode?.whiteNoise.stop();
      } catch {}
      this.windNode = null;
    }, fadeSeconds * 1000);
  }

  /**
   * 2. 惊雷音效（深层低频冲击波 + 混响延展）
   */
  playThunder() {
    this.init();
    const now = this.ctx.currentTime;

    // 低频轰鸣振荡器
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 1.8);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    // 爆炸噪波脉冲
    const bufferSize = this.ctx.sampleRate * 2.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.45));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(380, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 2.0);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    osc.connect(oscGain);
    oscGain.connect(this.buses.sfx);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.buses.sfx);

    osc.start(now);
    osc.stop(now + 2.4);
    noise.start(now);
    noise.stop(now + 2.5);
  }

  /**
   * 3. 清澈水滴声 (Droplet Drip Chime)
   */
  playDrip(pitch = 1800) {
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.45, now + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * 4. 空灵古磬/编钟 (Ancient Resonator Bell)
   */
  playChime(baseFreq = 528) {
    this.init();
    const now = this.ctx.currentTime;
    const partials = [1, 1.66, 2.52, 3.98];
    const decays = [3.2, 2.4, 1.8, 1.1];

    partials.forEach((p, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * p;

      const gain = this.ctx.createGain();
      const peak = 0.35 / (idx + 1);
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(gain);
      gain.connect(this.buses.sfx);

      osc.start(now);
      osc.stop(now + decays[idx]);
    });
  }

  /**
   * 5. 舒缓环境和弦垫 (Meditative Ambient Chord Pad)
   */
  startAmbientDrone(rootFreq = 130.81) {
    this.init();
    this.stopAmbientDrone();

    const chordPitches = [1, 1.498, 1.887, 2.245];
    this.droneOscs = chordPitches.map((ratio) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = rootFreq * ratio;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.buses.music);
      osc.start(0);

      return { osc, gain };
    });
  }

  stopAmbientDrone() {
    if (!this.droneOscs.length || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.droneOscs.forEach(({ osc, gain }) => {
      gain.gain.setTargetAtTime(0.001, now, 1.0);
      setTimeout(() => {
        try { osc.stop(); } catch {}
      }, 1500);
    });
    this.droneOscs = [];
  }

  /**
   * 6. 饮水与泉涌吞咽声 (Spring Gulp)
   */
  playSip() {
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.28);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.buses.sfx);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  setMute(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }
}
