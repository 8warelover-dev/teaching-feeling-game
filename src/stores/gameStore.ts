import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Girl, GirlStats, GameDate, Item, Dialogue, Expression, TouchArea, GameEvent } from '../types'
import { checkForTriggerableEvents } from '../data/events'

interface GameStore {
  // 状態
  girl: Girl
  player: {
    money: number
    items: Item[]
  }
  date: GameDate
  flags: Record<string, boolean>
  seenEvents: string[]
  unlockedLocations: string[]

  // UI状態
  currentDialogue: Dialogue | null
  currentExpression: Expression
  isDialogueActive: boolean
  pendingEvent: GameEvent | null

  // アクション
  talk: () => void
  touch: (area: TouchArea) => void
  goOut: (locationId: string) => void
  giveGift: (item: Item) => void
  rest: () => void

  // ステータス操作
  updateStats: (stats: Partial<GirlStats>) => void
  addMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void

  // 日付操作
  advanceDay: () => void

  // 会話操作
  setDialogue: (dialogue: Dialogue | null) => void
  clearDialogue: () => void
  setExpression: (expression: Expression) => void

  // フラグ操作
  setFlag: (key: string, value: boolean) => void
  markEventSeen: (eventId: string) => void
  unlockLocation: (locationId: string) => void

  // 衣装操作
  changeOutfit: (outfitId: string) => void
  unlockOutfit: (outfitId: string) => void

  // イベント操作
  checkForEvents: () => void
  clearPendingEvent: () => void

  // セーブ/リセット
  resetGame: () => void
}

const initialGirl: Girl = {
  name: 'シルヴィ',
  stats: {
    affection: 0,
    trust: 0,
    mood: 50,
    health: 80,
    dependence: 0,
    independence: 10,
    fear: 80,
  },
  currentOutfit: 'default',
  unlockedOutfits: ['default'],
}

const initialDate: GameDate = {
  day: 1,
  month: 4,
  year: 2026,
}

// 表情を決定するヘルパー
function determineExpression(stats: GirlStats): Expression {
  if (stats.fear > 60) return 'scared'
  if (stats.mood < 30) return 'sad'
  if (stats.affection >= 80 && stats.trust >= 60) return 'loving'
  if (stats.affection >= 50) return 'happy'
  if (stats.mood >= 70) return 'happy'
  return 'neutral'
}

// ステータスを範囲内に収めるヘルパー
function clampStats(stats: GirlStats): GirlStats {
  return {
    affection: Math.max(0, Math.min(100, stats.affection)),
    trust: Math.max(0, Math.min(100, stats.trust)),
    mood: Math.max(0, Math.min(100, stats.mood)),
    health: Math.max(0, Math.min(100, stats.health)),
    dependence: Math.max(0, Math.min(100, stats.dependence)),
    independence: Math.max(0, Math.min(100, stats.independence)),
    fear: Math.max(0, Math.min(100, stats.fear)),
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      girl: initialGirl,
      player: {
        money: 50000,
        items: [],
      },
      date: initialDate,
      flags: {},
      seenEvents: [],
      unlockedLocations: [],
      currentDialogue: null,
      currentExpression: 'scared',
      isDialogueActive: false,
      pendingEvent: null,

      talk: () => {
        const { girl } = get()
        const newStats = { ...girl.stats }

        // 信頼度が低いと効果薄い
        if (girl.stats.trust < 20) {
          newStats.affection += 1
          newStats.fear = Math.max(0, newStats.fear - 1)
        } else {
          newStats.affection += 3
          newStats.mood += 2
          newStats.fear = Math.max(0, newStats.fear - 2)
        }

        const clampedStats = clampStats(newStats)
        set({
          girl: { ...girl, stats: clampedStats },
          currentExpression: determineExpression(clampedStats),
        })
      },

      touch: (area: TouchArea) => {
        const { girl } = get()
        const newStats = { ...girl.stats }

        // 信頼度が低いと逆効果
        if (girl.stats.trust < 30) {
          newStats.fear += 5
          newStats.mood -= 3
          set({
            girl: { ...girl, stats: clampStats(newStats) },
            currentExpression: 'scared',
          })
          return
        }

        // 部位によって効果が違う
        switch (area) {
          case 'head':
            newStats.affection += 3
            newStats.trust += 2
            newStats.mood += 3
            break
          case 'shoulder':
            newStats.trust += 2
            newStats.mood += 2
            break
          case 'hand':
            newStats.affection += 4
            newStats.trust += 1
            break
          case 'cheek':
            if (girl.stats.affection >= 50) {
              newStats.affection += 5
              newStats.mood += 5
            } else {
              newStats.mood -= 2
            }
            break
        }

        newStats.fear = Math.max(0, newStats.fear - 2)
        const clampedStats = clampStats(newStats)

        set({
          girl: { ...girl, stats: clampedStats },
          currentExpression: girl.stats.affection >= 40 ? 'embarrassed' : 'happy',
        })
      },

      goOut: (locationId: string) => {
        const { girl, unlockedLocations } = get()

        if (!unlockedLocations.includes(locationId)) return

        const newStats = { ...girl.stats }
        newStats.affection += 5
        newStats.trust += 3
        newStats.mood += 5
        newStats.fear = Math.max(0, newStats.fear - 3)

        const clampedStats = clampStats(newStats)
        set({
          girl: { ...girl, stats: clampedStats },
          currentExpression: determineExpression(clampedStats),
        })
      },

      giveGift: (item: Item) => {
        const { girl, player } = get()

        // アイテムを持っているか確認
        const itemIndex = player.items.findIndex(i => i.id === item.id)
        if (itemIndex === -1) return

        const newStats = { ...girl.stats }
        newStats.affection += 5
        newStats.mood += 3

        // アイテム効果を適用
        if (item.effects) {
          Object.entries(item.effects).forEach(([key, value]) => {
            if (value !== undefined) {
              newStats[key as keyof GirlStats] += value
            }
          })
        }

        // アイテムを消費
        const newItems = [...player.items]
        newItems.splice(itemIndex, 1)

        const clampedStats = clampStats(newStats)
        set({
          girl: { ...girl, stats: clampedStats },
          player: { ...player, items: newItems },
          currentExpression: 'happy',
        })
      },

      rest: () => {
        const { girl, date } = get()
        const newStats = { ...girl.stats }

        newStats.health = Math.min(100, newStats.health + 10)
        newStats.mood = Math.min(100, newStats.mood + 5)

        // 日付を進める
        let newDay = date.day + 1
        let newMonth = date.month
        let newYear = date.year

        if (newDay > 30) {
          newDay = 1
          newMonth += 1
          if (newMonth > 12) {
            newMonth = 1
            newYear += 1
          }
        }

        const clampedStats = clampStats(newStats)
        set({
          girl: { ...girl, stats: clampedStats },
          date: { day: newDay, month: newMonth, year: newYear },
          currentExpression: determineExpression(clampedStats),
        })
      },

      updateStats: (stats) => {
        const { girl } = get()
        const newStats = { ...girl.stats }

        // 各ステータスを加算する（上書きではなく）
        Object.entries(stats).forEach(([key, value]) => {
          if (value !== undefined && key in newStats) {
            newStats[key as keyof GirlStats] += value
          }
        })

        const clampedStats = clampStats(newStats)
        set({
          girl: { ...girl, stats: clampedStats },
          currentExpression: determineExpression(clampedStats),
        })
      },

      addMoney: (amount) => {
        const { player } = get()
        set({
          player: { ...player, money: player.money + amount },
        })
      },

      spendMoney: (amount) => {
        const { player } = get()
        if (player.money < amount) return false
        set({
          player: { ...player, money: player.money - amount },
        })
        return true
      },

      addItem: (item) => {
        const { player } = get()
        set({
          player: { ...player, items: [...player.items, item] },
        })
      },

      removeItem: (itemId) => {
        const { player } = get()
        set({
          player: {
            ...player,
            items: player.items.filter(i => i.id !== itemId),
          },
        })
      },

      advanceDay: () => {
        const { date, girl } = get()
        let newDay = date.day + 1
        let newMonth = date.month
        let newYear = date.year

        if (newDay > 30) {
          newDay = 1
          newMonth += 1
          if (newMonth > 12) {
            newMonth = 1
            newYear += 1
          }
        }

        // 毎日少しずつ体調・気分が変動
        const newStats = { ...girl.stats }
        newStats.health = Math.max(0, newStats.health - 2)
        newStats.mood = Math.max(0, newStats.mood - 1)

        set({
          date: { day: newDay, month: newMonth, year: newYear },
          girl: { ...girl, stats: clampStats(newStats) },
        })
      },

      setDialogue: (dialogue) => {
        set({ currentDialogue: dialogue, isDialogueActive: dialogue !== null })
      },

      clearDialogue: () => {
        set({ currentDialogue: null, isDialogueActive: false })
      },

      setExpression: (expression) => {
        set({ currentExpression: expression })
      },

      setFlag: (key, value) => {
        const { flags } = get()
        set({ flags: { ...flags, [key]: value } })
      },

      markEventSeen: (eventId) => {
        const { seenEvents } = get()
        if (!seenEvents.includes(eventId)) {
          set({ seenEvents: [...seenEvents, eventId] })
        }
      },

      unlockLocation: (locationId) => {
        const { unlockedLocations } = get()
        if (!unlockedLocations.includes(locationId)) {
          set({ unlockedLocations: [...unlockedLocations, locationId] })
        }
      },

      changeOutfit: (outfitId) => {
        const { girl } = get()
        // 解放済みの衣装のみ着替え可能
        if (girl.unlockedOutfits.includes(outfitId)) {
          set({
            girl: { ...girl, currentOutfit: outfitId },
          })
        }
      },

      unlockOutfit: (outfitId) => {
        const { girl } = get()
        if (!girl.unlockedOutfits.includes(outfitId)) {
          set({
            girl: { ...girl, unlockedOutfits: [...girl.unlockedOutfits, outfitId] },
          })
        }
      },

      checkForEvents: () => {
        const { girl, seenEvents, pendingEvent } = get()
        // 既にペンディングイベントがある場合はスキップ
        if (pendingEvent) return

        const event = checkForTriggerableEvents(girl.stats, seenEvents)
        if (event) {
          set({ pendingEvent: event })
        }
      },

      clearPendingEvent: () => {
        const { pendingEvent } = get()
        if (pendingEvent) {
          // イベントを見た扱いにする
          const { seenEvents } = get()
          set({
            pendingEvent: null,
            seenEvents: [...seenEvents, pendingEvent.id],
          })
        }
      },

      resetGame: () => {
        set({
          girl: initialGirl,
          player: { money: 50000, items: [] },
          date: initialDate,
          flags: {},
          seenEvents: [],
          unlockedLocations: [],
          currentDialogue: null,
          currentExpression: 'scared',
          isDialogueActive: false,
          pendingEvent: null,
        })
      },
    }),
    {
      name: 'teaching-feeling-save',
    }
  )
)
