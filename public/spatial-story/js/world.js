/**
 * 3D 浮空山水生态沙盘与流场水体 (Three.js 纯数学代码级生成)
 * 沉淀自 webar-interactive-experience 技能规范
 */

export class SpatialWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // 核心 3D 对象
    this.islandGroup = null;
    this.waterMesh = null;
    this.dropletMesh = null;
    this.particles = null;
    this.poiGroup = null;

    // 动画状态
    this.clock = new THREE.Clock();
    this.timeUniform = { value: 0 };
    this.targetCameraPos = new THREE.Vector3(0, 4.2, 5.8);
    this.targetCameraLook = new THREE.Vector3(0, 0.4, 0);
    this.currentCameraLook = new THREE.Vector3(0, 0.4, 0);

    // 水滴当前轨迹控制
    this.dropletTrack = {
      x: 0,
      y: 1.2,
      z: 0,
      scale: 1.0,
      visible: true,
    };
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. 场景与相机
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x061118, 0.08);

    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 80);
    this.camera.position.copy(this.targetCameraPos);

    // 2. 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. 光照系统
    const ambient = new THREE.AmbientLight(0xdcf4ff, 0.9);
    const sunLight = new THREE.DirectionalLight(0xffecd0, 2.4);
    sunLight.position.set(4, 6, 3);
    const fillLight = new THREE.DirectionalLight(0x73c2ff, 0.8);
    fillLight.position.set(-4, 3, -3);
    this.scene.add(ambient, sunLight, fillLight);

    // 4. 构建程序化浮空山水岛与流场
    this.buildIsland();
    this.buildRiverWater();
    this.buildDroplet();
    this.buildAtmosphere();
    this.buildPOIs();

    // 5. 自适应缩放
    window.addEventListener('resize', () => this.onResize());
  }

  /**
   * 极坐标数学网格生成浮空岛
   */
  buildIsland() {
    this.islandGroup = new THREE.Group();
    const rings = 120;
    const segments = 360;
    const positions = [];
    const colors = [];
    const indices = [];

    const rimHeights = new Float32Array(segments + 1);
    const rimRadii = new Float32Array(segments + 1);
    const color = new THREE.Color();

    for (let r = 0; r <= rings; r++) {
      const tR = r / rings;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        // 岛屿自然不规则轮廓
        const radiusBound = 2.1 + 0.18 * Math.sin(theta * 3) + 0.12 * Math.cos(theta * 5);
        const radius = tR * radiusBound;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        // 程序化高程计算 (结合多尺度正弦与 FBM 丘陵)
        const dist = Math.hypot(x, z);
        let h = Math.max(0, 0.55 * (1 - dist / 2.3) + 0.12 * Math.sin(x * 6) * Math.cos(z * 6));
        // 中央开辟一道汉水峡谷凹槽
        const riverDistance = Math.abs(z - 0.25 * Math.sin(x * 2.2));
        if (riverDistance < 0.32) {
          h *= Math.pow(riverDistance / 0.32, 2.0); // 河道下切
        }

        positions.push(x, h, z);

        if (r === rings) {
          rimHeights[s] = h;
          rimRadii[s] = radius;
        }

        // 分层着色
        if (h < 0.05) {
          color.set('#24676b'); // 河床浅滩
        } else if (h < 0.22) {
          color.set('#6ba385'); // 滨江冲积原野
        } else if (h < 0.42) {
          color.set('#327866'); // 苍翠中林
        } else {
          color.set('#1e4f4b'); // 高山深岩
        }
        colors.push(color.r, color.g, color.b);
      }
    }

    const stride = segments + 1;
    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const a = r * stride + s;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.05,
    });
    const islandMesh = new THREE.Mesh(geo, mat);
    this.islandGroup.add(islandMesh);

    // 地下沉积岩倒锥形切面
    this.buildUndergroundStrata(rimRadii, rimHeights, segments);
    this.scene.add(this.islandGroup);
  }

  buildUndergroundStrata(rimRadii, rimHeights, segments) {
    const depths = 28;
    const positions = [];
    const colors = [];
    const indices = [];
    const color = new THREE.Color();
    const stride = segments + 1;

    for (let d = 0; d <= depths; d++) {
      const tD = d / depths;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const taper = Math.pow(1 - tD, 0.75);
        const r = rimRadii[s] * (d === 0 ? 1 : taper * 0.95);
        const h = d === 0 ? rimHeights[s] : rimHeights[s] * (1 - tD) - tD * 0.95;

        positions.push(Math.cos(theta) * r, h, Math.sin(theta) * r);

        // 千层沉积岩纹理色
        color.set('#2f4242').lerp(new THREE.Color('#0a1618'), tD);
        const stripe = Math.sin(h * 42.0) > 0.3 ? 0.85 : 1.15;
        color.multiplyScalar(stripe);
        colors.push(color.r, color.g, color.b);
      }
    }

    for (let d = 0; d < depths; d++) {
      for (let s = 0; s < segments; s++) {
        const a = d * stride + s;
        const b = a + 1;
        const c = a + stride;
        const e = c + 1;
        indices.push(a, b, c, b, e, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1.0 });
    const underMesh = new THREE.Mesh(geo, mat);
    this.islandGroup.add(underMesh);
  }

  /**
   * 动态流场水体 (River Flow Mesh)
   */
  buildRiverWater() {
    const geo = new THREE.PlaneGeometry(3.6, 1.4, 64, 32);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: this.timeUniform,
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          vUv = uv;
          vec4 worldP = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldP.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldP;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        void main() {
          // 水体顺流流动
          vec2 waveUv = vUv * vec2(8.0, 4.0) + vec2(uTime * 0.45, 0.0);
          float n1 = sin(waveUv.x * 6.0 + waveUv.y * 3.0 + uTime * 2.0);
          float n2 = cos(waveUv.x * 12.0 - waveUv.y * 5.0 + uTime * 1.5);
          float wave = (n1 + n2) * 0.5;

          vec3 shallow = vec3(0.22, 0.68, 0.75);
          vec3 deep = vec3(0.06, 0.28, 0.38);
          vec3 waterCol = mix(shallow, deep, vUv.y);
          waterCol += vec3(0.35) * pow(max(0.0, wave), 4.0); // 浪花高光

          // 两侧淡出
          float alpha = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y) * 0.82;
          gl_FragColor = vec4(waterCol, alpha);
        }
      `,
    });

    this.waterMesh = new THREE.Mesh(geo, mat);
    this.waterMesh.position.set(0, 0.04, 0.1);
    this.islandGroup.add(this.waterMesh);
  }

  /**
   * 晶莹灵动主角：3D 水滴 (Droplet Protagonist)
   */
  buildDroplet() {
    const geo = new THREE.SphereGeometry(0.12, 32, 24);
    // 上顶点拉尖，呈自然水滴形
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      if (y > 0) {
        pos.setY(i, y * 1.45);
        pos.setX(i, pos.getX(i) * (1 - y * 0.4));
        pos.setZ(i, pos.getZ(i) * (1 - y * 0.4));
      }
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xebf8ff,
      transmission: 0.95,
      opacity: 1.0,
      transparent: true,
      roughness: 0.04,
      ior: 1.333, // 水的真实折射率
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    this.dropletMesh = new THREE.Mesh(geo, mat);
    this.dropletMesh.position.set(0, 1.2, 0);

    // 水滴外圈微光光环
    const haloGeo = new THREE.RingGeometry(0.14, 0.24, 32);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x9be2ff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.name = 'halo';
    this.dropletMesh.add(halo);

    this.scene.add(this.dropletMesh);
  }

  /**
   * 飘渺星尘与云雾微粒
   */
  buildAtmosphere() {
    const count = 750;
    const positions = [];
    const colors = [];
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 8.0;
      const y = Math.random() * 3.5 - 0.5;
      const z = (Math.random() - 0.5) * 8.0;
      positions.push(x, y, z);

      c.setHSL(0.55 + Math.random() * 0.1, 0.7, 0.75);
      colors.push(c.r, c.g, c.b);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  /**
   * 3D 发光地理标牌
   */
  buildPOIs() {
    this.poiGroup = new THREE.Group();
    const POIS = [
      { text: '秦巴云起', pos: new THREE.Vector3(-1.2, 0.95, -0.8), groundY: 0.45 },
      { text: '汉江安澜', pos: new THREE.Vector3(0.1, 0.65, 0.1), groundY: 0.05 },
      { text: '千仞古岩', pos: new THREE.Vector3(1.1, 0.85, -0.6), groundY: 0.38 },
      { text: '灵泉初现', pos: new THREE.Vector3(0.7, 0.55, 0.9), groundY: 0.12 },
    ];

    POIS.forEach(({ text, pos, groundY }) => {
      // 竖直引线
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos.x, groundY, pos.z),
        pos,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffd99b,
        transparent: true,
        opacity: 0.55,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.poiGroup.add(line);

      // 文字 Sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 72;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(10, 30, 38, 0.85)';
      ctx.roundRect(4, 4, 248, 64, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffd99b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 36);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.scale.set(0.65, 0.18, 1);
      this.poiGroup.add(sprite);
    });

    this.scene.add(this.poiGroup);
  }

  // ================= 镜头运镜与章节切镜 ================= //

  setChapterCamera(chapterIndex) {
    const CAM_PRESETS = [
      // 1. 云生：高空鸟瞰
      { pos: new THREE.Vector3(0, 4.4, 5.2), look: new THREE.Vector3(0, 0.5, 0) },
      // 2. 唤雨：逼近山峰
      { pos: new THREE.Vector3(0, 2.6, 3.4), look: new THREE.Vector3(0, 0.8, -0.4) },
      // 3. 峡谷滑翔：低空跟拍
      { pos: new THREE.Vector3(0, 1.3, 2.0), look: new THREE.Vector3(0, 0.3, 0) },
      // 4. 地心静止：俯视暗河
      { pos: new THREE.Vector3(0, 0.9, 1.6), look: new THREE.Vector3(0, -0.2, 0) },
      // 5. 千载光年：侧面全景
      { pos: new THREE.Vector3(3.2, 2.2, 3.4), look: new THREE.Vector3(0, 0.3, 0) },
      // 6. 山巅清泉：晨曦特写
      { pos: new THREE.Vector3(0, 1.8, 2.4), look: new THREE.Vector3(0, 0.6, 0.6) },
    ];

    const preset = CAM_PRESETS[chapterIndex] || CAM_PRESETS[0];
    this.targetCameraPos.copy(preset.pos);
    this.targetCameraLook.copy(preset.look);
  }

  /**
   * 逐帧渲染与状态更新
   */
  update(deltaSeconds, steerOffset = 0) {
    const elapsed = this.clock.getElapsedTime();
    this.timeUniform.value = elapsed;

    // 1. 浮空岛呼吸与轻微浮动
    if (this.islandGroup) {
      this.islandGroup.position.y = Math.sin(elapsed * 0.8) * 0.04;
      this.islandGroup.rotation.y = elapsed * 0.03;
    }

    // 2. 水滴主角动态
    if (this.dropletMesh) {
      // 随手势/陀螺仪偏航横移
      this.dropletMesh.position.x += (steerOffset * 1.2 - this.dropletMesh.position.x) * deltaSeconds * 3;
      this.dropletMesh.position.y = this.dropletTrack.y + Math.sin(elapsed * 2.5) * 0.06;
      this.dropletMesh.position.z = this.dropletTrack.z;

      const halo = this.dropletMesh.getObjectByName('halo');
      if (halo) {
        halo.scale.setScalar(1.0 + Math.sin(elapsed * 4.0) * 0.12);
      }
    }

    // 3. 粒子浮游
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.015;
    }

    // 4. 镜头平滑插值 (Damping)
    this.camera.position.lerp(this.targetCameraPos, deltaSeconds * 2.2);
    this.currentCameraLook.lerp(this.targetCameraLook, deltaSeconds * 2.5);
    this.camera.lookAt(this.currentCameraLook);

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
