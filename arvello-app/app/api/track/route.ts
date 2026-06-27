import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { classifyReferrer } from '@/lib/analytics';

// POST /api/track — Public endpoint for recording analytics events
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, article_id, product_id, session_id, referrer } = body;

    // Validate required fields
    if (!event_type || !article_id || !session_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only allow valid event types
    if (event_type !== 'page_view' && event_type !== 'product_click') {
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Classify referrer
    const classifiedReferrer = classifyReferrer(referrer);

    // Extract country from Vercel geo headers (works on Vercel deployments)
    // Falls back to 'Unknown' for local development
    const headers = Object.fromEntries(request.headers.entries());
    const country = headers['x-vercel-ip-country'] || 'Unknown';
    const userAgent = headers['user-agent'] || '';

    // Insert event
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        event_type,
        article_id,
        product_id: product_id || null,
        session_id,
        referrer: classifiedReferrer,
        referrer_raw: referrer || '',
        country,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Analytics insert error:', error);
      // Don't expose internal errors to public endpoint
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
