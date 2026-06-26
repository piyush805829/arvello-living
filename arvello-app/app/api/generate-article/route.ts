import { NextResponse } from 'next/server';
import { generateArticleDetails } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    // Simple validation
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail image URL is required' },
        { status: 400 }
      );
    }

    // Generate article details using Gemini
    const { title, home_description, content } = await generateArticleDetails(imageUrl);

    return NextResponse.json({
      success: true,
      title,
      home_description,
      content,
    });
  } catch (error) {
    console.error('Article generator endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during article generation';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
