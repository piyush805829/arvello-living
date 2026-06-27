import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Article, Product } from '@/types';
import ProductsClient from '@/components/ProductsClient';
import { ShoppingBag, AlertTriangle, Database, Key, Cpu } from 'lucide-react';

// Force dynamic fetching to always reflect Supabase changes instantly
export const revalidate = 0;

interface ProductWithMetadata extends Product {
  featuredIn: {
    title: string;
    slug: string;
    articleId: string;
  }[];
}

export default async function ProductsPage() {
  let publishedArticles: Article[] = [];
  let isConfigError = false;
  let configErrorType: 'placeholder' | 'database' = 'placeholder';
  let databaseErrorMessage = '';

  const isPlaceholderUrl =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url' ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http');

  if (isPlaceholderUrl) {
    isConfigError = true;
    configErrorType = 'placeholder';
  } else {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles for products page:', error);
        isConfigError = true;
        configErrorType = 'database';
        databaseErrorMessage = error.message;
      } else {
        publishedArticles = data || [];
      }
    } catch (e) {
      console.error('Unexpected error fetching articles:', e);
      isConfigError = true;
      configErrorType = 'database';
      databaseErrorMessage = e instanceof Error ? e.message : String(e);
    }
  }

  // --- RENDER CONFIGURATION GUIDE (IF NOT CONNECTED) ---
  if (isConfigError) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12 space-y-8">
        <div className="bg-white border border-outline-variant/60 rounded-3xl p-8 shadow-soft space-y-6">
          <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-5">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold text-foreground">Database Setup Required</h1>
              <p className="text-xs text-foreground/50">Follow the guide below to connect Arvello Living to your Supabase project.</p>
            </div>
          </div>

          {configErrorType === 'database' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold space-y-1">
              <p className="uppercase tracking-wider text-[10px] text-red-500">Database Connection Error:</p>
              <p>{databaseErrorMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Create Table in Supabase
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Go to your **Supabase Dashboard &gt; SQL Editor**, paste the following script, and click **Run**:
                </p>
                <pre className="p-4 bg-background text-[10px] text-foreground/75 rounded-xl border border-outline-variant/40 overflow-x-auto max-h-[160px] font-mono leading-normal">
{`create table public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  thumbnail text not null,
  home_description text not null,
  content text not null,
  products jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.articles enable row level security;

create policy "Allow public read access" on public.articles for select using (true);
create policy "Allow full admin access" on public.articles for all using (true) with check (true);`}
                </pre>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> Copy API Credentials & Environment Variables
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Open the `.env.local` file in your editor and replace the placeholder values with your actual Supabase URL, Anon Key, Service Role Key, and Gemini API Key.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-foreground flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Start Writing Content
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Once configured, save your `.env.local` file and refresh this page. You can then navigate to `/admin` to log in (default password is `admin123`) and start publishing articles with products.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
            <Link
              href="/admin"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- EXTRACT AND DEDUPLICATE PRODUCTS ---
  const productMap = new Map<string, ProductWithMetadata>();
  const articlesList: { title: string; slug: string }[] = [];

  publishedArticles.forEach((article) => {
    // Add to list of articles for the filter option
    if (article.products && Array.isArray(article.products) && article.products.length > 0) {
      articlesList.push({
        title: article.title,
        slug: article.slug,
      });

      article.products.forEach((prod) => {
        const key = prod.id || prod.title || prod.name || '';
        if (!key) return;

        const existing = productMap.get(key);
        if (existing) {
          if (!existing.featuredIn.some((f) => f.slug === article.slug)) {
            existing.featuredIn.push({
              title: article.title,
              slug: article.slug,
              articleId: article.id,
            });
          }
        } else {
          productMap.set(key, {
            ...prod,
            featuredIn: [
              {
                title: article.title,
                slug: article.slug,
                articleId: article.id,
              },
            ],
          });
        }
      });
    }
  });

  const allProducts = Array.from(productMap.values());

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 space-y-12">
      {/* Editorial Header */}
      <header className="flex flex-col items-center text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2">
          <span className="px-3.5 py-1 bg-primary text-primary-foreground text-[9px] font-bold tracking-[0.2em] uppercase rounded-full shadow-sm">
            Curated Spaces
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          <span className="text-[11px] font-semibold text-foreground/50 tracking-wider uppercase">
            Design Catalog
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-sans">
          Curated Design Objects
        </h1>

        <p className="font-serif text-base sm:text-lg text-foreground/60 leading-relaxed font-light max-w-2xl">
          Discover a minimalist catalogue of premium furniture, lighting, and interior design items recommended by the Arvello Living editors.
        </p>
      </header>

      {/* Main Content: Client-Side Interactive Lists & Grid */}
      {allProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24">
          <div className="w-16 h-16 rounded-full bg-outline-variant/20 flex items-center justify-center text-foreground/40 mb-6">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-sans text-2xl font-bold tracking-tight mb-3">No Design Objects Listed Yet</h2>
          <p className="text-sm text-foreground/60 max-w-md mb-8">
            Products will automatically appear here once you publish articles containing affiliate product details in the admin panel.
          </p>
          <Link
            href="/admin"
            className="px-6 py-3 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            Go to Admin Panel
          </Link>
        </div>
      ) : (
        <ProductsClient products={allProducts} articles={articlesList} />
      )}
    </div>
  );
}
