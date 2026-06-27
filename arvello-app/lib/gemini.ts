import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize the Gemini AI SDK
const genAI = new GoogleGenerativeAI(apiKey);

interface AIProductResponse {
  title: string;
  description: string;
  why_recommend: string;
  key_features: string[];
  category: 'home_decor' | 'skin_care' | 'other';
}

// Download image from URL and convert to Gemini-compatible base64 inline data
async function fetchImageAsInlineData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    
    return {
      inlineData: {
        data: base64Data,
        mimeType: contentType,
      },
    };
  } catch (error) {
    console.error('Error fetching image for Gemini:', error);
    throw error;
  }
}

export async function generateProductDetails(imageUrl: string, affiliateLink: string): Promise<AIProductResponse> {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment variables');
  }

  // Use the fast multimodal 2.5-flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const imagePart = await fetchImageAsInlineData(imageUrl);
  
  const prompt = `
    You are an expert luxury/lifestyle editor for Arvello Living, a high-fashion, minimalist design blog.
    Analyze the uploaded product image and the affiliate link below:
    
    Affiliate Link: ${affiliateLink}
    
    Tasks:
    1. Identify the product name, materials, aesthetic (e.g. minimalist, walnut, leather, modern, chic), and quality.
    2. Suggest an appealing, short product title (maximum 4-5 words, e.g. "Herman Miller Aeron Chair", "Minimalist Walnut Table Lamp").
    3. Generate a 2-3 sentence engaging description. Focus on quiet luxury, high-end design, and lifestyle integration (how it elevates the living space).
    4. Generate a short 1-2 sentence recommendation statement for "why_recommend" describing why our editors love and recommend this product (e.g. "Crafted with a meticulous balance of raw materiality and utility...").
    5. Generate a list of exactly 3 short, specific bullet points for "key_features" (e.g. ["Solid walnut legs", "Dimmable LED", "Genuine full-grain leather"]). Each bullet should be 1-4 words.
    6. Classify the product into exactly one of these three categories: "home_decor" (furniture, lighting, vases, rugs, frames, decor, bedding, cushions, home scent), "skin_care" (creams, serums, oils, body wash, cosmetics, beauty tools, hand lotion), or "other" (everything else).
    
    Return a JSON object conforming exactly to this structure:
    {
      "title": "Clean Product Title",
      "description": "Engaging editorial description.",
      "why_recommend": "Specific 1-2 sentence recommendation statement.",
      "key_features": ["Feature 1", "Feature 2", "Feature 3"],
      "category": "home_decor"
    }
  `;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  
  try {
    const data = JSON.parse(text) as AIProductResponse;
    
    // Normalize category
    let category: 'home_decor' | 'skin_care' | 'other' = 'other';
    if (data.category === 'home_decor' || data.category === 'skin_care') {
      category = data.category;
    }

    return {
      title: data.title || 'Curated Product Selection',
      description: data.description || 'Elevate your living space with this carefully selected editorial item.',
      why_recommend: data.why_recommend || 'Selected for its flawless execution of warm minimalist design principles and superior craftsmanship.',
      key_features: data.key_features || ['Minimalist form factor', 'Premium craftsmanship', 'Timeless design appeal'],
      category: category,
    };
  } catch (error) {
    console.error('Failed to parse Gemini JSON output. Raw output:', text, error);
    // Fallback if parsing fails
    return {
      title: 'Curated Design Selection',
      description: 'A hand-selected addition to the editorial layout, curated for the modern minimalist home.',
      why_recommend: 'Selected for its flawless execution of warm minimalist design principles and superior craftsmanship.',
      key_features: ['Minimalist form factor', 'Premium craftsmanship', 'Timeless design appeal'],
      category: 'other',
    };
  }
}

interface AIArticleResponse {
  title: string;
  home_description: string;
  content: string;
}

export async function generateArticleDetails(imageUrl: string): Promise<AIArticleResponse> {
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment variables');
  }

  // Use the fast multimodal 2.5-flash model
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const imagePart = await fetchImageAsInlineData(imageUrl);
  
  const prompt = `
    You are an expert luxury/lifestyle editor for Arvello Living, a high-fashion, minimalist design blog.
    Analyze the uploaded article thumbnail image:
    
    Tasks:
    1. Identify the aesthetic theme, style, materials, and mood of the image.
    2. Write an appealing, sophisticated editorial Article Title (maximum 6-8 words).
    3. Generate a 2-3 sentence engaging Home Page Description summarizing the article for an overview card.
    4. Write a comprehensive, multi-paragraph Article Body Content (minimum 3-4 paragraphs) in clean HTML format.
       - Focus on design details, quiet luxury, high-end lifestyle, and spaces.
       - Use HTML tags: <p> for paragraphs, <h2> for subheadings, <blockquote> for quotes, and <strong> for emphasis. Do NOT wrap in markdown block, just output the raw HTML inside the JSON field.
       - Ensure the blockquote (using <blockquote>) contains a unique, profound philosophical quote about design, architecture, wellness, or lifestyle that is directly inspired by the specific elements of the thumbnail image (e.g. if the image contains skincare/vanity, the quote should be about daily self-care/wellness; if it contains a desk, the quote should be about productivity and intentional workspace; if it contains a living room, the quote should be about gathering or curated spaces). Do NOT reuse generic templates like "True luxury is not about...". Make it completely custom, context-specific, and unique to this article.
    
    Return a JSON object conforming exactly to this structure:
    {
      "title": "Editorial Article Title",
      "home_description": "Engaging editorial summary.",
      "content": "<p>First paragraph detailing design...</p><h2>Subheading</h2><p>Second paragraph...</p>"
    }
  `;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  
  try {
    const data = JSON.parse(text) as AIArticleResponse;
    return {
      title: data.title || 'Untitled Editorial Piece',
      home_description: data.home_description || 'Explore our latest design curation, focusing on minimalist spaces and quiet luxury.',
      content: data.content || '<p>This article details our latest design curation, focusing on minimalist spaces and quiet luxury.</p>',
    };
  } catch {
    console.error('Failed to parse Gemini JSON output for article. Raw output:', text);
    // Fallback if parsing fails
    return {
      title: 'Curated Design Curation',
      home_description: 'A hand-selected addition to the editorial layout, curated for the modern minimalist home.',
      content: `<p>A hand-selected addition to the editorial layout, curated for the modern minimalist home.</p><h2>The Aesthetic Philosophy</h2><p>Our philosophy focuses on clean lines, high-quality natural materials, and quiet luxury. We believe spaces should inspire calm and creative focus.</p>`,
    };
  }
}

