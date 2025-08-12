export type User = { id: string; phone: string }
export type Message = { id: string; text?: string|null; image?: string|null; sender: 'user'|'ai'; timestamp: number }
export type Chatroom = { id: string; name: string; createdAt: number; messageCount: number }
