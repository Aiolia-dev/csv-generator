# Step 01: Project Setup & Configuration

## Overview

Set up the Next.js project with proper TypeScript configuration, Tailwind CSS, and required dependencies. This step establishes the foundation for all subsequent development.

## What You'll Build

- Configure Next.js App Router
- Set up TypeScript with strict mode
- Configure Tailwind CSS 4
- Install and configure required dependencies
- Set up project structure

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- Basic Next.js boilerplate cloned (already done)

## Dependencies Already Installed

✅ Next.js 15.4.3
✅ React 19.1.0
✅ TypeScript 5.8.3
✅ Tailwind CSS 4.1.11
✅ Lucide React 0.438.0
✅ @faker-js/faker 10.1.0

## Implementation Steps

### 1. Verify Current Configuration

First, check your `package.json` to ensure all dependencies are present:

```json
{
  "name": "csv-generator",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@faker-js/faker": "^10.1.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.438.0",
    "next": "^15.4.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.8",
    "typescript": "^5.8.3",
    "tailwindcss": "^4.1.11",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.21"
  }
}
```

### 2. Configure TypeScript

Update or create `tsconfig.json` with strict settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/constants/*": ["./src/constants/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 4. Set Up Global Styles

Update `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Custom scrollbar for preview modal */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

### 5. Create Project Structure

Create the following folder structure in your project:

```bash
# Create directories
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/hooks
mkdir -p src/utils
```

### 6. Update Next.js Configuration

Update or create `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize for static export (client-side only app)
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Webpack configuration for Web Workers (future use)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add worker-loader for Web Workers
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      use: { loader: 'worker-loader' },
    });

    return config;
  },
};

module.exports = nextConfig;
```

### 7. Create Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSV Generator - Create Custom CSV Files',
  description:
    'Generate custom CSV files with configurable structures and realistic data. Perfect for testing, prototyping, and data analysis.',
  keywords: ['CSV', 'generator', 'test data', 'mock data', 'data generation'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className='antialiased'>{children}</body>
    </html>
  );
}
```

### 8. Create Placeholder Home Page

Update `src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-5xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            CSV Generator
          </h1>
          <p className='text-gray-600 mb-8'>
            Configure your custom CSV file generation
          </p>

          <div className='text-center py-12'>
            <p className='text-gray-500'>
              Project setup complete! Ready for implementation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

### 9. Create Environment Configuration

Create `.env.local` (optional, for future use):

```bash
# Application Configuration
NEXT_PUBLIC_APP_NAME=CSV Generator
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags (for future use)
NEXT_PUBLIC_ENABLE_WEB_WORKERS=true
NEXT_PUBLIC_MAX_FILE_SIZE_MB=500
```

### 10. Add Utility Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next out",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "echo \"Tests will be added in Step 20\""
  }
}
```

## Testing This Step

### 1. Start Development Server

```bash
pnpm dev
```

Expected output:

```
▲ Next.js 15.4.3
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 2. Verify TypeScript

```bash
pnpm type-check
```

Should complete with no errors.

### 3. Check the Application

Open http://localhost:3000 in your browser. You should see:

- Blue gradient background
- White card with "CSV Generator" title
- "Project setup complete!" message

### 4. Verify Tailwind CSS

Inspect the page - all Tailwind classes should be applied correctly with proper styling.

## Common Issues & Solutions

### Issue: TypeScript Path Aliases Not Working

**Solution**: Restart your IDE/editor and the dev server after updating `tsconfig.json`.

### Issue: Tailwind Styles Not Applied

**Solution**:

1. Check that `globals.css` is imported in `layout.tsx`
2. Verify `tailwind.config.ts` content paths include your files
3. Clear `.next` folder: `pnpm clean && pnpm dev`

### Issue: Module Not Found Errors

**Solution**:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Build Errors with Static Export

**Solution**: Remove any server-side features (API routes, server components with data fetching, etc.)

## File Checklist

After completing this step, you should have:

- ✅ `package.json` with all dependencies
- ✅ `tsconfig.json` with strict mode and path aliases
- ✅ `tailwind.config.ts` configured
- ✅ `next.config.js` with static export settings
- ✅ `src/app/layout.tsx` with metadata
- ✅ `src/app/page.tsx` with placeholder content
- ✅ `src/app/globals.css` with Tailwind imports
- ✅ Empty folders: `components/`, `lib/`, `types/`, `constants/`

## Next Steps

Proceed to **Step 02: Type Definitions & Interfaces** where you'll:

- Define TypeScript interfaces for all data structures
- Create type definitions for configuration objects
- Set up enums and constants
- Establish type safety across the application

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**Status**: ✅ Foundation established, ready for type definitions
