export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  affiliate_link: string;
  price?: string;
  name?: string;
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
