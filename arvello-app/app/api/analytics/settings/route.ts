import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/analytics/settings — Read analytics settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('analytics_settings')
      .select('*');

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    const settings: Record<string, string> = {};
    (data || []).forEach((s: { id: string; value: string }) => {
      settings[s.id] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        commission_rate: parseFloat(settings.commission_rate || '4'),
        commission_rate_home_decor: parseFloat(settings.commission_rate_home_decor || '5'),
        commission_rate_skin_care: parseFloat(settings.commission_rate_skin_care || '10'),
        average_order_value: parseFloat(settings.average_order_value || '35'),
        monthly_view_goal: parseInt(settings.monthly_view_goal || '10000'),
        monthly_click_goal: parseInt(settings.monthly_click_goal || '500'),
        monthly_ctr_goal: parseFloat(settings.monthly_ctr_goal || '5'),
      },
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/analytics/settings — Update analytics settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updates: { id: string; value: string; updated_at: string }[] = [];

    const validKeys = [
      'commission_rate',
      'commission_rate_home_decor',
      'commission_rate_skin_care',
      'average_order_value',
      'monthly_view_goal',
      'monthly_click_goal',
      'monthly_ctr_goal',
    ];

    for (const key of validKeys) {
      if (body[key] !== undefined) {
        updates.push({
          id: key,
          value: String(body[key]),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid settings to update' },
        { status: 400 }
      );
    }

    // Upsert each setting
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('analytics_settings')
        .upsert(update, { onConflict: 'id' });

      if (error) {
        console.error(`Error updating ${update.id}:`, error);
        return NextResponse.json(
          { success: false, error: `Failed to update ${update.id}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
