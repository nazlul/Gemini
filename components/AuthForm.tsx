'use client'
import React, { useState } from 'react'
import { apiPost } from '@/lib/api'
import { useStore } from '@/store/useStore'
import Toast from './Toast'

export default function AuthForm() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'phone'|'otp'>('phone')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string|null>(null)
  const setUser = useStore((s: any) => s.setUser)

  const send = async () => {
    try {
      setLoading(true)
      await apiPost('/api/otp/send', { phone })
      setStep('otp')
      setToast('OTP sent')
    } catch (e:any) {
      setToast(e.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const verify = async () => {
    try {
      setLoading(true)
      const res = await apiPost('/api/otp/verify', { phone, code })
      if (res.success && res.user) setUser(res.user)
      else setToast('Invalid OTP')
    } catch (e:any) {
      setToast(e.message || 'Verify failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Sign in with phone</h2>
        {step === 'phone' ? (
          <>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+919999999999" className="w-full p-3 border rounded mb-4" />
            <button onClick={send} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded">{loading?'Sending...':'Send OTP'}</button>
          </>
        ) : (
          <>
            <input value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" className="w-full p-3 border rounded mb-4" />
            <div className="flex gap-2">
              <button onClick={verify} disabled={loading} className="flex-1 bg-blue-600 text-white p-3 rounded">Verify</button>
              <button onClick={() => setStep('phone')} className="flex-1 p-3 border rounded">Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
