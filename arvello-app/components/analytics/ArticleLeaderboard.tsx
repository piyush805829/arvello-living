'use client';

import React, { useState } from 'react';
import { ArrowUpDown, FileText } from 'lucide-react';
import type { ArticleAnalytics } from '@/types';
import { getCTRColor, formatCurrency, formatNumber, getCountryName } from '@/lib/analytics';

type SortKey = 'views' | 'clicks' | 'ctr' | 'revenue' | 'published';

interface ArticleLeaderboardProps {
  articles: ArticleAnalytics[];
}

export default function ArticleLeaderboard({ articles }: ArticleLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortKey>('views');

  const sorted = [...articles].sort((a, b) => {
    switch (sortBy) {
      case 'views': return b.unique_views - a.unique_views;
      case 'clicks': return b.total_clicks - a.total_clicks;
      case 'ctr': return b.ctr - a.ctr;
      case 'revenue': return b.estimated_revenue - a.estimated_revenue;
      case 'published':
        return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
      default: return 0;
    }
  });

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'views', label: 'Views' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'ctr', label: 'CTR' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'published', label: 'Newest' },
  ];

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Article Leaderboard
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">{articles.length} published articles</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-foreground/30" />
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                sortBy === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground/40 hover:text-foreground/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-foreground/40 italic">No article data available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/40 text-[9px] font-bold uppercase tracking-wider text-foreground/40 border-b border-outline-variant/30">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right hidden md:table-cell">Country</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {sorted.map((article, idx) => {
                const ctr = getCTRColor(article.ctr);
                return (
                  <tr key={article.article_id} className="hover:bg-background/20 transition-all">
                    <td className="py-3 px-4 text-xs text-foreground/30 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={article.thumbnail}
                          alt=""
                          className="w-10 h-8 object-cover rounded-lg border border-outline-variant/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate max-w-[200px] lg:max-w-[280px]">
                            {article.title}
                          </span>
                          <span className="text-[9px] text-foreground/30 block">
                            /articles/{article.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-foreground/60">
                      {formatNumber(article.unique_views)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-foreground/60">
                      {formatNumber(article.total_clicks)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold ${ctr.colorClass}`}>
                        {ctr.emoji} {article.ctr}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-emerald-600">
                      {formatCurrency(article.estimated_revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-foreground/40 hidden md:table-cell">
                      {getCountryName(article.top_country)}
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-foreground/40 hidden lg:table-cell">
                      {article.product_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
