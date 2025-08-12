'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Chatroom, Message } from '@/types'

type State = {
  user: User|null
  chatrooms: Chatroom[]
  currentChatroom: Chatroom|null
  messages: Record<string, Message[]>
  darkMode: boolean
  setUser: (u: User|null)=>void
  createRoom: (name: string)=>Promise<Chatroom>
  deleteRoom: (id: string)=>void
  selectRoom: (room: Chatroom|null)=>void
  addMessageLocally: (roomId: string, msg: Message)=>void
  toggleDarkMode: ()=>void
}

export const useStore = create<State>()(persist((set,get)=> ({
  user: null, chatrooms: [], currentChatroom: null, messages: {}, darkMode: false,
  setUser: (u)=> set({ user: u }),
  createRoom: async (name)=> {
    const newRoom = { id: Date.now().toString(), name, createdAt: Date.now(), messageCount: 0 } as Chatroom
    set(state=> ({ chatrooms: [...state.chatrooms, newRoom], messages: { ...state.messages, [newRoom.id]: [] } }))
    return newRoom
  },
  deleteRoom: (id) => set(state=> { const next = state.chatrooms.filter(r=>r.id!==id); const msgs={...state.messages}; delete msgs[id]; const isCurrent = state.currentChatroom?.id===id; return { chatrooms: next, messages: msgs, currentChatroom: isCurrent?null:state.currentChatroom } }),
  selectRoom: (room)=> set({ currentChatroom: room }),
  addMessageLocally: (roomId, msg) => set(state=> ({ messages: { ...state.messages, [roomId]: [...(state.messages[roomId]||[]), msg] } })),
  toggleDarkMode: ()=> set(state=> ({ darkMode: !state.darkMode }))
}), { name: 'gemini-storage' }))
