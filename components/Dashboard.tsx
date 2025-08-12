'use client'
import React, { useState } from 'react'
import { useStore } from '@/store/useStore'

export default function Dashboard() {
  const user = useStore((s: any) => s.user)
  const chatrooms = useStore((s: any) => s.chatrooms)
  const createRoom = useStore((s: any) => s.createRoom)
  const selectRoom = useStore((s: any) => s.selectRoom)
  const deleteRoom = useStore((s: any) => s.deleteRoom)
  const [name, setName] = useState('')

  if (!user) return null

  const handleCreate = async () => {
    if (!name.trim()) return
    await createRoom(name.trim())
    setName('')
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gemini Chat</h1>
          <p className="text-sm text-gray-500">{user.phone}</p>
        </div>
      </header>

      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New chat name" className="flex-1 p-2 border rounded" />
        <button onClick={handleCreate} className="bg-blue-600 text-white p-2 rounded">Create</button>
      </div>

      <div className="grid gap-3">
        {chatrooms.map(r => (
          <div key={r.id} className="p-4 border rounded flex justify-between items-center">
            <div onClick={() => selectRoom(r)} className="cursor-pointer">
              <h3 className="font-medium">{r.name}</h3>
              <p className="text-sm text-gray-400">{r.messageCount} messages</p>
            </div>
            <button onClick={() => deleteRoom(r.id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
