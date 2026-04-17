# NestAI Design System

A comprehensive design system inspired by Notion's philosophy of elegant minimalism and warm neutrals.

## Overview

This design system is built on the following principles:
- **Warm Neutrals**: Grays with yellow-brown undertones, never cold blue-grays
- **Minimal Interactions**: Ultra-thin borders and subtle shadows
- **Typography-First**: Notion Inter font with aggressive letter-spacing at display sizes
- **Accessibility**: High contrast ratios and clear focus states

## Color Palette

### Primary Colors
- **Notion Blue** (`#0075de`): Primary CTA, links, interactive elements
- **Notion Blue Active** (`#005bab`): Button hover/active state
- **Notion Blue Focus** (`#097fe8`): Focus rings and badges

### Warm Neutral Scale
- **Warm White** (`#f6f5f4`): Background surface tint, section alternation
- **Warm Dark** (`#31302e`): Dark surface background
- **Warm Gray 500** (`#615d59`): Secondary text, descriptions
- **Warm Gray 300** (`#a39e98`): Placeholder text, disabled states

### Semantic Colors
- **Teal** (`#2a9d99`): Success states
- **Green** (`#1aae39`): Confirmation, completion
- **Orange** (`#dd5b00`): Warning states
- **Pink** (`#ff64c8`): Decorative accent
- **Purple** (`#391c57`): Premium features
- **Brown** (`#523410`): Earthy accent

## Typography

### Font Family
Primary: `Inter` with fallbacks to system fonts

### Scale
| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display Hero | 64px | 700 | 1.00 | -2.125px |
| Display Secondary | 54px | 700 | 1.04 | -1.875px |
| Section Heading | 48px | 700 | 1.00 | -1.5px |
| Subheading Large | 40px | 700 | 1.50 | normal |
| Subheading | 26px | 700 | 1.23 | -0.625px |
| Card Title | 22px | 700 | 1.27 | -0.25px |
| Body Large | 20px | 600 | 1.40 | -0.125px |
| Body | 16px | 400 | 1.50 | normal |
| Body Medium | 16px | 500 | 1.50 | normal |
| Body Semibold | 16px | 600 | 1.50 | normal |
| Nav / Button | 15px | 600 | 1.33 | normal |
| Caption | 14px | 500 | 1.43 | normal |
| Badge | 12px | 600 | 1.33 | 0.125px |

### Font Weights
- **400**: Body text, reading
- **500**: UI elements, interactive
- **600**: Emphasis, navigation, labels
- **700**: Headings, display

## Components

### Button

```tsx
import { Button } from '@/components/ui';

// Variants: primary, secondary, ghost, destructive
// Sizes: sm, md, lg

<Button variant="primary" size="md">
  Click me
</Button>
```

**Variants:**
- **Primary**: Main CTAs, Notion Blue background
- **Secondary**: Secondary actions, translucent gray background
- **Ghost**: Tertiary actions, transparent with underline on hover
- **Destructive**: Dangerous actions, orange background

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Variants:**
- **default**: Standard card with soft shadow
- **elevated**: Deep shadow for prominence
- **flat**: No shadow for minimal appearance

### Badge

```tsx
import { Badge } from '@/components/ui';

// Variants: default, success, warning, error, teal, purple, brown

<Badge variant="success">Active</Badge>
```

### Typography Components

```tsx
import {
  DisplayHero,
  SectionHeading,
  Subheading,
  Body,
  SecondaryText,
  Caption,
} from '@/components/ui';

<DisplayHero>Main Headline</DisplayHero>
<SectionHeading>Section Title</SectionHeading>
<Subheading>Subsection</Subheading>
<Body>Regular paragraph text</Body>
<SecondaryText>Secondary information</SecondaryText>
<Caption>Small caption text</Caption>
```

### Layout Components

```tsx
import { Section, Container, Grid } from '@/components/ui';

<Section variant="warm-white" padded>
  <Container maxWidth="xl">
    <Grid cols={3} gap="lg">
      {/* Grid items */}
    </Grid>
  </Container>
</Section>
```

**Section Variants:**
- **white**: Pure white background
- **warm-white**: Warm white (`#f6f5f4`) for alternation

**Container Max Widths:**
- sm, md, lg, xl, 2xl, full

**Grid Columns:**
- 1, 2, 3, 4 (responsive)

### Metric Card

```tsx
import { MetricCard } from '@/components/ui';

<MetricCard
  value="1,234"
  label="Total Users"
  description="Active this month"
  trend="up"
  trendValue="+12%"
/>
```

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

// Variants: default, success, warning, error, info

<Alert variant="success">
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your action was completed</AlertDescription>
</Alert>
```

### Header & Footer

```tsx
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';

<Header
  links={[
    { href: '#', label: 'Features' },
    { href: '#', label: 'Pricing' },
  ]}
  cta={{ href: '#', label: 'Get Started' }}
/>

<Footer
  sections={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
      ],
    },
  ]}
/>
```

### Hero Section

```tsx
import { Hero } from '@/components/layouts/hero';

<Hero
  title="Welcome to NestAI"
  subtitle="Postpartum Care"
  description="AI-powered support for new parents"
  primaryCta={{ label: 'Get Started', href: '#' }}
  secondaryCta={{ label: 'Learn More', href: '#' }}
/>
```

## Spacing System

Base unit: **8px**

Scale: 2px, 3px, 4px, 5px, 6px, 7px, 8px, 11px, 12px, 14px, 16px, 24px, 32px

## Border Radius

- **Micro (4px)**: Buttons, inputs, functional elements
- **Subtle (5px)**: Links, list items, menu items
- **Standard (8px)**: Small cards, containers
- **Comfortable (12px)**: Standard cards, feature containers
- **Large (16px)**: Hero cards, featured content
- **Pill (9999px)**: Badges, pills, status indicators

## Shadows

### Card Shadow (Level 2)
```
rgba(0, 0, 0, 0.04) 0px 4px 18px,
rgba(0, 0, 0, 0.027) 0px 2.025px 7.85px,
rgba(0, 0, 0, 0.02) 0px 0.8px 2.93px,
rgba(0, 0, 0, 0.01) 0px 0.175px 1.04px
```

### Deep Shadow (Level 3)
```
rgba(0, 0, 0, 0.01) 0px 1px 3px,
rgba(0, 0, 0, 0.02) 0px 3px 7px,
rgba(0, 0, 0, 0.02) 0px 7px 15px,
rgba(0, 0, 0, 0.04) 0px 14px 28px,
rgba(0, 0, 0, 0.05) 0px 23px 52px
```

## Borders

**Whisper Border**: `1px solid rgba(0, 0, 0, 0.1)`

Used throughout for cards, dividers, and section separations.

## Responsive Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile Small | <400px | Tight single column |
| Mobile | 400-600px | Standard mobile |
| Tablet Small | 600-768px | 2-column grids begin |
| Tablet | 768-1080px | Full card grids |
| Desktop Small | 1080-1200px | Standard desktop |
| Desktop | 1200-1440px | Full layout |
| Large Desktop | >1440px | Centered, generous margins |

## Accessibility

### Focus States
All interactive elements have visible focus indicators:
- Focus outline: `2px solid #097fe8`
- Focus ring offset: 2px

### Color Contrast
- Primary text on white: ~18:1 ratio (WCAG AAA)
- Secondary text on white: ~5.5:1 ratio (WCAG AA)
- Blue CTA on white: ~4.6:1 ratio (WCAG AA for large text)

### Touch Targets
- Minimum 44px height for touch targets
- Adequate spacing between interactive elements

## Usage Example

```tsx
'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Grid,
  Section,
  SectionHeading,
  Badge,
} from '@/components/ui';
import { Header } from '@/components/layouts/header';
import { Hero } from '@/components/layouts/hero';

export default function Page() {
  return (
    <div>
      <Header
        links={[{ href: '#', label: 'Features' }]}
        cta={{ href: '#', label: 'Get Started' }}
      />

      <Hero
        title="Welcome"
        description="Start your journey"
        primaryCta={{ label: 'Begin', href: '#' }}
      />

      <Section variant="warm-white">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Features</SectionHeading>

          <Grid cols={3} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Feature 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Description of feature</p>
                <Badge variant="success" className="mt-4">
                  Active
                </Badge>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>
    </div>
  );
}
```

## Design System Page

View all components and their variations at `/design-system`

## Best Practices

1. **Use warm neutrals**: Never use cold blue-grays
2. **Letter-spacing scales**: Compress at large sizes, relax at small sizes
3. **Borders are whispers**: Keep them subtle at `1px solid rgba(0, 0, 0, 0.1)`
4. **Shadows layer**: Use multiple layers with low opacity for natural depth
5. **Notion Blue sparingly**: It's the only saturated color in core UI
6. **Pill badges**: Use `9999px` radius for status/tags
7. **Section alternation**: Alternate white and warm white backgrounds
8. **Generous whitespace**: Let content breathe with ample margins

## Files Structure

```
components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── typography.tsx
│   ├── section.tsx
│   ├── input.tsx
│   ├── divider.tsx
│   ├── metric-card.tsx
│   ├── alert.tsx
│   └── index.ts
├── layouts/
│   ├── header.tsx
│   ├── hero.tsx
│   └── footer.tsx
└── ...

app/
├── globals.css (design tokens)
├── design-system/
│   └── page.tsx (component showcase)
└── ...

lib/
├── utils.ts (cn helper)
└── context.tsx
```

## Customization

All components use Tailwind CSS and can be customized via:
1. Tailwind config (`tailwind.config.ts`)
2. CSS variables in `globals.css`
3. Component props
4. Inline className overrides

## Support

For questions or issues with the design system, refer to `DESIGN.md` for detailed specifications.
