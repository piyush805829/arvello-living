import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to generate a unique, URL-safe slug from a title
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric chars except space and hyphen
    .replace(/[\s_]+/g, '-')      // replace spaces and underscores with hyphens
    .replace(/-+/g, '-')          // replace consecutive hyphens
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens

  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('id')
      .eq('slug', slug);

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      // Fallback in case of DB check failure
      isUnique = true;
    } else if (!data || data.length === 0) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  return slug;
}

import { cookies } from 'next/headers';
import { decryptSession } from '@/lib/auth';

// GET /api/articles
// Supports optional status filtering (?status=published)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // Security: Only allow authenticated admins to see all articles (including drafts)
    if (statusFilter !== 'published') {
      const cookieStore = await cookies();
      const token = cookieStore.get('admin_session')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin session required to view all drafts' },
          { status: 401 }
        );
      }

      const session = await decryptSession(token);
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid session' },
          { status: 401 }
        );
      }
    }

    let query = supabaseAdmin
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to fetch articles: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      articles,
    });
  } catch (error) {
    console.error('Articles GET route error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/articles
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, thumbnail, home_description, content, products, status } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }
    if (!thumbnail || !thumbnail.trim()) {
      errors.thumbnail = 'Thumbnail image is required';
    }
    if (!home_description || !home_description.trim()) {
      errors.home_description = 'Home page description is required';
    }
    if (!content || !content.trim()) {
      errors.content = 'Article content is required';
    }

    // Validate products array if provided
    if (products && Array.isArray(products)) {
      products.forEach((p: unknown, idx: number) => {
        const prod = p as Record<string, string>;
        if (!prod.image) {
          errors[`products.${idx}.image`] = `Product ${idx + 1} image is required`;
        }
        if (!prod.affiliate_link) {
          errors[`products.${idx}.affiliate_link`] = `Product ${idx + 1} affiliate link is required`;
        } else {
          try {
            new URL(prod.affiliate_link);
          } catch {
            errors[`products.${idx}.affiliate_link`] = `Product ${idx + 1} affiliate link must be a valid URL`;
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(title);
    const articleStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = articleStatus === 'published' ? new Date().toISOString() : null;

    const { data: newArticle, error } = await supabaseAdmin
      .from('articles')
      .insert({
        title,
        slug,
        thumbnail,
        home_description,
        content,
        products: products || [],
        status: articleStatus,
        published_at: publishedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to save article: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      article: newArticle,
    });
  } catch (error) {
    console.error('Articles POST route error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
