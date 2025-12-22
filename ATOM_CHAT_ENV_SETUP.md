# Atom Chat Environment Setup

## Required Environment Variables

### 1. OpenAI API Key (Required)

```bash
OPENAI_API_KEY=sk-...
```

**Requirements:**
- Must start with `sk-` (OpenAI key)
- Must NOT start with `sk-th-` (Thesys key - will be rejected)
- Must be valid OpenAI API key with GPT-5.2 access

**Where to add:**
- Local: `.env.local`
- Vercel: Dashboard → Project → Settings → Environment Variables

---

### 2. Resend API Key (Required for Lead Capture)

```bash
# Option 1 (preferred)
resend_key_new=re_...

# Option 2 (fallback)
RESEND_API_KEY=re_...
```

**Requirements:**
- Get from: https://resend.com/api-keys
- Must have send permissions
- Add to both local and production environments

**Where to add:**
- Local: `.env.local`
- Vercel: Dashboard → Project → Settings → Environment Variables

---

### 3. Resend From Email (Optional)

```bash
RESEND_FROM=onboarding@resend.dev
```

**Default:** If not set, uses `onboarding@resend.dev`

**Custom domain setup:**
1. Verify domain in Resend dashboard
2. Set to: `atom@yourdomain.com`
3. Update environment variable

---

## Vercel Deployment Setup

### Step 1: Add Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all required variables:
   - `OPENAI_API_KEY`
   - `resend_key_new`
   - `RESEND_FROM` (optional)

### Step 2: Set for All Environments

For each variable:
- ✅ Production
- ✅ Preview
- ✅ Development

This ensures consistency across all deployments.

### Step 3: Redeploy

After adding variables:
```bash
git push
```

Or trigger manual redeploy in Vercel dashboard.

---

## Local Development Setup

### 1. Create .env.local

```bash
# In project root
touch .env.local
```

### 2. Add Required Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...
resend_key_new=re_...
RESEND_FROM=onboarding@resend.dev

# Your existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
# ... etc
```

### 3. Restart Dev Server

```bash
npm run dev
```

---

## Validation

### Test OpenAI Connection

The system will automatically validate:
- ✅ API key exists
- ✅ API key format is correct (starts with "sk-")
- ✅ API key is NOT a Thesys key ("sk-th-")

If validation fails, you'll see clear error messages:
```
❌ OPENAI_API_KEY environment variable is not set
❌ Invalid API key: OPENAI_API_KEY should not start with 'sk-th-'
❌ Invalid OPENAI_API_KEY format. OpenAI keys should start with 'sk-'
```

### Test Resend Connection

Send a test lead:
1. Open Atom Chat
2. Type: "I'd like to talk to sales"
3. Fill out and submit form
4. Check email at matt@antimatterai.com
5. Check Resend dashboard for logs

If Resend is not configured:
- Form will still submit
- Lead will be logged in console
- Warning returned in API response
- No email sent

---

## Security Best Practices

### ✅ DO:
- Use environment variables for all secrets
- Add `.env.local` to `.gitignore`
- Rotate keys regularly
- Use different keys for dev/prod if possible

### ❌ DON'T:
- Commit API keys to git
- Share keys in public channels
- Use production keys in development
- Expose keys in client-side code

---

## Troubleshooting

### "OPENAI_API_KEY not set" Error

**Cause:** Environment variable missing or not loaded

**Fix:**
1. Check `.env.local` exists
2. Verify variable name is correct (no typos)
3. Restart dev server after adding
4. For Vercel: redeploy after adding

---

### "Invalid API key format" Error

**Cause:** Wrong key type or format

**Fix:**
1. Verify key starts with `sk-`
2. Check you're not using Thesys key (`sk-th-`)
3. Get fresh key from OpenAI dashboard
4. Copy entire key without truncation

---

### "Resend API error" in Logs

**Cause:** Resend key missing or invalid

**Fix:**
1. Check `resend_key_new` or `RESEND_API_KEY` is set
2. Verify key starts with `re_`
3. Check Resend dashboard for key status
4. Verify "from" email domain is verified

---

### Lead Emails Not Arriving

**Check:**
1. Resend dashboard → Logs
2. Look for sent emails
3. Check spam folder
4. Verify recipient: matt@antimatterai.com
5. Check "from" domain is verified in Resend

**Temporary Solution:**
Even if emails fail, leads are logged in:
- Vercel function logs
- Console output (development)

---

## Production Checklist

Before deploying to production:

- [ ] `OPENAI_API_KEY` set in Vercel
- [ ] `resend_key_new` set in Vercel
- [ ] `RESEND_FROM` configured (optional)
- [ ] All variables set for: Production, Preview, Development
- [ ] Test lead submission works
- [ ] Verify email arrives at matt@antimatterai.com
- [ ] Check OpenAI dashboard shows gpt-5.2 usage
- [ ] No keys committed to git

---

*Last updated: December 22, 2025*

