'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/store/useStore'
import { fetchCountries, getDialCode, type Country } from '@/lib/countries'
import { simulateOTPSend, simulateOTPVerify } from '@/lib/otp'
import Toast from './Toast'

const phoneSchema = z.object({
  country: z.string().min(1, 'Select country'),
  phone: z.string().min(7, 'Phone number too short').max(15, 'Phone number too long')
})

const otpSchema = z.object({
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric')
})

export default function AuthForm() {
  const [step, setStep] = useState<'phone'|'otp'>('phone')
  const [countries, setCountries] = useState<Country[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [countrySearch, setCountrySearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country|null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string|null>(null)
  const [fullPhone, setFullPhone] = useState('')
  const setUser = useStore((s: any) => s.setUser)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm({ resolver: zodResolver(otpSchema) })

  useEffect(() => {
    fetchCountries().then(data => {
      const sorted = data.filter(c => c.idd?.root).sort((a, b) => a.name.common.localeCompare(b.name.common))
      setCountries(sorted)
      setFilteredCountries(sorted)
    }).catch(() => setToast('Failed to load countries'))
  }, [])

  useEffect(() => {
    const filtered = countries.filter(c => 
      c.name.common.toLowerCase().includes(countrySearch.toLowerCase())
    )
    setFilteredCountries(filtered)
  }, [countrySearch, countries])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const send = async (data: any) => {
    if (!selectedCountry) {
      setToast('Please select a country')
      return
    }
    const dialCode = getDialCode(selectedCountry)
    const phone = dialCode + data.phone
    setFullPhone(phone)
    
    setLoading(true)
    const result = await simulateOTPSend(phone)
    setLoading(false)
    
    if (result.success) {
      setStep('otp')
      setToast('OTP sent (use 123456 or 000000)')
    } else {
      setToast(result.message)
    }
  }

  const verify = async (data: any) => {
    setLoading(true)
    const result = await simulateOTPVerify(fullPhone, data.code)
    setLoading(false)
    
    if (result.success && result.user) {
      setUser(result.user)
    } else {
      setToast(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-white font-medium">Gemini</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-blue-400 mb-2">
              {step === 'phone' ? 'Welcome to Gemini' : 'Verify your phone'}
            </h1>
            <p className="text-gray-400 text-sm">
              {step === 'phone' ? 'Enter your phone number to get started' : `We sent a code to ${fullPhone}`}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(send)} className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name.common} (${getDialCode(selectedCountry)})` : countrySearch}
                  onChange={e => {
                    setCountrySearch(e.target.value)
                    setSelectedCountry(null)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Select country"
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                />
                {showDropdown && (
                  <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-xl mt-2 max-h-48 overflow-y-auto">
                    {filteredCountries.map(c => (
                      <div
                        key={c.cca2}
                        onClick={() => {
                          setSelectedCountry(c)
                          setCountrySearch('')
                          setShowDropdown(false)
                          phoneForm.setValue('country', c.cca2)
                        }}
                        className="p-4 hover:bg-gray-700 cursor-pointer text-white transition-colors"
                      >
                        {c.flag} {c.name.common} ({getDialCode(c)})
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input type="hidden" {...phoneForm.register('country')} />
              {phoneForm.formState.errors.country && <p className="text-red-400 text-sm">{phoneForm.formState.errors.country.message}</p>}
              
              <input 
                {...phoneForm.register('phone')} 
                placeholder="Phone number" 
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors" 
              />
              {phoneForm.formState.errors.phone && <p className="text-red-400 text-sm">{phoneForm.formState.errors.phone.message}</p>}
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(verify)} className="space-y-4">
              <input 
                {...otpForm.register('code')} 
                placeholder="Enter 6-digit code" 
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-center text-2xl tracking-widest" 
                maxLength={6} 
              />
              {otpForm.formState.errors.code && <p className="text-red-400 text-sm text-center">{otpForm.formState.errors.code.message}</p>}
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep('phone')} 
                  className="flex-1 p-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              
              <p className="text-center text-gray-400 text-sm mt-4">
                Use <span className="text-blue-400 font-mono">123456</span> or <span className="text-blue-400 font-mono">000000</span> for demo
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
