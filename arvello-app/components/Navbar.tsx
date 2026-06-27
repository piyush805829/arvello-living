'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-outline-variant/30 py-4 shadow-sm'
          : 'bg-transparent border-b border-transparent py-6'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-sans text-2xl font-bold tracking-tight text-foreground transition-colors duration-200">
            Arvello Living
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`font-sans text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
              pathname === '/'
                ? 'text-foreground underline decoration-2 underline-offset-8'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`font-sans text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
              pathname === '/products'
                ? 'text-foreground underline decoration-2 underline-offset-8'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Products
          </Link>
          <span className="font-sans text-xs font-semibold tracking-widest uppercase text-foreground/40 cursor-not-allowed">
            About
          </span>
        </nav>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-6">
          <button className="text-foreground/75 hover:text-foreground transition-colors cursor-not-allowed" aria-label="Search">
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </div>
    </header>
  );
}
