'use client';

import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { ArticleAnalytics, ProductAnalytics } from '@/types';
import { getCTRColor, formatNumber } from '@/lib/analytics';

interface LowPerformersProps {
  lowCtrArticles: ArticleAnalytics[];
  lowClickProducts: ProductAnalytics[];
  showArticles?: boolean;
  showProducts?: boolean;
}

export default function LowPerformers({
  lowCtrArticles,
  lowClickProducts,
  showArticles = true,
  showProducts = true,
}: LowPerformersProps) {
  const hasArticles = showArticles && lowCtrArticles.length > 0;
  const hasProducts = showProducts && lowClickProducts.length > 0;

  if (!hasArticles && !hasProducts) {
    return (
      <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
        <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-amber-500" />
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Low Performers
          </h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-sm text-foreground/40 italic">🎉 No low performers detected! All content is performing well.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <TrendingDown className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Low Performers
          </h3>
          <p className="text-[10px] text-foreground/40 mt-0.5">Content that may need attention</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Low CTR Articles */}
        {hasArticles && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                High Views, Low CTR Articles
              </span>
            </div>
            <div className="space-y-2">
              {lowCtrArticles.map((article) => {
                const ctr = getCTRColor(article.ctr);
                return (
                  <div key={article.article_id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 border border-amber-200/20">
                    <img
                      src={article.thumbnail}
                      alt=""
                      className="w-8 h-8 object-cover rounded-lg border border-outline-variant/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{article.title}</p>
                      <p className="text-[9px] text-foreground/40">
                        {formatNumber(article.unique_views)} views • {formatNumber(article.total_clicks)} clicks
                      </p>
                    </div>
                    <span className={`text-xs font-bold ${ctr.colorClass}`}>
                      {ctr.emoji} {article.ctr}%
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-foreground/30 italic pl-5">
              💡 Try repositioning products higher in the article, updating product images, or adding stronger call-to-action text.
            </p>
          </div>
        )}

        {/* Low Click Products */}
        {hasProducts && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                Low Click Products
              </span>
            </div>
            <div className="space-y-2">
              {lowClickProducts.map((product) => (
                <div key={`${product.product_id}-${product.parent_article_id}`} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/30 border border-red-200/20">
                  <img
                    src={product.image}
                    alt=""
                    className="w-8 h-8 object-cover rounded-lg border border-outline-variant/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{product.title}</p>
                    <p className="text-[9px] text-foreground/40 truncate">
                      in {product.parent_article_title}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground/40">
                    {formatNumber(product.total_clicks)} clicks
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-foreground/30 italic pl-5">
              💡 Consider updating product descriptions, adding better images, or placing these products in higher-traffic articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
