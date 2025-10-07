# ClarityLab Portal

Investor-ready diagnostics/LIMS web app for labs that need a modern website + secure client portal: test catalog, orders, sample tracking, result PDFs, and admin controls — all in one stack.

## MVP Home Page

This is the MVP version of the ClarityLab Portal home page, built with:
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Features

✅ Modern, responsive design (mobile-first)
✅ Accessible HTML with ARIA labels
✅ Top navigation with logo and Contact link
✅ Hero section with CTAs
✅ Trust badges row
✅ 3-card services grid
✅ 3-step process visualization
✅ Customer testimonial
✅ CLIA/CAP compliance badges
✅ Footer with contact information

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
# Create a production build
npm run build

# Start the production server
npm start
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
claritylab/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── TrustBadges.tsx
│   ├── Services.tsx
│   ├── Process.tsx
│   ├── Testimonial.tsx
│   ├── Compliance.tsx
│   └── Footer.tsx
└── public/          # Static assets (if needed)
```

## Tech Stack

- **Framework:** Next.js 15.5.4
- **Language:** TypeScript
- **Styling:** Tailwind CSS with @tailwindcss/postcss
- **Linting:** ESLint with next/core-web-vitals

## MVP Scope

This MVP includes ONLY the home page UI with no authentication or database functionality. Future iterations will add:
- User authentication
- Client portal
- Test catalog
- Order management
- Sample tracking
- Result delivery system
- Admin controls
