# Gemini Chat — Full Scaffold (Next.js App Router + Prisma + Twilio)

## Quick start (local)

1. Copy `.env.example` to `.env` and fill values (DATABASE_URL, Twilio). For local dev `DEV_ALLOW_ANY_OTP=1` allows demo OTP.
2. Install deps: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev --name init`
5. Start dev server: `npm run dev`

Files included:
- app/ (Next.js App Router pages + api routes)
- components/ (React components)
- lib/ (prisma client, twilio helper, api helper)
- prisma/schema.prisma

Notes:
- OTP sending uses Twilio — configure credentials and TWILIO_FROM phone number.
- In production, store OTPs securely in Redis with TTL and limit attempts.
- Images are stored as base64 in demo; use S3 signed uploads in production.
