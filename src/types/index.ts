// ステータス
export interface GirlStats {
  affection: number      // 親密度 (0-100)
  trust: number          // 信頼度 (0-100)
  mood: number           // 心理状態 (0-100)
  health: number         // 体調 (0-100)
  // 隠しステータス
  dependence: number     // 依存度
  independence: number   // 自立度
  fear: number           // 恐怖
}

// 少女
export interface Girl {
  name: string
  stats: GirlStats
  currentOutfit: string
  unlockedOutfits: string[]
}

// 表情タイプ
export type Expression =
  | 'neutral'      // 通常
  | 'happy'        // 嬉しい
  | 'sad'          // 悲しい
  | 'embarrassed'  // 照れ
  | 'scared'       // 怯え
  | 'angry'        // 怒り
  | 'surprised'    // 驚き
  | 'loving'       // 愛情

// アクションタイプ
export type ActionType =
  | 'talk'         // 話す
  | 'touch'        // なでる
  | 'goOut'        // 外出する
  | 'gift'         // プレゼント
  | 'changeOutfit' // 着替え
  | 'rest'         // 休む

// タッチ部位
export type TouchArea = 'head' | 'shoulder' | 'hand' | 'cheek'

// ロケーション
export interface Location {
  id: string
  name: string
  description: string
  unlockCondition: {
    affection?: number
    trust?: number
  }
  moneyCost: number
}

// アイテム
export interface Item {
  id: string
  name: string
  description: string
  price: number
  category: 'gift' | 'outfit' | 'food'
  effects?: Partial<GirlStats>
}

// 会話
export interface Dialogue {
  id: string
  speaker: 'player' | 'girl' | 'narration'
  text: string
  expression?: Expression
  choices?: DialogueChoice[]
  next?: string | null
}

export interface DialogueChoice {
  text: string
  effects?: Partial<GirlStats>
  next: string | null
}

// イベント
export interface GameEvent {
  id: string
  title: string
  type: 'milestone' | 'random' | 'seasonal' | 'location'
  condition?: EventCondition
  dialogues: Dialogue[]
  seen?: boolean
}

export interface EventCondition {
  minAffection?: number
  minTrust?: number
  maxFear?: number
  location?: string
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  flags?: string[]
}

// ゲーム日付
export interface GameDate {
  day: number
  month: number
  year: number
}

// セーブデータ / ゲーム状態
export interface GameState {
  girl: Girl
  player: {
    money: number
    items: Item[]
  }
  date: GameDate
  flags: Record<string, boolean>
  seenEvents: string[]
  unlockedLocations: string[]
  currentDialogue: Dialogue | null
  currentLocation: string | null
}
