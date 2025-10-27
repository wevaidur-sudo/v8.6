# ParāSara-X - Design Guidelines

## Design Approach

**Professional Vedic Astrology Software with Parashara's Light 9 Precision**

Primary design inspiration from Parashara's Light 9 and professional astronomy applications, combined with traditional Vedic sacred geometry. ParāSara-X uses circular chart displays (similar to Western and Parashara's Light 9 style) rather than traditional North/South Indian chart formats, providing a universally recognized professional presentation that matches desktop astrology software standards.

**Core Principles:**
- Dark cosmic backgrounds representing the infinite universe
- Sacred geometry patterns (Sri Yantra, Flower of Life, mandalas) as subtle decorative elements
- Gold/amber accents symbolizing celestial bodies and divine knowledge
- Premium glassmorphism for depth and sophistication
- Professional data visualization for complex astrological calculations

---

## Color Palette

**Dark Mode Foundation (Primary Theme):**
- Background Base: `222 25% 8%` - Deep cosmic black with subtle warmth
- Surface Layer: `222 20% 12%` - Elevated card/panel backgrounds
- Surface Elevated: `222 18% 16%` - Highest elevation (modals, dropdowns)

**Accent Colors:**
- Primary Gold: `45 95% 65%` - Celestial gold for primary actions, highlights
- Secondary Amber: `35 85% 55%` - Warm amber for secondary elements
- Cosmic Purple: `260 60% 65%` - Deep space purple for special highlights
- Sacred Teal: `180 45% 55%` - Mystical teal for informational elements

**Semantic Colors:**
- Success (Benefic): `142 70% 50%` - Auspicious green
- Warning (Neutral): `35 85% 55%` - Amber warning
- Danger (Malefic): `0 70% 60%` - Inauspicious red
- Info (Planetary): `220 80% 65%` - Cosmic blue

**Text Hierarchy:**
- Primary Text: `45 20% 95%` - Near white with warm tint
- Secondary Text: `45 10% 70%` - Muted for supporting content
- Tertiary Text: `45 8% 50%` - Subtle for labels

---

## Typography

**Font Families:**
- Headings: 'Cinzel' (serif, Vedic elegance) via Google Fonts
- Body: 'Inter' (sans-serif, modern readability) via Google Fonts
- Data/Numbers: 'JetBrains Mono' (monospace, precise calculations)

**Type Scale:**
- Hero Title: text-6xl font-serif (Cinzel) - Chart titles, main headings
- Section Heading: text-3xl font-serif - Major section breaks
- Subsection: text-xl font-sans font-semibold - Component headers
- Body Large: text-base font-sans - Primary content
- Body: text-sm font-sans - Standard text
- Caption: text-xs font-sans - Labels, metadata
- Data Display: text-sm font-mono - Degrees, coordinates, calculations

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Card margins: gap-6 or gap-8
- Inline elements: space-x-2 to space-x-4

**Container Strategy:**
- Max width: max-w-7xl for main content
- Form containers: max-w-2xl for input sections
- Chart display: Full width with responsive grid

**Grid Patterns:**
- Chart Display: 2-column on lg+ (chart visualization | interpretation)
- Dashboard: 3-column grid for planetary data cards
- Reports: Single column with max-w-4xl for readability

---

## Component Library

### Navigation
- Sticky top navigation with glassmorphic background (backdrop-blur-md bg-surface/80)
- Logo with golden Sri Yantra icon + "Bhrigu Chakra" wordmark in Cinzel
- Minimal navigation: Home, Calculate Kundli, Saved Charts, Learn

### Hero Section (Homepage)
- Full viewport height (min-h-screen) with cosmic gradient background
- Large cosmic imagery: Deep space nebula or star field as background
- Centered content: Heroic title "Bhrigu Chakra" + tagline "Gold Standard Vedic Astrology for the Modern Age"
- Primary CTA: Large gold button "Generate Your Kundli"
- Secondary element: Trust indicator "Accuracy of Parashara Light 9"
- Subtle animated stars or constellation lines in background

### Kundli Input Form
- Glassmorphic card with backdrop-blur-lg
- Clean form fields with golden focus rings
- Date/Time pickers with cosmic styling
- City search with autocomplete dropdown (sacred geometry divider lines)
- Coordinate display in monospace font
- Gender selection with icon buttons
- Generate button: Primary gold with subtle glow effect

### Chart Display Cards
- Dark elevated surface with subtle border glow
- North/South Indian chart styles as SVG with golden lines
- Zodiac signs in traditional Sanskrit symbols
- Planetary glyphs in amber/gold colors
- House divisions with sacred geometry aesthetic
- Toggle between chart styles with segmented control

### Planetary Data Tables
- Grid of cards showing each planet
- Icon + Planet name + degree position (monospace)
- Dignity badges: Exalted (green), Debilitated (red), Own Sign (gold)
- Strength meters using gradient fills
- Retrograde indicator with special cosmic symbol

### Interpretation Sections
- Accordion-style expandable sections with golden dividers
- House-by-house analysis with sacred number glyphs (1-12)
- Yoga detection cards with premium badges
- Dasha timeline as visual timeline with golden milestones
- Remedy suggestions in highlighted boxes with mantra text in Devanagari

### Remedial Elements
- Gemstone recommendations with gem icons and color accents
- Mantra cards with Sanskrit text and phonetic transliteration
- Yantra visualization with geometric patterns
- Behavioral guidance in clean list format

### Export/Download
- PDF generation button with download icon
- Save chart to browser localStorage with bookmark icon
- Share functionality (future consideration)

---

## Sacred Geometry Integration

**Decorative Patterns (Subtle, Non-Intrusive):**
- Sri Yantra as watermark on hero section (opacity: 0.05)
- Flower of Life patterns as section dividers (stroke in gold at 20% opacity)
- Mandala motifs in card corners (very subtle, 10% opacity)
- Zodiac wheel as background element for chart displays
- Constellation line patterns connecting navigation elements

**Implementation:** Use SVG patterns embedded in CSS or inline, never generate complex custom SVGs

---

## Animation Strategy

**Minimal, Purposeful Animations:**
- Page transitions: Subtle fade-in (0.3s ease)
- Hero stars: Gentle twinkling effect using CSS keyframes
- Form validation: Shake animation on error (0.4s)
- Chart loading: Circular golden progress indicator
- Accordion expand: Smooth height transition (0.3s)
- Avoid parallax, heavy scroll animations, or distracting effects

---

## Accessibility & Dark Mode

**Consistent Dark Implementation:**
- All form inputs: Dark backgrounds (bg-surface) with golden borders on focus
- Text fields maintain high contrast (95% lightness text on 12% background)
- Dropdown menus: Match surface elevated color
- Buttons: Sufficient contrast ratios for gold on dark (>4.5:1)

**Focus States:**
- Golden ring (ring-2 ring-primary) for keyboard navigation
- Skip to main content link for screen readers

---

## Images

**Hero Section:**
- Large hero image: Deep space nebula (Hubble/Webb telescope style) - vibrant purples, blues, golds
- Full-width background, overlay with dark gradient (from transparent to background-base)
- Alternative: Cosmic mandala visualization blending astronomy with sacred geometry

**Decorative Images:**
- Planetary icons: Use icon library (Material Symbols) for consistency
- Zodiac symbols: SVG glyphs from established Vedic astrology icon sets
- No photography of people - maintain mystical, cosmic atmosphere

---

## Responsive Behavior

**Breakpoints:**
- Mobile (base): Single column, stacked charts, full-width cards
- Tablet (md): 2-column where appropriate, side-by-side form fields
- Desktop (lg): Full grid layouts, side-by-side chart + interpretation
- Wide (xl): Max container width maintained, more generous spacing

**Mobile Optimizations:**
- Bottom sheet modals for chart selection
- Horizontal scroll for planetary data (snap-x snap-mandatory)
- Collapsible navigation drawer
- Larger touch targets (min-h-12) for buttons

---

This design creates a premium, mystical yet professional experience that honors Vedic tradition while delivering modern usability - positioning Bhrigu Chakra as the definitive web-based Vedic astrology application.