# Chronos Moments - Design System (Luxury Light Mode)

This document specifies the design tokens and UI styles for the premium luxury aesthetic of the Chronos Moments web application.

## 1. Color Palette

The color theme is refined, high-contrast, and light-mode first to convey elegance and premium craft.

| Token | Hex Value | Role | Usage |
|---|---|---|---|
| **Cream** | `#FDFCF9` | Background | Primary background for pages, cards, and modal components. |
| **Charcoal** | `#1A1A1A` | Primary Text | Headlines, body copy, icons, and contrast dark section backgrounds. |
| **Warm Taupe** | `#8B7D6B` | Border & Accent | Subtle 1px borders (20% opacity) and minor descriptive text. |
| **Gold** | `#D4AF37` | Highlight | Interactive text links, active status pills, and gradients. |

---

## 2. Typography

We use premium typography to establish an editorial feel.

*   **Headlines (H1, H2, H3, H4)**:
    *   **Font Family**: `'Cabinet Grotesk', sans-serif`
    *   **Weights**: Bold (`700`), Extra Bold (`800`)
*   **Body Copy**:
    *   **Font Family**: `'Satoshi', sans-serif`
    *   **Weights**: Regular (`400`), Medium (`500`)

---

## 3. UI Component Standards

### Border Radii
*   **Cards**: `24px` (`rounded-[24px]` or `.luxury-card`)
*   **Buttons & Inputs**: `12px` (`rounded-[12px]` or `.luxury-button`)

### Transitions & Hover States
*   **Interactive Buttons**: Scale smoothly by `102%` or dim slightly to `90%` opacity on hover with a `300ms` transition.
*   **Image Galleries**: Images must scale to `1.05` on hover with a `500ms` ease-in-out transition curve.
*   **Navigation**: Sticky header uses `backdrop-blur(10px)` with `bg-cream/90` and a subtle bottom border.

---

## 4. CSS Implementation classes

We provide global class mappings in `index.css`:
*   `.font-serif-luxury` -> Maps to `'Cabinet Grotesk', sans-serif`
*   `.luxury-card` -> Standard `24px` border-radius card with `border-taupe/20` border and `bg-cream` background.
*   `.luxury-button` -> Standard button with `12px` border-radius and `scale(1.02)` / `opacity(0.9)` hover transitions.
*   `.luxury-image-card` -> Card container that scales inner `img` tag to `1.05` on hover.
