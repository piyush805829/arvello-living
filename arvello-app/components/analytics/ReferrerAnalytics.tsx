'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import type { ReferrerAnalytics } from '@/types';
import { getCTRColor, formatNumber } from '@/lib/analytics';

interface ReferrerAnalyticsPanelProps {
  referrers: ReferrerAnalytics[];
}

const REFERRER_COLORS: Record<string, string> = {
  'Pinterest': 'bg-red-50 border-red-200/30 text-red-700',
  'Google Search': 'bg-blue-50 border-blue-200/30 text-blue-700',
  'Google Images': 'bg-indigo-50 border-indigo-200/30 text-indigo-700',
  'Facebook': 'bg-blue-50 border-blue-200/30 text-blue-700',
  'Instagram': 'bg-pink-50 border-pink-200/30 text-pink-700',
  'Reddit': 'bg-orange-50 border-orange-200/30 text-orange-700',
  'Twitter/X': 'bg-sky-50 border-sky-200/30 text-sky-700',
  'YouTube': 'bg-red-50 border-red-200/30 text-red-700',
  'TikTok': 'bg-purple-50 border-purple-200/30 text-purple-700',
  'Bing': 'bg-teal-50 border-teal-200/30 text-teal-700',
  'DuckDuckGo': 'bg-orange-50 border-orange-200/30 text-orange-700',
  'Yahoo': 'bg-violet-50 border-violet-200/30 text-violet-700',
  'Email': 'bg-yellow-50 border-yellow-200/30 text-yellow-700',
  'Direct': 'bg-gray-50 border-gray-200/30 text-gray-700',
  'Other': 'bg-gray-50 border-gray-200/30 text-gray-600',
};

export default function ReferrerAnalyticsPanel({ referrers }: ReferrerAnalyticsPanelProps) {
  const totalViews = referrers.reduce((sum, r) => sum + r.views, 0);

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <Share2 className="w-5 h-5 text-indigo-500" />
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Traffic Sources
          </h3>
          <p className="text-[10px] text-foreground/40 mt-0.5">Where your visitors come from</p>
        </div>
      </div>

      <div className="p-6">
        {referrers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-foreground/40 italic">No referrer data available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrers.map((referrer) => {
              const percentage = totalViews > 0 ? Math.round((referrer.views / totalViews) * 100) : 0;
              const ctr = getCTRColor(referrer.ctr);
              const colorClass = REFERRER_COLORS[referrer.source] || REFERRER_COLORS['Other'];

              return (
                <div
                  key={referrer.source}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl hover:bg-background/30 transition-all border border-outline-variant/10"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${colorClass}`}>
                      {referrer.source}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* Percentage bar */}
                      <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary/40 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatNumber(referrer.views)}</span>
                      <span className="text-foreground/40 ml-1">views</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatNumber(referrer.clicks)}</span>
                      <span className="text-foreground/40 ml-1">clicks</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${ctr.colorClass}`}>
                        {ctr.emoji} {referrer.ctr}%
                      </span>
                    </div>
                    <div className="text-right text-[9px] text-foreground/30 max-w-[100px] truncate hidden lg:block">
                      {referrer.top_article_title || '—'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
