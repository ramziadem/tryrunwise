import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Try Run Wise — Runway & Burn Intelligence for Founders",
  description: "The financial cockpit for founders and operators. Track burn rate, model scenarios, and never be surprised by your runway again.",
  keywords: ["runway calculator", "burn rate", "startup finance", "financial planning", "scenario planning"],
  authors: [{ name: "Ramzi Benchadi" }],
  openGraph: {
    title: "Try Run Wise — Know your runway. Make smarter decisions.",
    description: "The financial cockpit for founders and operators. Track burn rate, model scenarios, and never be surprised by your runway again.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Try Run Wise — Know your runway. Make smarter decisions.",
    description: "The financial cockpit for founders and operators.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
