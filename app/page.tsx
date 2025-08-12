'use client'
import React from 'react'
import AuthForm from '@/components/AuthForm'
import Dashboard from '@/components/Dashboard'
import ChatRoom from '@/components/ChatRoom'
import { useStore } from '@/store/useStore'

export default function HomePage() {
  const user = useStore((s: any) => s.user)
  const current = useStore((s: any) => s.currentChatroom)

  if (!user) return <AuthForm />
  if (current) return <ChatRoom />
  return <Dashboard />
}
