import type { GameEvent, Dialogue, GirlStats } from '../types'

// 閾値イベント（マイルストーン）
export const milestoneEvents: GameEvent[] = [
  // 親密度20: 初めての笑顔
  {
    id: 'affection_20_first_smile',
    title: '初めての笑顔',
    type: 'milestone',
    condition: {
      minAffection: 20,
    },
    dialogues: [
      {
        id: 'affection_20_1',
        speaker: 'narration',
        text: 'ふと、彼女の顔を見ると......',
        next: 'affection_20_2',
      },
      {
        id: 'affection_20_2',
        speaker: 'girl',
        text: '......えへ',
        expression: 'happy',
        next: 'affection_20_3',
      },
      {
        id: 'affection_20_3',
        speaker: 'narration',
        text: '初めて見る、彼女の笑顔だった。',
        next: 'affection_20_4',
      },
      {
        id: 'affection_20_4',
        speaker: 'girl',
        text: 'あ......す、すみません。なんでもないです......',
        expression: 'embarrassed',
        next: null,
      },
    ],
  },

  // 親密度40: 名前を呼んでくれる
  {
    id: 'affection_40_call_name',
    title: '名前を呼んでくれる',
    type: 'milestone',
    condition: {
      minAffection: 40,
    },
    dialogues: [
      {
        id: 'affection_40_1',
        speaker: 'girl',
        text: 'あの......ご主人様',
        expression: 'neutral',
        next: 'affection_40_2',
      },
      {
        id: 'affection_40_2',
        speaker: 'girl',
        text: 'わたし......あなたのお名前、なんとお呼びすればいいですか？',
        expression: 'embarrassed',
        next: 'affection_40_3',
      },
      {
        id: 'affection_40_3',
        speaker: 'narration',
        text: '（どう答える？）',
        choices: [
          {
            text: '好きに呼んでいいよ',
            effects: { affection: 5, trust: 3 },
            next: 'affection_40_free',
          },
          {
            text: 'ご主人様でいい',
            effects: { dependence: 5 },
            next: 'affection_40_master',
          },
        ],
        next: null,
      },
      {
        id: 'affection_40_free',
        speaker: 'girl',
        text: 'で、では......「あなた」......と、お呼びしても......いいですか？',
        expression: 'embarrassed',
        next: 'affection_40_free_2',
      },
      {
        id: 'affection_40_free_2',
        speaker: 'girl',
        text: '......えへへ。あなた......あなた......',
        expression: 'happy',
        next: null,
      },
      {
        id: 'affection_40_master',
        speaker: 'girl',
        text: 'はい......ご主人様',
        expression: 'neutral',
        next: null,
      },
    ],
  },

  // 信頼度30: 過去を少し話す
  {
    id: 'trust_30_past_hint',
    title: '過去を少し話す',
    type: 'milestone',
    condition: {
      minTrust: 30,
    },
    dialogues: [
      {
        id: 'trust_30_1',
        speaker: 'girl',
        text: '......あの',
        expression: 'sad',
        next: 'trust_30_2',
      },
      {
        id: 'trust_30_2',
        speaker: 'girl',
        text: 'わたし......前のところでは......毎日、怖かったです',
        expression: 'scared',
        next: 'trust_30_3',
      },
      {
        id: 'trust_30_3',
        speaker: 'girl',
        text: 'でも......ここは......',
        expression: 'neutral',
        next: 'trust_30_4',
      },
      {
        id: 'trust_30_4',
        speaker: 'girl',
        text: '......安心、します',
        expression: 'happy',
        next: null,
      },
    ],
  },

  // 信頼度50: トラウマの告白
  {
    id: 'trust_50_trauma',
    title: 'トラウマの告白',
    type: 'milestone',
    condition: {
      minTrust: 50,
      maxFear: 40,
    },
    dialogues: [
      {
        id: 'trust_50_1',
        speaker: 'narration',
        text: 'ある夜、彼女が話しかけてきた。',
        next: 'trust_50_2',
      },
      {
        id: 'trust_50_2',
        speaker: 'girl',
        text: '......あの、聞いてもらえますか',
        expression: 'sad',
        next: 'trust_50_3',
      },
      {
        id: 'trust_50_3',
        speaker: 'girl',
        text: 'わたし......昔、たくさん......痛いことをされました',
        expression: 'scared',
        next: 'trust_50_4',
      },
      {
        id: 'trust_50_4',
        speaker: 'girl',
        text: '体中に傷があるのは......そのせいです',
        expression: 'sad',
        next: 'trust_50_5',
      },
      {
        id: 'trust_50_5',
        speaker: 'narration',
        text: '（どうする？）',
        choices: [
          {
            text: '黙って抱きしめる',
            effects: { trust: 10, affection: 5, fear: -15 },
            next: 'trust_50_hug',
          },
          {
            text: 'もう大丈夫だと伝える',
            effects: { trust: 5, fear: -10 },
            next: 'trust_50_safe',
          },
        ],
        next: null,
      },
      {
        id: 'trust_50_hug',
        speaker: 'girl',
        text: '......っ！',
        expression: 'surprised',
        next: 'trust_50_hug_2',
      },
      {
        id: 'trust_50_hug_2',
        speaker: 'girl',
        text: '......ありがとう、ございます......うっ......',
        expression: 'sad',
        next: 'trust_50_hug_3',
      },
      {
        id: 'trust_50_hug_3',
        speaker: 'narration',
        text: '彼女は静かに泣いていた。',
        next: null,
      },
      {
        id: 'trust_50_safe',
        speaker: 'girl',
        text: '......はい。ここにいると......そう思えます',
        expression: 'happy',
        next: null,
      },
    ],
  },

  // 親密度60: 手を繋ぐ
  {
    id: 'affection_60_hold_hands',
    title: '手を繋ぐ',
    type: 'milestone',
    condition: {
      minAffection: 60,
      minTrust: 40,
    },
    dialogues: [
      {
        id: 'affection_60_1',
        speaker: 'narration',
        text: '外を歩いているとき、彼女がそっと近づいてきた。',
        next: 'affection_60_2',
      },
      {
        id: 'affection_60_2',
        speaker: 'girl',
        text: '......あの',
        expression: 'embarrassed',
        next: 'affection_60_3',
      },
      {
        id: 'affection_60_3',
        speaker: 'narration',
        text: '彼女の指先が、こちらの手に触れた。',
        next: 'affection_60_4',
      },
      {
        id: 'affection_60_4',
        speaker: 'narration',
        text: '（どうする？）',
        choices: [
          {
            text: '手を握り返す',
            effects: { affection: 10, trust: 5 },
            next: 'affection_60_hold',
          },
          {
            text: 'そのままにする',
            effects: { affection: 3 },
            next: 'affection_60_wait',
          },
        ],
        next: null,
      },
      {
        id: 'affection_60_hold',
        speaker: 'girl',
        text: '......！えへへ......',
        expression: 'happy',
        next: 'affection_60_hold_2',
      },
      {
        id: 'affection_60_hold_2',
        speaker: 'girl',
        text: '......あったかいです',
        expression: 'loving',
        next: null,
      },
      {
        id: 'affection_60_wait',
        speaker: 'girl',
        text: '......',
        expression: 'embarrassed',
        next: 'affection_60_wait_2',
      },
      {
        id: 'affection_60_wait_2',
        speaker: 'narration',
        text: '彼女は恥ずかしそうに、でも嬉しそうにしていた。',
        next: null,
      },
    ],
  },

  // 親密度80: 告白イベント
  {
    id: 'affection_80_confession',
    title: '告白',
    type: 'milestone',
    condition: {
      minAffection: 80,
      minTrust: 60,
    },
    dialogues: [
      {
        id: 'affection_80_1',
        speaker: 'narration',
        text: 'ある日の夕方、彼女が真剣な顔でこちらを見つめてきた。',
        next: 'affection_80_2',
      },
      {
        id: 'affection_80_2',
        speaker: 'girl',
        text: 'あの......大事な、話があります',
        expression: 'neutral',
        next: 'affection_80_3',
      },
      {
        id: 'affection_80_3',
        speaker: 'girl',
        text: 'わたし......あなたのこと......',
        expression: 'embarrassed',
        next: 'affection_80_4',
      },
      {
        id: 'affection_80_4',
        speaker: 'girl',
        text: '......好き、です',
        expression: 'loving',
        next: 'affection_80_5',
      },
      {
        id: 'affection_80_5',
        speaker: 'girl',
        text: 'ご主人と奴隷、とかじゃなくて......わたしは、あなたが好きです',
        expression: 'embarrassed',
        next: 'affection_80_6',
      },
      {
        id: 'affection_80_6',
        speaker: 'narration',
        text: '（どう答える？）',
        choices: [
          {
            text: '俺も好きだ',
            effects: { affection: 15, trust: 10 },
            next: 'affection_80_accept',
          },
          {
            text: '......',
            effects: { affection: 5 },
            next: 'affection_80_silent',
          },
        ],
        next: null,
      },
      {
        id: 'affection_80_accept',
        speaker: 'girl',
        text: '......！本当、ですか......？',
        expression: 'surprised',
        next: 'affection_80_accept_2',
      },
      {
        id: 'affection_80_accept_2',
        speaker: 'girl',
        text: '......うれしい......うれしいです......！',
        expression: 'loving',
        next: 'affection_80_accept_3',
      },
      {
        id: 'affection_80_accept_3',
        speaker: 'narration',
        text: '彼女は涙を流しながら、満面の笑みを浮かべた。',
        next: null,
      },
      {
        id: 'affection_80_silent',
        speaker: 'girl',
        text: '......あ、す、すみません......変なこと言って......',
        expression: 'sad',
        next: 'affection_80_silent_2',
      },
      {
        id: 'affection_80_silent_2',
        speaker: 'girl',
        text: 'で、でも......気持ちは、変わりません......から',
        expression: 'embarrassed',
        next: null,
      },
    ],
  },

  // 親密度100 + 信頼度80: トゥルーエンド
  {
    id: 'true_ending',
    title: '二人の未来',
    type: 'milestone',
    condition: {
      minAffection: 100,
      minTrust: 80,
      maxFear: 20,
    },
    dialogues: [
      {
        id: 'true_end_1',
        speaker: 'narration',
        text: '長い時が流れた。',
        next: 'true_end_2',
      },
      {
        id: 'true_end_2',
        speaker: 'narration',
        text: '彼女の顔から、あの頃の怯えは消えていた。',
        next: 'true_end_3',
      },
      {
        id: 'true_end_3',
        speaker: 'girl',
        text: 'ねえ、あなた',
        expression: 'happy',
        next: 'true_end_4',
      },
      {
        id: 'true_end_4',
        speaker: 'girl',
        text: 'わたし......あなたに出会えて、本当によかった',
        expression: 'loving',
        next: 'true_end_5',
      },
      {
        id: 'true_end_5',
        speaker: 'girl',
        text: 'これからも......ずっと、一緒にいてくれますか？',
        expression: 'embarrassed',
        next: 'true_end_6',
      },
      {
        id: 'true_end_6',
        speaker: 'narration',
        text: '（どう答える？）',
        choices: [
          {
            text: 'もちろん。ずっと一緒だ',
            effects: {},
            next: 'true_end_forever',
          },
        ],
        next: null,
      },
      {
        id: 'true_end_forever',
        speaker: 'girl',
        text: '......大好き',
        expression: 'loving',
        next: 'true_end_final',
      },
      {
        id: 'true_end_final',
        speaker: 'narration',
        text: '二人の穏やかな日々は、これからも続いていく——',
        next: null,
      },
    ],
  },
]

// 全イベントリスト
export const allEvents: GameEvent[] = [
  ...milestoneEvents,
]

// 条件を満たすイベントを取得
export function checkForTriggerableEvents(
  stats: GirlStats,
  seenEvents: string[]
): GameEvent | null {
  for (const event of milestoneEvents) {
    // 既に見たイベントはスキップ
    if (seenEvents.includes(event.id)) continue

    const cond = event.condition
    if (!cond) continue

    // 条件チェック
    if (cond.minAffection !== undefined && stats.affection < cond.minAffection) continue
    if (cond.minTrust !== undefined && stats.trust < cond.minTrust) continue
    if (cond.maxFear !== undefined && stats.fear > cond.maxFear) continue

    // 全条件クリア → このイベントを返す
    return event
  }

  return null
}

// IDでイベント内のダイアログを検索
export function getEventDialogueById(eventId: string, dialogueId: string): Dialogue | undefined {
  const event = allEvents.find(e => e.id === eventId)
  if (!event) return undefined
  return event.dialogues.find(d => d.id === dialogueId)
}

// イベントの最初のダイアログを取得
export function getEventFirstDialogue(eventId: string): Dialogue | undefined {
  const event = allEvents.find(e => e.id === eventId)
  if (!event || event.dialogues.length === 0) return undefined
  return event.dialogues[0]
}
