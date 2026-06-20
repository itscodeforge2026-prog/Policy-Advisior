import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { BookOpen, Search, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'articles' | 'blogs' | 'faqs'>('articles');
  const [search, setSearch] = useState('');
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'blogs') {
        const res = await api.get(`/blogs?search=${search}`);
        setBlogs(res.data);
      } else if (activeTab === 'faqs') {
        const res = await api.get(`/support/faqs?search=${search}`);
        setFaqs(res.data);
      } else {
        // Fetch knowledge articles. Since there's no complex search endpoint yet,
        // we hit public endpoints or mock fetch them.
        const res = await api.get('/blogs?search='); // Fallback to blogs or seed articles
        setArticles([
          {
            slug: 'insurance-basics-for-beginners',
            category: 'Insurance Basics',
            title: 'Insurance Basics: A Beginner\'s Guide',
            summary: 'Learn the primary principles of insurance, including sum assured, deductibles, premiums, and policies.',
            content: 'Insurance is a risk management tool where you transfer the risk of financial loss to an insurer in exchange for a premium.'
          },
          {
            slug: 'how-tax-saving-insurance-works',
            category: 'Tax Benefits',
            title: 'How Tax Saving Insurance Works in India',
            summary: 'Understand the deductions available under Section 80C and 80D for insurance premium payments.',
            content: 'Insurance policies offer valuable tax deductions under the Old Income Tax Regime. Section 80C allows deductions up to ₹1.5 Lakhs.'
          }
        ].filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())));
      }
    } catch (error) {
      console.error('Error fetching hub data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [activeTab, search]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-10 font-sans">
        
        {/* HEADER */}
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-outfit tracking-tight">Knowledge Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Learn the core mechanics of policies, analyze tax deduction codes, and read expert planning columns.
          </p>
        </section>

        {/* SEARCH BAR & TABS */}
        <div className="space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-center border-b border-slate-200 dark:border-white/10">
            {[
              { id: 'articles', label: 'Educational Articles', icon: BookOpen },
              { id: 'blogs', label: 'Advisor Blogs', icon: FileText },
              { id: 'faqs', label: 'FAQ Database', icon: HelpCircle }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id as any); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-6 py-3 border-b-2 font-medium text-xs uppercase tracking-wider transition-colors ${
                    activeTab === t.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT GRIDS */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Searching records...</div>
          ) : (
            <>
              {/* ARTICLES TAB */}
              {activeTab === 'articles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((art) => (
                    <div key={art.slug} className="p-6 rounded-2xl glass space-y-4">
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {art.category}
                      </span>
                      <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200">{art.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{art.summary}</p>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                        {art.content}
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs col-span-2">No educational articles match your query.</div>
                  )}
                </div>
              )}

              {/* BLOGS TAB */}
              {activeTab === 'blogs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blogs.map((b) => (
                    <div key={b.slug} className="p-6 rounded-2xl glass flex flex-col justify-between h-[220px]">
                      <div className="space-y-2">
                        <span className="text-[10px] bg-accent/10 text-accent font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {b.category}
                        </span>
                        <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-200 line-clamp-1">{b.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{b.summary}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4 text-[10px] text-slate-400">
                        <span>By {b.author?.name || 'Advisor'}</span>
                        <a
                          href={`/blogs/${b.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Reading detail for: ${b.title}\n\n${b.content}`);
                          }}
                          className="text-primary font-semibold flex items-center gap-1 hover:text-primary-400"
                        >
                          Read Post <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs col-span-2">No advisor blogs match your query.</div>
                  )}
                </div>
              )}

              {/* FAQS TAB */}
              {activeTab === 'faqs' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 space-y-2">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider">{faq.category}</div>
                      <h3 className="text-sm font-semibold font-outfit text-slate-800 dark:text-slate-200">Q: {faq.question}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">A: {faq.answer}</p>
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">No FAQs match your search parameters.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </Layout>
  );
};
export default KnowledgePage;
