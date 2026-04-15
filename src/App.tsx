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

// クラス名結合ヘルパー
const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ')

function App() {
  const [isStarted, setIsStarted] = useState(false)
  const [screen, setScreen] = useState<Screen>('main')
  const [message, setMessage] = useState('......')
  const [currentDialogueData, setCurrentDialogueData] = useState<Dialogue | null>(null)
  const [isDebugOpen, setIsDebugOpen] = useState(false)

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
    addMoney,
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
      <div className="title-screen">
        <div className="game-bg" />
        <h1 className="title-main">Teaching Feeling</h1>
        <p className="title-subtitle">〜 彼女との日々 〜</p>
        <div className="title-buttons">
          <button className="btn-start" onClick={() => setIsStarted(true)}>
            はじめる
          </button>
          <button
            className="btn-start btn-start--secondary"
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
    <div className="game-container">
      <div className="game-bg" />

      {/* ヘッダー */}
      <header className="header">
        <div className="date-display">
          {date.year}年 {date.month}月 {date.day}日
        </div>
        <div className="money-display">
          所持金: ¥{player.money.toLocaleString()}
        </div>
      </header>

      {/* メインエリア */}
      <main className="main-area">
        {/* キャラクター表示 */}
        <div className="character-area">
          <div className="character-container">
            <img
              src={expressionImages[currentExpression]}
              alt={girl.name}
              className="character-image"
            />
          </div>
          <div className="character-name">{girl.name}</div>
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
          <div className="message-box">
            <p className="message-text">{message}</p>
          </div>
        )}

        {/* アクションエリア */}
        <div className="action-area">
          {/* メイン画面 */}
          {screen === 'main' && (
            <div className="action-buttons">
              <button className="action-btn" onClick={handleTalk}>
                <span>話す</span>
              </button>
              <button className="action-btn" onClick={() => setScreen('touch')}>
                <span>なでる</span>
              </button>
              <button
                className="action-btn"
                onClick={() => unlockedLocations.length > 0 && setScreen('location')}
                disabled={unlockedLocations.length === 0}
              >
                <span>外出する</span>
              </button>
              <button
                className="action-btn"
                onClick={() => giftableItems.length > 0 && setScreen('gift')}
                disabled={giftableItems.length === 0}
              >
                <span>プレゼント</span>
              </button>
              <button className="action-btn" onClick={() => setScreen('shop')}>
                <span>買い物</span>
              </button>
              <button
                className="action-btn"
                onClick={() => girl.unlockedOutfits.length > 1 && setScreen('outfit')}
                disabled={girl.unlockedOutfits.length <= 1}
              >
                <span>着替え</span>
              </button>
              <button className="action-btn" onClick={() => setScreen('clothesShop')}>
                <span>服屋</span>
              </button>
              <button className="action-btn" onClick={handleRest}>
                <span>休む</span>
              </button>
            </div>
          )}

          {/* なでるメニュー */}
          {screen === 'touch' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">どこをなでる？</h4>
              <div className="sub-menu-buttons">
                <button className="sub-menu-btn" onClick={() => handleTouch('head')}>
                  頭
                </button>
                <button className="sub-menu-btn" onClick={() => handleTouch('shoulder')}>
                  肩
                </button>
                <button className="sub-menu-btn" onClick={() => handleTouch('hand')}>
                  手
                </button>
                <button className="sub-menu-btn" onClick={() => handleTouch('cheek')}>
                  頬
                </button>
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 外出先選択 */}
          {screen === 'location' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">どこに行く？</h4>
              <div className="sub-menu-buttons">
                {unlockedLocations.map(loc => (
                  <button
                    key={loc.id}
                    className="sub-menu-btn"
                    onClick={() => handleGoOut(loc.id)}
                  >
                    {loc.name}
                    {loc.moneyCost > 0 && (
                      <span className="cost-label"> (¥{loc.moneyCost})</span>
                    )}
                  </button>
                ))}
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* ショップ */}
          {screen === 'shop' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">何を買う？</h4>
              <div className="shop-list">
                {shopItems.map(item => (
                  <div key={item.id} className="shop-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-desc">{item.description}</div>
                    </div>
                    <button
                      className="btn-buy"
                      onClick={() => handleBuyItem(item)}
                      disabled={player.money < item.price}
                    >
                      ¥{item.price}
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* プレゼント選択 */}
          {screen === 'gift' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">何を渡す？</h4>
              <div className="sub-menu-buttons">
                {giftableItems.map((item, index) => (
                  <button
                    key={`${item.id}-${index}`}
                    className="sub-menu-btn"
                    onClick={() => handleGiveGift(item)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 着替え選択 */}
          {screen === 'outfit' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">何を着る？</h4>
              <div className="sub-menu-buttons">
                {girl.unlockedOutfits.map(outfitId => (
                  <button
                    key={outfitId}
                    className={cx('sub-menu-btn', girl.currentOutfit === outfitId && 'sub-menu-btn--active')}
                    onClick={() => handleChangeOutfit(outfitId)}
                  >
                    {outfitNames[outfitId] || outfitId}
                    {girl.currentOutfit === outfitId && ' (着用中)'}
                  </button>
                ))}
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}

          {/* 服屋 */}
          {screen === 'clothesShop' && (
            <div className="sub-menu">
              <h4 className="sub-menu-title">服屋</h4>
              <div className="shop-list">
                {clothesShopItems.map(item => (
                  <div key={item.id} className="shop-item">
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-desc">{item.description}</div>
                    </div>
                    <button
                      className={cx('btn-buy', girl.unlockedOutfits.includes(item.id) && 'btn-buy--purchased')}
                      onClick={() => handleBuyOutfit(item)}
                      disabled={girl.unlockedOutfits.includes(item.id) || player.money < item.price}
                    >
                      {girl.unlockedOutfits.includes(item.id) ? '購入済' : `¥${item.price}`}
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn-back" onClick={() => setScreen('main')}>
                戻る
              </button>
            </div>
          )}
        </div>
      </main>

      {/* サイドバー */}
      <aside className="sidebar">
        <div className="status-panel">
          <h3 className="panel-title">ステータス</h3>

          <div className="stat-row">
            <span>親密度</span>
            <div className="heart-container">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={cx('heart', girl.stats.affection < (i + 1) * 20 && 'heart--inactive')}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>

          <div className="stat-row">
            <span>信頼度</span>
            <div className="heart-container">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={cx('heart', 'heart--trust', girl.stats.trust < (i + 1) * 20 && 'heart--inactive')}
                >
                  ♦
                </span>
              ))}
            </div>
          </div>

          <div className="stat-row">
            <span>心理状態</span>
            <div className="stat-bar">
              <div
                className="stat-fill stat-fill--mood"
                style={{ width: `${girl.stats.mood}%` }}
              />
            </div>
          </div>

          <div className="stat-row">
            <span>体調</span>
            <div className="stat-bar">
              <div
                className="stat-fill stat-fill--health"
                style={{ width: `${girl.stats.health}%` }}
              />
            </div>
          </div>
        </div>

        {/* 所持品 */}
        <div className="status-panel">
          <h4 className="panel-title">所持品</h4>
          {player.items.length === 0 ? (
            <div className="empty-text">なし</div>
          ) : (
            <div className="item-list">
              {player.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="item-tag">
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* デバッグ用 */}
        <div className="status-panel debug-panel">
          <div
            className="debug-toggle"
            onClick={() => setIsDebugOpen(!isDebugOpen)}
          >
            <h4 className="panel-title">Debug</h4>
            <span className={cx('debug-toggle-icon', isDebugOpen && 'debug-toggle-icon--open')}>
              ▶
            </span>
          </div>

          {isDebugOpen && (
            <div className="debug-controls">
              {/* ステータス調整 */}
              <div className="debug-control-group">
                <div className="debug-control-row">
                  <span className="debug-control-label">親密度</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.affection}
                    onChange={(e) => updateStats({ affection: Number(e.target.value) })}
                    className="debug-slider"
                  />
                  <span className="debug-value">{girl.stats.affection}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">信頼度</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.trust}
                    onChange={(e) => updateStats({ trust: Number(e.target.value) })}
                    className="debug-slider debug-slider--trust"
                  />
                  <span className="debug-value">{girl.stats.trust}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">心理</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.mood}
                    onChange={(e) => updateStats({ mood: Number(e.target.value) })}
                    className="debug-slider debug-slider--mood"
                  />
                  <span className="debug-value">{girl.stats.mood}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">体調</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.health}
                    onChange={(e) => updateStats({ health: Number(e.target.value) })}
                    className="debug-slider debug-slider--health"
                  />
                  <span className="debug-value">{girl.stats.health}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">恐怖</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.fear}
                    onChange={(e) => updateStats({ fear: Number(e.target.value) })}
                    className="debug-slider debug-slider--fear"
                  />
                  <span className="debug-value">{girl.stats.fear}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">依存</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.dependence}
                    onChange={(e) => updateStats({ dependence: Number(e.target.value) })}
                    className="debug-slider"
                  />
                  <span className="debug-value">{girl.stats.dependence}</span>
                </div>

                <div className="debug-control-row">
                  <span className="debug-control-label">自立</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={girl.stats.independence}
                    onChange={(e) => updateStats({ independence: Number(e.target.value) })}
                    className="debug-slider"
                  />
                  <span className="debug-value">{girl.stats.independence}</span>
                </div>
              </div>

              {/* 所持金 */}
              <div className="debug-control-row">
                <span className="debug-control-label">所持金</span>
                <input
                  type="number"
                  value={player.money}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      // Reset money to 0 first, then add the desired amount
                      const diff = value - player.money
                      if (diff >= 0) {
                        addMoney(diff)
                      } else {
                        spendMoney(-diff)
                      }
                    }
                  }}
                  className="debug-money-input"
                />
              </div>

              {/* 表情テスト */}
              <div className="debug-section-title">表情テスト</div>
              <div className="debug-buttons">
                {(['neutral', 'happy', 'sad', 'embarrassed', 'angry', 'loving'] as const).map(exp => (
                  <button
                    key={exp}
                    onClick={() => setExpression(exp)}
                    className={cx('debug-btn', currentExpression === exp && 'debug-btn--active')}
                  >
                    {exp}
                  </button>
                ))}
              </div>

              {/* クイックアクション */}
              <div className="debug-actions">
                <button
                  className="debug-action-btn"
                  onClick={() => addMoney(10000)}
                >
                  +10,000円
                </button>
                <button
                  className="debug-action-btn debug-action-btn--danger"
                  onClick={() => {
                    if (confirm('ゲームをリセットしますか？')) {
                      resetGame()
                      setIsStarted(false)
                    }
                  }}
                >
                  リセット
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default App
