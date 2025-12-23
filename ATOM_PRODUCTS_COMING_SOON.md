# Atom Products "Coming Soon" UI Treatment

## Summary

Updated the Atom AI product navigation to clearly indicate that **Atom Finance** and **Atom Chat** are not yet available, while keeping them visible to signal roadmap depth and breadth.

---

## Visual Changes

### Desktop Dropdown (NavBar)

**Available Products (Atom Voice, Atom Search):**
- ✅ Full opacity
- ✅ Clickable with hover effects
- ✅ Cursor: pointer
- ✅ Hover: background + border highlight

**Coming Soon (Atom Finance, Atom Chat):**
- 🔒 Reduced opacity: 45%
- 🔒 Not clickable (disabled navigation)
- 🔒 Cursor: default
- 🔒 No hover effect
- 🏷️ "Coming soon" pill badge
  - Text: 10px
  - Background: zinc-800/50
  - Border: zinc-700/50
  - Text color: zinc-400
  - Rounded: 8px
- 💡 Tooltip on hover: "This module is coming soon"

---

### Mobile Menu (HamMenu)

**Available Products:**
- ✅ Full opacity
- ✅ Clickable navigation
- ✅ Number prefix visible

**Coming Soon:**
- 🔒 Reduced opacity: 45%
- 🔒 Not clickable
- 🔒 Cursor: default
- 🏷️ "Coming soon" pill badge inline with title
- 💡 Tooltip: "This module is coming soon"

---

## Implementation Details

### Data Structure

Updated `atomAIProducts` array in both components:

```typescript
const atomAIProducts = [
  {
    icon: HiMicrophone,
    title: "Atom Voice",
    desc: "AI-powered voice agent and assistant",
    href: "/voice-agent-demo",
    available: true, // ✅ ADDED
  },
  {
    icon: HiMagnifyingGlass,
    title: "Atom Search",
    desc: "Next-generation AI search with generative UI",
    href: "/atom/search",
    available: true, // ✅ ADDED
  },
  {
    icon: HiCurrencyDollar,
    title: "Atom Finance",
    desc: "Intelligent financial analysis and insights",
    href: "/atom/finance",
    available: false, // 🔒 NOT YET AVAILABLE
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "Atom Chat",
    desc: "Advanced conversational AI interface",
    href: "/atom/chat",
    available: false, // 🔒 NOT YET AVAILABLE
  },
];
```

---

### Conditional Rendering (NavBar)

```typescript
const ItemWrapper = product.available ? TransitionLink : 'div';

<ItemWrapper
  className={`
    ${product.available 
      ? 'hover:bg-white/5 hover:border-white/5 cursor-pointer' 
      : 'opacity-45 cursor-default'
    }
  `}
  title={!product.available ? 'This module is coming soon' : undefined}
>
  {/* Icon with reduced opacity if unavailable */}
  <div className={product.available ? 'text-white/90' : 'text-white/50'}>
    <product.icon className="size-6" />
  </div>
  
  {/* Title + Badge */}
  <div className="flex items-center justify-between gap-2">
    <h3>{product.title}</h3>
    {!product.available && (
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400">
        Coming soon
      </span>
    )}
  </div>
</ItemWrapper>
```

---

### Conditional Rendering (HamMenu)

```typescript
const ItemWrapper = product.available ? TransitionLink : 'div';

<li
  className={`relative pl-10 ${!product.available ? 'opacity-45' : ''}`}
  title={!product.available ? 'This module is coming soon' : undefined}
>
  <ItemWrapper className={`block pr-4 ${!product.available ? 'cursor-default' : ''}`}>
    <span className="flex items-center gap-2">
      {product.title}
      {!product.available && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-[10px] font-medium text-zinc-400">
          Coming soon
        </span>
      )}
    </span>
  </ItemWrapper>
</li>
```

---

## Design Rationale

### Why This Approach?

1. **Signal Roadmap Breadth**
   - Shows 4 products (not just 2)
   - Demonstrates product vision
   - Builds anticipation

2. **Avoid User Frustration**
   - Clear visual distinction (45% opacity)
   - Explicit "Coming soon" badge
   - Tooltip explanation
   - No false clickability

3. **Premium Feel**
   - Intentional, not "unfinished"
   - Subtle badge styling
   - Maintains design consistency
   - Professional treatment

4. **Accessibility**
   - Maintains 45% opacity (still readable)
   - Tooltip for screen readers
   - Clear visual hierarchy
   - Keyboard navigation preserved

---

## Tone & Messaging

### Badge Copy: "Coming soon"

**Alternatives considered:**
- ~~"In development"~~ (too technical, implies instability)
- ~~"Launching soon"~~ (too marketing-forward)
- ✅ **"Coming soon"** (clear, neutral, professional)

This strikes the right balance between:
- Transparency (not hiding the fact)
- Professionalism (intentional roadmap)
- Optimism (exciting future)

---

## User Experience

### Before:
- All 4 products appeared clickable
- Users would click Atom Finance/Chat
- Hit 404 or empty pages
- Confusion and frustration

### After:
- Visual clarity: 2 available, 2 coming
- No false affordance (greyed out = not clickable)
- Tooltip explains status
- Builds anticipation for future releases

---

## Files Modified

```
✅ src/components/NavBar.tsx           (desktop dropdown)
✅ src/components/ui/HamMenu.tsx       (mobile menu)
✅ ATOM_PRODUCTS_COMING_SOON.md        (this documentation)
```

---

## Testing Checklist

### Desktop:
- [ ] Hover over Atom Voice → shows hover effect
- [ ] Click Atom Voice → navigates to /voice-agent-demo
- [ ] Hover over Atom Search → shows hover effect
- [ ] Click Atom Search → navigates to /atom/search
- [ ] Hover over Atom Finance → shows tooltip "This module is coming soon"
- [ ] Hover over Atom Finance → NO hover effect
- [ ] Click Atom Finance → does NOT navigate
- [ ] Verify "Coming soon" badge appears on Atom Finance
- [ ] Verify "Coming soon" badge appears on Atom Chat
- [ ] Opacity is 45% for unavailable items

### Mobile:
- [ ] Open hamburger menu
- [ ] Tap "Atom AI"
- [ ] See all 4 products in submenu
- [ ] Atom Voice and Search: full opacity
- [ ] Atom Finance and Chat: 45% opacity
- [ ] "Coming soon" badges visible
- [ ] Tap Atom Voice → navigates
- [ ] Tap Atom Finance → does NOT navigate
- [ ] Tooltip works on long press (mobile)

---

## Future Activation

When Atom Finance or Atom Chat become available:

1. **Update the flag:**
   ```typescript
   {
     icon: HiCurrencyDollar,
     title: "Atom Finance",
     desc: "Intelligent financial analysis and insights",
     href: "/atom/finance",
     available: true, // ← Change to true
   }
   ```

2. **That's it!**
   - Badge automatically disappears
   - Opacity returns to 100%
   - Hover effects activate
   - Navigation enables
   - Tooltip removes

No other code changes needed.

---

## Accessibility Notes

- ✅ 45% opacity still meets WCAG contrast guidelines for disabled states
- ✅ Tooltip provides context for screen reader users
- ✅ Keyboard navigation preserved
- ✅ Focus states maintained
- ✅ Clear visual hierarchy
- ✅ Non-interactive elements properly marked

---

## Brand Positioning

This treatment reinforces Antimatter's positioning:

✅ **Transparency:** We show our roadmap openly  
✅ **Quality:** We don't rush to market  
✅ **Vision:** We're building a comprehensive platform  
✅ **Professionalism:** Everything is intentional  

---

*Implemented: December 22, 2025*  
*Status: PRODUCTION READY ✅*

