---
name: Aura Editorial
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#615e59'
  on-secondary: '#ffffff'
  secondary-container: '#e7e2db'
  on-secondary-container: '#67645f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e7e2db'
  secondary-fixed-dim: '#cbc6bf'
  on-secondary-fixed: '#1d1b17'
  on-secondary-fixed-variant: '#494642'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-lg: 4rem
  stack-md: 2rem
  stack-sm: 1rem
---

## Brand & Style
The design system is rooted in the intersection of high-fashion editorial aesthetics and modern digital utility. It targets a sophisticated audience that values curation, clarity, and premium lifestyle content. 

The visual style is **Minimalist / Luxury**, characterized by expansive white space, a strictly controlled color palette, and a focus on high-quality imagery. It draws inspiration from Apple’s structural precision, Medium’s focus on long-form readability, and Pinterest’s immersive content discovery. The emotional response should be one of "quiet luxury"—calm, authoritative, and expensive without being gaudy.

## Colors
The palette is intentionally monochromatic with a warm organic counterpoint. 

- **Primary Accent (#000000):** Used for critical actions, branding, and high-impact headlines to provide grounding.
- **Secondary Accent (#F5EFE8):** A soft beige used for background sections or category tags to soften the high-contrast black and white.
- **Surface & Background:** The primary canvas is pure white (#FFFFFF). The secondary background (#F8F8F8) is reserved for layout differentiation, such as sidebar containers or decorative breaks.
- **Text:** Deep charcoal (#1A1A1A) ensures maximum readability without the harshness of pure black, while subtle grey (#666666) handles metadata and secondary information.

## Typography
This design system employs a dual-typeface strategy to balance modern tech with literary prestige.

- **Headlines (Plus Jakarta Sans):** Geometric and bold. Larger sizes use tight letter-spacing for a modern, impactful "Apple-style" look.
- **Body (Source Serif 4):** A highly legible serif that evokes the comfort of reading a prestige magazine or Medium article. It features generous line heights to prevent visual fatigue.
- **Labels & UI:** Small caps and increased letter spacing are used for metadata to provide a functional, structured contrast to the fluid body text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for editorial precision. 

- **Masonry Grid:** Content discovery pages utilize a multi-column masonry layout (Pinterest-style). Column counts should shift from 4 on desktop to 2 on tablet and 1 on mobile.
- **Article Layout:** A centered, narrow reading column (approx 720px) is used for long-form content to optimize eye tracking.
- **Rhythm:** Generous vertical spacing (`stack-lg`) is used between sections to allow content to "breathe," reinforcing the premium minimalist aesthetic. 
- **Gutters:** Standard 24px gutters ensure content remains distinct while maintaining a tight, professional rhythm.

## Elevation & Depth
Depth is signaled through **Tonal Layers** and **Ambient Shadows** rather than heavy gradients.

- **Soft Shadows:** Elements like cards use an extremely diffused shadow (e.g., `0 10px 30px rgba(0,0,0,0.04)`) to appear as if they are resting lightly on the surface.
- **Interactivity:** On hover, cards should subtly lift (increased shadow depth) and images should slightly zoom (1.05x) within their clipped containers to provide tactile feedback.
- **Notion-Style UI:** Admin and functional interfaces should remain flat, using light-grey borders (1px) and #F8F8F8 backgrounds to distinguish panels rather than shadows.

## Shapes
The shape language is refined and organic. 

Standard components (buttons, input fields) use a 0.5rem (8px) radius to feel modern and accessible. Large cards and imagery in the masonry grid use a more pronounced 1rem (16px) radius to mimic the premium, friendly feel of mobile OS interfaces. All interactive elements should maintain consistent corner radii to ensure a unified visual vocabulary.

## Components
- **Primary Buttons:** Solid black background with white text. Padding is set to `px-6 py-3`. Hover state involves a subtle vertical lift and a slight decrease in opacity (to 0.9).
- **Pinterest Cards:** Feature high-aspect-ratio images with a title and category tag positioned below the image. The entire card is a hit area with an image-zoom transition.
- **Product Affiliate Cards:** These are "Surface" containers (#F8F8F8) featuring a smaller product thumbnail, a bold headline, a serif description, and a clear "Shop Now" call-to-action button.
- **Category Chips:** Soft Beige (#F5EFE8) backgrounds with #1A1A1A text, using pill-shaped corners (rounded-full) for a gentle, organic look.
- **Navigation:** A minimal fixed header with a centered logo and text-only links in `label-md` style. No heavy background; use a backdrop-blur (glassmorphism) only when scrolling over content.