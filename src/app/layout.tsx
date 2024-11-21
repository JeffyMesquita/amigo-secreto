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
  bookmarks: ["Sorteio de Amigo Secreto"],
  generator: "Sorteio de Amigo Secreto",
  category: "Sorteio de Amigo Secreto",
  // trocar para o domínio do site
  metadataBase: new URL("https://amigo-secreto-sigma-six.vercel.app"),
  twitter: {
    site: "@_jeferson___",
    creator: "@_jeferson___",
  },
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
