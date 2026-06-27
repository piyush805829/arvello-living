'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Article, Product } from '@/types';
import RichTextEditor from '@/components/RichTextEditor';
import ProductEditor from '@/components/ProductEditor';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import {
  LayoutDashboard,
  FilePlus,
  LogOut,
  UploadCloud,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
  FileText,
  CheckCircle,
  FolderDot,
  Package,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'analytics'>('dashboard');

  // Articles & Loading States
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  // Editor Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleThumbnail, setArticleThumbnail] = useState('');
  const [articleHomeDesc, setArticleHomeDesc] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleProducts, setArticleProducts] = useState<Product[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Session check on load
  const fetchArticles = useCallback(async () => {
    setIsLoadingArticles(true);
    try {
      const response = await fetch('/api/articles');
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      
      if (response.ok && data.success) {
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Fetch articles error:', error);
    } finally {
      setIsLoadingArticles(false);
    }
  }, [router]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // 3. Handle Admin Logout
  const handleLogout = async () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
    router.refresh();
  };

  // 4. Handle Thumbnail Upload
  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;
    setUploadingThumbnail(true);
    setFormErrors((prev) => ({ ...prev, thumbnail: '' }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      setArticleThumbnail(data.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Thumbnail upload failed';
      setFormErrors((prev) => ({ ...prev, thumbnail: errorMessage }));
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleThumbnailDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleThumbnailUpload(file);
    }
  };

  // 4b. Handle Generate Article with AI
  const handleGenerateArticleAI = async () => {
    if (!articleThumbnail) return;

    setGeneratingArticle(true);
    setFormErrors((prev) => ({ ...prev, articleGen: '' }));

    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: articleThumbnail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate article details');
      }

      setArticleTitle(data.title);
      setArticleHomeDesc(data.home_description);
      setArticleContent(data.content);
    } catch (err) {
      console.error('Gemini article generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gemini AI was unable to generate article details. Try again.';
      setFormErrors((prev) => ({ ...prev, articleGen: errorMessage }));
    } finally {
      setGeneratingArticle(false);
    }
  };

  // 5. Open Editor for New Article
  const handleNewArticleClick = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleThumbnail('');
    setArticleHomeDesc('');
    setArticleContent('');
    setArticleProducts([]);
    setFormErrors({});
    setActiveTab('editor');
  };

  // 6. Open Editor for Existing Article
  const handleEditClick = (article: Article) => {
    setEditingArticleId(article.id);
    setArticleTitle(article.title);
    setArticleThumbnail(article.thumbnail);
    setArticleHomeDesc(article.home_description);
    setArticleContent(article.content);
    setArticleProducts(article.products || []);
    setFormErrors({});
    setActiveTab('editor');
  };

  // 7. Handle Delete Article
  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setArticles(articles.filter((a) => a.id !== id));
      } else {
        alert(data.error || 'Failed to delete article');
      }
    } catch {
      alert('An error occurred while deleting the article');
    }
  };

  // 8. Publish or Save Draft Article
  const handleSaveArticle = async (status: 'draft' | 'published') => {
    // Reset errors
    setFormErrors({});
    const errors: Record<string, string> = {};

    // Validate inputs
    if (!articleTitle.trim()) errors.title = 'Title is required';
    if (!articleThumbnail.trim()) errors.thumbnail = 'Thumbnail is required';
    if (!articleHomeDesc.trim()) errors.home_description = 'Home page description is required';
    if (!articleContent.trim()) errors.content = 'Article content is required';

    // Validate products affiliate links
    articleProducts.forEach((prod, index) => {
      if (!prod.image) {
        errors[`product-${index}-image`] = `Product ${index + 1} image is required`;
      }
      if (!prod.affiliate_link) {
        errors[`product-${index}-link`] = `Product ${index + 1} affiliate link is required`;
      } else {
        try {
          new URL(prod.affiliate_link);
        } catch {
          errors[`product-${index}-link`] = `Product ${index + 1} affiliate link must be a valid URL`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to top of errors or show message
      alert('Please fill in all required fields and correct product errors.');
      return;
    }

    setIsSaving(true);

    const articleData = {
      title: articleTitle,
      thumbnail: articleThumbnail,
      home_description: articleHomeDesc,
      content: articleContent,
      products: articleProducts,
      status,
    };

    try {
      const url = editingArticleId ? `/api/articles/${editingArticleId}` : '/api/articles';
      const method = editingArticleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(editingArticleId ? 'Article updated successfully!' : 'Article published successfully!');
        fetchArticles();
        setActiveTab('dashboard');
        setEditingArticleId(null);
      } else {
        alert(data.error || 'Failed to save article');
      }
    } catch {
      alert('An error occurred while saving the article.');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading Session view
  // Loading Session view
  if (isLoadingArticles) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50 mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Loading Workspace...</p>
      </div>
    );
  }

  // Calculate stats for Dashboard Overview
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalProductsCount = articles.reduce((acc, a) => acc + (a.products?.length || 0), 0);

  // --- ADMIN DASHBOARD LAYOUT ---
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Sidebar Layout */}
        <aside className="lg:col-span-1 border border-outline-variant/60 rounded-3xl p-6 bg-white shadow-soft flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
            <div className="w-10 h-10 rounded-full bg-outline-variant/40 flex items-center justify-center font-bold text-foreground">
              AL
            </div>
            <div>
              <h2 className="font-sans text-sm font-bold text-foreground leading-none">Arvello Living</h2>
              <span className="text-[10px] text-foreground/40 font-medium tracking-wide">Editor Workspace</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setEditingArticleId(null);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-secondary-container text-foreground'
                  : 'text-foreground/60 hover:bg-background hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={handleNewArticleClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'editor' && !editingArticleId
                  ? 'bg-secondary-container text-foreground'
                  : 'text-foreground/60 hover:bg-background hover:text-foreground'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              New Article
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics');
                setEditingArticleId(null);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'analytics'
                  ? 'bg-secondary-container text-foreground'
                  : 'text-foreground/60 hover:bg-background hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </nav>

          <div className="border-t border-outline-variant/30 pt-4 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Dashboard Overview
                  </h1>
                  <p className="text-xs text-foreground/50">Manage editorial publications, drafts, and product links.</p>
                </div>
                <button
                  onClick={handleNewArticleClick}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Write Article
                </button>
              </div>

              {/* Stats Card Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Total</span>
                    <p className="text-2xl font-bold text-foreground">{totalArticles}</p>
                  </div>
                  <FileText className="w-8 h-8 text-foreground/20" />
                </div>
                
                <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider font-semibold">Published</span>
                    <p className="text-2xl font-bold text-foreground">{publishedCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-600/20" />
                </div>
                
                <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider font-semibold">Drafts</span>
                    <p className="text-2xl font-bold text-foreground">{draftCount}</p>
                  </div>
                  <FolderDot className="w-8 h-8 text-amber-500/20" />
                </div>
                
                <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-soft flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider font-semibold">Products</span>
                    <p className="text-2xl font-bold text-foreground">{totalProductsCount}</p>
                  </div>
                  <Package className="w-8 h-8 text-foreground/20" />
                </div>
              </div>

              {/* Articles Manager Table */}
              <div className="bg-white border border-outline-variant/40 rounded-3xl overflow-hidden shadow-soft">
                <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
                  <h3 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">
                    All Publications
                  </h3>
                  <span className="px-2 py-0.5 bg-background text-[10px] font-bold text-foreground/50 rounded-full border border-outline-variant/40">
                    {articles.length} total
                  </span>
                </div>

                {isLoadingArticles ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-foreground/40 mb-2" />
                    <p className="text-xs text-foreground/40">Refreshing list...</p>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="p-16 text-center">
                    <p className="text-sm text-foreground/40 italic mb-4">No articles written yet.</p>
                    <button
                      onClick={handleNewArticleClick}
                      className="px-4 py-2 border border-outline border-dashed rounded-xl text-xs font-bold text-foreground/75 hover:bg-background transition-all"
                    >
                      Create your first article
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-background/40 text-[10px] font-bold uppercase tracking-wider text-foreground/50 border-b border-outline-variant/30">
                          <th className="py-4 px-6">Thumbnail & Title</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4">Products</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {articles.map((article) => (
                          <tr key={article.id} className="hover:bg-background/20 transition-all">
                            <td className="py-4 px-6 flex items-center gap-4">
                              <img
                                src={article.thumbnail}
                                alt=""
                                className="w-12 h-10 object-cover rounded-lg border border-outline-variant/30 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-sans text-sm font-bold text-foreground block truncate max-w-sm">
                                  {article.title}
                                </span>
                                <span className="text-[10px] text-foreground/40 block truncate max-w-xs">
                                  /articles/{article.slug}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                                  article.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {article.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-medium text-foreground/50">
                              {article.products?.length || 0} items
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {article.status === 'published' && (
                                  <a
                                    href={`/articles/${article.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-foreground/60 hover:text-foreground hover:bg-background rounded-lg transition-all"
                                    title="View live page"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleEditClick(article)}
                                  className="p-1.5 text-foreground/60 hover:text-primary hover:bg-background rounded-lg transition-all"
                                  title="Edit Article"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(article.id)}
                                  className="p-1.5 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLE WRITER/EDITOR VIEW */}
          {activeTab === 'editor' && (
            <div className="space-y-8 animate-fade-in bg-white border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-soft">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <h2 className="font-sans text-xl font-bold text-foreground">
                    {editingArticleId ? 'Edit Editorial Article' : 'Write New Article'}
                  </h2>
                  <p className="text-xs text-foreground/50">Draft your visual story, add products, and configure AI generations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('dashboard');
                    setEditingArticleId(null);
                  }}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-bold text-foreground/75 hover:bg-background transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Form Body */}
              <div className="space-y-6">
                
                {/* 1. Article Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="e.g. The Art of Minimalist Desk Setups"
                    className="w-full px-4 py-2.5 border border-outline-variant/60 rounded-xl text-sm bg-white text-foreground focus:outline-none focus:border-foreground"
                  />
                  {formErrors.title && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* 2. Article Thumbnail Upload Container */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                    Article Thumbnail
                  </label>
                  <div 
                    onDragOver={handleThumbnailDragOver}
                    onDragEnter={handleThumbnailDragEnter}
                    onDragLeave={handleThumbnailDragLeave}
                    onDrop={handleThumbnailDrop}
                    className={`relative h-48 rounded-2xl border border-dashed transition-all bg-background/50 flex flex-col items-center justify-center overflow-hidden ${
                      isDraggingThumbnail 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]' 
                        : 'border-outline-variant/60 hover:border-foreground/40'
                    }`}
                  >
                    {articleThumbnail ? (
                      <>
                        <img
                          src={articleThumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer px-4 py-2 bg-white text-black text-xs font-bold rounded-lg shadow-sm">
                            Change Thumbnail
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleThumbnailUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-6">
                        {uploadingThumbnail ? (
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-foreground/40 mb-2" />
                            <span className="text-xs font-semibold text-foreground/75">
                              Upload Article Thumbnail
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
                          disabled={uploadingThumbnail}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleThumbnailUpload(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {formErrors.thumbnail && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">{formErrors.thumbnail}</p>
                  )}

                  {articleThumbnail && (
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] font-medium text-foreground/50">
                          * Generate title, description, and content from your thumbnail.
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateArticleAI}
                          disabled={generatingArticle || uploadingThumbnail}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-foreground text-white rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                        >
                          {generatingArticle ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate Article with AI
                            </>
                          )}
                        </button>
                      </div>
                      {formErrors.articleGen && (
                        <p className="text-[11px] font-semibold text-red-600">{formErrors.articleGen}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Article Home Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide">
                    Home Page Description
                  </label>
                  <textarea
                    value={articleHomeDesc}
                    onChange={(e) => setArticleHomeDesc(e.target.value)}
                    placeholder="Write a short summary (2-3 sentences) to display on the article preview card..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-outline-variant/60 rounded-xl text-sm bg-white text-foreground focus:outline-none focus:border-foreground resize-none"
                  />
                  {formErrors.home_description && (
                    <p className="text-[11px] font-semibold text-red-600 mt-1">{formErrors.home_description}</p>
                  )}
                </div>

                {/* 4. Rich Text Editor */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-foreground/80 uppercase tracking-wide mb-1">
                    Article Body Content
                  </label>
                  <RichTextEditor
                    value={articleContent}
                    onChange={setArticleContent}
                    error={formErrors.content}
                  />
                </div>

                {/* 5. Affiliate Products Editor Section */}
                <div className="pt-4 border-t border-outline-variant/30">
                  <ProductEditor
                    products={articleProducts}
                    onChange={setArticleProducts}
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-outline-variant/30">
                  <button
                    type="button"
                    disabled={isSaving || uploadingThumbnail}
                    onClick={() => handleSaveArticle('draft')}
                    className="w-full sm:w-auto px-6 py-3 border border-outline-variant rounded-xl text-xs font-bold uppercase tracking-wider text-foreground hover:bg-background transition-all disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSaving || uploadingThumbnail}
                    onClick={() => handleSaveArticle('published')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-sans text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Publish Article
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
        </main>
      </div>
    </div>
  );
}
