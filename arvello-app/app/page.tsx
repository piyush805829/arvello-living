import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Article } from '@/types';
import { ArrowRight, BookOpen, Clock, AlertTriangle, Key, Database, Cpu } from 'lucide-react';

// Force dynamic fetching to always reflect Supabase changes instantly
export const revalidate = 0;

export default async function HomePage() {
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
        console.error('Error fetching articles for home:', error);
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

  // Helper to format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
                  Open the [arvello-app/.env.local](file:///c:/Users/admin/Documents/MY%20Documents/Programing/my%20projects/arvello%20living/arvello-app/.env.local) file in your editor and replace the placeholder values with your actual Supabase URL, Anon Key, Service Role Key, and Gemini API Key.
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
                  Once configured, save your `.env.local` file and refresh this page. You can then navigate to `/admin` to log in (default password is `admin123`) and start publishing articles.
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

  // --- RENDER ARTICLES LIST (IF CONNECTED) ---
  if (publishedArticles.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-outline-variant/20 flex items-center justify-center text-foreground/40 mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="font-sans text-3xl font-bold tracking-tight mb-3">No Editorial Content Published</h1>
        <p className="text-sm text-foreground/60 max-w-md mb-8">
          The editor workspace is empty. Log in to the administrator panel to write, edit, and publish your first minimalist design article.
        </p>
        <Link
          href="/admin"
          className="px-6 py-3 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        >
          Go to Admin Panel
        </Link>
      </div>
    );
  }

  const featuredArticle = publishedArticles[0];
  const gridArticles = publishedArticles.slice(1);

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16 space-y-16">
      {/* 1. Featured Article (Hero Section) */}
      <section className="w-full">
        <Link href={`/articles/${featuredArticle.slug}`} className="group block">
          <div className="relative w-full h-[320px] sm:h-[450px] md:h-[520px] rounded-3xl overflow-hidden bg-foreground shadow-soft transition-all duration-500">
            {/* Background Image */}
            <img
              src={featuredArticle.thumbnail}
              alt={featuredArticle.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 opacity-90"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:via-black/45 transition-all duration-300" />

            {/* Overlaid Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 md:p-16 flex flex-col items-start text-white max-w-4xl space-y-4">
              <span className="px-3.5 py-1 bg-white text-black font-sans text-[10px] font-bold tracking-widest uppercase rounded-full shadow-sm">
                Featured
              </span>
              <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white transition-colors duration-200">
                {featuredArticle.title}
              </h2>
              <p className="font-serif text-sm sm:text-base md:text-lg text-white/80 line-clamp-2 max-w-2xl font-light">
                {featuredArticle.home_description}
              </p>
              
              <div className="pt-2 flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-xs text-white/60 font-sans tracking-wide">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(featuredArticle.published_at)}
                </span>
                
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black font-sans text-xs font-bold uppercase tracking-widest rounded-full transition-all group-hover:gap-3 group-hover:opacity-95 shadow-md">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 2. Masonry Grid Section */}
      {gridArticles.length > 0 && (
        <section className="space-y-8">
          <div className="border-b border-outline-variant/30 pb-4">
            <h3 className="font-sans text-xs font-bold tracking-widest uppercase text-foreground/40">
              More Stories
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {gridArticles.map((article) => (
              <article key={article.id} className="group">
                <Link href={`/articles/${article.slug}`} className="space-y-4 block">
                  {/* Card Thumbnail */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-background-light shadow-soft">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-secondary-container text-secondary-container-foreground font-sans text-[9px] font-bold tracking-widest uppercase rounded-full">
                        Editorial
                      </span>
                      <span className="text-[10px] text-foreground/40 font-sans tracking-wide">
                        {formatDate(article.published_at)}
                      </span>
                    </div>

                    <h4 className="font-sans text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-foreground/75">
                      {article.title}
                    </h4>

                    <p className="font-serif text-sm text-foreground/60 line-clamp-3 leading-relaxed font-light">
                      {article.home_description}
                    </p>
                    
                    <div className="pt-1 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary border-b-2 border-transparent group-hover:border-primary transition-all">
                      Read Story
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
