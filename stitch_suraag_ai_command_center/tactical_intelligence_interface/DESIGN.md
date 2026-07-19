---
name: Tactical Intelligence Interface
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e4beb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#ab8985'
  outline-variant: '#5b403d'
  surface-tint: '#ffb4ac'
  primary: '#ffb4ac'
  on-primary: '#690006'
  primary-container: '#ff544c'
  on-primary-container: '#5c0005'
  inverse-primary: '#bb171c'
  secondary: '#ffb4ab'
  on-secondary: '#690005'
  secondary-container: '#a0030e'
  on-secondary-container: '#ffa99f'
  tertiary: '#c9c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a29'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c9c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  tactical-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.08em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  grid-unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  panel-gap: 8px
---

## Brand & Style
The design system is engineered for high-stakes forensic intelligence and cyber defense. It evokes the atmosphere of a futuristic command center—aggressive, ultra-premium, and authoritative. The aesthetic merges **Cyber-Brutalism** with **Advanced Glassmorphism**, prioritizing rapid data ingestion and tactical precision.

The UI should feel like a specialized military instrument rather than a consumer application. Key stylistic pillars include:
- **Zero-Latency Visuals:** Sharp edges and high-contrast transitions.
- **HUD Intelligence:** Use of data-dense overlays and tactical grid systems.
- **Aggressive Professionalism:** A dominance-oriented palette that signals urgency and absolute control.

## Colors
The palette is rooted in "Obsidian Dark" to maintain maximum contrast for critical alerts. 

- **The Void (#050505):** Used for base backgrounds to create infinite depth.
- **Glow Red (#E53935):** The primary kinetic color. Used for active states, critical data points, and primary actions. It must carry a subtle 4px outer glow in high-priority contexts.
- **Deep Blood (#B71C1C):** Used for hover states and secondary emphasis to provide depth to the primary red.
- **Tactical Glass (#121212):** Applied to cards and panels with 70% opacity and a 20px backdrop blur to simulate advanced optics.

## Typography
This system utilizes a dual-font strategy to balance legibility with a technical "monospaced" feel.

- **Space Grotesk:** Reserved for headings, numerical data, metrics, and labels. It provides the "HUD" aesthetic. For data tables, always use Space Grotesk with high letter spacing to ensure character isolation.
- **Inter:** The workhorse for long-form forensic reports and system logs. It ensures readability during high-stress monitoring periods.
- **Stylistic Note:** All labels and data headers should be uppercase to reinforce the military-grade nomenclature.

## Layout & Spacing
The layout is governed by a **Strict Tactical Grid**. 
- **The 4px Rule:** All spacing between elements must be a multiple of 4px. 
- **Container Strategy:** Use a 12-column fluid grid for the main dashboard, but nest data within "Tactical Modules" (fixed-width sidebars or floating panels).
- **Scanlines:** A global overlay of 1px horizontal lines (opacity 3%) should be applied to the background to simulate digital cathode-ray displays.
- **Alignment:** Elements should feel "locked" into the grid. Use thin 1px borders to separate quadrants rather than large gaps.

## Elevation & Depth
Elevation is not achieved through traditional shadows, but through **Luminance and Opacity**.

- **Z-Axis Layering:** Background (#050505) -> Midground (Grid Pattern) -> Component Layer (Glassmorphism #121212 @ 70% + Blur) -> Interaction Layer (Glow Red Outlines).
- **Glow Effects:** Instead of drop shadows, use `box-shadow: 0 0 10px rgba(229, 57, 53, 0.3)` on active or critical components.
- **Borders as Depth:** Use 1px solid borders. For inactive cards, use #2A2A2A. For active or focused elements, use the Primary Accent (#E53935).

## Shapes
The design system rejects curves. 
- **Sharp Edges:** All buttons, cards, and input fields must have a 0px border-radius to maintain a modular, industrial feel. 
- **Angled Accents:** Use "clipped corner" shapes for decorative UI elements or status badges to simulate military hardware stencils.

## Components
### Buttons
- **Primary:** Solid #E53935 with white text. On hover, add a 15px outer glow.
- **Ghost:** Transparent background, 1px #E53935 border. Use for secondary tactical actions.
- **Tactical:** Small, square buttons with icons only, using #9A9A9A borders.

### Cards / Modules
- Glassmorphic panels with `backdrop-filter: blur(20px)`. 
- Every card must have a 1px border. 
- Top-left corners of cards may include a small "Serial Number" or "Module ID" in 8px Space Grotesk.

### Input Fields
- Underline-only or thin-bordered boxes. 
- Focus state: Border changes to #E53935 with a pulse animation.
- Text within fields uses Space Grotesk for a monospaced data-entry feel.

### Data Tables
- No vertical lines. Horizontal lines should be #1A1A1A.
- Row hover state: #B71C1C at 10% opacity.
- Metrics should be highlighted with the Primary Accent color when crossing thresholds.

### Status Indicators
- **Pulse Effect:** Critical alerts (#E53935) must include a soft radial pulse animation to draw immediate ocular attention.
- **Success/Warning:** Used sparingly for system health, strictly utilizing the defined green and orange.