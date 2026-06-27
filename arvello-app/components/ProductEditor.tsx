'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Trash2, Sparkles, Link as LinkIcon, UploadCloud, Plus, Loader2, Package } from 'lucide-react';

interface ProductEditorProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

export default function ProductEditor({ products, onChange }: ProductEditorProps) {
  const [uploadingIds, setUploadingIds] = useState<Record<string, boolean>>({});
  const [generatingIds, setGeneratingIds] = useState<Record<string, boolean>>({});
  const [draggingIds, setDraggingIds] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addProduct = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      image: '',
      title: '',
      description: '',
      affiliate_link: '',
      why_recommend: '',
      key_features: [],
      category: 'other',
    };
    onChange([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
    // Clean up error state if any
    const newErrors = { ...errors };
    delete newErrors[`${id}-image`];
    delete newErrors[`${id}-link`];
    delete newErrors[`${id}-gen`];
    setErrors(newErrors);
  };

  const updateProduct = (id: string, fields: Partial<Product>) => {
    onChange(
      products.map((p) => (p.id === id ? { ...p, ...fields } : p))
    );
  };

  const handleImageUpload = async (id: string, file: File) => {
    if (!file) return;

    setUploadingIds((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [`${id}-image`]: '' }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      updateProduct(id, { image: data.url });
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setErrors((prev) => ({ ...prev, [`${id}-image`]: errorMessage }));
    } finally {
      setUploadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    setDraggingIds((prev) => ({ ...prev, [id]: true }));
  };

  const handleDragLeave = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    setDraggingIds((prev) => ({ ...prev, [id]: false }));
  };

  const handleDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    setDraggingIds((prev) => ({ ...prev, [id]: false }));
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(id, file);
    }
  };

  const handleGenerateAI = async (product: Product) => {
    const id = product.id;
    
    // Validations
    if (!product.image) {
      setErrors((prev) => ({ ...prev, [`${id}-gen`]: 'Please upload an image first.' }));
      return;
    }
    if (!product.affiliate_link) {
      setErrors((prev) => ({ ...prev, [`${id}-gen`]: 'Please paste an affiliate link first.' }));
      return;
    }

    try {
      new URL(product.affiliate_link);
    } catch {
      setErrors((prev) => ({ ...prev, [`${id}-gen`]: 'Please enter a valid URL in the affiliate link field.' }));
      return;
    }

    setGeneratingIds((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [`${id}-gen`]: '' }));

    try {
      const response = await fetch('/api/generate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: product.image,
          affiliateLink: product.affiliate_link,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate product details');
      }

      updateProduct(id, {
        title: data.title,
        description: data.description,
        why_recommend: data.why_recommend,
        key_features: data.key_features,
        category: data.category || 'other',
      });
    } catch (err) {
      console.error('Gemini product generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gemini AI was unable to generate details. Try again.';
      setErrors((prev) => ({
        ...prev,
        [`${id}-gen`]: errorMessage,
      }));
    } finally {
      setGeneratingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
        <div>
          <h3 className="font-sans text-lg font-bold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" />
            Affiliate Products ({products.length})
          </h3>
          <p className="text-xs text-foreground/50">
            Add products mentioned in the article, upload their images, paste an Amazon affiliate link, and use Gemini to auto-generate titles & descriptions.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {products.map((product, index) => {
          const isUploading = uploadingIds[product.id] || false;
          const isGenerating = generatingIds[product.id] || false;
          const imageErr = errors[`${product.id}-image`];
          const genErr = errors[`${product.id}-gen`];

          return (
            <div
              key={product.id}
              className="relative p-6 rounded-2xl bg-white border border-outline-variant/40 shadow-soft hover:shadow-hover transition-all duration-300 group"
            >
              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="absolute top-4 right-4 p-2 text-foreground/45 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <span className="inline-block text-xs font-semibold text-foreground/40 uppercase mb-4 tracking-wider">
                Product #{index + 1}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                    Product Image
                  </label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(product.id, e)}
                    onDragLeave={(e) => handleDragLeave(product.id, e)}
                    onDrop={(e) => handleDrop(product.id, e)}
                    className={`relative h-44 rounded-xl border border-dashed transition-all bg-background/50 flex flex-col items-center justify-center overflow-hidden ${
                      draggingIds[product.id]
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]'
                        : 'border-outline-variant/60 hover:border-foreground/40'
                    }`}
                  >
                    {product.image ? (
                      <>
                        <img
                          src={product.image}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer px-4 py-2 bg-white text-black text-xs font-bold rounded-lg shadow-sm">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(product.id, file);
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-foreground/40 mb-2" />
                            <span className="text-xs font-semibold text-foreground/75">
                              Upload Product Image
                            </span>
                            <span className="text-[10px] text-foreground/40 mt-1">
                              Drag & drop or click to upload
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(product.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {imageErr && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">{imageErr}</p>
                  )}
                </div>

                {/* Product Links and Content (spans 2 columns on larger screens) */}
                <div className="md:col-span-2 space-y-4">
                  {/* Affiliate Link Input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                      Amazon Affiliate Link
                    </label>
                    <div className="relative flex items-center">
                      <LinkIcon className="w-4 h-4 text-foreground/40 absolute left-3" />
                      <input
                        type="url"
                        value={product.affiliate_link}
                        onChange={(e) => updateProduct(product.id, { affiliate_link: e.target.value })}
                        placeholder="https://www.amazon.com/dp/..."
                        className="w-full pl-9 pr-4 py-2 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>

                  {/* AI Generation Trigger & Manual Input Fields */}
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[11px] font-medium text-foreground/50">
                        * Provide an Image and Affiliate Link to use AI Generation.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleGenerateAI(product)}
                        disabled={isGenerating || isUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-foreground text-white rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>
                    {genErr && (
                      <p className="text-[11px] font-semibold text-red-600">{genErr}</p>
                    )}
                  </div>

                  {/* Generated / Editable Product Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => updateProduct(product.id, { title: e.target.value })}
                        placeholder="Enter product title..."
                        className="w-full px-3 py-2 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                        Category
                      </label>
                      <select
                        value={product.category || 'other'}
                        onChange={(e) => updateProduct(product.id, { category: e.target.value as 'home_decor' | 'skin_care' | 'other' })}
                        className="w-full px-3 py-2 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground cursor-pointer"
                      >
                        <option value="home_decor">Home Decor (5% Comm.)</option>
                        <option value="skin_care">Skin Care (10% Comm.)</option>
                        <option value="other">Other (Global Comm.)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                        Product Description
                      </label>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                        placeholder="Enter product description..."
                        rows={2}
                        className="w-full px-3 py-1.5 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                        Why We Recommend It
                      </label>
                      <textarea
                        value={product.why_recommend || ''}
                        onChange={(e) => updateProduct(product.id, { why_recommend: e.target.value })}
                        placeholder="Why our editors recommend this design choice..."
                        rows={2}
                        className="w-full px-3 py-1.5 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                        Key Features (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(product.key_features || []).join(', ')}
                        onChange={(e) => {
                          const features = e.target.value.split(',').map((f) => f.trim()).filter(Boolean);
                          updateProduct(product.id, { key_features: features });
                        }}
                        placeholder="Feature 1, Feature 2, Feature 3"
                        className="w-full px-3 py-2 border border-outline-variant/60 rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addProduct}
        className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-outline-variant/60 hover:border-foreground/50 rounded-2xl bg-white hover:bg-background/30 transition-all text-sm font-bold text-foreground/75 hover:text-foreground active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" />
        Add Another Product
      </button>
    </div>
  );
}
