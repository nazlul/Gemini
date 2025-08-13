'use client'
import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import Toast from './Toast'
import { ChatroomSkeleton } from './LoadingSkeleton'
import Header from './Header'

export default function Dashboard() {
  const user = useStore((s: any) => s.user)
  const chatrooms = useStore((s: any) => s.chatrooms)
  const createRoom = useStore((s: any) => s.createRoom)
  const selectRoom = useStore((s: any) => s.selectRoom)
  const deleteRoom = useStore((s: any) => s.deleteRoom)
  const darkMode = useStore((s: any) => s.darkMode)
  const toggleDarkMode = useStore((s: any) => s.toggleDarkMode)
  const searchQuery = useStore((s: any) => s.searchQuery)
  const setSearchQuery = useStore((s: any) => s.setSearchQuery)
  const getFilteredChatrooms = useStore((s: any) => s.getFilteredChatrooms)
  const [name, setName] = useState('')
  const [toast, setToast] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const filteredChatrooms = getFilteredChatrooms()

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
      setToast('✅ Chat room created successfully!')
    } catch (error) {
      setToast('❌ Failed to create chat room')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, roomName: string) => {
    try {
      deleteRoom(id)
      setToast(`🗑️ "${roomName}" deleted successfully`)
    } catch (error) {
      setToast('❌ Failed to delete chat room')
    }
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${darkMode ? 'bg-[#1B1C1D]' : 'bg-[#f0f4f9] light'}`}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="sticky top-0 z-10">
        <Header title="Gemini Chat" subtitle={user.phone} />
      </div>

      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-light mb-2 ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>Chat History</h2>
          <p className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>Create and manage your conversations</p>
        </div>

        <div className="mb-6">
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search chatrooms..."
            className="gemini-input w-full p-4 mb-3"
          />
          <div className="flex gap-3">
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Enter chat room name" 
              className="gemini-input flex-1 p-4"
            />
            <button 
              onClick={handleCreate} 
              disabled={loading}
              className="gemini-button px-6 py-4 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span className="hidden sm:inline">{loading ? 'Creating...' : 'Create'}</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <ChatroomSkeleton />
          ) : filteredChatrooms.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                darkMode ? 'bg-[#282A2C]' : 'bg-[#ffffff]'
              }`}>
                <div className="w-8 h-8 gemini-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">G</span>
                </div>
              </div>
              <h3 className={`font-medium mb-2 ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>
                {searchQuery ? 'No matching chatrooms' : 'No chat rooms yet'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>
                {searchQuery ? 'Try a different search term' : 'Create your first chat room to get started'}
              </p>
            </div>
          ) : (
            filteredChatrooms.map((r: any) => (
              <div 
                key={r.id} 
                className={`gemini-card p-4 flex justify-between items-center transition-colors group cursor-pointer ${
                  darkMode ? 'hover:bg-[#3A3D40]' : 'hover:bg-[#E8EAED]'
                }`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectRoom(r)}
              >
                <div onClick={() => selectRoom(r)} className="flex-1">
                  <h3 className={`group-hover:text-[#4285F4] font-medium transition-colors ${
                    darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'
                  }`}>{r.name}</h3>
                  <p className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>
                    {r.messageCount} messages • Created {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(r.id, r.name)} 
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title={`Delete "${r.name}"`}
                  aria-label={`Delete chatroom ${r.name}`}
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
