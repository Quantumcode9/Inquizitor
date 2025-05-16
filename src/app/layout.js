'use client';
import React, { useEffect, useState } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import DarkModeToggle from "@/components/DarkModeToggle";
import Link from 'next/link';
import Image from 'next/image';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/GeistVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/GeistMonoVF.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}

function Header() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  return (
    <header className="flex justify-between text-center fixed top-0 left-0 right-0 text-white p-4 bg-[#01949A] dark:bg-[#0D0D0D] shadow-md dark:shadow-none mb-4 z-50">
      <Link href="/">
        <div className="flex items-center">
          <Image src="/static/owl-icon.png" alt="Icon" width={40} height={40} className="h-10 w-10 mr-2" />
          <h1 className="text-3xl font-bold font-serif text-center">
            Inquizitor
          </h1>
        </div>
      </Link>
      <div className="flex items-center">
        {userType ? (
          <span className="mr-4 text-lg font-semibold">
            Your Type: {userType}
          </span>
        ) : (
          <span className="mr-4 text-lg font-semibold">
          </span>
        )}
        <DarkModeToggle />
      </div>
    </header>
  );
}