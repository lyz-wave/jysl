import { AnimalDefinition, AnimalId } from './types';

export const ANIMALS: Record<AnimalId, AnimalDefinition> = {
  woodpecker: {
    id: 'woodpecker',
    name: '笃笃',
    title: '情绪觉察者',
    mindset: '情绪是信号，不是敌人',
    psychology: '情绪标注（Affect Labeling）',
    tone: '直爽有劲，句子短，清脆明快',
    gameName: '敲树洞',
    gameSummary: '快速点击树干啄击，释放淤积压力，挑选直面当下真实情绪词',
    colors: {
      primary: '#2B3036',   // 墨炭黑羽
      secondary: '#F5F5EE', // 纯白颊羽与羽斑
      accent: '#D43827',    // 亮朱红锯齿羽冠
      belly: '#E5E8DF',     // 浅灰白腹羽
      details: '#C28B38',   // 坚实角质喙
    },
    viewBox: '0 0 240 280',
    defaultScale: 1.05,
    parts: [
      {
        id: 'tail',
        name: '刚硬楔形尾羽',
        // 啄木鸟特有的刚硬双叉支撑尾羽，紧抵树皮
        svgPath: 'M115,160 L78,245 L94,252 L112,185 L125,255 L138,248 L128,160 Z',
        fill: '#202428',
        stroke: '#14171A',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 122, y: 165 },
        hasSplitPin: true,
        pinCoord: { x: 122, y: 165 },
        cutoutPaths: [
          // 白色羽纹剪纸条
          'M88,210 L94,240 L98,212 Z',
          'M122,215 L126,242 L130,218 Z',
        ],
      },
      {
        id: 'feet',
        name: '对趾抓树爪',
        // 啄木鸟典型的两前两后强力抓爪
        svgPath: 'M75,175 L45,172 M78,182 L46,188 M82,188 L58,206 M85,192 L70,215',
        fill: 'none',
        stroke: '#82654C',
        strokeWidth: 4.5,
        zIndex: 3,
        pivot: { x: 78, y: 182 },
      },
      {
        id: 'body',
        name: '流线身躯与胸羽',
        // 饱满胸膛与背羽
        svgPath: 'M95,85 C135,85 155,115 150,165 C145,200 120,212 95,205 C75,198 72,160 78,118 C82,98 88,85 95,85 Z',
        fill: '#2B3036',
        stroke: '#1A1D21',
        strokeWidth: 2,
        zIndex: 4,
        pivot: { x: 105, y: 155 },
        cutoutPaths: [
          // 奶白胸羽前片（层叠剪纸）
          'M92,105 C115,105 125,125 120,168 C115,192 100,198 88,190 C80,172 82,130 92,105 Z',
          // 腹侧小黑斑点
          'M105,145 A 2 2 0 1 0 109 145 A 2 2 0 1 0 105 145',
          'M110,162 A 2.2 2.2 0 1 0 114.4 162 A 2.2 2.2 0 1 0 110 162',
        ],
      },
      {
        id: 'wing',
        name: '黑白斑驳飞羽',
        // 黑白相间的经典啄木鸟斑驳折纸翅膀
        svgPath: 'M108,102 C138,102 165,130 152,182 C140,202 120,180 112,142 Z',
        fill: '#202428',
        stroke: '#14171A',
        strokeWidth: 2,
        zIndex: 6,
        pivot: { x: 115, y: 108 },
        hasSplitPin: true,
        pinCoord: { x: 115, y: 108 },
        cutoutPaths: [
          // 翅膀横斑剪纸白条
          'M122,122 L142,126 L139,132 L119,128 Z',
          'M125,140 L146,146 L143,152 L122,146 Z',
          'M126,158 L144,166 L140,171 L124,164 Z',
        ],
      },
      {
        id: 'head',
        name: '头部、面纹与朱红羽冠',
        // 头部纸片 + 黑色眼罩条纹 + 鲜亮张扬的朱红冠羽
        svgPath: 'M85,92 C72,78 78,45 106,40 C132,38 144,60 138,85 C132,102 102,104 85,92 Z',
        fill: '#FAF7EE',
        stroke: '#2B3036',
        strokeWidth: 2,
        zIndex: 5,
        pivot: { x: 102, y: 92 },
        hasSplitPin: true,
        pinCoord: { x: 102, y: 92 },
        cutoutPaths: [
          // 醒目的大冠羽（顶部带手剪锯齿）
          'M105,40 C100,12 118,5 132,12 C142,18 138,32 130,42 Z',
          // 黑色眼带纹理
          'M78,68 L124,65 L128,74 L80,78 Z',
          // 灵动眼睛
          'M98,62 A 5 5 0 1 0 108 62 A 5 5 0 1 0 98 62',
        ],
      },
      {
        id: 'beak',
        name: '强韧凿状喙',
        // 坚实锋利的三角形木凿喙
        svgPath: 'M76,68 L18,76 L76,86 Z',
        fill: '#C8923E',
        stroke: '#82591B',
        strokeWidth: 2,
        zIndex: 5,
        pivot: { x: 76, y: 77 },
        cutoutPaths: [
          // 喙中分线
          'M76,77 L22,77',
        ],
      },
    ],
  },

  bear: {
    id: 'bear',
    name: '团团',
    title: '自我关怀者',
    mindset: '像对待最好朋友一样对待自己',
    psychology: '自我关怀（Self-compassion）',
    tone: '温柔缓慢，宽厚抱抱，语速沉稳治愈',
    gameName: '熊抱',
    gameSummary: '长按团团感受双臂环抱与温热光晕，随 60bpm 沉浸心跳舒缓紧绷神经',
    colors: {
      primary: '#6B4931',   // 暖栗棕卡纸
      secondary: '#8E6748', // 浅暖棕耳廓
      accent: '#EFA682',    // 治愈粉腮
      belly: '#F4E6D8',     // 燕麦奶白月牙胸
      details: '#2C1D13',   // 湿润深棕鼻头
    },
    viewBox: '0 0 260 280',
    defaultScale: 1.05,
    parts: [
      {
        id: 'legs',
        name: '敦实盘坐后腿',
        // 盘坐在地面的两个大熊掌肉垫
        svgPath: 'M40,210 C30,230 45,260 85,260 C110,260 115,235 105,215 Z M220,210 C230,230 215,260 175,260 C150,260 145,235 155,215 Z',
        fill: '#5A3D28',
        stroke: '#3D2819',
        strokeWidth: 2,
        zIndex: 1,
        pivot: { x: 130, y: 220 },
        cutoutPaths: [
          // 脚底燕麦肉垫
          'M55,238 C55,225 75,225 75,238 C75,250 55,250 55,238 Z',
          'M185,238 C185,225 205,225 205,238 C205,250 185,250 185,238 Z',
        ],
      },
      {
        id: 'ears',
        name: '圆绒绒熊耳',
        svgPath: 'M62,45 A 22 22 0 1 1 98,62 M162,62 A 22 22 0 1 1 198,45',
        fill: '#8E6748',
        stroke: '#4A301E',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 130, y: 85 },
        cutoutPaths: [
          // 耳蜗粉绒小纸片
          'M72,48 A 12 12 0 1 1 92,58',
          'M168,58 A 12 12 0 1 1 188,48',
        ],
      },
      {
        id: 'body',
        name: '暖乎乎熊躯与月牙胸肚',
        svgPath: 'M60,115 C40,165 50,240 130,245 C210,240 220,165 200,115 C185,85 75,85 60,115 Z',
        fill: '#6B4931',
        stroke: '#4A301E',
        strokeWidth: 2.5,
        zIndex: 3,
        pivot: { x: 130, y: 175 },
        cutoutPaths: [
          // 暖白月牙胸贴片（带手撕不规则纸边缘）
          'M82,130 C75,175 85,225 130,230 C175,225 185,175 178,130 C165,115 95,115 82,130 Z',
        ],
      },
      {
        id: 'head',
        name: '温柔治愈大熊首',
        svgPath: 'M68,82 C62,48 92,32 130,32 C168,32 198,48 192,82 C186,116 74,116 68,82 Z',
        fill: '#7A543A',
        stroke: '#4A301E',
        strokeWidth: 2,
        zIndex: 4,
        pivot: { x: 130, y: 95 },
        hasSplitPin: true,
        pinCoord: { x: 130, y: 98 },
        cutoutPaths: [
          // 奶白口吻部
          'M105,78 C100,68 110,60 130,60 C150,60 160,68 155,78 C150,92 110,92 105,78 Z',
          // 湿润心形鼻头
          'M122,68 C122,64 138,64 138,68 C138,74 122,74 122,68 Z',
          // 弯弯温和笑眼与粉扑扑腮红
          'M92,62 Q100,56 108,62 M152,62 Q160,56 168,62',
          'M82,75 A 7 5 0 1 0 96 75 A 7 5 0 1 0 82 75',
          'M164,75 A 7 5 0 1 0 178 75 A 7 5 0 1 0 164 75',
        ],
      },
      {
        id: 'armLeft',
        name: '左抱抱臂',
        // 弧度饱满的环抱手臂，可大幅张开与合抱
        svgPath: 'M68,115 C45,125 22,160 38,205 C50,225 78,210 82,180 C85,155 85,130 68,115 Z',
        fill: '#845B3C',
        stroke: '#4A301E',
        strokeWidth: 2.2,
        zIndex: 6,
        pivot: { x: 75, y: 120 },
        hasSplitPin: true,
        pinCoord: { x: 75, y: 120 },
        cutoutPaths: [
          // 掌心肉垫
          'M46,192 A 6 6 0 1 0 58 192 A 6 6 0 1 0 46 192',
        ],
      },
      {
        id: 'armRight',
        name: '右抱抱臂',
        svgPath: 'M192,115 C215,125 238,160 222,205 C210,225 182,210 178,180 C175,155 175,130 192,115 Z',
        fill: '#845B3C',
        stroke: '#4A301E',
        strokeWidth: 2.2,
        zIndex: 6,
        pivot: { x: 185, y: 120 },
        hasSplitPin: true,
        pinCoord: { x: 185, y: 120 },
        cutoutPaths: [
          'M202,192 A 6 6 0 1 0 214 192 A 6 6 0 1 0 202 192',
        ],
      },
    ],
  },

  owl: {
    id: 'owl',
    name: '墨墨',
    title: '理性分析者',
    mindset: '分清事实和猜测，跳出思维陷阱',
    psychology: '认知行为疗法（CBT）',
    tone: '冷静睿智，爱提问，条理清晰',
    gameName: '事实还是猜测',
    gameSummary: '将烦恼拆解为气泡碎片，拖进事实与猜测树洞，识别认知盲区',
    colors: {
      primary: '#2F3C48',   // 墨青羽灰
      secondary: '#4D6173', // 灰蓝飞羽
      accent: '#F5BE38',    // 金黄智慧眼眸
      belly: '#FAF8F2',     // 白絮胸羽
      details: '#D6892A',   // 弯钩小喙
    },
    viewBox: '0 0 240 270',
    defaultScale: 1.0,
    parts: [
      {
        id: 'feet',
        name: '抓枝利爪',
        // 紧扣在古树横枝上的两副金黄小利爪，横枝固定在古树上
        svgPath: 'M95,218 L90,234 M102,218 L102,236 M108,218 L114,234 M132,218 L126,234 M138,218 L138,236 M145,218 L150,234',
        fill: 'none',
        stroke: '#D6892A',
        strokeWidth: 3.5,
        zIndex: 4,
        pivot: { x: 120, y: 220 },
      },
      {
        id: 'body',
        name: '猫头鹰丰满身躯',
        svgPath: 'M75,95 C62,145 68,215 120,225 C172,215 178,145 165,95 C150,70 90,70 75,95 Z',
        fill: '#2F3C48',
        stroke: '#1D262F',
        strokeWidth: 2.2,
        zIndex: 2,
        pivot: { x: 120, y: 160 },
        cutoutPaths: [
          // 奶白胸腹鳞状剪纸羽片
          'M92,118 C85,155 92,205 120,210 C148,205 155,155 148,118 C140,95 100,95 92,118 Z',
          // 锯齿羽纹
          'M105,142 L112,148 L120,142 L128,148 L135,142',
          'M102,165 L112,172 L120,165 L128,172 L138,165',
        ],
      },
      {
        id: 'wingLeft',
        name: '左飞羽',
        svgPath: 'M78,102 C52,125 45,180 72,215 C85,195 85,145 78,102 Z',
        fill: '#4D6173',
        stroke: '#1D262F',
        strokeWidth: 2,
        zIndex: 3,
        pivot: { x: 78, y: 105 },
        hasSplitPin: true,
        pinCoord: { x: 78, y: 105 },
        cutoutPaths: [
          'M58,160 L70,165 M54,180 L68,185',
        ],
      },
      {
        id: 'wingRight',
        name: '右飞羽',
        svgPath: 'M162,102 C188,125 195,180 168,215 C155,195 155,145 162,102 Z',
        fill: '#4D6173',
        stroke: '#1D262F',
        strokeWidth: 2,
        zIndex: 3,
        pivot: { x: 162, y: 105 },
        hasSplitPin: true,
        pinCoord: { x: 162, y: 105 },
        cutoutPaths: [
          'M182,160 L170,165 M186,180 L172,185',
        ],
      },
      {
        id: 'head',
        name: '羽角面盘与洞察金瞳',
        // 耸立的双羽角簇 + 两个心形圆形双眼面盘
        svgPath: 'M62,68 L72,25 L98,52 L142,52 L168,25 L178,68 C185,108 55,108 62,68 Z',
        fill: '#3B4B59',
        stroke: '#1D262F',
        strokeWidth: 2,
        zIndex: 5,
        pivot: { x: 120, y: 78 },
        hasSplitPin: true,
        pinCoord: { x: 120, y: 82 },
        cutoutPaths: [
          // 左面盘纯白卡纸
          'M74,72 A 16 16 0 1 0 106 72 A 16 16 0 1 0 74 72',
          // 右面盘纯白卡纸
          'M134,72 A 16 16 0 1 0 166 72 A 16 16 0 1 0 134 72',
          // 左金黄圆目与黑瞳
          'M82,72 A 8 8 0 1 0 98 72 A 8 8 0 1 0 82 72',
          'M142,72 A 8 8 0 1 0 158 72 A 8 8 0 1 0 142 72',
          // 弯钩小黄喙
          'M116,78 L124,78 L120,92 Z',
        ],
      },
    ],
  },

  fox: {
    id: 'fox',
    name: '阿橘',
    title: '换角度大师',
    mindset: '同一件事换个看台，就有另一番风景',
    psychology: '认知重构（Reframing）',
    tone: '机灵俏皮，但不轻浮，充满灵光闪烁',
    gameName: '翻面镜',
    gameSummary: '尾巴一扫翻转心境镜面，看幽默、温柔与现实三重解题视角',
    colors: {
      primary: '#DF5E28',   // 赤橙狐毛
      secondary: '#FAF7EE', // 白茸胸腹与尾尖
      accent: '#282421',    // 黑鼻头与黑足袜
      belly: '#FAF7EE',
      details: '#A83B10',
    },
    viewBox: '0 0 260 270',
    defaultScale: 1.05,
    parts: [
      {
        id: 'tail',
        name: '蓬松大狐尾与白尾尖',
        // 卷翘的经典巨型大狐尾
        svgPath: 'M130,175 C185,188 235,145 220,85 C208,55 175,70 160,110 C148,142 140,165 130,175 Z',
        fill: '#DF5E28',
        stroke: '#9E3912',
        strokeWidth: 2.2,
        zIndex: 1,
        pivot: { x: 135, y: 172 },
        hasSplitPin: true,
        pinCoord: { x: 135, y: 172 },
        cutoutPaths: [
          // 手撕锯齿白尾尖
          'M220,85 C208,55 175,70 185,92 C195,85 208,86 220,85 Z',
        ],
      },
      {
        id: 'body',
        name: '灵巧狐身与白围脖',
        svgPath: 'M85,115 C68,145 75,200 115,210 C150,205 155,155 142,120 C130,100 98,100 85,115 Z',
        fill: '#CF521E',
        stroke: '#9E3912',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 115, y: 165 },
        cutoutPaths: [
          // 白蓬蓬围脖
          'M95,110 C82,130 90,165 115,170 C140,165 148,130 135,110 C125,95 105,95 95,110 Z',
        ],
      },
      {
        id: 'head',
        name: '尖下颏狐首与尖长直耳',
        svgPath: 'M68,78 L80,30 L105,58 L125,58 L150,30 L162,78 C168,108 115,128 115,128 C115,128 62,108 68,78 Z',
        fill: '#DF5E28',
        stroke: '#9E3912',
        strokeWidth: 2,
        zIndex: 4,
        pivot: { x: 115, y: 92 },
        hasSplitPin: true,
        pinCoord: { x: 115, y: 92 },
        cutoutPaths: [
          // 纯白面颊毛片
          'M78,82 C74,98 88,110 115,124 C142,110 156,98 152,82 C135,102 95,102 78,82 Z',
          // 灵动黑杏仁眼
          'M92,82 Q99,76 106,82 M124,82 Q131,76 138,82',
          // 黑色小巧鼻尖
          'M111,120 L119,120 L115,126 Z',
        ],
      },
    ],
  },

  turtle: {
    id: 'turtle',
    name: '慢慢',
    title: '时间漫步者',
    mindset: '放进十年长河里看，现在只需一次深呼吸',
    psychology: '10-10-10 法则 + 正念',
    tone: '慢悠悠、豁达开阔，爱讲很久以前的故事',
    gameName: '龟壳呼吸',
    gameSummary: '4-4-4-4 盒式呼吸节奏，感受纸壳随吸气膨胀、呼气安顿的平静',
    colors: {
      primary: '#3B6846',   // 青苔深绿卡纸
      secondary: '#679B75', // 翠玉龟颈
      accent: '#DFC484',    // 纸雕等高线金纹
      belly: '#ECE2CF',     // 亚麻色腹甲
      details: '#24452C',
    },
    viewBox: '0 0 260 240',
    defaultScale: 1.05,
    parts: [
      {
        id: 'shellBackdrop',
        name: '腹甲与后爪',
        svgPath: 'M60,165 C45,190 70,210 95,200 M170,165 C185,190 210,210 185,200',
        fill: '#2B4A33',
        stroke: '#1B3021',
        strokeWidth: 2,
        zIndex: 1,
        pivot: { x: 130, y: 160 },
      },
      {
        id: 'shell',
        name: '多层等高线纸雕龟壳',
        // 拱形高耸的六边形几何刻纹龟甲
        svgPath: 'M48,155 C38,85 105,48 165,58 C212,68 222,125 198,162 C175,188 75,188 48,155 Z',
        fill: '#3B6846',
        stroke: '#24452C',
        strokeWidth: 2.5,
        zIndex: 3,
        pivot: { x: 130, y: 120 },
        cutoutPaths: [
          // 等高线第二层剪纸
          'M68,142 C60,95 115,68 158,76 C195,84 200,128 182,150 C165,168 85,165 68,142 Z',
          // 等高线第三层中心高地纸片
          'M92,130 C88,105 125,88 150,94 C175,100 178,128 165,138 C152,148 102,148 92,130 Z',
        ],
      },
      {
        id: 'head',
        name: '探头探脑长龟颈与笑靥',
        // 可伸展回缩的温润龟头
        svgPath: 'M175,128 C195,115 228,112 238,128 C242,142 228,158 198,152 Z',
        fill: '#679B75',
        stroke: '#24452C',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 180, y: 140 },
        hasSplitPin: true,
        pinCoord: { x: 180, y: 140 },
        cutoutPaths: [
          // 豁达咪咪笑眼与褶皱
          'M220,126 Q226,120 232,126',
        ],
      },
    ],
  },

  otter: {
    id: 'otter',
    name: '漂漂',
    title: '随流解离者',
    mindset: '羽毛不沾流水，念头过境，随它漂走便是',
    psychology: 'ACT 认知解离（Cognitive Defusion）',
    tone: '轻松随性，嘎嘎欢快，爱浮水戏叶，怡然自得',
    gameName: '落叶漂流',
    gameSummary: '将负面想法化作溪上纸叶，看它顺水漂走晕开，像水珠从鸭羽滑落不沾身',
    colors: {
      primary: '#2B5844',   // 墨翠绿头羽（传统剪纸经典水禽色）
      secondary: '#8C5A38', // 栗棕浮水身
      accent: '#F2A62C',    // 标志性鲜黄扁鸭喙
      belly: '#FAF4EB',     // 纯白颈环与腹羽
      details: '#244568',   // 靛蓝翼镜纸带
    },
    viewBox: '0 0 260 260',
    defaultScale: 1.05,
    parts: [
      {
        id: 'waterRipples',
        name: '溪流水波涟漪',
        // 身下前后错动的双层纸雕波浪
        svgPath: 'M25,178 C65,166 125,178 185,168 C215,164 235,172 245,175 L235,192 C200,186 140,198 85,188 L25,192 Z',
        fill: '#6AA2B8',
        stroke: '#A4D1E2',
        strokeWidth: 1.8,
        zIndex: 1,
        pivot: { x: 130, y: 180 },
      },
      {
        id: 'tail',
        name: '俏皮微翘鸭尾',
        // 典型的小野鸭微翘剪纸尾羽
        svgPath: 'M55,148 C42,125 48,102 62,95 C68,110 75,130 92,142 Z',
        fill: '#243D30',
        stroke: '#16281F',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 85, y: 145 },
        hasSplitPin: true,
        pinCoord: { x: 85, y: 145 },
        cutoutPaths: [
          // 尾尖白羽剪纸条
          'M52,118 L62,95 L65,115 Z',
        ],
      },
      {
        id: 'body',
        name: '浮水流线鸭躯与暖栗胸腹',
        // 稳如小舟的浮水鸭身
        svgPath: 'M68,145 C65,115 110,95 168,105 C205,112 215,145 198,172 C168,185 85,185 68,145 Z',
        fill: '#8C5A38',
        stroke: '#58361E',
        strokeWidth: 2.2,
        zIndex: 3,
        pivot: { x: 140, y: 145 },
        cutoutPaths: [
          // 奶白下腹纸片
          'M92,148 C115,140 165,142 192,158 C175,178 115,180 92,148 Z',
        ],
      },
      {
        id: 'wing',
        name: '折叠飞羽与靛蓝翼镜',
        // 折叠在身上的丰满翅膀 + 经典野鸭蓝白相间「翼镜」
        svgPath: 'M85,122 C115,108 175,112 188,140 C175,162 135,165 95,142 Z',
        fill: '#6D4428',
        stroke: '#4A2C18',
        strokeWidth: 2,
        zIndex: 4,
        pivot: { x: 135, y: 125 },
        hasSplitPin: true,
        pinCoord: { x: 135, y: 125 },
        cutoutPaths: [
          // 标志性野鸭蓝翼镜 (Speculum)
          'M125,125 L165,130 L160,140 L120,135 Z',
          // 纯白边缘镶边
          'M122,122 L168,128',
        ],
      },
      {
        id: 'head',
        name: '墨翠圆鸭首、白项圈与扁扁黄鸭嘴',
        // 优美优雅的鸭颈、圆润鸭头、极高辨识度的纯平扁扁大黄嘴！
        svgPath: 'M145,118 C140,85 160,42 188,42 C210,42 225,62 218,88 C212,112 182,125 158,125 Z',
        fill: '#2B5844',
        stroke: '#183628',
        strokeWidth: 2,
        zIndex: 5,
        pivot: { x: 165, y: 110 },
        hasSplitPin: true,
        pinCoord: { x: 165, y: 110 },
        cutoutPaths: [
          // 纯白雅致颈圈 (Neck Ring)
          'M154,106 C168,102 198,104 208,112 L204,118 C192,112 165,110 152,114 Z',
          // 灵动圆眼睛与白色眼圈
          'M192,62 A 5 5 0 1 0 202 62 A 5 5 0 1 0 192 62',
        ],
      },
      {
        id: 'beak',
        name: '扁扁黄鸭嘴',
        // 一眼认出鸭子的平扁宽圆黄嘴巴
        svgPath: 'M212,68 C228,66 250,70 252,78 C252,86 232,88 208,86 Z',
        fill: '#F2A62C',
        stroke: '#A66B14',
        strokeWidth: 2,
        zIndex: 6,
        pivot: { x: 212, y: 77 },
        cutoutPaths: [
          // 鸭喙呼吸孔与嘴裂
          'M218,77 L246,78',
        ],
      },
    ],
  },

  squirrel: {
    id: 'squirrel',
    name: '跳跳',
    title: '行动小火箭',
    mindset: '大难题咬成小松果，今天只藏眼前一颗',
    psychology: '问题解决疗法 / 行为激活',
    tone: '活泼蹦跳，急性子，干劲十足满满元气',
    gameName: '藏坚果',
    gameSummary: '把庞大焦虑切成 3 颗触手可及的轻量松果，轻松藏进树洞',
    colors: {
      primary: '#C45229',   // 枫叶红棕
      secondary: '#F5DCBC', // 燕麦白肚与耳毛
      accent: '#824219',    // 松果深棕
      belly: '#FAF6ED',
      details: '#401C08',
    },
    viewBox: '0 0 260 280',
    defaultScale: 1.05,
    parts: [
      {
        id: 'tail',
        name: '巨型卷曲纸雕蓬松尾',
        // 壮观华丽的高拱尾巴，带手剪锯齿毛边
        svgPath: 'M75,185 C35,190 12,135 30,75 C48,15 115,18 128,68 C135,108 95,145 75,185 Z',
        fill: '#C45229',
        stroke: '#823012',
        strokeWidth: 2.2,
        zIndex: 1,
        pivot: { x: 80, y: 180 },
        hasSplitPin: true,
        pinCoord: { x: 80, y: 180 },
        cutoutPaths: [
          // 尾中浅金条纹
          'M45,85 C55,45 95,45 105,75 C108,98 85,125 65,155 Z',
        ],
      },
      {
        id: 'body',
        name: '弓背松鼠身躯与白肚皮',
        svgPath: 'M88,125 C75,148 82,205 118,212 C148,205 152,155 135,122 C122,105 100,105 88,125 Z',
        fill: '#D26034',
        stroke: '#823012',
        strokeWidth: 2,
        zIndex: 2,
        pivot: { x: 118, y: 170 },
        cutoutPaths: [
          'M102,130 C92,150 98,190 120,195 C140,190 142,155 132,130 Z',
        ],
      },
      {
        id: 'head',
        name: '警觉松鼠头与双直尖耳',
        svgPath: 'M115,105 L122,65 L138,88 L154,65 L162,105 C168,128 132,138 115,105 Z',
        fill: '#DC6C40',
        stroke: '#823012',
        strokeWidth: 2,
        zIndex: 4,
        pivot: { x: 135, y: 110 },
        hasSplitPin: true,
        pinCoord: { x: 135, y: 110 },
        cutoutPaths: [
          // 晶亮圆眼
          'M135,95 A 5 5 0 1 0 145 95 A 5 5 0 1 0 135 95',
        ],
      },
      {
        id: 'acorn',
        name: '怀抱小坚果',
        svgPath: 'M130,135 C125,125 145,125 150,135 C155,148 125,148 130,135 Z',
        fill: '#824219',
        stroke: '#4A2109',
        strokeWidth: 1.5,
        zIndex: 5,
        pivot: { x: 140, y: 138 },
      },
    ],
  },
};
