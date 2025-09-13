# Next.js App Starter

This is a starter template for building a application using **Next.js** with support for authentication, and a dashboard for logged-in users.

## Features

- Default landing page (`/`)
- Site configuration in `lib/config.ts`, remember to update the name and description
- Email/password authentication with JWTs stored to cookies
- Global middleware to protect logged-in routes
- Local middleware to protect Server Actions or validate Zod schemas
- Activity logging system for any user events

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

```bash
git clone https://github.com/clacky-ai/next-app-starter
cd next-app-starter
npm install
```

## UI Design Standards

### 🚪 **MANDATORY: Exit Function Requirement**
> **⚠️ CRITICAL:** Every new menu, modal, settings page, or navigation interface MUST include clear exit/back functionality.

**Required for all new UI components:**
- ✅ Primary exit button (Back/Close/Cancel)
- ✅ Clear visual indicator (X icon, arrow icon, or labeled button)
- ✅ Logical destination (dashboard, previous page, or home)
- ✅ Accessible placement (header, top-right, or prominently visible)

**Quick Implementation Examples:**
```tsx
// Header with back button
<Link href="/dashboard">
  <Button variant="ghost" size="sm" className="gap-2">
    <ArrowLeft className="h-4 w-4" />
    Back to Dashboard
  </Button>
</Link>

// Top-right close button
<div className="absolute top-0 right-0">
  <Button variant="ghost" size="sm">
    <X className="h-4 w-4" />
  </Button>
</div>
```

📋 **See full design standards:** [`docs/UI-DESIGN-STANDARDS.md`](docs/UI-DESIGN-STANDARDS.md)

## Theming

This project comes with built-in theme support and light/dark mode toggle functionality. When developing, please use design tokens from the theme system instead of hardcoding colors. This ensures consistent styling and proper appearance in both light and dark modes.

For example, use CSS variables like `var(--color-primary)` or Tailwind classes like `bg-primary text-primary-foreground` instead of explicit color codes.

If you have color style preferences, you can define a new theme in the `contexts/theme-context.tsx` file to customize the application's appearance according to your brand or design requirements.

## Running Locally

Use the included setup script to create your `.env` file:

```bash
npm db:setup
```

Run the database migrations and seed the database with a default user:

```bash
npm db:migrate
npm db:seed
```

This will create the following user and team:

- User: `test@test.com`
- Password: `admin123`

You can also create new users through the `/sign-up` route.

Finally, run the Next.js development server:

```bash
npm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.
# BugX Deployment Trigger Sat Sep 13 03:14:19 AM EDT 2025
