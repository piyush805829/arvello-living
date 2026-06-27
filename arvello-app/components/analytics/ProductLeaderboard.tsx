'use client';

import React, { useState } from 'react';
import { ArrowUpDown, Package } from 'lucide-react';
import type { ProductAnalytics } from '@/types';
import { getCTRColor, formatCurrency, formatNumber, getCountryName } from '@/lib/analytics';

type SortKey = 'clicks' | 'ctr' | 'revenue' | 'newest' | 'oldest';

interface ProductLeaderboardProps {
  products: ProductAnalytics[];
}

export default function ProductLeaderboard({ products }: ProductLeaderboardProps) {
  const [sortBy, setSortBy] = useState<SortKey>('clicks');

  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'clicks': return b.total_clicks - a.total_clicks;
      case 'ctr': return b.ctr - a.ctr;
      case 'revenue': return b.estimated_revenue - a.estimated_revenue;
      case 'newest':
        return new Date(b.last_click_at || 0).getTime() - new Date(a.last_click_at || 0).getTime();
      case 'oldest':
        return new Date(a.last_click_at || 0).getTime() - new Date(b.last_click_at || 0).getTime();
      default: return 0;
    }
  });

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'clicks', label: 'Most Clicked' },
    { value: 'ctr', label: 'Highest CTR' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'newest', label: 'Newest' },
  ];

  const formatLastClick = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-purple-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Product Leaderboard
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">{products.length} tracked products</p>
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
          <p className="text-sm text-foreground/40 italic">No product data available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/40 text-[9px] font-bold uppercase tracking-wider text-foreground/40 border-b border-outline-variant/30">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 hidden md:table-cell">Parent Article</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Country</th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">Last Click</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {sorted.map((product, idx) => {
                const ctr = getCTRColor(product.ctr);
                return (
                  <tr key={`${product.product_id}-${product.parent_article_id}`} className="hover:bg-background/20 transition-all">
                    <td className="py-3 px-4 text-xs text-foreground/30 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg border border-outline-variant/20 shrink-0"
                        />
                        <span className="text-xs font-bold text-foreground truncate max-w-[140px] lg:max-w-[200px]">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-[10px] text-foreground/40 truncate max-w-[160px] block">
                        {product.parent_article_title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-foreground/60">
                      {formatNumber(product.total_clicks)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold ${ctr.colorClass}`}>
                        {ctr.emoji} {product.ctr}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-emerald-600">
                      {formatCurrency(product.estimated_revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-foreground/40 hidden lg:table-cell">
                      {getCountryName(product.top_country)}
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-foreground/40 hidden lg:table-cell">
                      {formatLastClick(product.last_click_at)}
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
