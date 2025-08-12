'use client'
import React, { useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { apiPost } from '@/lib/api'

export default function ChatRoom() {
  const room = useStore((s: any) => s.currentChatroom)
  const messages = useStore((s: any) => s.messages[room?.id ?? ''] ?? [])
  const addMessageLocally = useStore((s: any) => s.addMessageLocally)
  const selectRoom = useStore((s: any) => s.selectRoom)
  const [text, setText] = useState('')
  const [img, setImg] = useState<string|null>(null)
  const endRef = useRef<HTMLDivElement|null>(null)

  if (!room) return <div className="p-6">No room selected</div>

  const send = async () => {
    if (!text.trim() && !img) return
    const msg = { id: crypto.randomUUID(), text: text.trim(), image: img, sender: 'user', timestamp: Date.now() }
    addMessageLocally(room.id, msg)
    setText(''); setImg(null)
    try { await apiPost('/api/messages', { roomId: room.id, message: msg }) } catch(e){}
    setTimeout(async ()=>{
      const ai = { id: crypto.randomUUID(), text: 'Thanks — I will check that.', sender: 'ai', timestamp: Date.now() }
      addMessageLocally(room.id, ai)
      try { await apiPost('/api/messages', { roomId: room.id, message: ai }) } catch(e){}
    }, 1200 + Math.random()*2000)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader(); reader.onload = () => setImg(String(reader.result)); reader.readAsDataURL(f)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => selectRoom(null)} 
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            ←
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">💬</span>
          </div>
          <div>
            <h2 className="text-white font-medium">{room.name}</h2>
            <p className="text-gray-400 text-sm">{messages.length} messages</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">💬</span>
              </div>
              <h3 className="text-gray-300 font-medium mb-2">Start the conversation</h3>
              <p className="text-gray-500 text-sm">Send a message to begin chatting</p>
            </div>
          ) : (
            messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  {m.image && (
                    <img 
                      src={m.image} 
                      className="w-full max-w-sm rounded-xl mb-3 cursor-pointer hover:opacity-90 transition-opacity" 
                      alt="Shared image"
                    />
                  )}
                  {m.text && <div className="text-sm leading-relaxed">{m.text}</div>}
                  <div className={`text-xs mt-2 opacity-70 ${
                    m.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
            <div className="flex items-end gap-3">
              <label className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <input type="file" onChange={handleFile} accept="image/*" className="hidden" />
                <span className="text-gray-400 hover:text-white text-xl">📎</span>
              </label>
              
              <div className="flex-1">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Ask Gemini..."
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                />
              </div>
              
              <button 
                onClick={send}
                disabled={!text.trim() && !img}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span className="text-lg">→</span>
              </button>
            </div>
            
            {img && (
              <div className="mt-3 relative inline-block">
                <img src={img} className="w-20 h-20 object-cover rounded-lg" alt="Preview" />
                <button 
                  onClick={() => setImg(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
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
