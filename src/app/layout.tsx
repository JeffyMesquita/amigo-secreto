import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sorteio de Amigo Secreto",
  description: "Gerador de sorteio de amigo secreto",
  abstract: "Gerador de sorteio de amigo secreto",
  keywords: [
    "sorteio",
    "amigo secreto",
    "gerador",
    "sorteio de amigo secreto",
    "amigo oculto",
    "natal",
    "fim de ano",
    "amigo secreto online",
    "sorteio online",
    "sorteio de amigo secreto online",
    "amigo secreto virtual",
    "sorteio virtual",
    " sorteio de amigo secreto virtual",
    "amigo secreto online gratis",
    "sorteio online gratis",
    "sorteio de amigo secreto online",
    "amigo secreto virtual gratis",
  ],
  appleWebApp: true,
  applicationName: "Sorteio de Amigo Secreto",
  authors: [
    {
      name: "Jeferson Antonio Mesquita",
      url: "https://github.com/JeffyMesquita",
    },
  ],
  creator: "Jeferson Antonio Mesquita",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    images: {
      alt: "Sorteio de Amigo Secreto",
      url: "/opengraph-image.png",
      type: "image/png",
      width: 630,
      height: 1200,
      host: "https://amigo-secreto-sigma-six.vercel.app",
      origin: "https://amigo-secreto-sigma-six.vercel.app",
    },
    title: "Sorteio de Amigo Secreto",
    type: "website",
    description: "Gerador de sorteio de amigo secreto",
    countryName: "Brazil",
    alternateLocale: "pt-BR",
    emails: ["je_2742@hotmail.com"],
    locale: "pt_BR",
    phoneNumbers: ["+55 17 99130 5254"],
    siteName: "Sorteio de Amigo Secreto",
    url: "https://amigo-secreto-sigma-six.vercel.app",
  },
  twitter: {
    images: {
      alt: "Gerador de sorteio de amigo secreto",
      url: "/twitter-image.png",
      type: "image/png",
      width: 675,
      height: 1200,
      host: "https://amigo-secreto-sigma-six.vercel.app",
      origin: "https://amigo-secreto-sigma-six.vercel.app",
    },
    title: "Sorteio de Amigo Secreto",
    card: "summary_large_image",
    description:
      "Gerador de sorteio de amigo secreto. Sorteie o seu amigo secreto de forma rápida e fácil.",
    creator: "@_jeferson___",
    site: "https://amigo-secreto-sigma-six.vercel.app",
  },
  bookmarks: ["Sorteio de Amigo Secreto"],
  generator: "Sorteio de Amigo Secreto",
  category: "Sorteio de Amigo Secreto",
  // trocar para o domínio do site
  metadataBase: new URL("https://amigo-secreto-sigma-six.vercel.app"),
  icons: ["🎁"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen justify-center items-center bg-zinc-100 px-4 py-2 dark:bg-zinc-900`}
      >
        {children}
      </body>
    </html>
  );
}
