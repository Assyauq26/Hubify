import type { Metadata } from 'next'
import '@santi020k/lumen-react/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hubify',
  description: 'Your workspace for files, links, notes, tables, and lists',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  )
}
