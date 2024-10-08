
import React from 'react';
import localFont from "next/font/local";
import "./globals.css";
import DarkModeToggle from "@/components/DarkModeToggle";
import Link from 'next/link';

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

export const metadata = {
  title: "Quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <header className="flex justify-between text-center fixed top-0 left-0 right-0 text-white p-4 bg-[#01949A] dark:bg-[#1E1E1E] shadow-md dark:shadow-none z-50">

        <Link href="/">
        <div className="flex items-center">
        <img src="/static/owl-icon.png" alt="Icon" className="h-10 w-10 mr-2" />
            <h1 className="text-3xl font-bold font-serif text-center">
              Inquizitor
            </h1>
          </div>
        </Link>
  
  

        <DarkModeToggle />
      </header>
        {children}
      </body>
    </html>
  );
}
