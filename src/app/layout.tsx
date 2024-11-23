import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/next';
import localFont from 'next/font/local';

import './globals.css';
import { Providers } from './Providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Sorteio de Amigo Secreto',
  description: 'Gerador de sorteio de amigo secreto',
  abstract: 'Gerador de sorteio de amigo secreto',
  keywords: [
    'sorteio',
    'amigo secreto',
    'gerador',
    'sorteio de amigo secreto',
    'amigo oculto',
    'natal',
    'fim de ano',
    'amigo secreto online',
    'sorteio online',
    'sorteio de amigo secreto online',
    'amigo secreto virtual',
    'sorteio virtual',
    ' sorteio de amigo secreto virtual',
    'amigo secreto online gratis',
    'sorteio online gratis',
    'sorteio de amigo secreto online',
    'amigo secreto virtual gratis',
  ],
  appleWebApp: true,
  applicationName: 'Sorteio de Amigo Secreto',
  authors: [
    {
      name: 'Jeferson Antonio Mesquita',
      url: 'https://github.com/JeffyMesquita',
    },
  ],
  creator: 'Jeferson Antonio Mesquita',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    images: {
      alt: 'Sorteio de Amigo Secreto',
      url: '/opengraph-image.png',
      type: 'image/png',
      width: 630,
      height: 1200,
      host: 'https://amigosecreto.jeffymesquita.dev',
      origin: 'https://amigosecreto.jeffymesquita.dev',
    },
    title: 'Sorteio de Amigo Secreto',
    type: 'website',
    description: 'Gerador de sorteio de amigo secreto',
    countryName: 'Brazil',
    alternateLocale: 'pt-BR',
    emails: ['je_2742@hotmail.com'],
    locale: 'pt_BR',
    phoneNumbers: ['+55 17 99130 5254'],
    siteName: 'Sorteio de Amigo Secreto',
    url: 'https://amigosecreto.jeffymesquita.dev',
  },
  twitter: {
    images: {
      alt: 'Gerador de sorteio de amigo secreto',
      url: '/twitter-image.png',
      type: 'image/png',
      width: 675,
      height: 1200,
      host: 'https://amigosecreto.jeffymesquita.dev',
      origin: 'https://amigosecreto.jeffymesquita.dev',
    },
    title: 'Sorteio de Amigo Secreto',
    card: 'summary_large_image',
    description:
      'Gerador de sorteio de amigo secreto. Sorteie o seu amigo secreto de forma rápida e fácil.',
    creator: '@_jeferson___',
    site: 'https://amigosecreto.jeffymesquita.dev',
  },
  bookmarks: ['Sorteio de Amigo Secreto'],
  generator: 'Sorteio de Amigo Secreto',
  category: 'Sorteio de Amigo Secreto',
  // trocar para o domínio do site
  metadataBase: new URL('https://amigosecreto.jeffymesquita.dev'),
  icons: ['🎁'],
};

async function checkServerIsAlive() {
  const response = await fetch(`${process.env.EVOLUTION_API_URL}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.ok;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isServerAlive = await checkServerIsAlive();

  console.log(isServerAlive);

  return (
    <html lang="pt-BR">
      <head>
        <meta
          content="ca-pub-6396092891104748"
          name="google-adsense-account"
        ></meta>
        <script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6396092891104748"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col items-center justify-center bg-zinc-100 antialiased dark:bg-zinc-900`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
