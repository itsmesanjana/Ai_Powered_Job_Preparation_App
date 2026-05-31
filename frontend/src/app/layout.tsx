import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Job Prep Platform",
  description: "Next-gen AI powered job preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <div className="min-h-screen bg-background bg-mesh relative selection:bg-primary/30">
          
          {children}
        </div>
      </body>
    </html>
  );
}
