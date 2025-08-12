'use client'
import React from 'react'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: string; onClose?: () => void }) {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded z-50 ${type==='success'?'bg-green-600 text-white':'bg-red-600 text-white'}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="font-bold">×</button>
      </div>
    </div>
  )
}
