'use client'
import React from 'react'
import { useStore } from '@/store/useStore'

export const MessageSkeleton = () => {
  const darkMode = useStore((s: any) => s.darkMode)
  
  return (
    <div className="space-y-6 animate-pulse">
      {[1,2,3].map(i => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-3xl ${
            i % 2 === 0 ? 'bg-[#4285F4]/20 ml-12' : darkMode ? 'bg-[#282A2C] border border-[#3A3D40] mr-12' : 'bg-[#F8F9FA] border border-[#E8EAED] mr-12'
          }`}>
            <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-[#3A3D40]' : 'bg-[#DADCE0]'}`}></div>
            <div className={`h-4 rounded w-3/4 mb-2 ${darkMode ? 'bg-[#3A3D40]' : 'bg-[#DADCE0]'}`}></div>
            <div className={`h-3 rounded w-1/4 ${darkMode ? 'bg-[#3A3D40]' : 'bg-[#DADCE0]'}`}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const ChatroomSkeleton = () => {
  const darkMode = useStore((s: any) => s.darkMode)
  
  return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3].map(i => (
        <div key={i} className="gemini-card p-4">
          <div className={`h-5 rounded mb-2 w-3/4 ${darkMode ? 'bg-[#3A3D40]' : 'bg-[#DADCE0]'}`}></div>
          <div className={`h-4 rounded w-1/2 ${darkMode ? 'bg-[#3A3D40]' : 'bg-[#DADCE0]'}`}></div>
        </div>
      ))}
    </div>
  )
}