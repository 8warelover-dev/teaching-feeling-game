import { useState, useEffect, useCallback } from 'react'
import type { Dialogue, DialogueChoice } from '../types'
import { getEventDialogueById } from '../data/events'
import '../styles/game.css'

interface EventDialogueBoxProps {
  eventId: string
  dialogue: Dialogue
  girlName: string
  onComplete: () => void
  onChoiceSelect: (choice: DialogueChoice) => void
  onExpressionChange: (expression: Dialogue['expression']) => void
}

export function EventDialogueBox({
  eventId,
  dialogue,
  girlName,
  onComplete,
  onChoiceSelect,
  onExpressionChange,
}: EventDialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentDialogue, setCurrentDialogue] = useState(dialogue)

  const typingSpeed = 30

  useEffect(() => {
    if (currentDialogue.expression) {
      onExpressionChange(currentDialogue.expression)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDialogue.expression])

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

  const handleClick = useCallback(() => {
    if (isTyping) {
      setDisplayedText(currentDialogue.text)
      setIsTyping(false)
      return
    }

    if (currentDialogue.choices && currentDialogue.choices.length > 0) {
      return
    }

    if (currentDialogue.next) {
      const nextDialogue = getEventDialogueById(eventId, currentDialogue.next)
      if (nextDialogue) {
        setCurrentDialogue(nextDialogue)
        return
      }
    }

    onComplete()
  }, [isTyping, currentDialogue, eventId, onComplete])

  const handleChoice = (choice: DialogueChoice) => {
    onChoiceSelect(choice)

    if (choice.next) {
      const nextDialogue = getEventDialogueById(eventId, choice.next)
      if (nextDialogue) {
        setCurrentDialogue(nextDialogue)
        return
      }
    }

    onComplete()
  }

  const getSpeakerName = () => {
    switch (currentDialogue.speaker) {
      case 'girl':
        return girlName
      case 'player':
        return 'You'
      case 'narration':
        return ''
      default:
        return ''
    }
  }

  const speakerName = getSpeakerName()

  return (
    <div className="dialogue-box dialogue-box--event" onClick={handleClick}>
      {speakerName && (
        <div className="speaker-name speaker-name--event">{speakerName}</div>
      )}

      <div className="dialogue-text-area">
        <p className="dialogue-text">{displayedText}</p>
        {!isTyping && !currentDialogue.choices && (
          <span className="dialogue-cursor dialogue-cursor--event">&#9660;</span>
        )}
      </div>

      {!isTyping && currentDialogue.choices && currentDialogue.choices.length > 0 && (
        <div className="choices-container">
          {currentDialogue.choices.map((choice, index) => (
            <button
              key={index}
              className="choice-btn choice-btn--event"
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
