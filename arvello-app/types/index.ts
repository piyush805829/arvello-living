export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  affiliate_link: string;
  price?: string;
  name?: string;
  why_recommend?: string;
  key_features?: string[];
  category?: 'home_decor' | 'skin_care' | 'other';
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  home_description: string;
  content: string; // Rich Text / HTML
  products: Product[];
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Analytics Types ──────────────────────────────────────────────────

export type AnalyticsEventType = 'page_view' | 'product_click';

export type AnalyticsPeriod = 'today' | '7d' | '30d' | 'all';

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  article_id: string;
  product_id: string | null;
  session_id: string;
  referrer: string;
  referrer_raw: string;
  country: string;
  user_agent: string;
  created_at: string;
}

export interface AnalyticsSettings {
  commission_rate: number;     // Percentage (e.g. 4 = 4%)
  commission_rate_home_decor?: number;
  commission_rate_skin_care?: number;
  average_order_value: number; // USD
  monthly_view_goal: number;
  monthly_click_goal: number;
  monthly_ctr_goal: number;    // Percentage
}

export interface ArticleAnalytics {
  article_id: string;
  title: string;
  slug: string;
  thumbnail: string;
  published_at: string | null;
  unique_views: number;
  total_views: number;
  unique_clickers: number;
  total_clicks: number;
  ctr: number;
  estimated_revenue: number;
  top_country: string;
  top_referrer: string;
  product_count: number;
}

export interface ProductAnalytics {
  product_id: string;
  title: string;
  image: string;
  affiliate_link: string;
  parent_article_id: string;
  parent_article_title: string;
  parent_article_slug: string;
  total_clicks: number;
  unique_clicks: number;
  ctr: number;
  estimated_revenue: number;
  top_country: string;
  last_click_at: string | null;
}

export interface CountryAnalytics {
  country: string;
  views: number;
  clicks: number;
  ctr: number;
  estimated_revenue: number;
}

export interface ReferrerAnalytics {
  source: string;
  views: number;
  clicks: number;
  ctr: number;
  top_article_title: string;
  top_article_slug: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  thumbnail?: string;
  slug?: string;
  current_period_count: number;
  previous_period_count: number;
  growth_rate: number; // Percentage change
  type: 'article' | 'product';
}

export interface AnalyticsRecommendation {
  id: string;
  type: 'success' | 'warning' | 'info' | 'action';
  title: string;
  message: string;
  metric?: string;
  value?: string;
}

export interface OverviewStats {
  total_views: number;
  unique_views: number;
  total_clicks: number;
  unique_clickers: number;
  overall_ctr: number;
  estimated_revenue: number;
  estimated_epc: number;
  revenue_per_article: number;
  revenue_per_product: number;
}

export interface AnalyticsDashboardData {
  overview: OverviewStats;
  articles: ArticleAnalytics[];
  products: ProductAnalytics[];
  countries: CountryAnalytics[];
  referrers: ReferrerAnalytics[];
  trending_articles: TrendingItem[];
  trending_products: TrendingItem[];
  low_ctr_articles: ArticleAnalytics[];
  low_click_products: ProductAnalytics[];
  best_converters: ArticleAnalytics[];
  recommendations: AnalyticsRecommendation[];
  goals: {
    views: { current: number; target: number; percentage: number };
    clicks: { current: number; target: number; percentage: number };
    ctr: { current: number; target: number; percentage: number };
  };
  content_insights: {
    avg_views_per_article: number;
    avg_clicks_per_article: number;
    avg_ctr: number;
    avg_products_per_article: number;
    avg_revenue_per_article: number;
  };
}
