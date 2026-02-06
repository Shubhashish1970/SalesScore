import type { Metadata, Viewport } from "next";
import "./globals.css";

const faviconSvg =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%231e293b" rx="4"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="%23f8fafc">%</text></svg>'
  );

export const metadata: Metadata = {
  title: "Performance Scorecard",
  description: "Understand your score in simple language",
  icons: { icon: { url: faviconSvg, type: "image/svg+xml" } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
