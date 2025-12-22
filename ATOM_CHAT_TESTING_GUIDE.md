# Atom Chat Testing Guide

## 🧪 Pre-Deployment Testing (Local)

### 1. Start Development Server

```bash
npm run dev
```

### 2. Navigate to Vendor Matrix Page

Open: `http://localhost:3000/resources/vendor-matrix`

---

## ✅ Test Checklist

### Test 1: Basic Chat Opening

- [ ] Click the floating chat button (bottom-right)
- [ ] Chat widget opens smoothly
- [ ] Input field is auto-focused
- [ ] Welcome message appears
- [ ] Suggested prompts are visible

**Expected:** Chat opens with no errors, input is focused

---

### Test 2: Ask Atom Button

- [ ] Click "Ask Atom" button in the page content
- [ ] Chat widget opens (same as floating button)
- [ ] No duplicate chat instances appear
- [ ] Input is focused

**Expected:** Same behavior as floating button

---

### Test 3: Suggested Prompts Auto-Send

- [ ] Click any suggested prompt (e.g., "Most secure")
- [ ] Prompt is immediately sent (no manual send required)
- [ ] Response starts streaming immediately
- [ ] No "Thinking" or loader UI appears

**Expected:** One-click send, smooth streaming

---

### Test 4: Streaming UX

- [ ] Send a message: "Compare deployment options"
- [ ] Observe streaming behavior
- [ ] Text appears in smooth chunks (not character-by-character)
- [ ] No jittery animation
- [ ] Feels similar to ChatGPT streaming
- [ ] Auto-scrolls during streaming

**Expected:** Smooth, readable streaming at ~50ms intervals

---

### Test 5: Input Field Auto-Growing

- [ ] Type a short message → input is 1 line
- [ ] Type a long message → input expands to 2-3 lines
- [ ] Type even longer → input stops at 4 lines (scrollable)
- [ ] Press Enter → message sends, input collapses to 1 line
- [ ] Shift+Enter → creates new line (doesn't send)

**Expected:** Textarea grows to max 4 lines, Enter sends

---

### Test 6: Response Format (Organic, Not Rigid)

- [ ] Send: "What's the difference between Atom and Sierra?"
- [ ] Observe response structure
- [ ] Should be conversational, not rigid template
- [ ] No forced "Recommendation / Why / Sources" format
- [ ] Uses bullets/headers only when helpful

**Expected:** Natural, conversational response

---

### Test 7: Lead Capture Trigger

- [ ] Send: "I'd like to talk to sales"
- [ ] OR: "How can I get in touch?"
- [ ] OR: "I want to request a demo"
- [ ] GenUI form appears inline (not plain text response)
- [ ] Form matches Contact page styling
- [ ] CustomSelect dropdown works

**Expected:** Lead form appears, no plain text

---

### Test 8: Lead Form Submission

Fill out the form:
- [ ] Full name: "Test User"
- [ ] Work email: "test@example.com"
- [ ] Company: "Acme Corp"
- [ ] Dropdown: Select "AI Agents"
- [ ] Notes: "Testing lead capture"
- [ ] Click "Submit"

**Expected:**
- Form submits without errors
- Confirmation message: "Thanks — someone from Antimatter will follow up shortly."
- Check inbox for email at matt@antimatterai.com (if Resend is configured)

---

### Test 9: Widget Footer

- [ ] Check footer text: "Powered by gpt-5.2"
- [ ] Text is left-aligned
- [ ] Text is subtle (small, low opacity)
- [ ] No OpenAI logo (just text)
- [ ] No extra vertical padding below input

**Expected:** Compact, left-aligned footer

---

### Test 10: Console Verification

Open browser console (F12) and check:

- [ ] Look for log: `[Atom Chat] Creating streaming response with gpt-5.2`
- [ ] No errors related to API calls
- [ ] No "chat.completions" in direct calls (if inspecting network)

**Expected:** Clean console, GPT-5.2 confirmed in logs

---

## 🌐 Post-Deployment Testing (Production)

### After deploying to Vercel:

1. **OpenAI Dashboard Check**
   - Login to OpenAI dashboard
   - Check "Usage" tab
   - **Critical:** Verify requests show model = "gpt-5.2"
   - **Critical:** Verify NO requests with model = "gpt-4o" from Atom Chat

2. **Resend Dashboard Check**
   - Login to Resend dashboard
   - Send test lead capture
   - Verify email arrives with correct formatting
   - Check "Source: Atom Chat" is in email
   - Verify vendor context is included

3. **Performance Check**
   - Test from mobile device
   - Test from different browsers
   - Verify streaming feels smooth on all devices
   - Check no layout shifts during streaming

---

## 🐛 Known Issues to Watch For

### If chat doesn't open:
- Check console for Zustand store errors
- Verify `useAtomChatStore` is imported correctly
- Check z-index conflicts with other components

### If streaming is too fast/jittery:
- Server-side buffering might not be working
- Check network tab for SSE stream timing
- Verify flush intervals in `atom-chat/route.ts`

### If lead form doesn't appear:
- Check system prompt trigger keywords
- Verify response includes exactly "LEAD_CAPTURE_TRIGGER"
- Check React rendering in AtomChatWidget

### If Resend emails fail:
- Verify `RESEND_API_KEY` or `resend_key_new` in env
- Check Resend dashboard for error logs
- Verify "from" email is verified in Resend

---

## 📊 Success Criteria

✅ **All tests pass**  
✅ **OpenAI dashboard shows only gpt-5.2 for Atom Chat**  
✅ **No console errors**  
✅ **Streaming feels smooth (ChatGPT-like)**  
✅ **Lead emails arrive successfully**  
✅ **Mobile experience is smooth**

---

## 🚨 Rollback Plan

If issues are found in production:

1. Revert to previous commit
2. Or set environment variable to bypass (not recommended)
3. Check this guide for debugging steps

---

*Last updated: December 22, 2025*

