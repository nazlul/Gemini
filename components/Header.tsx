'use client'
import React from 'react'
import { useStore } from '@/store/useStore'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
}

export default function Header({ title = "Gemini", subtitle, showBack, onBack }: HeaderProps) {
  const darkMode = useStore((s: any) => s.darkMode)
  const toggleDarkMode = useStore((s: any) => s.toggleDarkMode)

  return (
    <header className={`flex items-center justify-between p-4 border-b transition-colors ${
      darkMode ? 'border-[#3A3D40] bg-[#1B1C1D]' : 'border-[#E8EAED] bg-[#f0f4f9]'
    }`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-[#3A3D40] text-[#9AA0A6] hover:text-[#E8EAED]' : 'hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
            }`}
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="w-10 h-10 gemini-gradient rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">G</span>
        </div>
        <div>
          <h1 className={`font-medium text-base ${darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'}`}>{title}</h1>
          {subtitle && <p className={`text-sm ${darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]'}`}>{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-xl transition-colors ${
          darkMode ? 'hover:bg-[#3A3D40] text-[#9AA0A6] hover:text-[#E8EAED]' : 'hover:bg-[#F8F9FA] text-[#5F6368] hover:text-[#202124]'
        }`}
        aria-label="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}