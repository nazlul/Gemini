export function simulateOTPSend(phone: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!phone || phone.length < 10) {
        resolve({ success: false, message: 'Invalid phone number' })
      } else {
        resolve({ success: true, message: 'OTP sent successfully' })
      }
    }, 1500)
  })
}

export function simulateOTPVerify(phone: string, code: string): Promise<{ success: boolean; user?: any; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (code === '123456' || code === '000000') {
        resolve({ 
          success: true, 
          user: { id: crypto.randomUUID(), phone },
          message: 'OTP verified successfully' 
        })
      } else {
        resolve({ success: false, message: 'Invalid OTP code' })
      }
    }, 1000)
  })
}