'use client'
import React, { useRef, useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { apiPost } from '@/lib/api'
import { MessageSkeleton } from './LoadingSkeleton'
import Toast from './Toast'
import Header from './Header'

export default function ChatRoom() {
  const room = useStore((s: any) => s.currentChatroom)
  const messages = useStore((s: any) => s.messages[room?.id ?? ''] ?? [])
  const addMessageLocally = useStore((s: any) => s.addMessageLocally)
  const selectRoom = useStore((s: any) => s.selectRoom)
  const darkMode = useStore((s: any) => s.darkMode)
  const [text, setText] = useState('')
  const [img, setImg] = useState<string|null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [copiedId, setCopiedId] = useState<string|null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<string|null>(null)
  const endRef = useRef<HTMLDivElement|null>(null)
  const messagesRef = useRef<HTMLDivElement|null>(null)
  const lastAIResponse = useRef<number>(0)
  const textareaRef = useRef<HTMLTextAreaElement|null>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight
      }
    }
    
    scrollToBottom()
    setTimeout(scrollToBottom, 50)
    setTimeout(scrollToBottom, 200)
    setTimeout(() => {
      setIsLoading(false)
      scrollToBottom()
    }, 500)
  }, [room?.id])

  if (!room) return <div className="p-6">No room selected</div>

  const MESSAGES_PER_PAGE = 20
  const displayedMessages = messages.slice(-page * MESSAGES_PER_PAGE)

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isTyping])

  const generateDummyMessages = (count: number) => {
    const dummyMessages = []
    for (let i = 0; i < count; i++) {
      dummyMessages.push({
        id: `dummy-${Date.now()}-${i}`,
        text: `This is a dummy message #${i + 1} from earlier in the conversation.`,
        sender: i % 2 === 0 ? 'user' : 'ai',
        timestamp: Date.now() - (count - i) * 60000
      })
    }
    return dummyMessages
  }

  const loadMoreMessages = () => {
    if (page < 5) {
      const dummyMessages = generateDummyMessages(MESSAGES_PER_PAGE)
      dummyMessages.forEach(msg => addMessageLocally(room.id, msg))
      setPage(page + 1)
    } else {
      setHasMore(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    if (scrollTop === 0 && hasMore) {
      loadMoreMessages()
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      setToast('📋 Copied to clipboard')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      setToast('❌ Failed to copy')
      console.error('Failed to copy:', err)
    }
  }

  const simulateAIResponse = async (userMessage: string) => {
    const now = Date.now()
    if (now - lastAIResponse.current < 3000) return
    lastAIResponse.current = now

    setIsTyping(true)
    
    const msg = userMessage.toLowerCase()
    let response = ""
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      response = "Hello! I'm Gemini, your AI assistant. How can I help you today?"
    } else if (msg.includes('sup') || msg.includes('what\'s up')) {
      response = "Hey there! Not much, just here to help you with whatever you need. What's on your mind?"
    } else if (msg.includes('help') || msg.includes('assist')) {
      response = "I'm here to help! I can assist with questions, provide information, help with tasks, or just have a conversation. What would you like to know?"
    } else if (msg.includes('how are you')) {
      response = "I'm doing great, thank you for asking! I'm ready to help you with anything you need. How are you doing?"
    } else if (msg.includes('thank')) {
      response = "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?"
    } else if (msg.includes('bye') || msg.includes('goodbye')) {
      response = "Goodbye! It was great chatting with you. Feel free to come back anytime if you need help!"
    } else {
      const defaultResponses = [
        "That's an interesting question! Let me think about that...",
        "I understand what you're asking. Here's my perspective on this topic.",
        "Great point! I'd be happy to help you with that.",
        "Thanks for sharing that with me. Let me provide some insights.",
        "I see what you mean. This is definitely worth exploring further."
      ]
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    }
    
    const delay = 2000 + Math.random() * 3000
    
    setTimeout(() => {
      const aiMessage = {
        id: crypto.randomUUID(),
        text: response,
        sender: 'ai',
        timestamp: Date.now()
      }
      addMessageLocally(room.id, aiMessage)
      setIsTyping(false)
    }, delay)
  }

  const send = async () => {
    if (!text.trim() && !img) return
    const msg = { id: crypto.randomUUID(), text: text.trim(), image: img, sender: 'user', timestamp: Date.now() }
    addMessageLocally(room.id, msg)
    const userText = text.trim()
    setText(''); setImg(null)
    try { await apiPost('/api/messages', { roomId: room.id, message: msg }) } catch(e){}
    simulateAIResponse(userText)
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setToast('❌ Image too large (max 5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImg(String(reader.result))
      setToast('🖼️ Image uploaded')
    }
    reader.readAsDataURL(f)
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#1B1C1D]' : 'bg-[#f0f4f9] light'}`}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="sticky top-0 z-10">
        <Header 
          title={room.name} 
          subtitle={`${messages.length} messages`} 
          showBack 
          onBack={() => selectRoom(null)} 
        />
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6 scrollbar-thin" ref={messagesRef} onScroll={handleScroll}>
        <div className="max-w-4xl mx-auto space-y-6">
          {!hasMore && page > 1 && (
            <div className="text-center py-4">
              <p className="text-[#9AA0A6] text-sm">No more messages to load</p>
            </div>
          )}
          
          {isLoading ? (
            <MessageSkeleton />
          ) : displayedMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                darkMode ? 'bg-[#282A2C]' : 'bg-[#ffffff]'
              }`}>
                <div className="w-8 h-8 gemini-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">G</span>
                </div>
              </div>
              <h3 className={`font-medium text-lg mb-2 ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Start chatting with Gemini</h3>
              <p className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Ask me anything - I'm here to help!</p>
            </div>
          ) : (
            displayedMessages.map((m: any) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-3xl relative ${
                  m.sender === 'user' 
                    ? 'bg-[#4285F4] text-white ml-12'
                    : darkMode ? 'bg-[#282A2C] text-[#E8EAED] border border-[#3A3D40] mr-12' : 'bg-[#ffffff] text-[#202124] border border-[#E8EAED] mr-12 shadow-sm'
                }`}>
                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 gemini-gradient rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span className={`text-xs font-medium ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Gemini</span>
                    </div>
                  )}
                  {m.image && (
                    <img 
                      src={m.image} 
                      className="w-full max-w-sm rounded-2xl mb-3 cursor-pointer hover:opacity-90 transition-opacity" 
                      alt="Shared image"
                    />
                  )}
                  {m.text && (
                    <div className="text-sm leading-relaxed">
                      {m.text}
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className={`absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                          m.sender === 'user' ? 'bg-[#3367D6] hover:bg-[#2851A3]' : darkMode ? 'bg-[#3A3D40] hover:bg-[#4A4D50]' : 'bg-[#DADCE0] hover:bg-[#BDC1C6]'
                        } text-white flex items-center justify-center shadow-lg`}
                        title="Copy message"
                        aria-label="Copy message to clipboard"
                      >
                        {copiedId === m.id ? '✓' : '📋'}
                      </button>
                    </div>
                  )}
                  <div className={`text-xs mt-2 opacity-60 ${
                    m.sender === 'user' ? 'text-blue-100' : darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'
                  }`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className={`px-4 py-3 rounded-3xl mr-12 ${
                darkMode ? 'bg-[#282A2C] border border-[#3A3D40]' : 'bg-[#ffffff] border border-[#E8EAED] shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 gemini-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#34A853] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#FBBC04] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Gemini is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={endRef} />
        </div>
      </div>

      <div className={`p-4 border-t ${darkMode ? 'border-[#3A3D40] bg-[#1B1C1D]' : 'border-[#E8EAED] bg-[#f0f4f9]'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-[#282A2C] border border-[#3A3D40]' : 'bg-[#ffffff] border border-[#E8EAED]'}`}>
            <div className="flex items-end gap-3">
              <label className={`cursor-pointer p-2 rounded-xl transition-colors ${
                darkMode ? 'hover:bg-[#3A3D40]' : 'hover:bg-[#f0f4f9]'
              }`}>
                <input type="file" onChange={handleFile} accept="image/*" className="hidden" />
                <svg className={`w-5 h-5 transition-colors ${
                  darkMode ? 'text-[#9AA0A6] hover:text-[#E8EAED]' : 'text-[#5F6368] hover:text-[#202124]'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </label>
              
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Message Gemini..."
                  className={`w-full bg-transparent resize-none focus:outline-none text-sm leading-relaxed ${
                    darkMode ? 'text-[#E8EAED] placeholder-[#9AA0A6]' : 'text-[#202124] placeholder-[#5F6368]'
                  }`}
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                  aria-label="Type your message"
                />
              </div>
              
              <button 
                onClick={send}
                disabled={!text.trim() && !img}
                className={`p-2 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-xl transition-colors ${
                  darkMode ? 'disabled:bg-[#3A3D40]' : 'disabled:bg-[#DADCE0]'
                } disabled:cursor-not-allowed`}
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {img && (
              <div className="mt-3 relative inline-block">
                <img src={img} className="w-20 h-20 object-cover rounded-xl" alt="Preview" />
                <button 
                  onClick={() => setImg(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
