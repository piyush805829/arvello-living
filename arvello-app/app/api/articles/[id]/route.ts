import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Helper to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// GET /api/articles/[idOrSlug]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;

    let query = supabaseAdmin.from('articles').select('*');

    if (isUUID(idOrSlug)) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: article, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to fetch article: ${error.message}` },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error('Article GET error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get current article to check previous status
    const { data: currentArticle, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('status, published_at')
      .eq('id', id)
      .single();

    if (fetchError || !currentArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const nextStatus = status === 'published' ? 'published' : 'draft';
    let publishedAt = currentArticle.published_at;

    if (nextStatus === 'published' && currentArticle.status === 'draft') {
      publishedAt = new Date().toISOString();
    } else if (nextStatus === 'draft') {
      publishedAt = null;
    }

    const { data: updatedArticle, error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        title,
        thumbnail,
        home_description,
        content,
        products: products || [],
        status: nextStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { success: false, error: `Failed to update article: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('Article PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { success: false, error: `Failed to delete article: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Article DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
