import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WACPAC Virtual Contest',
  description: 'AtCoder仮想コンテスト管理システム',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
