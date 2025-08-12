'use client'
import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import Toast from './Toast'

export default function Dashboard() {
  const user = useStore((s: any) => s.user)
  const chatrooms = useStore((s: any) => s.chatrooms)
  const createRoom = useStore((s: any) => s.createRoom)
  const selectRoom = useStore((s: any) => s.selectRoom)
  const deleteRoom = useStore((s: any) => s.deleteRoom)
  const [name, setName] = useState('')
  const [toast, setToast] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleCreate = async () => {
    if (!name.trim()) {
      setToast('Please enter a chat name')
      return
    }
    try {
      setLoading(true)
      await createRoom(name.trim())
      setName('')
      setToast('Chat room created successfully!')
    } catch (error) {
      setToast('Failed to create chat room')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, roomName: string) => {
    try {
      deleteRoom(id)
      setToast(`"${roomName}" deleted successfully`)
    } catch (error) {
      setToast('Failed to delete chat room')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h1 className="text-white font-medium">Gemini Chat</h1>
            <p className="text-gray-400 text-sm">{user.phone}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-light text-blue-400 mb-2">Chat History</h2>
          <p className="text-gray-400 text-sm">Create and manage your conversations</p>
        </div>

        <div className="mb-6 flex gap-3">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Enter chat room name" 
            className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
          />
          <button 
            onClick={handleCreate} 
            disabled={loading}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>

        <div className="space-y-3">
          {chatrooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">💬</span>
              </div>
              <h3 className="text-gray-300 font-medium mb-2">No chat rooms yet</h3>
              <p className="text-gray-500 text-sm">Create your first chat room to get started</p>
            </div>
          ) : (
            chatrooms.map((r: any) => (
              <div key={r.id} className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex justify-between items-center hover:bg-gray-750 transition-colors group">
                <div onClick={() => selectRoom(r)} className="cursor-pointer flex-1">
                  <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">{r.name}</h3>
                  <p className="text-gray-400 text-sm">{r.messageCount} messages • Created {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleDelete(r.id, r.name)} 
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title={`Delete "${r.name}"`}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
