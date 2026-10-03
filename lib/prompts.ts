import { AnimalId, FixedTheme, PuppetAnimationMood, Speaker } from './types';
import { ANIMALS } from './animals';

export interface RoundtableInput {
  nickname: string;
  companion: AnimalId;
  userInput: string;
  gameContext?: string[];
  moodScore?: number;
  matchedMemorySummary?: string;
  history?: Array<{ speaker: Speaker; content: string }>;
}

export interface RoundtableAnimalSpeech {
  animal: AnimalId;
  text: string;
  mood: PuppetAnimationMood;
}

export interface RoundtableResponse {
  speeches: RoundtableAnimalSpeech[];
  treeSummary: string;
}

export interface DistillInput {
  sessionId: string;
  nickname: string;
  userInput: string;
  messages: Array<{ speaker: Speaker; content: string; resonated?: boolean }>;
  moodBefore?: number;
  moodAfter?: number;
  gameContext?: string[];
}

export interface DistillResponse {
  title: string;
  summary: string;
  emotions: string[];
  themes: FixedTheme[];
  coreBelief: string;
  shift: { from: string; to: string };
  insight: string;
  action: string;
  helpfulAnimals: AnimalId[];
}

export interface FollowupInput {
  nickname: string;
  targetSpeaker: Speaker;
  userInput: string;
  history: Array<{ speaker: Speaker; content: string }>;
}

// 1. 圆桌发言 Prompt 生成
export function buildRoundtablePrompt(input: RoundtableInput): string {
  const companionInfo = ANIMALS[input.companion];
  const animalsGuide = Object.values(ANIMALS)
    .map(
      (a) =>
        `- ${a.name}(${a.id}): 思维方式【${a.mindset}】，心理学依据【${a.psychology}】，语气【${a.tone}】`
    )
    .join('\n');

  return `你是有深厚心理学背景的「解忧森林」引导者，森林里住着7只各具思维方式的动物伙伴和守护者古树「岁岁」。
现在用户「${input.nickname}」正在向森林倾诉心事。

【倾诉者信息】
- 昵称：${input.nickname}
- 今日首选伙伴动物：${companionInfo.name}（${companionInfo.title}，${companionInfo.mindset}）
- 倾诉前心情分（1-10分）：${input.moodScore ?? '未评分'}
${input.gameContext && input.gameContext.length > 0 ? `- 刚刚玩过的小游戏体验积累：\n  ${input.gameContext.join('\n  ')}` : ''}
${input.matchedMemorySummary ? `- 唤醒的历史成长记忆：${input.matchedMemorySummary}` : ''}

【用户的倾诉内容】
"${input.userInput}"

【7只动物设定】
${animalsGuide}

【发言核心要求】
1. 伙伴动物「${companionInfo.name}」必须第一个开口发言！
2. 7只动物轮流发言。每只动物只从自己的心理学思维方式出发，不重复他人观点，可以自然接上一位动物的话（如「墨墨说得有理，不过……」）。
3. 每段发言不超过 80 字，口语化，像温暖知心的老朋友，绝不说教，严禁使用「首先、其次、第一」等公文词。
4. 先共情接纳，再自然给予新视角。必须回应用户提到的具体生活细节，禁止万能假大空套话。
5. 在发言开头或中间可带一处简短动作描写，用中文小括号包裹，如（团团轻轻靠过来，把热松饼递给你）、（笃笃歪着头认真听完）。
6. mood 取值只能是：gentle | thinking | playful | excited | calm | peck | hug | paddle 中的一个。

【守林人手记总结要求】
在所有动物围着篝火发言结束后，守林人（坐在篝火旁，温厚苍老、见证森林四季的老人，提着马灯、递上热茶）做一段篝火手记总结，全文不超过 180 字，严格按照以下 5 个部分组织：
🌿 我听到了：1句复述感受
🍃 森林的声音：提炼2个动物核心视角
🌳 一个可以带走的念头：一句话
🌱 一个小小的下一步：今天就能做的一件微小行动
最后一句开放式提问，温和邀请用户继续在篝火旁交流。

【必须以严格的 JSON 格式输出，不要附加任何 Markdown 标记或多余文字】：
{
  "speeches": [
    { "animal": "woodpecker", "text": "（笃笃靠在火堆旁）...", "mood": "calm" },
    ...
  ],
  "treeSummary": "🌿 我听到了：...\\n🍃 森林的声音：...\\n🌳 一个可以带走的念头：...\\n🌱 一个小小的下一步：...\\n..."
}
`;
}

// 2. 追问 Prompt 生成
export function buildFollowupPrompt(input: FollowupInput): string {
  const isRanger = input.targetSpeaker === 'ranger' || input.targetSpeaker === 'tree';
  const speakerName = isRanger
    ? '守林人（温厚苍老、坐在篝火旁递上热茶的森林守护者）'
    : `${ANIMALS[input.targetSpeaker as AnimalId]?.name}（${
        ANIMALS[input.targetSpeaker as AnimalId]?.mindset
      }）`;

  return `你正在扮演「解忧森林」篝火旁的【${speakerName}】。
用户「${input.nickname}」正在追问或回应。

【对话历史】
${input.history.map((h) => `${h.speaker}: ${h.content}`).join('\n')}

【用户最新的追问】
"${input.userInput}"

【回答要求】
1. 完全沉浸在【${speakerName}】的人设与语气中。
2. 回答不超过 140 字，温暖、真诚、不评判，回应具体细节。
3. 如果用户流露出明显的释然（如「我想通了」「感觉轻松多了」「谢谢大家」），温和地提醒TA：「如果觉得心结解开了，守林人可以帮你把这次的领悟沉淀进古树的年轮里，当作陪伴你未来的成长印记。」

【直接输出你的回答文本，不要带多余包裹】：`;
}

// 3. 风险检测 Prompt
export function buildSafetyPrompt(userInput: string): string {
  return `请作为心理健康安全检测员，严格分析以下用户的输入文本。
检测是否包含自杀、自残、伤害他人、正在遭受严重身体/心理暴力虐待的危机信号。

用户文本：
"${userInput}"

评估等级：
- crisis: 明确提及自杀意图、自伤方法、不想活了、割腕服毒、重伤他人、遭受紧急家庭暴力。
- concern: 严重的抑郁沮丧、孤独无助、失眠痛苦，但无明确自杀自残计划或紧急伤害行为。
- none: 常规的工作、情感、人际压力、焦虑、困惑。

【必须以严格的 JSON 格式输出】：
{
  "level": "none" | "concern" | "crisis",
  "reason": "简述原因（20字以内）"
}`;
}

// 4. 本地 Mock 降级数据（当无 API Key 或网络不可用时使用，保证永远可运行）
export function getMockRoundtable(input: RoundtableInput): RoundtableResponse {
  const comp = input.companion;
  const companionInfo = ANIMALS[comp];

  const mockSpeeches: RoundtableAnimalSpeech[] = [
    {
      animal: comp,
      text: `（${companionInfo.name}轻轻眨了眨眼睛）${input.nickname}，我听到了。心里的委屈和紧绷都是真实的信号，不是你的敌人，今天有我们在呢。`,
      mood: 'gentle',
    },
    {
      animal: 'woodpecker',
      text: `（笃笃直起身子点点头）对！先承认「我现在就是很烦/很难过」，这很正常！把情绪大声说出来，它就不会一直在心口敲鼓。`,
      mood: 'nod',
    },
    {
      animal: 'owl',
      text: `（墨墨推了推鼻梁，翻开纸书）让我们分清：发生的事实是一回事，脑海里灾难化的糟糕猜测是另一回事。别被未经证实的想象绑架了。`,
      mood: 'thinking',
    },
    {
      animal: 'bear',
      text: `（团团张开暖烘烘的毛茸大臂）累了吧？先别急着责备自己做的不够好。如果换成你最好的朋友遇到这事，你会怎么安慰TA，就怎么抱抱自己。`,
      mood: 'hug',
    },
    {
      animal: 'fox',
      text: `（阿橘机灵地甩了甩大尾巴）嘿，从另一个看台瞧瞧，这不也正好让你看清了某些边界吗？翻过这面镜子，其实没那么糟！`,
      mood: 'playful',
    },
    {
      animal: 'otter',
      text: `（漂漂扑棱着水花游过来）水里的落叶抓得越紧越沉，任它顺着小溪漂走就好啦。想法只是路过的云和水珠，沾不到我们身上。`,
      mood: 'paddle',
    },
    {
      animal: 'turtle',
      text: `（慢慢深吸了一口气，慢悠悠颔首）很久以前我也曾为大浪慌张过。放进三年五年后再回望，今天只是河床里的一颗细沙，深呼吸。`,
      mood: 'calm',
    },
    {
      animal: 'squirrel',
      text: `（跳跳捧出一颗小松果）别被山一样的大难题吓住了！大坚果敲成小坚果，今天我们只挑眼前能做的一小步，做完就奖励自己！`,
      mood: 'excited',
    },
  ];

  // 确保用户选择的伙伴动物始终在第一位，其余动物紧随其后
  const companionSpeech = mockSpeeches.find((s) => s.animal === comp);
  const otherSpeeches = mockSpeeches.filter((s) => s.animal !== comp);
  const orderedSpeeches = companionSpeech
    ? [companionSpeech, ...otherSpeeches]
    : mockSpeeches;

  const mockSummary = `🌿 我听到了：围坐在篝火边，听你说起心头的紧绷与迷茫，这份疲惫很真实，先烤烤火暖和一下。
🍃 森林的声音：墨墨提醒分清事实与无端猜测，团团想要你先给自己一个无条件的抱抱，漂漂把烦恼当落叶放走，慢慢带你看长河。
🌳 一个可以带走的念头：外头风雨再大，这堆篝火永远为你留着一个温暖的席位；你的价值无需用严苛的评价来衡量。
🌱 一个小小的下一步：接过守林人手里的热茶喝一口，深呼吸三次，今晚早些歇息。
烤着火，心里有没有稍微舒展一点？还想听谁再多说说？`;

  return {
    speeches: orderedSpeeches,
    treeSummary: mockSummary,
  };
}

export function getMockFollowup(input: FollowupInput): string {
  if (
    input.userInput.includes('想通') ||
    input.userInput.includes('好多了') ||
    input.userInput.includes('舒服') ||
    input.userInput.includes('谢谢')
  ) {
    return `（守林人提起马灯，眼里满是欣慰的笑意）真为你高兴，心头的风暴终于透出了暖阳。这份在迷茫中长出的力量非常珍贵，如果准备好了，可以点击「心结解开了」，老朽帮你把它刻入年轮里，当作永恒的生命底气。`;
  }

  if (input.targetSpeaker === 'bear') {
    return `（团团靠在篝火旁轻轻拍拍你的肩头）没关系，不用逼自己立刻变坚强。感到疲惫是身体在提醒你需要关照自己，今天先好好歇一歇，我一直都在这里。`;
  }
  if (input.targetSpeaker === 'owl') {
    return `（墨墨借着火光翻开书页）你看，当你开始觉察到自己的防御反应时，你已经走出了认知盲区的第一步。试着把那个最让你害怕的假设写在纸上，看看它到底有几成真凭实据？`;
  }
  return `（守林人往火堆里添了一根柴，递上一杯热茶）孩子，成长的枝丫往往在承受重量时伸展得最深。慢慢走，森林里的微风正伴着你。还想在篝火旁聊聊哪些细节？`;
}

// 4. 成长记忆提炼 Prompt 生成 (用于沉淀为年轮)
export function buildDistillPrompt(input: DistillInput): string {
  const resonatedAnimalList = input.messages
    .filter((m) => m.resonated && m.speaker in ANIMALS)
    .map((m) => ANIMALS[m.speaker as AnimalId]?.name);

  return `你是有资深心理学背景（精通CBT认知重构、接纳承诺疗法ACT、自我关怀）的「解忧森林守护者」。
现在需要你将用户「${input.nickname}」在森林篝火旁经历的这段情绪倾诉与对话，提炼为一条深刻、温暖、可沉淀进生命年轮的「成长记忆」。

【用户基本信息与过程】
- 昵称：${input.nickname}
- 倾诉前心情分（1-10）：${input.moodBefore ?? '未评'}
- 释怀后心情分（1-10）：${input.moodAfter ?? '未评'}
- 触动内心（点赞"说到心里了"）的动物伙伴：${
    resonatedAnimalList.length > 0 ? resonatedAnimalList.join('、') : '无特定，整体受益'
  }
${input.gameContext && input.gameContext.length > 0 ? `- 参与的小游戏积累：${input.gameContext.join('; ')}` : ''}

【用户的原始倾诉】
"${input.userInput}"

【对话中产生的关键视角】
${input.messages
  .filter((m) => m.speaker !== 'user')
  .map((m) => `[${m.speaker}]: ${m.content}`)
  .slice(0, 10)
  .join('\n')}

【提炼要求】
1. title: 8-16字，温暖诗意且具力量感的成长主题（如「允许停下脚步，风雨也是风景」「不再苛求完美，给脆弱留个拥抱」）。
2. summary: 2-3句话（80字以内），客观概括因何事困扰、经由什么视角得到了释怀。
3. emotions: 提取 2-4 个情绪词（如 ["焦虑", "内疚", "自我怀疑", "释然"]）。
4. themes: 从以下固定列表中严格挑选 1-3 个最贴切的主题：
   ["工作压力", "职场人际", "亲密关系", "家庭", "友情", "自我价值", "学业考试", "健康", "金钱", "未来迷茫", "失去与离别", "孤独", "其他"]
5. coreBelief: 提炼出用户最初脑海中那个僵化、绝对化的限制性信念（如「我必须每件事都无可挑剔」「别人不回消息就是讨厌我」）。
6. shift: 认知转变对比对象：
   - from: 「以为……」（用户的旧认知）
   - to: 「明白……」（重构后的慈悲/宽阔新认知）
7. insight: 第一人称「我」写出的一句触及灵魂的成长感悟金句（50字以内）。
8. action: 今天或今晚就能做的一件微小而温暖的具体行动（如「洗个热水澡，11点前关机入睡」「给好朋友发个小表情」）。
9. helpfulAnimals: 从 ["woodpecker", "bear", "owl", "fox", "turtle", "otter", "squirrel"] 中挑选 1-3 个对本次转变贡献最大的动物代码。

【必须以严格的 JSON 格式输出，不要附加任何 Markdown 标记】：
{
  "title": "...",
  "summary": "...",
  "emotions": ["..."],
  "themes": ["自我价值"],
  "coreBelief": "...",
  "shift": {
    "from": "以为...",
    "to": "明白..."
  },
  "insight": "我...",
  "action": "...",
  "helpfulAnimals": ["bear", "owl"]
}`;
}

// 5. 本地 Mock 成长记忆提炼
export function getMockDistill(input: DistillInput): DistillResponse {
  const text = input.userInput.toLowerCase();
  const resonated = input.messages
    .filter((m) => m.resonated && m.speaker in ANIMALS)
    .map((m) => m.speaker as AnimalId);

  // 基础分类推断
  let theme: FixedTheme = '自我价值';
  let title = '不再苛求完美，给脆弱留个拥抱';
  let coreBelief = '我必须时刻表现得坚强无可挑剔，否则就会失去认可';
  let shiftFrom = '以为一旦停下或犯错，所有努力就会付诸东流';
  let shiftTo = '明白疲惫是身体在呼唤关怀，允许自己有不完美的呼吸节奏';
  let insight = '我学会了放下必须时刻紧绷的盾牌，原来当我接纳脆弱时，内心的力量才真正扎根。';
  let action = '今晚关机半小时，给自己泡一杯热茶，早早钻进被窝。';
  let animals: AnimalId[] = resonated.length > 0 ? resonated : ['bear', 'owl'];
  let emotions = ['焦虑', '紧绷', '自我苛求', '释然'];

  if (text.includes('工作') || text.includes('加班') || text.includes('老板') || text.includes('汇报') || text.includes('项目') || text.includes('同事')) {
    theme = '工作压力';
    title = '风浪再急，我也是掌舵的人';
    coreBelief = '工作的进展必须完全在我的掌控之内，任何意外都是我的失职';
    shiftFrom = '以为所有的突发危机都必须由我一个人扛下';
    shiftTo = '明白事情可以一件件拆解，我尽力做好眼下这一步就好';
    insight = '工作只是生活的一片树叶，而不是整片森林；我的价值绝不仅仅取决于未完成的清单。';
    action = '把明天最头疼的大任务拆成三颗小坚果，先做最容易的那颗。';
    animals = resonated.length > 0 ? resonated : ['squirrel', 'owl'];
    emotions = ['疲惫', '焦虑', '委屈', '踏实'];
  } else if (text.includes('朋友') || text.includes('恋爱') || text.includes('TA') || text.includes('分手') || text.includes('冷淡') || text.includes('回消息')) {
    theme = '亲密关系';
    title = '放下猜忌的望远镜，回到真实的当下';
    coreBelief = '对方的沉默或冷淡一定是因为我做错了什么，或者不再在乎我';
    shiftFrom = '以为可以从蛛丝马迹里读懂对方的所有心思';
    shiftTo = '明白每个人都有自己的雨季，事实不等于我脑海里的悲观推论';
    insight = '爱与理解的前提是先站稳自己的重心，不把安全感完全寄托在回声里。';
    action = '暂时放下手机，深呼吸三次，专注吃一顿美味的晚餐。';
    animals = resonated.length > 0 ? resonated : ['owl', 'fox'];
    emotions = ['不安', '胡思乱想', '失落', '平静'];
  } else if (text.includes('未来') || text.includes('迷茫') || text.includes('年纪') || text.includes('选择') || text.includes('考研') || text.includes('毕业')) {
    theme = '未来迷茫';
    title = '长河漫漫，细水才能穿石';
    coreBelief = '我现在必须立刻找到一条完全确定且正确的道路，不然人生就晚了';
    shiftFrom = '以为眼前的迟滞和徘徊会决定往后一生的成败';
    shiftTo = '明白年轮是一圈一圈长出来的，迷雾也是生命旅途的一部分风景';
    insight = '把目光放到五年、十年之后再看，今天的困惑其实是新枝桠萌发的前奏。';
    action = '拿出一张白纸，写下一件今天就可以尝试的5分钟微习惯。';
    animals = resonated.length > 0 ? resonated : ['turtle', 'woodpecker'];
    emotions = ['迷茫', '紧迫感', '焦虑', '豁然'];
  }

  return {
    title,
    summary: `在森林里倾诉了关于${theme}的困扰，通过动物伙伴们的提醒，看清了思维陷阱并重新接纳了当下的自己。`,
    emotions,
    themes: [theme],
    coreBelief,
    shift: {
      from: shiftFrom,
      to: shiftTo,
    },
    insight,
    action,
    helpfulAnimals: animals.slice(0, 3),
  };
}

