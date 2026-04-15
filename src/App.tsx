import { useState, useEffect } from 'react'
import { useGameStore } from './stores/gameStore'
import { DialogueBox } from './components/DialogueBox'
import { EventDialogueBox } from './components/EventDialogueBox'
import { getRandomDialogue } from './data/dialogues'
import { getUnlockedLocations, getLocationById } from './data/locations'
import { getShopItems, getClothesShopItems } from './data/items'
import type { TouchArea, Dialogue, DialogueChoice, Item, Expression } from './types'
import './styles/game.css'

// 表情に対応する立ち絵画像
const expressionImages: Record<string, string> = {
  neutral: '/images/character/neutral.jpeg',
  happy: '/images/character/happy.jpeg',
  sad: '/images/character/sad.jpeg',
  embarrassed: '/images/character/embarrassed.jpeg',
  scared: '/images/character/neutral.jpeg',  // 未実装 → neutralで代用
  angry: '/images/character/angry.jpeg',
  surprised: '/images/character/neutral.jpeg', // 未実装 → neutralで代用
  loving: '/images/character/loving.jpeg',
}

type Screen = 'main' | 'touch' | 'location' | 'shop' | 'gift' | 'dialogue' | 'event' | 'outfit' | 'clothesShop'

function App() {
  const [isStarted, setIsStarted] = useState(false)
  const [screen, setScreen] = useState<Screen>('main')
  const [message, setMessage] = useState('......')
  const [currentDialogueData, setCurrentDialogueData] = useState<Dialogue | null>(null)

  const {
    girl,
    player,
    date,
    currentExpression,
    pendingEvent,
    talk,
    touch,
    goOut,
    giveGift,
    rest,
    resetGame,
    updateStats,
    spendMoney,
    addItem,
    setExpression,
    checkForEvents,
    clearPendingEvent,
    changeOutfit,
    unlockOutfit,
  } = useGameStore()

  // 現在表示中のイベントダイアログ
  const [currentEventDialogue, setCurrentEventDialogue] = useState<Dialogue | null>(null)
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)

  // ステータス変動後にイベントチェック
  useEffect(() => {
    if (screen === 'main' && !pendingEvent) {
      checkForEvents()
    }
  }, [girl.stats, screen, pendingEvent, checkForEvents])

  // ペンディングイベントがあれば自動的にイベント画面へ
  useEffect(() => {
    if (pendingEvent && screen === 'main') {
      setCurrentEventId(pendingEvent.id)
      setCurrentEventDialogue(pendingEvent.dialogues[0])
      setScreen('event')
    }
  }, [pendingEvent, screen])

  // タイトル画面
  if (!isStarted) {
    return (
      <div style={styles.titleScreen}>
        <h1 style={styles.title}>Teaching Feeling</h1>
        <p style={styles.subtitle}>〜 彼女との日々 〜</p>
        <div style={styles.titleButtons}>
          <button style={styles.startButton} onClick={() => setIsStarted(true)}>
            はじめる
          </button>
          <button
            style={{ ...styles.startButton, backgroundColor: '#666' }}
            onClick={() => {
              resetGame()
              setIsStarted(true)
            }}
          >
            最初から
          </button>
        </div>
      </div>
    )
  }

  // 話すアクション
  const handleTalk = () => {
    talk()
    const dialogue = getRandomDialogue(girl.stats.trust, girl.stats.affection)
    setCurrentDialogueData(dialogue)
    setScreen('dialogue')
  }

  // 会話終了
  const handleDialogueComplete = () => {
    setCurrentDialogueData(null)
    setScreen('main')
    setMessage('（会話が終わった）')
  }

  // イベント会話終了
  const handleEventComplete = () => {
    setCurrentEventDialogue(null)
    setCurrentEventId(null)
    clearPendingEvent()
    setScreen('main')
    setMessage('......')
  }

  // 選択肢選択
  const handleChoiceSelect = (choice: DialogueChoice) => {
    if (choice.effects) {
      updateStats(choice.effects)
    }
  }

  // 表情変更
  const handleExpressionChange = (expression: Expression | undefined) => {
    if (expression) {
      setExpression(expression)
    }
  }

  // なでるアクション
  const handleTouch = (area: TouchArea) => {
    touch(area)
    setScreen('main')

    if (girl.stats.trust < 30) {
      setMessage('「......っ！」（怯えている）')
    } else {
      const messages: Record<TouchArea, string> = {
        head: '「......えへへ」',
        shoulder: '「......」（少し安心した様子）',
        hand: '「......温かいです」',
        cheek: girl.stats.affection >= 50 ? '「......好きです」' : '「......」',
      }
      setMessage(messages[area])
    }
  }

  // 外出アクション
  const handleGoOut = (locationId: string) => {
    const location = getLocationById(locationId)
    if (!location) return

    if (player.money < location.moneyCost) {
      setMessage('（お金が足りない...）')
      setScreen('main')
      return
    }

    spendMoney(location.moneyCost)
    goOut(locationId)
    setScreen('main')
    setMessage(`（${location.name}に行った。楽しそうだった）`)
  }

  // ショップで購入
  const handleBuyItem = (item: Item) => {
    if (player.money < item.price) {
      setMessage('（お金が足りない...）')
      return
    }

    spendMoney(item.price)
    addItem(item)
    setMessage(`（${item.name}を買った）`)
  }

  // プレゼントを渡す
  const handleGiveGift = (item: Item) => {
    giveGift(item)
    setScreen('main')

    // カテゴリによって反応を変える
    if (item.category === 'food') {
      setMessage(`「${item.name}......おいしいです」`)
    } else {
      setMessage(`「${item.name}......ありがとうございます」`)
    }
  }

  // 休むアクション
  const handleRest = () => {
    rest()
    setMessage('（翌日になった）')
  }

  // 衣装を購入
  const handleBuyOutfit = (item: Item) => {
    if (player.money < item.price) {
      setMessage('（お金が足りない...）')
      return
    }

    // 既に持っているかチェック
    if (girl.unlockedOutfits.includes(item.id)) {
      setMessage('（既に持っている）')
      return
    }

    spendMoney(item.price)
    unlockOutfit(item.id)
    setMessage(`（${item.name}を買った）`)
  }

  // 衣装を変更
  const handleChangeOutfit = (outfitId: string) => {
    changeOutfit(outfitId)
    setScreen('main')
    setMessage('（着替えた）')
  }

  // 解放済みロケーション
  const unlockedLocations = getUnlockedLocations(
    girl.stats.trust,
    girl.stats.affection,
    date.month
  )

  // ショップアイテム
  const shopItems = getShopItems()

  // 服屋アイテム
  const clothesShopItems = getClothesShopItems()

  // 衣装名マッピング
  const outfitNames: Record<string, string> = {
    default: 'セーラー服',
    outfit_casual: 'カジュアル服',
    outfit_dress: 'ワンピース',
    outfit_maid: 'メイド服',
    outfit_swimsuit: '水着',
  }

  // プレゼント可能なアイテム
  const giftableItems = player.items.filter(
    item => item.category === 'food' || item.category === 'gift'
  )

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <div style={styles.dateDisplay}>
          {date.year}年 {date.month}月 {date.day}日
        </div>
        <div style={styles.moneyDisplay}>
          所持金: ¥{player.money.toLocaleString()}
        </div>
      </div>

      {/* メインエリア */}
      <div style={styles.mainArea}>
        {/* キャラクター表示 */}
        <div style={styles.characterArea}>
          <div style={styles.characterContainer}>
            <img
              src={expressionImages[currentExpression]}
              alt={girl.name}
              style={styles.characterImage}
            />
          </div>
          <div style={styles.characterName}>{girl.name}</div>
        </div>

        {/* 会話モード */}
        {screen === 'dialogue' && currentDialogueData && (
          <DialogueBox
            dialogue={currentDialogueData}
            girlName={girl.name}
            onComplete={handleDialogueComplete}
            onChoiceSelect={handleChoiceSelect}
            onExpressionChange={handleExpressionChange}
          />
        )}

        {/* イベントモード */}
        {screen === 'event' && currentEventDialogue && currentEventId && (
          <EventDialogueBox
            eventId={currentEventId}
            dialogue={currentEventDialogue}
            girlName={girl.name}
            onComplete={handleEventComplete}
            onChoiceSelect={handleChoiceSelect}
            onExpressionChange={handleExpressionChange}
          />
        )}

        {/* メッセージボックス（非会話時） */}
        {screen !== 'dialogue' && screen !== 'event' && (
          <div style={styles.messageBox}>
            <p style={styles.messageText}>{message}</p>
          </div>
        )}

        {/* アクションエリア */}
        <div style={styles.actionArea}>
          {/* メイン画面 */}
          {screen === 'main' && (
            <div style={styles.actionButtons}>
              <button style={styles.actionButton} onClick={handleTalk}>
                話す
              </button>
              <button style={styles.actionButton} onClick={() => setScreen('touch')}>
                なでる
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  opacity: unlockedLocations.length > 0 ? 1 : 0.5,
                }}
                onClick={() => unlockedLocations.length > 0 && setScreen('location')}
                disabled={unlockedLocations.length === 0}
              >
                外出する
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  opacity: giftableItems.length > 0 ? 1 : 0.5,
                }}
                onClick={() => giftableItems.length > 0 && setScreen('gift')}
                disabled={giftableItems.length === 0}
              >
                プレゼント
              </button>
              <button style={styles.actionButton} onClick={() => setScreen('shop')}>
                買い物
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  opacity: girl.unlockedOutfits.length > 1 ? 1 : 0.5,
                }}
                onClick={() => girl.unlockedOutfits.length > 1 && setScreen('outfit')}
                disabled={girl.unlockedOutfits.length <= 1}
              >
                着替え
              </button>
              <button style={styles.actionButton} onClick={() => setScreen('clothesShop')}>
                服屋
              </button>
              <button style={styles.actionButton} onClick={handleRest}>
                休む
              </button>
            </div>
          )}

          {/* なでるメニュー */}
          {screen === 'touch' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>どこをなでる？</h4>
              <div style={styles.subMenuButtons}>
                <button style={styles.subMenuButton} onClick={() => handleTouch('head')}>
                  頭
                </button>
                <button style={styles.subMenuButton} onClick={() => handleTouch('shoulder')}>
                  肩
                </button>
                <button style={styles.subMenuButton} onClick={() => handleTouch('hand')}>
                  手
                </button>
                <button style={styles.subMenuButton} onClick={() => handleTouch('cheek')}>
                  頬
                </button>
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 外出先選択 */}
          {screen === 'location' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>どこに行く？</h4>
              <div style={styles.subMenuButtons}>
                {unlockedLocations.map(loc => (
                  <button
                    key={loc.id}
                    style={styles.subMenuButton}
                    onClick={() => handleGoOut(loc.id)}
                  >
                    {loc.name}
                    {loc.moneyCost > 0 && (
                      <span style={styles.cost}> (¥{loc.moneyCost})</span>
                    )}
                  </button>
                ))}
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* ショップ */}
          {screen === 'shop' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>何を買う？</h4>
              <div style={styles.shopList}>
                {shopItems.map(item => (
                  <div key={item.id} style={styles.shopItem}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemDesc}>{item.description}</div>
                    </div>
                    <button
                      style={{
                        ...styles.buyButton,
                        opacity: player.money >= item.price ? 1 : 0.5,
                      }}
                      onClick={() => handleBuyItem(item)}
                      disabled={player.money < item.price}
                    >
                      ¥{item.price}
                    </button>
                  </div>
                ))}
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* プレゼント選択 */}
          {screen === 'gift' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>何を渡す？</h4>
              <div style={styles.subMenuButtons}>
                {giftableItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    style={styles.subMenuButton}
                    onClick={() => handleGiveGift(item)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 着替え選択 */}
          {screen === 'outfit' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>何を着る？</h4>
              <div style={styles.subMenuButtons}>
                {girl.unlockedOutfits.map(outfitId => (
                  <button
                    key={outfitId}
                    style={{
                      ...styles.subMenuButton,
                      backgroundColor: girl.currentOutfit === outfitId ? '#ff69b4' : '#4a4a6e',
                    }}
                    onClick={() => handleChangeOutfit(outfitId)}
                  >
                    {outfitNames[outfitId] || outfitId}
                    {girl.currentOutfit === outfitId && ' (着用中)'}
                  </button>
                ))}
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 服屋 */}
          {screen === 'clothesShop' && (
            <div style={styles.subMenu}>
              <h4 style={styles.subMenuTitle}>服屋</h4>
              <div style={styles.shopList}>
                {clothesShopItems.map(item => (
                  <div key={item.id} style={styles.shopItem}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemDesc}>{item.description}</div>
                    </div>
                    <button
                      style={{
                        ...styles.buyButton,
                        opacity: girl.unlockedOutfits.includes(item.id)
                          ? 0.5
                          : player.money >= item.price
                          ? 1
                          : 0.5,
                        backgroundColor: girl.unlockedOutfits.includes(item.id) ? '#666' : '#4ecdc4',
                      }}
                      onClick={() => handleBuyOutfit(item)}
                      disabled={girl.unlockedOutfits.includes(item.id) || player.money < item.price}
                    >
                      {girl.unlockedOutfits.includes(item.id) ? '購入済' : `¥${item.price}`}
                    </button>
                  </div>
                ))}
              </div>
              <button style={styles.backButton} onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}
        </div>
      </div>

      {/* サイドバー */}
      <div style={styles.sidebar}>
        <div style={styles.statusPanel}>
          <h3 style={styles.panelTitle}>ステータス</h3>

          <div style={styles.statRow}>
            <span>親密度</span>
            <div style={styles.heartContainer}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.heart,
                    opacity: girl.stats.affection >= (i + 1) * 20 ? 1 : 0.3,
                  }}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>

          <div style={styles.statRow}>
            <span>信頼度</span>
            <div style={styles.heartContainer}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.heart,
                    color: '#4a9eff',
                    opacity: girl.stats.trust >= (i + 1) * 20 ? 1 : 0.3,
                  }}
                >
                  ♦
                </span>
              ))}
            </div>
          </div>

          <div style={styles.statRow}>
            <span>心理状態</span>
            <div style={styles.statBar}>
              <div
                style={{
                  ...styles.statFill,
                  width: `${girl.stats.mood}%`,
                  backgroundColor: '#ffd93d',
                }}
              />
            </div>
          </div>

          <div style={styles.statRow}>
            <span>体調</span>
            <div style={styles.statBar}>
              <div
                style={{
                  ...styles.statFill,
                  width: `${girl.stats.health}%`,
                  backgroundColor: '#4ecdc4',
                }}
              />
            </div>
          </div>
        </div>

        {/* 所持品 */}
        <div style={styles.statusPanel}>
          <h4 style={styles.panelTitle}>所持品</h4>
          {player.items.length === 0 ? (
            <div style={styles.emptyText}>なし</div>
          ) : (
            <div style={styles.itemList}>
              {player.items.map((item, index) => (
                <div key={`${item.id}-${index}`} style={styles.itemTag}>
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* デバッグ用 */}
        <div style={{ ...styles.statusPanel, opacity: 0.8, fontSize: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#888' }}>Debug</h4>
          <div>恐怖: {girl.stats.fear}</div>
          <div>依存: {girl.stats.dependence}</div>
          <div>自立: {girl.stats.independence}</div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ marginBottom: '4px', color: '#ff69b4' }}>表情テスト:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(['neutral', 'happy', 'sad', 'embarrassed', 'angry', 'loving'] as const).map(exp => (
                <button
                  key={exp}
                  onClick={() => setExpression(exp)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: currentExpression === exp ? '#ff69b4' : '#4a4a6e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  // タイトル画面
  titleScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #2a2a4e 100%)',
  },
  title: {
    fontSize: '48px',
    color: '#ff69b4',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    margin: 0,
  },
  subtitle: {
    fontSize: '20px',
    color: '#aaa',
    margin: 0,
  },
  titleButtons: {
    display: 'flex',
    gap: '16px',
    marginTop: '40px',
  },
  startButton: {
    padding: '16px 48px',
    fontSize: '18px',
    backgroundColor: '#ff69b4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },

  // メイン画面
  container: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 240px',
    gridTemplateRows: 'auto 1fr',
    gap: '16px',
    padding: '16px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #2a2a4e 100%)',
  },
  header: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 20px',
    backgroundColor: 'rgba(42, 42, 78, 0.8)',
    borderRadius: '8px',
  },
  dateDisplay: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  moneyDisplay: {
    fontSize: '18px',
  },

  // メインエリア
  mainArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
  },
  characterArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  characterContainer: {
    width: '350px',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    transition: 'opacity 0.2s',
  },
  characterName: {
    fontSize: '24px',
    color: '#ff69b4',
    fontWeight: 'bold',
  },

  // メッセージボックス
  messageBox: {
    width: '100%',
    maxWidth: '600px',
    padding: '20px 24px',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: '8px',
    border: '2px solid #ff69b4',
  },
  messageText: {
    fontSize: '18px',
    margin: 0,
    lineHeight: 1.6,
  },

  // アクションボタン
  actionArea: {
    width: '100%',
    maxWidth: '600px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  actionButton: {
    padding: '16px',
    fontSize: '16px',
    backgroundColor: '#4a4a6e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  // サブメニュー
  subMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subMenuTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#ff69b4',
  },
  subMenuButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  subMenuButton: {
    padding: '12px 20px',
    fontSize: '14px',
    backgroundColor: '#ff69b4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#666',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  cost: {
    fontSize: '12px',
    opacity: 0.8,
  },

  // ショップ
  shopList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  shopItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: 'rgba(74, 74, 110, 0.5)',
    borderRadius: '8px',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#aaa',
  },
  buyButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#4ecdc4',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  // サイドバー
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statusPanel: {
    backgroundColor: 'rgba(42, 42, 78, 0.8)',
    borderRadius: '8px',
    padding: '16px',
  },
  panelTitle: {
    fontSize: '16px',
    margin: '0 0 12px 0',
    color: '#ff69b4',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  heartContainer: {
    display: 'flex',
    gap: '2px',
  },
  heart: {
    fontSize: '18px',
    color: '#ff69b4',
  },
  statBar: {
    width: '100px',
    height: '12px',
    backgroundColor: '#1a1a2e',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s',
  },

  // 所持品
  emptyText: {
    fontSize: '12px',
    color: '#666',
  },
  itemList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  itemTag: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: '#4a4a6e',
    borderRadius: '4px',
  },
}

export default App
