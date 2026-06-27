'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Link2, 
  ArrowUp, 
  Clock, 
  Calendar, 
  Check,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Article } from '@/types';
import { useTracking } from '@/components/TrackingProvider';

interface HeadingItem {
  text: string;
  id: string;
}

interface ArticleLayoutProps {
  article: Article;
  headings: HeadingItem[];
  relatedArticles: Article[];
}

export default function ArticleLayout({ 
  article, 
  headings, 
  relatedArticles 
}: ArticleLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { trackProductClick } = useTracking();

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate Reading Time
  const getReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  // Copy Page URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // 1. Calculate reading progress
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      
      // Show/hide Back to Top button
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    // 2. Track active heading using Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -75% 0px', // Trigger when heading is near the top third
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe each H2 section
    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [headings]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const readingTime = getReadingTime(article.content);
  const shareText = encodeURIComponent(article.title);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-primary-foreground font-sans">
      
      {/* 1. Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={scrollProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* 2. Top-Level Editorial Header */}
      <header className="max-w-[1280px] mx-auto px-6 md:px-16 pt-32 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="px-3.5 py-1 bg-primary text-primary-foreground text-[9px] font-bold tracking-[0.2em] uppercase rounded-full shadow-sm">
            Editorial
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          <span className="text-[11px] font-semibold text-foreground/50 tracking-wider uppercase">
            Design & Culture
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl font-sans mb-6">
          {article.title}
        </h1>

        <p className="font-serif text-lg sm:text-xl text-foreground/60 leading-relaxed font-light max-w-2xl italic mb-8">
          {article.home_description}
        </p>

        {/* Metadata section */}
        <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs text-foreground/50 font-semibold uppercase tracking-wider border-t border-b border-outline-variant/30 py-4 w-full max-w-2xl">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground/40 font-normal">By</span>
            <span className="text-foreground font-bold">Elena Rostova</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 stroke-[2]" />
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 stroke-[2]" />
            <span>{readingTime} min read</span>
          </div>
        </div>
      </header>

      {/* 3. Hero Featured Image (Occupies approx 60vh) */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-16 mb-20">
        <div className="relative w-full h-[45vh] sm:h-[60vh] rounded-3xl overflow-hidden shadow-soft group">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            priority
            sizes="(max-w-1280px) 100vw, 1200px"
            className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
        </div>
      </section>

      {/* 4. Article Layout with Sidebar & Content */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-16 items-start">
        
        {/* Main Content Column */}
        <main className="space-y-16 max-w-[760px]">
          {/* Main Article Body */}
          <div 
            ref={articleContentRef}
            className="prose text-lg sm:text-[19px] leading-[1.9] text-foreground/80 font-serif max-w-full"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Trust Elements Banner */}
          <div className="border-t border-b border-outline-variant/30 py-6 px-8 rounded-2xl bg-secondary-container/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/50 tracking-wide">
            <span className="font-semibold">Products independently selected by our editors.</span>
            <div className="flex flex-wrap justify-center gap-4 text-[11px]">
              <span className="font-bold underline decoration-dotted decoration-1 decoration-offset-2">Affiliate Policy</span>
              <span className="text-foreground/30">|</span>
              <span>This does not affect our recommendations.</span>
            </div>
          </div>

          {/* Redesigned Premium Product Cards */}
          {article.products && article.products.length > 0 && (
            <section className="space-y-12">
              <div className="border-b border-outline-variant/30 pb-4">
                <h3 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-foreground/40 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 stroke-[2]" /> Shop the Editorial Look
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {article.products.map((product, idx) => {
                  const productTitle = product.title || product.name || 'Editorial Item';
                  const whyRecommend = `Crafted with a meticulous balance of raw materiality and utility. It represents a premium design choice that aligns beautifully with warm minimalist philosophies, adding instant texture and structure.`;
                  
                  return (
                    <div 
                      key={product.id || idx}
                      className="group relative flex flex-col justify-between p-6 bg-surface border border-outline-variant/20 rounded-2xl shadow-soft transition-all duration-500 hover:shadow-hover hover:border-outline-variant/50 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Product Header & Image */}
                      <div className="space-y-6">
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-background-light border border-outline-variant/10">
                          <Image
                            src={product.image}
                            alt={productTitle}
                            fill
                            sizes="(max-w-768px) 100vw, 320px"
                            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                          />
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-sans text-base font-bold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                            {productTitle}
                          </h4>
                          {product.price && (
                            <span className="inline-block text-xs font-bold tracking-wider text-foreground/50">
                              {product.price}
                            </span>
                          )}
                        </div>

                        {/* Description & Recommendations */}
                        <div className="space-y-4 text-sm leading-relaxed">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Description</span>
                            <p className="text-foreground/75 font-serif font-light">
                              {product.description}
                            </p>
                          </div>

                          <div className="space-y-1 bg-secondary-container/10 p-3 rounded-lg border border-outline-variant/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Why We Recommend It</span>
                            <p className="text-foreground/75 font-serif font-light text-xs italic">
                              {product.why_recommend || whyRecommend}
                            </p>
                          </div>

                          <div className="space-y-1 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Key Features</span>
                            <ul className="list-disc list-inside space-y-1 font-serif text-foreground/60 font-light">
                              {product.key_features && product.key_features.length > 0 ? (
                                product.key_features.map((feature, fIdx) => (
                                  <li key={fIdx}>{feature}</li>
                                ))
                              ) : (
                                <>
                                  <li>Minimalist form factor</li>
                                  <li>Organic raw materials</li>
                                  <li>Timeless interior appeal</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Buy Button */}
                      <div className="pt-6 mt-6 border-t border-outline-variant/20">
                        <a
                          href={product.affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackProductClick(product.id)}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground font-sans text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                        >
                          View on Amazon
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bottom Back Button */}
          <div className="pt-12 border-t border-outline-variant/20 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all group"
            >
              <ChevronRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" /> 
              Back to Editorial Home
            </Link>
          </div>
        </main>

        {/* 5. Sticky Right Sidebar (Desktop only) */}
        <aside className="hidden lg:block sticky top-24 space-y-10 self-start">
          
          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/40 block border-b border-outline-variant/20 pb-2">
                Table of Contents
              </span>
              <nav className="space-y-3">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block text-[13px] leading-relaxed transition-all hover:text-foreground font-sans ${
                      activeId === heading.id 
                        ? 'text-foreground font-bold pl-2 border-l-2 border-primary' 
                        : 'text-foreground/50 pl-0 border-l-0 border-transparent'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Share Buttons */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/40 block border-b border-outline-variant/20 pb-2">
              Share Article
            </span>
            <div className="flex items-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-foreground/60 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-sm"
                aria-label="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-foreground/60 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-sm"
                aria-label="Share on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <button
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-foreground/60 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 shadow-sm relative"
                aria-label="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded whitespace-nowrap shadow-md">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <button
              onClick={scrollToTop}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all duration-300 ${
                showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              Back to Top
            </button>
          </div>
        </aside>
      </div>

      {/* 6. Related Articles Grid Section (Bottom) */}
      {relatedArticles.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 md:px-16 mt-32 border-t border-outline-variant/30 pt-20">
          <div className="mb-12 flex items-center justify-between">
            <h3 className="font-sans text-xs font-bold tracking-[0.25em] uppercase text-foreground/40">
              Related Editorial Stories
            </h3>
            <span className="w-24 h-px bg-outline-variant/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArticles.map((rel) => (
              <article key={rel.id} className="group">
                <Link href={`/articles/${rel.slug}`} className="space-y-5 block">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-background-light border border-outline-variant/10 shadow-soft">
                    <Image
                      src={rel.thumbnail}
                      alt={rel.title}
                      fill
                      sizes="(max-w-768px) 100vw, 360px"
                      className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-foreground/40 font-semibold uppercase tracking-wider font-sans">
                      {formatDate(rel.published_at || rel.created_at)}
                    </span>
                    <h4 className="font-sans text-lg font-bold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {rel.title}
                    </h4>
                    <p className="font-serif text-sm text-foreground/60 leading-relaxed font-light line-clamp-3">
                      {rel.home_description}
                    </p>
                    <div className="pt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary border-b-2 border-transparent group-hover:border-primary transition-all">
                      Read Story
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 7. Floating Back to Top Button for Mobile View */}
      <button
        onClick={scrollToTop}
        className={`lg:hidden fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 hover:scale-105 active:scale-95 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
