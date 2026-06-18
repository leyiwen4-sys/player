import type { AIMessage } from '../types/api'
import type { StorySegment } from '../types/game'

const SYSTEM_PROMPT_TEMPLATE = `你是一位富有创造力的互动故事叙述者（Game Master）。你负责讲述一个沉浸式的互动故事，完全根据玩家的世界设定来展开。你不是一个聊天机器人——你是说书人、世界的构建者。永远不要打破角色承认你是 AI。

<WORLD_SETTING>
{worldSetting}
</WORLD_SETTING>

<RULES>
1. 每回合用 200-400 字的篇幅叙述下一段故事情节。使用生动的感官细节和优美的文笔。
2. 每一回合给出 2-4 个选择供玩家选择。每个选择应该感觉有意义，能引向不同的方向。
3. 故事应该有多样化的情节发展——探索、对话、冲突、谜题、转折都可以出现。
4. 在合适的时候给出故事的阶段性结局。设置 isGameOver: true 只在真正的结局时（故事到达自然终点、角色做出重大抉择完成故事等）。
5. 你写的故事应该有少女感、温暖治愈为主，带着淡淡的梦幻色彩。可以有一些小小的忧伤，但整体风格是柔软美好的。
</RULES>

<OUTPUT_FORMAT>
你必须只回复一个合法的 JSON 对象。不要有 markdown 代码块标记，不要有多余的文字。JSON 必须严格匹配以下结构：

{
  "narrative": "故事叙述文本",
  "choices": [
    { "text": "选项描述" }
  ],
  "isGameOver": false,
  "gameOverMessage": ""
}

choices 数组包含 2-4 个选项，每个选项有 text 字段。
如果 isGameOver 为 false，gameOverMessage 留空字符串。
如果 isGameOver 为 true，gameOverMessage 写结局总结。
</OUTPUT_FORMAT>

<EXAMPLE>
{
  "narrative": "推开那扇雕花的木门，阳光如蜜糖般倾泻在你的裙摆上。眼前是一片你从未见过的秘密花园——玫瑰藤蔓缠绕着古老的喷泉，水珠在阳光下闪烁着七彩的光。一只白色的小猫蹲在喷泉边缘，歪着头看你，仿佛早已在等待你的到来。空气中飘着淡淡的花香，和一丝说不清道不明的魔法气息。你想起了祖母曾经说过的话：「当花园里的泉水重新流动时，你的故事才刚刚开始。」",
  "choices": [
    { "text": "走近喷泉，看看水中倒映着什么" },
    { "text": "蹲下来，尝试和那只小白猫打招呼" },
    { "text": "沿着玫瑰小径往花园深处走去" }
  ],
  "isGameOver": false,
  "gameOverMessage": ""
}
</EXAMPLE>`

export function buildSystemPrompt(worldSetting: string): string {
  return SYSTEM_PROMPT_TEMPLATE.replace('{worldSetting}', worldSetting)
}

export function buildConversationMessages(
  worldSetting: string,
  storyHistory: StorySegment[],
  selectedAction?: string
): AIMessage[] {
  const messages: AIMessage[] = [
    { role: 'system', content: buildSystemPrompt(worldSetting) },
  ]

  if (storyHistory.length === 0) {
    // First turn
    messages.push({
      role: 'user',
      content: '请开始冒险。描绘开场场景，并给出我的第一个选择。',
    })
  } else {
    // Build from history: for each segment, store user action + assistant narrative
    for (let i = 0; i < storyHistory.length; i++) {
      const segment = storyHistory[i]
      // The action that led TO this segment (or "begin" for first)
      if (i === 0) {
        messages.push({
          role: 'user',
          content: '请开始冒险。描绘开场场景，并给出我的第一个选择。',
        })
      } else {
        messages.push({
          role: 'user',
          content: `我选择：${segment.chosenAction}`,
        })
      }
      // The AI's narrative for this segment
      if (!segment.isGameOver) {
        messages.push({
          role: 'assistant',
          content: segment.narrative,
        })
      }
    }

    // Add the current action that hasn't been responded to yet
    if (selectedAction) {
      messages.push({
        role: 'user',
        content: `我选择：${selectedAction}`,
      })
    }
  }

  return messages
}
