import React from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types';
import { ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Force dynamic validation to capture edits instantly
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let currentArticle: Article | null = null;
  let isConfigError = false;
  let databaseErrorMessage = '';

  const isPlaceholderUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http');

  if (isPlaceholderUrl) {
    isConfigError = true;
  } else {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching article:', error);
        isConfigError = true;
        databaseErrorMessage = error.message;
      } else {
        currentArticle = data as Article;
      }
    } catch (e) {
      console.error('Unexpected error fetching article:', e);
      isConfigError = true;
      databaseErrorMessage = e instanceof Error ? e.message : String(e);
    }
  }

  // --- RENDER ERROR IF DATABASE NOT CONNECTED ---
  if (isConfigError) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-sans text-2xl font-bold text-foreground">Configuration Required</h1>
          <p className="text-sm text-foreground/60 leading-relaxed">
            Your Supabase connection parameters are missing or incorrect. Please configure your `.env.local` file to fetch editorial articles.
          </p>
          {databaseErrorMessage && (
            <p className="text-xs font-mono bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 mt-4 text-left max-h-[100px] overflow-y-auto">
              Error details: {databaseErrorMessage}
            </p>
          )}
        </div>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            Go to Setup Guide
          </Link>
          <Link
            href="/admin"
            className="px-5 py-2.5 border border-outline-variant text-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-background transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!currentArticle) {
    notFound();
  }

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

  return (
    <article className="max-w-[1280px] mx-auto px-6 md:px-16">
      {/* Centered Narrow Header */}
      <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
        <div className="flex items-center justify-center gap-3">
          <span className="px-3 py-1 bg-secondary-container text-secondary-container-foreground font-sans text-[10px] font-bold tracking-widest uppercase rounded-full">
            Editorial
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground/50 font-sans">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(currentArticle.published_at || currentArticle.created_at)}
          </span>
        </div>
        
        <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-foreground">
          {currentArticle.title}
        </h1>
        
        <p className="font-serif text-lg sm:text-xl text-foreground/60 leading-relaxed font-light max-w-2xl mx-auto italic">
          {currentArticle.home_description}
        </p>
      </div>

      {/* Large Featured Thumbnail */}
      <div className="w-full max-w-5xl mx-auto aspect-[16/9] rounded-3xl overflow-hidden shadow-soft mb-12">
        <img
          src={currentArticle.thumbnail}
          alt={currentArticle.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Centered Article Content Container (approx 720px for optimal reading) */}
      <div className="max-w-[720px] mx-auto space-y-12">
        {/* Rich Text Editorial Body */}
        <div 
          className="prose"
          dangerouslySetInnerHTML={{ __html: currentArticle.content }}
        />

        {/* Affiliate Products Section */}
        {currentArticle.products && currentArticle.products.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-outline-variant/30">
            <div className="space-y-1">
              <h3 className="font-sans text-xl font-bold text-foreground">
                Featured Items in this Story
              </h3>
              <p className="text-xs text-foreground/50">
                Handpicked items to help you achieve this editorial look in your own living space.
              </p>
            </div>

            <div className="space-y-4">
              {currentArticle.products.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-secondary-container/40 border border-outline-variant/30 transition-all hover:bg-secondary-container/60 hover:shadow-soft duration-300 group"
                >
                  {/* Product Image */}
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white shrink-0 border border-outline-variant/20 shadow-sm">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Text & CTA */}
                  <div className="flex-grow flex flex-col justify-between h-full space-y-3 text-center sm:text-left">
                    <div className="space-y-1">
                      <h4 className="font-sans text-base font-bold text-foreground tracking-tight">
                        {product.title}
                      </h4>
                      <p className="font-serif text-sm text-foreground/75 leading-relaxed font-light">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <a
                        href={product.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-sans text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
                      >
                        Buy on Amazon
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Back Link */}
        <div className="pt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
          >
            ← Back to Editorial Home
          </Link>
        </div>
      </div>
    </article>
  );
}
