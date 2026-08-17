---
name: Luminous Fluidity
colors:
  surface: '#12121d'
  surface-dim: '#12121d'
  surface-bright: '#383845'
  surface-container-lowest: '#0d0d18'
  surface-container-low: '#1b1a26'
  surface-container: '#1f1e2a'
  surface-container-high: '#292935'
  surface-container-highest: '#343440'
  on-surface: '#e3e0f1'
  on-surface-variant: '#cdc3d3'
  inverse-surface: '#e3e0f1'
  inverse-on-surface: '#302f3b'
  outline: '#978d9d'
  outline-variant: '#4b4451'
  surface-tint: '#dab8ff'
  primary: '#dab8ff'
  on-primary: '#46097e'
  primary-container: '#c38fff'
  on-primary-container: '#521d8a'
  inverse-primary: '#7745af'
  secondary: '#9bcbff'
  on-secondary: '#003256'
  secondary-container: '#3196e6'
  on-secondary-container: '#002c4b'
  tertiary: '#f8acff'
  on-tertiary: '#570066'
  tertiary-container: '#e085ec'
  on-tertiary-container: '#671077'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#efdbff'
  primary-fixed-dim: '#dab8ff'
  on-primary-fixed: '#2b0053'
  on-primary-fixed-variant: '#5e2a96'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#9bcbff'
  on-secondary-fixed: '#001d34'
  on-secondary-fixed-variant: '#004a7a'
  tertiary-fixed: '#ffd6fe'
  tertiary-fixed-dim: '#f8acff'
  on-tertiary-fixed: '#350040'
  on-tertiary-fixed-variant: '#731f82'
  background: '#12121d'
  on-background: '#e3e0f1'
  surface-variant: '#343440'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The design system is anchored in a "Dreamy Minimalism" aesthetic, designed to make the utility of media downloading feel like an immersive, premium experience rather than a chore. It targets digitally native users who value both high-end aesthetics and seamless functionality.

The visual language utilizes **Glassmorphism** and **Soft-Focus Surrealism**. Surfaces are not solid; they are translucent frosted layers that allow vibrant, shifting background "auroras" to peek through. The emotional response is intended to be one of calm, effortless power—lightweight and fluid, like water. 

Key stylistic pillars:
- **Atmospheric Depth:** Using background blurs and nested transparency to create a sense of three-dimensional space.
- **Etherial Glow:** Interactive elements emit a soft outer glow rather than harsh drop shadows.
- **Fluid Motion:** Transitions should feel organic, using ease-in-out-expo curves to mimic natural movement.

## Colors

The palette is built for a deep **Dark Mode** environment. The foundation is a rich, midnight navy-black (`#0F0F1A`), which provides the necessary contrast for the vibrant "Dreamer" gradients.

- **Primary (Lucid Violet):** Used for main action buttons and active states. It represents the "Dreamer" energy.
- **Secondary (Sky Stream):** Used for progress indicators, download status, and secondary links.
- **Tertiary (Sunset Mist):** Used sparingly for accents, notifications, or "Success" states to add warmth.
- **Gradients:** The primary UI signature is a linear gradient from `primary` to `secondary` at a 135-degree angle.

All glass surfaces should use a white stroke at 10% opacity to define edges against the dark background.

## Typography

This design system uses **Plus Jakarta Sans** for headlines to provide a friendly, modern, and slightly rounded character that fits the "dreamy" theme. **Manrope** is used for body and functional labels due to its exceptional legibility and balanced geometric construction.

Typography should be treated with a clear hierarchy. Large headlines use tighter letter-spacing to feel impactful, while functional labels use increased tracking (5%) to ensure readability against translucent backgrounds. Use "White-Alpha-90" for primary text and "White-Alpha-60" for secondary/deemphasized text to maintain the soft aesthetic.

## Layout & Spacing

The layout follows a **Fluid Grid** logic optimized for mobile-first utility. We use an 8px baseline rhythm to ensure vertical harmony.

- **Margins:** Standard mobile views use a 20px horizontal margin (`container-padding`).
- **Grouping:** Related elements (like a video preview and its metadata) use `sm` (12px) spacing. Distinct sections use `lg` (40px) to maintain the airy, "weightless" feel.
- **Safe Areas:** Ensure all critical actions are within the thumb-zone (bottom 40% of the screen), as this is a high-utility download app.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Translucency** and **Backdrop Blurs** rather than traditional shadows.

- **Level 0 (Background):** Solid `#0F0F1A` with subtle animated radial gradients of Purple and Blue in the corners.
- **Level 1 (Default Surface):** 40% opacity white with a 20px background blur. Used for list items and cards.
- **Level 2 (Floating/Active):** 60% opacity white with a 40px background blur and a 1px solid white border at 15% opacity. Used for modals and navigation bars.
- **Level 3 (Primary Actions):** Saturated gradients with a soft outer glow (15px blur, 30% opacity of the primary color) to indicate "Lift."

## Shapes

The shape language is **Soft and Organic**. Sharp corners are avoided to maintain the friendly, premium feel. 

- **Cards & Inputs:** Use the `rounded-lg` (16px) setting to create a modern, containerized look.
- **Buttons:** Primary "Download" buttons should use `rounded-xl` (24px) or full pill-shape to differentiate them from static content containers.
- **Icons:** Use a 2px stroke weight with rounded caps and joins to match the typography.

## Components

### Buttons
- **Primary:** Full gradient (Violet to Sky), white text, pill-shaped. Add a subtle glow on active states.
- **Secondary:** Glass-morphic (20% white fill, 40px blur) with a thin white border.

### Input Fields
- Dark, translucent backgrounds (10% white). 
- Active state: Border transitions to the Primary Violet color with a soft inner glow.
- Placeholder text: White-Alpha-40.

### Cards (Video Items)
- Background: 15% white fill with 20px backdrop blur.
- Corner radius: 16px.
- Include a small "Glass" tag for file size or platform source (e.g., "1080p", "Instagram").

### Progress Bars
- Background: Deep charcoal (solid).
- Fill: Linear gradient (Sky Stream to Lucid Violet).
- Animation: Subtle "shimmer" effect moving across the gradient as it fills.

### Bottom Navigation
- Highly translucent glass bar (60% blur).
- Active icon: Tinted with Primary Violet and a small dot indicator below.
- Non-active icons: White-Alpha-50.

### Selection (Checkboxes/Radios)
- Custom circular designs. When checked, they fill with the Primary gradient and a white checkmark.