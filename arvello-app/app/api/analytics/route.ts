import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  calculateEstimatedRevenue,
  calculateEPC,
  calculateGrowthRate,
  getPeriodDateRange,
  getPreviousPeriodDateRange,
} from '@/lib/analytics';
import type {
  ArticleAnalytics,
  ProductAnalytics,
  CountryAnalytics,
  ReferrerAnalytics,
  TrendingItem,
  AnalyticsRecommendation,
  AnalyticsDashboardData,
  Article,
  Product,
} from '@/types';

// GET /api/analytics — Aggregated analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // 1. Load settings
    const { data: settingsData } = await supabaseAdmin
      .from('analytics_settings')
      .select('*');

    const settings: Record<string, string> = {};
    (settingsData || []).forEach((s: { id: string; value: string }) => {
      settings[s.id] = s.value;
    });

    const commissionRate = parseFloat(settings.commission_rate || '4');
    const commissionRateHomeDecor = parseFloat(settings.commission_rate_home_decor || '5');
    const commissionRateSkinCare = parseFloat(settings.commission_rate_skin_care || '10');
    const aov = parseFloat(settings.average_order_value || '35');
    const monthlyViewGoal = parseInt(settings.monthly_view_goal || '10000');
    const monthlyClickGoal = parseInt(settings.monthly_click_goal || '500');
    const monthlyCtrGoal = parseFloat(settings.monthly_ctr_goal || '5');

    // 2. Get date range
    const { start, end } = getPeriodDateRange(period);
    const { start: prevStart, end: prevEnd } = getPreviousPeriodDateRange(period);

    // 3. Fetch all events in period
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // 4. Fetch previous period events for trending
    const { data: prevEvents } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString());

    // 5. Fetch all published articles for metadata
    const { data: articlesData } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('status', 'published');

    const articles = (articlesData || []) as Article[];
    const articlesMap = new Map<string, Article>();
    articles.forEach((a) => articlesMap.set(a.id, a));

    // ── Compute Overview Stats ──────────────────────────────────────
    const allEvents = events || [];
    const pageViews = allEvents.filter((e) => e.event_type === 'page_view');
    const productClicks = allEvents.filter((e) => e.event_type === 'product_click');

    const uniqueViewSessions = new Set(pageViews.map((e) => e.session_id));
    const uniqueClickSessions = new Set(productClicks.map((e) => e.session_id));

    const totalViews = pageViews.length;
    const uniqueViews = uniqueViewSessions.size;
    const totalClicks = productClicks.length;
    const uniqueClickers = uniqueClickSessions.size;
    const overallCtr = uniqueViews > 0
      ? Math.round((uniqueClickers / uniqueViews) * 10000) / 100
      : 0;

    // Build lookup maps for products and parents to identify categories dynamically
    const productsMap = new Map<string, Product>();
    articles.forEach((a) => {
      (a.products || []).forEach((p) => {
        productsMap.set(p.id, p);
      });
    });

    const getProductCommission = (pId: string | null) => {
      if (!pId) return commissionRate;
      const product = productsMap.get(pId);
      if (!product) return commissionRate;
      if (product.category === 'home_decor') return commissionRateHomeDecor;
      if (product.category === 'skin_care') return commissionRateSkinCare;
      return commissionRate;
    };

    // Calculate estimated revenue by aggregating the commission per click event
    let estimatedRevenue = 0;
    const articleRevenueMap = new Map<string, number>();
    const countryRevenueMap = new Map<string, number>();

    productClicks.forEach((e) => {
      const rate = getProductCommission(e.product_id);
      const rev = (rate / 100) * aov;
      estimatedRevenue += rev;
      articleRevenueMap.set(e.article_id, (articleRevenueMap.get(e.article_id) || 0) + rev);
      countryRevenueMap.set(e.country, (countryRevenueMap.get(e.country) || 0) + rev);
    });

    const estimatedEpc = calculateEPC(estimatedRevenue, totalClicks);
    const publishedArticleCount = articles.length;
    const totalProductCount = articles.reduce((acc, a) => acc + (a.products?.length || 0), 0);

    // ── Article Analytics ────────────────────────────────────────────
    const articleViewMap = new Map<string, { total: number; sessions: Set<string> }>();
    const articleClickMap = new Map<string, { total: number; sessions: Set<string> }>();
    const articleCountryMap = new Map<string, Map<string, number>>();
    const articleReferrerMap = new Map<string, Map<string, number>>();

    pageViews.forEach((e) => {
      const entry = articleViewMap.get(e.article_id) || { total: 0, sessions: new Set<string>() };
      entry.total++;
      entry.sessions.add(e.session_id);
      articleViewMap.set(e.article_id, entry);

      // Country
      const countryMap = articleCountryMap.get(e.article_id) || new Map<string, number>();
      countryMap.set(e.country, (countryMap.get(e.country) || 0) + 1);
      articleCountryMap.set(e.article_id, countryMap);

      // Referrer
      const refMap = articleReferrerMap.get(e.article_id) || new Map<string, number>();
      refMap.set(e.referrer, (refMap.get(e.referrer) || 0) + 1);
      articleReferrerMap.set(e.article_id, refMap);
    });

    productClicks.forEach((e) => {
      const entry = articleClickMap.get(e.article_id) || { total: 0, sessions: new Set<string>() };
      entry.total++;
      entry.sessions.add(e.session_id);
      articleClickMap.set(e.article_id, entry);
    });

    const articleAnalytics: ArticleAnalytics[] = articles.map((article) => {
      const views = articleViewMap.get(article.id);
      const clicks = articleClickMap.get(article.id);
      const uniqueArticleViews = views?.sessions.size || 0;
      const totalArticleClicks = clicks?.total || 0;
      const articleCtr = uniqueArticleViews > 0
        ? Math.round((totalArticleClicks / uniqueArticleViews) * 10000) / 100
        : 0;

      // Top country
      const countryMap = articleCountryMap.get(article.id);
      let topCountry = 'Unknown';
      if (countryMap) {
        let maxCount = 0;
        countryMap.forEach((count, country) => {
          if (count > maxCount) { maxCount = count; topCountry = country; }
        });
      }

      // Top referrer
      const refMap = articleReferrerMap.get(article.id);
      let topReferrer = 'Direct';
      if (refMap) {
        let maxCount = 0;
        refMap.forEach((count, ref) => {
          if (count > maxCount) { maxCount = count; topReferrer = ref; }
        });
      }

      return {
        article_id: article.id,
        title: article.title,
        slug: article.slug,
        thumbnail: article.thumbnail,
        published_at: article.published_at,
        unique_views: uniqueArticleViews,
        total_views: views?.total || 0,
        unique_clickers: clicks?.sessions.size || 0,
        total_clicks: totalArticleClicks,
        ctr: articleCtr,
        estimated_revenue: articleRevenueMap.get(article.id) || 0,
        top_country: topCountry,
        top_referrer: topReferrer,
        product_count: article.products?.length || 0,
      };
    });

    // ── Product Analytics ────────────────────────────────────────────
    const productClickMap = new Map<string, { total: number; sessions: Set<string>; countries: Map<string, number>; lastClick: string }>();

    productClicks.forEach((e) => {
      if (!e.product_id) return;
      const entry = productClickMap.get(e.product_id) || {
        total: 0,
        sessions: new Set<string>(),
        countries: new Map<string, number>(),
        lastClick: '',
      };
      entry.total++;
      entry.sessions.add(e.session_id);
      entry.countries.set(e.country, (entry.countries.get(e.country) || 0) + 1);
      if (!entry.lastClick || e.created_at > entry.lastClick) {
        entry.lastClick = e.created_at;
      }
      productClickMap.set(e.product_id, entry);
    });

    const productAnalytics: ProductAnalytics[] = [];
    articles.forEach((article) => {
      (article.products || []).forEach((product) => {
        const clickData = productClickMap.get(product.id);
        const parentViews = articleViewMap.get(article.id)?.sessions.size || 0;
        const prodClicks = clickData?.total || 0;
        const productCtr = parentViews > 0
          ? Math.round((prodClicks / parentViews) * 10000) / 100
          : 0;

        let topCountry = 'Unknown';
        if (clickData?.countries) {
          let maxCount = 0;
          clickData.countries.forEach((count, country) => {
            if (count > maxCount) { maxCount = count; topCountry = country; }
          });
        }

        productAnalytics.push({
          product_id: product.id,
          title: product.title || product.name || 'Product',
          image: product.image,
          affiliate_link: product.affiliate_link,
          parent_article_id: article.id,
          parent_article_title: article.title,
          parent_article_slug: article.slug,
          total_clicks: prodClicks,
          unique_clicks: clickData?.sessions.size || 0,
          ctr: productCtr,
          estimated_revenue: calculateEstimatedRevenue(
            prodClicks,
            product.category === 'home_decor'
              ? commissionRateHomeDecor
              : product.category === 'skin_care'
              ? commissionRateSkinCare
              : commissionRate,
            aov
          ),
          top_country: topCountry,
          last_click_at: clickData?.lastClick || null,
        });
      });
    });

    // ── Country Analytics ────────────────────────────────────────────
    const countryViewMap = new Map<string, number>();
    const countryClickMap = new Map<string, number>();

    pageViews.forEach((e) => {
      countryViewMap.set(e.country, (countryViewMap.get(e.country) || 0) + 1);
    });
    productClicks.forEach((e) => {
      countryClickMap.set(e.country, (countryClickMap.get(e.country) || 0) + 1);
    });

    const allCountries = new Set([...countryViewMap.keys(), ...countryClickMap.keys()]);
    const countryAnalytics: CountryAnalytics[] = Array.from(allCountries).map((country) => {
      const views = countryViewMap.get(country) || 0;
      const clicks = countryClickMap.get(country) || 0;
      return {
        country,
        views,
        clicks,
        ctr: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0,
        estimated_revenue: countryRevenueMap.get(country) || 0,
      };
    });

    // ── Referrer Analytics ───────────────────────────────────────────
    const referrerViewMap = new Map<string, number>();
    const referrerClickMap = new Map<string, number>();
    const referrerTopArticle = new Map<string, Map<string, number>>();

    pageViews.forEach((e) => {
      referrerViewMap.set(e.referrer, (referrerViewMap.get(e.referrer) || 0) + 1);
      const articleMap = referrerTopArticle.get(e.referrer) || new Map<string, number>();
      articleMap.set(e.article_id, (articleMap.get(e.article_id) || 0) + 1);
      referrerTopArticle.set(e.referrer, articleMap);
    });
    productClicks.forEach((e) => {
      referrerClickMap.set(e.referrer, (referrerClickMap.get(e.referrer) || 0) + 1);
    });

    const allReferrers = new Set([...referrerViewMap.keys(), ...referrerClickMap.keys()]);
    const referrerAnalytics: ReferrerAnalytics[] = Array.from(allReferrers).map((source) => {
      const views = referrerViewMap.get(source) || 0;
      const clicks = referrerClickMap.get(source) || 0;

      // Find top article for this referrer
      let topArticleTitle = '';
      let topArticleSlug = '';
      const articleMap = referrerTopArticle.get(source);
      if (articleMap) {
        let maxCount = 0;
        let topArticleId = '';
        articleMap.forEach((count, articleId) => {
          if (count > maxCount) { maxCount = count; topArticleId = articleId; }
        });
        const article = articlesMap.get(topArticleId);
        if (article) {
          topArticleTitle = article.title;
          topArticleSlug = article.slug;
        }
      }

      return {
        source,
        views,
        clicks,
        ctr: views > 0 ? Math.round((clicks / views) * 10000) / 100 : 0,
        top_article_title: topArticleTitle,
        top_article_slug: topArticleSlug,
      };
    });

    // ── Trending ─────────────────────────────────────────────────────
    const prevEventsArr = prevEvents || [];
    const prevArticleViews = new Map<string, number>();
    const prevProductClicks = new Map<string, number>();

    prevEventsArr.forEach((e) => {
      if (e.event_type === 'page_view') {
        prevArticleViews.set(e.article_id, (prevArticleViews.get(e.article_id) || 0) + 1);
      }
      if (e.event_type === 'product_click' && e.product_id) {
        prevProductClicks.set(e.product_id, (prevProductClicks.get(e.product_id) || 0) + 1);
      }
    });

    const trendingArticles: TrendingItem[] = articleAnalytics
      .map((a) => ({
        id: a.article_id,
        title: a.title,
        thumbnail: a.thumbnail,
        slug: a.slug,
        current_period_count: a.total_views,
        previous_period_count: prevArticleViews.get(a.article_id) || 0,
        growth_rate: calculateGrowthRate(
          prevArticleViews.get(a.article_id) || 0,
          a.total_views
        ),
        type: 'article' as const,
      }))
      .sort((a, b) => b.growth_rate - a.growth_rate)
      .slice(0, 10);

    const trendingProducts: TrendingItem[] = productAnalytics
      .map((p) => ({
        id: p.product_id,
        title: p.title,
        thumbnail: p.image,
        current_period_count: p.total_clicks,
        previous_period_count: prevProductClicks.get(p.product_id) || 0,
        growth_rate: calculateGrowthRate(
          prevProductClicks.get(p.product_id) || 0,
          p.total_clicks
        ),
        type: 'product' as const,
      }))
      .sort((a, b) => b.growth_rate - a.growth_rate)
      .slice(0, 10);

    // ── Low Performers ───────────────────────────────────────────────
    const lowCtrArticles = [...articleAnalytics]
      .filter((a) => a.unique_views >= 10 && a.ctr < 2)
      .sort((a, b) => a.ctr - b.ctr)
      .slice(0, 5);

    const lowClickProducts = [...productAnalytics]
      .sort((a, b) => a.total_clicks - b.total_clicks)
      .slice(0, 5);

    // ── Best Converters ──────────────────────────────────────────────
    const bestConverters = [...articleAnalytics]
      .filter((a) => a.unique_views >= 5)
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 5);

    // ── Performance Goals (Monthly) ──────────────────────────────────
    // Get current month's data
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEvents = allEvents.filter(
      (e) => new Date(e.created_at) >= monthStart
    );
    const monthViews = monthEvents.filter((e) => e.event_type === 'page_view').length;
    const monthClicks = monthEvents.filter((e) => e.event_type === 'product_click').length;
    const monthUniqueSessions = new Set(
      monthEvents.filter((e) => e.event_type === 'page_view').map((e) => e.session_id)
    ).size;
    const monthUniqueClickers = new Set(
      monthEvents.filter((e) => e.event_type === 'product_click').map((e) => e.session_id)
    ).size;
    const monthCtr = monthUniqueSessions > 0
      ? Math.round((monthUniqueClickers / monthUniqueSessions) * 10000) / 100
      : 0;

    // ── Content Insights ─────────────────────────────────────────────
    const avgViewsPerArticle = publishedArticleCount > 0
      ? Math.round(totalViews / publishedArticleCount)
      : 0;
    const avgClicksPerArticle = publishedArticleCount > 0
      ? Math.round((totalClicks / publishedArticleCount) * 10) / 10
      : 0;
    const avgCtr = publishedArticleCount > 0
      ? Math.round(
          (articleAnalytics.reduce((sum, a) => sum + a.ctr, 0) / publishedArticleCount) * 100
        ) / 100
      : 0;
    const avgProductsPerArticle = publishedArticleCount > 0
      ? Math.round((totalProductCount / publishedArticleCount) * 10) / 10
      : 0;
    const avgRevenuePerArticle = publishedArticleCount > 0
      ? Math.round((estimatedRevenue / publishedArticleCount) * 100) / 100
      : 0;

    // ── Recommendations ──────────────────────────────────────────────
    const recommendations: AnalyticsRecommendation[] = [];

    if (overallCtr >= 5) {
      recommendations.push({
        id: 'high-ctr',
        type: 'success',
        title: 'Strong Conversion Rate',
        message: `Your overall CTR of ${overallCtr}% is excellent! Keep your current content strategy going.`,
        metric: 'CTR',
        value: `${overallCtr}%`,
      });
    } else if (overallCtr < 2 && totalViews > 50) {
      recommendations.push({
        id: 'low-ctr',
        type: 'warning',
        title: 'Low Click-Through Rate',
        message: 'Consider improving product placement, using more compelling product images, and adding stronger calls-to-action in your articles.',
        metric: 'CTR',
        value: `${overallCtr}%`,
      });
    }

    if (lowCtrArticles.length > 0) {
      recommendations.push({
        id: 'low-ctr-articles',
        type: 'action',
        title: 'Articles Need Attention',
        message: `${lowCtrArticles.length} article(s) have high views but low CTR. Consider repositioning products, updating images, or refreshing the content.`,
        metric: 'Low CTR Articles',
        value: `${lowCtrArticles.length}`,
      });
    }

    if (bestConverters.length > 0 && bestConverters[0].ctr > 5) {
      recommendations.push({
        id: 'best-converter',
        type: 'info',
        title: 'Top Performing Article',
        message: `"${bestConverters[0].title}" has a ${bestConverters[0].ctr}% CTR. Study its structure and apply similar patterns to other articles.`,
        metric: 'Best CTR',
        value: `${bestConverters[0].ctr}%`,
      });
    }

    if (trendingArticles.length > 0 && trendingArticles[0].growth_rate > 50) {
      recommendations.push({
        id: 'trending',
        type: 'info',
        title: 'Content Gaining Traction',
        message: `"${trendingArticles[0].title}" is trending with ${trendingArticles[0].growth_rate}% growth. Consider adding more products to capitalize on the traffic.`,
        metric: 'Growth',
        value: `+${trendingArticles[0].growth_rate}%`,
      });
    }

    if (publishedArticleCount < 5) {
      recommendations.push({
        id: 'more-content',
        type: 'action',
        title: 'Publish More Content',
        message: 'Aim for at least 10 published articles to build a reliable traffic base. More content means more opportunities for affiliate clicks.',
        metric: 'Articles',
        value: `${publishedArticleCount}`,
      });
    }

    // ── Build Response ───────────────────────────────────────────────
    const dashboardData: AnalyticsDashboardData = {
      overview: {
        total_views: totalViews,
        unique_views: uniqueViews,
        total_clicks: totalClicks,
        unique_clickers: uniqueClickers,
        overall_ctr: overallCtr,
        estimated_revenue: Math.round(estimatedRevenue * 100) / 100,
        estimated_epc: Math.round(estimatedEpc * 100) / 100,
        revenue_per_article: publishedArticleCount > 0
          ? Math.round((estimatedRevenue / publishedArticleCount) * 100) / 100
          : 0,
        revenue_per_product: totalProductCount > 0
          ? Math.round((estimatedRevenue / totalProductCount) * 100) / 100
          : 0,
      },
      articles: articleAnalytics,
      products: productAnalytics,
      countries: countryAnalytics.sort((a, b) => b.views - a.views),
      referrers: referrerAnalytics.sort((a, b) => b.views - a.views),
      trending_articles: trendingArticles,
      trending_products: trendingProducts,
      low_ctr_articles: lowCtrArticles,
      low_click_products: lowClickProducts,
      best_converters: bestConverters,
      recommendations,
      goals: {
        views: {
          current: monthViews,
          target: monthlyViewGoal,
          percentage: Math.min(
            Math.round((monthViews / monthlyViewGoal) * 10000) / 100,
            100
          ),
        },
        clicks: {
          current: monthClicks,
          target: monthlyClickGoal,
          percentage: Math.min(
            Math.round((monthClicks / monthlyClickGoal) * 10000) / 100,
            100
          ),
        },
        ctr: {
          current: monthCtr,
          target: monthlyCtrGoal,
          percentage: Math.min(
            Math.round((monthCtr / monthlyCtrGoal) * 10000) / 100,
            100
          ),
        },
      },
      content_insights: {
        avg_views_per_article: avgViewsPerArticle,
        avg_clicks_per_article: avgClicksPerArticle,
        avg_ctr: avgCtr,
        avg_products_per_article: avgProductsPerArticle,
        avg_revenue_per_article: avgRevenuePerArticle,
      },
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
