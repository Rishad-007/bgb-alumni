# School Alumni Management System

A Next.js application for managing school alumni connections and networking.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and services (Supabase client)
- `/public` - Static files

## Technologies

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Backend**: Supabase
- **Linting**: ESLint

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
