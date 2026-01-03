# Elevenified Color Design System

> **Philosophy:** `1 + 1 = 11` - AI + Human = Amplified Intelligence

---

## 🎨 Color Palette

### Backgrounds
```css
--bg-deep-slate: #1A1C20    /* Primary background (eye comfort in low light) */
--bg-rubber: #25282D         /* Surface/card background */
--bg-rubber-light: #2D3138   /* Lighter surface variant */
```

### Foreground/Text
```css
--foreground: #E8E8E8        /* Primary text */
--foreground-muted: #8A8D93  /* Secondary/muted text */
```

---

## 🔴🟢🔵 Semantic Color Coding

### 🟢 Output/Result = Neon Volt (Green)
**Use for:** Amplified results, success states, completed actions, final outputs

```css
--neon-volt: #39FF14
--neon-volt-glow: rgba(57, 255, 20, 0.4)
```

**Example usage:**
- Successful voice capture completion
- Knowledge capture confirmation
- Achievement unlocked states
- "11" result in equations

**CSS Classes:**
```css
.glow-volt {
  box-shadow:
    -4px -4px 10px var(--shadow-highlight),
    6px 6px 15px var(--shadow-dark),
    0 0 30px var(--neon-volt-glow),
    inset 0 0 0 2px var(--neon-volt);
}
```

---

### 🔵 AI/Tech = Synergy Blue
**Use for:** AI processes, automation, tech features, right "1" in logo

```css
--synergy-blue: #00C9FF
```

**Example usage:**
- SOP auto-extraction indicators
- AI processing states
- Semantic search results
- Voice transcription by AI
- Right side of "1 + 1 = 11"

---

### 🟡 Human/Worker = Synergy Gold
**Use for:** Human actions, worker elements, operator inputs, left "1" in logo

```css
--synergy-gold: #FFD700
```

**Example usage:**
- Worker profiles and avatars
- Manual input indicators
- Human expertise highlights
- Leaderboard rankings
- Left side of "1 + 1 = 11"

---

### 🟠 Warning/Caution = Electric Amber
**Use for:** Warnings, pending states, requires attention

```css
--electric-amber: #FFC000
--electric-amber-glow: rgba(255, 192, 0, 0.4)
```

**Example usage:**
- Pending SOP review
- Incomplete captures
- Attention required states

**CSS Classes:**
```css
.glow-amber {
  box-shadow:
    -4px -4px 10px var(--shadow-highlight),
    6px 6px 15px var(--shadow-dark),
    0 0 20px var(--electric-amber-glow),
    inset 0 0 0 1px var(--electric-amber);
}
```

---

### 🔴 Error/Problem = Industrial Red
**Use for:** Errors, critical issues, failures, problems

```css
--industrial-red: #FF3333
--industrial-red-glow: rgba(255, 51, 51, 0.4)
```

**Example usage:**
- Voice capture failed
- System errors
- Validation failures
- Problem indicators in presentations

**CSS Classes:**
```css
.glow-red {
  box-shadow:
    -4px -4px 10px var(--shadow-highlight),
    6px 6px 15px var(--shadow-dark),
    0 0 20px var(--industrial-red-glow),
    inset 0 0 0 1px var(--industrial-red);
}
```

---

### 💫 Synergy = Blue + Gold Combined
**Use for:** AI + Human collaboration, "1 + 1 = 11" concept, unified intelligence

```css
/* Gradient */
.synergy-gradient {
  background: linear-gradient(135deg, var(--synergy-blue), var(--synergy-gold));
}

/* Text gradient */
.synergy-text {
  background: linear-gradient(135deg, var(--synergy-blue), var(--synergy-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Static glow */
.synergy-glow {
  box-shadow:
    0 0 40px rgba(0, 201, 255, 0.3),
    0 0 80px rgba(255, 215, 0, 0.2);
}

/* Animated synergy glow */
.glow-synergy {
  box-shadow:
    -4px -4px 10px var(--shadow-highlight),
    6px 6px 15px var(--shadow-dark),
    0 0 30px rgba(0, 201, 255, 0.3),
    0 0 50px rgba(255, 215, 0, 0.2);
  animation: synergy-pulse 2s ease-in-out infinite;
}
```

**Example usage:**
- "11" logo/icon (combines gold left "1" + blue right "1")
- AI-Human collaboration indicators
- Processing states (AI working with human input)
- Amplified intelligence visualizations

---

## 🎬 Animations

### Volt Pulse (Success)
```css
@keyframes pulse-volt {
  0%, 100% {
    box-shadow: 0 0 20px var(--neon-volt-glow);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px var(--neon-volt-glow);
    transform: scale(1.02);
  }
}
```

### Amber Pulse (Warning)
```css
@keyframes pulse-amber {
  0%, 100% {
    box-shadow: 0 0 15px var(--electric-amber-glow);
  }
  50% {
    box-shadow: 0 0 30px var(--electric-amber-glow);
  }
}
```

### Synergy Pulse (AI+Human)
```css
@keyframes synergy-pulse {
  0%, 100% {
    filter: brightness(1) saturate(1);
    box-shadow: 0 0 20px rgba(0, 201, 255, 0.3), 0 0 40px rgba(255, 215, 0, 0.2);
  }
  50% {
    filter: brightness(1.2) saturate(1.2);
    box-shadow: 0 0 40px rgba(0, 201, 255, 0.5), 0 0 80px rgba(255, 215, 0, 0.4);
  }
}
```

---

## 🎯 Usage Rules

### DO ✅
- **Use CSS variables** from `globals.css` instead of hardcoded hex values
- **Follow semantic meaning**: Green = output, Blue = AI, Gold = human, Red = error
- **Use glow effects** for interactive/important elements
- **Combine Blue + Gold** for synergy/collaboration concepts
- **Reference this doc** when adding new colored elements

### DON'T ❌
- **Don't hardcode colors** - always use CSS variables
- **Don't mix semantics** - e.g., don't use red for success
- **Don't use random colors** - stick to the defined palette
- **Don't forget glows** - they're part of the industrial aesthetic

---

## 📦 Tailwind Integration

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      'neon-volt': '#39FF14',
      'synergy-blue': '#00C9FF',
      'synergy-gold': '#FFD700',
      'electric-amber': '#FFC000',
      'industrial-red': '#FF3333',
    }
  }
}
```

This enables:
- `text-neon-volt`
- `bg-synergy-blue`
- `border-synergy-gold`
- etc.

---

## 🖼️ "11" Logo/Icon Color Coding

```
  1  ⚡  1  =  11
 Gold   Blue   Green

 Human + AI = Amplified Intelligence
```

- **Left "1":** Gold (#FFD700) - Human
- **Right "1":** Blue (#00C9FF) - AI
- **Lightning bolt:** Green (#39FF14) - Amplified output
- **Icon glow:** Synergy (Blue + Gold combined)

---

## 📚 Reference Files

- **Source:** `Frontend/app/globals.css`
- **Implementation:** All `.tsx` components should import from globals
- **Presentation:** `working doc/presentation_slides.html` (should match this system)

---

## 🔍 Verification

To check for color coding violations:

```bash
# Find hardcoded hex colors in components
cd Frontend
grep -r "#[0-9A-Fa-f]\{6\}" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules

# Should only find colors in globals.css and config files
```

---

**Last Updated:** 2026-01-01  
**Maintained by:** Elevenified Design Team
