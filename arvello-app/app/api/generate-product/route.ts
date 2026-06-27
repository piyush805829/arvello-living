import { NextResponse } from 'next/server';
import { generateProductDetails } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, affiliateLink } = body;

    // Simple validation
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Product image URL is required' },
        { status: 400 }
      );
    }

    if (!affiliateLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link is required' },
        { status: 400 }
      );
    }

    // URL validation
    try {
      new URL(affiliateLink);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid affiliate link URL' },
        { status: 400 }
      );
    }

    // Generate product details using Gemini
    const { title, description, why_recommend, key_features } = await generateProductDetails(imageUrl, affiliateLink);

    return NextResponse.json({
      success: true,
      title,
      description,
      why_recommend,
      key_features,
    });
  } catch (error) {
    console.error('Product generator endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during product generation';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
