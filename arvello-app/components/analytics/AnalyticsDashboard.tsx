'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Loader2,
  RefreshCw,
  BarChart3,
  Calendar,
} from 'lucide-react';
import type { AnalyticsDashboardData, AnalyticsPeriod, AnalyticsSettings } from '@/types';
import { formatCurrency, formatNumber, getCTRColor } from '@/lib/analytics';
import RevenueInsights from './RevenueInsights';
import ArticleLeaderboard from './ArticleLeaderboard';
import ProductLeaderboard from './ProductLeaderboard';
import TrendingContent from './TrendingContent';
import CountryAnalyticsPanel from './CountryAnalytics';
import ReferrerAnalyticsPanel from './ReferrerAnalytics';
import LowPerformers from './LowPerformers';
import BestConverters from './BestConverters';
import ContentInsights from './ContentInsights';
import Recommendations from './Recommendations';
import PerformanceGoals from './PerformanceGoals';

type AnalyticsTab =
  | 'overview'
  | 'articles'
  | 'products'
  | 'trending'
  | 'countries'
  | 'referrers'
  | 'insights';

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
];

const TABS: { value: AnalyticsTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'articles', label: 'Articles' },
  { value: 'products', label: 'Products' },
  { value: 'trending', label: 'Trending' },
  { value: 'countries', label: 'Countries' },
  { value: 'referrers', label: 'Referrers' },
  { value: 'insights', label: 'Insights' },
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [settings, setSettings] = useState<AnalyticsSettings | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [analyticsRes, settingsRes] = await Promise.all([
        fetch(`/api/analytics?period=${period}`),
        fetch('/api/analytics/settings'),
      ]);

      const analyticsData = await analyticsRes.json();
      const settingsData = await settingsRes.json();

      if (analyticsData.success) setData(analyticsData.data);
      if (settingsData.success) setSettings(settingsData.settings);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSettingsUpdate = async (newSettings: Partial<AnalyticsSettings>) => {
    try {
      const res = await fetch('/api/analytics/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const result = await res.json();
      if (result.success) {
        fetchData(true);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/40 mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-foreground/40">
          Loading Analytics...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <BarChart3 className="w-12 h-12 text-foreground/20" />
        <p className="text-sm text-foreground/40">No analytics data available yet.</p>
        <p className="text-xs text-foreground/30">Analytics will appear once visitors start viewing your articles.</p>
      </div>
    );
  }

  const ctrColor = getCTRColor(data.overview.overall_ctr);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            Performance Analytics
          </h1>
          <p className="text-xs text-foreground/50 mt-1">Track affiliate performance, CTR, and revenue estimates.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-2 text-foreground/40 hover:text-foreground hover:bg-background rounded-xl transition-all"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="w-4 h-4 text-foreground/30" />
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              period === p.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background text-foreground/50 hover:text-foreground hover:bg-outline-variant/20 border border-outline-variant/30'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Views</span>
            <Eye className="w-5 h-5 text-blue-400/40" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(data.overview.total_views)}</p>
          <p className="text-[10px] text-foreground/40 mt-1">{formatNumber(data.overview.unique_views)} unique</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Clicks</span>
            <MousePointerClick className="w-5 h-5 text-purple-400/40" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatNumber(data.overview.total_clicks)}</p>
          <p className="text-[10px] text-foreground/40 mt-1">{formatNumber(data.overview.unique_clickers)} unique clickers</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">CTR</span>
            <TrendingUp className={`w-5 h-5 ${ctrColor.colorClass} opacity-40`} />
          </div>
          <p className={`text-2xl font-bold ${ctrColor.colorClass}`}>
            {data.overview.overall_ctr}%
          </p>
          <p className="text-[10px] text-foreground/40 mt-1">
            {ctrColor.emoji} {ctrColor.label}
          </p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Est. Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400/40" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.overview.estimated_revenue)}</p>
          <p className="text-[10px] text-foreground/40 mt-1">EPC: {formatCurrency(data.overview.estimated_epc)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-outline-variant/30 flex items-center gap-1 overflow-x-auto pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
              activeTab === tab.value
                ? 'text-foreground border-primary bg-white'
                : 'text-foreground/40 border-transparent hover:text-foreground/60 hover:bg-background/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <PerformanceGoals goals={data.goals} onUpdateSettings={handleSettingsUpdate} settings={settings} />
            <RevenueInsights overview={data.overview} settings={settings} onUpdateSettings={handleSettingsUpdate} />
            <Recommendations recommendations={data.recommendations} />
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-8">
            <ArticleLeaderboard articles={data.articles} />
            <BestConverters articles={data.best_converters} />
            <LowPerformers
              lowCtrArticles={data.low_ctr_articles}
              lowClickProducts={data.low_click_products}
              showProducts={false}
            />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <ProductLeaderboard products={data.products} />
            <LowPerformers
              lowCtrArticles={[]}
              lowClickProducts={data.low_click_products}
              showArticles={false}
            />
          </div>
        )}

        {activeTab === 'trending' && (
          <TrendingContent
            trendingArticles={data.trending_articles}
            trendingProducts={data.trending_products}
          />
        )}

        {activeTab === 'countries' && (
          <CountryAnalyticsPanel countries={data.countries} />
        )}

        {activeTab === 'referrers' && (
          <ReferrerAnalyticsPanel referrers={data.referrers} />
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            <ContentInsights insights={data.content_insights} />
            <Recommendations recommendations={data.recommendations} />
          </div>
        )}
      </div>
    </div>
  );
}
