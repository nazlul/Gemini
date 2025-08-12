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
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{room.name}</h2>
        </div>
        <div>
          <button onClick={() => selectRoom(null)} className="p-2 border rounded">Back</button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((m: any) => (
            <div key={m.id} className={`${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                {m.image && <img src={m.image} className="w-64 h-40 object-cover rounded mb-2" />}
                <div>{m.text}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input type="file" onChange={handleFile} accept="image/*" />
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-3 border rounded" onKeyDown={e=>e.key==='Enter' && send()} />
          <button onClick={send} className="bg-blue-600 text-white p-3 rounded">Send</button>
        </div>
      </div>
    </div>
  )
}
