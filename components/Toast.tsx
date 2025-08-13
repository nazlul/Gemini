'use client'
import React from 'react'
import { useStore } from '@/store/useStore'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: string; onClose?: () => void }) {
  const darkMode = useStore((s: any) => s.darkMode)
  
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-xl z-50 shadow-lg border transition-colors ${
      darkMode 
        ? type==='success'?'bg-[#282A2C] border-[#3A3D40] text-[#E8EAED]':'bg-[#282A2C] border-red-500/20 text-red-400'
        : type==='success'?'bg-white border-[#E8EAED] text-[#202124]':'bg-white border-red-300 text-red-600'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-sm">{message}</div>
        <button onClick={onClose} className={`transition-colors ${
          darkMode ? 'text-[#9AA0A6] hover:text-[#E8EAED]' : 'text-[#5F6368] hover:text-[#202124]'
        }`}>×</button>
      </div>
    </div>
  )
}
