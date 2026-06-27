'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import type { ArticleAnalytics } from '@/types';
import { getCTRColor, formatCurrency, formatNumber } from '@/lib/analytics';

interface BestConvertersProps {
  articles: ArticleAnalytics[];
}

export default function BestConverters({ articles }: BestConvertersProps) {
  if (articles.length === 0) {
    return (
      <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
        <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Best Converters
          </h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-sm text-foreground/40 italic">Not enough data to determine best converters yet.</p>
        </div>
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉', '4', '5'];

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Best Converting Articles
          </h3>
          <p className="text-[10px] text-foreground/40 mt-0.5">Highest CTR with meaningful traffic</p>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {articles.map((article, idx) => {
          const ctr = getCTRColor(article.ctr);
          const medal = idx < 3 ? medals[idx] : `${idx + 1}`;

          return (
            <div
              key={article.article_id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-amber-50/40 border-amber-200/30'
                  : 'bg-background/20 border-outline-variant/15 hover:bg-background/40'
              }`}
            >
              <span className="text-lg w-8 text-center shrink-0">
                {medal}
              </span>

              <img
                src={article.thumbnail}
                alt=""
                className="w-12 h-10 object-cover rounded-lg border border-outline-variant/20 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{article.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[9px] text-foreground/40">
                  <span>{formatNumber(article.unique_views)} views</span>
                  <span>{formatNumber(article.total_clicks)} clicks</span>
                  <span className="text-emerald-600">{formatCurrency(article.estimated_revenue)}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-sm font-bold ${ctr.colorClass}`}>
                  {ctr.emoji} {article.ctr}%
                </span>
                <p className="text-[9px] text-foreground/30">{ctr.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
