'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Chatroom, Message } from '@/types'

// Custom hook for debounced search
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

type State = {
  user: User|null
  chatrooms: Chatroom[]
  currentChatroom: Chatroom|null
  messages: Record<string, Message[]>
  darkMode: boolean
  searchQuery: string
  setUser: (u: User|null)=>void
  createRoom: (name: string)=>Promise<Chatroom>
  deleteRoom: (id: string)=>void
  selectRoom: (room: Chatroom|null)=>void
  addMessageLocally: (roomId: string, msg: Message)=>void
  toggleDarkMode: ()=>void
  setSearchQuery: (query: string)=>void
  getFilteredChatrooms: ()=>Chatroom[]
}

export const useStore = create<State>()(persist((set,get)=> ({
  user: null, chatrooms: [], currentChatroom: null, messages: {}, darkMode: true, searchQuery: '',
  setUser: (u)=> set({ user: u }),
  createRoom: async (name)=> {
    const newRoom = { id: crypto.randomUUID(), name, createdAt: Date.now(), messageCount: 0 } as Chatroom
    set(state=> ({ chatrooms: [...state.chatrooms, newRoom], messages: { ...state.messages, [newRoom.id]: [] } }))
    return newRoom
  },
  deleteRoom: (id) => set(state=> { const next = state.chatrooms.filter(r=>r.id!==id); const msgs={...state.messages}; delete msgs[id]; const isCurrent = state.currentChatroom?.id===id; return { chatrooms: next, messages: msgs, currentChatroom: isCurrent?null:state.currentChatroom } }),
  selectRoom: (room)=> set({ currentChatroom: room }),
  addMessageLocally: (roomId, msg) => set(state=> ({ messages: { ...state.messages, [roomId]: [...(state.messages[roomId]||[]), msg] } })),
  toggleDarkMode: ()=> set(state=> ({ darkMode: !state.darkMode })),
  setSearchQuery: (query)=> set({ searchQuery: query }),
  getFilteredChatrooms: ()=> {
    const { chatrooms, searchQuery } = get()
    if (!searchQuery.trim()) return chatrooms
    return chatrooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }
}), { name: 'gemini-storage' }))
