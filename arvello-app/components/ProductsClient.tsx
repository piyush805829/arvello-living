'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ExternalLink, X, HelpCircle, ArrowRight } from 'lucide-react';
import { Product } from '@/types';

interface ProductWithMetadata extends Product {
  featuredIn: {
    title: string;
    slug: string;
  }[];
}

interface ProductsClientProps {
  products: ProductWithMetadata[];
  articles: { title: string; slug: string }[];
}

export default function ProductsClient({ products, articles }: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string>('all');

  // Filter products based on search query and selected article
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Filter by article
      if (selectedArticleSlug !== 'all') {
        const matchesArticle = product.featuredIn.some(
          (art) => art.slug === selectedArticleSlug
        );
        if (!matchesArticle) return false;
      }

      // 2. Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (product.title || product.name || '').toLowerCase().includes(query);
        const matchesDesc = (product.description || '').toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [products, searchQuery, selectedArticleSlug]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedArticleSlug('all');
  };

  return (
    <div className="space-y-12">
      {/* Search and Filters Panel */}
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-4 items-center">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 stroke-[2]" />
            <input
              type="text"
              placeholder="Search design objects, material details, furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-background border border-outline-variant/30 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Article Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedArticleSlug}
              onChange={(e) => setSelectedArticleSlug(e.target.value)}
              className="w-full px-4 py-3.5 bg-background border border-outline-variant/30 rounded-2xl font-sans text-sm appearance-none focus:outline-none focus:border-primary/50 transition-colors cursor-pointer text-foreground/80 font-medium"
            >
              <option value="all">All Editorial Stories</option>
              {articles.map((art) => (
                <option key={art.slug} value={art.slug}>
                  {art.title}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Badges / Active Filters Summary */}
        {(selectedArticleSlug !== 'all' || searchQuery !== '') && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/10 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-foreground/60">
              <span>Active filters:</span>
              {selectedArticleSlug !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/50 text-secondary-container-foreground rounded-full font-semibold">
                  Featured in: {articles.find((a) => a.slug === selectedArticleSlug)?.title}
                  <button onClick={() => setSelectedArticleSlug('all')} className="hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery !== '' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/50 text-secondary-container-foreground rounded-full font-semibold">
                  Query: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={clearFilters}
              className="text-primary font-bold hover:underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of Products */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-outline-variant/20 rounded-3xl p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-outline-variant/20 flex items-center justify-center text-foreground/30 mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="font-sans text-xl font-bold tracking-tight mb-2">No Curated Items Found</h3>
          <p className="text-sm text-foreground/50 max-w-sm mb-6">
            We couldn&apos;t find any objects matching your search criteria. Try refining your keyword search or selected article.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const productTitle = product.title || product.name || 'Curated Design Piece';
            const whyRecommend = `Selected for its seamless incorporation of minimalist architectural forms and superior utility. A premium recommendation from the Arvello Living editors.`;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between p-6 bg-white border border-outline-variant/20 rounded-2xl shadow-soft transition-all duration-500 hover:shadow-hover hover:border-outline-variant/50 hover:-translate-y-1 overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Product Thumbnail */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-background-light border border-outline-variant/10">
                    <Image
                      src={product.image}
                      alt={productTitle}
                      fill
                      sizes="(max-w-768px) 100vw, 320px"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Header metadata */}
                  <div className="space-y-2">
                    <h3 className="font-sans text-base font-bold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {productTitle}
                    </h3>
                    {product.price && (
                      <span className="inline-block text-xs font-bold tracking-wider text-foreground/50">
                        {product.price}
                      </span>
                    )}
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4 text-xs leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/30">Description</span>
                      <p className="text-foreground/75 font-serif font-light text-sm line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-1 bg-secondary-container/10 p-3 rounded-lg border border-outline-variant/10">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-secondary">Why We Recommend It</span>
                      <p className="text-foreground/75 font-serif font-light italic">
                        {product.why_recommend || whyRecommend}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/30 block">Key Features</span>
                      <ul className="list-disc list-inside space-y-0.5 font-serif text-foreground/60 font-light">
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

                    {/* Featured In Meta Section */}
                    <div className="space-y-1.5 pt-2 border-t border-outline-variant/10">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/30 block">Featured In</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.featuredIn.map((art) => (
                          <Link
                            key={art.slug}
                            href={`/articles/${art.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary-container/30 hover:bg-secondary-container/60 text-secondary-container-foreground rounded-md transition-colors text-[10px] font-semibold font-sans tracking-wide"
                          >
                            {art.title}
                            <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affiliate External Buy Button */}
                <div className="pt-6 mt-6 border-t border-outline-variant/20">
                  <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
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
      )}
    </div>
  );
}
