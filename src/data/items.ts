import type { Item } from '../types'

export const items: Item[] = [
  // 食べ物
  {
    id: 'bread',
    name: 'パン',
    description: '焼きたてのパン。',
    price: 200,
    category: 'food',
    effects: { mood: 5, health: 5 },
  },
  {
    id: 'cake',
    name: 'ケーキ',
    description: '甘くておいしいケーキ。',
    price: 800,
    category: 'food',
    effects: { mood: 15, affection: 5 },
  },
  {
    id: 'bento',
    name: 'お弁当',
    description: '栄養バランスの良いお弁当。',
    price: 500,
    category: 'food',
    effects: { health: 15, mood: 5 },
  },

  // プレゼント
  {
    id: 'flower',
    name: '花束',
    description: '綺麗な花束。',
    price: 1000,
    category: 'gift',
    effects: { affection: 10, mood: 10 },
  },
  {
    id: 'ribbon',
    name: 'リボン',
    description: 'かわいいリボン。',
    price: 500,
    category: 'gift',
    effects: { affection: 8 },
  },
  {
    id: 'accessory',
    name: 'アクセサリー',
    description: '小さなアクセサリー。',
    price: 2000,
    category: 'gift',
    effects: { affection: 15, trust: 5 },
  },
  {
    id: 'plush',
    name: 'ぬいぐるみ',
    description: 'ふわふわのぬいぐるみ。',
    price: 1500,
    category: 'gift',
    effects: { affection: 12, fear: -10 },
  },
  {
    id: 'book',
    name: '本',
    description: '面白そうな本。',
    price: 800,
    category: 'gift',
    effects: { affection: 5, independence: 3 },
  },

  // 衣装
  {
    id: 'outfit_casual',
    name: 'カジュアル服',
    description: '動きやすいカジュアルな服。',
    price: 3000,
    category: 'outfit',
  },
  {
    id: 'outfit_dress',
    name: 'ワンピース',
    description: 'かわいいワンピース。',
    price: 5000,
    category: 'outfit',
  },
  {
    id: 'outfit_maid',
    name: 'メイド服',
    description: 'クラシックなメイド服。',
    price: 8000,
    category: 'outfit',
  },
  {
    id: 'outfit_swimsuit',
    name: '水着',
    description: '海やプールで着る水着。',
    price: 4000,
    category: 'outfit',
  },
]

// カテゴリ別にアイテムを取得
export function getItemsByCategory(category: Item['category']): Item[] {
  return items.filter(item => item.category === category)
}

// IDでアイテムを取得
export function getItemById(id: string): Item | undefined {
  return items.find(item => item.id === id)
}

// ショップで購入可能なアイテム（衣装以外）
export function getShopItems(): Item[] {
  return items.filter(item => item.category !== 'outfit')
}

// 服屋で購入可能なアイテム
export function getClothesShopItems(): Item[] {
  return items.filter(item => item.category === 'outfit')
}
