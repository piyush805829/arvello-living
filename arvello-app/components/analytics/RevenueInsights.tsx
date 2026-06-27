'use client';

import React, { useState } from 'react';
import { DollarSign, Settings, Save } from 'lucide-react';
import type { OverviewStats, AnalyticsSettings } from '@/types';
import { formatCurrency } from '@/lib/analytics';

interface RevenueInsightsProps {
  overview: OverviewStats;
  settings: AnalyticsSettings | null;
  onUpdateSettings: (settings: Partial<AnalyticsSettings>) => void;
}

export default function RevenueInsights({ overview, settings, onUpdateSettings }: RevenueInsightsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [commissionRate, setCommissionRate] = useState(settings?.commission_rate || 4);
  const [aov, setAov] = useState(settings?.average_order_value || 35);

  const handleSave = () => {
    onUpdateSettings({
      commission_rate: commissionRate,
      average_order_value: aov,
    });
    setShowSettings(false);
  };

  return (
    <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
      <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
              Revenue Insights
            </h3>
            <p className="text-[10px] text-foreground/40 mt-0.5">
              Estimates based on configured commission rate and AOV
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-foreground/40 hover:text-foreground hover:bg-background rounded-xl transition-all"
          title="Configure estimates"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-6 border-b border-outline-variant/30 bg-background/40 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Avg. Order Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={aov}
                onChange={(e) => setAov(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Settings
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider">
              Est. Revenue
            </span>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(overview.estimated_revenue)}</p>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-200/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-wider">
              EPC
            </span>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(overview.estimated_epc)}</p>
            <p className="text-[9px] text-blue-500/60">Earnings Per Click</p>
          </div>

          <div className="p-4 bg-purple-50/50 border border-purple-200/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-purple-600/60 uppercase tracking-wider">
              Rev / Article
            </span>
            <p className="text-xl font-bold text-purple-700">{formatCurrency(overview.revenue_per_article)}</p>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200/30 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider">
              Rev / Product
            </span>
            <p className="text-xl font-bold text-amber-700">{formatCurrency(overview.revenue_per_product)}</p>
          </div>
        </div>

        <p className="text-[9px] text-foreground/30 mt-4 text-center italic">
          ⚠️ All revenue figures are estimates based on a {settings?.commission_rate || 4}% commission rate and ${settings?.average_order_value || 35} average order value.
        </p>
      </div>
    </div>
  );
}
