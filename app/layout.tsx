import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Menu Ordering",
  description: "Prototype đặt món bằng QR Code cho nhà hàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
