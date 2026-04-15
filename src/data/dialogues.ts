import type { Dialogue } from '../types'

// 会話セット：信頼度・親密度に応じて選択される
export interface DialogueSet {
  id: string
  minTrust: number
  minAffection: number
  dialogues: Dialogue[]
}

// 初期会話（信頼度低）
const earlyDialogues: Dialogue[] = [
  {
    id: 'early_1',
    speaker: 'girl',
    text: '......',
    expression: 'scared',
    next: null,
  },
  {
    id: 'early_2',
    speaker: 'girl',
    text: '......はい',
    expression: 'neutral',
    next: null,
  },
  {
    id: 'early_3',
    speaker: 'girl',
    text: '......なんでしょうか',
    expression: 'scared',
    next: null,
  },
  {
    id: 'early_4',
    speaker: 'girl',
    text: '......わたし、なにか......',
    expression: 'scared',
    next: null,
  },
  {
    id: 'early_5',
    speaker: 'girl',
    text: '......ごめんなさい',
    expression: 'sad',
    next: null,
  },
]

// 中期会話（信頼度中）
const midDialogues: Dialogue[] = [
  {
    id: 'mid_1',
    speaker: 'girl',
    text: 'あの......ありがとうございます',
    expression: 'neutral',
    next: null,
  },
  {
    id: 'mid_2',
    speaker: 'girl',
    text: '今日は......いい天気ですね',
    expression: 'neutral',
    next: null,
  },
  {
    id: 'mid_3',
    speaker: 'girl',
    text: 'ご主人様は......優しいですね',
    expression: 'happy',
    next: null,
  },
  {
    id: 'mid_4',
    speaker: 'girl',
    text: 'わたし......ここにいてもいいんですか？',
    expression: 'sad',
    next: 'mid_4_response',
  },
  {
    id: 'mid_4_response',
    speaker: 'narration',
    text: '（どう答える？）',
    expression: 'neutral',
    choices: [
      {
        text: 'もちろんだ',
        effects: { trust: 5, affection: 3, fear: -5 },
        next: 'mid_4_yes',
      },
      {
        text: '......',
        effects: { fear: 3 },
        next: 'mid_4_silent',
      },
    ],
  },
  {
    id: 'mid_4_yes',
    speaker: 'girl',
    text: '......ありがとう、ございます......',
    expression: 'happy',
    next: null,
  },
  {
    id: 'mid_4_silent',
    speaker: 'girl',
    text: '......すみません、変なこと聞いて......',
    expression: 'sad',
    next: null,
  },
  {
    id: 'mid_5',
    speaker: 'girl',
    text: 'あの......お茶、入れましょうか？',
    expression: 'neutral',
    next: null,
  },
]

// 後期会話（信頼度高）
const lateDialogues: Dialogue[] = [
  {
    id: 'late_1',
    speaker: 'girl',
    text: 'おかえりなさい、ご主人様',
    expression: 'happy',
    next: null,
  },
  {
    id: 'late_2',
    speaker: 'girl',
    text: '今日は何をしましょうか？',
    expression: 'happy',
    next: null,
  },
  {
    id: 'late_3',
    speaker: 'girl',
    text: 'ご主人様と一緒にいると......安心します',
    expression: 'embarrassed',
    next: null,
  },
  {
    id: 'late_4',
    speaker: 'girl',
    text: 'えへへ......なんでもないです',
    expression: 'embarrassed',
    next: null,
  },
  {
    id: 'late_5',
    speaker: 'girl',
    text: 'わたし......幸せです',
    expression: 'loving',
    next: null,
  },
]

// 親密度高い会話
const affectionateDialogues: Dialogue[] = [
  {
    id: 'affection_1',
    speaker: 'girl',
    text: 'ご主人様......好きです',
    expression: 'loving',
    next: null,
  },
  {
    id: 'affection_2',
    speaker: 'girl',
    text: 'ずっと......一緒にいてくれますか？',
    expression: 'embarrassed',
    next: 'affection_2_response',
  },
  {
    id: 'affection_2_response',
    speaker: 'narration',
    text: '（どう答える？）',
    expression: 'neutral',
    choices: [
      {
        text: 'もちろん',
        effects: { affection: 10, trust: 5 },
        next: 'affection_2_yes',
      },
      {
        text: '手を握る',
        effects: { affection: 15, trust: 3 },
        next: 'affection_2_hold',
      },
    ],
  },
  {
    id: 'affection_2_yes',
    speaker: 'girl',
    text: '......うれしい',
    expression: 'loving',
    next: null,
  },
  {
    id: 'affection_2_hold',
    speaker: 'girl',
    text: '......っ！......えへへ',
    expression: 'embarrassed',
    next: null,
  },
  {
    id: 'affection_3',
    speaker: 'girl',
    text: 'ご主人様のこと......大好き、です',
    expression: 'loving',
    next: null,
  },
]

// 会話セット一覧
export const dialogueSets: DialogueSet[] = [
  {
    id: 'early',
    minTrust: 0,
    minAffection: 0,
    dialogues: earlyDialogues,
  },
  {
    id: 'mid',
    minTrust: 20,
    minAffection: 20,
    dialogues: midDialogues,
  },
  {
    id: 'late',
    minTrust: 50,
    minAffection: 40,
    dialogues: lateDialogues,
  },
  {
    id: 'affectionate',
    minTrust: 60,
    minAffection: 70,
    dialogues: affectionateDialogues,
  },
]

// 現在のステータスに応じた会話を取得
export function getRandomDialogue(trust: number, affection: number): Dialogue {
  // 条件を満たす会話セットをフィルタ
  const availableSets = dialogueSets.filter(
    set => trust >= set.minTrust && affection >= set.minAffection
  )

  // 最も条件の高いセットを優先的に選択（70%）、それ以外は30%
  const highestSet = availableSets[availableSets.length - 1]
  const useHighest = Math.random() < 0.7 || availableSets.length === 1

  const selectedSet = useHighest
    ? highestSet
    : availableSets[Math.floor(Math.random() * availableSets.length)]

  // セット内からランダムに選択（選択肢付きの会話は開始ノードのみ）
  const startDialogues = selectedSet.dialogues.filter(
    d => !d.id.includes('_response') && !d.id.includes('_yes') && !d.id.includes('_silent') && !d.id.includes('_hold')
  )

  return startDialogues[Math.floor(Math.random() * startDialogues.length)]
}

// IDで会話を検索
export function getDialogueById(id: string): Dialogue | undefined {
  for (const set of dialogueSets) {
    const found = set.dialogues.find(d => d.id === id)
    if (found) return found
  }
  return undefined
}
