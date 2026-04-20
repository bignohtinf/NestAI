'use client';

import React from 'react';
import { Header } from '@/components/layouts/header';
import { Hero } from '@/components/layouts/hero';
import { Footer } from '@/components/layouts/footer';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Container,
  Grid,
  Section,
  DisplayHero,
  SectionHeading,
  Subheading,
  Body,
  SecondaryText,
  MetricCard,
  Alert,
  AlertTitle,
  AlertDescription,
  Divider,
} from '@/components/ui';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header
        links={[
          { href: '#buttons', label: 'Buttons' },
          { href: '#cards', label: 'Cards' },
          { href: '#typography', label: 'Typography' },
        ]}
        cta={{ href: '#', label: 'Get Started' }}
      />

      {/* Hero Section */}
      <Hero
        title="Notion-Inspired Design System"
        subtitle="NestAI Design"
        description="A comprehensive design system built on warm neutrals, elegant typography, and minimal interactions. Inspired by Notion's philosophy of getting out of your way."
        primaryCta={{ label: 'Explore Components', href: '#buttons' }}
        secondaryCta={{ label: 'View Documentation', href: '#' }}
      />

      {/* Buttons Section */}
      <Section variant="warm-white" id="buttons">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Button Variants</SectionHeading>

          <Grid cols={2} gap="lg" className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Primary Button</CardTitle>
                <CardDescription>
                  Use for main calls-to-action
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary Button</CardTitle>
                <CardDescription>
                  Use for secondary actions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="secondary">Secondary</Button>
                <Button variant="secondary" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ghost Button</CardTitle>
                <CardDescription>
                  Use for tertiary actions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="ghost">Ghost</Button>
                <Button variant="ghost" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destructive Button</CardTitle>
                <CardDescription>
                  Use for dangerous actions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button variant="destructive">Delete</Button>
                <Button variant="destructive" disabled>
                  Disabled
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Divider className="my-12" />

          <Subheading className="mb-6">Button Sizes</Subheading>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Container>
      </Section>

      {/* Cards Section */}
      <Section id="cards">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Card Variants</SectionHeading>

          <Grid cols={3} gap="lg">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Standard card with soft shadow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Body>
                  This is a default card with the standard Notion shadow treatment.
                </Body>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>
                  Card with deep shadow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Body>
                  This card has a deeper shadow for more prominence.
                </Body>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Flat Card</CardTitle>
                <CardDescription>
                  Card without shadow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Body>
                  This card has no shadow for a minimal appearance.
                </Body>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Typography Section */}
      <Section variant="warm-white" id="typography">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Typography Scale</SectionHeading>

          <Grid cols={1} gap="lg">
            <Card>
              <CardContent className="pt-6">
                <DisplayHero className="mb-2">Display Hero (64px)</DisplayHero>
                <SecondaryText>
                  Maximum compression, billboard headlines
                </SecondaryText>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Subheading className="mb-2">Subheading (26px)</Subheading>
                <SecondaryText>
                  Section sub-titles, content headers
                </SecondaryText>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Body className="mb-2">
                  Body text (16px) - Standard reading text with normal letter-spacing
                </Body>
                <SecondaryText>
                  This is secondary text for descriptions and muted labels
                </SecondaryText>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </Section>

      {/* Badges Section */}
      <Section>
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Badge Variants</SectionHeading>

          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="teal">Teal</Badge>
            <Badge variant="purple">Purple</Badge>
            <Badge variant="brown">Brown</Badge>
          </div>
        </Container>
      </Section>

      {/* Metric Cards Section */}
      <Section variant="warm-white">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Metric Cards</SectionHeading>

          <Grid cols={3} gap="lg">
            <MetricCard
              value="1,234"
              label="Total Users"
              description="Active this month"
              trend="up"
              trendValue="+12%"
            />
            <MetricCard
              value="$45,678"
              label="Revenue"
              description="This quarter"
              trend="up"
              trendValue="+8%"
            />
            <MetricCard
              value="92%"
              label="Satisfaction"
              description="Customer rating"
              trend="neutral"
              trendValue="Stable"
            />
          </Grid>
        </Container>
      </Section>

      {/* Alerts Section */}
      <Section>
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Alert Variants</SectionHeading>

          <Grid cols={1} gap="lg">
            <Alert variant="default">
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert message
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <AlertTitle>Success Alert</AlertTitle>
              <AlertDescription>
                Your action was completed successfully
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTitle>Warning Alert</AlertTitle>
              <AlertDescription>
                Please review this important information
              </AlertDescription>
            </Alert>

            <Alert variant="error">
              <AlertTitle>Error Alert</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again
              </AlertDescription>
            </Alert>

            <Alert variant="info">
              <AlertTitle>Info Alert</AlertTitle>
              <AlertDescription>
                Here is some helpful information
              </AlertDescription>
            </Alert>
          </Grid>
        </Container>
      </Section>

      {/* Color Palette Section */}
      <Section variant="warm-white">
        <Container maxWidth="xl">
          <SectionHeading className="mb-12">Color Palette</SectionHeading>

          <Grid cols={2} gap="lg" className="md:grid-cols-4">
            {[
              { name: 'Notion Blue', color: '#0075de' },
              { name: 'Warm White', color: '#f6f5f4' },
              { name: 'Warm Dark', color: '#31302e' },
              { name: 'Warm Gray 500', color: '#615d59' },
              { name: 'Teal', color: '#2a9d99' },
              { name: 'Green', color: '#1aae39' },
              { name: 'Orange', color: '#dd5b00' },
              { name: 'Purple', color: '#391c57' },
            ].map((item) => (
              <Card key={item.name} className="overflow-hidden">
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: item.color }}
                />
                <CardContent className="pt-4">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-[#a39e98]">{item.color}</p>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Footer
        sections={[
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Security', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Careers', href: '#' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '#' },
              { label: 'API', href: '#' },
              { label: 'Support', href: '#' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
        ]}
      />
    </div>
  );
}
