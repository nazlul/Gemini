import Twilio from 'twilio'
const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
const authToken = process.env.TWILIO_AUTH_TOKEN || ''
const from = process.env.TWILIO_FROM || ''
export const twilioClient = Twilio(accountSid, authToken)
export async function sendOtpSMS(phone: string, code: string) {
  if (!accountSid || !authToken || !from) {
    console.log('[twilio] missing creds — skipping SMS:', code)
    return null
  }
  return twilioClient.messages.create({ body: `Your Gemini OTP is ${code}`, from, to: phone })
}
