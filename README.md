# 解忧森林 (Forest of Solace) 🍃

> 治愈系数字化心理避风港 —— **释放情绪 → 转变思维 → 沉淀成长**。

「解忧森林」是一款基于现代心理学（认知行为疗法 CBT、自我关怀 Self-compassion、ACT 接纳承诺疗法、情绪标注 Affect Labeling、10-10-10法则与行为激活）的 2.5D 纸雕艺术风格 Web 应用。

---

## 一、视觉与交互特色

- **2.5D 层叠纸雕风**：纯 CSS 3D Transforms（`perspective` + `translateZ`），前后错开 6 层手绘矢量纸雕（天空 → 远山 → 远景林海 → 中景古树「岁岁」→ 草地小溪 → 近景蕨叶），无沉重 3D 引擎负担，轻盈 60FPS。
- **全屏纸张肌理**：通过纯 SVG `feTurbulence`（分形噪点）+ `mix-blend-mode: multiply` 叠底，呈现纤维触感。
- **两脚钉纸偶骨骼**：动物部件使用锚点旋转连接，模拟传统金属两脚钉装订；待机 12FPS 微抽帧定格动画，交互时流畅弹簧物理响应。
- **四时光影变幻**：支持按真实时间或手动切换（清晨微光、正午暖阳、黄昏晚霞、夜晚荧光与镂空逆光）。
- **立体书弹出卡片 (Pop-up Book)**：卡片与面板以底边为轴呈 3D 折叠弹起 (`rotateX`)。
- **本地优先与绝对隐私**：使用 IndexedDB（Dexie.js）存储，数据只留存用户设备，无后端数据库落盘。

---

## 二、技术栈

- **框架**：Next.js 14+ (App Router) + React 19 + TypeScript (Strict 严格模式，0 `any`)
- **样式与动画**：Tailwind CSS + CSS 3D (`preserve-3d`) + Framer Motion
- **本地存储**：Dexie.js (IndexedDB Local-First)
- **字体**：霞鹜文楷（LXGW WenKai 分片 WebFont）
- **AI 大模型**：
  - 核心发言与提炼：`claude-sonnet-5`
  - 轻量任务（指纹提取、记忆匹配、危机检测）：`claude-haiku-4-5-20251001`

---

## 三、环境要求与快速启动

### 1. 依赖安装

推荐使用 `pnpm`：

```bash
# 安装依赖
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置 Anthropic API Key 与模型名称（阶段二联调时使用）：

```env
# Anthropic Claude API Key (仅服务端调用，不暴露客户端)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# 模型配置
ANTHROPIC_MODEL_HEAVY=claude-sonnet-5
ANTHROPIC_MODEL_LIGHT=claude-haiku-4-5-20251001
```

### 3. 运行开发服务器

```bash
pnpm dev
```

在浏览器中打开：
- **首页**：[http://localhost:3000](http://localhost:3000)
- **阶段一风格样板页**：[http://localhost:3000/styleguide](http://localhost:3000/styleguide)

---

## 四、阶段一交付与体验指南

在样板页中，你可以体验并确认如下核心画风与微交互：

1. **2.5D 视差舞台**：
   - 桌面端：在舞台内随意移动鼠标，感受多层纸雕的错位立体景深；
   - 移动端：支持陀螺仪感应，未开启时自动正弦波平缓呼吸漂移。
2. **四时光影时钟**：
   - 切换「清晨 / 正午 / 黄昏 / 夜晚」，观察纸质太阳/月亮位移、古树与动物投影方向变化、树冠与树洞镂空透光。
3. **两脚钉纸偶系统**：
   - 切换「笃笃（啄木鸟）」与「团团（大棕熊）」，查看金属两脚钉细节；
   - 触发「待机呼吸、点头肯定、温柔环抱、受惊微弹、灵动俏皮」等肢体关节旋转。
4. **立体书卡片 (Pop-up Book)**：
   - 点击动物或点击面板按钮，测试卡片从水平平躺折叠立起的弹性手感。
5. **纸纹质感控制**：
   - 自由开启/关闭 SVG 纤维噪点滤镜，微调浓度百分比。

---

## 五、项目演进计划

- [x] **阶段 1：风格样板页**（已就绪，当前阶段）
- [ ] **阶段 2：森林主场景 + 7 只动物 + 7 个小游戏 + 倾诉圆桌（Claude API 接入）**
- [ ] **阶段 3：成长年轮三级画卷（年/月/日等高线展开）+ 思维转变卡片 + 演示假数据生成**
- [ ] **阶段 4：记忆唤醒（Haiku 精筛飘叶）+ 自伤危机熔断干预 + 本地数据主权与音效打磨**
