import { Metadata } from 'next';
import * as React from 'react';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CSV Generator - Create Custom CSV Files',
  description:
    'Generate custom CSV files with configurable structures and realistic data. Perfect for testing, prototyping, and data analysis.',
  keywords: ['CSV', 'generator', 'test data', 'mock data', 'data generation'],
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
      <body className='antialiased bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen'>
        {children}
      </body>
    </html>
  );
}
