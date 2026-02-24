# Digital Coffee - Design System

## Brand Concept

Digital Coffee combines the ritual of coffee with modern neuroscience - using binaural beats to enhance creativity (alpha waves) and focus (beta waves). The design should feel:
- **Warm yet modern** - Like a perfect cup of coffee
- **Scientific yet accessible** - Brain enhancement made simple
- **Calm yet energizing** - Balance of relaxation and alertness

---

## Color Palette

### Primary Colors

#### Coffee Gradient (Primary Brand Colors)
```
Espresso Brown:    #2C1810  (Deep, rich coffee)
Coffee Brown:      #6F4E37  (Main brand color - coffee brown)
Cappuccino:        #9B6B4E  (Medium coffee tone)
Latte:             #C19A6B  (Light coffee accent)
```

#### Wave Colors (Feature Accent Colors)

**Alpha Wave (Creativity)**
```
Alpha Primary:     #6B46C1  (Deep purple - creative, calm)
Alpha Light:       #9F7AEA  (Light purple accent)
Alpha Glow:        #D6BCFA  (Soft purple highlight)
```

**Beta Wave (Focus)**
```
Beta Primary:      #2B6CB0  (Deep blue - focused, alert)
Beta Light:        #4299E1  (Light blue accent)
Beta Glow:         #BEE3F8  (Soft blue highlight)
```

### Neutral Colors

```
Background Dark:   #0F0E0D  (Almost black - dark mode primary)
Background:        #1A1816  (Dark brown-gray)
Surface:           #2D2823  (Elevated surface)
Border:            #3D3732  (Subtle borders)

Text Primary:      #F7FAFC  (Almost white)
Text Secondary:    #E2E8F0  (Light gray)
Text Muted:        #A0AEC0  (Muted text)
Text Disabled:     #718096  (Disabled state)
```

### Semantic Colors

```
Success:           #38A169  (Green - session complete)
Warning:           #DD6B20  (Orange - warnings)
Error:             #E53E3E  (Red - errors)
Info:              #3182CE  (Blue - information)
```

---

## Logo Design

### Logo Concept

**"ÐC" Monogram with Sound Wave**

The logo combines:
- **Ð** (Eth symbol - resembles a coffee cup with steam)
- **C** (for Coffee)
- **Sound wave pattern** integrated into the design
- **Brain wave visualization** as secondary element

### Logo Variations

#### Primary Logo (Dark Background)
```
┌─────────────────────┐
│                     │
│     ∿∿∿  ∿∿∿        │  <- Sound waves (binaural beats)
│    ⟨  ÐC  ⟩         │  <- Monogram in coffee brown gradient
│    ‾‾‾‾‾‾‾‾         │  <- Base (coffee cup bottom)
│                     │
│  DIGITAL COFFEE     │  <- Wordmark
│                     │
└─────────────────────┘
```

#### Icon Only (App Icon)
```
Circular app icon with:
- Gradient background (Espresso → Coffee Brown)
- White "ÐC" monogram
- Subtle sound wave pattern overlay
- Purple/Blue glow for Alpha/Beta modes
```

### Typography

#### Primary Font Family
```
Headings:  Inter (Bold, ExtraBold)
Body:      Inter (Regular, Medium)
Accent:    Inter (SemiBold)
Mono:      JetBrains Mono (for stats/numbers)
```

#### Type Scale
```
Display:     32px / 40px (line height)
H1:          28px / 36px
H2:          24px / 32px
H3:          20px / 28px
Body Large:  18px / 28px
Body:        16px / 24px
Body Small:  14px / 20px
Caption:     12px / 16px
```

---

## Component Styles

### Buttons

#### Primary Button (Coffee Brown)
```css
background: linear-gradient(135deg, #6F4E37, #9B6B4E)
text: #FFFFFF
padding: 16px 32px
borderRadius: 12px
shadow: 0 4px 12px rgba(111, 78, 55, 0.3)
```

#### Wave Buttons (Alpha/Beta)
```css
Alpha:
  background: linear-gradient(135deg, #6B46C1, #9F7AEA)
  glow: 0 0 24px rgba(107, 70, 193, 0.4)

Beta:
  background: linear-gradient(135deg, #2B6CB0, #4299E1)
  glow: 0 0 24px rgba(43, 108, 176, 0.4)
```

### Cards

```css
background: #2D2823
borderRadius: 16px
padding: 20px
border: 1px solid #3D3732
shadow: 0 8px 24px rgba(0, 0, 0, 0.3)
```

### Audio Player

```css
background: linear-gradient(180deg, #2D2823, #1A1816)
borderRadius: 24px
padding: 24px
glow: 0 0 48px [Alpha/Beta color with 20% opacity]
```

### Progress Indicators

```css
track: #3D3732
fill: linear-gradient(90deg, [wave color primary], [wave color light])
height: 6px
borderRadius: 3px
```

---

## Screen Layouts

### Spacing System

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### Border Radius

```
sm:  8px   (small cards, inputs)
md:  12px  (buttons, medium cards)
lg:  16px  (large cards)
xl:  24px  (player, special components)
full: 9999px (circular elements)
```

### Shadows

```css
sm:   0 2px 4px rgba(0, 0, 0, 0.1)
md:   0 4px 8px rgba(0, 0, 0, 0.15)
lg:   0 8px 16px rgba(0, 0, 0, 0.2)
xl:   0 12px 24px rgba(0, 0, 0, 0.25)
glow: 0 0 24px [color with 40% opacity]
```

---

## Animation Guidelines

### Timing Functions

```
fast:     200ms ease-out
normal:   300ms ease-in-out
slow:     500ms ease-in-out
wave:     1000ms ease-in-out (breathing effect)
```

### Animations

#### Button Press
```
scale: 0.95
duration: 200ms
```

#### Card Appear
```
opacity: 0 → 1
translateY: 20px → 0
duration: 300ms
```

#### Wave Pulse (Audio Playing)
```
scale: 1 → 1.05 → 1
opacity: 0.8 → 1 → 0.8
duration: 2000ms
infinite loop
```

#### Session Timer
```
Circular progress with gradient stroke
Rotate: 360deg
duration: session length
easing: linear
```

---

## Dark Mode (Default)

Digital Coffee uses dark mode by default to:
- Reduce eye strain during audio sessions
- Enhance focus and immersion
- Make wave colors (purple/blue) more vibrant
- Create a calming, zen-like atmosphere

All colors above are optimized for dark backgrounds.

---

## Accessibility

### Minimum Contrast Ratios

```
Large text (18px+):  3:1
Normal text:         4.5:1
Interactive elements: 3:1
```

### Touch Targets

```
Minimum: 44x44 px
Preferred: 48x48 px
```

### Color Independence

- Never rely on color alone for information
- Use icons + text + color together
- Provide text alternatives for wave types

---

## Implementation Notes

### React Native Components

```javascript
// Theme object structure
export const theme = {
  colors: {
    coffee: {
      espresso: '#2C1810',
      brown: '#6F4E37',
      cappuccino: '#9B6B4E',
      latte: '#C19A6B',
    },
    alpha: {
      primary: '#6B46C1',
      light: '#9F7AEA',
      glow: '#D6BCFA',
    },
    beta: {
      primary: '#2B6CB0',
      light: '#4299E1',
      glow: '#BEE3F8',
    },
    // ... other colors
  },
  spacing: { /* ... */ },
  typography: { /* ... */ },
  shadows: { /* ... */ },
};
```

---

## Brand Voice

- **Friendly but focused** - "Your brain's best companion"
- **Scientific but simple** - "Neuroscience made accessible"
- **Encouraging but calm** - "Enhance your flow"

### Example Copy

```
Tagline: "Brew Your Best Thoughts"
Subheadline: "Binaural beats for creativity and focus"

Alpha Mode: "Enter creative flow"
Beta Mode: "Sharpen your focus"

Session Complete: "Flow state achieved"
Streak Milestone: "You're on fire! 7-day streak"
```

---

This design system should be implemented across all screens and components for a consistent, premium user experience.
