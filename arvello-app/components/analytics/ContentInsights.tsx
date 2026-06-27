'use client';

import React from 'react';
import { BarChart3, Eye, MousePointerClick, TrendingUp, Package, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/analytics';

interface ContentInsightsProps {
  insights: {
    avg_views_per_article: number;
    avg_clicks_per_article: number;
    avg_ctr: number;
    avg_products_per_article: number;
    avg_revenue_per_article: number;
  };
}

export default function ContentInsights({ insights }: ContentInsightsProps) {
  const metrics = [
    {
      label: 'Avg. Views / Article',
      value: formatNumber(insights.avg_views_per_article),
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/50 border-blue-200/30',
    },
    {
      label: 'Avg. Clicks / Article',
      value: insights.avg_clicks_per_article.toFixed(1),
      icon: MousePointerClick,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50/50 border-purple-200/30',
    },
    {
      label: 'Avg. CTR',
      value: `${insights.avg_ctr}%`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50/50 border-emerald-200/30',
    },
    {
      label: 'Avg. Products / Article',
      value: insights.avg_products_per_article.toFixed(1),
      icon: Package,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50/50 border-amber-200/30',
    },
    {
      label: 'Avg. Revenue / Article',
      value: formatCurrency(insights.avg_revenue_per_article),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50 border-emerald-200/30',
    },
  ];

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center gap-3">
        <BarChart3 className="w-5 h-5 text-indigo-500" />
        <div>
          <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
            Content Insights
          </h3>
          <p className="text-[10px] text-foreground/40 mt-0.5">Average performance across all published content</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`p-4 rounded-2xl border ${metric.bgColor} space-y-2`}
            >
              <metric.icon className={`w-5 h-5 ${metric.color} opacity-60`} />
              <p className="text-xl font-bold text-foreground">{metric.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-foreground/40">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
