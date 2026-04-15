import type { Location } from '../types'

export const locations: Location[] = [
  {
    id: 'park',
    name: '近所の公園',
    description: '静かな公園。ベンチで一緒に座れる。',
    unlockCondition: { trust: 20 },
    moneyCost: 0,
  },
  {
    id: 'shopping',
    name: '商店街',
    description: 'いろんなお店がある。買い物や食べ歩きができる。',
    unlockCondition: { trust: 30 },
    moneyCost: 1000,
  },
  {
    id: 'cafe',
    name: 'カフェ',
    description: '落ち着いた雰囲気のカフェ。ゆっくり話ができる。',
    unlockCondition: { affection: 30 },
    moneyCost: 1500,
  },
  {
    id: 'clothes',
    name: '服屋',
    description: '衣服を売っている。彼女に服を買ってあげられる。',
    unlockCondition: { affection: 40 },
    moneyCost: 500,
  },
  {
    id: 'amusement',
    name: '遊園地',
    description: '楽しいアトラクションがたくさん。特別な日に。',
    unlockCondition: { affection: 60 },
    moneyCost: 5000,
  },
  {
    id: 'beach',
    name: '海',
    description: '夏限定。水着が必要。',
    unlockCondition: { affection: 70 },
    moneyCost: 3000,
  },
  {
    id: 'hotspring',
    name: '温泉',
    description: '癒しの温泉旅行。',
    unlockCondition: { affection: 80 },
    moneyCost: 10000,
  },
]

// 解放済みロケーションを取得
export function getUnlockedLocations(
  trust: number,
  affection: number,
  currentMonth?: number
): Location[] {
  return locations.filter(loc => {
    const trustOk = !loc.unlockCondition.trust || trust >= loc.unlockCondition.trust
    const affectionOk = !loc.unlockCondition.affection || affection >= loc.unlockCondition.affection

    // 海は夏限定（6-8月）
    if (loc.id === 'beach' && currentMonth) {
      const isSummer = currentMonth >= 6 && currentMonth <= 8
      return trustOk && affectionOk && isSummer
    }

    return trustOk && affectionOk
  })
}

// ロケーションIDから取得
export function getLocationById(id: string): Location | undefined {
  return locations.find(loc => loc.id === id)
}
