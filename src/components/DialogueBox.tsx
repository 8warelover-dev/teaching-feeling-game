import { useState, useEffect, useCallback } from 'react'
import type { Dialogue, DialogueChoice } from '../types'
import { getDialogueById } from '../data/dialogues'

interface DialogueBoxProps {
  dialogue: Dialogue
  girlName: string
  onComplete: () => void
  onChoiceSelect: (choice: DialogueChoice) => void
  onExpressionChange: (expression: Dialogue['expression']) => void
}

export function DialogueBox({
  dialogue,
  girlName,
  onComplete,
  onChoiceSelect,
  onExpressionChange,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentDialogue, setCurrentDialogue] = useState(dialogue)

  // 文字送り速度（ms）
  const typingSpeed = 30

  // 表情を更新（currentDialogue.expressionの変更時のみ）
  useEffect(() => {
    if (currentDialogue.expression) {
      onExpressionChange(currentDialogue.expression)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDialogue.expression])

  // 文字送りアニメーション
  useEffect(() => {
    setDisplayedText('')
    setIsTyping(true)

    let index = 0
    const text = currentDialogue.text

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, typingSpeed)

    return () => clearInterval(timer)
  }, [currentDialogue])

  // クリックで文字送りスキップ or 次へ
  const handleClick = useCallback(() => {
    if (isTyping) {
      // タイピング中ならスキップ
      setDisplayedText(currentDialogue.text)
      setIsTyping(false)
      return
    }

    // 選択肢がある場合は待機
    if (currentDialogue.choices && currentDialogue.choices.length > 0) {
      return
    }

    // 次の会話がある場合
    if (currentDialogue.next) {
      const nextDialogue = getDialogueById(currentDialogue.next)
      if (nextDialogue) {
        setCurrentDialogue(nextDialogue)
        return
      }
    }

    // 会話終了
    onComplete()
  }, [isTyping, currentDialogue, onComplete])

  // 選択肢を選んだ時
  const handleChoice = (choice: DialogueChoice) => {
    onChoiceSelect(choice)

    if (choice.next) {
      const nextDialogue = getDialogueById(choice.next)
      if (nextDialogue) {
        setCurrentDialogue(nextDialogue)
        return
      }
    }

    onComplete()
  }

  // 話者名を取得
  const getSpeakerName = () => {
    switch (currentDialogue.speaker) {
      case 'girl':
        return girlName
      case 'player':
        return 'あなた'
      case 'narration':
        return ''
      default:
        return ''
    }
  }

  const speakerName = getSpeakerName()

  return (
    <div style={styles.container} onClick={handleClick}>
      {/* 話者名 */}
      {speakerName && (
        <div style={styles.speakerName}>{speakerName}</div>
      )}

      {/* テキスト */}
      <div style={styles.textArea}>
        <p style={styles.text}>{displayedText}</p>
        {!isTyping && !currentDialogue.choices && (
          <span style={styles.cursor}>▼</span>
        )}
      </div>

      {/* 選択肢 */}
      {!isTyping && currentDialogue.choices && currentDialogue.choices.length > 0 && (
        <div style={styles.choicesContainer}>
          {currentDialogue.choices.map((choice, index) => (
            <button
              key={index}
              style={styles.choiceButton}
              onClick={(e) => {
                e.stopPropagation()
                handleChoice(choice)
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '600px',
    padding: '16px 24px',
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: '8px',
    border: '2px solid #ff69b4',
    cursor: 'pointer',
    minHeight: '100px',
  },
  speakerName: {
    fontSize: '14px',
    color: '#ff69b4',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  textArea: {
    position: 'relative',
  },
  text: {
    fontSize: '18px',
    margin: 0,
    lineHeight: 1.8,
    minHeight: '54px',
  },
  cursor: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    color: '#ff69b4',
    animation: 'blink 1s infinite',
  },
  choicesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  choiceButton: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#4a4a6e',
    color: '#fff',
    border: '2px solid #ff69b4',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s',
  },
}
