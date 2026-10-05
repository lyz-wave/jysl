/**
 * 沉浸式 3D 空间叙事 H5 主控引擎
 * 沉淀自 webar-interactive-experience 技能规范
 */

import { SpatialDSPAudio } from './audio.js';
import { SpatialSensorController } from './sensor.js';
import { SpatialWorld } from './world.js';

class SpatialStoryApp {
  constructor() {
    this.audio = new SpatialDSPAudio();
    this.sensor = null;
    this.world = null;

    this.currentChapter = 0;
    this.isTransitioning = false;
    this.isStarted = false;

    // 章节定义配置
    this.chapters = [
      {
        id: 0,
        title: '云生',
        subtitle: '北秦岭 · 南巴山 · 汉水中流',
        poem: '山河未名，长风浩荡。',
        hint: '【端平手机】 让风停一停，水汽凝滴',
        touchHint: '【轻触屏幕】 让风停一停',
        action: 'level',
      },
      {
        id: 1,
        title: '惊雷',
        subtitle: '女娲炼石 · 灵石出云',
        poem: '电光隐于山岚，春雷动于九天。',
        hint: '【轻轻摇一摇】 借一声惊雷，唤雨落山',
        touchHint: '【快速双击屏幕】 借一声惊雷',
        action: 'shake',
      },
      {
        id: 2,
        title: '穿云',
        subtitle: '苍峦飞掠 · 顺流而下',
        poem: '掠过万仞青峰，汇入清澈山涧。',
        hint: '【左右摆动手机】 操纵水滴滑翔穿过峡谷',
        touchHint: '【左右滑动】 操纵水滴飞掠',
        action: 'steer',
      },
      {
        id: 3,
        title: '静默',
        subtitle: '山里千溪奔汉江 · 唯有一滴向下走',
        poem: '岩石很慢，它也不急。',
        hint: '【屏息静止 3 秒】 保持手机平稳，水滴潜入地隙',
        touchHint: '【请勿触摸屏幕 3 秒】 静候水滴潜行',
        action: 'still',
      },
      {
        id: 4,
        title: '千载',
        subtitle: '深层岩脉 · 七千五百年矿化沉淀',
        poem: '头顶走过千年人间，地心深处唯有纯澈。',
        hint: '【向右倾斜手机】 加速千年历史光阴流转',
        touchHint: '【向右滑动屏幕】 加速光阴流转',
        action: 'timeTilt',
      },
      {
        id: 5,
        title: '溯源',
        subtitle: '灵泉出山 · 润泽当下',
        poem: '你喝下的这一口，在山里走了七千五百年。',
        hint: '【抬起手机仰头】 喝下一口纯澈山泉',
        touchHint: '【向上滑屏幕】 喝下一口甘泉',
        action: 'raise',
      },
    ];

    // 章节计时器与内部计数
    this.chapterTimer = 0;
    this.stillTimer = 0;
    this.yearCounter = -5474;
  }

  init() {
    const container = document.getElementById('webgl-container');
    this.world = new SpatialWorld(container);
    this.world.init();

    this.sensor = new SpatialSensorController({
      onSensorChange: (data) => this.updateSensorHUD(data),
    });

    this.bindDOMEvents();
    this.startRenderLoop();
  }

  bindDOMEvents() {
    // 启程按钮
    const btnEnter = document.getElementById('btn-enter');
    btnEnter?.addEventListener('click', async () => {
      await this.startExperience();
    });

    // 静音切换
    const btnSound = document.getElementById('btn-sound');
    btnSound?.addEventListener('click', () => {
      const muted = !this.audio.isMuted;
      this.audio.setMute(muted);
      btnSound.classList.toggle('muted', muted);
    });

    // 重新启程
    const btnReplay = document.getElementById('btn-replay');
    btnReplay?.addEventListener('click', () => {
      document.getElementById('certificate-modal')?.classList.add('hidden');
      this.currentChapter = 0;
      this.enterChapter(0);
    });

    // 保存证书
    const btnSave = document.getElementById('btn-save-cert');
    btnSave?.addEventListener('click', () => {
      this.saveCertificateImage();
    });
  }

  async startExperience() {
    // 解锁音频
    await this.audio.unlock();
    this.audio.startAmbientDrone();
    this.audio.startWind(0.6);
    this.audio.playChime(528);

    // 申请传感器权限
    await this.sensor.requestPermission();

    document.getElementById('intro-cover')?.classList.add('hidden');
    document.getElementById('story-hud')?.classList.remove('hidden');
    this.isStarted = true;

    this.enterChapter(0);
  }

  enterChapter(index) {
    this.currentChapter = index;
    this.isTransitioning = true;
    this.chapterTimer = performance.now();
    this.stillTimer = 0;
    this.sensor.consumeGesture();

    const config = this.chapters[index];
    if (!config) {
      this.showCertificate();
      return;
    }

    // 更新 HUD 界面文字
    const elTitle = document.getElementById('chap-title');
    const elSub = document.getElementById('chap-sub');
    const elPoem = document.getElementById('chap-poem');
    const elHint = document.getElementById('chap-hint');
    const elBadge = document.getElementById('chap-badge');
    const elProgress = document.getElementById('progress-bar');

    if (elTitle) elTitle.innerText = `第${['一','二','三','四','五','六'][index]}幕 · ${config.title}`;
    if (elSub) elSub.innerText = config.subtitle;
    if (elPoem) elPoem.innerText = config.poem;
    if (elHint) elHint.innerText = this.sensor.mode === 'motion' ? config.hint : config.touchHint;
    if (elBadge) elBadge.innerText = `0${index + 1} / 06`;
    if (elProgress) elProgress.style.width = `${((index + 1) / 6) * 100}%`;

    // 运镜机位调整
    this.world.setChapterCamera(index);

    // 音效分发
    if (index === 0) {
      this.audio.startWind(0.7);
    } else if (index === 1) {
      this.audio.playThunder();
    } else if (index === 2) {
      this.audio.playDrip(2100);
      this.audio.stopWind(2.0);
    } else if (index === 3) {
      this.audio.playDrip(900);
      this.audio.playChime(440);
    } else if (index === 4) {
      this.audio.playChime(396);
      document.getElementById('year-dial')?.classList.remove('hidden');
    } else if (index === 5) {
      document.getElementById('year-dial')?.classList.add('hidden');
      this.audio.playDrip(1600);
    }

    // 触发呼吸动效
    const hudCard = document.getElementById('story-card');
    hudCard?.classList.remove('pulse-in');
    void hudCard?.offsetWidth;
    hudCard?.classList.add('pulse-in');

    setTimeout(() => {
      this.isTransitioning = false;
    }, 900);
  }

  checkChapterProgression(dt) {
    if (this.isTransitioning || !this.isStarted) return;
    const config = this.chapters[this.currentChapter];
    if (!config) return;

    const timeInChapter = (performance.now() - this.chapterTimer) / 1000;
    let satisfied = false;

    switch (config.action) {
      case 'level':
        // 第一幕：端平手机
        satisfied = this.sensor.checkLeveling() && timeInChapter > 2.0;
        if (satisfied) this.audio.stopWind(0.8);
        break;

      case 'shake':
        // 第二幕：摇一摇
        satisfied = this.sensor.checkShake() && timeInChapter > 1.2;
        if (satisfied) this.audio.playThunder();
        break;

      case 'steer':
        // 第三幕：滑翔漫游 5 秒
        satisfied = timeInChapter > 5.5;
        break;

      case 'still':
        // 第四幕：静止 3 秒
        if (this.sensor.isCompletelyStill()) {
          this.stillTimer += dt;
          const hint = document.getElementById('chap-hint');
          if (hint) hint.innerText = `保持平稳静默：${(3.0 - this.stillTimer).toFixed(1)} 秒`;
          if (this.stillTimer >= 3.0) satisfied = true;
        } else {
          this.stillTimer = Math.max(0, this.stillTimer - dt * 2.5);
        }
        break;

      case 'timeTilt':
        // 第五幕：倾斜加速，年份流转
        const accel = this.sensor.getTimeAcceleration();
        const speed = (accel > 0.05 ? accel * 850 : 120) * dt;
        this.yearCounter = Math.min(2026, this.yearCounter + speed);
        
        const yearEl = document.getElementById('year-val');
        if (yearEl) {
          yearEl.innerText = this.yearCounter < 0 ? `公元前 ${Math.abs(Math.round(this.yearCounter))} 年` : `公元 ${Math.round(this.yearCounter)} 年`;
        }
        if (this.yearCounter >= 2026 && timeInChapter > 4.5) {
          satisfied = true;
        }
        break;

      case 'raise':
        // 第六幕：仰头饮用
        satisfied = this.sensor.checkRaisePhone() && timeInChapter > 1.8;
        if (satisfied) {
          this.audio.playSip();
          this.audio.playChime(639);
        }
        break;
    }

    // 超时逃生门保底 (每幕 12 秒强制允许通过，防止物理卡死)
    if (timeInChapter > 12.0) {
      satisfied = true;
    }

    if (satisfied) {
      this.sensor.consumeGesture();
      this.enterChapter(this.currentChapter + 1);
    }
  }

  updateSensorHUD(data) {
    const elMode = document.getElementById('hud-mode');
    const elBeta = document.getElementById('hud-beta');
    const elGamma = document.getElementById('hud-gamma');
    const elG = document.getElementById('hud-g');

    if (elMode) elMode.innerText = data.mode === 'motion' ? '体感' : '触控';
    if (elBeta) elBeta.innerText = `${data.beta}°`;
    if (elGamma) elGamma.innerText = `${data.gamma}°`;
    if (elG) elG.innerText = `${data.gForce}G`;
  }

  startRenderLoop() {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (this.isStarted) {
        this.checkChapterProgression(dt);
      }

      // 获取当前偏航控制水滴
      const steer = this.sensor ? this.sensor.getSteerYaw() : 0;
      this.world?.update(dt, steer);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /**
   * 终幕：绘制专属时空结缘证书
   */
  showCertificate() {
    document.getElementById('story-hud')?.classList.add('hidden');
    const modal = document.getElementById('certificate-modal');
    modal?.classList.remove('hidden');

    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    canvas.width = 680;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');

    // 渐变底色
    const grad = ctx.createLinearGradient(0, 0, 0, 920);
    grad.addColorStop(0, '#0a2228');
    grad.addColorStop(1, '#051114');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 680, 920);

    // 双层金线边框
    ctx.strokeStyle = '#c8a86b';
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, 624, 864);
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, 608, 848);

    // 标题文字
    ctx.fillStyle = '#f8ecdc';
    ctx.font = 'bold 36px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('山海之息 · 时空结缘铭文', 340, 110);

    ctx.fillStyle = '#a8c7be';
    ctx.font = '22px sans-serif';
    ctx.fillText('一滴水 · 七千五百年', 340, 155);

    // 证书正文
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    const lines = [
      '雨落秦巴女娲山，入地矿化七千载。',
      '它曾穿行于千仞岩隙，路过千年人间沧海桑田。',
      '于今时今日，在秦岭与汉水之间，',
      '化作甘霖，落在你的手里。',
      '',
      '愿你所得皆安康，所行皆坦途。',
    ];
    lines.forEach((l, idx) => {
      ctx.fillText(l, 340, 260 + idx * 46);
    });

    // 印章 (朱砂红印)
    ctx.strokeStyle = '#b83b2a';
    ctx.lineWidth = 3;
    ctx.strokeRect(290, 620, 100, 100);
    ctx.fillStyle = '#b83b2a';
    ctx.font = 'bold 32px "Noto Serif SC", serif';
    ctx.fillText('安康', 340, 660);
    ctx.fillText('硒谷', 340, 700);

    // 防伪时空编码
    const code = `AK-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36).toUpperCase()}`;
    ctx.fillStyle = '#899e98';
    ctx.font = '16px monospace';
    ctx.fillText(`经纬度：109.02°E 32.70°N  |  溯源码：${code}`, 340, 800);
    ctx.fillText(new Date().toLocaleDateString('zh-CN'), 340, 835);
  }

  saveCertificateImage() {
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `山海结缘证书_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

// 启动入口
window.addEventListener('DOMContentLoaded', () => {
  const app = new SpatialStoryApp();
  app.init();
});
