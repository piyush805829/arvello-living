'use client';

import React, { useState } from 'react';
import { Globe, ArrowUpDown } from 'lucide-react';
import type { CountryAnalytics } from '@/types';
import { getCTRColor, formatCurrency, formatNumber, getCountryName } from '@/lib/analytics';

type SortKey = 'views' | 'clicks' | 'ctr' | 'revenue';

interface CountryAnalyticsPanelProps {
  countries: CountryAnalytics[];
}

export default function CountryAnalyticsPanel({ countries }: CountryAnalyticsPanelProps) {
  const [sortBy, setSortBy] = useState<SortKey>('views');

  const sorted = [...countries].sort((a, b) => {
    switch (sortBy) {
      case 'views': return b.views - a.views;
      case 'clicks': return b.clicks - a.clicks;
      case 'ctr': return b.ctr - a.ctr;
      case 'revenue': return b.estimated_revenue - a.estimated_revenue;
      default: return 0;
    }
  });

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'views', label: 'Views' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'ctr', label: 'CTR' },
    { value: 'revenue', label: 'Revenue' },
  ];

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Top Countries
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">{countries.length} countries detected</p>
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
          <p className="text-sm text-foreground/40 italic">No country data available yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/40 text-[9px] font-bold uppercase tracking-wider text-foreground/40 border-b border-outline-variant/30">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Views</th>
                <th className="py-3 px-4 text-right">Clicks</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Est. Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {sorted.map((country, idx) => {
                const ctr = getCTRColor(country.ctr);
                return (
                  <tr key={country.country} className="hover:bg-background/20 transition-all">
                    <td className="py-3 px-4 text-xs text-foreground/30 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 text-xs font-bold text-foreground">
                      {getCountryName(country.country)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-foreground/60">
                      {formatNumber(country.views)}
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-foreground/60">
                      {formatNumber(country.clicks)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold ${ctr.colorClass}`}>
                        {ctr.emoji} {country.ctr}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-medium text-emerald-600">
                      {formatCurrency(country.estimated_revenue)}
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
