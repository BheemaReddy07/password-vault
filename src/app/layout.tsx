import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
//import { ThemeProvider } from "next-themes";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Password Vault",
  description: "Generate and store strong passwords securely",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
          <Toaster position="top-right" />
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
