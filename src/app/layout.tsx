import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RH KADALUARSA - Sistem Manajemen Tanggal Kedaluwarsa",
  description: "Sistem manajemen tanggal kedaluwarsa dengan notifikasi H-14 dan fitur scan barcode/PLU. Copyright © Safir.",
  keywords: ["RH", "Kadaluarsa", "Barcode", "PLU", "Inventory", "Manajemen Stok"],
  authors: [{ name: "Safir" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove attributes added by browser extensions before hydration
              (function() {
                if (typeof window !== 'undefined') {
                  const removeExtensionAttributes = () => {
                    document.querySelectorAll('[fdprocessedid]').forEach(el => {
                      el.removeAttribute('fdprocessedid');
                    });
                  };
              // Run immediately
              removeExtensionAttributes();
              // Run again on DOM content loaded
              document.addEventListener('DOMContentLoaded', removeExtensionAttributes);
              // Run again on load
              window.addEventListener('load', removeExtensionAttributes);
                }
              })();
            `,
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
