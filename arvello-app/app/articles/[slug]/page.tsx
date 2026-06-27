import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types';
import ArticleLayout from '@/components/ArticleLayout';
import TrackingProvider from '@/components/TrackingProvider';

// Force dynamic validation to capture edits instantly
export const revalidate = 0;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMIC SEO METADATA GENERATION
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const { data: article } = await supabase
      .from('articles')
      .select('title, home_description, thumbnail, published_at, created_at')
      .eq('slug', slug)
      .maybeSingle();

    if (!article) return {};

    const pageTitle = `${article.title} | Arvello Living`;
    const pageDesc = article.home_description;
    const pageUrl = `https://arvello-living.vercel.app/articles/${slug}`;
    const imageUrl = article.thumbnail;

    return {
      title: pageTitle,
      description: pageDesc,
      alternates: {
        canonical: pageUrl,
      },
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        url: pageUrl,
        siteName: 'Arvello Living',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        authors: ['Elena Rostova'],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDesc,
        images: [imageUrl],
      },
    };
  } catch (e) {
    console.error('Error generating metadata:', e);
    return {};
  }
}

// 2. MAIN SERVER PAGE COMPONENT
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let currentArticle: Article | null = null;
  let relatedArticles: Article[] = [];
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
      // Fetch current article
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching article:', error);
        isConfigError = true;
        databaseErrorMessage = error.message;
      } else if (data) {
        currentArticle = data as Article;
        
        // Fetch related articles (limit 3, exclude current article)
        const { data: relatedData } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .neq('id', currentArticle.id)
          .order('published_at', { ascending: false })
          .limit(3);
          
        relatedArticles = (relatedData as Article[]) || [];
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
      <div className="max-w-[600px] mx-auto px-6 py-32 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-sans text-2xl font-bold text-foreground">Configuration Required</h1>
          <p className="text-sm text-foreground/60 leading-relaxed font-light">
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

  // 3. PARSE HEADINGS & INJECT IDS FOR SCROLLSPY
  const headings: { text: string; id: string }[] = [];
  let contentWithIds = currentArticle.content;
  let counter = 0;

  contentWithIds = currentArticle.content.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (match, attrs, text) => {
    counter++;
    const id = `section-${counter}`;
    // Strip HTML tags from heading text for safe display inside the TOC
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    headings.push({ text: cleanText, id });
    return `<h2${attrs} id="${id}">${text}</h2>`;
  });

  // 4. GENERATE STRUCTURED DATA (JSON-LD) FOR RICH GOOGLE INDEXING
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': currentArticle.title,
    'description': currentArticle.home_description,
    'image': [currentArticle.thumbnail],
    'datePublished': currentArticle.published_at || currentArticle.created_at,
    'dateModified': currentArticle.updated_at || currentArticle.created_at,
    'author': {
      '@type': 'Person',
      'name': 'Elena Rostova',
      'jobTitle': 'Senior Design Editor'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Arvello Living',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://arvello-living.vercel.app/favicon.ico'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://arvello-living.vercel.app/articles/${slug}`
    }
  };

  const modifiedArticle = {
    ...currentArticle,
    content: contentWithIds
  };

  return (
    <>
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Analytics Tracking + Premium Editorial Layout */}
      <TrackingProvider articleId={modifiedArticle.id}>
        <ArticleLayout 
          article={modifiedArticle} 
          headings={headings}
          relatedArticles={relatedArticles}
        />
      </TrackingProvider>
    </>
  );
}
