// ── Analytics Utility Functions ──────────────────────────────────────
// Shared helpers for referrer classification, session IDs, CTR colors,
// growth rates, and revenue estimation.

/**
 * Classify a raw referrer URL into a named traffic source.
 */
export function classifyReferrer(rawUrl: string | null | undefined): string {
  if (!rawUrl || rawUrl.trim() === '') return 'Direct';

  const url = rawUrl.toLowerCase();

  // Pinterest
  if (url.includes('pinterest.com') || url.includes('pin.it')) return 'Pinterest';

  // Google
  if (url.includes('google.com/search') || url.includes('google.co')) {
    if (url.includes('tbm=isch') || url.includes('/imgres')) return 'Google Images';
    return 'Google Search';
  }

  // Social
  if (url.includes('facebook.com') || url.includes('fb.com') || url.includes('l.facebook.com')) return 'Facebook';
  if (url.includes('instagram.com') || url.includes('l.instagram.com')) return 'Instagram';
  if (url.includes('reddit.com') || url.includes('old.reddit.com')) return 'Reddit';
  if (url.includes('twitter.com') || url.includes('x.com') || url.includes('t.co')) return 'Twitter/X';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('tiktok.com')) return 'TikTok';

  // Search engines
  if (url.includes('bing.com')) return 'Bing';
  if (url.includes('duckduckgo.com')) return 'DuckDuckGo';
  if (url.includes('yahoo.com')) return 'Yahoo';

  // Email
  if (url.includes('mail.google.com') || url.includes('outlook.') || url.includes('mail.yahoo.com')) return 'Email';

  return 'Other';
}

/**
 * Generate a random anonymous session ID for tracking.
 */
export function generateSessionId(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Return a CTR color indicator based on the rate.
 * 🟢 Excellent: ≥ 5%
 * 🟡 Average: 2% – 5%
 * 🔴 Low: < 2%
 */
export function getCTRColor(ctr: number): { emoji: string; label: string; colorClass: string } {
  if (ctr >= 5) {
    return { emoji: '🟢', label: 'Excellent', colorClass: 'text-emerald-600' };
  }
  if (ctr >= 2) {
    return { emoji: '🟡', label: 'Average', colorClass: 'text-amber-500' };
  }
  return { emoji: '🔴', label: 'Low', colorClass: 'text-red-500' };
}

/**
 * Calculate growth rate between two periods.
 * Returns percentage change (e.g., 700 for +700%).
 */
export function calculateGrowthRate(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // New content: 100% growth if any activity
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format a growth rate as a display string.
 */
export function formatGrowthRate(rate: number): string {
  if (rate === 0) return '0%';
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate}%`;
}

/**
 * Calculate estimated revenue from clicks.
 */
export function calculateEstimatedRevenue(
  clicks: number,
  commissionRate: number,
  averageOrderValue: number
): number {
  return clicks * (commissionRate / 100) * averageOrderValue;
}

/**
 * Calculate Earnings Per Click (EPC).
 */
export function calculateEPC(
  totalRevenue: number,
  totalClicks: number
): number {
  if (totalClicks === 0) return 0;
  return totalRevenue / totalClicks;
}

/**
 * Format currency value.
 */
export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format large numbers with abbreviations.
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

/**
 * Get a date range for a given period.
 */
export function getPeriodDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case 'all':
    default:
      start.setFullYear(2020, 0, 1); // Far enough in the past
      break;
  }

  return { start, end };
}

/**
 * Get the previous period date range for growth comparison.
 * E.g., if current is "7d", previous is the 7 days before that.
 */
export function getPreviousPeriodDateRange(period: string): { start: Date; end: Date } {
  const currentRange = getPeriodDateRange(period);
  const durationMs = currentRange.end.getTime() - currentRange.start.getTime();

  return {
    start: new Date(currentRange.start.getTime() - durationMs),
    end: new Date(currentRange.start.getTime()),
  };
}

/**
 * Country code to display name mapping (top countries).
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IN: 'India',
  BR: 'Brazil',
  JP: 'Japan',
  MX: 'Mexico',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  SE: 'Sweden',
  PL: 'Poland',
  PH: 'Philippines',
  NG: 'Nigeria',
  ZA: 'South Africa',
  KR: 'South Korea',
  Unknown: 'Unknown',
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}
