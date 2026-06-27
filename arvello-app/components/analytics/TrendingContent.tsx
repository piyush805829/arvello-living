'use client';

import React, { useState } from 'react';
import { Flame, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { TrendingItem } from '@/types';
import { formatGrowthRate, formatNumber } from '@/lib/analytics';

interface TrendingContentProps {
  trendingArticles: TrendingItem[];
  trendingProducts: TrendingItem[];
}

export default function TrendingContent({ trendingArticles, trendingProducts }: TrendingContentProps) {
  const [activeSection, setActiveSection] = useState<'articles' | 'products'>('articles');

  const items = activeSection === 'articles' ? trendingArticles : trendingProducts;

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />;
    if (rate < 0) return <ArrowDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-foreground/30" />;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 50) return 'text-emerald-600 bg-emerald-50 border-emerald-200/30';
    if (rate > 0) return 'text-emerald-500 bg-emerald-50/50 border-emerald-200/20';
    if (rate < 0) return 'text-red-500 bg-red-50/50 border-red-200/20';
    return 'text-foreground/40 bg-background border-outline-variant/20';
  };

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Trending Content
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">Growth compared to previous period</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSection('articles')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
              activeSection === 'articles'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground/40 hover:text-foreground/60'
            }`}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveSection('products')}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
              activeSection === 'products'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-foreground/40 hover:text-foreground/60'
            }`}
          >
            Products
          </button>
        </div>
      </div>

      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-foreground/40 italic">
              No trending data available. Need at least 2 periods of data.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-background/40 transition-all group"
              >
                <span className="text-xs font-mono text-foreground/30 w-5 text-right shrink-0">
                  {idx + 1}
                </span>

                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-10 h-8 object-cover rounded-lg border border-outline-variant/20 shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-foreground/40">
                      {formatNumber(item.current_period_count)} {activeSection === 'articles' ? 'views' : 'clicks'}
                    </span>
                    <span className="text-[9px] text-foreground/20">vs</span>
                    <span className="text-[9px] text-foreground/40">
                      {formatNumber(item.previous_period_count)} prev
                    </span>
                  </div>
                </div>

                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${getGrowthColor(item.growth_rate)}`}>
                  {getGrowthIcon(item.growth_rate)}
                  <span>{formatGrowthRate(item.growth_rate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
