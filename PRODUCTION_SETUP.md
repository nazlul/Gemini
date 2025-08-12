# Production OTP Setup

## 1. Environment Variables
```bash
# Required for production
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token" 
TWILIO_FROM="+1234567890"
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Remove for production
DEV_ALLOW_ANY_OTP=0
```

## 2. Redis Setup
```bash
# Install Redis
docker run -d -p 6379:6379 redis:alpine

# Or use Redis Cloud/AWS ElastiCache
```

## 3. Twilio Setup
1. Create account at twilio.com
2. Get Account SID and Auth Token
3. Buy phone number for TWILIO_FROM
4. Verify your sending phone numbers

## 4. Security Features
- ✅ OTP stored in Redis with 5min TTL
- ✅ Rate limiting: 3 attempts per hour
- ✅ OTP deleted after verification
- ✅ Secure error handling
- ✅ Phone number validation

## 5. Deploy Checklist
- [ ] Set all environment variables
- [ ] Remove DEV_ALLOW_ANY_OTP
- [ ] Setup Redis instance
- [ ] Configure Twilio
- [ ] Test with real phone numbers