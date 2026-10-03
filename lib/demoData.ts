import { Memory, Session, FixedTheme, AnimalId } from './types';
import { db } from './db';

export const DEMO_MEMORIES: Omit<Memory, 'id'>[] = [
  // ================= 2024 年 =================
  {
    sessionId: 'session_demo_2024_01',
    date: '2024-03-15',
    title: '不把沉默当做敌意',
    summary: '因为同事在工作群里没及时回复我的方案，陷入了自我怀疑与恐慌，墨墨提醒我分清事实与推测。',
    emotions: ['不安', '胡思乱想', '释怀'],
    themes: ['职场人际'],
    coreBelief: '只要别人没有热情回应，就说明我做得很差或引起了反感',
    shift: {
      from: '以为不秒回就等于否定我',
      to: '明白每个人都在忙自己的风暴，未回复只是忙碌不是否定',
    },
    insight: '我学会了收回投射在别人身上的放大镜，事实就只是信息尚未被处理而已。',
    action: '不再每隔两分钟刷一次群消息，先去冲一杯绿茶。',
    helpfulAnimals: ['owl', 'fox'],
    moodBefore: 3,
    moodAfter: 7,
  },
  {
    sessionId: 'session_demo_2024_02',
    date: '2024-06-22',
    title: '允许夏至的暴雨倾盆',
    summary: '年中考评未达预期，情绪跌入谷底，团团用毛茸茸的怀抱接纳了我的疲惫，笃笃鼓励我承认难过。',
    emotions: ['挫败', '沮丧', '疲惫', '温暖'],
    themes: ['自我价值', '工作压力'],
    coreBelief: '我的全部价值由外部的打分和考评决定',
    shift: {
      from: '以为一次落后就证明自己是个失败者',
      to: '明白风雨会打落树叶，但树根依然在默默扎深',
    },
    insight: '我开始允许自己有掉眼泪的权利，坚强不是刀枪不入，而是允许疼痛后再慢慢站起。',
    action: '洗一个热水澡，今晚10点半准时钻进温暖的被窝。',
    helpfulAnimals: ['bear', 'woodpecker'],
    moodBefore: 2,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2024_03',
    date: '2024-09-10',
    title: '把大山啃成小松果',
    summary: '面对复杂的跨部门项目一筹莫展，焦虑拖延，跳跳帮我把庞然大物拆解成了今日第一小步。',
    emotions: ['焦虑', '拖延', '踏实'],
    themes: ['工作压力'],
    coreBelief: '如果不能一口气把整个复杂工程完美理清，就无法开始行动',
    shift: {
      from: '以为面对大工程必须全神贯注立刻搞定',
      to: '明白只要啃下一颗小坚果，惯性就会自然推着我往前',
    },
    insight: '行动是化解焦虑最温柔的解药，哪怕今天只写下三个标题，也是胜利。',
    action: '先打开文档写下前言提纲，完成就奖励自己一颗巧克力。',
    helpfulAnimals: ['squirrel', 'turtle'],
    moodBefore: 4,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2024_04',
    date: '2024-11-03',
    title: '漂在水面的落叶不带重负',
    summary: '深夜辗转反侧反复回想白天开会说错的一句话，漂漂带我把羞愧想法放到树叶上顺流漂走。',
    emotions: ['羞愧', '反刍', '释然', '轻松'],
    themes: ['职场人际', '自我价值'],
    coreBelief: '我不允许自己在公开场合有一丝结巴和瑕疵，否则形象全毁',
    shift: {
      from: '以为所有人都还记得并嘲笑我那句口误',
      to: '明白大家都更在乎自己，落叶漂走后溪流依然清澈',
    },
    insight: '我终于理解了想法只是一朵过客般的云彩，我不是那片乌云，我是辽阔的天空。',
    action: '深呼吸三次，把视线移向窗外摇曳的树影。',
    helpfulAnimals: ['otter', 'owl'],
    moodBefore: 3,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2024_05',
    date: '2024-12-30',
    title: '三十岁的年轮慢慢画',
    summary: '岁末盘点同龄人成就，被年龄焦虑裹挟，慢慢给我讲了千百年前老龟与红杉共度的悠长岁月。',
    emotions: ['焦虑', '比较', '迷茫', '从容'],
    themes: ['未来迷茫', '自我价值'],
    coreBelief: '到了某个特定岁数就必须拥有房子、地位或确定的成功',
    shift: {
      from: '以为人生是一场必须抢跑的时间赛跑',
      to: '明白每棵树都有属于自己的花期与年轮节奏',
    },
    insight: '放下与他人的横向攀比，我只需向着属于自己的阳光与泥土静静伸展。',
    action: '写下今年自己做过的三件微小却真诚的骄傲小事。',
    helpfulAnimals: ['turtle', 'fox'],
    moodBefore: 3,
    moodAfter: 9,
  },

  // ================= 2025 年 =================
  {
    sessionId: 'session_demo_2025_01',
    date: '2025-02-14',
    title: '不苛求回音的爱更清澈',
    summary: '情人节因期待落空感到失落孤独，阿橘用翻面镜帮我看到了独处的自如与自我馈赠的浪漫。',
    emotions: ['失落', '孤独', '释然'],
    themes: ['亲密关系', '孤独'],
    coreBelief: '没有仪式感和热烈回应的日子就是失败和不被爱的',
    shift: {
      from: '以为幸福全仰仗他人是否精心安排',
      to: '明白自己才是自己终身热恋的第一位知己',
    },
    insight: '我不再把爱意当作等待签收的快递，我自己就是丰盈的花园。',
    action: '为自己买一束清香的洋桔梗，插在床头花瓶里。',
    helpfulAnimals: ['fox', 'bear'],
    moodBefore: 4,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2025_02',
    date: '2025-04-08',
    title: '解开对父母期待的绳结',
    summary: '给家里打电话又因为催婚催稳定争吵，感到内疚又愤怒，墨墨帮我理清了界限与各自的人生功课。',
    emotions: ['愤怒', '内疚', '委屈', '释然'],
    themes: ['家庭', '亲密关系'],
    coreBelief: '我必须让父母完全满意和认同，否则我就是不孝',
    shift: {
      from: '以为爱就意味着必须放弃边界全面顺从',
      to: '明白父母的焦虑是他们的课题，带着爱意守住自己的边界是对彼此真正的负责',
    },
    insight: '我接纳了他们可能无法完全理解我的事实，但我也守住了自己呼吸的领地。',
    action: '发一条温和简短的微信报个平安，放下继续争辩的执念。',
    helpfulAnimals: ['owl', 'turtle'],
    moodBefore: 2,
    moodAfter: 7,
  },
  {
    sessionId: 'session_demo_2025_03',
    date: '2025-05-18',
    title: '允许身体按下暂停键',
    summary: '持续高压工作导致偏头痛和失眠，苛责自己身体不争气，团团提醒我身体是唯一的家园。',
    emotions: ['疲惫', '焦虑', '委屈', '安宁'],
    themes: ['健康', '自我价值'],
    coreBelief: '休息是软弱和浪费时间，必须时刻保持全速运转',
    shift: {
      from: '以为生病或疲倦是耽误效率的麻烦',
      to: '明白休息是生命系统最神圣的自我修复',
    },
    insight: '身体的警报不是对我的惩罚，而是它在绝望地拉着我的手说：求求你停下来抱抱我。',
    action: '今天请半天年假，去附近的公园草坪上躺着晒半小时太阳。',
    helpfulAnimals: ['bear', 'woodpecker'],
    moodBefore: 2,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2025_04',
    date: '2025-07-26',
    title: '散伙是人间常态，不减曾经的光芒',
    summary: '无意中发现大学无话不谈的好友聚会没有叫我，心里空落落的，漂漂带我接纳缘分的消长。',
    emotions: ['失落', '嫉妒', '酸楚', '释怀'],
    themes: ['友情', '失去与离别'],
    coreBelief: '真正的朋友必须一辈子紧密如初，疏远证明曾经的感情不纯粹',
    shift: {
      from: '以为友情的渐行渐远是因为我被淘汰或不被珍惜',
      to: '明白列车向前开，有人到站下车，曾经温暖过彼此就是最好的恩赐',
    },
    insight: '我学会了向远去的背影温和致意，把双手腾出来拥抱当下的同行者。',
    action: '在心底对老友道一声平安，给身边常常见面的伙伴发个问候。',
    helpfulAnimals: ['otter', 'fox'],
    moodBefore: 3,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2025_05',
    date: '2025-10-15',
    title: '面试未过，但树林多了一条小径',
    summary: '心仪已久的大厂面试未通过，笃笃让我大声喊出失落，狐狸阿橘带着我发现了塞翁失马的视角。',
    emotions: ['遗憾', '不甘', '自我否定', '重燃希望'],
    themes: ['学业考试', '未来迷茫'],
    coreBelief: '只有进入这家特定的公司，我的职业生涯才算成功',
    shift: {
      from: '以为一扇门关上就是全盘皆输',
      to: '明白双向选择只是匹配度问题，它为我保留了探索广阔天地的新可能',
    },
    insight: '被拒绝不是对我的能力判处死刑，而是森林在指引我走向更适合我的沃土。',
    action: '梳理今天面试中的三个收获点，整理到学习笔记中。',
    helpfulAnimals: ['woodpecker', 'fox', 'squirrel'],
    moodBefore: 2,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2025_06',
    date: '2025-11-20',
    title: '不为明天的雨打今天的伞',
    summary: '由于行业调整传闻整日惶惶不安，墨墨带我列出了事实与纯猜测，跳跳让我专注眼前手头事。',
    emotions: ['焦虑', '恐惧', '清醒'],
    themes: ['工作压力', '未来迷茫'],
    coreBelief: '我必须预料并防范未来发生的所有坏可能，否则一旦出事我无法承担',
    shift: {
      from: '以为忧心忡忡等于在做准备',
      to: '明白过度担忧只是白白消耗今日的元气，明天自有明天的智慧',
    },
    insight: '我不再把精力花在恐惧假设的荒原上，手头能做的事，就是最结实的避难所。',
    action: '合上电脑，跟着慢慢做三组4-4-4-4深呼吸。',
    helpfulAnimals: ['owl', 'squirrel', 'turtle'],
    moodBefore: 3,
    moodAfter: 8,
  },

  // ================= 2026 年 =================
  {
    sessionId: 'session_demo_2026_01',
    date: '2026-01-18',
    title: '在喧闹中留一块苔藓之地',
    summary: '开年连续几场高强度社交让自己被彻底榨干，感到无力和虚假，团团和慢慢陪我安静待着。',
    emotions: ['社交耗竭', '孤独', '平静'],
    themes: ['自我价值', '孤独'],
    coreBelief: '为了显得受欢迎和合群，我必须压抑内向天性迎合每一个人',
    shift: {
      from: '以为拒绝别人邀约会显得冷漠自私',
      to: '明白保护自己的内在能量池，才是真诚对待生活的前提',
    },
    insight: '我终于接纳了自己是个需要独处充电的森林生灵，孤独是我的养分，不是缺陷。',
    action: '推掉周末那场不必要的聚餐，在家里静静读完一本书。',
    helpfulAnimals: ['bear', 'turtle'],
    moodBefore: 4,
    moodAfter: 9,
  },
  {
    sessionId: 'session_demo_2026_02',
    date: '2026-02-28',
    title: '承认嫉妒，是发现愿望的窗户',
    summary: '看到同龄同行获得了极高荣誉和曝光，心里酸溜溜的甚至生出恶意，笃笃和墨墨帮我接纳了情绪。',
    emotions: ['嫉妒', '羞愧', '释怀', '清晰'],
    themes: ['自我价值', '职场人际'],
    coreBelief: '有嫉妒心的人是丑陋和卑鄙的，我绝不能让别人看出这一点',
    shift: {
      from: '以为嫉妒证明自己心胸狭隘品格低下',
      to: '明白嫉妒只是一张心愿地图，它在告诉我内心真正向往和珍视的东西是什么',
    },
    insight: '我不再羞于承认眼红，而是顺着这份嫉妒找到了自己想要深耕的真正目标。',
    action: '将内心的酸涩转化为具体要提升的一项硬技能清单。',
    helpfulAnimals: ['woodpecker', 'owl'],
    moodBefore: 3,
    moodAfter: 8,
  },
  {
    sessionId: 'session_demo_2026_03',
    date: '2026-03-12',
    title: '允许停下脚步，风雨也是风景',
    summary: '换季感冒加项目延期，心态崩溃，在解忧森林篝火旁倾诉，守林人递上热茶，动物们围坐倾听。',
    emotions: ['崩溃', '自责', '温暖', '释怀'],
    themes: ['工作压力', '自我价值'],
    coreBelief: '只要事情没有按既定完美时间表走，我所有的付出都白费了',
    shift: {
      from: '以为生活必须始终是一条笔直上升的斜率',
      to: '明白生命的年轮总是曲折迂回的，弯曲也是为了更有韧性地抵御风暴',
    },
    insight: '我学会了把“我必须”改成“我尽力”，允许自己在泥泞中驻足看一场春雨。',
    action: '换上一件柔软宽松的衣服，早睡一小时。',
    helpfulAnimals: ['bear', 'turtle', 'otter'],
    moodBefore: 3,
    moodAfter: 9,
  },
  {
    sessionId: 'session_demo_2026_04',
    date: '2026-03-28',
    title: '不因一次争吵抹杀信任的根基',
    summary: '与伴侣就生活习惯发生激烈争吵，产生分手的灾难化念头，墨墨和阿橘帮我重构了情绪。',
    emotions: ['委屈', '愤怒', '恐惧', '温和'],
    themes: ['亲密关系'],
    coreBelief: '真正契合的两个人永远不应该有剧烈争执，有争吵就意味着不合适',
    shift: {
      from: '以为争吵是对感情破裂的判决书',
      to: '明白冲突是两棵大树在风中互相摸索枝叶边界的试探',
    },
    insight: '比起争辩谁对谁错，我更想守护彼此手心的温度。',
    action: '主动切一盘水果端过去，轻轻说一句“刚才我情绪有点急”。',
    helpfulAnimals: ['owl', 'fox'],
    moodBefore: 3,
    moodAfter: 8,
  },
];

/**
 * 将丰富演示数据安全注入 IndexedDB (避免重复，保留已有)
 */
export async function seedDemoMemories(): Promise<number> {
  let insertedCount = 0;
  for (const item of DEMO_MEMORIES) {
    const existing = await db.memories.where('sessionId').equals(item.sessionId).first();
    if (!existing) {
      const memoryId = `demo_mem_${item.date.replace(/-/g, '')}_${Math.random().toString(36).substring(2, 6)}`;
      const memory: Memory = {
        id: memoryId,
        ...item,
      };
      await db.memories.put(memory);

      // 同步插入一条对应的 session 记录，保证关联完整性
      const sessionDate = new Date(item.date).getTime();
      const session: Session = {
        id: item.sessionId,
        startedAt: sessionDate,
        endedAt: sessionDate + 1800000,
        status: 'resolved',
        companion: item.helpfulAnimals[0] || 'bear',
        moodBefore: item.moodBefore,
        moodAfter: item.moodAfter,
        gameContext: [],
        matchedMemoryIds: [],
        messages: [
          {
            id: `msg_u_${memoryId}`,
            speaker: 'user',
            content: item.summary,
            createdAt: sessionDate,
          },
          {
            id: `msg_a_${memoryId}`,
            speaker: item.helpfulAnimals[0] || 'bear',
            content: `（${item.helpfulAnimals[0]}轻声回应）${item.insight}`,
            resonated: true,
            createdAt: sessionDate + 60000,
          },
          {
            id: `msg_t_${memoryId}`,
            speaker: 'tree',
            content: `🌿 守林人手记：${item.shift.from} -> ${item.shift.to}。微小一步：${item.action}`,
            createdAt: sessionDate + 120000,
          },
        ],
      };
      await db.sessions.put(session);
      insertedCount++;
    }
  }
  return insertedCount;
}

/**
 * 清除所有记忆与会话（仅供重置测试）
 */
export async function clearAllMemories(): Promise<void> {
  await db.memories.clear();
  await db.sessions.clear();
}
