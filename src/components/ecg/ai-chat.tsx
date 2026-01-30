'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User } from 'lucide-react'
import type { ChatMessage, AIChatContext } from '@/lib/ai/types'

interface AIChatModalProps {
  isOpen: boolean
  onClose: () => void
  context: AIChatContext
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'initial',
  role: 'assistant',
  content: 'Ola! Estou aqui para ajudar. Qual a sua duvida sobre esse laudo?',
  timestamp: new Date()
}

export function AIChatModal({ isOpen, onClose, context }: AIChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // For now, we're keeping context in the component for future API integration
  // When API is ready, we'll send context along with messages
  void context

  const isDisabled = true // Will be false when API is ready

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">ECG-IA</h2>
              <p className="text-xs text-white/80">Assistente de ECG</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isDisabled ? "A ECG-IA estara disponivel em breve..." : "Digite sua duvida..."}
              disabled={isDisabled}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            <div className="relative group">
              <button
                type="button"
                disabled={isDisabled || !inputValue.trim()}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full
                  hover:from-blue-700 hover:to-purple-700 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                aria-label="Enviar mensagem"
              >
                <Send className="h-5 w-5" />
              </button>
              {/* Tooltip */}
              {isDisabled && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Em breve
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          </div>
          {isDisabled && (
            <p className="mt-2 text-xs text-center text-gray-500">
              A integracao com a ECG-IA sera ativada em breve!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex items-start gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="flex-shrink-0 p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm ${
          isAssistant
            ? 'bg-white text-gray-900 rounded-2xl rounded-tl-md shadow-sm border border-gray-100'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-md'
        }`}
      >
        {message.content}
      </div>
      {!isAssistant && (
        <div className="flex-shrink-0 p-1.5 bg-gray-200 rounded-full">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}
