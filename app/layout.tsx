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

      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
