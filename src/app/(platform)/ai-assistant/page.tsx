'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, Send, Plus, Sparkles, MessageSquare, Trash2, Bot, User, CornerDownLeft } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { askFinPilot } from '@/actions/aiAssistant'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
}

const QUICK_QUESTIONS = [
  'How much did I spend on food this month?',
  'Show my biggest expenses.',
  'Am I overspending?',
  'What subscriptions can I cancel?',
  'How much money have I saved this year?',
]

export default function AIAssistant() {
  const hasHydrated = useHasHydrated()

  // Zustand State
  const transactions = useFinanceStore((state) => state.transactions)
  const budgets = useFinanceStore((state) => state.budgets)
  const subscriptions = useFinanceStore((state) => state.subscriptions)
  const currency = useFinanceStore((state) => state.currency)

  // Local Chat State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (!hasHydrated) return
    const saved = localStorage.getItem('finpilot-chat-history')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setConversations(parsed)
        if (parsed.length > 0) {
          setActiveConvId(parsed[0].id)
        }
      } catch (e) {
        console.error('Error parsing chat history:', e)
      }
    } else {
      // Create initial conversation
      const initialConv: Conversation = {
        id: 'conv_initial',
        title: 'New Wealth Analysis',
        messages: [
          {
            role: 'assistant',
            content: `### 👋 Welcome to FinPilot AI!\n\nI am your conversational wealth co-pilot. I have analyzed your transaction accounts, budget limits, and active subscriptions.\n\nAsk me questions like:\n- *How much did I spend on food this month?*\n- *Am I overspending?*\n- *Which subscriptions can I cancel?*`,
            timestamp: new Date().toISOString(),
          },
        ],
      }
      setConversations([initialConv])
      setActiveConvId(initialConv.id)
    }
  }, [hasHydrated])

  // Save history to localStorage
  const saveChatHistory = (updated: Conversation[]) => {
    setConversations(updated)
    localStorage.setItem('finpilot-chat-history', JSON.stringify(updated))
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversations, activeConvId, isLoading])

  if (!hasHydrated) {
    return (
      <div className="flex h-[500px] border border-border rounded-2xl overflow-hidden animate-pulse select-none">
        <div className="w-64 border-r border-border bg-muted/40" />
        <div className="flex-1 bg-muted/20" />
      </div>
    )
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  // Handle New Chat
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      title: `Analysis ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      messages: [
        {
          role: 'assistant',
          content: '### Ask FinPilot AI...\n\nHow can I assist you with your budgeting, cash flow, or saving rate metrics today?',
          timestamp: new Date().toISOString(),
        },
      ],
    }
    const updated = [newConv, ...conversations]
    saveChatHistory(updated)
    setActiveConvId(newConv.id)
  }

  // Handle Delete Chat
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = conversations.filter((c) => c.id !== id)
    saveChatHistory(updated)
    if (activeConvId === id && updated.length > 0) {
      setActiveConvId(updated[0].id)
    }
  }

  // Handle Send Message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !activeConvId) return

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    const currentConv = conversations.find((c) => c.id === activeConvId)
    if (!currentConv) return

    const updatedMessages = [...currentConv.messages, userMsg]
    
    // Optimistic Update
    const updatedConvs = conversations.map((c) =>
      c.id === activeConvId
        ? {
            ...c,
            // Update title based on user query
            title: c.title.startsWith('New Wealth') || c.title.startsWith('Analysis ') 
              ? text.slice(0, 24) + (text.length > 24 ? '...' : '') 
              : c.title,
            messages: updatedMessages,
          }
        : c
    )
    saveChatHistory(updatedConvs)
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await askFinPilot(
        text,
        transactions,
        budgets,
        subscriptions,
        currency
      )

      const assistantMsg: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      const finalConvs = conversations.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...updatedMessages, assistantMsg],
            }
          : c
      )
      saveChatHistory(finalConvs)
    } catch (err) {
      console.error(err)
      const errorMsg: Message = {
        role: 'assistant',
        content: '⚠️ I encountered an error checking transactions data. Please retry.',
        timestamp: new Date().toISOString(),
      }
      const finalConvs = conversations.map((c) =>
        c.id === activeConvId ? { ...c, messages: [...updatedMessages, errorMsg] } : c
      )
      saveChatHistory(finalConvs)
    } finally {
      setIsLoading(false)
    }
  }

  // High-fidelity local Markdown Parser
  const parseMarkdown = (text: string) => {
    // 1. Tables
    const lines = text.split('\n')
    let inTable = false
    let tableHtml = ''
    let parsedLines = []

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      
      if (line.startsWith('|') && line.endsWith('|')) {
        // Skip separator row | :--- | :--- |
        if (line.includes('---') || line.includes(':---')) {
          continue
        }
        
        if (!inTable) {
          inTable = true
          tableHtml = '<div class="overflow-x-auto my-4 border border-border/80 rounded-xl"><table class="w-full text-left text-xs border-collapse divide-y divide-border/60">'
        }

        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
        const cellTag = tableHtml.includes('<thead>') ? 'td' : 'th'
        const rowClass = tableHtml.includes('<thead>') ? 'hover:bg-muted/10' : 'bg-muted/20 text-muted-foreground'
        
        let rowHtml = `<tr class="${rowClass} border-b border-border/40 font-semibold">`
        cells.forEach(c => {
          // Format bold content inside cells
          let cellText = c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          rowHtml += `<span style="display:none"></span><${cellTag} class="py-2.5 px-4">${cellText}</${cellTag}>`
        })
        rowHtml += '</tr>'

        if (!tableHtml.includes('<thead>')) {
          tableHtml += `<thead>${rowHtml}</thead><tbody>`
        } else {
          tableHtml += rowHtml
        }
      } else {
        if (inTable) {
          inTable = false
          tableHtml += '</tbody></table></div>'
          parsedLines.push(tableHtml)
        }
        
        // Parse simple markdown block components
        if (line.startsWith('### ')) {
          parsedLines.push(`<h3 class="text-sm font-bold text-foreground mt-4 mb-2">${line.replace('### ', '')}</h3>`)
        } else if (line.startsWith('#### ')) {
          parsedLines.push(`<h4 class="text-xs font-bold text-foreground mt-3 mb-1">${line.replace('#### ', '')}</h4>`)
        } else if (line.startsWith('- ')) {
          let boldLi = line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          parsedLines.push(`<li class="text-xs font-light ml-4 list-disc mb-1">${boldLi}</li>`)
        } else if (line.trim() !== '') {
          let boldPara = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          parsedLines.push(`<p class="text-xs font-light leading-relaxed my-2 text-foreground/90">${boldPara}</p>`)
        }
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>'
      parsedLines.push(tableHtml)
    }

    return parsedLines.join('')
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 h-[calc(100vh-130px)] md:h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="text-left flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Consult FinPilot on spending leaks and projections.</p>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative">
        {/* Left Side: History */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-muted/20 shrink-0">
          <div className="p-4 border-b border-border/60">
            <button
              onClick={handleNewChat}
              className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 select-none">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteChat(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0 ml-2"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Right Side: Chat Panel */}
        <div className="flex-1 flex flex-col justify-between h-full bg-card relative">
          {/* Top Panel bar */}
          <div className="px-6 py-3 border-b border-border/60 flex items-center gap-2 text-left bg-muted/10 shrink-0">
            <Bot className="w-5 h-5 text-purple-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">FinPilot Wealth AI</span>
              <span className="text-[10px] text-muted-foreground font-light">Powered by OpenAI gpt-4o</span>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 select-text">
            {activeConv?.messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant'
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] text-left ${
                    isAssistant ? 'self-start' : 'self-end flex-row-reverse'
                  }`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                    isAssistant
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                  }`}>
                    {isAssistant ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`flex flex-col gap-1`}>
                    <div
                      className={`p-4 rounded-2xl border text-xs font-light leading-relaxed select-text ${
                        isAssistant
                          ? 'bg-muted/40 border-border/60 text-foreground'
                          : 'bg-secondary text-secondary-foreground border-secondary/15'
                      }`}
                    >
                      {isAssistant ? (
                        <div
                          className="space-y-1.5 parsed-md"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    <span className={`text-[9px] text-muted-foreground/60 font-semibold px-2 ${
                      isAssistant ? 'text-left' : 'text-right'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* AI Typing Skeleton */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] self-start text-left">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="bg-muted/40 border border-border/60 p-4 rounded-2xl flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick-click suggestion bubbles */}
          {activeConv && activeConv.messages.length <= 1 && !isLoading && (
            <div className="px-6 pb-2 flex flex-wrap gap-2 justify-center select-none">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="bg-card border border-border hover:border-secondary/20 hover:text-secondary text-[11px] font-medium px-3.5 py-1.5 rounded-full transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel Form */}
          <div className="p-4 border-t border-border/60 bg-muted/5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(inputMessage)
              }}
              className="flex items-center gap-3 bg-muted border border-border rounded-xl px-4 py-2.5 w-full focus-within:border-secondary transition-colors"
            >
              <input
                type="text"
                value={inputMessage}
                disabled={isLoading}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask FinPilot AI..."
                className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/60 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-secondary hover:bg-secondary-hover disabled:opacity-40 text-secondary-foreground p-1.5 rounded-lg transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
