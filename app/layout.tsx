import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gib Meme Board",
  description: "View-only backlog and bug tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="1800" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
