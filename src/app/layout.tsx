import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Plantão ECG - Simulador de Tele-ECG',
    template: '%s | Plantão ECG'
  },
  description: 'Pratique interpretação de ECG com feedback de especialistas. Simule um plantão real de tele-ECG e aprimore suas habilidades diagnósticas.',
  keywords: [
    'ECG',
    'eletrocardiograma',
    'simulador ECG',
    'tele-ECG',
    'interpretação ECG',
    'cardiologia',
    'medicina',
    'educação médica',
    'arritmia',
    'infarto',
    'curso ECG',
    'plantão ECG'
  ],
  authors: [{ name: 'Dr. José Alencar' }],
  creator: 'Plantão ECG',
  publisher: 'Plantão ECG',
  metadataBase: new URL('https://plantaoecg.com.br'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://plantaoecg.com.br',
    siteName: 'Plantão ECG',
    title: 'Plantão ECG - Simulador de Tele-ECG',
    description: 'Pratique interpretação de ECG com feedback de especialistas. O melhor simulador de plantão de tele-ECG do Brasil.',
    images: [
      {
        url: 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGOG.png',
        width: 1200,
        height: 630,
        alt: 'Plantão ECG - Simulador de Tele-ECG',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plantão ECG - Simulador de Tele-ECG',
    description: 'Pratique interpretação de ECG com feedback de especialistas.',
    images: ['https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGOG.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}
