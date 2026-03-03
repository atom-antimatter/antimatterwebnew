# Antimatter AI — Brand & Styling Guide

Use this guide to match the Antimatter AI brand in any project.

---

## 1. Color Palette

### Core Colors (CSS Custom Properties)

| Token          | Hex       | Usage                                      |
|----------------|-----------|---------------------------------------------|
| `--background` | `#020202` | Page background, dark surfaces              |
| `--foreground` | `#f6f6fd` | Primary text, headings                      |
| `--accent`     | `#696aac` | Primary brand purple, buttons, highlights   |
| `--primary`    | `#3e3f7e` | Deep purple, gradients                      |
| `--secondary`  | `#a2a3e9` | Lighter purple, links, hover states         |
| `--tertiary`   | `#c7c8f2` | Lightest purple, subtle accents             |
| `--lightaccent`| `#e3e3f8` | Very light purple, badges                   |

### Functional Palette

| Use Case          | Color                              |
|-------------------|------------------------------------|
| Backgrounds       | `#020202` (near-black)             |
| Card surfaces     | `rgba(foreground, 0.03)` or `rgba(foreground, 0.05)` |
| Card borders      | `rgba(foreground, 0.10)`           |
| Muted text        | `rgba(foreground, 0.50)` to `0.65` |
| Links             | `#a2a3e9` (secondary)              |
| Success/positive  | Tailwind `green-400` / `green-500` |
| Warning           | Tailwind `yellow-400` / `yellow-500` |
| Error/urgent      | Tailwind `red-400` / `red-500`     |
| White text on dark| `#f6f6fd` (foreground)             |

### Button Gradient (Primary CTA — Pill Button)

```css
background: linear-gradient(93.92deg, #8587e3 -13.51%, #4c4dac 40.91%, #696aac 113.69%);
box-shadow: 0px 0px 10px #696aac, inset 0px 0px 2px rgba(255, 255, 255, 0.61);
border-radius: 40px;
```

Hover state:
```css
box-shadow: 0px 0px 25px #696aac, inset 0px 0px 6.69843px rgba(255, 255, 255, 0.9);
```

### Inverted Button Variant

```css
background: transparent;
border: 2px solid #8587e3;
color: #8587e3;
box-shadow: 0px 0px 10px rgba(105, 106, 172, 0.3);
```

---

## 2. Typography

### Font Family

**Plus Jakarta Sans** — Google Font, loaded via `next/font/google`

```typescript
import { Plus_Jakarta_Sans } from "next/font/google";
const font = Plus_Jakarta_Sans({ subsets: ["latin"] });
```

Fallback stack: `Arial, Helvetica, sans-serif`

### Type Scale (Tailwind Classes)

| Element               | Mobile              | Desktop                    |
|-----------------------|---------------------|----------------------------|
| Hero H1               | `text-5xl`          | `text-7xl` to `text-8xl`  |
| Section headings      | `text-3xl`          | `text-4xl` to `text-5xl`  |
| Card titles           | `text-xl`           | `text-2xl`                 |
| Body text             | `text-base` (16px)  | `text-lg` (18px)           |
| Small/caption         | `text-sm` (14px)    | `text-sm`                  |
| Labels/overlines      | `text-xs` (12px)    | `text-xs` uppercase        |

### Font Weights

| Weight       | Usage                          |
|--------------|--------------------------------|
| `font-bold`  | Hero headings, page titles     |
| `font-semibold` | Section headings, card titles |
| `font-medium`| CTAs, subheadings              |
| `font-light` | Body text, descriptions        |

### Tracking

- Hero headings: `tracking-tighter` or `tracking-tight`
- Body text: `tracking-tight` or default
- Overlines/labels: `tracking-wider` uppercase

---

## 3. Spacing & Layout

### Container Width

```css
--w-main: 1500px;  /* Desktop max-width */

/* Responsive overrides */
@media (max-width: 1536px) { --w-main: calc(100% - 60px); }
@media (max-width: 640px)  { --w-main: calc(100% - 40px); }
```

Applied via: `className="w-main mx-auto"`

### Page Padding

- Top (with navbar): `pt-28 md:pt-32` or `pt-32 mobile:pt-52 md:pt-60`
- Bottom: `pb-10` to `pb-32` depending on context
- Horizontal: `px-6 lg:px-10` or via `w-main`

### Section Spacing

- Between sections: `py-16 md:py-32` or `py-20 sm:py-40`
- Within sections: `gap-6` to `gap-8`

### Breakpoints

| Name     | Width   | Usage                        |
|----------|---------|------------------------------|
| `xs`     | 350px   | Very small mobile            |
| `mobile` | 512px   | Mobile                       |
| `sm`     | 640px   | Tailwind default             |
| `md`     | 768px   | Tablet                       |
| `lg`     | 1024px  | Desktop                      |
| `xl`     | 1280px  | Large desktop                |
| `2xl`    | 1536px  | Extra large                  |
| `wide`   | 2060px  | Ultra-wide                   |

---

## 4. Component Patterns

### Action Button (Pill with Arrow Circle)

The signature CTA pattern: rounded button with text + circular icon badge.

```jsx
<Link
  href="/contact"
  className="group inline-flex items-center justify-center gap-3 rounded-md bg-white py-3 pl-5 pr-3 font-medium text-black shadow-lg transition-all duration-500 ease-out hover:rounded-[50px] hover:shadow-xl sm:w-auto"
>
  <span>Button Text</span>
  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-300 group-hover:scale-110">
    <ArrowIcon className="h-5 w-5" />
  </span>
</Link>
```

Variants:
- **White on dark**: `bg-white text-black` + `bg-black text-white` circle
- **Accent**: `bg-accent text-black` + `bg-white text-black` circle
- **Black on light**: `bg-black text-white` + `bg-white text-black` circle

Key behaviors:
- `hover:rounded-[50px]` — transitions from `rounded-md` to pill shape
- `group-hover:scale-110` — icon badge scales up on hover
- `duration-500 ease-out` — smooth transition timing

### Card Pattern

```jsx
<div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-6 hover:border-foreground/20 transition-colors">
  {/* content */}
</div>
```

Alternate (slightly more visible):
```jsx
<div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8">
```

### Glass/Blur Card

```jsx
<div className="bg-gradient-to-br from-foreground/5 to-foreground/10 backdrop-blur-sm border border-foreground/10 rounded-xl p-6">
```

### Score Ring (SVG)

Used for metrics (0-100). SVG circle with animated `strokeDashoffset`:
- Track: `text-foreground/10` stroke
- Fill: colored stroke (green/yellow/red based on score)
- Center: score number + `/100` label

### Expandable Section

```jsx
<button className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-foreground/5 transition-colors">
  <h3 className="text-sm font-semibold">{title}</h3>
  <ChevronIcon />
</button>
```

Animated with Framer Motion `AnimatePresence` + `height: "auto"`.

### Topic/Tag Pills

```jsx
<span className="px-2.5 py-1 bg-accent/15 text-accent text-xs rounded-full">
  {topic}
</span>
```

### Selection Chips (Multi-select)

```jsx
<button className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
  selected ? "bg-accent text-black" : "bg-foreground/5 hover:bg-foreground/10"
}`}>
  {label}
</button>
```

---

## 5. Animation Patterns

### Framework: Framer Motion (`motion/react`)

### Standard Easing

```typescript
const easeOut = [0.16, 1, 0.3, 1] as const;
```

### Reveal on Scroll

```jsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, delay: index * 0.1, ease: easeOut }}
>
```

### Stagger Children

```jsx
transition={{ duration: 0.6, delay: index * 0.1, ease: easeOut }}
```

### Page Transitions

Full-screen accent-colored overlay that slides up/down:
- `setIsTransition(true)` — triggers cover
- `setIsTransition(false)` — reveals page
- Duration: 0.75s with cubic bezier `[0.76, 0, 0.24, 1]`

### Hover Scale

```jsx
whileHover={{ scale: 1.01 }}  // subtle for cards
whileHover={{ y: -4 }}         // lift effect for pricing cards
group-hover:scale-110          // for icon badges
```

---

## 6. Dark UI Conventions

- **Never use pure white backgrounds** for page sections — use `bg-background` (#020202)
- **Card backgrounds**: `bg-foreground/[0.03]` (almost invisible) or `bg-foreground/5` (subtle)
- **Borders**: `border-foreground/10` standard, `border-foreground/20` on hover
- **Muted text**: `text-foreground/50` for labels, `text-foreground/65` for descriptions
- **Dividers**: `border-foreground/10` or `border-foreground/15`
- **Input fields**: `bg-foreground/5 border border-foreground/10` with `focus:ring-2 focus:ring-accent/50`
- **Scrollbar**: Hidden by default (`scrollbar-hide` utility)

---

## 7. Logo Usage

- **Primary logo**: SVG wordmark at `/images/antimatter-ai-logo.svg`
- **Logo dimensions**: `w-36 lg:w-40 h-auto`
- **Favicon**: `/icon.svg` (SVG format)
- **Company name**: Always "Antimatter AI" (two words, space between)

---

## 8. Chat Interface Pattern

- **Header**: Branded avatar (accent bg + initials) + title + "Powered by" subtitle
- **User bubbles**: `bg-white text-black rounded-xl rounded-br-sm`
- **Assistant bubbles**: `bg-foreground/10 rounded-xl rounded-bl-sm`
- **Input**: Borderless textarea with circular accent send button
- **Suggested prompts**: `bg-foreground/5 hover:bg-accent hover:text-black border border-foreground/10 rounded-lg`
- **Loading**: "Thinking..." text with animated dots or pulse

---

## 9. Navigation Pattern

### Desktop Navbar
- Fixed top, hides on scroll down, shows on scroll up
- Gradient background when scrolled: `bg-gradient-to-b from-background to-transparent`
- Dropdown menus: `bg-zinc-950 border border-foreground/20 rounded-xl`
- ESC closes dropdowns, `aria-expanded` for accessibility

### Mobile Menu
- Slide-in from right (320px max-width)
- Dark overlay backdrop
- Step navigation for sub-menus (Services, Atom AI)
- Body scroll locked when open

### Footer
- Sections: Services, Atom, Demos, Resources
- Email + LinkedIn link
- Atlanta clock (live)
- Purple gradient glow at bottom: `bg-primary blur-3xl scale-150`

---

## 10. Tailwind Config Tokens

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-tertiary: var(--tertiary);
  --color-accent: var(--accent);
  --color-lightaccent: var(--lightaccent);
  --container-main: var(--w-main);
}
```

Usage in Tailwind classes: `bg-accent`, `text-foreground`, `border-primary`, etc.

---

## Quick Reference: Copy-Paste CSS Variables

```css
:root {
  --background: #020202;
  --foreground: #f6f6fd;
  --accent: #696aac;
  --primary: #3e3f7e;
  --secondary: #a2a3e9;
  --tertiary: #c7c8f2;
  --lightaccent: #e3e3f8;
}
```
