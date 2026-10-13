import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Organizzatore Dieta - Piano Alimentare, Spesa e Regole",
  description:
    "Web app installabile (PWA) che trasforma il piano alimentare del nutrizionista in uno strumento d'uso quotidiano: scelta dei pasti, lista della spesa aggregata e controllo delle regole.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dieta",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7931E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning className="h-full">
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                const savedTheme = localStorage.getItem('diet_theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch(e) {}
            })();`,
          }}
        />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
